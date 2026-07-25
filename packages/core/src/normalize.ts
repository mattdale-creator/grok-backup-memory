import { contentHash, conversationHash } from "./hash.js";
import type {
  AttachmentRef,
  Conversation,
  Message,
  MessageRole,
  ThoughtSegment,
  ToolStep,
} from "./types.js";

export function normalizeRole(raw: unknown): MessageRole {
  if (typeof raw !== "string") return "unknown";
  const r = raw.toLowerCase().trim();
  if (["user", "human", "sender_user", "from_user", "prompter"].includes(r)) return "user";
  if (
    ["assistant", "model", "grok", "bot", "ai", "sender_assistant", "from_assistant", "agent"].includes(r)
  )
    return "assistant";
  if (r === "system") return "system";
  if (["tool", "function", "function_call"].includes(r)) return "tool";
  return "unknown";
}

export function pickString(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
    if (typeof c === "number" && Number.isFinite(c)) return String(c);
  }
  return undefined;
}

export function pickTimestamp(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (c == null) continue;
    if (typeof c === "number") {
      const ms = c < 1e12 ? c * 1000 : c;
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
    if (typeof c === "string" && c.trim()) {
      const d = new Date(c);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
      return c.trim();
    }
  }
  return undefined;
}

function extractTextContent(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  if (Array.isArray(raw)) {
    return raw
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const o = part as Record<string, unknown>;
          return pickString(o.text, o.content, o.value, o.message) ?? "";
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return pickString(o.text, o.content, o.message, o.body, o.value, o.markdown) ?? "";
  }
  return "";
}

function collectThoughts(msg: Record<string, unknown>, messageId: string): ThoughtSegment[] {
  const thoughts: ThoughtSegment[] = [];
  let order = 0;
  const push = (text: string, source: string) => {
    const t = text.trim();
    if (!t) return;
    // Dedupe identical thought text within message
    if (thoughts.some((x) => x.text === t)) return;
    thoughts.push({ id: `${messageId}-thought-${order}`, text: t, order: order++, source });
  };

  const direct = pickString(
    msg.thinking_trace,
    msg.thinking,
    msg.thoughts,
    msg.reasoning,
    msg.chain_of_thought,
    msg.cot,
    msg.reasoning_content,
  );
  if (direct) push(direct, "thinking_trace");

  const traces = msg.agent_thinking_traces ?? msg.thinking_traces ?? msg.thought_traces;
  if (Array.isArray(traces)) {
    for (const tr of traces) {
      if (typeof tr === "string") push(tr, "agent_thinking_traces");
      else if (tr && typeof tr === "object") {
        const o = tr as Record<string, unknown>;
        const t = pickString(o.text, o.content, o.trace, o.thinking, o.summary);
        if (t) push(t, "agent_thinking_traces");
      }
    }
  } else if (traces && typeof traces === "object") {
    const t = extractTextContent(traces);
    if (t) push(t, "agent_thinking_traces");
  }

  const meta = msg.metadata;
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    const t = pickString(m.thinking_trace, m.thinking, m.reasoning);
    if (t) push(t, "metadata");
  }
  return thoughts;
}

function collectToolSteps(msg: Record<string, unknown>, messageId: string): ToolStep[] {
  const steps: ToolStep[] = [];
  const raw = msg.steps ?? msg.tool_steps ?? msg.tool_calls ?? msg.tools;
  if (!Array.isArray(raw)) return steps;
  raw.forEach((item, i) => {
    if (!item || typeof item !== "object") return;
    const o = item as Record<string, unknown>;
    steps.push({
      id: pickString(o.id, o.step_id) ?? `${messageId}-step-${i}`,
      name: pickString(o.name, o.tool, o.tool_name, o.function),
      status: pickString(o.status, o.state),
      input: extractTextContent(o.input ?? o.arguments ?? o.args ?? o.params),
      output: extractTextContent(o.output ?? o.result ?? o.response),
      order: i,
    });
  });
  return steps;
}

function collectAttachments(msg: Record<string, unknown>, skipHeavyMedia: boolean): AttachmentRef[] {
  if (skipHeavyMedia) return [];
  const raw = msg.attachments ?? msg.assets ?? msg.files ?? msg.media ?? msg.images;
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    if (typeof item === "string") {
      return { id: `att-${i}`, path: item, name: item.split("/").pop() };
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      return {
        id: pickString(o.id, o.asset_id) ?? `att-${i}`,
        name: pickString(o.name, o.filename, o.file_name),
        mimeType: pickString(o.mime_type, o.mimeType, o.content_type, o.type),
        url: pickString(o.url, o.src, o.href),
        path: pickString(o.path, o.file_path, o.local_path),
      };
    }
    return { id: `att-${i}` };
  });
}

