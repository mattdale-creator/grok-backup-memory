"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

function ChromeInner({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const embed = params.get("embed") === "1";

  if (embed) {
    return <main className="embed-main">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

/** Hides site chrome when ?embed=1 (used inside native shell iframes). */
export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<main>{children}</main>}>
      <ChromeInner>{children}</ChromeInner>
    </Suspense>
  );
}
