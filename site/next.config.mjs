import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statik dışa aktarım. Site sunucudan hiçbir şey istemiyor — kütüphanenin
  // kendisi de öyle. Vercel bunu olduğu gibi servis eder.
  output: "export",
  reactStrictMode: true,
  // next dev'in depoya AGENTS.md/CLAUDE.md bırakmasını kapat.
  agentRules: false,
  // Kilim `file:..` ile bağlı; kaynak dosyaları site kökünün dışında kalıyor.
  // `.pathname` yüzde kodlu döner ve Windows'ta "/C:/..." verir; dosya yolu değildir.
  outputFileTracingRoot: fileURLToPath(new URL("..", import.meta.url)),
};

export default nextConfig;
