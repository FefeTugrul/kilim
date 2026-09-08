/**
 * Favicon ve paylaşım görselini üretir.
 *
 * İkisi de kütüphanenin kendi çıktısı: favicon 32 pikselde çizilmiş bir kilim
 * (yani `kucuk` kademe — tam da bir sekmede görüneceği hâli), paylaşım görseli
 * de aynı tohumun altı yöresel varyantı.
 *
 * Çıktılar depoya işleniyor; bu betik ancak tasarım ya da tohum değişince
 * yeniden çalıştırılır:
 *
 *     node scripts/gorseller.mjs
 *
 * PNG için Playwright'in Chromium'unu kullanıyor. Kurulu değilse:
 *     npx playwright install chromium
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKilim, PALETLER } from "kilim-avatars";
import pkg from "kilim-avatars/package.json" with { type: "json" };

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOHUM = "kilim";

const KAGIT = "#f6f3ec";
const MUREKKEP = "#1d1916";
const SOLUK = "#6b6257";
const CIZGI = "#d8d1c4";

// --- favicon ---------------------------------------------------------------

const simge = generateKilim(TOHUM, {
  size: 32,
  region: "konya",
  label: "kilim",
});
writeFileSync(join(KOK, "app/icon.svg"), simge.svg);
console.log("app/icon.svg yazıldı");

// --- paylaşım görseli ------------------------------------------------------

const BOY = 150;
const kilimler = PALETLER.map(
  (p) => generateKilim(TOHUM, { size: BOY, region: p.id, label: false }).svg,
);

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:N;src:url(file://${KOK}/node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2)format('woff2');}
  @font-face{font-family:P;src:url(file://${KOK}/node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2)format('woff2');}
  @font-face{font-family:M;src:url(file://${KOK}/node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2)format('woff2');}
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:${KAGIT};color:${MUREKKEP};
       padding:64px;display:flex;flex-direction:column;justify-content:space-between}
  h1{font-family:N,serif;font-weight:400;font-size:76px;line-height:1;letter-spacing:-.015em}
  p{font-family:P,sans-serif;font-size:28px;line-height:1.4;color:${SOLUK};max-width:34ch;margin-top:22px}
  .serit{display:flex;gap:34px;padding-top:34px;border-top:1px solid ${CIZGI}}
  .serit svg{display:block}
  .alt{display:flex;justify-content:space-between;align-items:baseline;
       font-family:M,monospace;font-size:19px;color:${SOLUK};margin-top:26px}
</style>
<h1>kilim</h1>
<p>Deterministic Anatolian kilim avatars from any string.</p>
<div>
  <div class="serit">${kilimler.join("")}</div>
  <div class="alt"><span>npm install ${pkg.name}</span><span>github.com/FefeTugrul/kilim</span></div>
</div>`;

const { chromium } = await import("playwright");
// Hazır bir Chromium varsa (CI, konteyner) yolunu KILIM_CHROMIUM ile ver.
const tarayici = await chromium.launch(
  process.env.KILIM_CHROMIUM ? { executablePath: process.env.KILIM_CHROMIUM } : {},
);
const sayfa = await tarayici.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await sayfa.setContent(html, { waitUntil: "networkidle" });
// Yazı tipleri yüklenmeden kare alınırsa metin yedek fontla basılıyor.
await sayfa.evaluate(() => document.fonts.ready);
await sayfa.waitForTimeout(300);
const png = await sayfa.screenshot({ type: "png" });
await tarayici.close();

for (const yol of [
  "app/(en)/opengraph-image.png",
  "app/(en)/twitter-image.png",
  "app/(tr)/tr/opengraph-image.png",
  "app/(tr)/tr/twitter-image.png",
]) {
  mkdirSync(dirname(join(KOK, yol)), { recursive: true });
  writeFileSync(join(KOK, yol), png);
  console.log(`${yol} yazıldı`);
}
