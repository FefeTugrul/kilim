/**
 * sRGB ↔ OKLCH dönüşümü ve palet kısıt doğrulaması.
 *
 * Renk kararlarını göz kararıyla değil ölçerek veriyoruz. OKLCH, insan algısına
 * uygun bir uzay: aynı L değerine sahip iki renk gerçekten aynı parlaklıkta
 * görünür. sRGB'nin kendi parlaklığı bunu yapmaz — bu yüzden "yeterince kontrast
 * var mı" sorusunu hex'e bakarak cevaplayamazsın.
 *
 * Bu modül `index.ts`'ten dışa aktarılmaz; yalnızca paletleri hazırlarken ve
 * testlerde kullanılır, böylece paket boyutuna girmez.
 */

export interface Oklch {
  /** Algısal parlaklık, 0–1. */
  readonly l: number;
  /** Kroma (doygunluk). Doğal boyalar 0.03–0.16 aralığında kalır. */
  readonly c: number;
  /** Hue açısı, 0–360. */
  readonly h: number;
}

function srgbToLinear(v: number): number {
  const u = v / 255;
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const u = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(u * 255)));
}

export function hexToRgb(hex: string): readonly [number, number, number] {
  const s = hex.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const iki = (n: number): string => n.toString(16).padStart(2, "0");
  return `#${iki(r)}${iki(g)}${iki(b)}`.toUpperCase();
}

