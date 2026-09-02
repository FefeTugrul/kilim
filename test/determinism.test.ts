import { describe, expect, it } from "vitest";
import { fnv1a } from "../src/hash.js";
import { mulberry32 } from "../src/rng.js";
import { debugGrid } from "../src/index.js";

describe("fnv1a", () => {
  // Sabit değerler. Bunlar değişirse tüm kullanıcıların avatarı değişir —
  // yani bu testin kırılması bir hata değil, kırıcı değişiklik uyarısıdır.
  it("bilinen girdiler için sabit değer üretir", () => {
    expect(fnv1a("")).toBe(2166136261);
    expect(fnv1a("furkan")).toBe(1616942224);
    expect(fnv1a("kilim")).toBe(789700909);
    expect(fnv1a("user@example.com")).toBe(3718907387);
  });

  it("Türkçe karakterleri kararlı işler", () => {
    expect(fnv1a("ayşe")).toBe(3585281615);
  });

  it("büyük/küçük harf farkına duyarlıdır", () => {
    expect(fnv1a("furkan")).not.toBe(fnv1a("Furkan"));
  });

  it("her zaman 32 bitlik işaretsiz tam sayı döner", () => {
    for (const s of ["", "a", "kilim", "çok daha uzun bir seed metni 12345"]) {
      const h = fnv1a(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

describe("mulberry32", () => {
  it("aynı seed aynı diziyi verir", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = Array.from({ length: 50 }, () => a.next());
    const seqB = Array.from({ length: 50 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("farklı seed farklı dizi verir", () => {
    const a = Array.from({ length: 20 }, mulberry32(1).next);
    const b = Array.from({ length: 20 }, mulberry32(2).next);
    expect(a).not.toEqual(b);
  });

  it("[0, 1) aralığında kalır", () => {
    const r = mulberry32(fnv1a("kilim"));
    for (let i = 0; i < 2000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("int sınırların dışına çıkmaz", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const v = r.int(6);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
    }
  });

  it("weighted ağırlık dağılımına uyar", () => {
    const r = mulberry32(99);
    let a = 0;
    for (let i = 0; i < 4000; i++) {
      if (r.weighted(["a", "b"], [9, 1]) === "a") a++;
    }
    // %90 bekleniyor; geniş tolerans, testin kararlı kalması için.
    expect(a / 4000).toBeGreaterThan(0.85);
    expect(a / 4000).toBeLessThan(0.95);
  });

  it("boş dizide anlamlı hata verir", () => {
    expect(() => mulberry32(1).pick([])).toThrow(/boş diziden/);
  });
});

describe("uçtan uca determinizm", () => {
  it("aynı seed bayt bayt aynı SVG'yi verir", () => {
    expect(debugGrid("furkan")).toBe(debugGrid("furkan"));
  });

  it("farklı seed farklı SVG verir", () => {
    expect(debugGrid("furkan")).not.toBe(debugGrid("ayşe"));
  });

  it("geçerli ve kendi kendine yeten SVG üretir", () => {
    const svg = debugGrid("kilim");
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    // Eğri veya path yok — ızgara kısıtının testi.
    expect(svg).not.toContain("<path");
    expect(svg).not.toContain("<circle");
  });

  it("boş seed de geçerli çıktı verir", () => {
    expect(() => debugGrid("")).not.toThrow();
    expect(debugGrid("")).toContain("<rect");
  });

  it("hücre yüksekliği genişliğinden büyüktür (1:1.15)", () => {
    const svg = debugGrid("furkan", 2);
    const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    expect(m).not.toBeNull();
    const w = Number(m?.[1]);
    const h = Number(m?.[2]);
    expect(h / w).toBeCloseTo(1.15, 2);
  });
});
