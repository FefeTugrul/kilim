/**
 * Sayfa metinleri, iki dil.
 *
 * İngilizce birincil (README.md ile aynı hiyerarşi), Türkçe ikincil. Motif ve
 * kilim adları her iki dilde de Türkçe kalır — onlar kültürel içerik, arayüz
 * metni değil.
 *
 * Burada fonksiyon duramaz: nesne istemci bileşenlerine geçiyor ve React
 * fonksiyonları serileştiremiyor.
 */

export type Dil = "en" | "tr";

export interface BolumMetni {
  /** URL çapası. Bölüm başlıkları paylaşılabilir olsun diye anlamlı tutuluyor. */
  kimlik: string;
  sira: string;
  baslik: string;
  /** Üstbilgideki gezinti etiketi — başlığın kısası. */
  kisa: string;
  ozet: string;
}

/** Playground'a geçen parça. Bileşen bunun dışında hiçbir şeye bakmıyor. */
export interface HeroMetni {
  kimlik: string;
  baslik: string;
  altBaslik: string;
  girdiEtiket: string;
  girdiIpucu: string;
  bosUyariBaslik: string;
  bosUyariGovde: string;
  kopyala: string;
  kopyalandi: string;
  kopyalandiDuyuru: string;
  rozetOnEk: string;
  rozetGzip: string;
  rozetOlculuyor: string;
  yoreNot: string;
  /** Girdi alanının altındaki, aşağıyı bağlayan cümle. */
  akisNot: string;
}

export type KatmanEtiketId =
  | "sacak"
  | "selvedge"
  | "bordur"
  | "inceSu"
  | "gobek"
  | "zemin"
  | "abras";

export interface Icerik {
  dil: Dil;
  digerDil: { etiket: string; href: string; hreflang: string };
  anasayfa: string;
  bolumNav: string;

  hero: HeroMetni;

  bolumler: {
    hero: BolumMetni;
    neden: BolumMetni;
    kullanim: BolumMetni;
    anatomi: BolumMetni;
    motifler: BolumMetni;
    baglam: BolumMetni;
    kaynaklar: BolumMetni;
  };

  neden: {
    iddia: string;
    akis: readonly string[];
    tabloAd: string;
    olcut: string;
    sutunYuklenen: string;
    sutunKilim: string;
    satirlar: readonly { olcut: string; yuklenen: string; kilim: string }[];
    notlar: readonly { baslik: string; metin: string }[];
  };

  kullanim: {
    giris: string;
    kurBaslik: string;
    kurNot: string;
    uretBaslik: string;
    uretNot: string;
    reactBaslik: string;
    reactNot: string;
    hookNot: string;
    secenekBaslik: string;
    alanBaslik: string;
    varsayilanOnEk: string;
    hataBaslik: string;
    hataNot: string;
  };

  anatomi: {
    giris: string;
    yoreEtiket: string;
    abrasNot: string;
    etiketler: Record<KatmanEtiketId, { ad: string; not: string }>;
    altyazi: string;
  };

  motifKurali: string;

  baglam: {
    yorumBaslik: string;
    uyeBaslik: string;
    uyeSayiSonEk: string;
    yorumlar: readonly [string, string, string, string];
    merdivenBaslik: string;
    merdivenBuyutme: string;
    altyazi: string;
  };

  kaynaklar: {
    motifBaslik: string;
    renkBaslik: string;
    lisansBaslik: string;
    uyari: string;
  };

  altbilgi: {
    lisans: string;
    yazar: string;
    kaynakKodu: string;
  };
}

