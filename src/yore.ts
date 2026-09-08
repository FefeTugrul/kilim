/**
 * Yöre profilleri — yörenin dokumaya etkisi.
 *
 * 0.1.0'da "yöre" yalnızca renk paleti demekti; gramer yöreyi hiç görmüyordu.
 * Sonuç, aynı seed'in altı yörede bayt bayt aynı geometriyi vermesiydi: sadece
 * renk değişiyordu. 0.2.0 bunu düzeltiyor.
 *
 * TASARIMIN DAYANDIĞI BULGU
 * -------------------------
 * Kaynak taramasının en önemli sonucu şuydu: incelenen hiçbir akademik kaynak
 * bir motifi tek bir yöreye hasretmiyor. Göz, koçboynuzu, elibelinde, yıldız —
 * hepsi pan-Anadolu. Yöreyi ayıran şey motifin VARLIĞI değil:
 *
 *   1. hangi motifin merkezî/ana, hangisinin bordür/dolgu rolünde olduğu,
 *   2. kompozisyon düzeni (madalyon mu, kaydırılmış tekrar mı, bantlı mı),
 *   3. yoğunluk (seyrek mi, dolu mu),
 *   4. bordür genişliği.
 *
 * Bu yüzden profiller motif ELEMİYOR, AĞIRLIK uyguluyor. Her motif her yörede
 * çıkabilir; sadece olasılığı kayar. Bir yöreye "şu motifler yasak" demek,
 * kaynakların desteklemediği bir kesinlik iddiası olurdu.
 *
 * KAYNAK NOTU
 * -----------
 * Aşağıdaki ağırlıklar kaynaklardan TÜRETİLMİŞ TASARIM YORUMLARIDIR, doğrudan
 * alıntı değildir. Özellikle "yoğunluk" ve "bordür genişliği" için nicel ölçüm
 * veren bir kaynak bulunamadı; nitel tariflerden çıkarıldı. Her profilin
 * başındaki yorumda dayanak künyesi var. Motif anlamları ve yöresel eğilimler
 * kültürel yorumdur; tek doğrusu yoktur.
 */
import {
  BORDUR_ADAYLARI_V2,
  DOLGU_ADAYLARI_V2,
  GOBEK_ADAYLARI_V2,
  ZEMIN_ADAYLARI_V2,
  type Motif,
} from "./motifs.js";
import type { KilimYore } from "./palette.js";

/** Zemin düzenleri — sıra `grammar.ts`'teki `DUZENLER` ile aynı olmak zorunda. */
export type DuzenAgirlik = readonly [
  tekrar: number,
  kaydirmali: number,
  gobek: number,
  bantli: number,
];

/** Motif kimliği → ağırlık. Tabloda olmayan motifin ağırlığı 1'dir. */
export type MotifAgirlik = Readonly<Record<string, number>>;

export interface YoreProfil {
  readonly id: KilimYore;
  /** Zemin düzeni çekilişinin ağırlıkları. */
  readonly duzen: DuzenAgirlik;
  /**
   * Bordür kalınlığı çarpanı. 1 = kademenin varsayılanı.
   *
   * `Math.round(bordur * carpan)` uygulanır ve sonuç [0, bordur+2] aralığına
   * sıkıştırılır — zeminin yok olmasını engellemek için. Küçük kademede bordür
   * zaten 0 olduğu için çarpan etkisizdir.
   */
  readonly bordurCarpani: number;
  /** Zeminin seyrelme olasılığı. Yüksek = az motif, geniş boşluk. */
  readonly seyreklik: number;
  /** Motif aralarına küçük motif serpme olasılığı. */
  readonly serpmeOlasiligi: number;
  readonly zeminAgirlik: MotifAgirlik;
  readonly gobekAgirlik: MotifAgirlik;
  readonly bordurAgirlik: MotifAgirlik;
  readonly dolguAgirlik: MotifAgirlik;
}

/**
 * NÖTR profil — yöresel iddia taşımayan varsayılan.
 *
 * `doku()` doğrudan çağrıldığında ve İznik'te bu kullanılır. Ağırlık tablosu
 * boş olduğu için bütün motifler eşit olasılıkla çekilir.
 */
