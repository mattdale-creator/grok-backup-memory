"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Conversation, LibraryMeta } from "@grok-memory/core";

interface GrokMemoryDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { "by-updated": string };
  };
  meta: {
    key: string;
    value: LibraryMeta;
  };
}

const DB_NAME = "grok-backup-memory";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<GrokMemoryDB>> | null = null;

function getDb() {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment.");
  }
  if (!dbPromise) {
    dbPromise = openDB<GrokMemoryDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("conversations", { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
        db.createObjectStore("meta");
      },
    });
  }
  return dbPromise;
}

export async function loadConversations(): Promise<Conversation[]> {
  const db = await getDb();
  const all = await db.getAll("conversations");
  return all.sort((a, b) => {
    const ta = Date.parse(a.updatedAt ?? a.createdAt ?? "") || 0;
    const tb = Date.parse(b.updatedAt ?? b.createdAt ?? "") || 0;
    return tb - ta;
  });
}

export async function saveConversations(
  conversations: Conversation[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("conversations", "readwrite");
  await Promise.all([
    ...conversations.map((c) => tx.store.put(c)),
    tx.done,
  ]);
  const meta: LibraryMeta = {
    version: 1,
    importedAt: new Date().toISOString(),
    lastImportAt: new Date().toISOString(),
    conversationCount: conversations.length,
  };
  // Replace library entirely with merged set: clear removed? keep all keys from merge
  // For incremental: put merged list; optionally delete orphans not in merge
  const existingKeys = await db.getAllKeys("conversations");
  const keep = new Set(conversations.map((c) => c.id));
  const delTx = db.transaction("conversations", "readwrite");
  await Promise.all([
    ...existingKeys
      .filter((k) => !keep.has(String(k)))
      .map((k) => delTx.store.delete(k)),
    delTx.done,
  ]);
  // Re-put to ensure latest (in case delete path raced — safe)
  const putTx = db.transaction("conversations", "readwrite");
  await Promise.all([
    ...conversations.map((c) => putTx.store.put(c)),
    putTx.done,
  ]);
  await db.put("meta", meta, "library");
}

export async function getLibraryMeta(): Promise<LibraryMeta | undefined> {
  const db = await getDb();
  return db.get("meta", "library");
}

export async function clearLibrary(): Promise<void> {
  const db = await getDb();
  await db.clear("conversations");
  await db.delete("meta", "library");
}
