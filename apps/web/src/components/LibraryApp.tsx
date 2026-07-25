"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Conversation } from "@grok-memory/core";
import { exportConversation, type ExportFormat } from "@/lib/export-client";
import { useLibrary } from "@/lib/library-store";

function roleLabel(role: string): string {
  if (role === "user") return "You";
  if (role === "assistant") return "Grok";
  if (role === "system") return "System";
  if (role === "tool") return "Tool";
  return "Other";
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function LibraryApp() {
  const { conversations, loading, clear, lastDedupe } = useLibrary();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    // IMPROVEMENT: search titles, messages, AND thoughts
    return conversations.filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      return c.messages.some(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.thoughts.some((t) => t.text.toLowerCase().includes(q)),
      );
    });
  }, [conversations, query]);

  const selected =
    filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  const onExport = async (conversation: Conversation, format: ExportFormat) => {
    setExporting(true);
    try {
      await exportConversation(conversation, format);
      setToast(`Saved ${format.toUpperCase()} for “${conversation.title}”`);
      window.setTimeout(() => setToast(null), 3000);
    } catch {
      setToast("Export hit a snag. Try Markdown or HTML.");
      window.setTimeout(() => setToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  // IMPROVEMENT: bulk export selected chats as sequential downloads
  const onBulkExport = async (format: ExportFormat) => {
    const ids = selectedIds.size ? selectedIds : selected ? new Set([selected.id]) : new Set();
    const list = conversations.filter((c) => ids.has(c.id));
    if (!list.length) return;
    setExporting(true);
    try {
      for (const c of list) {
        await exportConversation(c, format);
        await new Promise((r) => setTimeout(r, 200));
      }
      setToast(`Exported ${list.length} chat(s) as ${format.toUpperCase()}`);
      window.setTimeout(() => setToast(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="empty-state">
        <p>Opening your library…</p>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="empty-state panel">
        <h2>Your library is quiet</h2>
        <p style={{ marginBottom: "1.25rem" }}>
          Import an official Grok export — or try the one-click demo sample.
        </p>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/import" className="btn btn-primary">
            Import a file
          </Link>
          <Link href="/import?demo=1" className="btn btn-secondary">
            Load demo sample
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Library
          </h1>
          <p className="page-lead" style={{ marginBottom: 0 }}>
            {conversations.length} conversation{conversations.length === 1 ? "" : "s"} · on this
            device
            {lastDedupe
              ? ` · last import: ${lastDedupe.added} added / ${lastDedupe.updated} updated / ${lastDedupe.skipped} skipped`
              : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/import" className="btn btn-primary">
            Import again
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={exporting}
            onClick={() => void onBulkExport("md")}
          >
            Export selected MD
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm("Clear the library on this device? This cannot be undone.")) {
                void clear();
              }
            }}
          >
            Clear library
          </button>
        </div>
      </div>

      <div className="library-layout">
        <aside>
          <input
            className="search-input"
            placeholder="Search titles, messages, thoughts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search conversations"
          />
          <div className="conv-list">
            {filtered.map((c) => (
              <div key={c.id} style={{ display: "flex", gap: "0.35rem", alignItems: "stretch" }}>
                <label
                  style={{
                    display: "grid",
                    placeItems: "center",
                    padding: "0 0.2rem",
                    color: "var(--fg-muted)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.id)}
                    onChange={() => toggleSelect(c.id)}
                    aria-label={`Select ${c.title}`}
                  />
                </label>
                <button
                  type="button"
                  className={`conv-item ${selected?.id === c.id ? "active" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                  style={{ flex: 1 }}
                >
                  <h3>{c.title}</h3>
                  <p>
                    {formatDate(c.updatedAt ?? c.createdAt)} · {c.messageCount} msgs
                    {c.thoughtCount ? ` · ${c.thoughtCount} thoughts` : ""}
                  </p>
                </button>
              </div>
            ))}
            {!filtered.length && (
              <p style={{ color: "var(--fg-muted)", padding: "0.5rem" }}>Nothing matches that search.</p>
            )}
          </div>
        </aside>

        <section className="reader" aria-live="polite">
          {selected ? (
            <>
              <div className="reader-header">
                <div>
                  <h2>{selected.title}</h2>
                  <p className="reader-meta">
                    {formatDate(selected.createdAt)} · {selected.messageCount} messages
                    {selected.thoughtCount ? ` · ${selected.thoughtCount} thought segments` : ""}
                  </p>
                </div>
                <div className="export-row">
                  {(["md", "html", "pdf", "epub"] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className="btn btn-secondary"
                      disabled={exporting}
                      onClick={() => void onExport(selected, fmt)}
                      style={{ padding: "0.55rem 0.85rem", fontSize: "0.85rem" }}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {selected.messages.map((m) => (
                <article key={m.id} className={`msg ${m.role}`}>
                  <div className="msg-head">
                    <span>{roleLabel(m.role)}</span>
                    {m.createdAt && <time>{formatDate(m.createdAt)}</time>}
                  </div>
                  <div className="msg-body">{m.content}</div>
                  {m.thoughts.length > 0 && (
                    <details className="thoughts" open={m.thoughts.length <= 2}>
                      <summary>Thoughts</summary>
                      <div className="thought-body">
                        {m.thoughts.map((t) => (
                          <p key={t.id} style={{ margin: "0 0 0.6rem" }}>
                            {t.text}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                  {m.toolSteps.length > 0 && (
                    <details className="thoughts">
                      <summary>Tool steps</summary>
                      <div className="thought-body">
                        {m.toolSteps.map((s) => (
                          <p key={s.id} style={{ margin: "0 0 0.5rem" }}>
                            <strong>{s.name ?? "step"}</strong>
                            {s.status ? ` (${s.status})` : ""}
                            {s.output ? ` — ${s.output.slice(0, 240)}` : ""}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </article>
              ))}
            </>
          ) : (
            <div className="empty-state">
              <p>Select a conversation.</p>
            </div>
          )}
        </section>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
