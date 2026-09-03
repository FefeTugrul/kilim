// Cikti gozle gormek icin: bir HTML sayfasi yazar.
// Kullanim:  npm run onizleme            (varsayilan seed'ler)
//            node scripts/onizleme.mjs furkan ayse mehmet
// Uretilen onizleme.html git'e girmez (.gitignore).
import { writeFileSync } from "node:fs";
import { generateKilim, fnv1a, PALETLER_V1 } from "../dist/index.js";

const seeds = process.argv.slice(2);
if (!seeds.length) {
  seeds.push("furkan", "ayse", "mehmet", "zeynep", "kilim", "FefeTugrul", "deneme", "user@example.com");
}

const yoreler = PALETLER_V1.map((p) => {
  const k = generateKilim("furkan", { style: p.id, size: 190 });
  return `<figure>
    <div class="f">${k.svg}</div>
    <figcaption><b>${p.ad}</b><br>${p.not}</figcaption>
  </figure>`;
}).join("");

const buyuk = seeds
  .map((s) => {
    const k = generateKilim(s, { size: 190 });
    return `<figure>
      <div class="f">${k.svg}</div>
      <figcaption><b>${s}</b><br>${k.name}<br>hash ${fnv1a(s)}</figcaption>
    </figure>`;
  })
  .join("");

const lod = seeds
  .slice(0, 6)
  .map((s) => {
    const a = generateKilim(s, { size: 24 }).svg;
    const b = generateKilim(s, { size: 64 }).svg;
    const c = generateKilim(s, { size: 128 }).svg;
    return `<figure><div class="lod">
      <span class="f s24">${a}</span><span class="f s64">${b}</span><span class="f s128">${c}</span>
    </div><figcaption>${s} &mdash; 24 / 64 / 128 px</figcaption></figure>`;
  })
  .join("");

// Ayni seed iki kez cagrilinca ayni mi? Projenin butun meselesi bu.
const kararli = seeds.every((s) => generateKilim(s).svg === generateKilim(s).svg);

writeFileSync(
  "onizleme.html",
  `<!doctype html><meta charset="utf-8"><title>kilim onizleme</title>
<style>
 body{margin:0;background:#EFE9DC;color:#231D17;padding:40px;
      font:15px/1.6 "Segoe UI",system-ui,sans-serif}
 h1{font-size:1.5rem;margin:0 0 4px}
 h2{font-size:1.05rem;margin:34px 0 14px;font-weight:600}
 p.alt{color:#7A6F5D;margin:0 0 8px;max-width:62ch}
 .r{display:flex;flex-wrap:wrap;gap:26px}
 figure{margin:0;width:190px}
 .f{border:1px solid #D6CBB5;display:inline-block;line-height:0}
 .f svg{display:block}
 .lod{display:flex;align-items:flex-end;gap:8px}
 .s24 svg{width:24px;height:24px}
 .s64 svg{width:64px;height:64px}
 .s128 svg{width:96px;height:96px}
 figcaption{font-family:Consolas,monospace;font-size:.7rem;color:#7A6F5D;
            margin-top:8px;line-height:1.45}
 .ok{color:#2E7D32;font-weight:600}.no{color:#A8322A;font-weight:700}
</style>
<h1>kilim &mdash; Faz 3 onizleme</h1>
<p class="alt">Determinizm kontrolu:
  <span class="${kararli ? "ok" : "no"}">${kararli ? "her seed iki cagrida ayni cikti verdi" : "FARKLI CIKTI - sorun var"}</span>
</p>
<h2>Alti yore &mdash; ayni seed ("furkan"), farkli palet</h2>
<p class="alt">Desen birebir ayni; degisen tek sey renk. Her palet OKLCH kisit
dogrulayicisindan gecti: kroma sinirlari, yasak hue bolgesi, zeminle en az 0.18
algisal parlaklik farki.</p>
<div class="r">${yoreler}</div>
<h2>Seed'e gore &mdash; palet de seed'den seciliyor</h2>
<div class="r">${buyuk}</div>
<h2>Detay kademeleri &mdash; ayni seed, uc boyut</h2>
<p class="alt">24 pikselde izgara seyreliyor, yoksa avatar lapa olurdu.</p>
<div class="r">${lod}</div>
`,
);

console.log(`onizleme.html yazildi (${seeds.length} seed). Acmak icin:  Invoke-Item .\\onizleme.html`);
