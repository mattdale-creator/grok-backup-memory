import JSZip from "jszip";
import { normalizeConversation } from "./normalize.js";
import type { Conversation, ParseOptions, ParseResult } from "./types.js";

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function findConversationArrays(root: unknown): unknown[] {
  if (Array.isArray(root)) return root;
  const obj = asObject(root);
  if (!obj) return [];

  const preferredKeys = [
    "conversations",
    "chats",
    "threads",
    "items",
    "data",
    "results",
    "export",
    "grok_conversations",
  ];

  for (const key of preferredKeys) {
    const v = obj[key];
    if (Array.isArray(v)) return v;
    const nested = asObject(v);
    if (nested) {
      for (const k2 of preferredKeys) {
        if (Array.isArray(nested[k2])) return nested[k2] as unknown[];
      }
    }
  }

  // Single conversation object
  if (
    obj.messages ||
    obj.responses ||
    obj.title ||
    obj.conversation_id ||
    obj.id
  ) {
    if (Array.isArray(obj.messages) || Array.isArray(obj.responses)) {
      return [obj];
    }
  }

  return [];
}

function parseJsonText(
  text: string,
  options: ParseOptions = {},
  sourceFormat = "json",
): ParseResult {
  const warnings: string[] = [];
  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    // Try NDJSON
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const items: unknown[] = [];
    for (const line of lines) {
      try {
        items.push(JSON.parse(line));
      } catch {
        warnings.push("Skipped a non-JSON line in NDJSON-style file.");
      }
    }
    if (!items.length) {
      throw new Error("Could not parse file as JSON or NDJSON.");
    }
    data = items;
    sourceFormat = "ndjson";
  }

  options.onProgress?.(0.3, "Normalizing conversations…");

  const rawList = findConversationArrays(data);
  if (!rawList.length) {
    // Maybe the root is itself a list of messages wrapped oddly
    const obj = asObject(data);
    if (obj && Array.isArray(obj.messages)) {
      rawList.push(obj);
    }
  }

  if (!rawList.length) {
    warnings.push(
      "No conversations found. The export shape may be new — try another file from Settings → Data Controls.",
    );
  }

  const conversations: Conversation[] = [];
  rawList.forEach((raw, i) => {
    const conv = normalizeConversation(raw, i, options.skipHeavyMedia);
    if (conv && (conv.messages.length > 0 || conv.title !== "Untitled conversation")) {
      conversations.push(conv);
    } else if (conv && conv.messages.length === 0) {
      // Keep empty titled chats lightly
      if (conv.title && conv.title !== "Untitled conversation") {
        conversations.push(conv);
      }
    }
    if (rawList.length) {
      options.onProgress?.(
        0.3 + (0.6 * (i + 1)) / rawList.length,
        `Conversation ${i + 1} of ${rawList.length}`,
      );
    }
  });

  // Sort by updated/created desc
  conversations.sort((a, b) => {
    const ta = Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0;
    const tb = Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0;
    return tb - ta;
  });

  const messageCount = conversations.reduce((n, c) => n + c.messageCount, 0);
  const thoughtCount = conversations.reduce((n, c) => n + c.thoughtCount, 0);

  options.onProgress?.(1, "Done");

  return {
    conversations,
    sourceFormat,
    warnings,
    stats: {
      conversationCount: conversations.length,
      messageCount,
      thoughtCount,
    },
  };
}

async function readAsText(file: Blob | ArrayBuffer | string): Promise<string> {
  if (typeof file === "string") return file;
  if (file instanceof ArrayBuffer) {
    return new TextDecoder("utf-8").decode(file);
  }
  return file.text();
}

async function readAsArrayBuffer(
  file: Blob | ArrayBuffer | Uint8Array,
): Promise<ArrayBuffer> {
  if (file instanceof ArrayBuffer) return file;
  if (file instanceof Uint8Array) {
    return file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ) as ArrayBuffer;
  }
  return file.arrayBuffer();
}

