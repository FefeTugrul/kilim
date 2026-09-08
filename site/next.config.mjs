import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statik dışa aktarım. Site sunucudan hiçbir şey istemiyor — kütüphanenin
  // kendisi de öyle. Her statik barındırıcı bunu olduğu gibi servis eder.
  output: "export",
  /**
   * GitHub Pages proje sayfası siteyi kök yerine `/kilim` altında sunuyor.
   * Değer ortam değişkeninden geliyor ki `next dev` yerelde kökte kalsın —
   * geliştirirken her adresin başına `/kilim` yazmak zorunda kalmayasın.
   *
   * Next `<Link>`, router ve `_next` varlıklarını bu önekle kendisi üretir;
   * elle yazılmış mutlak yol yoksa başka dokunuş gerekmez.
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  /**
   * Her rota kendi klasöründe `index.html` olarak çıksın.
   *
   * Varsayılan dışa aktarım hem `tr.html` hem `tr/` üretiyordu ve statik
   * sunucular `/tr` isteğini ikisinden hangisine bağlayacağına farklı karar
   * veriyor — yerel denemede dizin listesi döndü. Sondaki eğik çizgi bu
   * belirsizliği kaldırıyor: `tr/index.html` her sunucuda tek anlama gelir.
   */
  trailingSlash: true,
  reactStrictMode: true,
  // next dev'in depoya AGENTS.md/CLAUDE.md bırakmasını kapat.
  agentRules: false,
  // Kilim `file:..` ile bağlı; kaynak dosyaları site kökünün dışında kalıyor.
  // `.pathname` yüzde kodlu döner ve Windows'ta "/C:/..." verir; dosya yolu değildir.
  outputFileTracingRoot: fileURLToPath(new URL("..", import.meta.url)),
};

export default nextConfig;
