import pkg from "kilim-avatars/package.json";

/**
 * Paketin kimliği tek yerden, paketin kendisinden okunuyor.
 *
 * npm'de `kilim` adı benzerlik filtresine takıldı ve paket `kilim-avatars`
 * oldu; site bunu üç ayrı yerde elle yazdığı için hepsi birden yanlışa düştü.
 * Ad, sürüm ve kurulum komutu artık `package.json`'dan geliyor — exports
 * haritası `./package.json` yolunu zaten açıyor, yani site kütüphanenin
 * kaynağına uzanmadan, kurallara uyarak okuyor.
 *
 * Proje adı ile paket adı ayrı şeyler: depo ve marka `kilim`, npm'deki paket
 * `kilim-avatars`. Sayfada kurulumdan söz eden her yer paket adını, kimlikten
 * söz eden her yer proje adını kullanır.
 */
export const PAKET_AD = pkg.name;
export const SURUM = pkg.version;
export const KURULUM = `npm install ${PAKET_AD}`;
export const NPM_URL = `https://www.npmjs.com/package/${PAKET_AD}`;

export const REPO_KISA = "github.com/FefeTugrul/kilim";
export const REPO = `https://${REPO_KISA}`;

/**
 * Sitenin kendi adresi. `metadataBase` bunu kullanıyor: og:image ve canonical
 * mutlak adres ister. Yayın adresi `NEXT_PUBLIC_SITE_URL` ile veriliyor
 * (bkz. .github/workflows/pages.yml); yoksa GitHub Pages adresine düşer.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fefetugrul.github.io/kilim";
