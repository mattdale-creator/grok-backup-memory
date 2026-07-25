import type { Metadata } from "next";
import { ImportPanel } from "@/components/ImportPanel";

export const metadata: Metadata = {
  title: "Import",
  description: "Import your official Grok export ZIP or JSON into Grok Memory.",
};

export default function ImportPage() {
  return (
    <div className="app-shell">
      <div className="container">
        <ImportPanel variant="page" />
      </div>
    </div>
  );
}
