import type { Metadata } from "next";
import Link from "next/link";
import { SkillInstall } from "@/components/SkillInstall";

export const metadata: Metadata = {
  title: "Get the skill",
  description: "Install the Grok Memory skill with Remember this skill and Save this.",
};

export default function SkillPage() {
  return (
    <div className="app-shell">
      <div className="container prose" style={{ maxWidth: "46rem" }}>
        <p className="eyebrow">Official Grok skill</p>
        <h1 className="page-title">Install once. Use two soft phrases.</h1>
        <p className="page-lead">
          This skill lives on your Grok account—web, iOS, and Android. You do not
          reinstall every chat. Still say the phrases so the ritual stays clear.
        </p>

        <h2>Minimal steps</h2>
        <ol>
          <li>Open Grok → Settings → Skills (or Skill Creator).</li>
          <li>Create a skill named <strong>Grok Memory</strong>.</li>
          <li>Paste the description and instructions below.</li>
          <li>Save. In a chat, say <code>Remember this skill</code>.</li>
          <li>When you finish, say <code>Save this</code>.</li>
        </ol>

        <SkillInstall />

        <h2>What the phrases do</h2>
        <ul>
          <li>
            <code>Remember this skill</code> — short, happy confirmation that this
            chat is covered. No full export tutorial unless you ask.
          </li>
          <li>
            <code>Save this</code> — downloadable Markdown for <em>this</em>{" "}
            conversation only (dialogue + thoughts when available). The Markdown
            file does <strong>not</strong> include Settings export steps. Those
            steps appear in the chat message, with a link to{" "}
            <Link href="/import">Import</Link>.
          </li>
        </ul>

        <h2>If matching feels weak</h2>
        <p>
          Troubleshooting may mention <code>Run remember this skill</code> as a
          fallback. We never use slash commands in this product.
        </p>

        <p style={{ marginTop: "2rem" }}>
          <Link href="/import" className="btn btn-primary">
            Continue to import
          </Link>
        </p>
      </div>
    </div>
  );
}
