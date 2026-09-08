import { describe, expect, it } from "vitest";
import { generateKilim } from "../src/index.js";
import { bordurKalinlik, OLCULER } from "../src/grammar.js";
import {
  BORDUR_ADAYLARI_V2,
  DOLGU_ADAYLARI_V2,
  GOBEK_ADAYLARI_V2,
  ZEMIN_ADAYLARI_V2,
} from "../src/motifs.js";
import {
  NOTR_PROFIL,
  YORE_PROFILLERI,
  agirliklar,
  profilBul,
} from "../src/yore.js";
import { YORE_KIMLIKLERI, type KilimYore } from "../src/palette.js";

const YORELER = [
  "konya",
  "milas",
  "sivas",
  "yoruk",
  "usak",
  "iznik",
] as const satisfies readonly KilimYore[];

/** Renkleri soyutlar: geriye yalnızca geometri kalır. */
function geometri(svg: string): string {
  return svg.replace(/#[0-9A-Fa-f]{6}/g, "C");
}

function tohumlar(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `kullanici-${i}`);
}

describe("yöre profilleri (sözleşme)", () => {
  it("her yöre için bir profil var", () => {
    for (const y of YORE_KIMLIKLERI) {
      expect(YORE_PROFILLERI[y as KilimYore], `${y} profili yok`).toBeDefined();
    }
    expect(Object.keys(YORE_PROFILLERI)).toHaveLength(YORE_KIMLIKLERI.length);
  });

  it("bilinmeyen yöre nötr profile düşer", () => {
    expect(profilBul("atlantis")).toBe(NOTR_PROFIL);
    expect(profilBul(undefined)).toBe(NOTR_PROFIL);
  });

  /**
   * En sinsi hata sınıfı: ağırlık tablosuna yanlış yazılmış bir motif kimliği.
   * Sessizce hiçbir şey yapmaz — profil yazıldığı gibi davranmaz ve kimse fark
   * etmez. Bu test onu derleme değil çalışma zamanında yakalar.
   */
  it("ağırlık tablolarındaki her motif kimliği gerçekten var", () => {
    const kumeler = {
      zeminAgirlik: new Set(ZEMIN_ADAYLARI_V2.map((m) => m.id)),
      gobekAgirlik: new Set(GOBEK_ADAYLARI_V2.map((m) => m.id)),
      bordurAgirlik: new Set(BORDUR_ADAYLARI_V2.map((m) => m.id)),
      dolguAgirlik: new Set(DOLGU_ADAYLARI_V2.map((m) => m.id)),
    } as const;

    for (const y of YORELER) {
      const profil = YORE_PROFILLERI[y];
      for (const [alan, kume] of Object.entries(kumeler)) {
        const tablo = profil[alan as keyof typeof kumeler];
        for (const id of Object.keys(tablo)) {
          expect(
            kume.has(id),
            `${y}.${alan} içinde "${id}" var ama o slotun aday listesinde yok`,
          ).toBe(true);
        }
      }
    }
  });

  it("ağırlık dizileri aday listeleriyle aynı uzunlukta", () => {
    for (const y of YORELER) {
      const a = agirliklar(YORE_PROFILLERI[y]);
      expect(a.zemin).toHaveLength(ZEMIN_ADAYLARI_V2.length);
      expect(a.gobek).toHaveLength(GOBEK_ADAYLARI_V2.length);
      expect(a.bordur).toHaveLength(BORDUR_ADAYLARI_V2.length);
      expect(a.dolgu).toHaveLength(DOLGU_ADAYLARI_V2.length);
    }
  });

  it("hiçbir ağırlık sıfır ya da negatif değil — motif elenmez, ağırlıklanır", () => {
    for (const y of YORELER) {
      const a = agirliklar(YORE_PROFILLERI[y]);
      for (const dizi of [a.zemin, a.gobek, a.bordur, a.dolgu]) {
        for (const w of dizi) expect(w).toBeGreaterThan(0);
      }
    }
  });

  it("düzen ağırlıkları dört elemanlı ve pozitif toplamlı", () => {
    for (const y of YORELER) {
      const d = YORE_PROFILLERI[y].duzen;
      expect(d).toHaveLength(4);
      expect(d.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    }
  });

  /**
   * İznik bilinçli olarak nötrdür: araştırmada İznik'in bir kilim geleneği
   * bulunamadı, o yüzden motif ataması yapılmıyor. Bu test o kararın sessizce
   * bozulmasını engeller.
   */
  it("İznik motif ataması taşımaz — yalnızca pigment yöresidir", () => {
    const p = YORE_PROFILLERI.iznik;
    expect(Object.keys(p.zeminAgirlik)).toHaveLength(0);
    expect(Object.keys(p.gobekAgirlik)).toHaveLength(0);
    expect(Object.keys(p.bordurAgirlik)).toHaveLength(0);
    expect(Object.keys(p.dolguAgirlik)).toHaveLength(0);
    expect(p.bordurCarpani).toBe(1);
  });
});

describe("bordür kalınlığı", () => {
  it("taban sıfırsa çarpan etkisizdir (küçük kademede bordür yok)", () => {
    expect(bordurKalinlik(0, 1.7)).toBe(0);
    expect(bordurKalinlik(0, 0.5)).toBe(0);
    expect(OLCULER.kucuk.bordur).toBe(0);
  });

  it("çarpan uygulanır ve taban+2 ile sınırlanır", () => {
    expect(bordurKalinlik(3, 1)).toBe(3);
    expect(bordurKalinlik(3, 1.7)).toBe(5);
    expect(bordurKalinlik(3, 0.5)).toBe(2);
    expect(bordurKalinlik(2, 1.7)).toBe(3);
    // Sınır: zemini yok edecek kadar kalın bordür üretilemez.
    expect(bordurKalinlik(3, 99)).toBe(5);
    expect(bordurKalinlik(3, -5)).toBe(0);
  });

  it("Milas bordürü Yörük bordüründen kalındır", () => {
    const taban = OLCULER.tam.bordur;
    const milas = bordurKalinlik(taban, YORE_PROFILLERI.milas.bordurCarpani);
    const yoruk = bordurKalinlik(taban, YORE_PROFILLERI.yoruk.bordurCarpani);
    expect(milas).toBeGreaterThan(yoruk);
  });
});

describe("yöre dokumayı gerçekten değiştiriyor", () => {
  /**
   * 0.1.0'ın hatası tam olarak buydu: yöre yalnızca paletti, altı yöre aynı
   * geometriyi veriyordu. Renkleri soyutlayıp geometriye bakıyoruz.
   */
  it("aynı seed, farklı yöre → farklı geometri", () => {
    for (const seed of tohumlar(60)) {
      const gorulen = new Map<string, string>();
      for (const y of YORELER) {
        const g = geometri(generateKilim(seed, { region: y, size: 128 }).svg);
        const cakisan = gorulen.get(g);
        expect(
          cakisan,
          `"${seed}" için ${cakisan} ile ${y} aynı geometriyi verdi`,
        ).toBeUndefined();
        gorulen.set(g, y);
      }
    }
  });

  it("aynı seed + aynı yöre → bayt bayt aynı", () => {
    for (const seed of tohumlar(20)) {
      for (const y of YORELER) {
        const a = generateKilim(seed, { region: y, size: 128 });
        const b = generateKilim(seed, { region: y, size: 128 });
        expect(a.svg).toBe(b.svg);
        expect(a.motifs).toEqual(b.motifs);
      }
    }
  });

  it("yöre verilmezse seed'den seçilir ve sonuçla tutarlıdır", () => {
    for (const seed of tohumlar(40)) {
      const k = generateKilim(seed, { size: 128 });
      expect(YORE_KIMLIKLERI).toContain(k.region);
      // Seçilen yöre açıkça verildiğinde aynı kilim çıkmalı.
      expect(generateKilim(seed, { size: 128, region: k.region }).svg).toBe(
        k.svg,
      );
    }
  });
});

describe("profillerin ölçülebilir etkisi", () => {
  const N = 600;
  const ORNEK = tohumlar(N);

  type DuzenSayim = Record<
    "tekrar" | "kaydirmali" | "gobek" | "bantli",
    number
  >;

  function duzenDagilimi(y: KilimYore): DuzenSayim {
    const say: DuzenSayim = {
      tekrar: 0,
      kaydirmali: 0,
      gobek: 0,
      bantli: 0,
    };
    for (const t of ORNEK) {
      say[generateKilim(t, { region: y, size: 128 }).layout] += 1;
    }
    return say;
  }

  it("Konya en madalyonlu, Sivas en az madalyonlu yöredir", () => {
    const konya = duzenDagilimi("konya");
    const sivas = duzenDagilimi("sivas");
    expect(konya.gobek).toBeGreaterThan(sivas.gobek * 2);
    expect(konya.gobek).toBeGreaterThan(N * 0.3);
  });

  it("Uşak kaydırmalı düzende yoğunlaşır (Yıldızlı Uşak şeması)", () => {
    const usak = duzenDagilimi("usak");
    for (const y of YORELER) {
      if (y === "usak") continue;
      expect(
        usak.kaydirmali,
        `${y} Uşak'tan daha kaydırmalı çıktı`,
      ).toBeGreaterThan(duzenDagilimi(y).kaydirmali);
    }
  });

  it("Yörük en seyrek, Sivas en yoğun yöredir", () => {
    expect(YORE_PROFILLERI.yoruk.seyreklik).toBeGreaterThan(
      YORE_PROFILLERI.sivas.seyreklik,
    );
    for (const y of YORELER) {
      expect(YORE_PROFILLERI.yoruk.seyreklik).toBeGreaterThanOrEqual(
        YORE_PROFILLERI[y].seyreklik,
      );
      expect(YORE_PROFILLERI.sivas.seyreklik).toBeLessThanOrEqual(
        YORE_PROFILLERI[y].seyreklik,
      );
    }
  });

  /**
   * Ağırlık ELEME değildir: yeterince örnekte her motif her yörede çıkmalı.
   * Bu, profil tasarımının merkezî iddiasıdır — kaynaklar hiçbir motifi tek bir
   * yöreye hasretmiyor, bu yüzden kod da hasretmiyor.
   */
  it("her yörede bütün zemin motifleri er geç çıkar", () => {
    const beklenen = new Set(ZEMIN_ADAYLARI_V2.map((m) => m.ad));
    for (const y of YORELER) {
      const gorulen = new Set<string>();
      for (const t of tohumlar(1500)) {
        for (const m of generateKilim(t, { region: y, size: 128 }).motifs) {
          gorulen.add(m);
        }
      }
      for (const ad of beklenen) {
        expect(gorulen.has(ad), `${y} yöresinde "${ad}" hiç çıkmadı`).toBe(true);
      }
    }
  });
});
