import { YORE_PROFILLERI, type KilimYore } from "kilim-avatars";
import { anatomiCoz } from "./katmanlar";

const YORELER = Object.keys(YORE_PROFILLERI) as KilimYore[];

/**
 * Derleme zamanı denetimi.
 *
 * Anatomi artık kullanıcının yazdığı herhangi bir tohumu çiziyor; tek bir
 * tohumu elle doğrulamak yetmez. Bu tarama `next build` sırasında çalışıyor ve
 * katman yığınının bütün tohumlarda tutarlı çıktığını denetliyor. Kütüphanede
 * ölçüler ya da katman sırası değişirse burada durur.
 *
 * 0.3.0'dan itibaren tarama ALTI YÖRENİN HEPSİNİ dolaşıyor. Sebebi somut:
 * yöre profilleri bordür kalınlığını değiştiriyor ve Milas'ın çarpanı 1.7.
 * Tek yöre taransaydı, Milas'ın kalın bordürünün zemini ezdiği bir kademe
 * fark edilmeden yayına çıkabilirdi.
 */
export function anatomiDenetle(ornekSayisi = 300, piksel = 440): void {
  let kalinSayisi = 0;
  let olcum = 0;

  for (let i = 0; i < ornekSayisi; i++) {
    for (const yore of YORELER) {
      const a = anatomiCoz(`denetim-${i}`, piksel, yore);
      olcum++;
      if (a.selvedgeKalinligi === 2) kalinSayisi++;

      const zemin = a.katmanlar.find((k) => k.id === "zemin");
      if (!zemin) throw new Error("anatomi: zemin katmanı yok");
      if (zemin.dis.w < 4 || zemin.dis.h < 4) {
        throw new Error(
          `anatomi: ${yore} zemin alanı çöktü (${zemin.dis.w}×${zemin.dis.h}). ` +
            "Katman kalınlıkları ızgaraya sığmıyor.",
        );
      }
      // Katmanlar iç içe ve sıralı olmalı.
      for (let n = 2; n < a.katmanlar.length; n++) {
        const d = a.katmanlar[n]!.dis;
        const p = a.katmanlar[n - 1]!.dis;
        if (d.x <= p.x || d.y <= p.y || d.w >= p.w || d.h >= p.h) {
          throw new Error(
            `anatomi: ${yore} "${a.katmanlar[n]!.id}" katmanı bir öncekinin içinde değil.`,
          );
        }
      }
      if (a.abrasSinirlari.length === 0) {
        throw new Error("anatomi: zeminde hiç abraş bant sınırı yok");
      }
    }
  }

  // Gramerde kalın selvedge 0.45 olasılıkla geliyor. Ölçüm bunun çok uzağına
  // düşerse tespit yöntemi bozulmuş demektir.
  const oran = kalinSayisi / olcum;
  if (oran < 0.3 || oran > 0.6) {
    throw new Error(
      `anatomi: kalın selvedge oranı ${(oran * 100).toFixed(0)}% çıktı; ` +
        "beklenen ~45%. Selvedge tespiti artık çalışmıyor olabilir.",
    );
  }
}
