/**
 * Motif kütüphanesi.
 *
 * Her motif bir ASCII satır dizisidir; renderer onu <rect> dizisine çevirir.
 * Bu kısıt bilerek konuldu: kilim dokuma tezgahının ızgarasına hapistir, eğri
 * çizilemez. Kısıt sahici olduğu için çıktı da sahici görünür.
 *
 * Hücre kodları:  . zemin   X ana renk   O vurgu   # kontur   + ikincil
 */

/** Bir motifin kilimde durabileceği yerler. */
export type Slot = "zemin" | "gobek" | "bordur" | "dolgu";

export interface Motif {
  /** Kod içinde kullanılan kimlik. */
  readonly id: string;
  /** Türkçe adı — çıktının adında geçer. */
  readonly ad: string;
  /** İngilizce karşılığı — dokümantasyon için. */
  readonly en: string;
  /** Ne anlama geldiği. Motifin yeri anlamına bağlıdır. */
  readonly anlam: string;
  /** Nerelere girebilir. Gramer bu yetkiye uyar. */
  readonly slots: readonly Slot[];
  readonly grid: readonly string[];
  /**
   * İki satırlık varyant — yalnızca bordür motiflerinde.
   *
   * Orta kademede bordür bandı 2 hücre kalınlığında. Üç satırlık motifin ilk iki
   * satırını çizmek motifi kırpıyordu: testerenin tabanı, baklavanın alt yarısı
   * hiç görünmüyordu ve bordür "serpilmiş noktalar" gibi okunuyordu.
   */
  readonly grid2?: readonly string[];
}

function boyut(grid: readonly string[]): { w: number; h: number } {
  return { w: (grid[0] as string).length, h: grid.length };
}

export function motifBoyut(m: Motif): { w: number; h: number } {
  return boyut(m.grid);
}