function looksLikeZip(buf: ArrayBuffer): boolean {
  const u8 = new Uint8Array(buf);
  // PK\x03\x04
  return u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4b;
}

/**
 * Parse an official Grok account export (JSON or ZIP containing JSON).
 * Resilient to several common shapes; synthetic fixtures covered by tests.
 */
export async function parseGrokExport(
  file: File | Blob | ArrayBuffer | Uint8Array | string,
  options: ParseOptions = {},
): Promise<ParseResult> {
  options.onProgress?.(0.05, "Reading file…");

  // String path: treat as JSON text
  if (typeof file === "string") {
    return parseJsonText(file, options, "json-string");
  }

  // File with name hint
  const name =
    typeof File !== "undefined" && file instanceof File
      ? file.name.toLowerCase()
      : "";

  if (name.endsWith(".json") || name.endsWith(".ndjson")) {
    const text = await readAsText(file as Blob);
    return parseJsonText(text, options, name.endsWith(".ndjson") ? "ndjson" : "json");
  }

  const buf = await readAsArrayBuffer(file as Blob | ArrayBuffer | Uint8Array);

  if (name.endsWith(".zip") || looksLikeZip(buf)) {
    options.onProgress?.(0.15, "Opening ZIP…");
    const zip = await JSZip.loadAsync(buf);
    const jsonFiles = Object.keys(zip.files).filter(
      (p) =>
        !zip.files[p].dir &&
        (p.toLowerCase().endsWith(".json") ||
          p.toLowerCase().endsWith(".ndjson")) &&
        !p.includes("__MACOSX"),
    );

    if (!jsonFiles.length) {
      throw new Error(
        "ZIP opened, but no JSON files were found inside. Export again from Grok Settings → Data Controls.",
      );
    }

    // Prefer files that look like conversation exports
    jsonFiles.sort((a, b) => {
      const score = (p: string) => {
        const l = p.toLowerCase();
        let s = 0;
        if (l.includes("conversation")) s += 10;
        if (l.includes("chat")) s += 8;
        if (l.includes("export")) s += 6;
        if (l.includes("grok")) s += 4;
        if (l.endsWith("data.json")) s += 5;
        return s;
      };
      return score(b) - score(a);
    });

    const all: Conversation[] = [];
    const warnings: string[] = [];
    let format = "zip+json";

    for (let i = 0; i < jsonFiles.length; i++) {
      const path = jsonFiles[i];
      options.onProgress?.(
        0.2 + (0.5 * i) / jsonFiles.length,
        `Reading ${path.split("/").pop()}…`,
      );
      const text = await zip.files[path].async("string");
      try {
        const partial = parseJsonText(text, {
          ...options,
          onProgress: undefined,
        }, `zip:${path}`);
        for (const c of partial.conversations) {
          c.sourceLabel = path;
          all.push(c);
        }
        warnings.push(...partial.warnings);
        format = partial.sourceFormat;
      } catch (e) {
        warnings.push(
          `Skipped ${path}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // Dedupe within multi-file zip by id (keep richer)
    const byId = new Map<string, Conversation>();
    for (const c of all) {
      const prev = byId.get(c.id);
      if (!prev || c.messageCount > prev.messageCount) byId.set(c.id, c);
    }
    const conversations = [...byId.values()].sort((a, b) => {
      const ta = Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0;
      const tb = Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0;
      return tb - ta;
    });

    options.onProgress?.(1, "Done");
    return {
      conversations,
      sourceFormat: format,
      warnings,
      stats: {
        conversationCount: conversations.length,
        messageCount: conversations.reduce((n, c) => n + c.messageCount, 0),
        thoughtCount: conversations.reduce((n, c) => n + c.thoughtCount, 0),
      },
    };
  }

  // Assume JSON bytes
  const text = new TextDecoder("utf-8").decode(buf);
  return parseJsonText(text, options, "json");
}
