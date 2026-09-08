// test/golden.test.ts icindeki ALTIN tablosunu yeniden uretir.
//
// SADECE bilincli bir kirici degisiklikten sonra calistir. Bu tablo, paketin
// tek vaadini (ayni girdi = ayni cikti) koruyan kilittir; yenilemek "herkesin
// avatari degisti" demektir. Ayrintilar icin test/golden.test.ts basindaki nota bak.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { generateKilim } from "../dist/index.js";

const SEEDS = [
  "a",
  "furkan",
  "ayşe",
  "FefeTugrul",
  "user@example.com",
  "🧶",
  "Ahmet Yılmaz",
  "kilim",
  "0",
];
const SIZES = [24, 64, 128];

// 0.2.0'dan itibaren yore dokumayi da belirliyor. Tek bir yore profilindeki
// agirlik degisikligi yalnizca o yoreyi kirmali ve testte adiyla gorunmeli;
// bu yuzden her yore icin ayrica sabit bir tohum kilitleniyor.
const YORELER = ["konya", "milas", "sivas", "yoruk", "usak", "iznik"];
const YORE_TOHUMU = "furkan";
const YORE_BOYUTLARI = [24, 128];

const ozetle = (seed, opts) =>
  createHash("sha256")
    .update(generateKilim(seed, opts).svg)
    .digest("hex")
    .slice(0, 16);

const satirlar = [];
for (const seed of SEEDS) {
  for (const size of SIZES) {
    const ozet = ozetle(seed, { size });
    satirlar.push(`  ${JSON.stringify(`${seed}|${size}`)}: ${JSON.stringify(ozet)}`);
  }
}
for (const region of YORELER) {
  for (const size of YORE_BOYUTLARI) {
    const ozet = ozetle(YORE_TOHUMU, { size, region });
    satirlar.push(
      `  ${JSON.stringify(`${YORE_TOHUMU}|${size}|${region}`)}: ${JSON.stringify(ozet)}`,
    );
  }
}

const yol = "test/golden.test.ts";
const eski = readFileSync(yol, "utf8");
const desen = /const ALTIN: Record<string, string> = \{[\s\S]*?\n\};/;

if (!desen.test(eski)) {
  console.error(`ALTIN tablosu bulunamadi: ${yol} degismis olabilir.`);
  process.exit(1);
}

const govde = `const ALTIN: Record<string, string> = {\n${satirlar.join(",\n")},\n};`;
const yeni = eski.replace(desen, govde);

if (yeni === eski) {
  console.log("Tablo zaten guncel — cikti degismemis.");
  process.exit(0);
}

writeFileSync(yol, yeni);
console.log(`${satirlar.length} altin deger yenilendi: ${yol}`);
console.log("Bu bir KIRICI degisikliktir. Major surum cikarmayi unutma.");
