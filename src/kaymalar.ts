/**
 * Abraş kayma dizileri.
 *
 * Elle seçildi çünkü rastgele gürültü "el yapımı" değil "bozuk ekran" gibi
 * görünüyor: gerçek abraş, dokumacının yeni bir yumak açtığı yerde başlayan ve
 * bir süre devam eden bir kaymadır.
 *
 * Bu değerler doğrudan çalıştırılmaz — `scripts/abras-tablo.mjs` bunları
 * paletlere uygulayıp `palette.ts` içindeki hazır hex tablosunu üretir. Böylece
 * OKLCH dönüşüm matematiği pakete girmez.
 */
export const ABRAS_KAYMALARI: readonly (readonly number[])[] = [
  [0, 0, 0, 0],
  [0, -0.02, 0.015, -0.01],
  [0, 0.025, -0.015, 0.01],
  [0, -0.03, -0.012, 0.018],
  [0.012, -0.018, 0, 0.022],
];
