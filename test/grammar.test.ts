import { describe, expect, it } from "vitest";
import { generateKilim } from "../src/index.js";
import { doku, kademeSec, OLCULER } from "../src/grammar.js";
import { fnv1a } from "../src/hash.js";
import { mulberry32 } from "../src/rng.js";
import { TUM_MOTIFLER, slotMotifleri, motifBoyut, dondur90 } from "../src/motifs.js";
import { CELL, get } from "../src/grid.js";

const ORNEK = ["furkan", "ayşe", "mehmet", "kilim", "FefeTugrul", "user@example.com"];

describe("motif kütüphanesi", () => {
  it("her motif dikdörtgen bir ızgaradır", () => {
    for (const m of TUM_MOTIFLER) {
      const w = (m.grid[0] as string).length;
      for (const satir of m.grid) {
        expect(satir.length, `${m.id} satırları eşit uzunlukta değil`).toBe(w);
      }
    }
  });

  it("her motif yalnızca tanımlı hücre kodlarını kullanır", () => {
    const izinli = new Set(Object.values(CELL));
    for (const m of TUM_MOTIFLER) {
      for (const satir of m.grid) {
        for (const ch of satir) {
          expect(izinli.has(ch as never), `${m.id} içinde geçersiz kod: ${ch}`).toBe(true);
        }
      }
    }
  });

  it("her motifin adı, anlamı ve en az bir slotu vardır", () => {
    for (const m of TUM_MOTIFLER) {
      expect(m.ad.length).toBeGreaterThan(0);
      expect(m.anlam.length).toBeGreaterThan(10);
      expect(m.slots.length).toBeGreaterThan(0);
    }
  });

  it("figüratif motif bordüre giremez", () => {
    const bordur = slotMotifleri("bordur").map((m) => m.id);
    expect(bordur).not.toContain("elibelinde");
  });

  it("bant motifi zemine giremez", () => {
    const zemin = slotMotifleri("zemin").map((m) => m.id);
    for (const bantId of ["suyolu", "testere", "baklava"]) {
      expect(zemin).not.toContain(bantId);
    }
  });

  it("dondur90 boyutları takas eder ve tersi kendine döner", () => {
    for (const m of TUM_MOTIFLER) {
      const { w, h } = motifBoyut(m);
      const d = dondur90(m.grid);
      expect(d.length).toBe(w);
      expect((d[0] as string).length).toBe(h);
      const dort = dondur90(dondur90(dondur90(d)));
      expect(dort).toEqual([...m.grid]);
    }
  });
});

