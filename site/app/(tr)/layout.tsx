import type { Metadata } from "next";
import { SITE_URL } from "@/lib/paket";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "kilim — deterministik Anadolu kilimi avatarları",
  description:
    "Herhangi bir metinden deterministik Anadolu kilimi. Sıfır bağımlılık, saf SVG, SSR uyumlu. Hiçbir şey saklanmaz — desen her seferinde metinden hesaplanır.",
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/tr", languages: { en: "/" } },
};

export default function TrLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
