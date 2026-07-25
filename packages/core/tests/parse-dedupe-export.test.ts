import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import {
  dedupeMerge,
  formatDedupeToast,
  parseGrokExport,
  toEpub,
  toHtml,
  toMarkdown,
  toPdfBytes,
} from "../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const week1 = readFileSync(join(root, "fixtures/sample-export.json"), "utf8");
const week2 = readFileSync(
  join(root, "fixtures/sample-export-week2.json"),
  "utf8",
);

describe("parseGrokExport", () => {
  it("parses sample fixture with dialogue + thoughts", async () => {
    const result = await parseGrokExport(week1);
    expect(result.stats.conversationCount).toBe(3);
    expect(result.stats.messageCount).toBeGreaterThan(5);
    expect(result.stats.thoughtCount).toBeGreaterThan(0);

    const nook = result.conversations.find((c) => c.id === "conv-aurora-001");
    expect(nook).toBeTruthy();
    expect(nook!.title).toContain("reading nook");
    const asst = nook!.messages.find((m) => m.role === "assistant");
    expect(asst?.thoughts.length).toBeGreaterThan(0);
    expect(asst?.thoughts[0].text).toMatch(/calm|clutter/i);
  });

  it("handles alternate sender/text/responses shape", async () => {
    const result = await parseGrokExport(week1);
    const code = result.conversations.find((c) => c.id === "conv-code-003");
    expect(code).toBeTruthy();
    expect(code!.messages.length).toBe(2);
    expect(code!.messages[0].role).toBe("user");
    expect(code!.messages[1].role).toBe("assistant");
    expect(code!.messages[1].thoughts.length).toBeGreaterThan(0);
  });

  it("parses ZIP containing JSON", async () => {
    const zip = new JSZip();
    zip.file("export/conversations.json", week1);
    const bytes = await zip.generateAsync({ type: "uint8array" });
    const result = await parseGrokExport(bytes);
    expect(result.stats.conversationCount).toBe(3);
  });
});

describe("dedupeMerge", () => {
  it("skips unchanged on full re-import", async () => {
    const a = await parseGrokExport(week1);
    const again = await parseGrokExport(week1);
    const merged = dedupeMerge(a.conversations, again.conversations);
    expect(merged.added).toBe(0);
    expect(merged.updated).toBe(0);
    expect(merged.skipped).toBe(3);
    expect(formatDedupeToast(merged)).toBe(
      "Added 0 · Updated 0 · Skipped 3",
    );
  });

  it("adds new, updates modified, skips unchanged for week-2 snapshot", async () => {
    const a = await parseGrokExport(week1);
    const b = await parseGrokExport(week2);
    const merged = dedupeMerge(a.conversations, b.conversations);
    expect(merged.added).toBe(1); // conv-new-004
    expect(merged.updated).toBe(1); // conv-travel-002
    expect(merged.skipped).toBe(2); // aurora + code
    expect(merged.conversations.length).toBe(4);

    const travel = merged.conversations.find((c) => c.id === "conv-travel-002");
    expect(travel!.messageCount).toBe(4);
    expect(travel!.messages.some((m) => m.id === "msg-b4")).toBe(true);
  });
});

describe("exports", () => {
  it("toMarkdown includes thoughts and never includes export tutorial", async () => {
    const result = await parseGrokExport(week1);
    const md = toMarkdown(result.conversations[0]);
    expect(md).toMatch(/^# /m);
    expect(md).toMatch(/Thoughts|You|Grok/);
    expect(md.toLowerCase()).not.toContain("data controls");
    expect(md.toLowerCase()).not.toContain("settings →");
  });

  it("toHtml is a full document", async () => {
    const result = await parseGrokExport(week1);
    const html = toHtml(result.conversations[0]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain(result.conversations[0].title);
  });

  it("toPdfBytes returns a PDF signature", async () => {
    const result = await parseGrokExport(week1);
    const pdf = toPdfBytes(result.conversations[0]);
    const head = new TextDecoder().decode(pdf.slice(0, 8));
    expect(head.startsWith("%PDF")).toBe(true);
  });

  it("toEpub returns a zip with mimetype", async () => {
    const result = await parseGrokExport(week1);
    const epub = await toEpub(result.conversations[0]);
    const zip = await JSZip.loadAsync(epub);
    expect(zip.file("mimetype")).toBeTruthy();
    const mime = await zip.file("mimetype")!.async("string");
    expect(mime).toBe("application/epub+zip");
  });
});
