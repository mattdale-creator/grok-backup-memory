import type { Metadata } from "next";
import Link from "next/link";
import { NativeShellFrame } from "@/components/NativeShellFrame";

export const metadata: Metadata = {
  title: "iOS shell demo",
  description: "Browser preview of the Grok Backup Memory iOS native shell.",
};

export default function IosShellDemoPage() {
  return (
    <div className="app-shell" style={{ paddingBottom: "3rem" }}>
      <div className="container">
        <p className="eyebrow">Browser · no Xcode</p>
        <h1 className="page-title">iOS shell preview</h1>
        <p className="page-lead">
          This is a visual clone of the native iPhone shell (status bar, brand chrome,
          Import / Library). Inside is the real web app. Use it to judge look and feel
          without installing Xcode.
        </p>
        <p style={{ marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
          <Link href="/demo" style={{ color: "var(--accent)" }}>
            ← Demo hub
          </Link>
          {" · "}
          <Link href="/demo/android" style={{ color: "var(--accent)" }}>
            Android preview
          </Link>
        </p>
        <NativeShellFrame platform="ios" />
      </div>
    </div>
  );
}
