import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo hub",
  description: "One-stop local demos for Grok Backup Memory — no App Store needed.",
};

const links = [
  {
    href: "/",
    title: "1. Marketing homepage",
    body: "See the product story, phrases, and how it works.",
  },
  {
    href: "/skill",
    title: "2. Skill install page",
    body: "Copy buttons for the Grok skill text (you paste into Grok later).",
  },
  {
    href: "/import",
    title: "3. Import (main interactive demo)",
    body: 'Click “Try demo sample” — no file picking needed. Then open the library.',
  },
  {
    href: "/library",
    title: "4. Library / reader",
    body: "After import: dialogue, thoughts, search, export MD/HTML/PDF/EPUB.",
  },
  {
    href: "/demo/ios",
    title: "5. iOS shell preview (browser)",
    body: "Looks like the native iPhone shell — no Xcode required.",
  },
  {
    href: "/demo/android",
    title: "6. Android shell preview (browser)",
    body: "Looks like the native Android shell — no Android Studio required.",
  },
  {
    href: "/privacy",
    title: "7. Privacy page",
    body: "Plain-language “stays on this device” copy.",
  },
  {
    href: "/how-it-works",
    title: "8. How it works",
    body: "Full user journeys in calm language.",
  },
];

export default function DemoHubPage() {
  return (
    <div className="app-shell">
      <div className="container" style={{ maxWidth: "48rem" }}>
        <p className="eyebrow">Local demos · no store accounts</p>
        <h1 className="page-title">See everything in your browser</h1>
        <p className="page-lead">
          This hub is for you when you wake up. The real product is already
          running locally. Click the steps in order. You do <strong>not</strong>{" "}
          need Apple Developer, Play Console, or Grok skill paste to <em>see</em>{" "}
          the app.
        </p>

        <div className="panel" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-display)" }}>
            Fastest path (about 2 minutes)
          </h2>
          <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--fg-muted)" }}>
            <li>
              Open{" "}
              <Link href="/import" style={{ color: "var(--accent)" }}>
                Import
              </Link>
            </li>
            <li>
              Click <strong>Try demo sample</strong> (loads synthetic chats + thoughts)
            </li>
            <li>
              In the library, open a chat, expand <strong>Thoughts</strong>
            </li>
            <li>
              Click <strong>MD</strong>, then <strong>HTML</strong>, <strong>PDF</strong>,{" "}
              <strong>EPUB</strong> to download exports
            </li>
            <li>
              Return to Import → <strong>Try demo sample</strong> again → toast should say
              something like <em>Added 0 · Updated 0 · Skipped 3</em>
            </li>
            <li>
              Open the{" "}
              <Link href="/demo/ios" style={{ color: "var(--accent)" }}>
                iOS
              </Link>{" "}
              and{" "}
              <Link href="/demo/android" style={{ color: "var(--accent)" }}>
                Android
              </Link>{" "}
              shell previews
            </li>
          </ol>
        </div>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="panel"
              style={{
                display: "block",
                textDecoration: "none",
                transition: "border-color 0.2s ease",
              }}
            >
              <strong style={{ color: "var(--accent-strong)" }}>{item.title}</strong>
              <p style={{ margin: "0.35rem 0 0", color: "var(--fg-muted)", fontSize: "0.95rem" }}>
                {item.body}
              </p>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: "var(--fg-faint)" }}>
                {item.href.startsWith("http") ? item.href : `http://localhost:3000${item.href}`}
              </p>
            </Link>
          ))}
        </div>

        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-display)" }}>
            If a page won’t load
          </h2>
          <p style={{ margin: 0, color: "var(--fg-muted)" }}>
            Double-click{" "}
            <code className="phrase-inline">Open Grok Memory Demo.command</code> on your
            Desktop (or run{" "}
            <code className="phrase-inline">./scripts/open-demo.command</code> in the
            project). It starts the local server and opens this hub.
          </p>
        </div>

        <div className="panel" style={{ marginTop: "0.75rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-display)" }}>
            What still needs a human later (not required for this demo)
          </h2>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--fg-muted)" }}>
            <li>Paste the skill into real Grok Settings</li>
            <li>Full Xcode for a real iPhone Simulator binary</li>
            <li>Android Studio for a real emulator APK</li>
            <li>App Store / Play signing and a public website domain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
