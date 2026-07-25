"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  dedupeMerge,
  formatDedupeToast,
  parseGrokExport,
} from "@grok-memory/core";
import { loadConversations, saveConversations } from "@/lib/storage";

type Props = {
  variant?: "page" | "compact";
};

export function ImportPanel({ variant = "page" }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skipHeavyMedia, setSkipHeavyMedia] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4500);
  };

  const importBlob = useCallback(
    async (file: File | Blob, nameHint = "export.json") => {
      setBusy(true);
      setError(null);
      setProgress(0.02);
      setLabel("Reading…");

      try {
        const existing = await loadConversations();
        const asFile =
          file instanceof File
            ? file
            : new File([file], nameHint, { type: "application/json" });
        const parsed = await parseGrokExport(asFile, {
          skipHeavyMedia,
          onProgress: (p, l) => {
            setProgress(p);
            if (l) setLabel(l);
          },
        });

        if (!parsed.conversations.length) {
          setError(
            parsed.warnings[0] ||
              "No conversations found in that file. Try the JSON or ZIP from Grok Settings → Data Controls.",
          );
          setBusy(false);
          return;
        }

        const merged = dedupeMerge(existing, parsed.conversations);
        await saveConversations(merged.conversations);
        const msg = formatDedupeToast(merged);
        showToast(msg);
        setLabel(msg);
        setProgress(1);

        window.setTimeout(() => {
          router.push("/library");
        }, 700);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Import failed. Try another file.");
      } finally {
        setBusy(false);
      }
    },
    [router, skipHeavyMedia],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files || !files.length) return;
      await importBlob(files[0]);
    },
    [importBlob],
  );

  const loadSample = useCallback(async () => {
    try {
      const res = await fetch("/demo/sample-export.json");
      if (!res.ok) throw new Error("Sample file missing");
      const blob = await res.blob();
      await importBlob(blob, "sample-export.json");
    } catch {
      setError("Could not load the demo sample. Use Choose ZIP or JSON instead.");
    }
  }, [importBlob]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div
        className={`import-hero ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div>
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            Your archive · on this device
          </p>
          <h1>{variant === "page" ? "Import your Grok export" : "Import"}</h1>
          <p>
            Drop a ZIP or JSON from official Grok data export. We parse it here
            in your browser—nothing is uploaded to our servers in v1.
          </p>
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? "Importing…" : "Choose ZIP or JSON"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              disabled={busy}
              onClick={() => void loadSample()}
            >
              Try demo sample
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,.json,application/zip,application/json"
            hidden
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={skipHeavyMedia}
              onChange={(e) => setSkipHeavyMedia(e.target.checked)}
            />
            Chats + thoughts only (skip heavy media)
          </label>
          {busy && (
            <>
              <div className="progress-bar" aria-hidden>
                <span style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <p style={{ marginTop: "0.75rem", color: "var(--fg-muted)" }}>{label}</p>
            </>
          )}
          {error && (
            <p style={{ marginTop: "1rem", color: "var(--danger)" }} role="alert">
              {error}
            </p>
          )}
          <p className="hero-note" style={{ marginTop: "1.25rem" }}>
            Official path: Grok Settings → Data Controls → export, then import here.
            Demo uses a synthetic fixture—no private data required.
          </p>
        </div>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