/** Motifi 90° saat yönünde döndürür — dikey bordür kenarları için. */
export function dondur90(grid: readonly string[]): string[] {
  const { w, h } = boyut(grid);
  const out: string[] = [];
  for (let x = 0; x < w; x++) {
    let satir = "";
    for (let y = h - 1; y >= 0; y--) satir += (grid[y] as string)[x];
    out.push(satir);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Zemin ve göbek motifleri
// ---------------------------------------------------------------------------

export const GOZ: Motif = {
  id: "goz",
  ad: "göz",
  en: "evil eye",
  anlam: "Kem gözden koruma. Kilimin en yaygın ve en eski motifi.",
  slots: ["zemin", "gobek"],
  grid: [
    "..XXX..",
    ".X...X.",
    "X..O..X",
    "X.OOO.X",
    "X..O..X",
    ".X...X.",
    "..XXX..",
  ],
};

export const PITRAK: Motif = {
  id: "pitrak",
  ad: "pıtrak",
  en: "burr",
  anlam: "Nazardan koruma ve bolluk. Dikenli pıtrak kötülüğü uzak tutar.",
  slots: ["zemin", "dolgu"],
  grid: [
    "X..X..X",
    ".X.X.X.",
    "..XXX..",
    "XXXOXXX",
    "..XXX..",
    ".X.X.X.",
    "X..X..X",
  ],
};

export const KOCBOYNUZU: Motif = {
  id: "kocboynuzu",
  ad: "koçboynuzu",
  en: "ram's horn",
  anlam: "Erkeklik, güç ve bereket. Sürünün gücünü temsil eder.",
  slots: ["zemin", "gobek"],
  grid: [
    "XXX...XXX",
    "X..X.X..X",
    "X..X.X..X",
    "XX.X.X.XX",
    ".XXXXXXX.",
    "...XXX...",
    "....X....",
  ],
};

export const YILDIZ: Motif = {
  id: "yildiz",
  ad: "yıldız",
  en: "eight-pointed star",
  anlam: "Mutluluk ve doğurganlık. Selçuklu yıldızı olarak da bilinir.",
  slots: ["gobek", "zemin"],
  grid: [
    "....X....",
    "...XXX...",
    "X..XXX..X",
    ".XXXXXXX.",
    "XXXXOXXXX",
    ".XXXXXXX.",
    "X..XXX..X",
    "...XXX...",
    "....X....",
  ],
};

export const ELIBELINDE: Motif = {
  id: "elibelinde",
  ad: "elibelinde",
  en: "hands on hips",
  anlam: "Dişilik, analık ve doğurganlık. Kilimin en figüratif motifi.",
  // Figüratif motif yalnızca zemine girer — bordüre asla.
  slots: ["zemin"],
  grid: [
    ".....X.....",
    "....XXX....",
    ".....X.....",
    "...XXXXX...",
    "XX.XXXXX.XX",
    "XX.XXXXX.XX",
    "XXXXXXXXXXX",
    ".XX.XXX.XX.",
    "..X.XXX.X..",
    "....XXX....",
    "...XXXXX...",
    "..XXXXXXX..",
    ".XXXXXXXXX.",
  ],
};

// ---------------------------------------------------------------------------
// Bordür motifleri — bant motifidir, zeminde tek başına kullanılmaz
// ---------------------------------------------------------------------------

export const SU_YOLU: Motif = {
  id: "suyolu",
  ad: "su yolu",
  en: "running water",
  anlam: "Hayat, süreklilik ve doğurganlık. Bordürde akar.",
  slots: ["bordur"],
  grid: ["X...X", ".X.X.", "..X.."],
  grid2: ["X..X", ".XX."],
};

export const TESTERE: Motif = {
  id: "testere",
  ad: "testere",
  en: "sawtooth",
  anlam: "Koruma. Dişli sıra, kilimin kenarını kötülükten sakınır.",
  slots: ["bordur"],
  grid: ["..X..", ".XXX.", "XXXXX"],
  grid2: [".XX.", "XXXX"],
};

export const BAKLAVA: Motif = {
  id: "baklava",
  ad: "baklava",
  en: "diamond",
  anlam: "Bereket. Sıralı baklavalar tarlayı ve ürünü anar.",
  slots: ["bordur"],
  grid: ["..X..", ".X.X.", "..X.."],
  grid2: [".X.X", "X.X."],
};

// ---------------------------------------------------------------------------
// Faz 6 motifleri — yöresel dağarcık
//
// Bu motifler 0.2.0'da eklendi. Hiçbiri tek bir yöreye ait değildir; yöresellik
// motifin VARLIĞINDAN değil, hangi yörede hangi ağırlıkla çekildiğinden doğar
// (bkz. src/yore.ts). Kaynak dayanakları da orada listelenir.
// ---------------------------------------------------------------------------

export const BEREKET: Motif = {
  id: "bereket",
  ad: "bereket",
  en: "fertility",
  anlam:
    "Bolluk ve bereket. Elibelinde ile koçboynuzunun bileşimi — kadınlık ve güç tek işarette.",
  // Figüratif motif bordüre girmez — bkz. elibelinde.
  slots: ["zemin", "gobek"],
  grid: [
    "XXX.....XXX",
    "X.XX...XX.X",
    "X..XX.XX..X",
    "XX..XXX..XX",
    ".XX.XXX.XX.",
    "....XXX....",
    "XX.XXXXX.XX",
    "XXXXXXXXXXX",
    "XX.XXXXX.XX",
    "..XXXXXXX..",
    ".XXXXXXXXX.",
  ],
};

/**
 * Dört köşeye uzanan kanca. Ortası dolu bırakıldı: kancaların kendisi ince,
 * kütle merkezden geliyor. Böylece küçük kademede lekesi kaybolmuyor.
 *
 * Zeminde tekrarlanınca kancalar komşularıyla kenetlenip kafes kuruyor;
 * madalyon çevreleyicisi olarak kullanılmasının sebebi de bu.
 */
export const CENGEL: Motif = {
  id: "cengel",
  ad: "çengel",
  en: "hook",
  anlam:
    "Tutunma ve nazardan korunma. Zeminde tekrarlanınca kancalar komşularıyla kenetlenip kafes kurar.",
  slots: ["zemin", "dolgu"],
  grid: [
    "XX...XX",
    "X.X.X.X",
    ".XXXXX.",
    ".XXOXX.",
    ".XXXXX.",
    "X.X.X.X",
    "XX...XX",
  ],
};

/**
 * Kıskaç, gövde, iki çift bacak ve çatallı kuyruk. Basamaklı diyagonaller
 * dışında hiçbir eğri yok.
 *
 * Kuyruk bilerek simetrik: tek yana kıvrılan bir kuyruk, mirrorVertical
 * ekseni motifin sağ yarısını sildiği için 15x13'te tamamen kayboluyordu.
 * Kuyruk uçları vurgu renginde: motifin tek renk aksanı.
 */
export const AKREP: Motif = {
  id: "akrep",
  ad: "akrep",
  en: "scorpion",
  anlam: "Zararlıdan korunma. Sokan hayvanı anar.",
  // Figüratif motif bordüre girmez — bkz. elibelinde.
  slots: ["zemin"],
  grid: [
    "XX.....XX",
    "X.X...X.X",
    "X..X.X..X",
    "...XXX...",
    "..XXXXX..",
    ".X.XXX.X.",
    "X..XXX..X",
    "..XXXXX..",
    "...XXX...",
    "..XX.XX..",
    ".XO...OX.",
  ],
};

/**
 * Karşılıklı üçgen dişler. Hem bant hem zemin motifi olduğu için ana ızgara
 * üç satırda tutuldu: bordür kalınlığı 3 iken `grid`, 2 iken `grid2`
 * kullanılır, ikisinde de motif kırpılmaz.
 *
 * Zeminde tekrarlanınca dişler birbirine geçip kesintisiz bir çene zinciri
 * kurar; kilimde kurtağzı zaten böyle, tek tek serpilmiş olarak değil,
 * sıra halinde dokunur.
 */
export const KURT_AGZI: Motif = {
  id: "kurtagzi",
  ad: "kurtağzı",
  en: "wolf's mouth",
  anlam:
    "Sürüyü ve evi tehlikeden koruma. Bordürde sıra halinde dizilen karşılıklı üçgen dişlerden oluşur.",
  // Yalnızca bordür. İlk tanımda zemin de vardı ama kütüphanenin kendi kuralı
  // açık: bant motifi zeminde tek başına kullanılmaz (bkz. SU_YOLU, TESTERE).
  // 5x3'lük bir bant zemine döşenince motif değil doku oluyordu.
  slots: ["bordur"],
  grid: ["XXX..", ".X.X.", "..XXX"],
  grid2: ["XXX..", "..XXX"],
};

/**
 * Çeyiz sandığı: kalın kapak ve taban, tek hücrelik yan duvarlar, ortada
 * bölme çubuğu ve dört gözde vurgu düğümü.
 *
 * Kütüphanenin en dolu motifi (%65 mürekkep). Kasıtlı: diğer dokuz motif
 * delikli ve ışıklı; bir tanesinin masif olması zemin dokuları arasında
 * ağırlık farkı yaratıyor.
 */
export const SANDIK: Motif = {
  id: "sandik",
  ad: "sandık",
  en: "chest",
  anlam: "Çeyiz ve birikim. Gelinin sandığını anar.",
  slots: ["zemin"],
  // İlk çizimde gövde "X.O.X.O.X" satırlarıyla bölünüyordu ve motif kilim
  // sandığı değil PENCERE gibi okunuyordu — kontak baskıda mimari bir öge
  // olarak sırıtıyordu. Kalın duvar + ortada kilit kütlesi hem siluetı
  // netleştiriyor hem 24 pikselde ayakta kalıyor.
  grid: [
    ".XXXXXXX.",
    "XXXXXXXXX",
    "XX.....XX",
    "XX.XXX.XX",
    "XX.XOX.XX",
    "XX.XXX.XX",
    "XX.....XX",
    "XXXXXXXXX",
    ".XXXXXXX.",
  ],
};

/**
 * Üçgen muska ve asma ipi. Dolgu motifi olduğu için küçük (5x5) tutuldu;
 * `yerlestir` serpmeyi ancak boşluk motiften büyükse koyar, 7x7 bir dolgu
 * çoğu düzende hiç çizilmiyordu.
 *
 * İçi doldurulmuş, kontur bırakılmadı: 24 pikselde içi boş üçgen kayboluyor.
 */
export const MUSKA: Motif = {
  id: "muska",
  ad: "muska",
  en: "amulet",
  anlam: "Kötülükten korunma. Üçgen muskayı anar.",
  slots: ["dolgu"],
  grid: [
    "..X..",
    "..X..",
    ".XXX.",
    "XXOXX",
    "XXXXX",
  ],
};

/**
 * Ortadan bağlanmış saç: iki yandan gelen basamaklı örgüler ortadaki üç
 * satırlık bantta düğümlenir.
 *
 * Bant motifin ağırlık merkezi; uçlar inceldiği için küçük kademede bile
 * silüet "bağlanmış bir şey" olarak okunur. Düğümdeki iki vurgu hücresi
 * bağın ucunu işaretler.
 */
export const SAC_BAGI: Motif = {
  id: "sacbagi",
  ad: "saçbağı",
  en: "hair-tie",
  anlam:
    "Evlenme ve birleşme. İki yandan gelen örgülerin ortada düğümlenişini betimler.",
  slots: ["zemin"],
  grid: [
    "XX.....XX",
    ".XX...XX.",
    "..XX.XX..",
    "...XXX...",
    "XXXXXXXXX",
    "XXXOXOXXX",
    "XXXXXXXXX",
    "...XXX...",
    "..XX.XX..",
    ".XX...XX.",
    "XX.....XX",
  ],
};

/**
 * İç içe iki eşkenar dörtgen; aradaki bir hücrelik boşluk kademeyi verir.
 *
 * Dış kabuk `|dx|+|dy|` toplamı 4 ve 5 olan hücrelerden oluşuyor. Bu tesadüf
 * değil: `gobekYerlestir` madalyonun çevresine yarıçapı alanın %42'si olan
 * bir kontur baklavası çiziyor ve o baklava küçük kademede tam 4, orta
 * kademede 6 yarıçapına düşüyor. 4'te halka dış kabuğun iç kenarını boyayıp
 * madalyona iki renkli kenar veriyor, 6'da ise motifin bir hücre dışından
 * geçip çerçeve oluyor. İkisi de kazanç; ölçü buna göre seçildi.
 */
export const GOBEK_MOTIFI: Motif = {
  id: "gobek",
  ad: "göbek",
  en: "medallion",
  anlam: "Ocak ve aile. Kilimin merkezinde durur.",
  slots: ["gobek"],
  grid: [
    ".....X.....",
    "....XXX....",
    "...XX.XX...",
    "..XX.X.XX..",
    ".XX.XXX.XX.",
    "XX.XXOXX.XX",
    ".XX.XXX.XX.",
    "..XX.X.XX..",
    "...XX.XX...",
    "....XXX....",
    ".....X.....",
  ],
};

/**
 * Gövdeden iki kademe halinde çıkan dal çiftleri ve tabanda kök.
 *
 * Dallar iki hücre kalın basamaklarla iniyor — tek hücrelik dal, komşu
 * motiflerin diyagonal dikenlerinden (bkz. pıtrak) ayırt edilemiyordu.
 * Motif 9 hücre geniş tutuldu ki orta kademede alana iki sütun sığsın;
 * 11 hücrede tek sütuna düşüyor ve zemin bomboş kalıyordu.
 */
export const KIRKBUDAK: Motif = {
  id: "kirkbudak",
  ad: "kırkbudak",
  en: "forty branches",
  anlam: "Çoğalma ve bereket. Çok dallı bir bitkiyi anar.",
  slots: ["zemin"],
  grid: [
    "XX..X..XX",
    ".XX.X.XX.",
    "..XXXXX..",
    "XX..X..XX",
    ".XX.X.XX.",
    "..XXXXX..",
    "...XOX...",
    "..XXXXX..",
    ".XXXXXXX.",
  ],
};

/**
 * Sürekli sırt ve üstüne oturan dikdörtgen dişler.
 *
 * `grid2` diğer bordür motiflerinin aksine daralmadı, beş hücre kaldı: tarak
 * dişlerinin aralığı motifin kimliği: iki kademede aynı ritmi vermesi için
 * periyot korunuyor, yalnızca diş boyu bir satır kısalıyor.
 */
export const TARAK: Motif = {
  id: "tarak",
  ad: "tarak",
  en: "comb",
  anlam: "Temizlik ve düzen. Gelin tarağını anar.",
  slots: ["bordur"],
  // Tarak bir SIRT + DİŞ motifidir. İlk çizim asimetrik bir L'ydi ve bantta
  // tekrarlanınca tarak değil kırık merdiven okunuyordu. Genişlik 4'e indi:
  // bant birleşim yerinde diş aralığı bozulmuyor, dişler her iki hücrede bir
  // düzenli iniyor.
  grid: ["XXXX", "X.X.", "X.X."],
  grid2: ["XXXX", "X.X."],
};

// ---------------------------------------------------------------------------

export const TUM_MOTIFLER: readonly Motif[] = [
  GOZ,
  PITRAK,
  KOCBOYNUZU,
  YILDIZ,
  ELIBELINDE,
  SU_YOLU,
  TESTERE,
  BAKLAVA,
  BEREKET,
  CENGEL,
  AKREP,
  KURT_AGZI,
  SANDIK,
  MUSKA,
  SAC_BAGI,
  GOBEK_MOTIFI,
  KIRKBUDAK,
  TARAK,
];

/**
 * DİKKAT — bu listeler kamuya açık sözleşmedir.
 *
 * Gramer motif seçerken `rng.pick` ile bu dizilere indeksler. Bir listenin
 * SIRASINI değiştirmek ya da İÇİNE eleman eklemek, mevcut bütün kullanıcıların
 * avatarını değiştirir; yani major sürüm gerektiren kırıcı bir değişikliktir.
 *
 * `TUM_MOTIFLER`'i filtreleyerek türetmek cazip ama tehlikeli: oraya eklenen
 * her yeni motif sessizce bu listelere de sızar. Bu yüzden listeler elle ve
 * donmuş halde tutulur. Yeni motifler bir sonraki major sürümün `_V2`
 * listelerine gider.
 */
export const ZEMIN_ADAYLARI_V1: readonly Motif[] = [
  GOZ,
  PITRAK,
  KOCBOYNUZU,
  YILDIZ,
  ELIBELINDE,
];
export const GOBEK_ADAYLARI_V1: readonly Motif[] = [GOZ, KOCBOYNUZU, YILDIZ];
export const BORDUR_ADAYLARI_V1: readonly Motif[] = [SU_YOLU, TESTERE, BAKLAVA];
export const DOLGU_ADAYLARI_V1: readonly Motif[] = [PITRAK];

/**
 * ÜRETİM LİSTELERİ — 0.2.0'dan itibaren gramerin kullandığı adaylar.
 *
 * `_V1` listeleri 0.1.0'ın donmuş sözleşmesi olarak yerinde duruyor; silinmiyor
 * çünkü altın testler ve dokümantasyon onlara atıf yapıyor. Üretim yolu artık
 * `_V2`'yi okuyor ve yöre profilleri bu listelere AĞIRLIK uyguluyor — eleme
 * yapmıyor. Yani her motif her yörede çıkabilir, sadece olasılığı değişir.
 * Bunun sebebi araştırma bulgusu: incelenen kaynakların hiçbiri bir motifi tek
 * bir yöreye hasretmiyor; motifler pan-Anadolu, ayrışan şey vurgu.
 *
 * Bu listelerin SIRASI da sözleşmedir — `rng.weighted` buraya indeksler.
 */
export const ZEMIN_ADAYLARI_V2: readonly Motif[] = [
  GOZ,
  PITRAK,
  KOCBOYNUZU,
  YILDIZ,
  ELIBELINDE,
  BEREKET,
  CENGEL,
  AKREP,
  SANDIK,
  SAC_BAGI,
  KIRKBUDAK,
];
export const GOBEK_ADAYLARI_V2: readonly Motif[] = [
  GOZ,
  KOCBOYNUZU,
  YILDIZ,
  BEREKET,
  GOBEK_MOTIFI,
];
export const BORDUR_ADAYLARI_V2: readonly Motif[] = [
  SU_YOLU,
  TESTERE,
  BAKLAVA,
  KURT_AGZI,
  TARAK,
];
export const DOLGU_ADAYLARI_V2: readonly Motif[] = [PITRAK, MUSKA, CENGEL];

/**
 * Belirli bir slota girebilen motifler.
 *
 * Yalnızca dokümantasyon ve test içindir — üretim yolu donmuş `_V1`
 * listelerini kullanır. Bir test, ikisinin aynı kümeyi verdiğini doğrular.
 */
export function slotMotifleri(slot: Slot): readonly Motif[] {
  return TUM_MOTIFLER.filter((m) => m.slots.includes(slot));
}
