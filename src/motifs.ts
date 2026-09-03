/**
 * Motif kütüphanesi.
 *
 * Her motif bir ASCII satır dizisidir; renderer onu <rect> dizisine çevirir.
 * Bu kısıt bilerek konuldu: kilim dokuma tezgahının ızgarasına hapistir, eğri
 * çizilemez. Kısıt sahici olduğu için çıktı da sahici görünür.
 *
 * Hücre kodları:  . zemin   X ana renk   O vurgu   # kontur   + ikincil
 */

/** Bir motifin kilimde durabileceği yerler. */
export type Slot = "zemin" | "gobek" | "bordur" | "dolgu";

export interface Motif {
  /** Kod içinde kullanılan kimlik. */
  readonly id: string;
  /** Türkçe adı — çıktının adında geçer. */
  readonly ad: string;
  /** İngilizce karşılığı — dokümantasyon için. */
  readonly en: string;
  /** Ne anlama geldiği. Motifin yeri anlamına bağlıdır. */
  readonly anlam: string;
  /** Nerelere girebilir. Gramer bu yetkiye uyar. */
  readonly slots: readonly Slot[];
  readonly grid: readonly string[];
}

function boyut(grid: readonly string[]): { w: number; h: number } {
  return { w: (grid[0] as string).length, h: grid.length };
}

export function motifBoyut(m: Motif): { w: number; h: number } {
  return boyut(m.grid);
}

/** Motifi 90° saat yönünde döndürür — dikey bordür kenarları için. */
export function dondur90(grid: readonly string[]): string[] {
  const { w, h } = boyut(grid);
  const out: string[] = [];
  for (let x = 0; x < w; x++) {
    let satir = "";
    for (let y = h - 1; y >= 0; y--) satir += (grid[y] as string)[x];
    out.push(satir);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Zemin ve göbek motifleri
// ---------------------------------------------------------------------------

export const GOZ: Motif = {
  id: "goz",
  ad: "göz",
  en: "evil eye",
  anlam: "Kem gözden koruma. Kilimin en yaygın ve en eski motifi.",
  slots: ["zemin", "gobek"],
  grid: [
    "..XXX..",
    ".X...X.",
    "X..O..X",
    "X.OOO.X",
    "X..O..X",
    ".X...X.",
    "..XXX..",
  ],
};

export const PITRAK: Motif = {
  id: "pitrak",
  ad: "pıtrak",
  en: "burr",
  anlam: "Nazardan koruma ve bolluk. Dikenli pıtrak kötülüğü uzak tutar.",
  slots: ["zemin", "dolgu"],
  grid: [
    "X..X..X",
    ".X.X.X.",
    "..XXX..",
    "XXXOXXX",
    "..XXX..",
    ".X.X.X.",
    "X..X..X",
  ],
};

export const KOCBOYNUZU: Motif = {
  id: "kocboynuzu",
  ad: "koçboynuzu",
  en: "ram's horn",
  anlam: "Erkeklik, güç ve bereket. Sürünün gücünü temsil eder.",
  slots: ["zemin", "gobek"],
  grid: [
    "XX.....XX",
    "X.X...X.X",
    "X..X.X..X",
    "X..XXX..X",
    ".X.XXX.X.",
    "..XXXXX..",
    "....X....",
  ],
};

export const YILDIZ: Motif = {
  id: "yildiz",
  ad: "yıldız",
  en: "eight-pointed star",
  anlam: "Mutluluk ve doğurganlık. Selçuklu yıldızı olarak da bilinir.",
  slots: ["gobek", "zemin"],
  grid: [
    "....X....",
    "...XXX...",
    "X..XXX..X",
    ".XXXXXXX.",
    "XXXXOXXXX",
    ".XXXXXXX.",
    "X..XXX..X",
    "...XXX...",
    "....X....",
  ],
};

export const ELIBELINDE: Motif = {
  id: "elibelinde",
  ad: "elibelinde",
  en: "hands on hips",
  anlam: "Dişilik, analık ve doğurganlık. Kilimin en figüratif motifi.",
  // Figüratif motif yalnızca zemine girer — bordüre asla.
  slots: ["zemin"],
  grid: [
    ".....X.....",
    "....XXX....",
    ".....X.....",
    "...XXXXX...",
    "X.XXXXXXX.X",
    "XX.XXXXX.XX",
    ".XX.XXX.XX.",
    "..XX.X.XX..",
    "....XXX....",
    "....XXX....",
    "...XXXXX...",
    "..XXXXXXX..",
    ".XXXXXXXXX.",
  ],
};

// ---------------------------------------------------------------------------
// Bordür motifleri — bant motifidir, zeminde tek başına kullanılmaz
// ---------------------------------------------------------------------------

export const SU_YOLU: Motif = {
  id: "suyolu",
  ad: "su yolu",
  en: "running water",
  anlam: "Hayat, süreklilik ve doğurganlık. Bordürde akar.",
  slots: ["bordur"],
  grid: ["X...X", ".X.X.", "..X.."],
};

export const TESTERE: Motif = {
  id: "testere",
  ad: "testere",
  en: "sawtooth",
  anlam: "Koruma. Dişli sıra, kilimin kenarını kötülükten sakınır.",
  slots: ["bordur"],
  grid: ["..X..", ".XXX.", "XXXXX"],
};

export const BAKLAVA: Motif = {
  id: "baklava",
  ad: "baklava",
  en: "diamond",
  anlam: "Bereket. Sıralı baklavalar tarlayı ve ürünü anar.",
  slots: ["bordur"],
  grid: ["..X..", ".X.X.", "..X.."],
};

// ---------------------------------------------------------------------------

export const TUM_MOTIFLER: readonly Motif[] = [
  GOZ,
  PITRAK,
  KOCBOYNUZU,
  YILDIZ,
  ELIBELINDE,
  SU_YOLU,
  TESTERE,
  BAKLAVA,
];

/** Belirli bir slota girebilen motifler. Gramer yalnızca bunları kullanır. */
export function slotMotifleri(slot: Slot): readonly Motif[] {
  return TUM_MOTIFLER.filter((m) => m.slots.includes(slot));
}
