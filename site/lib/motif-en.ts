import { TUM_MOTIFLER, type Slot } from "kilim-avatars";

/**
 * Motiflerin İngilizce anlamları.
 *
 * Türkçesi kütüphanenin kendi `anlam` alanından geliyor; burada yalnızca
 * çevirisi duruyor. İki metnin ağırlığı bilerek eşit: İngilizce okuyan da
 * motifin ne demek olduğunu aynı ayrıntıyla öğreniyor.
 */
export const ANLAM_EN: Record<string, string> = {
  goz: "Protection from the evil eye. The oldest and most common motif on a kilim.",
  pitrak:
    "Protection and abundance. The thorned burr keeps harm at a distance.",
  kocboynuzu:
    "Masculinity, strength and fertility. It stands for the power of the flock.",
  yildiz: "Happiness and fertility. Also known as the Seljuk star.",
  elibelinde:
    "Femininity, motherhood and fertility. The most figurative motif on a kilim.",
  suyolu: "Life, continuity and fertility. It runs in the border.",
  testere: "Protection. The toothed row keeps evil away from the kilim's edge.",
  baklava: "Abundance. Rows of diamonds recall the field and its crop.",
  bereket:
    "Abundance. Read as elibelinde joined to a ram's horn — womanhood and strength in one sign.",
  cengel: "Holding fast, and warding off the evil eye.",
  akrep:
    "Read as a wish for protection from harm; it recalls the stinging animal.",
  kurtagzi:
    "Read as a wish to keep the flock and the home out of danger.",
  sandik: "Dowry and savings. It recalls the bride's chest.",
  muska:
    "Read as protection from evil; it recalls the triangular amulet worn against it.",
  sacbagi: "Read as a wish for marriage and union.",
  gobek: "The centre of the kilim. Read as hearth and family.",
  kirkbudak:
    "Multiplication and abundance. It recalls a plant of many branches.",
  tarak:
    "Read as a wish for cleanliness and order; it recalls the bride's comb.",
};

/**
 * `Motif.id` bir birleşim tipi değil, düpedüz `string` — yani derleyici eksik
 * çeviriyi yakalayamıyor ve kütüphaneye yeni bir motif eklendiğinde İngilizce
 * sayfa sessizce boş bir kutu basardı. Derleme zamanında duruyoruz.
 *
 * Bu bekçi işini yaptı: 0.2.0 on yeni motif getirdi ve çeviriler eklenene kadar
 * `next build` kırıldı. Kırılması doğrusuydu.
 */
for (const m of TUM_MOTIFLER) {
  if (!(m.id in ANLAM_EN)) {
    throw new Error(
      `motif-en: "${m.id}" motifinin İngilizce anlamı yok. ` +
        "Kütüphaneye yeni motif eklenmiş; çeviriyi de ekle.",
    );
  }
}

export const SLOT_EN: Record<Slot, string> = {
  zemin: "field",
  gobek: "medallion",
  bordur: "border",
  dolgu: "filler",
};

export const SLOT_TR: Record<Slot, string> = {
  zemin: "zemin",
  gobek: "göbek",
  bordur: "bordür",
  dolgu: "dolgu",
};