export function hexToOklch(hex: string): Oklch {
  const [r8, g8, b8] = hexToRgb(hex);
  const r = srgbToLinear(r8);
  const g = srgbToLinear(g8);
  const b = srgbToLinear(b8);

  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return { l: L, c, h };
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return rgbToHex(
    linearToSrgb(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    linearToSrgb(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    linearToSrgb(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  );
}

// ---------------------------------------------------------------------------
// Palet kısıtları
// ---------------------------------------------------------------------------

/**
 * Doğal boya kroması bu aralığın dışına çıkmaz. Üst sınırın üstü dijital görünür.
 *
 * Alt sınır bilerek düşük: boyasız yün ve ceviz kabuğuyla elde edilen kahve-siyah
 * gerçekten neredeyse nötrdür. Kuralın amacı doğal renkleri elemek değil,
 * "dijital gri" hissi veren tamamen kromasız değerleri elemek.
 */
export const KROMA_MIN = 0.01;
export const KROMA_MAX = 0.16;

/** Kök boyada mor ve magenta karşılığı yoktur. */
export const YASAK_HUE: readonly [number, number] = [280, 330];

/** Zemin ile üstüne binen her renk arasında gereken en az algısal parlaklık farkı. */
export const ZEMIN_DELTA_L = 0.18;

/**
 * İki motif rengi yan yana geldiğinde gereken en az ayrım.
 *
 * Zeminden daha gevşek, çünkü motif-motif sınırları toplam sınırların ancak
 * %10'u kadar. Ama sıfır da olamaz: Konya'da lacivert ile koyu kahve algısal
 * parlaklıkta neredeyse aynıydı ve gri tonlamada birleşiyorlardı. Parlaklık
 * VEYA hue farkından biri yeterli sayılır.
 */
export const MOTIF_DELTA_L = 0.08;
export const MOTIF_DELTA_H = 25;

/**
 * Zemin bu parlaklık aralığında VE düşük kromadaysa motifi yutar.
 *
 * Kroma koşulu önemli: kırmızı zeminli Konya kilimi gerçek ve güzeldir, orta
 * parlaklıkta olmasına rağmen motifi yutmaz çünkü doygunluğu yüksektir. Motifi
 * yutan şey orta parlaklık değil, orta parlaklık + solukluktur.
 */
export const ZEMIN_YASAK_L: readonly [number, number] = [0.45, 0.62];
export const ZEMIN_YASAK_KROMA_UST = 0.09;

export interface KisitIhlali {
  readonly slot: string;
  readonly hex: string;
  readonly kural: string;
  readonly deger: string;
}

const SLOT_ADLARI = ["zemin", "ana", "ikincil", "kontur", "vurgu"] as const;

/**
 * Bir paleti kısıtlara göre denetler. Boş dizi dönerse palet geçerlidir.
 *
 * Yeni palet eklemek isteyen herkes bu testten geçmek zorunda — renk seçimi
 * zevk meselesi olmaktan çıkıp ölçülebilir bir karara dönüşsün diye.
 */
export function paletDenetle(renkler: readonly string[]): KisitIhlali[] {
  const ihlaller: KisitIhlali[] = [];
  const ekle = (slot: string, hex: string, kural: string, deger: string): void => {
    ihlaller.push({ slot, hex, kural, deger });
  };

  if (renkler.length !== SLOT_ADLARI.length) {
    ekle("palet", "", `tam ${SLOT_ADLARI.length} slot olmalı`, String(renkler.length));
    return ihlaller;
  }
  const benzersiz = new Set(renkler.map((h) => h.toUpperCase()));
  if (benzersiz.size !== renkler.length) {
    ekle("palet", "", "aynı renk birden fazla slotta", `${benzersiz.size}/${renkler.length}`);
  }

  renkler.forEach((hex, i) => {
    const slot = SLOT_ADLARI[i] ?? `slot${i}`;

    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      ekle(slot, hex, "geçerli hex değil", hex);
      return;
    }
    const ust = hex.toUpperCase();
    if (ust === "#000000" || ust === "#FFFFFF") {
      ekle(slot, hex, "saf siyah/beyaz yasak", ust);
      return;
    }

    const { l, c, h } = hexToOklch(hex);

    if (c < KROMA_MIN) ekle(slot, hex, `kroma ${KROMA_MIN} altında`, c.toFixed(3));
    if (c > KROMA_MAX) ekle(slot, hex, `kroma ${KROMA_MAX} üstünde`, c.toFixed(3));

    // Kroması çok düşük renklerde hue anlamsızdır; kontrolü atla.
    if (c > 0.03 && h >= YASAK_HUE[0] && h <= YASAK_HUE[1]) {
      ekle(slot, hex, `hue ${YASAK_HUE[0]}–${YASAK_HUE[1]} yasak bölgede`, h.toFixed(0));
    }

    if (
      i === 0 &&
      l >= ZEMIN_YASAK_L[0] &&
      l <= ZEMIN_YASAK_L[1] &&
      c < ZEMIN_YASAK_KROMA_UST
    ) {
      ekle(slot, hex, "zemin hem orta parlaklıkta hem soluk — motifi yutar", `L=${l.toFixed(3)} C=${c.toFixed(3)}`);
    }
  });

  const gecerli = renkler.every((h) => /^#[0-9A-Fa-f]{6}$/.test(h));
  if (!gecerli) return ihlaller;

  // Zemin ile üstüne binen her renk arasında yeterli parlaklık farkı olmalı.
  const zl = hexToOklch(renkler[0] as string).l;
  renkler.slice(1).forEach((hex, i) => {
    const fark = Math.abs(hexToOklch(hex).l - zl);
    if (fark < ZEMIN_DELTA_L) {
      ekle(
        SLOT_ADLARI[i + 1] ?? `slot${i + 1}`,
        hex,
        `zeminle parlaklık farkı ${ZEMIN_DELTA_L} altında`,
        fark.toFixed(3),
      );
    }
  });

  // Motif renkleri birbirine de yapışmamalı: parlaklık VEYA hue ayırsın.
  for (let i = 1; i < renkler.length; i++) {
    for (let j = i + 1; j < renkler.length; j++) {
      const a = hexToOklch(renkler[i] as string);
      const b = hexToOklch(renkler[j] as string);
      const dl = Math.abs(a.l - b.l);
      let dh = Math.abs(a.h - b.h);
      if (dh > 180) dh = 360 - dh;
      if (dl < MOTIF_DELTA_L && dh < MOTIF_DELTA_H) {
        ekle(
          `${SLOT_ADLARI[i]}↔${SLOT_ADLARI[j]}`,
          `${renkler[i]} ${renkler[j]}`,
          "iki motif rengi hem parlaklıkta hem hue'da yapışık",
          `ΔL=${dl.toFixed(3)} ΔH=${dh.toFixed(0)}`,
        );
      }
    }
  }

  return ihlaller;
}

/**
 * Bir OKLCH değeri sRGB gamutunun içinde mi?
 *
 * `linearToSrgb` taşan kanalları sessizce kırpar; kırpma olduğunda hue kayar ve
 * abraş "boya partisi farkı" olmaktan çıkıp bozuk bir renge dönüşür. Bu yüzden
 * kırpmadan ÖNCEKİ doğrusal değerlere bakıyoruz.
 *
 * Hex nicemlemesi (8 bit) ayrı bir konu ve sorun değil — kanal başına bir
 * birimlik yuvarlama kaçınılmazdır ve gözle görülmez.
 */
export function gamutIcindeMi({ l, c, h }: Oklch): boolean {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const kanallar = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return kanallar.every((v) => v >= -0.0005 && v <= 1.0005);
}

/** Gamut dışına taşmadan parlaklık kaydırılabilir mi? Üretim betiği için. */
export function kaymaGuvenliMi(hex: string, delta: number): boolean {
  const { l, c, h } = hexToOklch(hex);
  const hedef = l + delta;
  if (hedef <= 0.02 || hedef >= 0.98) return false;
  return gamutIcindeMi({ l: hedef, c, h });
}

/**
 * Abraş: doğal boya partileri arasındaki fark.
 *
 * Zemin renginin parlaklığını algısal uzayda kaydırır. sRGB'de yapılsaydı aynı
 * kayma açık renkte fark edilir, koyu renkte kaybolurdu.
 */
export function parlaklikKaydir(hex: string, delta: number): string {
  const { l, c, h } = hexToOklch(hex);
  return oklchToHex({ l: Math.max(0.02, Math.min(0.98, l + delta)), c, h });
}
