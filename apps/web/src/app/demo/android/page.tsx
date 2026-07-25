import type { Metadata } from "next";
import Link from "next/link";
import { NativeShellFrame } from "@/components/NativeShellFrame";

export const metadata: Metadata = {
  title: "Android shell demo",
  description: "Browser preview of the Grok Backup Memory Android native shell.",
};

export default function AndroidShellDemoPage() {
  return (
    <div className="app-shell" style={{ paddingBottom: "3rem" }}>
      <div className="container">
        <p className="eyebrow">Browser · no Android Studio</p>
        <h1 className="page-title">Android shell preview</h1>
        <p className="page-lead">
          This is a visual clone of the Android app chrome wrapping the same live web
          app. Share/Open-with on a real device still needs the Android project; this
          preview is for design and flow.
        </p>
        <p style={{ marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
          <Link href="/demo" style={{ color: "var(--accent)" }}>
            ← Demo hub
          </Link>
          {" · "}
          <Link href="/demo/ios" style={{ color: "var(--accent)" }}>
            iOS preview
          </Link>
        </p>
        <NativeShellFrame platform="android" />
      </div>
    </div>
  );
}
