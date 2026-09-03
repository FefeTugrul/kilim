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
  get,
  set,
  stamp,
  mirrorVertical,
  type Cell,
  type Grid,
} from "./grid.js";
import { dondur90, motifBoyut, slotMotifleri, type Motif } from "./motifs.js";
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
  kucuk: { w: 15, h: 13, sacak: 0, selvedge: 2, bordur: 0, inceSu: 0 },
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

const DUZEN_ADI: Record<Duzen, string> = {
  tekrar: "sıra düzenli",
  kaydirmali: "kaydırmalı",
  gobek: "göbekli",
  bantli: "bantlı",
};

interface Alan {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DokumaSonuc {
  readonly grid: Grid;
  /** Kullanılan motiflerin Türkçe adları — tooltip ve README için. */
  readonly motifler: readonly string[];
  readonly duzen: Duzen;
  /** İnsan okuyabilir ad: "göz zeminli, sulu bordür, sıra düzenli". */
  readonly ad: string;
}

/**
 * Bir katmanın hangi palet slotundan besleneceği. Gerçek kilimde bordür, zemin
 * motifiyle aynı renkte olmak zorunda değildir; bu eksen çeşitliliğin büyük
 * kısmını taşır.
 */
const BORDUR_RENKLERI: readonly Cell[] = [CELL.ANA, CELL.IKINCIL, CELL.VURGU];
const SU_RENKLERI: readonly Cell[] = [CELL.IKINCIL, CELL.VURGU];
const SACAK_RENKLERI: readonly Cell[] = [CELL.IKINCIL, CELL.VURGU, CELL.KONTUR];

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
  const sutun = ayar.seyrek ? Math.max(1, tamSutun - 1) : tamSutun;
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
function gobekYerlestir(g: Grid, alan: Alan, gobek: Motif, dolgu: Motif): void {
  const { w: gw, h: gh } = motifBoyut(gobek);
  stamp(
    g,
    gobek.grid,
    alan.x + Math.floor((alan.w - gw) / 2),
    alan.y + Math.floor((alan.h - gh) / 2),
  );

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

/** Yatay şeritlerde dönüşümlü iki motif. */
function bantliYerlestir(g: Grid, alan: Alan, a: Motif, b: Motif): void {
  const mh = Math.max(motifBoyut(a).h, motifBoyut(b).h);
  const satir = Math.max(1, Math.floor(alan.h / mh));
  const bosY = Math.floor((alan.h - satir * mh) / (satir + 1));

  for (let r = 0; r < satir; r++) {
    const motif = r % 2 === 0 ? a : b;
    const { w: mw, h: hh } = motifBoyut(motif);
    const sutun = Math.max(1, Math.floor(alan.w / mw));
    const bosX = Math.floor((alan.w - sutun * mw) / (sutun + 1));
    const y = alan.y + bosY * (r + 1) + mh * r + Math.floor((mh - hh) / 2);
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

  // --- kararlar (sıra önemli) ---
  const duzen: Duzen =
    kademe === "kucuk" ? "gobek" : rng.weighted(DUZENLER, DUZEN_AGIRLIK);
  const zeminAdaylar = slotMotifleri("zemin");
  const gobekAdaylar = slotMotifleri("gobek");
  const bordurAdaylar = slotMotifleri("bordur");
  const dolguAdaylar = slotMotifleri("dolgu");

  const zeminMotif = rng.pick(zeminAdaylar);
  const gobekMotif = rng.pick(gobekAdaylar);
  const bordurMotif = rng.pick(bordurAdaylar);
  const dolguMotif = rng.pick(dolguAdaylar);
  const ikinciMotif = rng.pick(zeminAdaylar);
  const suDeseni = rng.pick(SU_DESENLERI);
  const ton = rng.pick(TON_MODLARI);
  const seyrek = rng.bool(0.4);
  const serpme = rng.bool(0.45) ? rng.pick(bordurAdaylar) : null;
  const bordurRenk = rng.pick(BORDUR_RENKLERI);
  const suRenk = rng.pick(SU_RENKLERI);
  const sacakRenk = rng.pick(SACAK_RENKLERI);
  const kalinBordur = rng.bool(0.5);

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

  for (let k = 0; k < o.selvedge; k++) {
    for (let c = sol; c < sol + genislik; c++) {
      set(g, c, ust, CELL.KONTUR);
      set(g, c, ust + yukseklik - 1, CELL.KONTUR);
    }
    for (let r = ust; r < ust + yukseklik; r++) {
      set(g, sol, r, CELL.KONTUR);
      set(g, sol + genislik - 1, r, CELL.KONTUR);
    }
    ust += 1;
    sol += 1;
    genislik -= 2;
    yukseklik -= 2;
  }

  const b = o.bordur > 2 && !kalinBordur ? o.bordur - 1 : o.bordur;
  const dikeyDesen = dondur90(bordurMotif.grid);
  if (b > 0) {
    bantYatay(
      g,
      { x: sol, y: ust, w: genislik, h: b },
      bordurMotif.grid,
      bordurRenk,
    );
    bantYatay(
      g,
      { x: sol, y: ust + yukseklik - b, w: genislik, h: b },
      bordurMotif.grid,
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
      gobekYerlestir(g, alan, gobekMotif, dolguMotif);
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

  motifler.push(bordurMotif.ad);
  const bas = duzen === "gobek" ? gobekMotif.ad : zeminMotif.ad;
  const tonAdi = duzen === "gobek" || ton === "yok" ? "" : " iki tonlu";
  const ad = `${bas} ${DUZEN_ADI[duzen]}${tonAdi}, ${bordurMotif.ad} bordürlü`;

  return { grid: g, motifler: [...new Set(motifler)], duzen, ad };
}

/** Test yardımcısı: ızgarada kaç hücre zemin dışı. */
export function doluHucre(g: Grid): number {
  let n = 0;
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; x++) {
      if (get(g, x, y) !== (CELL.ZEMIN as Cell)) n++;
    }
  }
  return n;
}
