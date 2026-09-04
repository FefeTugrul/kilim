/**
 * Dokuma grameri.
 *
 * Bir kilim rastgele serpilmiş şekiller değildir; katmanlıdır ve her motifin
 * yeri anlamına bağlıdır. Bu dosya o katmanları ve yerleşim yetkilerini uygular.
 *
 * Dıştan içe:  saçak → selvedge → bordür → ince su → zemin
 */
import {
  CELL,
  createGrid,
  set,
  stamp,
  mirrorVertical,
  type Cell,
  type Grid,
} from "./grid.js";
import {
  BORDUR_ADAYLARI_V1,
  DOLGU_ADAYLARI_V1,
  GOBEK_ADAYLARI_V1,
  ZEMIN_ADAYLARI_V1,
  dondur90,
  motifBoyut,
  type Motif,
} from "./motifs.js";
import type { Rng } from "./rng.js";

/** Detay kademesi. Küçük boyutta ızgara seyrelir, yoksa avatar lapa olur. */
export type Kademe = "kucuk" | "orta" | "tam";

export interface Olcu {
  readonly w: number;
  readonly h: number;
  readonly sacak: number;
  readonly selvedge: number;
  readonly bordur: number;
  readonly inceSu: number;
}

/**
 * Izgara boyutları, hücre oranı 1:1.15 ile çarpıldığında kareye yakın sonuç
 * verecek şekilde seçildi — avatar kare olmak zorunda.
 */
export const OLCULER: Record<Kademe, Olcu> = {
  kucuk: { w: 15, h: 13, sacak: 0, selvedge: 1, bordur: 0, inceSu: 0 },
  orta: { w: 29, h: 25, sacak: 1, selvedge: 1, bordur: 2, inceSu: 1 },
  tam: { w: 38, h: 33, sacak: 2, selvedge: 1, bordur: 3, inceSu: 1 },
};

export function kademeSec(pikselBoyut: number): Kademe {
  if (pikselBoyut <= 32) return "kucuk";
  if (pikselBoyut <= 80) return "orta";
  return "tam";
}

export type Duzen = "tekrar" | "kaydirmali" | "gobek" | "bantli";

const DUZENLER: readonly Duzen[] = ["tekrar", "kaydirmali", "gobek", "bantli"];
const DUZEN_AGIRLIK: readonly number[] = [40, 25, 20, 15];

/**
 * 15x13 ızgarada yalnızca göbek ve tekrar okunur. Kaydırmalı ve bantlı düzenler
 * lapa olur, o yüzden bu tabloyla indirgenir — yeni bir çekiliş yapılmadan,
 * böylece kimlik boyutlar arasında korunur.
 */
const KUCUK_DUZEN_ESLEME: Record<Duzen, Duzen> = {
  tekrar: "tekrar",
  kaydirmali: "tekrar",
  gobek: "gobek",
  bantli: "tekrar",
};

const DUZEN_ADI: Record<Duzen, string> = {
  tekrar: "sıra düzenli",
  kaydirmali: "kaydırmalı",
  gobek: "göbekli",
  bantli: "bantlı",
};

/**
 * Düzenlerin İngilizce karşılıkları.
 *
 * Erişilebilir ad (`<title>`) İngilizce üretilir: ekran okuyucu kullanan bir
 * geliştirici Tokyo'da da olabilir ve Türkçe bir cümle ona hiçbir şey anlatmaz.
 * Motif adları kültürel içerik olduğu için `name` alanında Türkçe kalır.
 */
const DUZEN_ADI_EN: Record<Duzen, string> = {
  tekrar: "rows",
  kaydirmali: "brick-laid",
  gobek: "medallion",
  bantli: "banded",
};

