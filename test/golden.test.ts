import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { generateKilim } from "../src/index.js";
import {
  BORDUR_ADAYLARI_V1,
  DOLGU_ADAYLARI_V1,
  GOBEK_ADAYLARI_V1,
  ZEMIN_ADAYLARI_V1,
  slotMotifleri,
} from "../src/motifs.js";

/**
 * ALTIN TESTLER — paketin tek vaadini koruyan kilit.
 *
 * Aşağıdaki hash'ler, `seed|size` çiftlerinin ürettiği SVG'nin sha256'sının ilk
 * 16 hanesidir. Bu test kırıldığında bir HATA bulmuş olmazsın: mevcut bütün
 * kullanıcıların avatarını değiştiren KIRICI bir değişiklik yapmış olursun.
 *
 * Kırıldığında yapılacak tek doğru şey, değişikliğin bilinçli olup olmadığına
 * karar vermektir:
 *   - Bilinçsizse  → değişikliği geri al.
 *   - Bilinçliyse  → major sürüm çıkar ve bu tabloyu yenile.
 *
 * Tabloyu yenileme komutu README'de "Stability" başlığı altındadır.
 *
 * Bu testin var olma sebebi somut: çekiliş sırasını değiştiren ya da motif
 * listesine ekleme yapan bir düzenleme, diğer 36 testin hepsini geçerek 200
 * seed'in 135'inin çıktısını sessizce değiştirebiliyordu.
 */
const ALTIN: Record<string, string> = {
  "|24": "624c02cbc37948de",
  "|64": "e0ee2400f64bab32",
  "|128": "a7ad139975bb3422",
  "a|24": "580239ff4c367318",
  "a|64": "486fad7f2f3d27de",
  "a|128": "8d420cda5a2111ed",
  "furkan|24": "77278fe5642a2ef3",
  "furkan|64": "c474446c3bd0aeb5",
  "furkan|128": "6148570f327ff849",
  "ayşe|24": "6394c0d9b6daea26",
  "ayşe|64": "cf206b9a28ebe0d9",
  "ayşe|128": "d113ae9f543f3f2d",
  "FefeTugrul|24": "19a52f28304e4a06",
  "FefeTugrul|64": "86fdd4d55c1023f7",
  "FefeTugrul|128": "47dc3fca6d444d62",
  "user@example.com|24": "2ab0cd4b5c5bcd19",
  "user@example.com|64": "de177b622c671655",
  "user@example.com|128": "c346f36ac1bf77b2",
  "🧶|24": "ce16b97f2c87ce54",
  "🧶|64": "a19c92b566338953",
  "🧶|128": "b62c5cd85e7065e6",
  "Ahmet Yılmaz|24": "74502aee5d3e9676",
  "Ahmet Yılmaz|64": "1f90d6acdc737e49",
  "Ahmet Yılmaz|128": "42cb5e012a9e77d2",
  "kilim|24": "49712bcf9c1cbba7",
  "kilim|64": "caed1302c3e19506",
  "kilim|128": "0d70d566dc57f00f",
  "0|24": "dc19727d4ad8ac7f",
  "0|64": "b98459abfda58045",
  "0|128": "d5d72ca334522570",
};

function ozet(seed: string, size: number): string {
  return createHash("sha256")
    .update(generateKilim(seed, { size }).svg)
    .digest("hex")
    .slice(0, 16);
}

describe("altın çıktılar (bayt kararlılığı)", () => {
  for (const [anahtar, beklenen] of Object.entries(ALTIN)) {
    const ayrac = anahtar.lastIndexOf("|");
    const seed = anahtar.slice(0, ayrac);
    const size = Number(anahtar.slice(ayrac + 1));
    it(`${JSON.stringify(seed)} @ ${size}px değişmedi`, () => {
      expect(
        ozet(seed, size),
        "Bu bir hata değil, KIRICI DEĞİŞİKLİK uyarısıdır — dosyanın başındaki nota bak.",
      ).toBe(beklenen);
    });
  }

  it("tablo her kademeden en az bir örnek içerir", () => {
    const boyutlar = new Set(Object.keys(ALTIN).map((a) => a.slice(a.lastIndexOf("|") + 1)));
    expect(boyutlar).toContain("24");
    expect(boyutlar).toContain("64");
    expect(boyutlar).toContain("128");
  });
});

describe("motif aday listeleri (sözleşme)", () => {
  // Üretim yolu donmuş `_V1` listelerini kullanır; `slotMotifleri` yalnızca
  // dokümantasyon içindir. İkisi ayrışırsa dokümantasyon yalan söylüyor demektir.
  const esler: ReadonlyArray<readonly [string, readonly { id: string }[], "zemin" | "gobek" | "bordur" | "dolgu"]> = [
    ["zemin", ZEMIN_ADAYLARI_V1, "zemin"],
    ["gobek", GOBEK_ADAYLARI_V1, "gobek"],
    ["bordur", BORDUR_ADAYLARI_V1, "bordur"],
    ["dolgu", DOLGU_ADAYLARI_V1, "dolgu"],
  ];

  for (const [ad, donmus, slot] of esler) {
    it(`${ad}: donmuş liste ile slot yetkisi aynı kümeyi verir`, () => {
      const a = [...donmus].map((m) => m.id).sort();
      const b = slotMotifleri(slot).map((m) => m.id).sort();
      expect(
        a,
        `${ad} listesi ile motif slot'ları ayrışmış: ya motifs.ts'teki slot alanını ya da _V1 listesini güncelle`,
      ).toEqual(b);
    });
  }

  it("donmuş listelerin uzunluğu sabittir", () => {
    // Uzunluk değişirse rng.pick indeksleri kayar ve herkesin avatarı değişir.
    expect(ZEMIN_ADAYLARI_V1).toHaveLength(5);
    expect(GOBEK_ADAYLARI_V1).toHaveLength(3);
    expect(BORDUR_ADAYLARI_V1).toHaveLength(3);
    expect(DOLGU_ADAYLARI_V1).toHaveLength(1);
  });
});