export const EN: Icerik = {
  dil: "en",
  digerDil: { etiket: "Türkçe", href: "/tr", hreflang: "tr" },
  anasayfa: "/",
  bolumNav: "Sections",

  hero: {
    kimlik: "playground",
    baslik: "Deterministic Anatolian kilim avatars from any string.",
    altBaslik:
      "The pattern is computed from the text, every time. Nothing is stored, nothing is fetched — the seed is the record.",
    girdiEtiket: "Seed",
    girdiIpucu: "a user id, an email, a name",
    bosUyariBaslik: "An empty seed throws.",
    bosUyariGovde:
      'Not an oversight. A fallback like user.id ?? "" would hand every affected user the same avatar, and nobody would notice. The library stops instead.',
    kopyala: "copy",
    kopyalandi: "copied",
    kopyalandiDuyuru: "Copied to the clipboard.",
    rozetOnEk: "one avatar at 128 px",
    rozetGzip: "gzipped",
    rozetOlculuyor: "measuring",
    yoreNot: "the same seed, six regions",
    akisNot:
      "Whatever you type here is what the anatomy plate further down takes apart — and it never leaves your browser.",
  },

  bolumler: {
    hero: {
      kimlik: "playground",
      sira: "01",
      baslik: "Playground",
      kisa: "Playground",
      ozet: "",
    },
    neden: {
      kimlik: "why",
      sira: "02",
      baslik: "Why compute an avatar instead of storing one",
      kisa: "Why",
      ozet: "No file, no database row, no CDN, nothing to delete.",
    },
    kullanim: {
      kimlik: "usage",
      sira: "03",
      baslik: "Usage",
      kisa: "Usage",
      ozet: "Install, pass a seed, print the SVG. In React it is one component.",
    },
    anatomi: {
      kimlik: "anatomy",
      sira: "04",
      baslik: "Anatomy",
      kisa: "Anatomy",
      ozet: "Every layer is read back out of the library's own output — for any seed you type.",
    },
    motifler: {
      kimlik: "motifs",
      sira: "05",
      baslik: "The eighteen motifs",
      kisa: "Motifs",
      ozet:
        "Each one is an ASCII grid with a documented meaning and a place it is allowed to stand.",
    },
    baglam: {
      kimlik: "in-context",
      sira: "06",
      baslik: "At 24 and 32 pixels",
      kisa: "In context",
      ozet: "The size an avatar is really drawn at, and what survives there.",
    },
    kaynaklar: {
      kimlik: "sources",
      sira: "07",
      baslik: "Sources",
      kisa: "Sources",
      ozet: "Motif references and licences.",
    },
  },

  neden: {
    iddia:
      "The most important thing this library does is what it does not do: it stores nothing.",
    akis: [
      "The usual flow is: the user uploads a photo, the file goes to disk or S3, it is served from a CDN, and a database row holds the URL. Everything that follows — backups, moderation, resizing, deletion requests — exists because that file exists.",
      "Here there is no file. The pattern is computed from the string each time it is drawn, so what an ordinary product keeps in a row, this one derives from something your database already holds: the user id.",
      "That is what makes the seed the record. There is no second copy to keep in sync, back up or delete — lose the SVG and you recompute it. It is also why determinism here is structural rather than stylistic: reach for Math.random and the avatar changes on every render, with nothing anywhere to restore it from. That would not be a matter of taste; it would be a bug, because generation has taken the place of storage.",
    ],
    tabloAd: "Uploaded avatar compared with a computed kilim",
    olcut: "Criterion",
    sutunYuklenen: "Uploaded avatar",
    sutunKilim: "kilim",
    satirlar: [
      { olcut: "Storage", yuklenen: "A file plus a database row", kilim: "None" },
      {
        olcut: "Network request",
        yuklenen: "A CDN fetch per avatar",
        kilim: "None — the SVG is already in the HTML",
      },
      {
        olcut: "Personal data",
        yuklenen: "The uploaded photo is stored",
        kilim: "Nothing is stored",
      },
      { olcut: "Offline", yuklenen: "Fails", kilim: "Works" },
      {
        olcut: "Deletion request",
        yuklenen: "File, row and CDN cache",
        kilim: "No separate avatar record to delete",
      },
      {
        olcut: "Moderation",
        yuklenen: "Every upload is a liability",
        kilim: "The output cannot be chosen",
      },
    ],
    notlar: [
      {
        baslik: "The same user, the same kilim, at every size",
        metin:
          "Palette, main motif, and layout do not depend on size. A user's 24 px avatar in a comment list and their 128 px avatar on a profile page are the same kilim, drawn with more or less detail. Tests verify this over 1,000 seeds.",
      },
      {
        baslik: "It stops rather than guessing",
        metin:
          "An undefined seed, an empty string, an unknown region — each of these would silently give a whole group of users the same avatar, and nobody would notice. All three throw.",
      },
      {
        baslik: "Zero dependencies, pure SVG, SSR-safe",
        metin:
          "No Math.random, no Date, no locale. The same input produces the same output in the browser, in Node, and during server-side rendering. React is an optional peer dependency and lives on its own subpath.",
      },
    ],
  },

  kullanim: {
    giris:
      "Three steps: install it, pass a seed, print the SVG. In React the third step is a single component, and there is a hook when you need the result rather than the element.",
    kurBaslik: "Install",
    kurNot:
      "No dependencies, so nothing else comes with it. ESM and CJS, with types for both.",
    uretBaslik: "Generate",
    uretNot:
      "generateKilim returns the markup and everything the pattern knows about itself — the name it was given, the motifs woven into it, the palette it used.",
    reactBaslik: "In React",
    reactNot:
      "<Kilim /> accepts everything an <svg> element accepts — className, style, onClick, ref, aria-* — plus seed, size, region, label, and the rounded shorthand.",
    hookNot: "And when you want the result rather than the element:",
    secenekBaslik: "Options",
    alanBaslik: "Returned fields",
    varsayilanOnEk: "default",
    hataBaslik: "Invalid input throws",
    hataNot:
      'Failing silently is far more expensive than stopping loudly. If user.id arrives undefined somewhere, every affected user shares one avatar and nobody notices. The same reasoning covers the empty string, which is exactly what a `?? ""` fallback produces.',
  },

  anatomi: {
    giris:
      "The plate on the left is the kilim of whatever seed you typed at the top of the page. Hover a layer below — or tap it — and its boundary appears on the kilim. The palette buttons change the colours without changing a single cell.",
    yoreEtiket: "Palette",
    abrasNot: "the ground tone shifts every {n} cells",
    etiketler: {
      sacak: { ad: "fringe", not: "warp ends, left unwoven" },
      selvedge: { ad: "selvedge", not: "the bound edge that stops it from fraying" },
      bordur: { ad: "border", not: "three cells, cut at the corner" },
      inceSu: { ad: "thin water", not: "one cell, separating border from field" },
      gobek: {
        ad: "medallion",
        not: "one motif at the centre, the field around it",
      },
      zemin: { ad: "field", not: "the motif repeats across the whole ground" },
      abras: { ad: "abraş", not: "the ground shifts with the dye lot" },
    },
    altyazi:
      "Nothing here is drawn by hand. The layers are read back out of the library's own output, so the plate describes this kilim — which layout the field uses, how thick the selvedge came out, how wide the abraş bands are — not a generic diagram. The kilim is mirrored left to right and never top to bottom: a kilim has a top and a bottom, and that single asymmetry is what separates it from wallpaper.",
  },

  motifKurali:
    "Placement is not decoration. A figurative motif never enters the border and a band motif never stands alone in the field — the generator enforces this and the tests check it. Every square above is drawn with one palette so that what you compare is form, not colour.",

  baglam: {
    yorumBaslik: "Comments · 32 px",
    uyeBaslik: "Members · 24 px",
    uyeSayiSonEk: "people",
    yorumlar: [
      "The graphs came back to normal after last night's deploy — nothing else was needed.",
      "Same here. I'll take another look in the morning to be sure.",
      "I've put the meeting notes in the repo; the decisions are at the bottom.",
      "Thanks. I'll read through and get back to you by Tuesday.",
    ],
    merdivenBaslik: "One seed, four sizes",
    merdivenBuyutme:
      "Top row: the size each one is actually drawn at. Bottom row: the same four at one size — the only way to see what the small ones give up.",
    altyazi:
      "Only the level of detail depends on size, and the grid thins out with it. Measured over 2,000 seeds, uniqueness is 85% at 24 px and 100% at 64 px and above; variety is deliberately lower at the smallest size: at 24 px, legibility comes before variety, and identity across sizes comes before both. The round crop is the one place this page breaks its own no-rounded-corners rule, because that is how most interfaces draw an avatar, and the kilim has to survive it. Every avatar here is drawn with label: false, so the SVG is aria-hidden: the name is already next to it, and a screen reader should not read the pattern twice.",
  },

  kaynaklar: {
    motifBaslik: "Motifs",
    renkBaslik: "Colour",
    lisansBaslik: "Licences",
    uyari:
      "Motif meanings are not fixed. The same figure is read differently from one region to the next, from one weaver to the next, from one source to the next, and a good deal of what circulates online as “the meaning” is later attribution. What this library ships is one documented reading, taken from the works above; it is not the only one, and it is not offered as the last word.",
  },

  altbilgi: {
    lisans: "MIT",
    yazar: "Furkan Efe Tuğrul",
    kaynakKodu: "Source",
  },
};