interface Alan {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Abraş: doğal boya partileri arasındaki fark.
 *
 * Zemin renginin parlaklığı yatay bantlar halinde hafifçe kayar. Bilinçaltında
 * algılanır; "el yapımı" hissinin çoğu buradan gelir. Kusursuz düz zemin
 * sentetik görünür.
 */
export interface Abras {
  /** Bant başına kaç hücre. */
  readonly bant: number;
  /** ABRAS_TONLARI içindeki kayma dizisinin indeksi. */
  readonly dizi: number;
}

export interface DokumaSonuc {
  readonly grid: Grid;
  /** Zemin renginin bant bant kayması. */
  readonly abras: Abras;
  /** Kullanılan motiflerin Türkçe adları — tooltip ve README için. */
  readonly motifler: readonly string[];
  readonly duzen: Duzen;
  /** Yöre öneki olmadan ad gövdesi: "göz sıra düzenli, testere bordürlü". */
  readonly govde: string;
  /** İngilizce gövde: "evil eye in rows, sawtooth border". */
  readonly govdeEn: string;
}

/**
 * Bir katmanın hangi palet slotundan besleneceği. Gerçek kilimde bordür, zemin
 * motifiyle aynı renkte olmak zorunda değildir; bu eksen çeşitliliğin büyük
 * kısmını taşır.
 */
/**
 * Vurgu rengi paletin %3-8'lik bütçesine sahiptir; çevreyi baştan başa dolaşan
 * katmanlar (ince su, selvedge, saçak) tek başına bu bütçeyi aşar ve vurgu
 * vurgu olmaktan çıkar. Bu yüzden vurgu yalnızca bant ve nokta katmanlarında.
 *
 * Selvedge'in işi zeminden ayırmaktır, dikkat çekmek değil: en koyu/en kontrast
 * rollerle sınırlı. Daha önce açık mavi bir selvedge Sivas kilimini ele
 * geçiriyordu.
 */
const BORDUR_RENKLERI: readonly Cell[] = [CELL.ANA, CELL.IKINCIL, CELL.VURGU];
const SU_RENKLERI: readonly Cell[] = [CELL.IKINCIL, CELL.KONTUR];
const SACAK_RENKLERI: readonly Cell[] = [CELL.IKINCIL, CELL.KONTUR];
const SELVEDGE_RENKLERI: readonly Cell[] = [CELL.KONTUR, CELL.ANA];
const KOSE_RENKLERI: readonly Cell[] = [CELL.ANA, CELL.IKINCIL, CELL.VURGU];

/** Zeminin dört köşesine konan küçük işaret. Göbekli düzenin boşluğunu kırar. */
const KOSE_ISARETI: readonly string[] = [".X.", "XXX", ".X."];

/** Kaç farklı abraş kayma dizisi var — bkz. src/kaymalar.ts ve ABRAS_TONLARI. */
export const ABRAS_DIZI_SAYISI = 5;

/** Bant kalınlığına sığan varyantı seçer — kırpmak yerine. */
function bandaSigan(motif: Motif, kalinlik: number): readonly string[] {
  if (motif.grid.length <= kalinlik) return motif.grid;
  if (motif.grid2 && motif.grid2.length <= kalinlik) return motif.grid2;
  return motif.grid;
}

/** Motifi bir bant boyunca yatay tekrarlar. Kenarda dürüstçe kesilir. */
function bantYatay(
  g: Grid,
  alan: Alan,
  desen: readonly string[],
  renk: Cell,
): void {
  const dw = (desen[0] as string).length;
  for (let c = 0; c < alan.w; c++) {
    const u = c % dw;
    for (let r = 0; r < alan.h && r < desen.length; r++) {
      if ((desen[r] as string)[u] === CELL.ANA)
        set(g, alan.x + c, alan.y + r, renk);
    }
  }
}

/** Aynı işin dikey hali — desen 90° döndürülmüş gelir. */
function bantDikey(
  g: Grid,
  alan: Alan,
  desen: readonly string[],
  renk: Cell,
): void {
  const dh = desen.length;
  for (let r = 0; r < alan.h; r++) {
    const u = r % dh;
    const satir = desen[u] as string;
    for (let c = 0; c < alan.w && c < satir.length; c++) {
      if (satir[c] === CELL.ANA) set(g, alan.x + c, alan.y + r, renk);
    }
  }
}

/**
 * Bordürü zeminden ayıran tek sıralık çizgi. Üç dokunuş var: kesikli, sürekli
 * ve seyrek — bordür motifiyle aynı seçimden gelmediği için çeşitlilik katar.
 */
export type SuDeseni = "kesikli" | "surekli" | "seyrek";

const SU_DESENLERI: readonly SuDeseni[] = ["kesikli", "surekli", "seyrek"];

function suDolu(desen: SuDeseni, i: number): boolean {
  if (desen === "surekli") return true;
  if (desen === "seyrek") return i % 4 === 1;
  return i % 2 === 1;
}

function inceSuCiz(
  g: Grid,
  alan: Alan,
  yatay: boolean,
  desen: SuDeseni,
  renk: Cell,
): void {
  if (yatay) {
    for (let c = 0; c < alan.w; c++) {
      if (suDolu(desen, alan.x + c)) set(g, alan.x + c, alan.y, renk);
    }
  } else {
    for (let r = 0; r < alan.h; r++) {
      if (suDolu(desen, alan.y + r)) set(g, alan.x, alan.y + r, renk);
    }
  }
}

/** Motifin ana rengini ikincile çevirir — iki tonlu zeminler için. */
function ikinciTon(desen: readonly string[]): string[] {
  return desen.map((s) => s.split(CELL.ANA).join(CELL.IKINCIL));
}

/** İkinci rengin zemine dağılma biçimi. */
export type TonMod = "yok" | "satir" | "sutun" | "dama";

const TON_MODLARI: readonly TonMod[] = ["yok", "satir", "sutun", "dama"];

function ikincilMi(mod: TonMod, r: number, c: number): boolean {
  switch (mod) {
    case "satir":
      return r % 2 === 1;
    case "sutun":
      return c % 2 === 1;
    case "dama":
      return (r + c) % 2 === 1;
    default:
      return false;
  }
}

interface ZeminAyar {
  /** Tuğla dizilim: tek satırlar yarım motif kayar. */
  readonly kaydir: boolean;
  /** İkinci rengin dağılma biçimi. */
  readonly ton: TonMod;
  /** Bir sütun eksiltip aralara boşluk açar — serpmeye yer açan eksen. */
  readonly seyrek: boolean;
  /** Motif aralarındaki boşluğa serpilen küçük motif. */
  readonly serpme: Motif | null;
}

/**
 * Motifleri alana yerleştirir, artan boşluğu aralara eşit dağıtır.
 *
 * Kayan satırlarda kenardan taşan motifler sıkıştırılmaz — dürüstçe kesilir.
 * Dokumacı da öyle yapar; "algoritma uydurdu" ile "biri dokudu" farkı budur.
 */
function yerlestir(g: Grid, alan: Alan, motif: Motif, ayar: ZeminAyar): void {
  const { w: mw, h: mh } = motifBoyut(motif);
  const tamSutun = Math.max(1, Math.floor(alan.w / mw));
  // Seyreklik yalnızca 3+ sütun sığdığında uygulanır. Aksi halde geniş motifler
  // (elibelinde 11 hücre) tek sütuna düşüyordu ve alan %14 mürekkeple boş kalıyordu.
  const sutun = ayar.seyrek && tamSutun >= 3 ? tamSutun - 1 : tamSutun;
  const satir = Math.max(1, Math.floor(alan.h / mh));
  const bosX = Math.floor((alan.w - sutun * mw) / (sutun + 1));
  const bosY = Math.floor((alan.h - satir * mh) / (satir + 1));
  const artanY = alan.h - (satir * mh + bosY * (satir + 1));
  const ikinci = ikinciTon(motif.grid);

  for (let r = 0; r < satir; r++) {
    const kayma = ayar.kaydir && r % 2 === 1 ? Math.floor((mw + bosX) / 2) : 0;
    const y = alan.y + bosY * (r + 1) + mh * r + Math.floor(artanY / 2);

    // Kayan satırda soldan bir fazla başla: taşan motif kenarda kesilir.
    const bas = kayma > 0 ? -1 : 0;
    for (let c = bas; c <= sutun; c++) {
      const x = alan.x + bosX * (c + 1) + mw * c + kayma;
      if (x >= alan.x + alan.w) break;
      stamp(g, ikincilMi(ayar.ton, r, c) ? ikinci : motif.grid, x, y);
    }
  }

  if (!ayar.serpme) return;
  const { w: sw, h: sh } = motifBoyut(ayar.serpme);
  if (bosX < sw - 2 || bosY < sh - 1) return; // sığmıyorsa hiç koyma
  for (let r = 0; r <= satir; r++) {
    for (let c = 0; c <= sutun; c++) {
      const x = alan.x + bosX * (c + 1) + mw * c - Math.floor((sw + bosX) / 2);
      const y = alan.y + bosY * (r + 1) + mh * r - Math.floor((sh + bosY) / 2);
      stamp(g, ayar.serpme.grid, x, y);
    }
  }
}

/** Tek büyük göbek + dört köşe dolgusu. */
function gobekYerlestir(
  g: Grid,
  alan: Alan,
  gobek: Motif,
  dolgu: Motif,
  ikincil: boolean,
): void {
  const { w: gw, h: gh } = motifBoyut(gobek);
  stamp(
    g,
    ikincil ? ikinciTon(gobek.grid) : gobek.grid,
    alan.x + Math.floor((alan.w - gw) / 2),
    alan.y + Math.floor((alan.h - gh) / 2),
  );

  // Göbeğin çevresine baklava halkası. Her gerçek madalyonlu kilimde bu çerçeve
  // vardır ve göbekle kenar arasındaki ölü halkayı tek kuralla kapatır.
  const yaricap = Math.floor(Math.min(alan.w, alan.h) * 0.42);
  const mx = alan.x + Math.floor(alan.w / 2);
  const my = alan.y + Math.floor(alan.h / 2);
  for (let d = 0; d <= yaricap; d++) {
    const e = yaricap - d;
    for (const [sx, sy] of [
      [d, e],
      [d, -e],
      [-d, e],
      [-d, -e],
    ] as ReadonlyArray<readonly [number, number]>) {
      set(g, mx + sx, my + sy, CELL.KONTUR);
    }
  }

  const { w: dw, h: dh } = motifBoyut(dolgu);
  if (alan.w < gw + 2 * dw + 2 || alan.h < gh + 2) return; // köşeye yer yoksa boş bırak
  const kose: ReadonlyArray<readonly [number, number]> = [
    [alan.x, alan.y],
    [alan.x + alan.w - dw, alan.y],
    [alan.x, alan.y + alan.h - dh],
    [alan.x + alan.w - dw, alan.y + alan.h - dh],
  ];
  for (const [x, y] of kose) stamp(g, dolgu.grid, x, y);
}

/**
 * Bordürün dört köşesini kapatır.
 *
 * Yatay ve dikey bantlar köşede farklı fazlarda buluşur ve kırık bir dönüş
 * bırakır. Gerçek dokumada köşe ayrı bir bloktur; burada da öyle.
 */
function koseBlogu(
  g: Grid,
  sol: number,
  ust: number,
  genislik: number,
  yukseklik: number,
  b: number,
  renk: Cell,
  dolu: boolean,
): void {
  const kose: ReadonlyArray<readonly [number, number]> = [
    [sol, ust],
    [sol + genislik - b, ust],
    [sol, ust + yukseklik - b],
    [sol + genislik - b, ust + yukseklik - b],
  ];
  const orta = (b - 1) / 2;
  for (const [x0, y0] of kose) {
    for (let r = 0; r < b; r++) {
      for (let c = 0; c < b; c++) {
        // Dolu kare ya da içine oturmuş baklava — tek bir rng kararı belirler.
        const cizilsin =
          dolu || Math.abs(r - orta) + Math.abs(c - orta) <= orta;
        if (cizilsin) set(g, x0 + c, y0 + r, renk);
      }
    }
  }
}

/**
 * Zeminin dört köşesine küçük bir işaret koyar. Göbekli düzende ortası dolu,
 * kenarları bomboş bir kilim çıkmasını engeller.
 */
function koseIsaretiKoy(g: Grid, alan: Alan, renk: Cell): void {
  const desen = KOSE_ISARETI.map((satir) => satir.split(CELL.ANA).join(renk));
  const n = 3;
  if (alan.w < 2 * n + 1 || alan.h < 2 * n + 1) return;
  // Köşelere değil KENAR ORTALARINA: göbekli düzende ölü alan tam orada, artı
  // biçiminde. Köşeleri zaten dolgu motifi kaplıyordu.
  const ortaX = alan.x + Math.floor((alan.w - n) / 2);
  const ortaY = alan.y + Math.floor((alan.h - n) / 2);
  const yerler: ReadonlyArray<readonly [number, number]> = [
    [ortaX, alan.y],
    [ortaX, alan.y + alan.h - n],
    [alan.x, ortaY],
    [alan.x + alan.w - n, ortaY],
  ];
  for (const [x, y] of yerler) stamp(g, desen, x, y);
}

/** Yatay şeritlerde dönüşümlü iki motif. */
function bantliYerlestir(g: Grid, alan: Alan, a: Motif, b: Motif): void {
  const mh = Math.max(motifBoyut(a).h, motifBoyut(b).h);
  const satir = Math.max(1, Math.floor(alan.h / mh));
  const bosY = Math.floor((alan.h - satir * mh) / (satir + 1));
  const artanY = alan.h - (satir * mh + bosY * (satir + 1));

  for (let r = 0; r < satir; r++) {
    const motif = r % 2 === 0 ? a : b;
    const { w: mw, h: hh } = motifBoyut(motif);
    const sutun = Math.max(1, Math.floor(alan.w / mw));
    const bosX = Math.floor((alan.w - sutun * mw) / (sutun + 1));
    const y =
      alan.y +
      bosY * (r + 1) +
      mh * r +
      Math.floor((mh - hh) / 2) +
      Math.floor(artanY / 2);
    for (let c = 0; c < sutun; c++) {
      stamp(g, motif.grid, alan.x + bosX * (c + 1) + mw * c, y);
    }
  }
}

/**
 * Bir kilim dokur.
 *
 * Karar sırası sözleşmenin parçasıdır: aşağıdaki rng çağrılarının sırasını
 * değiştirmek aynı seed için farklı kilim üretir, yani kırıcı bir değişikliktir.
 * Yeni karar eklerken sona ekle.
 */
export function doku(rng: Rng, kademe: Kademe): DokumaSonuc {
  const o = OLCULER[kademe];
  const g = createGrid(o.w, o.h);

  // --- kararlar (sıra önemli, ve KADEMEDEN BAĞIMSIZ) ---
  //
  // Kritik: bütün çekilişler her kademede aynı sırayla yapılır. Daha önce küçük
  // kademe düzeni ayrı bir ağırlık tablosundan çekiyordu ve sonuç şuydu: bir
  // kullanıcının 24 pikseldeki avatarı ile 128 pikseldeki avatarı HİÇBİR ZAMAN
  // aynı düzende olamıyordu (ölçüldü: %0 eşleşme). Bir avatar kütüphanesinde bu
  // estetik tercih değil, doğruluk hatasıdır.
  //
  // Kademe artık yalnızca çizilebilecek olanı sınırlar: küçük ızgarada okunmayan
  // düzenler sabit bir tabloyla indirgenir — rng harcamadan.
  const duzenHam = rng.weighted(DUZENLER, DUZEN_AGIRLIK);
  const duzen: Duzen =
    kademe === "kucuk" ? KUCUK_DUZEN_ESLEME[duzenHam] : duzenHam;
  // Donmuş sözleşme listeleri — bkz. motifs.ts içindeki uyarı.
  const zeminAdaylar = ZEMIN_ADAYLARI_V1;
  const gobekAdaylar = GOBEK_ADAYLARI_V1;
  const bordurAdaylar = BORDUR_ADAYLARI_V1;
  const dolguAdaylar = DOLGU_ADAYLARI_V1;

  const zeminMotif = rng.pick(zeminAdaylar);
  const gobekMotif = rng.pick(gobekAdaylar);
  const bordurMotif = rng.pick(bordurAdaylar);
  const dolguMotif = rng.pick(dolguAdaylar);
  const ikinciMotif = rng.pick(zeminAdaylar);
  const suDeseni = rng.pick(SU_DESENLERI);
  const ton = rng.pick(TON_MODLARI);
  const seyrek = rng.bool(0.4);
  // Serpme motifi DOLGU slotundan gelir. Daha önce bordür adaylarından
  // seçiliyordu; yani gramer kendi yetki tablosunu çiğniyor, bant motiflerini
  // zemine serpiyordu. motifs.ts açıkça "zeminde tek başına kullanılmaz" diyor.
  const serpme = rng.bool(0.45) ? rng.pick(dolguAdaylar) : null;
  const bordurRenk = rng.pick(BORDUR_RENKLERI);
  const suRenk = rng.pick(SU_RENKLERI);
  const sacakRenk = rng.pick(SACAK_RENKLERI);
  const kalinBordur = rng.bool(0.5);
  const selvedgeRenk = rng.pick(SELVEDGE_RENKLERI);
  const kalinSelvedge = rng.bool(0.45);
  const gobekIkincil = rng.bool(0.4);
  const koseRenk = rng.pick(KOSE_RENKLERI);
  const koseVar = rng.bool(0.55);
  const abrasBant = 5 + rng.int(5); // 5–9 hücrelik bantlar
  const abrasDizi = rng.int(ABRAS_DIZI_SAYISI);

  // --- katmanlar, dıştan içe ---
  let ust = 0;
  let sol = 0;
  let genislik = o.w;
  let yukseklik = o.h;

  if (o.sacak > 0) {
    for (let c = 0; c < o.w; c += 2) {
      for (let r = 0; r < o.sacak; r++) {
        set(g, c, r, sacakRenk);
        set(g, c, o.h - 1 - r, sacakRenk);
      }
    }
    ust += o.sacak;
    yukseklik -= 2 * o.sacak;
  }

  const selvedgeKat = o.selvedge + (kalinSelvedge ? 1 : 0);
  for (let k = 0; k < selvedgeKat; k++) {
    for (let c = sol; c < sol + genislik; c++) {
      set(g, c, ust, selvedgeRenk);
      set(g, c, ust + yukseklik - 1, selvedgeRenk);
    }
    for (let r = ust; r < ust + yukseklik; r++) {
      set(g, sol, r, selvedgeRenk);
      set(g, sol + genislik - 1, r, selvedgeRenk);
    }
    ust += 1;
    sol += 1;
    genislik -= 2;
    yukseklik -= 2;
  }

  // Bant kalınlığı motifi kırpmayacak kadar geniş olmalı; kırpmak yerine motifin
  // kendi iki satırlık varyantı kullanılır.
  const b = o.bordur;
  const ustDesen = bandaSigan(bordurMotif, b);
  // Alt bandı aynala: dokunan bir çerçeve daima aynalanır, ötelenmez.
  const altDesen = [...ustDesen].reverse();
  const dikeyDesen = dondur90(ustDesen);
  if (b > 0) {
    bantYatay(g, { x: sol, y: ust, w: genislik, h: b }, ustDesen, bordurRenk);
    bantYatay(
      g,
      { x: sol, y: ust + yukseklik - b, w: genislik, h: b },
      altDesen,
      bordurRenk,
    );
    bantDikey(
      g,
      { x: sol, y: ust + b, w: b, h: yukseklik - 2 * b },
      dikeyDesen,
      bordurRenk,
    );
    bantDikey(
      g,
      { x: sol + genislik - b, y: ust + b, w: b, h: yukseklik - 2 * b },
      dikeyDesen,
      bordurRenk,
    );
    koseBlogu(g, sol, ust, genislik, yukseklik, b, bordurRenk, kalinBordur);
  }
  ust += b;
  sol += b;
  genislik -= 2 * b;
  yukseklik -= 2 * b;

  if (o.inceSu > 0) {
    inceSuCiz(g, { x: sol, y: ust, w: genislik, h: 1 }, true, suDeseni, suRenk);
    inceSuCiz(
      g,
      { x: sol, y: ust + yukseklik - 1, w: genislik, h: 1 },
      true,
      suDeseni,
      suRenk,
    );
    inceSuCiz(
      g,
      { x: sol, y: ust, w: 1, h: yukseklik },
      false,
      suDeseni,
      suRenk,
    );
    inceSuCiz(
      g,
      { x: sol + genislik - 1, y: ust, w: 1, h: yukseklik },
      false,
      suDeseni,
      suRenk,
    );
    ust += 1;
    sol += 1;
    genislik -= 2;
    yukseklik -= 2;
  }

  const alan: Alan = { x: sol, y: ust, w: genislik, h: yukseklik };
  const motifler: string[] = [];

  switch (duzen) {
    case "gobek":
      gobekYerlestir(g, alan, gobekMotif, dolguMotif, gobekIkincil);
      if (koseVar) koseIsaretiKoy(g, alan, koseRenk);
      motifler.push(gobekMotif.ad, dolguMotif.ad);
      break;
    case "bantli":
      bantliYerlestir(g, alan, zeminMotif, ikinciMotif);
      motifler.push(zeminMotif.ad, ikinciMotif.ad);
      break;
    case "kaydirmali":
      yerlestir(g, alan, zeminMotif, { kaydir: true, ton, seyrek, serpme });
      motifler.push(zeminMotif.ad);
      if (serpme) motifler.push(serpme.ad);
      break;
    default:
      yerlestir(g, alan, zeminMotif, { kaydir: false, ton, seyrek, serpme });
      motifler.push(zeminMotif.ad);
      if (serpme) motifler.push(serpme.ad);
  }

  // Kilimin bir üstü bir altı vardır: dikey ayna her zaman, yatay ayna asla.
  mirrorVertical(g);

  const bordurCizildi = b > 0;
  if (bordurCizildi) motifler.push(bordurMotif.ad);
  const bas = duzen === "gobek" ? gobekMotif.ad : zeminMotif.ad;
  const tonAdi =
    duzen === "gobek"
      ? gobekIkincil
        ? " ikincil renkte"
        : ""
      : ton === "yok"
        ? ""
        : " iki tonlu";
  // Ad yalnızca çizilen katmanları anlatır: küçük kademede bordür yoktur.
  // Yöre öneki index.ts'te eklenir; burada string birleştirip sonra geri
  // ayrıştırmak kırılgandı (palet adında " — " geçse kuyruk sızıyordu).
  const govde = bordurCizildi
    ? `${bas} ${DUZEN_ADI[duzen]}${tonAdi}, ${bordurMotif.ad} bordürlü`
    : `${bas} ${DUZEN_ADI[duzen]}${tonAdi}, sade çerçeveli`;

  const basEn = duzen === "gobek" ? gobekMotif.en : zeminMotif.en;
  const tonAdiEn =
    duzen === "gobek"
      ? gobekIkincil
        ? ", secondary tone"
        : ""
      : ton === "yok"
        ? ""
        : ", two-tone";
  const govdeEn = bordurCizildi
    ? `${basEn} in ${DUZEN_ADI_EN[duzen]}${tonAdiEn}, ${bordurMotif.en} border`
    : `${basEn} in ${DUZEN_ADI_EN[duzen]}${tonAdiEn}, plain frame`;

  return {
    grid: g,
    abras: { bant: abrasBant, dizi: abrasDizi },
    motifler: [...new Set(motifler)],
    duzen,
    govde,
    govdeEn,
  };
}
