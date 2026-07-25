import type { Metadata } from "next";
import { LibraryApp } from "@/components/LibraryApp";

export const metadata: Metadata = {
  title: "Library",
  description: "Your calm Grok conversation archive on this device.",
};

export default function LibraryPage() {
  return (
    <div className="app-shell">
      <div className="container">
        <LibraryApp />
      </div>
    </div>
  );
}
