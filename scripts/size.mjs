// Bundle boyut bütçesi. CI'da eşiği aşarsa derleme kırılır.
// README'de bir boyut iddiası varsa, bu betik onun kanıtıdır.
import { gzipSync } from "node:zlib";
import { readFileSync, existsSync } from "node:fs";

const BUDGET_KB = 8;
const FILE = "dist/index.js";

if (!existsSync(FILE)) {
  console.error(`${FILE} yok — önce "npm run build" çalıştır.`);
  process.exit(1);
}

const raw = readFileSync(FILE);
const gz = gzipSync(raw, { level: 9 });
const kb = gz.length / 1024;

console.log(`${FILE}`);
console.log(`  ham     ${(raw.length / 1024).toFixed(2)} kB`);
console.log(`  gzip    ${kb.toFixed(2)} kB   (bütçe ${BUDGET_KB} kB)`);

if (kb > BUDGET_KB) {
  console.error(`\nBoyut bütçesi aşıldı: ${kb.toFixed(2)} kB > ${BUDGET_KB} kB`);
  process.exit(1);
}
console.log("\nBütçe içinde.");
