/**
 * FNV-1a, 32 bit.
 *
 * Seed zincirinin ilk halkası. Aynı string her ortamda — tarayıcı, Node, SSR —
 * aynı sayıyı verir. `Math.random`, `Date` veya locale'e bağlı hiçbir şey
 * kullanılmaz; bu fonksiyonun çıktısı paketin kamuya açık sözleşmesinin
 * parçasıdır ve değişmesi kırıcı bir değişikliktir.
 */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    // Math.imul: 32 bit taşmalı çarpma. `h * prime` kayan noktaya kaçar.
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
