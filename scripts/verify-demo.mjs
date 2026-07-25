/**
 * Headless smoke checks for core + fixture demos (no browser required).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  // Dynamic import built core
  let core;
  try {
    core = await import(join(root, "packages/core/dist/index.js"));
  } catch {
    console.error("Build core first: npm run build:core");
    process.exit(1);
  }

  const week1 = readFileSync(join(root, "fixtures/sample-export.json"), "utf8");
  const week2 = readFileSync(join(root, "fixtures/sample-export-week2.json"), "utf8");
  const nested = readFileSync(join(root, "fixtures/nested-export.json"), "utf8");

  const a = await core.parseGrokExport(week1);
  const n = await core.parseGrokExport(nested);
  const m1 = core.dedupeMerge([], a.conversations);
  const m2 = core.dedupeMerge(m1.conversations, a.conversations);
  const m3 = core.dedupeMerge(m1.conversations, (await core.parseGrokExport(week2)).conversations);

  const checks = [
    ["week1 convs", a.stats.conversationCount === 3],
    ["thoughts", a.stats.thoughtCount > 0],
    ["nested parse", n.stats.conversationCount === 1],
    ["reimport skip", m2.skipped === 3 && m2.added === 0],
    ["week2 mix", m3.added === 1 && m3.updated === 1 && m3.skipped === 2],
    ["md no tutorial", !/data controls/i.test(core.toMarkdown(a.conversations[0]))],
    ["pdf magic", new TextDecoder().decode(core.toPdfBytes(a.conversations[0]).slice(0, 4)) === "%PDF"],
  ];

  let failed = 0;
  for (const [name, ok] of checks) {
    console.log(ok ? "PASS" : "FAIL", name);
    if (!ok) failed += 1;
  }
  console.log(core.formatDedupeToast(m2));
  console.log(core.formatDedupeToast(m3));
  process.exit(failed ? 1 : 0);
}

main();