describe("generateKilim", () => {
  it("aynı seed bayt bayt aynı SVG verir", () => {
    for (const s of ORNEK) {
      expect(generateKilim(s).svg).toBe(generateKilim(s).svg);
    }
  });

  it("farklı seed farklı SVG verir", () => {
    const hepsi = new Set(ORNEK.map((s) => generateKilim(s).svg));
    expect(hepsi.size).toBe(ORNEK.length);
  });

  it("1000 seed'in en az %95'i benzersizdir", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(generateKilim(`seed${i}`, { size: 200 }).svg);
    expect(seen.size).toBeGreaterThanOrEqual(950);
  });

  it("geçerli ve kendi kendine yeten SVG üretir", () => {
    const svg = generateKilim("kilim").svg;
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    // Izgara kısıtı: eğri veya path üretilmez.
    expect(svg).not.toContain("<path");
    expect(svg).not.toContain("<circle");
    expect(svg).not.toContain("gradient");
    // Dış kaynak yok.
    expect(svg).not.toContain("http://www.w3.org/1999/xlink");
    expect(svg).not.toMatch(/<image/);
  });

  it("ad, motif listesi ve palet döner", () => {
    const k = generateKilim("furkan");
    expect(k.name.length).toBeGreaterThan(5);
    expect(k.motifs.length).toBeGreaterThan(0);
    expect(k.palette).toHaveLength(5);
    for (const hex of k.palette) expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("boş seed ve tek karakter de çalışır", () => {
    for (const s of ["", "a", " ", "🧶"]) {
      expect(() => generateKilim(s)).not.toThrow();
      expect(generateKilim(s).svg).toContain("<rect");
    }
  });

  it("çıktı kareye yakındır — avatar kare olmak zorunda", () => {
    for (const boyut of [24, 64, 200]) {
      const svg = generateKilim("furkan", { size: boyut }).svg;
      const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      const w = Number(m?.[1]);
      const h = Number(m?.[2]);
      expect(Math.abs(w / h - 1), `${boyut}px karede değil`).toBeLessThan(0.05);
    }
  });
});

describe("detay kademesi (LOD)", () => {
  it("piksel boyutuna göre doğru kademeyi seçer", () => {
    expect(kademeSec(16)).toBe("kucuk");
    expect(kademeSec(32)).toBe("kucuk");
    expect(kademeSec(48)).toBe("orta");
    expect(kademeSec(80)).toBe("orta");
    expect(kademeSec(128)).toBe("tam");
  });

  it("küçük kademe daha az hücre çizer", () => {
    const kucuk = (generateKilim("furkan", { size: 24 }).svg.match(/<rect/g) ?? []).length;
    const tam = (generateKilim("furkan", { size: 200 }).svg.match(/<rect/g) ?? []).length;
    expect(kucuk).toBeLessThan(tam / 2);
  });

  it("kademeler arasında ızgara büyür", () => {
    expect(OLCULER.kucuk.w).toBeLessThan(OLCULER.orta.w);
    expect(OLCULER.orta.w).toBeLessThan(OLCULER.tam.w);
  });
});

describe("dokuma grameri", () => {
  it("dikey ayna her zaman uygulanır", () => {
    for (const s of ORNEK) {
      const { grid } = doku(mulberry32(fnv1a(s)), "tam");
      for (let y = 0; y < grid.h; y++) {
        for (let x = 0; x < Math.floor(grid.w / 2); x++) {
          expect(get(grid, x, y), `${s}: (${x},${y}) aynada tutmuyor`).toBe(
            get(grid, grid.w - 1 - x, y),
          );
        }
      }
    }
  });

  it("yatay ayna asla uygulanmaz — kilimin bir üstü bir altı vardır", () => {
    // Üst ve alt yarı birebir aynı olsaydı motif yönü kaybolurdu.
    let farkli = 0;
    for (const s of ORNEK) {
      const { grid } = doku(mulberry32(fnv1a(s)), "tam");
      for (let y = 0; y < Math.floor(grid.h / 2); y++) {
        for (let x = 0; x < grid.w; x++) {
          if (get(grid, x, y) !== get(grid, x, grid.h - 1 - y)) farkli++;
        }
      }
    }
    expect(farkli).toBeGreaterThan(0);
  });

  it("zemin motifi olarak bant motifi kullanılmaz", () => {
    const bantAdlari = new Set(slotMotifleri("bordur").map((m) => m.ad));
    for (let i = 0; i < 200; i++) {
      const { motifler, duzen } = doku(mulberry32(fnv1a(`s${i}`)), "tam");
      if (duzen === "gobek") continue;
      // İlk motif her zaman zemin motifidir.
      expect(bantAdlari.has(motifler[0] as string)).toBe(false);
    }
  });

  it("ızgara tanımlanan ölçülerde kalır", () => {
    for (const kademe of ["kucuk", "orta", "tam"] as const) {
      const { grid } = doku(mulberry32(1234), kademe);
      expect(grid.w).toBe(OLCULER[kademe].w);
      expect(grid.h).toBe(OLCULER[kademe].h);
    }
  });

  it("üretilen ad boş kalmaz ve motif adı içerir", () => {
    for (let i = 0; i < 50; i++) {
      const { ad, motifler } = doku(mulberry32(fnv1a(`x${i}`)), "tam");
      expect(ad).toContain(motifler[0] as string);
      expect(ad).toContain("bordürlü");
    }
  });
});
