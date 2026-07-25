import type { Conversation } from "../types.js";
import { toHtml } from "./html.js";

/**
 * Build a print-ready HTML document intended for browser "Print → Save as PDF".
 * Also usable with client libraries that accept HTML.
 *
 * Pure adapter: returns HTML string optimized for PDF print layouts.
 * The web app may call window.print() or use html2pdf-style helpers.
 */
export function toPdfHtml(
  conversation: Conversation,
  options: { includeThoughts?: boolean } = {},
): string {
  // Reuse HTML export; print CSS already included
  return toHtml(conversation, options);
}

/**
 * Minimal text-layout PDF using a very small PDF writer (no external deps).
 * Good enough for offline export of dialogue; complex Unicode may fall back.
 *
 * Returns a Uint8Array of a valid PDF 1.4 document.
 */
export function toPdfBytes(
  conversation: Conversation,
  options: { includeThoughts?: boolean } = {},
): Uint8Array {
  const includeThoughts = options.includeThoughts !== false;
  const lines: string[] = [];
  lines.push(conversation.title);
  lines.push("");
  if (conversation.createdAt) lines.push(`Started: ${conversation.createdAt}`);
  lines.push(`Messages: ${conversation.messageCount}`);
  lines.push("");

  for (const m of conversation.messages) {
    const role =
      m.role === "user"
        ? "You"
        : m.role === "assistant"
          ? "Grok"
          : m.role;
    lines.push(`— ${role} —`);
    for (const para of m.content.split(/\n/)) {
      wrapLine(para, 90).forEach((l) => lines.push(l));
    }
    if (includeThoughts && m.thoughts.length) {
      lines.push("[Thoughts]");
      for (const t of m.thoughts) {
        wrapLine(t.text, 90).forEach((l) => lines.push(l));
      }
    }
    lines.push("");
  }
  lines.push("Exported from Grok Backup Memory");

  return buildSimplePdf(lines);
}

function wrapLine(text: string, width: number): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) {
      cur = w;
      continue;
    }
    if ((cur + " " + w).length <= width) cur += " " + w;
    else {
      out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  return out.length ? out : [""];
}

function encoderForLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function escapePdfText(s: string): string {
  // PDF literal string escapes; strip non-latin1 for simple writer
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code === 0x5c) out += "\\\\";
    else if (code === 0x28) out += "\\(";
    else if (code === 0x29) out += "\\)";
    else if (code < 32 || code > 126) {
      // replace with ? for portability
      out += code === 9 || code === 10 || code === 13 ? " " : "?";
    } else out += s[i];
  }
  return out;
}

function buildSimplePdf(lines: string[]): Uint8Array {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 54;
  const fontSize = 10;
  const leading = 13;
  const maxLinesPerPage = Math.floor(
    (pageHeight - margin * 2) / leading,
  );

  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }
  if (!pages.length) pages.push([""]);

  const objects: string[] = [];
  const offsets: number[] = [0];

  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  // 1: Catalog
  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  // 2: Pages (kids filled later)
  const pageIds: number[] = [];
  const contentIds: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    const contentId = 3 + p * 2 + 1; // provisional — we'll assign properly
    contentIds.push(0);
    pageIds.push(0);
  }

  // Rebuild with known structure:
  // obj1 Catalog, obj2 Pages, then pairs (Page, Content) for each page
  objects.length = 0;
  addObject("<< /Type /Catalog /Pages 2 0 R >>");

  const kids: string[] = [];
  let nextId = 3;
  const pageObjIds: number[] = [];
  const contentObjBodies: string[] = [];

  for (const pageLines of pages) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageObjIds.push(pageId);
    kids.push(`${pageId} 0 R`);

    let y = pageHeight - margin;
    const ops: string[] = ["BT", "/F1 " + fontSize + " Tf", "14 TL"];
    ops.push(`1 0 0 1 ${margin} ${y} Tm`);
    for (let i = 0; i < pageLines.length; i++) {
      const t = escapePdfText(pageLines[i]);
      if (i === 0) ops.push(`(${t}) Tj`);
      else ops.push(`T* (${t}) Tj`);
    }
    ops.push("ET");
    const stream = ops.join("\n");
    contentObjBodies.push(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );

    // Placeholder for page object — we'll insert after we know content ids
    void contentId;
  }

  // Pages object
  addObject(
    `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pages.length} >>`,
  );

  // Font object at the end... actually insert pages interleaved
  // Simpler rebuild:
  objects.length = 0;
  const parts: { id: number; body: string }[] = [];
  let id = 1;
  const catalogId = id++;
  const pagesId = id++;
  const fontId = id++;

  const pageRefs: number[] = [];
  const contentRefs: number[] = [];

  for (let i = 0; i < pages.length; i++) {
    pageRefs.push(id++);
    contentRefs.push(id++);
  }

  parts.push({
    id: catalogId,
    body: `<< /Type /Catalog /Pages ${pagesId} 0 R >>`,
  });
  parts.push({
    id: pagesId,
    body: `<< /Type /Pages /Kids [${pageRefs
      .map((n) => `${n} 0 R`)
      .join(" ")}] /Count ${pages.length} >>`,
  });
  parts.push({
    id: fontId,
    body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  });

  for (let i = 0; i < pages.length; i++) {
    parts.push({
      id: pageRefs[i],
      body: `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentRefs[i]} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    });

    const pageLines = pages[i];
    let y = pageHeight - margin;
    const ops: string[] = ["BT", `/F1 ${fontSize} Tf`, `${leading} TL`];
    ops.push(`1 0 0 1 ${margin} ${y} Tm`);
    for (let li = 0; li < pageLines.length; li++) {
      const t = escapePdfText(pageLines[li]);
      if (li === 0) ops.push(`(${t}) Tj`);
      else ops.push(`T* (${t}) Tj`);
    }
    ops.push("ET");
    const stream = ops.join("\n");
    parts.push({
      id: contentRefs[i],
      body: `<< /Length ${encoderForLength(stream)} >>\nstream\n${stream}\nendstream`,
    });
  }

  parts.sort((a, b) => a.id - b.id);

  // Use TextEncoder for length (Buffer may exist in node)
  const encoder = new TextEncoder();
  let pdf = "%PDF-1.4\n";
  const xrefOffsets: number[] = [0];

  for (const p of parts) {
    xrefOffsets[p.id] = encoder.encode(pdf).length;
    pdf += `${p.id} 0 obj\n${p.body}\nendobj\n`;
  }

  const xrefPos = encoder.encode(pdf).length;
  pdf += `xref\n0 ${parts.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= parts.length; i++) {
    const off = xrefOffsets[i] ?? 0;
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${parts.length + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefPos}\n%%EOF`;

  return encoder.encode(pdf);
}
