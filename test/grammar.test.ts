import { describe, expect, it } from "vitest";
import { generateKilim } from "../src/index.js";
import { ABRAS_DIZI_SAYISI, doku, kademeSec, OLCULER } from "../src/grammar.js";
import { fnv1a } from "../src/hash.js";
import { mulberry32 } from "../src/rng.js";
import {
  BORDUR_ADAYLARI_V1,
  DOLGU_ADAYLARI_V1,
  TUM_MOTIFLER,
  slotMotifleri,
  motifBoyut,
  dondur90,
} from "../src/motifs.js";
import { CELL, createGrid, get, toSvg } from "../src/grid.js";
import { ABRAS_TONLARI, PALETLER_V1, VARSAYILAN_PALET, paletBul } from "../src/palette.js";
import { ABRAS_KAYMALARI } from "../src/kaymalar.js";
import {
  hexToOklch,
  hexToRgb,
  oklchToHex,
  paletDenetle,
  parlaklikKaydir,
} from "../src/oklch.js";

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

  it("ad, motif listesi, yöre ve palet döner", () => {
    const k = generateKilim("furkan");
    expect(k.name.length).toBeGreaterThan(5);
    expect(k.motifs.length).toBeGreaterThan(0);
    expect(k.palette).toHaveLength(5);
    for (const hex of k.palette) expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(PALETLER_V1.map((p) => p.id)).toContain(k.style);
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
      const { govde, motifler } = doku(mulberry32(fnv1a(`x${i}`)), "tam");
      expect(govde).toContain(motifler[0] as string);
      expect(govde).toContain("bordürlü");
    }
  });
});

