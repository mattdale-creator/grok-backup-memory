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

/** Single atomic transaction for puts + orphan deletes (merge from redo). */
export async function saveConversations(conversations: Conversation[]): Promise<void> {
  const db = await getDb();
  const keep = new Set(conversations.map((c) => c.id));
  const tx = db.transaction(["conversations", "meta"], "readwrite");
  const store = tx.objectStore("conversations");
  const existingKeys = await store.getAllKeys();
  await Promise.all([
    ...conversations.map((c) => store.put(c)),
    ...existingKeys.filter((k) => !keep.has(String(k))).map((k) => store.delete(k)),
  ]);
  const meta: LibraryMeta = {
    version: 1,
    importedAt: new Date().toISOString(),
    lastImportAt: new Date().toISOString(),
    conversationCount: conversations.length,
  };
  await tx.objectStore("meta").put(meta, "library");
  await tx.done;
}

export async function getLibraryMeta(): Promise<LibraryMeta | undefined> {
  const db = await getDb();
  return db.get("meta", "library");
}

export async function clearLibrary(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["conversations", "meta"], "readwrite");
  await Promise.all([
    tx.objectStore("conversations").clear(),
    tx.objectStore("meta").delete("library"),
    tx.done,
  ]);
}
