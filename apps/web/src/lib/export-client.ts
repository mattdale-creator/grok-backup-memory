"use client";

import {
  downloadBlob,
  downloadText,
  slugify,
  toEpub,
  toHtml,
  toMarkdown,
  toPdfBytes,
  type Conversation,
} from "@grok-memory/core";

export type ExportFormat = "md" | "html" | "pdf" | "epub";

export async function exportConversation(
  conversation: Conversation,
  format: ExportFormat,
): Promise<void> {
  const base = slugify(conversation.title || conversation.id);

  if (format === "md") {
    downloadText(`${base}.md`, toMarkdown(conversation), "text/markdown;charset=utf-8");
    return;
  }

  if (format === "html") {
    downloadText(`${base}.html`, toHtml(conversation), "text/html;charset=utf-8");
    return;
  }

  if (format === "pdf") {
    const bytes = toPdfBytes(conversation);
    downloadBlob(
      `${base}.pdf`,
      new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }),
    );
    return;
  }

  if (format === "epub") {
    const bytes = await toEpub(conversation);
    downloadBlob(
      `${base}.epub`,
      new Blob([Uint8Array.from(bytes)], { type: "application/epub+zip" }),
    );
  }
}
