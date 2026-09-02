import { writeFileSync } from "node:fs";
import { debugGrid, fnv1a } from "../dist/index.js";

const seeds = process.argv.slice(2);
if (!seeds.length) seeds.push("furkan", "ayse", "mehmet", "user@example.com", "kilim", "FefeTugrul");

const cards = seeds.map((s) => {
  const a = debugGrid(s, 12);
  const b = debugGrid(s, 12);
  const ok = a === b;
  return `<figure><div class="f">${a}</div><figcaption><b>${s}</b><br>hash: ${fnv1a(s)}<br><span class="${ok ? "ok" : "no"}">${ok ? "iki cagri ayni OK" : "FARKLI"}</span></figcaption></figure>`;
}).join("");

writeFileSync("onizleme.html", `<!doctype html><meta charset="utf-8"><title>kilim onizleme</title>
<style>body{margin:0;background:#EFE9DC;color:#231D17;padding:40px;font:15px/1.6 "Segoe UI",system-ui,sans-serif}
h1{font-size:1.5rem;margin:0 0 6px}p{color:#8A7F6D;margin:0 0 26px;max-width:60ch}
.r{display:flex;flex-wrap:wrap;gap:28px}figure{margin:0}
.f{border:1px solid #D6CBB5;display:inline-block;line-height:0}.f svg{width:150px;height:172px}
figcaption{font-family:Consolas,monospace;font-size:.74rem;color:#8A7F6D;margin-top:8px;line-height:1.5}
.ok{color:#2E7D32}.no{color:#A8322A;font-weight:700}</style>
<h1>kilim - Faz 1 onizleme</h1>
<p>Her kutu bir metinden uretildi. Ayni metin her zaman ayni resmi vermeli; altindaki isaret bunu kontrol ediyor.</p>
<div class="r">${cards}</div>`, "utf8");

console.log("onizleme.html yazildi.");