export const NOTR: Omit<YoreProfil, "id"> = {
  duzen: [40, 25, 20, 15],
  bordurCarpani: 1,
  seyreklik: 0.4,
  serpmeOlasiligi: 0.45,
  zeminAgirlik: {},
  gobekAgirlik: {},
  bordurAgirlik: {},
  dolguAgirlik: {},
};

/**
 * KONYA — merkezî göbek (madalyon) eksenli, iri ölçekli, tek belirgin bordür.
 *
 * Karaçağ'ın (Arış 5, 2011) incelediği 28 Karapınar dokumasının 18'inde "dört
 * kollu büyükçe bir göbek" var; göbekler çengellerle çevreleniyor, yan
 * göbeklerin uçları elibelinde ile sonlanıyor ve tek kuşak bordür norm.
 * Obruk kaynağı (Kılıç Karatay & Oyman 2018) "ortasında göbek denen büyük bir
 * bölüm ve onu tamamlayan iri motifler" diyor. İkisi de düğümlü halı üzerine —
 * kompozisyon mantığı kilime kısmen taşınır, birebir değil.
 */
const KONYA_PROFIL: Omit<YoreProfil, "id"> = {
  duzen: [25, 15, 45, 15],
  bordurCarpani: 1,
  seyreklik: 0.5,
  serpmeOlasiligi: 0.35,
  zeminAgirlik: { elibelinde: 3, cengel: 3, kocboynuzu: 2, bereket: 2 },
  gobekAgirlik: { gobek: 4, bereket: 2.5, kocboynuzu: 2 },
  bordurAgirlik: { tarak: 3, suyolu: 1.5 },
  dolguAgirlik: { cengel: 2.5 },
};

/**
 * MİLAS — çok geniş bordür, sıkışmış dar zemin, az sayıda iri motif.
 *
 * MEB/MEGEP'in *Milas Halısı Desenleri* modülü Milas'ı doğrudan "geniş bordürlü
 * halılar" diye tanımlıyor; yörede bordüre "su" deniyor. Bu tek özellik yöreyi
 * görsel olarak tanınır kılıyor, o yüzden bordür çarpanı burada en yüksek.
 * Akar & Karataş (Arış 5, 2011) Milas için 173 farklı yanış adı tespit etmiş —
 * dağarcık zengin, dolayısıyla ağırlıklar geniş tabana yayılıyor.
 *
 * SINIRLILIK: Milas ağırlıklı bir düğümlü halı merkezidir. Milas'a özgü ayrı
 * bir KİLİM şemasına dair güçlü akademik kaynak bulunamadı; profil halı ve
 * Muğla yöresi düz dokuma verisinden türetildi.
 */
const MILAS_PROFIL: Omit<YoreProfil, "id"> = {
  duzen: [40, 20, 25, 15],
  bordurCarpani: 1.7,
  seyreklik: 0.65,
  serpmeOlasiligi: 0.3,
  zeminAgirlik: { kocboynuzu: 3, cengel: 2, goz: 2, yildiz: 1.5, akrep: 1.5 },
  gobekAgirlik: { kocboynuzu: 2.5, gobek: 2 },
  bordurAgirlik: { suyolu: 2, baklava: 1.5 },
  dolguAgirlik: {},
};

/**
 * SİVAS — en yoğun, en "dolu" yöre; ince bordür, küçük-orta ölçek.
 *
 * Elimizdeki en spesifik ve doğrudan DÜZ DOKUMA üzerine kaynak Karaman'ın
 * (Arış 26, 2025) Sivas yöresi çalışması: en sık motifler bereket, kırk budak,
 * çengelli baklava, koçboynuzu, elibelinde; zemin "sonsuzluk prensibiyle
 * kenarlarda ½, köşelerde ¼ kalacak şekilde" bölümlenmiş — yani kırpılmış
 * sonsuz tekrar. Koyu zemin üzerine parlak motif. Konya'nın tam zıddı.
 */
