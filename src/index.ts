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
  type KilimYore,
  type YoreselPalet,
} from "./palette.js";

import { fnv1a } from "./hash.js";
import { mulberry32 } from "./rng.js";
import { toSvg } from "./grid.js";
import { doku, kademeSec, type Duzen } from "./grammar.js";
import {
  ABRAS_TONLARI,
  YORE_KIMLIKLERI,
  paletBul,
  PALETLER_V1,
  type KilimYore as _KilimYore,
} from "./palette.js";

type KilimYore = _KilimYore;

export interface KilimSecenek {
  /** Kenar uzunluğu (px). Detay kademesini belirler. Varsayılan 128. */
  size?: number;
  /**
   * Yöresel paleti sabitler. Verilmezse seed'den seçilir.
   *
   * `style` değil `region` deniyor çünkü React'ta `style` her zaman CSS anlamına
   * gelir ve `<Kilim style=... />` iki farklı şeyi kastedemez.
   */
  region?: KilimYore;
  /**
   * SVG'ye `<title>` olarak basılacak erişilebilir ad. Verilmezse `nameEn`
   * kullanılır; `false` verilirse SVG `aria-hidden` olur (avatarın yanında
   * zaten kullanıcı adı yazıyorsa doğru seçim budur).
   */
  label?: string | false;
}

/** Geçersiz `size` sessizce bozuk SVG üretmesin diye tek noktadan sıkıştırılır. */
const MIN_BOYUT = 8;
const MAX_BOYUT = 2048;

/** Palet akışını gramer akışından ayıran sabit (altın oran türevi karıştırıcı). */
const PALET_TOHUMU = 0x9e3779b9;

/**
 * Girdi doğrulaması tek yerde.
 *
 * Sessizce yanlış çalışmak, gürültülü şekilde durmaktan çok daha pahalı: bir
 * yerde `user.id` undefined gelirse etkilenen bütün kullanıcılar AYNI avatarı
 * paylaşır ve kimse fark etmez. Aynı gerekçe boş string için de geçerli —
 * `user.id ?? ""` tam olarak bu arızayı üretir.
 */
function girdiDogrula(seed: unknown, opts: unknown): void {
  if (typeof seed !== "string") {
    throw new TypeError(
      `kilim: seed must be a string, received ${seed === null ? "null" : typeof seed}. ` +
        "If you are passing a user id, make sure it is defined.",
    );
  }
  if (seed === "") {
    throw new TypeError(
      "kilim: seed must not be an empty string. " +
        'An empty seed usually means a fallback like `user.id ?? ""` fired, ' +
        "which would give every affected user the same avatar.",
    );
  }
  if (opts === null || typeof opts !== "object") {
    throw new TypeError(
      `kilim: options must be an object, received ${opts === null ? "null" : typeof opts}.`,
    );
  }

  const { region, label } = opts as { region?: unknown; label?: unknown };

  if (region !== undefined && !YORE_KIMLIKLERI.includes(region as string)) {
    throw new TypeError(
      `kilim: unknown region ${JSON.stringify(region)}. ` +
        `Known regions: ${YORE_KIMLIKLERI.join(", ")}.`,
    );
  }
  if (label !== undefined && label !== false && typeof label !== "string") {
    throw new TypeError(
      `kilim: label must be a string or false, received ${typeof label}. ` +
        "Pass false to hide the avatar from screen readers.",
    );
  }
}

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
  region: KilimYore;
  /** İngilizce ad: "Milas — ram's horn brick-laid, two-tone, sawtooth border". */
  nameEn: string;
  /**
   * Kullanılan beş hex — her çağrıda yeni bir kopya.
   *
   * Daha önce kanonik dizinin referansı dönüyordu; tüketicinin diziyi
   * değiştirmesi o process'teki bütün sonraki çağrıları kalıcı olarak
   * bozuyordu.
   */
  palette: string[];
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
  girdiDogrula(seed, opts);
  const size = boyutDogrula(opts.size);
  const rng = mulberry32(fnv1a(seed));
  const sonuc = doku(rng, kademeSec(size));

  // Palet AYRI bir hash akışından geliyor. Gramere yeni bir karar eklendiğinde
  // palet seçimi kaymasın diye: iki akış birbirinden bağımsız.
  const paletRng = mulberry32((fnv1a(seed) ^ PALET_TOHUMU) >>> 0);
  const palet = opts.region
    ? paletBul(opts.region)
    : paletRng.pick(PALETLER_V1);

  // Ad, gövdeyle önekin birleşimi. Daha önce string'i geri ayrıştırıyorduk ve
  // palet adında " — " geçse eski adın kuyruğu yeni ada sızıyordu.
  const ad = `${palet.ad} — ${sonuc.govde}`;
  // Erişilebilir ad İNGİLİZCE. Ekran okuyucu kullanan bir geliştirici Tokyo'da
  // da olabilir; Türkçe bir cümle ona hiçbir şey anlatmaz. Motif adları kültürel
  // içerik olduğu için `name` alanında Türkçe kalıyor.
  const adEn = `${palet.ad} kilim — ${sonuc.govdeEn}`;
  const etiket = opts.label === false ? undefined : (opts.label ?? adEn);

  // Abraş: zemin renginin parlaklığı bant bant kayar. Tonlar derleme zamanında
  // hesaplandığı için burada renk matematiği yok, sadece tablo okuması var.
  const { bant, dizi } = sonuc.abras;
  const bantRenkleri = ABRAS_TONLARI[palet.id]?.[dizi] ?? [palet.renkler[0]];

  return {
    svg: toSvg(sonuc.grid, palet.renkler, {
      // Genişlik ve yükseklik ayrı ayrı `size`'a oturtulur: çıktı tam kare olur.
      cell: size / sonuc.grid.w,
      cellH: size / sonuc.grid.h,
      groundAt: (satir) =>
        bantRenkleri[Math.floor(satir / bant) % bantRenkleri.length] as string,
      ...(etiket === undefined ? {} : { label: etiket }),
    }),
    name: ad,
    nameEn: adEn,
    motifs: sonuc.motifler,
    region: palet.id,
    palette: [...palet.renkler],
    layout: sonuc.duzen,
  };
}
