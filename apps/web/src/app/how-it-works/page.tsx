import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
  description: "The calm path from Grok skill to private library.",
};

export default function HowItWorksPage() {
  return (
    <div className="app-shell">
      <div className="container prose">
        <h1 className="page-title">How it works</h1>
        <p className="page-lead">
          Official skill. Official export. Private library. That’s the whole
          product.
        </p>

        <h2>First time</h2>
        <ol>
          <li>
            Land on the homepage and open{" "}
            <Link href="/skill">Get the skill</Link>.
          </li>
          <li>
            In Grok, install the skill once. Say{" "}
            <code>Remember this skill</code>.
          </li>
          <li>
            Work as usual. When you’re done, say <code>Save this</code>.
          </li>
          <li>
            Download the chat Markdown. When you want everything, follow the
            in-chat steps for Settings → export.
          </li>
          <li>
            Open <Link href="/import">Import</Link>, pick the ZIP/JSON, enjoy
            the library.
          </li>
        </ol>

        <h2>Returning</h2>
        <ol>
          <li>Skill is already installed—no reinstall.</li>
          <li>
            Still use <code>Remember this skill</code> and <code>Save this</code>.
          </li>
          <li>
            Re-import newer exports. Dedupe keeps week one from doubling.
          </li>
        </ol>

        <h2>Phone without the native app</h2>
        <p>
          Safari or Chrome → <Link href="/import">/import</Link> → pick the file
          from Files or Downloads.
        </p>

        <h2>Phone with the native app</h2>
        <p>
          Share the ZIP/JSON → Grok Backup Memory → import opens into the same
          web core.
        </p>

        <h2>Desktop</h2>
        <p>Drag and drop the export onto the import screen.</p>

        <p style={{ marginTop: "2rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href="/skill" className="btn btn-primary">
            Get the skill
          </Link>
          <Link href="/import" className="btn btn-secondary">
            Import
          </Link>
        </p>
      </div>
    </div>
  );
}
