/**
 * "Bağlamda" bölümünün örnek verisi.
 *
 * Tohum olarak görünen ad değil kullanıcı adı kullanılıyor — gerçekte de öyle
 * yapılır: avatar kullanıcının kimliğinden türer, görünen adından değil. Ad
 * değişince avatar değişmemeli.
 *
 * Adlar bilerek Türkçe: ğ ş ı İ ç ö ü aynı ekranda hem arayüz yazı tipini hem
 * de kütüphanenin çıktısını sınıyor.
 */

export interface Kisi {
  /** Avatarı belirleyen değer: kullanıcı adı. */
  tohum: string;
  ad: string;
}

export const YORUMCULAR: readonly (Kisi & { zaman: { en: string; tr: string } })[] =
  [
    {
      tohum: "aysegulsen",
      ad: "Ayşe Gülşen",
      zaman: { en: "2h", tr: "2sa" },
    },
    {
      tohum: "mertozkan",
      ad: "Mert Özkan",
      zaman: { en: "2h", tr: "2sa" },
    },
    {
      tohum: "denizkaraca",
      ad: "Deniz Karaca",
      zaman: { en: "4h", tr: "4sa" },
    },
    {
      tohum: "ilaydasen",
      ad: "İlayda Şen",
      zaman: { en: "yesterday", tr: "dün" },
    },
  ];

/** Sekiz kişi: iki sütun aşağı yukarı aynı yerde bitsin. */
export const UYELER: readonly Kisi[] = [
  { tohum: "aysegulsen", ad: "Ayşe Gülşen" },
  { tohum: "mertozkan", ad: "Mert Özkan" },
  { tohum: "denizkaraca", ad: "Deniz Karaca" },
  { tohum: "ilaydasen", ad: "İlayda Şen" },
  { tohum: "emreyildirim", ad: "Emre Yıldırım" },
  { tohum: "selindogan", ad: "Selin Doğan" },
  { tohum: "burakcetin", ad: "Burak Çetin" },
  { tohum: "zeynepucar", ad: "Zeynep Uçar" },
];

/** Boy merdiveninin tohumu ve basamakları. */
export const MERDIVEN_TOHUM = "denizkaraca";
export const MERDIVEN = [24, 32, 64, 128] as const;
