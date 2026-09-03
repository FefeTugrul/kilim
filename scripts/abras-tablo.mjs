// palette.ts icindeki ABRAS_TONLARI tablosunu yeniden uretir.
//
// Abras tonlari sabit paletlerden ve sabit kayma tablosundan geliyor, yani
// tamamen derleme zamaninda hesaplanabilir. Boylece OKLCH donusum matematigi
// pakete girmiyor. Bir test tablonun formulle uyumlu kaldigini dogruluyor.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { PALETLER_V1 } from "../dist/index.js";
// oklch.ts ve kaymalar.ts pakete girmiyor; bu betik icin gecici olarak derlenir.
import { execSync } from "node:child_process";
try {
  execSync("npx esbuild src/oklch.ts --outfile=.abras-tmp/oklch.js --format=esm", { stdio: "pipe" });
  execSync("npx esbuild src/kaymalar.ts --outfile=.abras-tmp/kaymalar.js --format=esm", { stdio: "pipe" });
} catch (err) {
  rmSync(".abras-tmp", { recursive: true, force: true });
  console.error("Gecici derleme basarisiz:", err.stderr?.toString() ?? err.message);
  process.exit(1);
}

const temizle = () => rmSync(".abras-tmp", { recursive: true, force: true });
process.on("exit", temizle);
const { parlaklikKaydir, kaymaGuvenliMi } = await import("../.abras-tmp/oklch.js");
const { ABRAS_KAYMALARI } = await import("../.abras-tmp/kaymalar.js");

// Gamut kontrolu: kirpma olursa hue kayar ve abras "boya farki" olmaktan cikar.
for (const p of PALETLER_V1) {
  for (const d of ABRAS_KAYMALARI.flat()) {
    if (d !== 0 && !kaymaGuvenliMi(p.renkler[0], d)) {
      console.error(`GAMUT TASMASI: ${p.id} zemini ${p.renkler[0]} icin ${d} kaymasi kirpiliyor.`);
      process.exit(1);
    }
  }
}

const satirlar = [];
for (const p of PALETLER_V1) {
  const zemin = p.renkler[0];
  const gruplar = ABRAS_KAYMALARI.map(
    (dizi) => "[" + dizi.map((d) => JSON.stringify(d === 0 ? zemin : parlaklikKaydir(zemin, d))).join(", ") + "]",
  );
  satirlar.push(`  ${JSON.stringify(p.id)}: [\n    ${gruplar.join(",\n    ")},\n  ]`);
}

const yol = "src/palette.ts";
const eski = readFileSync(yol, "utf8");
const desen = /export const ABRAS_TONLARI: Record<string, readonly \(readonly string\[\]\)\[\]> = \{[\s\S]*?\n\};/;
if (!desen.test(eski)) {
  console.error("ABRAS_TONLARI tablosu bulunamadi.");
  process.exit(1);
}
const govde = `export const ABRAS_TONLARI: Record<string, readonly (readonly string[])[]> = {\n${satirlar.join(",\n")},\n};`;
const yeni = eski.replace(desen, govde);
if (yeni === eski) {
  console.log("Tablo zaten guncel.");
  process.exit(0);
}
writeFileSync(yol, yeni);
console.log(`${PALETLER_V1.length} palet icin abras tonlari yenilendi.`);
