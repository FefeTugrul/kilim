// Bundle boyut butcesi. CI'da esik asilirsa derleme kirilir.
//
// Ham dosya boyutunu degil, TUKETICININ GERCEKTE ODEDIGI bedeli olcuyoruz:
// giris noktasi esbuild ile paketlenip minify edilir, sonra gzip'lenir. tsup
// ESM ciktisini ortak bir chunk'a bolduğu icin tek dosyaya bakmak yaniltiyordu
// (dist/index.js yalnizca yeniden disa aktarim, 0.3 kB).
import { buildSync } from "esbuild";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

/** Giris noktasi -> gzip butcesi (kB). React harici tutulur, peer bagimlilik. */
const BUTCELER = [
  { giris: "dist/index.js", butce: 8, ad: "kilim" },
  { giris: "dist/react.js", butce: 9, ad: "kilim/react" },
];

let hata = false;
const gecici = mkdtempSync(join(tmpdir(), "kilim-size-"));

try {
  for (const { giris, butce, ad } of BUTCELER) {
    if (!existsSync(giris)) {
      console.error(`${giris} yok — once "npm run build" calistir.`);
      process.exit(1);
    }

    const cikti = join(gecici, `${ad.replace("/", "-")}.js`);
    buildSync({
      entryPoints: [giris],
      bundle: true,
      minify: true,
      format: "esm",
      platform: "browser",
      external: ["react", "react/jsx-runtime"],
      outfile: cikti,
    });

    const ham = readFileSync(cikti);
    const kb = gzipSync(ham, { level: 9 }).length / 1024;
    const isaret = kb > butce ? "ASILDI" : "tamam";

    console.log(
      `${ad.padEnd(12)} ${(ham.length / 1024).toFixed(2).padStart(6)} kB ham` +
        `   ${kb.toFixed(2).padStart(5)} kB gzip   (butce ${butce} kB)  ${isaret}`,
    );

    if (kb > butce) hata = true;
  }
} finally {
  rmSync(gecici, { recursive: true, force: true });
}

if (hata) {
  console.error("\nBoyut butcesi asildi.");
  process.exit(1);
}
console.log("\nButce icinde.");
