import { PAKET_AD, REPO } from "./paket";

/**
 * Kaynakça.
 *
 * Her künye tek tek doğrulandı; uydurulmuş referans yok. Motif anlamları
 * kültürel içerik ve tek doğrusu yok — bölümün altındaki uyarı notu bunu
 * söylüyor, kaynaklar da onu destekliyor.
 */

export interface Kunye {
  /** Yazar veya kurum. */
  kim: string;
  /** Eserin adı. */
  ne: string;
  /** Basım künyesi. */
  nerede: string;
  /** Serbest erişimli bir bağlantı varsa. */
  bag?: string;
  /** Bağlantının ekranda görünecek hâli. */
  bagAd?: string;
}

export const MOTIF_KAYNAKLARI: readonly Kunye[] = [
  {
    kim: "Naile Rengin Oyman",
    ne: "Bazı Anadolu Kilim Motiflerinin Sembolik Çözümlemesi",
    nerede:
      "Arış, sayı 14 (2019), s. 4–22. Atatürk Kültür Merkezi Başkanlığı. ISSN 1301-255X",
    bag: "https://doi.org/10.34242/akmbaris.2019.119",
    bagAd: "10.34242/akmbaris.2019.119",
  },
  {
    kim: "Güran Erbek",
    ne: "Kilim Catalogue No. 1",
    nerede: "1. baskı, May Selçuk A.Ş., 1998",
  },
  {
    kim: "Belkıs Balpınar, Udo Hirsch",
    ne: "Flatweaves of the Vakıflar Museum Istanbul",
    nerede: "Verlag Uta Hülsey, Wesel, 1982",
  },
];

export const RENK_KAYNAKLARI: readonly Kunye[] = [
  {
    kim: "Björn Ottosson",
    ne: "A perceptual color space for image processing (Oklab)",
    nerede: "2020",
    bag: "https://bottosson.github.io/posts/oklab/",
    bagAd: "bottosson.github.io",
  },
  {
    kim: "W3C",
    ne: "CSS Color Module Level 4 — Lab and LCH",
    nerede: "W3C Candidate Recommendation",
    bag: "https://www.w3.org/TR/css-color-4/#ok-lab",
    bagAd: "w3.org/TR/css-color-4",
  },
];

export const LISANSLAR: readonly Kunye[] = [
  {
    kim: PAKET_AD,
    ne: "MIT",
    nerede: "© Furkan Efe Tuğrul",
    bag: `${REPO}/blob/main/LICENSE`,
    bagAd: "LICENSE",
  },
  {
    kim: "Newsreader",
    ne: "SIL Open Font License 1.1",
    nerede: "© 2020 The Newsreader Project Authors — Production Type",
    bag: "https://github.com/productiontype/Newsreader",
    bagAd: "productiontype/Newsreader",
  },
  {
    kim: "IBM Plex Sans, IBM Plex Mono",
    ne: "SIL Open Font License 1.1",
    nerede: "© 2017–2019 IBM Corp.",
    bag: "https://github.com/IBM/plex",
    bagAd: "IBM/plex",
  },
];