export const TR: Icerik = {
  dil: "tr",
  digerDil: { etiket: "English", href: "/", hreflang: "en" },
  anasayfa: "/tr",
  bolumNav: "Bölümler",

  hero: {
    kimlik: "deneme",
    baslik: "Herhangi bir metinden deterministik Anadolu kilimi avatarları.",
    altBaslik:
      "Desen her seferinde metinden hesaplanır. Hiçbir şey saklanmaz, hiçbir şey getirilmez — kayıt, tohumun kendisidir.",
    girdiEtiket: "Tohum",
    girdiIpucu: "bir kullanıcı kimliği, e-posta, ad",
    bosUyariBaslik: "Boş tohum hata fırlatır.",
    bosUyariGovde:
      'Gözden kaçmış değil. user.id ?? "" gibi bir yedek, etkilenen bütün kullanıcılara aynı avatarı verirdi ve kimse fark etmezdi. Kütüphane bunun yerine duruyor.',
    kopyala: "kopyala",
    kopyalandi: "kopyalandı",
    kopyalandiDuyuru: "Panoya kopyalandı.",
    rozetOnEk: "128 px'te tek avatar",
    rozetGzip: "gzip",
    rozetOlculuyor: "ölçülüyor",
    yoreNot: "aynı tohum, altı yöre",
    akisNot:
      "Buraya ne yazarsan, aşağıdaki anatomi levhası onu söküyor — ve yazdığın şey tarayıcından çıkmıyor.",
  },

  bolumler: {
    hero: {
      kimlik: "deneme",
      sira: "01",
      baslik: "Deneme alanı",
      kisa: "Deneme",
      ozet: "",
    },
    neden: {
      kimlik: "neden",
      sira: "02",
      baslik: "Avatarı saklamak yerine hesaplamak",
      kisa: "Neden",
      ozet: "Dosya yok, veritabanı satırı yok, CDN yok, silinecek bir şey yok.",
    },
    kullanim: {
      kimlik: "kullanim",
      sira: "03",
      baslik: "Kullanım",
      kisa: "Kullanım",
      ozet: "Kur, tohumu ver, SVG'yi bas. React'te tek bir bileşen.",
    },
    anatomi: {
      kimlik: "anatomi",
      sira: "04",
      baslik: "Anatomi",
      kisa: "Anatomi",
      ozet: "Her katman kütüphanenin kendi çıktısından okunuyor — yazdığın her tohum için.",
    },
    motifler: {
      kimlik: "motifler",
      sira: "05",
      baslik: "On sekiz motif",
      kisa: "Motifler",
      ozet:
        "Her biri bir ASCII ızgara: belgelenmiş bir anlamı ve durabileceği bir yeri var.",
    },
    baglam: {
      kimlik: "baglamda",
      sira: "06",
      baslik: "24 ve 32 pikselde",
      kisa: "Bağlamda",
      ozet: "Avatarın gerçekte çizildiği boy ve orada neyin ayakta kaldığı.",
    },
    kaynaklar: {
      kimlik: "kaynaklar",
      sira: "07",
      baslik: "Kaynaklar",
      kisa: "Kaynaklar",
      ozet: "Motif referansları ve lisanslar.",
    },
  },

  neden: {
    iddia:
      "Bu kütüphanenin yaptığı en önemli şey, yapmadığı şeydir: hiçbir şey saklamıyor.",
    akis: [
      "Alışıldık akış şudur: kullanıcı fotoğraf yükler, dosya diske ya da S3'e gider, CDN'den servis edilir, bir veritabanı satırı adresi tutar. Sonrasında gelen ne varsa — yedekleme, moderasyon, yeniden boyutlandırma, silme talepleri — hepsi o dosya var olduğu için vardır.",
      "Burada dosya yok. Desen her çizilişinde metinden hesaplanıyor; yani sıradan bir ürünün bir satırda sakladığı şeyi bu ürün, veritabanında zaten duran bir veriden türetiyor: kullanıcı kimliğinden.",
      "Kaydı tohumun kendisi yapan şey bu. Eşitlenecek, yedeklenecek ya da silinecek ikinci bir kopya yok — SVG'yi kaybedersen yeniden hesaplarsın. Determinizmin burada bir üslup tercihi değil yapısal bir zorunluluk olmasının sebebi de bu: Math.random'a uzanırsan avatar her render'da değişir ve onu geri getirebileceğin hiçbir yer kalmaz. Bu bir zevk meselesi olmazdı; hata olurdu, çünkü üretim, depolamanın yerine geçmiş durumdadır.",
    ],
    tabloAd: "Yüklenen avatar ile hesaplanan kilimin karşılaştırması",
    olcut: "Ölçüt",
    sutunYuklenen: "Yüklenen avatar",
    sutunKilim: "kilim",
    satirlar: [
      {
        olcut: "Depolama",
        yuklenen: "Bir dosya ve bir veritabanı satırı",
        kilim: "Yok",
      },
      {
        olcut: "Ağ isteği",
        yuklenen: "Avatar başına bir CDN çağrısı",
        kilim: "Yok — SVG zaten HTML'in içinde",
      },
      {
        olcut: "Kişisel veri",
        yuklenen: "Yüklenen fotoğraf saklanır",
        kilim: "Hiçbir şey saklanmaz",
      },
      { olcut: "Çevrimdışı", yuklenen: "Çalışmaz", kilim: "Çalışır" },
      {
        olcut: "Silme talebi",
        yuklenen: "Dosya, satır ve CDN önbelleği",
        kilim: "Ayrıca silinecek bir avatar kaydı yok",
      },
      {
        olcut: "Moderasyon",
        yuklenen: "Her yükleme bir yükümlülük",
        kilim: "Çıktı seçilemiyor",
      },
    ],
    notlar: [
      {
        baslik: "Aynı kullanıcı her boyda aynı kilimi alır",
        metin:
          "Palet, ana motif ve düzen boyuta bağlı değil. Bir kullanıcının yorum listesindeki 24 piksellik avatarı ile profil sayfasındaki 128 piksellik avatarı aynı kilimdir; yalnız daha az ya da daha çok detayla çizilir. Testler bunu 1.000 tohumda doğruluyor.",
      },
      {
        baslik: "Tahmin etmez, durur",
        metin:
          "Tanımsız tohum, boş tohum, bilinmeyen yöre — üçü de sessizce koca bir kullanıcı grubuna aynı avatarı verirdi ve kimse fark etmezdi. Üçü de hata fırlatıyor.",
      },
      {
        baslik: "Sıfır bağımlılık, saf SVG, SSR uyumlu",
        metin:
          "Math.random yok, Date yok, yerel ayar yok. Aynı girdi tarayıcıda, Node'da ve sunucu tarafı render'da aynı çıktıyı verir. React isteğe bağlı bir peer bağımlılıktır ve kendi alt yolunda yer alır.",
      },
    ],
  },

  kullanim: {
    giris:
      "Üç adım: kur, tohumu ver, SVG'yi bas. React'te üçüncü adım tek bir bileşene iniyor; öğe yerine sonucun kendisini isteyenler için de bir hook var.",
    kurBaslik: "Kur",
    kurNot:
      "Bağımlılığı yok, yanında başka bir şey gelmiyor. ESM ve CJS, ikisinin de tipleriyle.",
    uretBaslik: "Üret",
    uretNot:
      "generateKilim hem işaretlemeyi hem desenin kendisi hakkında bildiği her şeyi döndürür: aldığı ad, dokunan motifler, kullandığı palet.",
    reactBaslik: "React'te",
    reactNot:
      "<Kilim /> bir <svg> öğesinin kabul ettiği her şeyi kabul eder — className, style, onClick, ref, aria-* — üstüne seed, size, region, label ve rounded kısayolu.",
    hookNot: "Öğe yerine sonucun kendisini istediğinde:",
    secenekBaslik: "Seçenekler",
    alanBaslik: "Dönen alanlar",
    varsayilanOnEk: "varsayılan",
    hataBaslik: "Geçersiz girdi hata fırlatır",
    hataNot:
      'Sessizce yanlış çalışmak, gürültüyle durmaktan çok daha pahalıdır. Bir yerde user.id tanımsız gelirse etkilenen bütün kullanıcılar aynı avatarı paylaşır ve kimse fark etmez. Aynı gerekçe boş tohum için de geçerli — `?? ""` yedeği tam olarak onu üretir.',
  },

  anatomi: {
    giris:
      "Soldaki levha, sayfanın başında yazdığın tohumun kilimi. Aşağıdaki katmanlardan birinin üstüne gel ya da dokun; sınırı kilimin üstünde beliriyor. Palet düğmeleri tek bir hücreyi değiştirmeden rengi değiştiriyor.",
    yoreEtiket: "Palet",
    abrasNot: "zemin tonu her {n} hücrede kayıyor",
    etiketler: {
      sacak: { ad: "saçak", not: "dokunmadan bırakılan çözgü ucu" },
      selvedge: {
        ad: "selvedge",
        not: "kenarı bağlayan, sökülmesini durduran şerit",
      },
      bordur: { ad: "bordür", not: "üç hücre, köşede kesilir" },
      inceSu: { ad: "ince su", not: "tek hücre, bordürü zeminden ayırır" },
      gobek: { ad: "göbek", not: "ortada tek motif, etrafında zemin" },
      zemin: { ad: "zemin", not: "motif bütün alana tekrarlanarak yayılır" },
      abras: { ad: "abraş", not: "boya partisi değişince zemin kayar" },
    },
    altyazi:
      "Buradaki hiçbir şey elle çizilmedi. Katmanlar kütüphanenin kendi çıktısından geri okunuyor; bu yüzden levha genel bir şema değil, bu kilimi anlatıyor: zeminin hangi düzende olduğunu, selvedge'in kaç halka çıktığını, abraş bantlarının kaç hücre olduğunu. Kilim soldan sağa aynalanır, asla yukarıdan aşağıya: kilimin bir üstü bir altı vardır ve onu duvar kâğıdından ayıran tek asimetri budur.",
  },

  motifKurali:
    "Yerleşim süs değil. Figüratif bir motif bordüre girmez, bant motifi zeminde tek başına durmaz — üreteç buna uyar, testler denetler. Yukarıdaki kareler tek paletle çizildi: karşılaştırılan şey biçim, renk değil.",

  baglam: {
    yorumBaslik: "Yorumlar · 32 px",
    uyeBaslik: "Üyeler · 24 px",
    uyeSayiSonEk: "kişi",
    yorumlar: [
      "Dün geceki dağıtımdan sonra grafikler normale döndü, başka bir şey gerekmedi.",
      "Ben de öyle gördüm. Yine de sabah bir daha bakayım.",
      "Toplantı notlarını depoya koydum; karar maddeleri en altta.",
      "Teşekkürler. Okuyup salıya kadar döneceğim.",
    ],
    merdivenBaslik: "Tek tohum, dört boy",
    merdivenBuyutme:
      "Üst sıra: her birinin gerçekte çizildiği boy. Alt sıra: dördü de tek boyda — küçüklerin neyi feda ettiği ancak böyle görünüyor.",
    altyazi:
      "Boyuta bağlı olan tek şey detay kademesi; ızgara da onunla birlikte seyreliyor. 2.000 tohumda ölçüldü: benzersizlik 24 pikselde %85, 64 piksel ve üstünde %100. En küçük boyda çeşitlilik bilerek daha düşük; çünkü 24 pikselde okunurluk çeşitlilikten, boyutlar arası kimlik ikisinden de önce gelir. Yuvarlak kırpma, bu sayfanın kendi “köşe yuvarlama yok” kuralını çiğnediği tek yer: arayüzlerin çoğu avatarı böyle gösteriyor ve kilimin buna dayanması gerekiyor. Buradaki her avatar label: false ile çiziliyor, yani SVG aria-hidden: adı zaten yanında yazıyor ve ekran okuyucunun deseni ikinci kez okumasına gerek yok.",
  },

  kaynaklar: {
    motifBaslik: "Motifler",
    renkBaslik: "Renk",
    lisansBaslik: "Lisanslar",
    uyari:
      "Motif anlamları sabit değildir. Aynı figür yöreden yöreye, dokuyucudan dokuyucuya, kaynaktan kaynağa farklı okunur; internette “anlamı budur” diye dolaşanların önemli bir kısmı da sonradan yakıştırmadır. Bu kütüphanenin taşıdığı şey, yukarıdaki eserlerden alınmış belgelenmiş bir okuma — tek okuma değil, son söz hiç değil.",
  },

  altbilgi: {
    lisans: "MIT",
    yazar: "Furkan Efe Tuğrul",
    kaynakKodu: "Kaynak kodu",
  },
};
