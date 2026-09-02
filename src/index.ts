/**
 * kilim — herhangi bir metinden deterministik Anadolu kilimi.
 *
 * Faz 1: çekirdek zincir kuruldu (seed → hash → PRNG → ızgara → SVG).
 * Faz 2'de motifler ve dokuma grameri, Faz 3'te yöresel paletler gelecek.
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

import { fnv1a } from "./hash.js";
import { mulberry32 } from "./rng.js";
import { CELL, createGrid, set, toSvg, type Cell, type Palette } from "./grid.js";

/** Geçici palet — Faz 3'te yöresel paletlerle değişecek (Milas). */
const DEFAULT_PALETTE: Palette = ["#EDE3CE", "#A8322A", "#C9922E", "#2B2620", "#1F3A5F"];

const ROLES: readonly Cell[] = [CELL.ANA, CELL.IKINCIL, CELL.KONTUR, CELL.VURGU, CELL.ZEMIN];

/**
 * Faz 1 doğrulama çıktısı: seed'den rastgele doldurulmuş bir ızgara.
 *
 * Henüz kilim değil — zincirin uçtan uca çalıştığını ve aynı seed'in aynı baytı
 * verdiğini gösterir. Faz 2'de yerini `generateKilim` alacak.
 */
export function debugGrid(seed: string, size = 12): string {
  const rng = mulberry32(fnv1a(seed));
  const g = createGrid(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      set(g, x, y, rng.pick(ROLES));
    }
  }
  return toSvg(g, DEFAULT_PALETTE, { cell: 8 });
}
