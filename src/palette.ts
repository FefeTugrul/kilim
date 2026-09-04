/**
 * Yöresel renk paletleri.
 *
 * Stil adları uydurma değil. `bauhaus` veya `marble` estetik kaprisdir; `konya`
 * ve `milas` belgelenebilir dokuma gerçeğidir. Bu, projenin en güçlü ayırt edici
 * kararı — çıktının bir yöresi olması onu "renkli desen üreteci" olmaktan
 * çıkarır.
 *
 * Slot sırası sabittir ve grid.ts bu sıraya güvenir:
 *
 *   [0] zemin    %45-60 alan
 *   [1] ana      %18-25
 *   [2] ikincil  %10-15
 *   [3] kontur   %8-12   — zeminden ayırma işi; koyu zeminde AÇIK olur
 *   [4] vurgu    %3-8    — az kullanıldığı için çarpar
 *
 * Buradaki her hex `src/oklch.ts` içindeki kısıtlardan geçmiştir; bir test bunu
 * her çalıştırmada doğrular. Yeni palet eklemek isteyen aynı kapıdan geçer:
 * kroma sınırları, yasak hue bölgesi, saf siyah/beyaz yasağı ve zeminle en az
 * 0.18 algısal parlaklık farkı.
 */
import type { Palette } from "./grid.js";

/**
 * Yöresel palet kimlikleri — tek gerçeklik kaynağı.
 *
 * `index.ts` bunu yeniden dışa aktarır. Daha önce orada elle yazılmış bir union
 * vardı ve `palet.id as KilimYore` cast'i ile bağlanıyordu; yedinci bir palet
 * eklendiğinde tip yalan söyleyecek, derleyici susacaktı.
 */
export type KilimYore = "konya" | "milas" | "sivas" | "yoruk" | "usak" | "iznik";

export interface YoreselPalet {
  readonly id: KilimYore;
  /** Çıktının adında geçen yöre adı. */
  readonly ad: string;
  /** Paletin karakteri — dokümantasyon ve demo için. */
  readonly not: string;
  readonly renkler: Palette;
}

/** Kırmızı zemin, geniş bordür, krem motif. */
export const KONYA: YoreselPalet = {
  id: "konya",
  ad: "Konya",
  not: "Kırmızı zemin, krem motif, koyu lacivert ve altın vurgu",
  renkler: ["#A8322A", "#EFE5D0", "#132946", "#2E2419", "#D6A340"],
};

/** Krem zemin, ince bordür — en yaygın okunan kilim. */
export const MILAS: YoreselPalet = {
  id: "milas",
  ad: "Milas",
  not: "Krem zemin, ince bordür, hardal ve lacivert",
  renkler: ["#EFE5D0", "#A8322A", "#C9922E", "#2E2419", "#2C5580"],
};

/** Lacivert zemin, yoğun düzen. Koyu zeminde kontur açık olmak zorunda. */
export const SIVAS: YoreselPalet = {
  id: "sivas",
  ad: "Sivas",
  not: "Lacivert zemin, yoğun düzen, açık konturla ayrılmış",
  renkler: ["#1F3A5F", "#C4503F", "#E4D8BE", "#8FA8C4", "#D6A340"],
};

/** Koyu zemin, şeritli, minimal — göçer dokuması. */
export const YORUK: YoreselPalet = {
  id: "yoruk",
  ad: "Yörük",
  not: "Kahve-siyah zemin, az renk, toprak tonları",
  renkler: ["#2E2419", "#A84635", "#E4D8BE", "#A98763", "#C4A177"],
};

/** Soluk palet, seyrek göbek. */
export const USAK: YoreselPalet = {
  id: "usak",
  ad: "Uşak",
  not: "Soluk gri-krem zemin, seyrek göbek, zeytin ve bordo",
  renkler: ["#E0D8CC", "#B4462F", "#5C6B3C", "#6B4A2F", "#7A2B3C"],
};

/**
 * İznik yalnızca bir palet temasıdır — geometri kilim olarak kalır.
 *
 * Çini eğrisel ve serbesttir, kilim açısal ve ızgara kısıtlıdır. İkisini
 * geometride birleştirmek ne kilim ne çini olan bir şey üretir. Bu yüzden
 * İznik'ten sadece pigmentleri alıyoruz: kobalt, turkuaz, mercan.
 */
export const IZNIK: YoreselPalet = {
  id: "iznik",
  ad: "İznik",
  not: "Çini pigmentleri — kobalt, turkuaz, mercan. Geometri kilim kalır.",
  renkler: ["#EBE8DF", "#1F4E9C", "#3E9C9C", "#14243B", "#B4462F"],
};

/**
 * DİKKAT — bu dizinin sırası ve uzunluğu kamuya açık sözleşmedir.
 *
 * Gramer `rng.pick` ile buraya indeksler; sıra değişirse ya da araya eleman
 * girerse mevcut bütün kullanıcıların paleti değişir. Yeni paletler bir sonraki
 * major sürümde eklenir.
 */
