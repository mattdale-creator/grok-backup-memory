import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo hub",
  description: "One-stop local demos for Grok Backup Memory.",
};

const links = [
  { href: "/import?demo=1", title: "1. Auto-load demo sample", body: "No clicks past this link — imports fixture and opens library." },
  { href: "/import?demo=week2", title: "2. Week-2 dedupe demo", body: "After step 1, this shows Added/Updated/Skipped on a full snapshot." },
  { href: "/library", title: "3. Library / reader", body: "Dialogue, thoughts, search (incl. thoughts), bulk MD export." },
  { href: "/demo/ios", title: "4. iOS shell preview", body: "Phone frame + live web core — no Xcode." },
  { href: "/demo/android", title: "5. Android shell preview", body: "Phone frame + live web core — no Android Studio." },
  { href: "/", title: "6. Marketing homepage", body: "Positioning, phrases, CTAs." },
  { href: "/skill", title: "7. Skill install page", body: "Copy-ready Grok skill for later human paste." },
  { href: "/privacy", title: "8. Privacy", body: "Client-side / on-device promise." },
];

export default function DemoHubPage() {
  return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: "48rem" }}>
        <p className="eyebrow">Local demos · no store accounts</p>
        <h1 className="page-title">See everything in your browser</h1>
        <p className="page-lead">
          Start with the auto-demo links — they import synthetic fixtures so you never need a private Grok export.
        </p>
        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-display)" }}>Fastest path</h2>
          <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--fg-muted)" }}>
            <li>
              Open{" "}
              <Link href="/import?demo=1" style={{ color: "var(--accent)" }}>
                /import?demo=1
              </Link>
            </li>
            <li>Read a chat · expand Thoughts · export MD/HTML/PDF/EPUB</li>
            <li>
              Open{" "}
              <Link href="/import?demo=week2" style={{ color: "var(--accent)" }}>
                /import?demo=week2
              </Link>{" "}
              for dedupe toast
            </li>
            <li>Open iOS + Android shell previews</li>
          </ol>
        </div>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="panel" style={{ display: "block" }}>
              <strong style={{ color: "var(--accent-strong)" }}>{item.title}</strong>
              <p style={{ margin: "0.35rem 0 0", color: "var(--fg-muted)", fontSize: "0.95rem" }}>
                {item.body}
              </p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "var(--fg-faint)" }}>
                http://localhost:3000{item.href}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
