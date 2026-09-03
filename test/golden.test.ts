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
  "|24": "fe4162f786e0cb56",
  "|64": "2300ba4a2df896f9",
  "|128": "1a4f9426f7cce3f7",
  "a|24": "05b8a13c2f4b6774",
  "a|64": "ecccef523e7ed475",
  "a|128": "eba6dbf07452c012",
  "furkan|24": "f804442a6deacf7c",
  "furkan|64": "21223e3be7e81c0b",
  "furkan|128": "4a729e2b774e28cd",
  "ayşe|24": "442da5333ea938d6",
  "ayşe|64": "ebb5c989eab02cd3",
  "ayşe|128": "8c3589453efea53d",
  "FefeTugrul|24": "7059ba097021ffbe",
  "FefeTugrul|64": "8dd2577bca2d0248",
  "FefeTugrul|128": "4958610f6fc7992c",
  "user@example.com|24": "ac98c6c8984e414c",
  "user@example.com|64": "eb4aa671c064e8bb",
  "user@example.com|128": "bc1eb8c7b053b60a",
  "🧶|24": "180fe6ab0800f819",
  "🧶|64": "ad555d1145c93d3a",
  "🧶|128": "461a8adac6fb0a8e",
  "Ahmet Yılmaz|24": "75f0fe9058d17555",
  "Ahmet Yılmaz|64": "511dac1b06c824af",
  "Ahmet Yılmaz|128": "bce7679cc3dc027f",
  "kilim|24": "0c4d436772438101",
  "kilim|64": "a6729aaf6798b93d",
  "kilim|128": "a70c2fc8142afbf1",
  "0|24": "0aaa686e93f401c8",
  "0|64": "b1e93d605589c6bb",
  "0|128": "19292dbd21701fdf",
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
