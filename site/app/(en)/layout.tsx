import type { Metadata } from "next";
import { SITE_URL } from "@/lib/paket";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "kilim — deterministic Anatolian kilim avatars",
  description:
    "Deterministic Anatolian kilim avatars from any string. Zero dependencies, pure SVG, SSR-safe. Nothing is stored — the pattern is computed from the text every time.",
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/", languages: { tr: "/tr" } },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
