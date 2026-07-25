"use client";

import { useState } from "react";

const SKILL_NAME = "Grok Memory";

const SKILL_DESCRIPTION = `Use when the user says "Remember this skill" or "Save this". Helps them keep Grok conversations via a calm backup ritual: arm the session, package this chat as Markdown, and point them to official account export + Grok Backup Memory import.`;

const SKILL_INSTRUCTIONS = `You are the Grok Memory skill for the product "Grok Backup Memory" (UI brand: Grok Memory).

## Triggers
- "Remember this skill" — start / arm this conversation
- "Save this" — package this conversation

Never use slash commands. Never mention whether a turn was auto-matched or phrase-triggered.

## Tone
Simple, calm, happy, short. Make the user feel at ease. No scolding.

## When the user says: Remember this skill
Reply with one short, happy confirmation that this chat is covered (example: "Got it — this chat is covered. When you're ready, say Save this.").
Do NOT give the full Settings export tutorial unless they ask.

## When the user says: Save this
Hard contract — do all of the following:

1) Best-effort downloadable Markdown for THIS conversation only.
   - Include dialogue (user + assistant).
   - Include thoughts / thinking traces if available in context.
   - The Markdown file must NOT contain Settings/export tutorial text.
   - Offer the file for download in-chat (or provide copyable Markdown if file download is unavailable).

2) In the Grok chat message itself (visible in the thread), include short, happy, numbered steps for the full official export:
   1. Open Grok → Settings → Data Controls → Export / Download account data
   2. Wait for the email or link if Grok needs a moment
   3. Find the file in Downloads, Files, or Mail
   4. Open Grok Backup Memory → Import: https://localhost:3000/import (or your deployed site /import)

Keep the in-chat steps brief. Keep the Markdown package clean of those steps.

## Out of scope
- Do not pretend to be a separate Grok client
- Do not scrape UIs or use accessibility bots
- Do not require uploading the full export into Grok chat as the main path
`;

export function SkillInstall() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied("failed");
    }
  };

  return (
    <div style={{ display: "grid", gap: "1rem", margin: "1.5rem 0" }}>
      <div className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "0.6rem",
          }}
        >
          <strong>Name</strong>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            onClick={() => void copy("name", SKILL_NAME)}
          >
            {copied === "name" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="copy-box">{SKILL_NAME}</div>
      </div>

      <div className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "0.6rem",
          }}
        >
          <strong>Description (triggers)</strong>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            onClick={() => void copy("desc", SKILL_DESCRIPTION)}
          >
            {copied === "desc" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="copy-box">{SKILL_DESCRIPTION}</div>
      </div>

      <div className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "0.6rem",
          }}
        >
          <strong>Instructions</strong>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
            onClick={() => void copy("body", SKILL_INSTRUCTIONS)}
          >
            {copied === "body" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="copy-box" style={{ maxHeight: 360 }}>
          {SKILL_INSTRUCTIONS}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() =>
          void copy(
            "all",
            `# ${SKILL_NAME}\n\n## Description\n${SKILL_DESCRIPTION}\n\n## Instructions\n${SKILL_INSTRUCTIONS}`,
          )
        }
      >
        {copied === "all" ? "Full skill copied" : "Copy full skill text"}
      </button>
    </div>
  );
}
