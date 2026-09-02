/**
 * Hücre ızgarası ve SVG çıkışı.
 *
 * Motifler ASCII satır dizisi olarak yazılır; ızgara onları damgalar; emitter
 * ızgarayı `<rect>` dizisine çevirir. Hiçbir yerde `<path>` veya eğri üretilmez —
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
  if (w <= 0 || h <= 0) throw new Error("kilim: ızgara boyutu pozitif olmalı");
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
  /** Satır bazlı zemin rengi geçersiz kılma — abraş için (Faz 3). */
  groundAt?: (row: number) => string;
}

const ROLE_INDEX: Record<Exclude<Cell, ".">, number> = {
  X: 1,
  "+": 2,
  "#": 3,
  O: 4,
};

/** Izgarayı bağımsız bir SVG metnine çevirir. */
export function toSvg(g: Grid, palette: Palette, opts: SvgOptions = {}): string {
  const cw = opts.cell ?? 8;
  const ch = cw * CELL_ASPECT;
  const width = round(g.w * cw);
  const height = round(g.h * ch);
  const ground = opts.groundAt ?? (() => palette[0]);

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
      `width="${width}" height="${height}" shape-rendering="crispEdges" role="img">`,
  ];

  for (let y = 0; y < g.h; y++) {
    // Her satır kendi zemin şeridini boyar: abraş buradan girer.
    parts.push(
      `<rect x="0" y="${round(y * ch)}" width="${width}" height="${round(ch)}" fill="${ground(y)}"/>`,
    );
    for (let x = 0; x < g.w; x++) {
      const c = get(g, x, y);
      if (c === CELL.ZEMIN) continue;
      const fill = palette[ROLE_INDEX[c as Exclude<Cell, ".">]] as string;
      parts.push(
        `<rect x="${round(x * cw)}" y="${round(y * ch)}" ` +
          `width="${round(cw)}" height="${round(ch)}" fill="${fill}"/>`,
      );
    }
  }

  parts.push("</svg>");
  return parts.join("");
}

/** Kayan nokta kuyruğunu kırpar — çıktının bayt bayt aynı olması için şart. */
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
