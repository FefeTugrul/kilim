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

const satirlar = [];
for (const seed of SEEDS) {
  for (const size of SIZES) {
    const ozet = createHash("sha256")
      .update(generateKilim(seed, { size }).svg)
      .digest("hex")
      .slice(0, 16);
    satirlar.push(`  ${JSON.stringify(`${seed}|${size}`)}: ${JSON.stringify(ozet)}`);
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
