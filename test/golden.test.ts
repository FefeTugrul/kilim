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
  "a|24": "b80d22c4b51d9585",
  "a|64": "6fde5e00a21e22a8",
  "a|128": "ff53d5695c9fec92",
  "furkan|24": "312a9df137e5e30c",
  "furkan|64": "dd0a1b94f62063f4",
  "furkan|128": "007de1a176d8c180",
  "ayşe|24": "e55d59517c109525",
  "ayşe|64": "4bee87765dc45d8b",
  "ayşe|128": "06aaa830b9e300ef",
  "FefeTugrul|24": "eab34637c6e38aed",
  "FefeTugrul|64": "94714566d5247bb5",
  "FefeTugrul|128": "fa50ffe434adfcb0",
  "user@example.com|24": "fa1565490775c2c4",
  "user@example.com|64": "42b5c48b245008ab",
  "user@example.com|128": "ac0a6cf5cdc2a034",
  "🧶|24": "c57925ebf0a20850",
  "🧶|64": "6473c97e500b289d",
  "🧶|128": "53ec6519f86efe77",
  "Ahmet Yılmaz|24": "514297b1a829a53a",
  "Ahmet Yılmaz|64": "dd5f8c2f70308bd5",
  "Ahmet Yılmaz|128": "8b4899e43ed2b289",
  "kilim|24": "0639a468ae64256a",
  "kilim|64": "ef6193198d8a430f",
  "kilim|128": "08992e2677c88152",
  "0|24": "8ac919d7b29489d4",
  "0|64": "e1b1497a38375763",
  "0|128": "300fa5f16b6f8901",
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
    const boyutlar = new Set(
      Object.keys(ALTIN).map((a) => a.slice(a.lastIndexOf("|") + 1)),
    );
    expect(boyutlar).toContain("24");
    expect(boyutlar).toContain("64");
    expect(boyutlar).toContain("128");
  });
});

describe("motif aday listeleri (sözleşme)", () => {
  // Üretim yolu donmuş `_V1` listelerini kullanır; `slotMotifleri` yalnızca
  // dokümantasyon içindir. İkisi ayrışırsa dokümantasyon yalan söylüyor demektir.
  const esler: ReadonlyArray<
    readonly [
      string,
      readonly { id: string }[],
      "zemin" | "gobek" | "bordur" | "dolgu",
    ]
  > = [
    ["zemin", ZEMIN_ADAYLARI_V1, "zemin"],
    ["gobek", GOBEK_ADAYLARI_V1, "gobek"],
    ["bordur", BORDUR_ADAYLARI_V1, "bordur"],
    ["dolgu", DOLGU_ADAYLARI_V1, "dolgu"],
  ];

  for (const [ad, donmus, slot] of esler) {
    it(`${ad}: donmuş liste ile slot yetkisi aynı kümeyi verir`, () => {
      const a = [...donmus].map((m) => m.id).sort();
      const b = slotMotifleri(slot)
        .map((m) => m.id)
        .sort();
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