const SIVAS_PROFIL: Omit<YoreProfil, "id"> = {
  duzen: [45, 25, 10, 20],
  bordurCarpani: 0.85,
  seyreklik: 0.15,
  serpmeOlasiligi: 0.7,
  zeminAgirlik: {
    bereket: 3.5,
    kirkbudak: 3.5,
    kocboynuzu: 2.5,
    goz: 2,
    elibelinde: 1.5,
  },
  gobekAgirlik: { bereket: 2.5, kocboynuzu: 2.5 },
  bordurAgirlik: { baklava: 2.5, kurtagzi: 2 },
  dolguAgirlik: { pitrak: 2 },
};

/**
 * YÖRÜK — en seyrek, en iri ölçekli, dar bordürlü.
 *
 * "Yörük" bir coğrafya değil bir yaşam biçimi kategorisi; estetik karakteri
 * coğrafyadan bağımsız olarak ayırt edici olduğu için ayrı tutuluyor.
 * Akan'ın (kalemişi 4/7, 2016) en net bulgusu Yörük kilimlerindeki "çok sade
 * desen anlayışı". Koç Üniversitesi'nin Josephine Powell koleksiyonu dijital
 * sergisi yedi ana motif sayıyor: akrep, koçboynuzu, elibelinde, saçbağı,
 * kurt izi, yıldız, pıtrak ve göz.
 *
 * SINIRLILIK: Yörük kilimlerinde bordür yapısına dair doğrudan kaynak
 * bulunamadı. Dar bordür, göçer dokumasının dar tezgâhından ve sade kurgudan
 * çıkarılmış bir yorumdur.
 */
const YORUK_PROFIL: Omit<YoreProfil, "id"> = {
  duzen: [50, 15, 25, 10],
  bordurCarpani: 0.5,
  seyreklik: 0.85,
  serpmeOlasiligi: 0.2,
  // Yörük'ün imzası "çok sade desen anlayışı" (Akan 2016): az sayıda motif,
  // iri ölçek. Ağırlık bu yüzden az sayıda motifte YOĞUNLAŞTIRILDI — diğer
  // yörelerde ağırlık daha geniş tabana yayılır.
  zeminAgirlik: {
    akrep: 5,
    sacbagi: 5,
    kocboynuzu: 3,
    elibelinde: 2,
    yildiz: 1.5,
    pitrak: 1.5,
  },
  gobekAgirlik: { kocboynuzu: 3, yildiz: 2 },
  bordurAgirlik: { testere: 2, kurtagzi: 2 },
  dolguAgirlik: {},
};

/**
 * UŞAK — kaydırılmış eksenli sonsuz tekrar, geniş bölmeli bordür.
 *
 * Türk Patent'in Uşak Halısı coğrafi işaret tescili (No. 152, 2012) "Yıldızlı
 * Uşak" tipini şöyle tanımlıyor: "sekiz kollu yıldızlarla küçük baklava
 * biçimindeki madalyonların KAYDIRILMIŞ EKSENLER üzerinde alternatif
 * sıralanması". Bu, kütüphanenin yıldız ve baklava motiflerinin ve kaydırmalı
 * düzeninin birebir tarifi — o yüzden kaydırmalı burada baskın ağırlıkta.
 * Köy kilimlerinde (Ersan, Arış 26, 2025) sandık, muska, dörtgöz, "top" geçiyor.
 */
const USAK_PROFIL: Omit<YoreProfil, "id"> = {
  duzen: [20, 55, 15, 10],
  bordurCarpani: 1.4,
  seyreklik: 0.3,
  serpmeOlasiligi: 0.55,
  zeminAgirlik: { yildiz: 4, sandik: 3, kirkbudak: 1.5 },
  gobekAgirlik: { yildiz: 3, gobek: 2.5 },
  bordurAgirlik: { baklava: 3, tarak: 1.5 },
  dolguAgirlik: { muska: 3 },
};

