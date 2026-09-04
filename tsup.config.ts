import { defineConfig } from "tsup";

export default defineConfig({
  // İki ayrı giriş noktası: çekirdek herkes için, React yalnızca isteyen için.
  // React'ı ana girişe koymak, kütüphaneyi Node'da veya worker'da kullanan
  // herkese peer bağımlılık gürültüsü yükler.
  entry: ["src/index.ts", "src/react.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  // Kaynak haritalar yayınlanmıyor: 256 kB ile tarball'ın dörtte üçünü tutuyorlardı.
  // Çıktı minify edilmediği için yığın izleri haritasız da okunabilir kalıyor ve
  // haritalar zaten tüketicinin paketine girmiyordu — tek maliyeti indirme boyutuydu.
  sourcemap: false,
  // React bundle'a gömülmez; tüketicinin kendi kopyası kullanılır.
  external: ["react", "react/jsx-runtime"],
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
});
