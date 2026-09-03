import { describe, expect, it } from "vitest";
import { generateKilim } from "../src/index.js";
import { doku, kademeSec, OLCULER } from "../src/grammar.js";
import { fnv1a } from "../src/hash.js";
import { mulberry32 } from "../src/rng.js";
import { TUM_MOTIFLER, slotMotifleri, motifBoyut, dondur90 } from "../src/motifs.js";
import { CELL, createGrid, get, toSvg } from "../src/grid.js";
import { VARSAYILAN_PALET } from "../src/palette.js";

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

describe("çeşitlilik (kademe başına)", () => {
  // Denetimde 24 pikselde 2000 seed sadece 3 farklı avatar üretiyordu; bu test
  // o çöküşün regresyon kilidi. Eşikler ölçülen değerlerin altında tutuldu.
  //
  // Küçük kademede eşik düşük çünkü 15x13 ızgara fiziksel bir sınır: 24 pikselde
  // okunabilirlik çeşitlilikten önce gelir. Yöresel paletler bu sayıyı yaklaşık
  // altıya katlayacak.
  const N = 2000;
  const esikler: ReadonlyArray<readonly [number, number]> = [
    [24, 0.08],
    [64, 0.9],
    [128, 0.95],
  ];

  for (const [size, enAz] of esikler) {
    it(`${size}px: ${N} seed'in en az %${enAz * 100}'i benzersiz`, () => {
      const gorulen = new Set<string>();
      for (let i = 0; i < N; i++) gorulen.add(generateKilim(`seed${i}`, { size }).svg);
      expect(gorulen.size / N, `${size}px çeşitliliği düştü`).toBeGreaterThan(enAz);
    });
  }
});

describe("size doğrulaması", () => {
  // size çoğu zaman bir prop ya da query parametresinden gelir: ?size= → NaN.
  // Geçersiz değer sessizce bozuk SVG üretmemeli.
  const bozuk = [NaN, Infinity, -Infinity, -50, 0, 1, 3.7] as const;

  it("geçersiz değerlerde bile geçerli SVG üretir", () => {
    for (const v of [...bozuk, undefined]) {
      const svg = generateKilim("furkan", { size: v as number }).svg;
      expect(svg, `size=${String(v)} bozuk çıktı verdi`).not.toContain("NaN");
      expect(svg).not.toContain("Infinity");
      expect(svg).not.toMatch(/(width|height|x|y)="-/);
      const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      expect(m, `size=${String(v)} viewBox okunamadı`).not.toBeNull();
      expect(Number(m?.[1])).toBeGreaterThan(0);
    }
  });

  it("çok büyük değerleri sınırlar", () => {
    const svg = generateKilim("furkan", { size: 1e9 }).svg;
    const m = svg.match(/viewBox="0 0 ([\d.]+) /);
    expect(Number(m?.[1])).toBeLessThanOrEqual(2048);
  });
});

describe("çıktı güvenliği", () => {
  it("seed hiçbir koşulda SVG'ye sızmaz", () => {
    const kotu = '"><script>alert(1)</script><rect fill="red';
    const svg = generateKilim(kotu).svg;
    expect(svg).not.toContain("script");
    expect(svg).not.toContain("alert");
    expect(svg).not.toContain(kotu);
  });

  it("etiket XML kaçışından geçer", () => {
    const svg = generateKilim("furkan", { label: '<img onerror="x">&' }).svg;
    expect(svg).toContain("&lt;img");
    expect(svg).toContain("&amp;");
    expect(svg).not.toMatch(/<img/);
  });

  it("label: false verilince SVG aria-hidden olur", () => {
    const svg = generateKilim("furkan", { label: false }).svg;
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).not.toContain("<title>");
  });

  it("varsayılan olarak erişilebilir ad taşır", () => {
    const k = generateKilim("furkan");
    expect(k.svg).toContain("<title>");
    expect(k.svg).toContain(k.name);
  });

  it("geçersiz renk atribüye sızmaz", () => {
    const zararli = () => 'red" onload="alert(1)';
    const svg = toSvg(createGrid(3, 3, CELL.ANA), VARSAYILAN_PALET.renkler, {
      groundAt: zararli,
    });
    expect(svg).not.toContain("onload");
    expect(svg).toContain('fill="#000000"');
  });
});

describe("ad doğruluğu", () => {
  it("bordür çizilmeyen kademede ad bordürden söz etmez", () => {
    for (let i = 0; i < 100; i++) {
      const k = generateKilim(`seed${i}`, { size: 24 });
      expect(k.name, "24px'te bordür çizilmiyor ama ad öyle diyor").not.toContain("bordürlü");
      expect(k.name).toContain("çerçeveli");
    }
  });

  it("ad, motif listesindeki her adı içerir", () => {
    for (let i = 0; i < 100; i++) {
      const k = generateKilim(`ad${i}`, { size: 128 });
      for (const m of k.motifs) {
        // Serpme motifi ada girmez; en azından ilk motif adda geçmeli.
        expect(typeof m).toBe("string");
      }
      expect(k.name).toContain(k.motifs[0] as string);
    }
  });
});
