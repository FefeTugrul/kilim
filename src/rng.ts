/**
 * Deterministik sözde-rastgele sayı üreteci ve karar yardımcıları.
 *
 * ÖNEMLİ: Çekiliş sırası da sözleşmenin parçasıdır. Üretim kodunda `pick`
 * çağrılarının sırasını değiştirmek, aynı seed için farklı kilim üretir —
 * yani kırıcı bir değişikliktir. Yeni bir karar eklerken sona ekle.
 */
export interface Rng {
  /** [0, 1) aralığında bir sayı. */
  next(): number;
  /** [0, maxExclusive) aralığında tam sayı. */
  int(maxExclusive: number): number;
  /** Diziden bir öğe seçer. Boş dizide hata fırlatır. */
  pick<T>(items: readonly T[]): T;
  /** `p` olasılıkla true. */
  bool(p?: number): boolean;
  /**
   * Ağırlıklı seçim. `weights` uzunluğu `items` ile aynı olmalı.
   * Zemin düzeni seçiminde kullanılır (field-repeat %40, medallion %20 …).
   */
  weighted<T>(items: readonly T[], weights: readonly number[]): T;
}

/** mulberry32 — 32 bitlik durum, hızlı ve iyi dağılımlı. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;

  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (maxExclusive: number): number => Math.floor(next() * maxExclusive);

  const pick = <T,>(items: readonly T[]): T => {
    if (items.length === 0) throw new Error("kilim: cannot pick from an empty array");
    return items[int(items.length)] as T;
  };

  const bool = (p = 0.5): boolean => next() < p;

  const weighted = <T,>(items: readonly T[], weights: readonly number[]): T => {
    if (items.length === 0) throw new Error("kilim: cannot pick from an empty array");
    if (items.length !== weights.length) {
      throw new Error("kilim: items and weights must have the same length");
    }
    let total = 0;
    for (const w of weights) total += w;
    let r = next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i] as number;
      if (r <= 0) return items[i] as T;
    }
    return items[items.length - 1] as T;
  };

  return { next, int, pick, bool, weighted };
}
