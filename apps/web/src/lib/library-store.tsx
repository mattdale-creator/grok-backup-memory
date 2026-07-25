"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Conversation, DedupeStats } from "@grok-memory/core";
import { dedupeMerge, parseGrokExport } from "@grok-memory/core";
import { clearLibrary, loadConversations, saveConversations } from "@/lib/storage";

type ImportProgress = { progress: number; label: string } | null;

type LibraryContextValue = {
  conversations: Conversation[];
  loading: boolean;
  lastDedupe: DedupeStats | null;
  importProgress: ImportProgress;
  refresh: () => Promise<void>;
  importFile: (file: File | Blob, nameHint?: string, skipHeavyMedia?: boolean) => Promise<DedupeStats>;
  clear: () => Promise<void>;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDedupe, setLastDedupe] = useState<DedupeStats | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>(null);

  const refresh = useCallback(async () => {
    const list = await loadConversations();
    setConversations(list);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const importFile = useCallback(
    async (file: File | Blob, nameHint = "export.json", skipHeavyMedia = true) => {
      setImportProgress({ progress: 0.02, label: "Reading…" });
      const existing = await loadConversations();
      const asFile =
        file instanceof File
          ? file
          : new File([file], nameHint, { type: "application/json" });
      const parsed = await parseGrokExport(asFile, {
        skipHeavyMedia,
        onProgress: (p, l) => setImportProgress({ progress: p, label: l ?? "Working…" }),
      });
      if (!parsed.conversations.length) {
        setImportProgress(null);
        throw new Error(
          parsed.warnings[0] ||
            "No conversations found. Try the JSON or ZIP from Grok Settings → Data Controls.",
        );
      }
      const merged = dedupeMerge(existing, parsed.conversations);
      await saveConversations(merged.conversations);
      setConversations(merged.conversations);
      setLastDedupe(merged);
      setImportProgress(null);
      return merged;
    },
    [],
  );

  const clear = useCallback(async () => {
    await clearLibrary();
    setConversations([]);
    setLastDedupe(null);
  }, []);

  const value = useMemo(
    () => ({
      conversations,
      loading,
      lastDedupe,
      importProgress,
      refresh,
      importFile,
      clear,
    }),
    [conversations, loading, lastDedupe, importProgress, refresh, importFile, clear],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
