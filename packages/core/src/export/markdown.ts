import type { Conversation, Message } from "../types.js";

function roleLabel(role: Message["role"]): string {
  switch (role) {
    case "user":
      return "You";
    case "assistant":
      return "Grok";
    case "system":
      return "System";
    case "tool":
      return "Tool";
    default:
      return "Other";
  }
}

function formatMessage(m: Message, includeThoughts: boolean): string {
  const lines: string[] = [];
  lines.push(`### ${roleLabel(m.role)}`);
  if (m.createdAt) {
    lines.push(`*${m.createdAt}*`);
    lines.push("");
  }
  if (m.content.trim()) {
    lines.push(m.content.trim());
    lines.push("");
  }

  if (includeThoughts && m.thoughts.length) {
    lines.push("<details>");
    lines.push("<summary>Thoughts</summary>");
    lines.push("");
    for (const t of m.thoughts) {
      lines.push(t.text.trim());
      lines.push("");
    }
    lines.push("</details>");
    lines.push("");
  }

  if (m.toolSteps.length) {
    lines.push("<details>");
    lines.push("<summary>Tool steps</summary>");
    lines.push("");
    for (const s of m.toolSteps) {
      lines.push(`- **${s.name ?? "step"}**${s.status ? ` (${s.status})` : ""}`);
      if (s.input) lines.push(`  - input: ${s.input.slice(0, 500)}`);
      if (s.output) lines.push(`  - output: ${s.output.slice(0, 500)}`);
    }
    lines.push("");
    lines.push("</details>");
    lines.push("");
  }

  return lines.join("\n");
}

export interface MarkdownExportOptions {
  includeThoughts?: boolean;
  /** Never put Settings/export tutorial here — skill contract */
  includeLibraryFooter?: boolean;
}

/**
 * Export a conversation to Markdown.
 * Hard contract: does NOT include Settings → export tutorial text.
 */
export function toMarkdown(
  conversation: Conversation,
  options: MarkdownExportOptions = {},
): string {
  const includeThoughts = options.includeThoughts !== false;
  const lines: string[] = [];

  lines.push(`# ${conversation.title}`);
  lines.push("");
  if (conversation.createdAt) {
    lines.push(`- **Started:** ${conversation.createdAt}`);
  }
  if (conversation.updatedAt) {
    lines.push(`- **Updated:** ${conversation.updatedAt}`);
  }
  lines.push(`- **Messages:** ${conversation.messageCount}`);
  if (conversation.thoughtCount) {
    lines.push(`- **Thought segments:** ${conversation.thoughtCount}`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const m of conversation.messages) {
    lines.push(formatMessage(m, includeThoughts));
    lines.push("---");
    lines.push("");
  }

  if (options.includeLibraryFooter !== false) {
    lines.push("*Exported from Grok Backup Memory — your data, on your terms.*");
    lines.push("");
  }

  return lines.join("\n");
}

export function toMarkdownBatch(
  conversations: Conversation[],
  options: MarkdownExportOptions = {},
): string {
  return conversations
    .map((c) => toMarkdown(c, options))
    .join("\n\n\n");
}
