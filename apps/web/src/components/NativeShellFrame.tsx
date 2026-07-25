"use client";

import { useMemo, useState } from "react";

type Platform = "ios" | "android";

export function NativeShellFrame({ platform }: { platform: Platform }) {
  const [route, setRoute] = useState<"chooser" | "import" | "library">("chooser");

  const iframeSrc = useMemo(() => {
    if (route === "import") return "/import?embed=1";
    if (route === "library") return "/library?embed=1";
    return null;
  }, [route]);

  const isIos = platform === "ios";

  return (
    <div className="shell-demo-wrap">
      <div className={`phone-frame ${isIos ? "phone-ios" : "phone-android"}`}>
        <div className="phone-notch" aria-hidden />
        <div className="phone-status">
          <span>{isIos ? "9:41" : "9:41"}</span>
          <span className="phone-status-icons">{isIos ? "●●● Wi‑Fi 100%" : "LTE 🔋"}</span>
        </div>

        {route === "chooser" ? (
          <div className="phone-first-run">
            <div className="phone-mark" aria-hidden />
            <h2>Grok Backup Memory</h2>
            <p>Import a file, or open your library.</p>
            <button type="button" className="phone-btn primary" onClick={() => setRoute("import")}>
              Import
            </button>
            <button type="button" className="phone-btn secondary" onClick={() => setRoute("library")}>
              Open Library
            </button>
            <p className="phone-privacy">Your data stays on this device in v1.</p>
          </div>
        ) : (
          <>
            <div className="phone-chrome">
              <button type="button" className="phone-brand" onClick={() => setRoute("chooser")}>
                <span className="phone-mark sm" aria-hidden />
                Grok Memory
              </button>
              <div className="phone-nav">
                <button
                  type="button"
                  className={route === "import" ? "on" : ""}
                  onClick={() => setRoute("import")}
                >
                  Import
                </button>
                <button
                  type="button"
                  className={route === "library" ? "on" : ""}
                  onClick={() => setRoute("library")}
                >
                  Library
                </button>
              </div>
            </div>
            <iframe
              key={iframeSrc ?? "empty"}
              title={`${platform} web core`}
              src={iframeSrc ?? "about:blank"}
              className="phone-webview"
            />
          </>
        )}

        <div className={`phone-home-indicator ${isIos ? "" : "android"}`} aria-hidden />
      </div>

      <div className="shell-demo-notes panel">
        <h3 style={{ marginTop: 0, fontFamily: "var(--font-display)" }}>
          {isIos ? "What the real iOS app does" : "What the real Android app does"}
        </h3>
        <ul style={{ color: "var(--fg-muted)", marginBottom: 0 }}>
          <li>Loads this same website inside a native WebView</li>
          <li>
            {isIos
              ? "Share Extension / Open-with accepts ZIP or JSON"
              : "Share sheet / Open-with accepts ZIP or JSON"}
          </li>
          <li>First-run chooser matches what you see on the left/right</li>
          <li>Offline banner if the website address is unreachable</li>
        </ul>
        <p style={{ color: "var(--fg-faint)", fontSize: "0.9rem", marginBottom: 0 }}>
          Project files:{" "}
          <code className="phrase-inline">
            {isIos ? "apps/ios/" : "apps/android/"}
          </code>
        </p>
      </div>
    </div>
  );
}
