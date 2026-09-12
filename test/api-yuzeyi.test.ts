import { describe, expect, it } from "vitest";
import {
  generateKilim,
  type KilimOptions,
  type KilimRegion,
  type KilimResult,
  type KilimSecenek,
  type KilimSonuc,
  type KilimYore,
} from "../src/index.js";

/**
 * Belgelenen adlar da sözleşmenin parçasıdır.
 *
 * İngilizce README `KilimOptions`, `KilimResult` ve `KilimRegion` adlarını
 * belgeliyordu ama paket yalnızca Türkçe adları dışa aktarıyordu. Sonuç:
 * `import type { KilimResult } from "kilim-avatars"` yazan bir TypeScript
 * kullanıcısı, belgedeki ilk satırda derleme hatası alıyordu.
 *
 * Bu dosya iki adın da ayakta kalmasını ve aynı tipi göstermesini kilitler.
 * Asıl denetim `tsc --noEmit` içinde oluyor; buradaki çalışma zamanı testi
 * yalnızca dosyanın vitest tarafından da yüklendiğini garantiliyor.
 */

/** İki tip birebir aynıysa derlenir; değilse tsc burada durur. */
type Ayni<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : never;

const secenekAyni: Ayni<KilimOptions, KilimSecenek> = true;
const sonucAyni: Ayni<KilimResult, KilimSonuc> = true;
const yoreAyni: Ayni<KilimRegion, KilimYore> = true;

describe("genel API yüzeyi", () => {
  it("İngilizce takma adlar Türkçe adlarla aynı tipi gösteriyor", () => {
    expect([secenekAyni, sonucAyni, yoreAyni]).toEqual([true, true, true]);
  });

  it("belgelenen imza gerçekten derleniyor", () => {
    const secenek: KilimOptions = { size: 64, region: "konya" };
    const sonuc: KilimResult = generateKilim("furkan", secenek);
    const bolge: KilimRegion = sonuc.region;

    expect(bolge).toBe("konya");
    expect(sonuc.svg.startsWith("<svg")).toBe(true);
    expect(sonuc.palette).toHaveLength(5);
  });
});