export function normalizeMessage(
  raw: unknown,
  index: number,
  skipHeavyMedia = false,
): Message | null {
  if (!raw || typeof raw !== "object") return null;
  const msg = raw as Record<string, unknown>;
  const id = pickString(msg.id, msg.message_id, msg.uuid, msg.response_id) ?? `msg-${index}`;
  const role = normalizeRole(msg.role ?? msg.sender ?? msg.author ?? msg.from ?? msg.speaker);

  let content = extractTextContent(
    msg.content ?? msg.text ?? msg.message ?? msg.body ?? msg.response ?? msg.output ?? msg.markdown,
  );
  if (!content && msg.response && typeof msg.response === "object") {
    const r = msg.response as Record<string, unknown>;
    content = extractTextContent(r.content ?? r.text ?? r.message);
  }

  const thoughts = collectThoughts(msg, id);
  if (msg.response && typeof msg.response === "object") {
    for (const t of collectThoughts(msg.response as Record<string, unknown>, id)) {
      if (!thoughts.some((x) => x.text === t.text)) thoughts.push(t);
    }
  }

  const toolSteps = collectToolSteps(msg, id);
  const attachments = collectAttachments(msg, skipHeavyMedia);
  const createdAt = pickTimestamp(msg.created_at, msg.createdAt, msg.timestamp, msg.time, msg.date);
  const contentHashValue = contentHash(
    [id, role, content, thoughts.map((t) => t.text).join("\n")].join("|"),
  );

  return {
    id,
    role,
    content,
    createdAt,
    thoughts,
    toolSteps,
    attachments,
    contentHash: contentHashValue,
  };
}

export function normalizeConversation(
  raw: unknown,
  index = 0,
  skipHeavyMedia = false,
): Conversation | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const id =
    pickString(c.id, c.conversation_id, c.chat_id, c.thread_id, c.uuid, c.cid) ?? `conv-${index}`;
  const title =
    pickString(c.title, c.name, c.subject, c.summary, c.preview, c.topic) ?? "Untitled conversation";

  let messageRaw: unknown[] = [];
  for (const cand of [c.messages, c.responses, c.turns, c.items, c.conversation, c.chat, c.history, c.entries]) {
    if (Array.isArray(cand) && cand.length) {
      messageRaw = cand;
      break;
    }
  }
  if (!messageRaw.length && c.conversation && typeof c.conversation === "object") {
    const nested = c.conversation as Record<string, unknown>;
    if (Array.isArray(nested.messages)) messageRaw = nested.messages;
    if (Array.isArray(nested.responses)) messageRaw = nested.responses;
  }

  const messages: Message[] = [];
  messageRaw.forEach((m, i) => {
    if (m && typeof m === "object") {
      const turn = m as Record<string, unknown>;
      if (turn.user || turn.human || turn.prompt) {
        const userMsg = normalizeMessage(
          {
            id: pickString(turn.id) ? `${turn.id}-user` : undefined,
            role: "user",
            content: turn.user ?? turn.human ?? turn.prompt,
            created_at: turn.created_at ?? turn.timestamp,
          },
          i * 2,
          skipHeavyMedia,
        );
        if (userMsg) messages.push(userMsg);
        const asstMsg = normalizeMessage(
          {
            id: pickString(turn.id) ? `${turn.id}-assistant` : undefined,
            role: "assistant",
            content: turn.assistant ?? turn.response ?? turn.answer ?? turn.grok,
            thinking_trace: turn.thinking_trace ?? turn.thinking,
            agent_thinking_traces: turn.agent_thinking_traces,
            steps: turn.steps,
            created_at: turn.created_at ?? turn.timestamp,
          },
          i * 2 + 1,
          skipHeavyMedia,
        );
        if (asstMsg) messages.push(asstMsg);
        return;
      }
    }
    const nm = normalizeMessage(m, i, skipHeavyMedia);
    if (nm) messages.push(nm);
  });

  const createdAt = pickTimestamp(c.created_at, c.createdAt, c.started_at, c.timestamp);
  const updatedAt = pickTimestamp(c.updated_at, c.updatedAt, c.modified_at, c.last_message_at);
  const thoughtCount = messages.reduce((n, m) => n + m.thoughts.length, 0);
  const hash = conversationHash({ id, title, messages });

  return {
    id,
    title,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    messages,
    messageCount: messages.length,
    thoughtCount,
    contentHash: hash,
  };
}
