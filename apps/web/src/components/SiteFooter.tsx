import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div>
          <strong style={{ color: "var(--fg)" }}>Grok Backup Memory</strong>
          <p style={{ margin: "0.35rem 0 0" }}>
            Keep your Grok conversations—beautifully, legally, on your terms.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/skill">Get the skill</Link>
          <Link href="/import">Import</Link>
          <Link href="/library">Library</Link>
          <Link href="/privacy">Privacy</Link>
          <a
            href="https://github.com/mattdale-creator/grok-backup-memory"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="container" style={{ marginTop: "1.25rem", color: "var(--fg-faint)" }}>
        Not affiliated with xAI. Uses official Grok Skills and official account export only.
        Your library stays on this device in v1.
      </div>
    </footer>
  );
}
