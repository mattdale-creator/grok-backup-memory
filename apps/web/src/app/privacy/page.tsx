import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Plain-language privacy for Grok Backup Memory.",
};

export default function PrivacyPage() {
  return (
    <div className="app-shell">
      <div className="container prose">
        <h1 className="page-title">Privacy, in plain language</h1>
        <p className="page-lead">
          v1 is built so your conversations do not need to leave your device for
          the library to work.
        </p>

        <h2>What stays on your device</h2>
        <ul>
          <li>Imported ZIP/JSON is parsed in your browser (client-side).</li>
          <li>Your library is stored in this browser’s IndexedDB.</li>
          <li>Exports (Markdown, HTML, PDF, EPUB) download to your device.</li>
        </ul>

        <h2>What we don’t do in v1</h2>
        <ul>
          <li>No account login required.</li>
          <li>No server-side storage of your chats for the import/library flow.</li>
          <li>No screen recording, accessibility scraping, or fake Grok clients.</li>
        </ul>

        <h2>What the marketing site may still do</h2>
        <p>
          Hosting a website can involve normal web logs (IP, user agent) at the
          host level. That is separate from your conversation library. We do not
          need your chats to show a homepage.
        </p>

        <h2>Official Grok export</h2>
        <p>
          Full history comes from Grok’s own Settings → Data Controls export. That
          file is yours. You choose when to open it in{" "}
          <Link href="/import">Import</Link>.
        </p>

        <h2>Later (v2 ideas only)</h2>
        <p>
          Optional Google or X login and cheap paid sync may appear later. Those
          would be opt-in and clearly explained. They do not block v1.
        </p>

        <p style={{ marginTop: "2rem" }}>
          <Link href="/" className="btn btn-secondary">
            Back home
          </Link>
        </p>
      </div>
    </div>
  );
}
