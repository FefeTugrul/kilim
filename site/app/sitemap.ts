import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/paket";

export const dynamic = "force-static";

/** İki sayfa var: İngilizce kök ve Türkçe /tr. Birbirlerinin alternatifi. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      alternates: { languages: { en: SITE_URL, tr: `${SITE_URL}/tr` } },
    },
    {
      url: `${SITE_URL}/tr`,
      alternates: { languages: { en: SITE_URL, tr: `${SITE_URL}/tr` } },
    },
  ];
}
