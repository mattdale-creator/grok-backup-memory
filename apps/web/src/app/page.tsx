import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Grok Backup Memory</p>
            <h1>Keep your Grok conversations—beautifully, legally, on your terms.</h1>
            <p className="hero-lead">
              A calm companion for official Grok. Install one skill, save chats as
              Markdown, import your full export, and reread dialogue plus thoughts
              in a private library that lives on your device.
            </p>
            <div className="hero-actions">
              <Link href="/skill" className="btn btn-primary btn-lg">
                Get the skill
              </Link>
              <Link href="/import" className="btn btn-secondary btn-lg">
                Open import
              </Link>
              <Link href="/library" className="btn btn-ghost btn-lg">
                Open library
              </Link>
            </div>
            <p className="hero-note">
              No login in v1. Your files stay on this phone or computer.
              Privacy one-liner:{" "}
              <Link href="/privacy" style={{ color: "var(--accent)" }}>
                we don’t need your chats to host a homepage
              </Link>
              .
            </p>
          </div>

          <aside className="hero-card" aria-label="Daily phrases">
            <h2>Two soft phrases</h2>
            <div className="phrase">
              <strong>Remember this skill</strong>
              <span>Start of a chat you care about. One happy confirmation.</span>
            </div>
            <div className="phrase">
              <strong>Save this</strong>
              <span>
                End of the chat. Downloadable Markdown for this conversation, plus
                short in-chat steps for the full official export.
              </span>
            </div>
            <p style={{ margin: "1rem 0 0", color: "var(--fg-muted)", fontSize: "0.92rem" }}>
              Skill installs once on your Grok account—web, iOS, and Android.
              Still use the phrases; they keep the ritual clear and kind.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <p className="section-lead">
            Five gentle steps. No scraping. No fake Grok client. Just official
            skills, official export, and a pretty library.
          </p>
          <div className="steps">
            <article className="step-card">
              <div className="step-num">1</div>
              <h3>Install the skill</h3>
              <p>Paste once in Grok Settings → Skills. It stays on your account.</p>
            </article>
            <article className="step-card">
              <div className="step-num">2</div>
              <h3>Remember this skill</h3>
              <p>Say it when you start a chat you want covered. Short confirmation.</p>
            </article>
            <article className="step-card">
              <div className="step-num">3</div>
              <h3>Save this</h3>
              <p>Get this chat as Markdown. Follow the friendly in-chat export steps when you want everything.</p>
            </article>
            <article className="step-card">
              <div className="step-num">4</div>
              <h3>Import here</h3>
              <p>Bring the ZIP or JSON into Grok Memory. Drag-drop on desktop, file picker on phone.</p>
            </article>
          </div>
          <p className="section-lead" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
            Step 5: re-import anytime. We dedupe full snapshots so week two doesn’t
            double week one—you’ll see{" "}
            <em>Added · Updated · Skipped</em>.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">What you get</h2>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Dialogue + thoughts</h3>
              <p>
                Read the conversation and thinking traces when the export includes
                them—ordered, full text, no busy dashboard.
              </p>
            </article>
            <article className="feature-card">
              <h3>Export your way</h3>
              <p>
                Markdown, readable HTML, PDF, and EPUB for Kindle-style rereading.
                Best-effort, honest limits.
              </p>
            </article>
            <article className="feature-card">
              <h3>Phone-friendly</h3>
              <p>
                Use the website in Safari or Chrome, or the lightweight iOS and
                Android shells with Share / Open-with.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Apps & website</h2>
              <p>
                Web app works now in any modern browser. Native shells ship in this
                repo for Simulator / emulator and sideload while store signing is
                pending.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link href="/library" className="btn btn-primary">
                Open web app
              </Link>
              <Link href="/skill" className="btn btn-secondary">
                Install skill
              </Link>
            </div>
          </div>

          <div className="feature-grid" style={{ marginTop: "1rem" }}>
            <article className="feature-card">
              <h3>Web</h3>
              <p>
                Full marketing site + library. Mobile-first. Import at{" "}
                <Link href="/import" style={{ color: "var(--accent)" }}>
                  /import
                </Link>
                .
              </p>
            </article>
            <article className="feature-card">
              <h3>iOS</h3>
              <p>
                SwiftUI shell + Share Extension. Open{" "}
                <code className="phrase-inline">apps/ios</code> in Xcode. TestFlight
                when you have an Apple Developer ID.
              </p>
            </article>
            <article className="feature-card">
              <h3>Android</h3>
              <p>
                WebView shell + share intents for ZIP/JSON. Open{" "}
                <code className="phrase-inline">apps/android</code> in Android Studio.
                Play signing is the human unlock.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