/**
 * İZNİK — motif ataması YOK, bilinçli olarak nötr.
 *
 * Araştırmanın en net negatif bulgusu: İznik'in bir kilim/düz dokuma geleneği
 * aranmış, bulunamamıştır. Ne Arış'ta, ne DergiPark'ta, ne ticari literatürde
 * "İznik kilimi" diye bir yöresel grup yok; İznik adı yalnızca çini/seramik
 * bağlamında geçiyor. İznik'in gerçek dağarcığı (rumi, hatayi, lale, karanfil,
 * çintemani) eğrisel ve bitkiseldir; kilimin basamaklı, dik açılı geometrisine
 * doğal olarak tercüme olmaz.
 *
 * Bu yüzden İznik'ten yalnızca PİGMENT alınıyor — kobalt, turkuaz, mercan — ve
 * geometri pan-Anadolu ortak dağarcığında kalıyor. İznik'e uydurma bir motif
 * seti atamak, kütüphanenin tek gerçek vaadi olan dürüstlüğü bozardı.
 */
const IZNIK_PROFIL: Omit<YoreProfil, "id"> = NOTR;

const PROFIL_TABLOSU: Readonly<Record<KilimYore, Omit<YoreProfil, "id">>> = {
  konya: KONYA_PROFIL,
  milas: MILAS_PROFIL,
  sivas: SIVAS_PROFIL,
  yoruk: YORUK_PROFIL,
  usak: USAK_PROFIL,
  iznik: IZNIK_PROFIL,
};

/** Nötr profil, `id` alanı olmadan `doku()` çağrıları için. */
export const NOTR_PROFIL: YoreProfil = { id: "iznik", ...NOTR };

export const YORE_PROFILLERI: Readonly<Record<KilimYore, YoreProfil>> =
  Object.freeze(
    Object.fromEntries(
      (Object.keys(PROFIL_TABLOSU) as KilimYore[]).map((id) => [
        id,
        Object.freeze({ id, ...PROFIL_TABLOSU[id] }),
      ]),
    ) as Record<KilimYore, YoreProfil>,
  );

export function profilBul(id: string | undefined): YoreProfil {
  return (
    (id !== undefined
      ? YORE_PROFILLERI[id as KilimYore]
      : undefined) ?? NOTR_PROFIL
  );
}

/**
 * Aday listesini profil tablosuna göre ağırlık dizisine çevirir.
 *
 * Tabloda adı geçmeyen motifin ağırlığı 1'dir; yani hiçbir motif elenmez.
 * Dizi uzunluğu daima aday listesiyle aynı olur — `rng.weighted` bunu şart
 * koşuyor.
 */
export function agirlikDizisi(
  adaylar: readonly Motif[],
  tablo: MotifAgirlik,
): readonly number[] {
  return adaylar.map((m) => tablo[m.id] ?? 1);
}

/**
 * Ağırlık dizileri modül yüklenirken bir kez hesaplanır.
 *
 * `doku()` her çağrıda dört dizi üretmesin diye: 128 avatarlık bir liste
 * render eden bir sayfada bu 512 gereksiz dizi ayırma demekti.
 */
export interface AgirlikSeti {
  readonly zemin: readonly number[];
  readonly gobek: readonly number[];
  readonly bordur: readonly number[];
  readonly dolgu: readonly number[];
}

const AGIRLIK_ONBELLEK = new WeakMap<YoreProfil, AgirlikSeti>();

export function agirliklar(profil: YoreProfil): AgirlikSeti {
  const onbellek = AGIRLIK_ONBELLEK.get(profil);
  if (onbellek) return onbellek;
  const set: AgirlikSeti = {
    zemin: agirlikDizisi(ZEMIN_ADAYLARI_V2, profil.zeminAgirlik),
    gobek: agirlikDizisi(GOBEK_ADAYLARI_V2, profil.gobekAgirlik),
    bordur: agirlikDizisi(BORDUR_ADAYLARI_V2, profil.bordurAgirlik),
    dolgu: agirlikDizisi(DOLGU_ADAYLARI_V2, profil.dolguAgirlik),
  };
  AGIRLIK_ONBELLEK.set(profil, set);
  return set;
}