export const PALETLER_V1: readonly YoreselPalet[] = Object.freeze([
  KONYA,
  MILAS,
  SIVAS,
  YORUK,
  USAK,
  IZNIK,
].map((p) => Object.freeze({ ...p, renkler: Object.freeze(p.renkler) as Palette })));

/** Bilinen yöre kimlikleri — çalışma zamanı doğrulaması için. */
export const YORE_KIMLIKLERI: readonly string[] = Object.freeze(
  PALETLER_V1.map((p) => p.id),
);

/** Tüm paletler — dokümantasyon ve demo için. */
export const PALETLER: readonly YoreselPalet[] = PALETLER_V1;

export const VARSAYILAN_PALET = MILAS;

/**
 * Kimliğe göre palet bulur; bulunamazsa varsayılana düşer.
 *
 * Alt seviye yardımcı olduğu için gevşek kalıyor. Geçersiz değeri hatayla
 * karşılayan kapı `generateKilim` — tüketicinin gördüğü yüzey orası.
 */
export function paletBul(id: string | undefined): YoreselPalet {
  if (!id) return VARSAYILAN_PALET;
  return PALETLER_V1.find((p) => p.id === id) ?? VARSAYILAN_PALET;
}

/**
 * Abraş tonları — derleme zamanında hesaplanmış hazır tablo.
 *
 * Her yöre için, `src/kaymalar.ts` içindeki her kayma dizisinin zemin rengine
 * uygulanmış hali. Elle yazılmaz: `npm run abras` üretir, bir test de tablonun
 * formülle uyumlu kaldığını doğrular.
 *
 * Neden tablo: kaymalar ve paletler sabit olduğu için sonuç da sabittir. Hazır
 * tutmak, OKLCH dönüşüm matematiğini paketten tamamen çıkarıyor.
 */
export const ABRAS_TONLARI: Record<string, readonly (readonly string[])[]> = {
  "konya": [
    ["#A8322A", "#A8322A", "#A8322A", "#A8322A"],
    ["#A8322A", "#A12B24", "#AD372E", "#A52F27"],
    ["#A8322A", "#B13A31", "#A32D26", "#AB352D"],
    ["#A8322A", "#9E2821", "#A42E26", "#AE382F"],
    ["#AC362D", "#A22C25", "#A8322A", "#B03930"],
  ],
  "milas": [
    ["#EFE5D0", "#EFE5D0", "#EFE5D0", "#EFE5D0"],
    ["#EFE5D0", "#E8DECA", "#F4EAD5", "#ECE2CD"],
    ["#EFE5D0", "#F7EDD8", "#EAE0CB", "#F2E8D3"],
    ["#EFE5D0", "#E5DBC6", "#EBE1CC", "#F5EBD6"],
    ["#F3E9D4", "#E9DFCA", "#EFE5D0", "#F6ECD7"],
  ],
  "sivas": [
    ["#1F3A5F", "#1F3A5F", "#1F3A5F", "#1F3A5F"],
    ["#1F3A5F", "#1A3559", "#233E63", "#1C375C"],
    ["#1F3A5F", "#254166", "#1B365B", "#223D62"],
    ["#1F3A5F", "#173256", "#1C375C", "#243F64"],
    ["#223D62", "#1A355A", "#1F3A5F", "#254065"],
  ],
  "yoruk": [
    ["#2E2419", "#2E2419", "#2E2419", "#2E2419"],
    ["#2E2419", "#291F14", "#32281D", "#2B2217"],
    ["#2E2419", "#342A1F", "#2A2016", "#31261B"],
    ["#2E2419", "#271D12", "#2B2116", "#33281D"],
    ["#31271C", "#2A2015", "#2E2419", "#34291E"],
  ],
  "usak": [
    ["#E0D8CC", "#E0D8CC", "#E0D8CC", "#E0D8CC"],
    ["#E0D8CC", "#D9D1C6", "#E5DDD1", "#DDD5C9"],
    ["#E0D8CC", "#E8E0D4", "#DBD3C7", "#E3DBCF"],
    ["#E0D8CC", "#D6CEC2", "#DCD4C8", "#E6DED2"],
    ["#E4DCD0", "#DAD2C6", "#E0D8CC", "#E7DFD3"],
  ],
  "iznik": [
    ["#EBE8DF", "#EBE8DF", "#EBE8DF", "#EBE8DF"],
    ["#EBE8DF", "#E4E1D8", "#F0EDE4", "#E8E5DC"],
    ["#EBE8DF", "#F3F0E7", "#E6E3DA", "#EEEBE2"],
    ["#EBE8DF", "#E1DED5", "#E7E4DB", "#F1EEE5"],
    ["#EFECE3", "#E5E2D9", "#EBE8DF", "#F2EFE6"],
  ],
};
