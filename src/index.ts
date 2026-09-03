/**
 * kilim — herhangi bir metinden deterministik Anadolu kilimi.
 *
 * Faz 1: seed → hash → PRNG → ızgara → SVG zinciri.
 * Faz 2: motifler ve dokuma grameri.
 * Faz 3'te yöresel paletler, abraş ve renk kısıtları gelecek.
 */

export { fnv1a } from "./hash.js";
export { mulberry32, type Rng } from "./rng.js";
export {
  CELL,
  CELL_ASPECT,
  createGrid,
  get,
  set,
  stamp,
  mirrorVertical,
  toSvg,
  type Cell,
  type Grid,
  type Palette,
  type SvgOptions,
} from "./grid.js";
export {
  TUM_MOTIFLER,
  slotMotifleri,
  motifBoyut,
  dondur90,
  GOZ,
  PITRAK,
  KOCBOYNUZU,
  YILDIZ,
  ELIBELINDE,
  SU_YOLU,
  TESTERE,
  BAKLAVA,
  type Motif,
  type Slot,
} from "./motifs.js";
export {
  doku,
  kademeSec,
  OLCULER,
  type Duzen,
  type Kademe,
  type DokumaSonuc,
} from "./grammar.js";
export {
  PALETLER,
  PALETLER_V1,
  VARSAYILAN_PALET,
  paletBul,
  KONYA,
  MILAS,
  SIVAS,
  YORUK,
  USAK,
  IZNIK,
  type YoreselPalet,
} from "./palette.js";

import { fnv1a } from "./hash.js";
import { mulberry32 } from "./rng.js";
import { CELL_ASPECT, toSvg } from "./grid.js";
import { doku, kademeSec, type Duzen } from "./grammar.js";
import { ABRAS_TONLARI, paletBul, PALETLER_V1 } from "./palette.js";

/** Yöresel palet kimlikleri. */
export type KilimStil = (typeof PALETLER_V1)[number]["id"] | (string & {});

export interface KilimSecenek {
  /** Kenar uzunluğu (px). Detay kademesini belirler. Varsayılan 128. */
  size?: number;
  /**
   * Yöresel paleti sabitler. Verilmezse seed'den seçilir.
   * Geçersiz bir kimlik verilirse sessizce varsayılana düşer.
   */
  style?: KilimStil;
  /**
   * SVG'ye `<title>` olarak basılacak erişilebilir ad. Verilmezse üretilen
   * kilim adı kullanılır; `false` verilirse SVG `aria-hidden` olur (avatarın
   * yanında zaten kullanıcı adı yazıyorsa doğru seçim budur).
   */
  label?: string | false;
}

/** Geçersiz `size` sessizce bozuk SVG üretmesin diye tek noktadan sıkıştırılır. */
const MIN_BOYUT = 8;
const MAX_BOYUT = 2048;

/** Palet akışını gramer akışından ayıran sabit (altın oran türevi karıştırıcı). */
const PALET_TOHUMU = 0x9e3779b9;

function boyutDogrula(ham: unknown): number {
  if (typeof ham !== "number" || !Number.isFinite(ham)) return 128;
  return Math.min(MAX_BOYUT, Math.max(MIN_BOYUT, Math.floor(ham)));
}

export interface KilimSonuc {
  /** Bağımsız SVG metni — hiçbir dış kaynağa bağlı değil. */
  svg: string;
  /** İnsan okuyabilir ad: "göz sıra düzenli, su yolu bordürlü". */
  name: string;
  /** Kullanılan motiflerin Türkçe adları. */
  motifs: readonly string[];
  /** Seçilen yörenin kimliği: 'konya', 'milas', 'sivas', 'yoruk', 'usak', 'iznik'. */
  style: string;
  /** Kullanılan beş hex. */
  palette: readonly string[];
  /** Seçilen zemin düzeni. */
  layout: Duzen;
}

/**
 * Bir metinden kilim üretir. Aynı metin her ortamda aynı sonucu verir.
 *
 * ```ts
 * const k = generateKilim("furkan");
 * k.svg   // '<svg ...>'
 * k.name  // 'göz sıra düzenli, su yolu bordürlü'
 * ```
 */
export function generateKilim(
  seed: string,
  opts: KilimSecenek = {},
): KilimSonuc {
  const size = boyutDogrula(opts.size);
  const rng = mulberry32(fnv1a(String(seed)));
  const sonuc = doku(rng, kademeSec(size));

  // Palet AYRI bir hash akışından geliyor. Gramere yeni bir karar eklendiğinde
  // palet seçimi kaymasın diye: iki akış birbirinden bağımsız.
  const paletRng = mulberry32((fnv1a(String(seed)) ^ PALET_TOHUMU) >>> 0);
  const palet = opts.style ? paletBul(opts.style) : paletRng.pick(PALETLER_V1);

  // Ad, gövdeyle önekin birleşimi. Daha önce string'i geri ayrıştırıyorduk ve
  // palet adında " — " geçse eski adın kuyruğu yeni ada sızıyordu.
  const ad = `${palet.ad} — ${sonuc.govde}`;
  const etiket = opts.label === false ? undefined : (opts.label ?? ad);

  // Abraş: zemin renginin parlaklığı bant bant kayar. Tonlar derleme zamanında
  // hesaplandığı için burada renk matematiği yok, sadece tablo okuması var.
  const { bant, dizi } = sonuc.abras;
  const bantRenkleri = ABRAS_TONLARI[palet.id]?.[dizi] ?? [palet.renkler[0]];

  return {
    svg: toSvg(sonuc.grid, palet.renkler, {
      // Hücre genişliği, yükseklik de tam olarak `size` çıksın diye seçilir:
      // ızgara 1:1.15'i telafi ediyor ama tam bölmüyor.
      cell: size / (sonuc.grid.h * CELL_ASPECT),
      groundAt: (satir) =>
        bantRenkleri[Math.floor(satir / bant) % bantRenkleri.length] as string,
      ...(etiket === undefined ? {} : { label: etiket }),
    }),
    name: ad,
    motifs: sonuc.motifler,
    style: palet.id,
    palette: palet.renkler,
    layout: sonuc.duzen,
  };
}
