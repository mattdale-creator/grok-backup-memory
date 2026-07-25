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
const week2 = readFileSync(join(root, "fixtures/sample-export-week2.json"), "utf8");
const nested = readFileSync(join(root, "fixtures/nested-export.json"), "utf8");

describe("parseGrokExport", () => {
  it("parses sample fixture with dialogue + thoughts", async () => {
    const result = await parseGrokExport(week1);
    expect(result.stats.conversationCount).toBe(3);
    expect(result.stats.thoughtCount).toBeGreaterThan(0);
    const nook = result.conversations.find((c) => c.id === "conv-aurora-001");
    expect(nook!.messages.find((m) => m.role === "assistant")?.thoughts.length).toBeGreaterThan(0);
  });

  it("parses nested payload.user_conversations shape", async () => {
    const result = await parseGrokExport(nested);
    expect(result.stats.conversationCount).toBe(1);
    expect(result.conversations[0].id).toBe("nested-001");
    expect(result.conversations[0].messages[1].thoughts.length).toBeGreaterThan(0);
  });

  it("parses bare message arrays as one thread", async () => {
    const bare = JSON.stringify([
      { role: "user", content: "Hi", id: "1" },
      { role: "assistant", content: "Hello", id: "2", thinking: "greet" },
    ]);
    const result = await parseGrokExport(bare);
    expect(result.stats.conversationCount).toBe(1);
    expect(result.stats.messageCount).toBe(2);
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
  it("skips unchanged on re-import", async () => {
    const a = await parseGrokExport(week1);
    const merged = dedupeMerge(a.conversations, (await parseGrokExport(week1)).conversations);
    expect(formatDedupeToast(merged)).toBe("Added 0 · Updated 0 · Skipped 3");
  });

  it("week2 snapshot add/update/skip", async () => {
    const a = await parseGrokExport(week1);
    const merged = dedupeMerge(a.conversations, (await parseGrokExport(week2)).conversations);
    expect(merged.added).toBe(1);
    expect(merged.updated).toBe(1);
    expect(merged.skipped).toBe(2);
  });
});

describe("exports", () => {
  it("markdown has thoughts, not export tutorial", async () => {
    const result = await parseGrokExport(week1);
    const md = toMarkdown(result.conversations[0]);
    expect(md.toLowerCase()).not.toContain("data controls");
    expect(md).toMatch(/Thoughts|You|Grok/);
  });

  it("html pdf epub produce outputs", async () => {
    const result = await parseGrokExport(week1);
    expect(toHtml(result.conversations[0])).toContain("<!DOCTYPE html>");
    expect(new TextDecoder().decode(toPdfBytes(result.conversations[0]).slice(0, 4))).toBe("%PDF");
    const epub = await toEpub(result.conversations[0]);
    expect(epub.length).toBeGreaterThan(100);
  });
});
