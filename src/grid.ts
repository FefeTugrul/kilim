/**
 * Hücre ızgarası ve SVG çıkışı.
 *
 * Motifler ASCII satır dizisi olarak yazılır; ızgara onları damgalar; emitter
 * ızgarayı <rect> dizisine çevirir. Hiçbir yerde <path> veya eğri üretilmez —
 * kilim tezgahın ızgarasına hapistir ve bu kısıt sahicidir.
 */

/** Bir hücrenin taşıyabileceği roller. */
export const CELL = {
  ZEMIN: ".",
  ANA: "X",
  VURGU: "O",
  KONTUR: "#",
  IKINCIL: "+",
} as const;

export type Cell = (typeof CELL)[keyof typeof CELL];

/**
 * Hücre en/boy oranı. Atkı yoğunluğu yüzünden gerçek kilimde motifler dikey
 * uzar; kare hücre çıktıyı anında "duvar kağıdı üreteci" gibi gösterir.
 */
export const CELL_ASPECT = 1.15;

export interface Grid {
  readonly w: number;
  readonly h: number;
  /** Satır-öncelikli düz dizi, uzunluk = w * h. */
  readonly cells: Cell[];
}

export function createGrid(w: number, h: number, fill: Cell = CELL.ZEMIN): Grid {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) {
    throw new Error("kilim: ızgara boyutu pozitif tam sayı olmalı");
  }
  return { w, h, cells: new Array<Cell>(w * h).fill(fill) };
}

export function get(g: Grid, x: number, y: number): Cell {
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return CELL.ZEMIN;
  return g.cells[y * g.w + x] as Cell;
}

export function set(g: Grid, x: number, y: number, c: Cell): void {
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return; // taşma sessizce kırpılır
  g.cells[y * g.w + x] = c;
}

/**
 * Bir motifi ızgaraya damgalar. Zemin hücreleri ('.') şeffaftır — altındakini
 * silmez, böylece motifler üst üste bindirilebilir.
 */
export function stamp(g: Grid, pattern: readonly string[], x0: number, y0: number): void {
  for (let r = 0; r < pattern.length; r++) {
    const row = pattern[r] as string;
    for (let c = 0; c < row.length; c++) {
      const ch = row[c] as Cell;
      if (ch === CELL.ZEMIN) continue;
      set(g, x0 + c, y0 + r, ch);
    }
  }
}

/** Dikey ayna: sol yarıyı sağa kopyalar. Kilimde bu eksen her zaman vardır. */
export function mirrorVertical(g: Grid): void {
  const half = Math.floor(g.w / 2);
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < half; x++) {
      set(g, g.w - 1 - x, y, get(g, x, y));
    }
  }
}

/** Beş slotluk palet: [zemin, ana, ikincil, kontur, vurgu]. */
export type Palette = readonly [string, string, string, string, string];

export interface SvgOptions {
  /** Hücre genişliği (px). Yükseklik CELL_ASPECT ile çarpılır. */
  cell?: number;
  /** Satır bazlı zemin rengi geçersiz kılma — abraş için. */
  groundAt?: (row: number) => string;
  /** <title> olarak basılacak erişilebilir ad. */
  label?: string;
}

const ROLE_INDEX: Record<Exclude<Cell, ".">, number> = {
  X: 1,
  "+": 2,
  "#": 3,
  O: 4,
};

const HEX = /^#[0-9A-Fa-f]{6}$/;

/**
 * Renk değerleri atribü içine ham gömülür; bu yüzden emitter'dan geçen her renk
 * doğrulanır. `groundAt` ve palet dışarıdan gelebildiği için güvenlik çağırana
 * emanet edilemez — geçersiz değer sessizce koyu renge düşer.
 */
function renkGuvenli(c: unknown): string {
  return typeof c === "string" && HEX.test(c) ? c : "#000000";
}

/** XML metin düğümü kaçışı — <title> içeriği için. */
function xmlKacis(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Izgarayı bağımsız bir SVG metnine çevirir.
 *
 * Aynı satırda yan yana duran aynı renkli hücreler tek dikdörtgende birleşir;
 * bu, 128 px'lik bir avatarın çıktısını yaklaşık üçte birine indirir. Kenarlar
 * `round((x+1)*cw) - round(x*cw)` ile hesaplanır, böylece komşu dikdörtgenler
 * arasında saç teli kalınlığında boşluk kalmaz.
 */
export function toSvg(g: Grid, palette: Palette, opts: SvgOptions = {}): string {
  const cw = opts.cell ?? 8;
  const ch = cw * CELL_ASPECT;
  const width = round(g.w * cw);
  const height = round(g.h * ch);
  const ground = opts.groundAt ?? (() => palette[0]);
  const renkler = palette.map(renkGuvenli);

  const kenarX = (i: number): number => round(i * cw);
  const kenarY = (i: number): number => round(i * ch);

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
      `width="${width}" height="${height}" shape-rendering="crispEdges" role="img"` +
      (opts.label ? ">" : ' aria-hidden="true">'),
  ];
  if (opts.label) parts.push(`<title>${xmlKacis(opts.label)}</title>`);

  for (let y = 0; y < g.h; y++) {
    const y0 = kenarY(y);
    const yh = kenarY(y + 1) - y0;

    // Her satır kendi zemin şeridini boyar: abraş buradan girer.
    parts.push(
      `<rect x="0" y="${y0}" width="${width}" height="${yh}" fill="${renkGuvenli(ground(y))}"/>`,
    );

    // Aynı renkli yan yana hücreleri tek dikdörtgende birleştir.
    let x = 0;
    while (x < g.w) {
      const c = get(g, x, y);
      if (c === CELL.ZEMIN) {
        x++;
        continue;
      }
      let son = x + 1;
      while (son < g.w && get(g, son, y) === c) son++;
      const x0 = kenarX(x);
      parts.push(
        `<rect x="${x0}" y="${y0}" width="${kenarX(son) - x0}" height="${yh}" ` +
          `fill="${renkler[ROLE_INDEX[c as Exclude<Cell, ".">]] as string}"/>`,
      );
      x = son;
    }
  }

  parts.push("</svg>");
  return parts.join("");
}

/** Kayan nokta kuyruğunu kırpar — çıktının bayt bayt aynı olması için şart. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
