import type { Metadata, Viewport } from "next";
import { AppChrome } from "@/components/AppChrome";
import { LibraryProvider } from "@/lib/library-store";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Grok Backup Memory",
    template: "%s · Grok Memory",
  },
  description:
    "Keep your Grok conversations—beautifully, legally, on your terms. Official skill, calm library, client-side import.",
  applicationName: "Grok Backup Memory",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Grok Memory",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0f0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Sora:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <LibraryProvider>
          <AppChrome>{children}</AppChrome>
        </LibraryProvider>
      </body>
    </html>
  );
}
