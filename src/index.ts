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
export { PALETLER, VARSAYILAN_PALET, type YoreselPalet } from "./palette.js";

import { fnv1a } from "./hash.js";
import { mulberry32 } from "./rng.js";
import { toSvg } from "./grid.js";
import { doku, kademeSec, type Duzen } from "./grammar.js";
import { VARSAYILAN_PALET } from "./palette.js";

export interface KilimSecenek {
  /** Kenar uzunluğu (px). Detay kademesini belirler. Varsayılan 128. */
  size?: number;
}

export interface KilimSonuc {
  /** Bağımsız SVG metni — hiçbir dış kaynağa bağlı değil. */
  svg: string;
  /** İnsan okuyabilir ad: "göz sıra düzenli, su yolu bordürlü". */
  name: string;
  /** Kullanılan motiflerin Türkçe adları. */
  motifs: readonly string[];
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
export function generateKilim(seed: string, opts: KilimSecenek = {}): KilimSonuc {
  const size = opts.size ?? 128;
  const rng = mulberry32(fnv1a(seed));
  const sonuc = doku(rng, kademeSec(size));
  const palet = VARSAYILAN_PALET.renkler;

  return {
    svg: toSvg(sonuc.grid, palet, { cell: size / sonuc.grid.w }),
    name: sonuc.ad,
    motifs: sonuc.motifler,
    palette: palet,
    layout: sonuc.duzen,
  };
}

/**
 * Faz 1'den kalan doğrulama çıktısı: motifsiz, rastgele doldurulmuş ızgara.
 * Zincirin uçtan uca çalıştığını gösterir; üretimde kullanılmaz.
 *
 * @deprecated `generateKilim` kullan. v1.0.0'da kaldırılacak.
 */
export function debugGrid(seed: string, size = 12): string {
  const rng = mulberry32(fnv1a(seed));
  const roller = ["X", "+", "#", "O", "."] as const;
  const g = { w: size, h: size, cells: [] as string[] };
  for (let i = 0; i < size * size; i++) g.cells.push(rng.pick(roller));
  return toSvg(g as never, VARSAYILAN_PALET.renkler, { cell: 8 });
}
