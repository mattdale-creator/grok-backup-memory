"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDedupeToast } from "@grok-memory/core";
import { useLibrary } from "@/lib/library-store";

type Props = { variant?: "page" | "compact" };

export function ImportPanel({ variant = "page" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { importFile, importProgress } = useLibrary();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skipHeavyMedia, setSkipHeavyMedia] = useState(true);
  const autoRan = useRef(false);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4500);
  };

  const runImport = useCallback(
    async (file: File | Blob, nameHint?: string) => {
      setBusy(true);
      setError(null);
      try {
        const stats = await importFile(file, nameHint, skipHeavyMedia);
        const msg = formatDedupeToast(stats);
        showToast(msg);
        window.setTimeout(() => router.push("/library"), 600);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Import failed. Try another file.");
      } finally {
        setBusy(false);
      }
    },
    [importFile, router, skipHeavyMedia],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[] | null) => {
      if (!files?.length) return;
      await runImport(files[0]);
    },
    [runImport],
  );

  const loadDemo = useCallback(
    async (which: "sample" | "week2" | "nested" = "sample") => {
      const path =
        which === "week2"
          ? "/demo/sample-export-week2.json"
          : which === "nested"
            ? "/demo/nested-export.json"
            : "/demo/sample-export.json";
      const name = path.split("/").pop()!;
      const res = await fetch(path);
      if (!res.ok) throw new Error("Demo file missing");
      await runImport(await res.blob(), name);
    },
    [runImport],
  );

  // IMPROVEMENT: deep-link demos — /import?demo=1 | demo=week2 | demo=nested
  useEffect(() => {
    if (autoRan.current) return;
    const demo = searchParams.get("demo");
    if (!demo) return;
    autoRan.current = true;
    const which = demo === "week2" || demo === "2" ? "week2" : demo === "nested" ? "nested" : "sample";
    void loadDemo(which).catch((e) =>
      setError(e instanceof Error ? e.message : "Auto-demo failed"),
    );
  }, [searchParams, loadDemo]);

  return (
    <>
      <div
        className={`import-hero ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <div>
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            Your archive · on this device
          </p>
          <h1>{variant === "page" ? "Import your Grok export" : "Import"}</h1>
          <p>
            Drop a ZIP or JSON from official Grok data export. Parsed in your
            browser—nothing uploaded to our servers in v1.
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
              onClick={() => void loadDemo("sample")}
            >
              Try demo sample
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-lg"
              disabled={busy}
              onClick={() => void loadDemo("week2")}
            >
              Demo week-2 dedupe
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
          {(busy || importProgress) && (
            <>
              <div className="progress-bar" aria-hidden>
                <span
                  style={{
                    width: `${Math.round((importProgress?.progress ?? 0.1) * 100)}%`,
                  }}
                />
              </div>
              <p style={{ marginTop: "0.75rem", color: "var(--fg-muted)" }}>
                {importProgress?.label ?? "Working…"}
              </p>
            </>
          )}
          {error && (
            <p style={{ marginTop: "1rem", color: "var(--danger)" }} role="alert">
              {error}
            </p>
          )}
          <p className="hero-note" style={{ marginTop: "1.25rem" }}>
            Auto-demo links:{" "}
            <code className="phrase-inline">/import?demo=1</code> ·{" "}
            <code className="phrase-inline">/import?demo=week2</code>
          </p>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
