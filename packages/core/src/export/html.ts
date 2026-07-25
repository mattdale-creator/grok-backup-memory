import type { Conversation, Message } from "../types.js";
import { escapeHtml } from "./utils.js";

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

function formatBody(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br/>");
}

export function toHtml(
  conversation: Conversation,
  options: { includeThoughts?: boolean } = {},
): string {
  const includeThoughts = options.includeThoughts !== false;
  const messagesHtml = conversation.messages
    .map((m) => {
      const thoughts =
        includeThoughts && m.thoughts.length
          ? `<details class="thoughts"><summary>Thoughts</summary><div class="thought-body">${m.thoughts
              .map((t) => `<p>${formatBody(t.text)}</p>`)
              .join("")}</div></details>`
          : "";
      return `<article class="msg msg-${escapeHtml(m.role)}">
  <header><span class="role">${escapeHtml(roleLabel(m.role))}</span>${
        m.createdAt
          ? `<time>${escapeHtml(m.createdAt)}</time>`
          : ""
      }</header>
  <div class="body">${formatBody(m.content)}</div>
  ${thoughts}
</article>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(conversation.title)} — Grok Memory</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #0f1210;
    --fg: #e8ebe6;
    --muted: #8a9388;
    --card: #1a1f1c;
    --accent: #c4a574;
    --user: #243028;
    --asst: #1a2220;
    --border: #2a322c;
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--fg);
    line-height: 1.55;
  }
  main { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  h1 { font-weight: 600; font-size: 1.75rem; letter-spacing: -0.02em; margin: 0 0 0.5rem; }
  .meta { color: var(--muted); font-size: 0.9rem; margin-bottom: 2rem; font-family: system-ui, sans-serif; }
  .msg {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.15rem;
    margin-bottom: 0.85rem;
  }
  .msg-user { background: var(--user); }
  .msg-assistant { background: var(--asst); }
  header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem; font-family: system-ui, sans-serif; font-size: 0.8rem; }
  .role { color: var(--accent); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
  time { color: var(--muted); }
  .body { white-space: pre-wrap; }
  details.thoughts { margin-top: 0.75rem; font-size: 0.92rem; color: var(--muted); }
  summary { cursor: pointer; color: var(--accent); font-family: system-ui, sans-serif; }
  footer { margin-top: 2.5rem; color: var(--muted); font-size: 0.85rem; font-family: system-ui, sans-serif; }
  @media print {
    body { background: white; color: black; }
    .msg { break-inside: avoid; border-color: #ccc; }
  }
</style>
</head>
<body>
<main>
  <h1>${escapeHtml(conversation.title)}</h1>
  <p class="meta">
    ${conversation.createdAt ? `Started ${escapeHtml(conversation.createdAt)} · ` : ""}
    ${conversation.messageCount} messages
    ${conversation.thoughtCount ? ` · ${conversation.thoughtCount} thought segments` : ""}
  </p>
  ${messagesHtml}
  <footer>Exported from Grok Backup Memory — your data, on your terms.</footer>
</main>
</body>
</html>`;
}