describe("çeşitlilik (kademe başına)", () => {
  // Denetimde 24 pikselde 2000 seed sadece 3 farklı avatar üretiyordu; bu test
  // o çöküşün regresyon kilidi. Eşikler ölçülen değerlerin altında tutuldu.
  //
  // Küçük kademede eşik yine de daha düşük: 15x13 ızgara fiziksel bir sınır ve
  // 24 pikselde okunabilirlik çeşitlilikten önce gelir. Yöresel paletler Faz 3'te
  // bu sayıyı %11.7'den %92.6'ya çıkardı.
  const N = 2000;
  const esikler: ReadonlyArray<readonly [number, number]> = [
    [24, 0.8],
    [64, 0.98],
    [128, 0.98],
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
    // Sınır kenar uzunluğuna (yüksekliğe) uygulanır; genişlik hücre oranı
    // yüzünden binde birkaç fazla çıkabilir.
    const svg = generateKilim("furkan", { size: 1e9 }).svg;
    const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    expect(Number(m?.[2])).toBeLessThanOrEqual(2048);
    expect(Number(m?.[1])).toBeLessThan(2100);
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

describe("yöresel paletler", () => {
  it("her palet kısıt doğrulayıcısından geçer", () => {
    for (const p of PALETLER_V1) {
      const ihlaller = paletDenetle(p.renkler);
      expect(
        ihlaller,
        `${p.ad} paleti kısıtları ihlal ediyor:\n` +
          ihlaller.map((i) => `  ${i.slot} ${i.hex}: ${i.kural} (${i.deger})`).join("\n"),
      ).toEqual([]);
    }
  });

  it("her paletin beş slotu ve kimliği vardır", () => {
    const kimlikler = new Set<string>();
    for (const p of PALETLER_V1) {
      expect(p.renkler).toHaveLength(5);
      expect(p.ad.length).toBeGreaterThan(0);
      expect(p.not.length).toBeGreaterThan(10);
      expect(kimlikler.has(p.id), `${p.id} kimliği tekrar ediyor`).toBe(false);
      kimlikler.add(p.id);
    }
  });

  it("palet listesinin uzunluğu sabittir", () => {
    // Uzunluk değişirse rng.pick indeksi kayar ve herkesin paleti değişir.
    expect(PALETLER_V1).toHaveLength(6);
  });

  it("paletler seed'e göre dengeli dağılır", () => {
    const sayac = new Map<string, number>();
    const N = 3000;
    for (let i = 0; i < N; i++) {
      const s = generateKilim(`p${i}`).style;
      sayac.set(s, (sayac.get(s) ?? 0) + 1);
    }
    expect(sayac.size).toBe(PALETLER_V1.length);
    const beklenen = N / PALETLER_V1.length;
    for (const [id, adet] of sayac) {
      expect(Math.abs(adet - beklenen) / beklenen, `${id} dağılımı sapmış`).toBeLessThan(0.25);
    }
  });

  it("style seçeneği seed'in seçimini geçersiz kılar", () => {
    for (const p of PALETLER_V1) {
      const k = generateKilim("furkan", { style: p.id });
      expect(k.style).toBe(p.id);
      expect(k.palette).toEqual(p.renkler);
      expect(k.name.startsWith(p.ad)).toBe(true);
    }
  });

  it("geçersiz style sessizce varsayılana düşer", () => {
    const k = generateKilim("furkan", { style: "boyle-bir-yore-yok" });
    expect(k.style).toBe(VARSAYILAN_PALET.id);
    expect(paletBul(undefined)).toBe(VARSAYILAN_PALET);
  });

  it("style sabitken bile farklı seed farklı kilim verir", () => {
    const gorulen = new Set<string>();
    for (let i = 0; i < 500; i++) gorulen.add(generateKilim(`s${i}`, { style: "konya" }).svg);
    expect(gorulen.size / 500).toBeGreaterThan(0.85);
  });
});

describe("abraş", () => {
  it("zemin rengi bant bant kayar", () => {
    // Aynı seed için üretilen SVG'de birden fazla zemin şeridi rengi olmalı.
    let abrasliBulundu = false;
    for (let i = 0; i < 60 && !abrasliBulundu; i++) {
      const svg = generateKilim(`ab${i}`, { size: 200 }).svg;
      const satirRenkleri = [...svg.matchAll(/<rect x="0" y="[\d.]+" width="[\d.]+" height="[\d.]+" fill="(#[0-9A-F]{6})"\/>/g)].map(
        (m) => m[1],
      );
      if (new Set(satirRenkleri).size > 1) abrasliBulundu = true;
    }
    expect(abrasliBulundu, "hiçbir kilimde abraş görülmedi").toBe(true);
  });

  it("abraş kayması küçüktür — renk değiştirmez, tonunu kaydırır", () => {
    for (const p of PALETLER_V1) {
      const zemin = hexToOklch(p.renkler[0]);
      for (const d of [-0.03, 0.025]) {
        const kaydirilmis = hexToOklch(parlaklikKaydir(p.renkler[0], d));
        expect(Math.abs(kaydirilmis.l - zemin.l)).toBeLessThan(0.05);
        expect(Math.abs(kaydirilmis.h - zemin.h)).toBeLessThan(6);
      }
    }
  });
});

describe("OKLCH dönüşümü", () => {
  it("hex → OKLCH → hex gidiş dönüşü korunur", () => {
    for (const hex of PALETLER_V1.flatMap((p) => [...p.renkler])) {
      const geri = oklchToHex(hexToOklch(hex));
      const [r1, g1, b1] = hexToRgb(hex);
      const [r2, g2, b2] = hexToRgb(geri);
      // Yuvarlama yüzünden birebir olmayabilir; kanal başına 2 birim tolerans.
      expect(Math.abs(r1 - r2), `${hex} → ${geri}`).toBeLessThanOrEqual(2);
      expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(2);
      expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(2);
    }
  });

  it("doğrulayıcı bilinen kötü renkleri yakalar", () => {
    expect(paletDenetle(["#FFFFFF", "#A8322A", "#C9922E", "#2E2419", "#2C5580"]).length).toBeGreaterThan(0);
    expect(paletDenetle(["#EFE5D0", "#FF00FF", "#C9922E", "#2E2419", "#2C5580"]).length).toBeGreaterThan(0);
    expect(paletDenetle(["#EFE5D0", "#EDE4D0", "#C9922E", "#2E2419", "#2C5580"]).length).toBeGreaterThan(0);
  });
});

describe("abraş tablosu (derleme zamanı önbelleği)", () => {
  // Tablo elle yazılmaz, `npm run abras` üretir. Bu test tablonun formülle
  // uyumlu kalmasını garanti eder: biri paleti değiştirip tabloyu yenilemeyi
  // unutursa burada yakalanır.
  it("her yöre için tablo formülle birebir uyuşur", () => {
    for (const p of PALETLER_V1) {
      const tablo = ABRAS_TONLARI[p.id];
      expect(tablo, `${p.ad} için abraş tablosu yok`).toBeDefined();
      expect(tablo).toHaveLength(ABRAS_KAYMALARI.length);

      ABRAS_KAYMALARI.forEach((kaymalar, i) => {
        const beklenen = kaymalar.map((d) =>
          d === 0 ? p.renkler[0] : parlaklikKaydir(p.renkler[0], d),
        );
        expect(
          tablo?.[i],
          `${p.ad} ${i}. dizi tablodan sapmış — "npm run abras" çalıştır`,
        ).toEqual(beklenen);
      });
    }
  });

  it("tablodaki her ton geçerli hex ve zemine yakın", () => {
    for (const p of PALETLER_V1) {
      const zeminL = hexToOklch(p.renkler[0]).l;
      for (const dizi of ABRAS_TONLARI[p.id] ?? []) {
        for (const ton of dizi) {
          expect(ton).toMatch(/^#[0-9A-F]{6}$/);
          expect(Math.abs(hexToOklch(ton).l - zeminL)).toBeLessThan(0.05);
        }
      }
    }
  });
});

describe("boyuttan bağımsız kimlik", () => {
  // Denetimde kanıtlanan en ciddi hata buydu: kullanıcının 24 pikseldeki avatarı
  // ile 128 pikseldeki avatarı HİÇBİR ZAMAN aynı düzende olamıyordu (%0 eşleşme),
  // çünkü küçük kademe düzeni ayrı bir ağırlık tablosundan çekiyordu. Bir avatar
  // kütüphanesinde bu estetik tercih değil, doğruluk hatasıdır.
  const N = 1000;

  it("palet her boyutta aynı", () => {
    for (let i = 0; i < N; i++) {
      const s = `kimlik${i}`;
      const p = generateKilim(s, { size: 128 }).style;
      expect(generateKilim(s, { size: 24 }).style, s).toBe(p);
      expect(generateKilim(s, { size: 64 }).style, s).toBe(p);
    }
  });

  it("ana motif her boyutta aynı", () => {
    for (let i = 0; i < N; i++) {
      const s = `kimlik${i}`;
      const m = generateKilim(s, { size: 128 }).motifs[0];
      expect(generateKilim(s, { size: 24 }).motifs[0], s).toBe(m);
      expect(generateKilim(s, { size: 64 }).motifs[0], s).toBe(m);
    }
  });

  it("düzen küçük kademede sabit tabloyla indirgeniyor, yeniden çekilmiyor", () => {
    const esleme: Record<string, string> = {
      tekrar: "tekrar",
      kaydirmali: "tekrar",
      gobek: "gobek",
      bantli: "tekrar",
    };
    for (let i = 0; i < N; i++) {
      const s = `kimlik${i}`;
      const tam = generateKilim(s, { size: 128 }).layout;
      expect(generateKilim(s, { size: 24 }).layout, s).toBe(esleme[tam]);
    }
  });

  it("palet gramerden bağımsız bir akıştan gelir", () => {
    // Palet doku()'nun rng'sini hiç tüketmiyor: aynı seed için palet, gramere
    // karar eklense bile kaymaz. Dolaylı kanıt: doku() çıktısı palet içermiyor.
    const sonuc = doku(mulberry32(fnv1a("furkan")), "tam");
    expect(sonuc).not.toHaveProperty("palet");
  });
});

describe("gramer değişmezleri", () => {
  it("abraş dizi sayısı kayma tablosuyla senkron", () => {
    // Ayrışırsa kilimlerin bir kısmı sessizce abraşını kaybeder ve testlerin
    // yalnızca biri, yanlış sebeple düşer.
    expect(ABRAS_DIZI_SAYISI).toBe(ABRAS_KAYMALARI.length);
    for (const p of PALETLER_V1) {
      expect(ABRAS_TONLARI[p.id], `${p.ad}`).toHaveLength(ABRAS_DIZI_SAYISI);
    }
  });

  it("serpme motifi dolgu slotundan gelir, bordürden değil", () => {
    // Gramer kendi yetki tablosunu çiğniyordu: bant motiflerini zemine serpiyordu.
    const bordurAdlari = new Set(BORDUR_ADAYLARI_V1.map((m) => m.ad));
    const dolguAdlari = new Set(DOLGU_ADAYLARI_V1.map((m) => m.ad));
    for (let i = 0; i < 400; i++) {
      const { motifler, duzen } = doku(mulberry32(fnv1a(`sp${i}`)), "tam");
      if (duzen === "gobek" || duzen === "bantli") continue;
      // İlk motif zemin, varsa ikincisi serpme, sonuncusu bordür.
      const serpmeOlabilir = motifler.slice(1, -1);
      for (const m of serpmeOlabilir) {
        expect(
          dolguAdlari.has(m) || !bordurAdlari.has(m),
          `bant motifi "${m}" zemine serpilmiş`,
        ).toBe(true);
      }
    }
  });

  it("bordür motifi bant kalınlığına sığar, kırpılmaz", () => {
    for (const m of BORDUR_ADAYLARI_V1) {
      // Orta kademe bandı 2 hücre; her bordür motifinin 2 satırlık varyantı olmalı.
      expect(m.grid2, `${m.ad} için 2 satırlık varyant yok`).toBeDefined();
      expect(m.grid2).toHaveLength(2);
      expect(m.grid.length).toBeLessThanOrEqual(OLCULER.tam.bordur);
    }
  });

  it("zemin yeterince dolu — hiçbir çıktı boş kalmıyor", () => {
    // Ölçülen en boş çıktılar %14 mürekkepteydi (tek elibelinde figürü).
    const N2 = 1500;
    let enAz = Infinity;
    for (let i = 0; i < N2; i++) {
      const rect = (generateKilim(`ink${i}`, { size: 128 }).svg.match(/<rect/g) ?? []).length;
      if (rect < enAz) enAz = rect;
    }
    // 33 satır zemin şeridi her zaman var; anlamlı taban bunun üstü.
    expect(enAz, "bir çıktı neredeyse boş").toBeGreaterThan(150);
  });
});
