import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { generateKilim } from "../src/index.js";
import {
  BORDUR_ADAYLARI_V1,
  DOLGU_ADAYLARI_V1,
  GOBEK_ADAYLARI_V1,
  ZEMIN_ADAYLARI_V1,
  BORDUR_ADAYLARI_V2,
  DOLGU_ADAYLARI_V2,
  GOBEK_ADAYLARI_V2,
  ZEMIN_ADAYLARI_V2,
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
  "a|24": "9d01cdcb9e812747",
  "a|64": "8711e7bcfcabb631",
  "a|128": "b664b53087810c56",
  "furkan|24": "ad16280380b96e1f",
  "furkan|64": "561f2e24a0760c2f",
  "furkan|128": "a0f3099da5790bc4",
  "ayşe|24": "2537840c07d75ec4",
  "ayşe|64": "6810133e0047fa96",
  "ayşe|128": "ba83ae1ca61f21e9",
  "FefeTugrul|24": "6e3cdca8bdac1d59",
  "FefeTugrul|64": "8f3270e63943982b",
  "FefeTugrul|128": "089bfb923c0ff4d0",
  "user@example.com|24": "8cb056ebc1a7f3e3",
  "user@example.com|64": "f921cb9c3895f55b",
  "user@example.com|128": "1300547531137a5d",
  "🧶|24": "4eea2d13fad61d60",
  "🧶|64": "73f215be1203ae85",
  "🧶|128": "fa790d6563457173",
  "Ahmet Yılmaz|24": "514297b1a829a53a",
  "Ahmet Yılmaz|64": "dd5f8c2f70308bd5",
  "Ahmet Yılmaz|128": "8b4899e43ed2b289",
  "kilim|24": "a2d6a1cf3f253e5b",
  "kilim|64": "9be0d512edfa7fae",
  "kilim|128": "6b89bcb4b772873b",
  "0|24": "197d2e27c6f78372",
  "0|64": "a79ff227bb9d1041",
  "0|128": "83e1e4923b00bb89",
  "furkan|24|konya": "35e6ff158697a813",
  "furkan|128|konya": "651190b99d2399d3",
  "furkan|24|milas": "ad16280380b96e1f",
  "furkan|128|milas": "a0f3099da5790bc4",
  "furkan|24|sivas": "9abca76b6c40ed10",
  "furkan|128|sivas": "37150c74ceb83d02",
  "furkan|24|yoruk": "e33fcef173d1ef9b",
  "furkan|128|yoruk": "a3e599b10546290d",
  "furkan|24|usak": "799f4366843a3a73",
  "furkan|128|usak": "5a6144678b69cbaa",
  "furkan|24|iznik": "56f1be7e210bd7ad",
  "furkan|128|iznik": "ad169e5e0f780851",
};

function ozet(seed: string, size: number, yore?: string): string {
  return createHash("sha256")
    .update(
      generateKilim(
        seed,
        yore === undefined
          ? { size }
          : { size, region: yore as "konya" },
      ).svg,
    )
    .digest("hex")
    .slice(0, 16);
}

/**
 * Anahtar biçimi: `seed|size` ya da `seed|size|yore`.
 *
 * Seed'in kendisinde `|` geçebilir, o yüzden SONDAN ayrıştırılır. Yöre alanı
 * 0.2.0'da eklendi: yöre profilleri artık dokumayı da belirlediği için tek bir
 * profildeki ağırlık değişikliği yalnızca o yöreyi kırmalı ve testte adıyla
 * görünmeli.
 */
function anahtarAyristir(anahtar: string): {
  seed: string;
  size: number;
  yore?: string;
} {
  const parca = anahtar.split("|");
  const sonuncu = parca[parca.length - 1] as string;
  if (Number.isNaN(Number(sonuncu))) {
    const yore = parca.pop() as string;
    const size = Number(parca.pop());
    return { seed: parca.join("|"), size, yore };
  }
  const size = Number(parca.pop());
  return { seed: parca.join("|"), size };
}

describe("altın çıktılar (bayt kararlılığı)", () => {
  for (const [anahtar, beklenen] of Object.entries(ALTIN)) {
    const { seed, size, yore } = anahtarAyristir(anahtar);
    const etiket = yore === undefined ? "" : ` (${yore})`;
    it(`${JSON.stringify(seed)} @ ${size}px${etiket} değişmedi`, () => {
      expect(
        ozet(seed, size, yore),
        "Bu bir hata değil, KIRICI DEĞİŞİKLİK uyarısıdır — dosyanın başındaki nota bak.",
      ).toBe(beklenen);
    });
  }

  it("tablo her kademeden en az bir örnek içerir", () => {
    const boyutlar = new Set(
      Object.keys(ALTIN).map((a) => String(anahtarAyristir(a).size)),
    );
    expect(boyutlar).toContain("24");
    expect(boyutlar).toContain("64");
    expect(boyutlar).toContain("128");
  });

  it("tablo altı yörenin hepsini kilitler", () => {
    const yoreler = new Set(
      Object.keys(ALTIN)
        .map((a) => anahtarAyristir(a).yore)
        .filter((y): y is string => y !== undefined),
    );
    for (const y of ["konya", "milas", "sivas", "yoruk", "usak", "iznik"]) {
      expect(yoreler, `${y} altın tabloda yok`).toContain(y);
    }
  });
});

describe("motif aday listeleri (sözleşme)", () => {
  // Üretim yolu 0.2.0'dan itibaren `_V2` listelerini kullanır; `slotMotifleri`
  // yalnızca dokümantasyon içindir. İkisi ayrışırsa dokümantasyon yalan
  // söylüyor demektir — ya slot alanı ya da liste güncellenmemiştir.
  const esler: ReadonlyArray<
    readonly [
      string,
      readonly { id: string }[],
      "zemin" | "gobek" | "bordur" | "dolgu",
    ]
  > = [
    ["zemin", ZEMIN_ADAYLARI_V2, "zemin"],
    ["gobek", GOBEK_ADAYLARI_V2, "gobek"],
    ["bordur", BORDUR_ADAYLARI_V2, "bordur"],
    ["dolgu", DOLGU_ADAYLARI_V2, "dolgu"],
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

  it("donmuş _V1 listelerinin uzunluğu sabittir", () => {
    // _V1 artık üretimde kullanılmıyor ama 0.1.0'ın sözleşmesi olarak duruyor:
    // uzunluğu değişirse o sürümün altın çıktıları yeniden üretilemez olur.
    expect(ZEMIN_ADAYLARI_V1).toHaveLength(5);
    expect(GOBEK_ADAYLARI_V1).toHaveLength(3);
    expect(BORDUR_ADAYLARI_V1).toHaveLength(3);
    expect(DOLGU_ADAYLARI_V1).toHaveLength(1);
  });

  it("üretim _V2 listelerinin uzunluğu sabittir", () => {
    // Uzunluk değişirse rng.weighted indeksleri kayar ve herkesin avatarı
    // değişir — yani yeni bir major sürüm gerekir.
    expect(ZEMIN_ADAYLARI_V2).toHaveLength(11);
    expect(GOBEK_ADAYLARI_V2).toHaveLength(5);
    expect(BORDUR_ADAYLARI_V2).toHaveLength(5);
    expect(DOLGU_ADAYLARI_V2).toHaveLength(3);
  });
});
