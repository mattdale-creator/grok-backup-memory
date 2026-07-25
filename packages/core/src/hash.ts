/** Simple stable content hash for change detection (not cryptographic). */
export function contentHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function conversationHash(parts: {
  id: string;
  title: string;
  messages: Array<{ id: string; content: string; contentHash: string }>;
}): string {
  const payload = [
    parts.id,
    parts.title,
    ...parts.messages.map((m) => `${m.id}:${m.contentHash}`),
  ].join("|");
  return contentHash(payload);
}
