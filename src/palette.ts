/**
 * Renk paletleri.
 *
 * Faz 2'de tek palet var; yöresel paletler, OKLCH kısıt doğrulayıcısı ve abraş
 * Faz 3'te geliyor. Slot sırası sabittir ve grid.ts bu sıraya güvenir:
 *
 *   [0] zemin    %45-60 alan
 *   [1] ana      %18-25
 *   [2] ikincil  %10-15
 *   [3] kontur   %8-12
 *   [4] vurgu    %3-8   — az kullanıldığı için çarpar
 */
import type { Palette } from "./grid.js";

export interface YoreselPalet {
  readonly id: string;
  readonly ad: string;
  readonly renkler: Palette;
}

/** Milas — krem zemin, ince bordür. */
export const MILAS: YoreselPalet = {
  id: "milas",
  ad: "Milas",
  renkler: ["#EDE3CE", "#A8322A", "#C9922E", "#2B2620", "#1F3A5F"],
};

export const PALETLER: readonly YoreselPalet[] = [MILAS];

export const VARSAYILAN_PALET = MILAS;
