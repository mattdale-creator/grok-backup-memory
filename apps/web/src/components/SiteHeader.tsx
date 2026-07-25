import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand" aria-label="Grok Memory home">
          <span className="brand-mark" aria-hidden />
          <span>Grok Memory</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/demo" style={{ color: "var(--accent-strong)" }}>
            Demo
          </Link>
          <Link href="/how-it-works" className="hide-sm">
            How it works
          </Link>
          <Link href="/skill">Skill</Link>
          <Link href="/import">Import</Link>
          <Link href="/library">Library</Link>
          <Link href="/privacy" className="hide-sm">
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
