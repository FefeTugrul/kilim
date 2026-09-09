import type { KodSatiri } from "@/components/Kod";
import { PAKET_AD } from "./paket";

/**
 * Kullanım örnekleri.
 *
 * Kod dile bağlı değil: tanımlayıcılar İngilizce, açıklama çevresindeki
 * düzyazıda. Paket adı sabit yazılmıyor — bir kez daha değişirse örnekler de
 * yanlışa düşmesin.
 */

export const KURULUM_KODU: readonly KodSatiri[] = [
  { k: `npm install ${PAKET_AD}` },
];

export const KURULUM_REACT_KODU: readonly KodSatiri[] = [
  { k: `npm install ${PAKET_AD} react` },
];

export const TEMEL_KOD: readonly KodSatiri[] = [
  { k: `import { generateKilim } from "${PAKET_AD}";` },
  "",
  { k: "const k = generateKilim(user.id);" },
  "",
  { k: "k.svg", y: "'<svg …>' — kendi kendine yeter, dış kaynak yok" },
  { k: "k.name", y: "'Milas — koçboynuzu sıra düzenli iki tonlu, baklava bordürlü'" },
  { k: "k.nameEn", y: "\"Milas kilim — ram's horn in rows, two-tone…\"" },
  { k: "k.motifs", y: "['koçboynuzu', 'baklava']" },
  { k: "k.region", y: "'milas' — tohumdan seçildi" },
  { k: "k.palette", y: "['#EFE5D0', '#A8322A', '#C9922E', …]" },
  { k: "k.layout", y: "'tekrar'" },
];

export const TEMEL_KOD_EN: readonly KodSatiri[] = [
  { k: `import { generateKilim } from "${PAKET_AD}";` },
  "",
  { k: "const k = generateKilim(user.id);" },
  "",
  { k: "k.svg", y: "'<svg …>' — self-contained, no external references" },
  { k: "k.name", y: "'Milas — koçboynuzu sıra düzenli iki tonlu, baklava bordürlü'" },
  { k: "k.nameEn", y: "\"Milas kilim — ram's horn in rows, two-tone…\"" },
  { k: "k.motifs", y: "['koçboynuzu', 'baklava']" },
  { k: "k.region", y: "'milas' — picked from the seed" },
  { k: "k.palette", y: "['#EFE5D0', '#A8322A', '#C9922E', …]" },
  { k: "k.layout", y: "'tekrar'" },
];

export const REACT_KOD: readonly KodSatiri[] = [
  { k: `import { Kilim } from "${PAKET_AD}/react";` },
  "",
  { k: "<Kilim seed={user.id} size={40} rounded />;" },
];

export const HOOK_KOD: readonly KodSatiri[] = [
  { k: `import { useKilim } from "${PAKET_AD}/react";` },
  "",
  { k: "const { svg, name, palette } = useKilim(user.id, { size: 64 });" },
];

export const HATA_KOD: readonly KodSatiri[] = [
  { k: 'generateKilim(user.id ?? "");', y: "TypeError — boş tohum" },
  { k: 'generateKilim(user.id, { region: "bursa" });', y: "TypeError — bilinmeyen yöre" },
];

export const HATA_KOD_EN: readonly KodSatiri[] = [
  { k: 'generateKilim(user.id ?? "");', y: "TypeError — empty seed" },
  { k: 'generateKilim(user.id, { region: "bursa" });', y: "TypeError — unknown region" },
];

/** `generateKilim` seçenekleri. */
export const SECENEKLER = [
  {
    ad: "size",
    tip: "number",
    varsayilan: "128",
    en: "Side length in px. Clamped to 8–2048; it also picks the level of detail.",
    tr: "Kenar uzunluğu (px). 8–2048 arasına sıkıştırılır; detay kademesini de o belirler.",
  },
  {
    ad: "region",
    tip: "KilimRegion",
    varsayilan: "seed",
    en: "Pins the regional palette. An unknown value throws.",
    tr: "Yöresel paleti sabitler. Bilinmeyen değer hata fırlatır.",
  },
  {
    ad: "label",
    tip: "string | false",
    varsayilan: "nameEn",
    en: "SVG <title>. Pass false to mark the SVG aria-hidden.",
    tr: "SVG <title> içeriği. false verilirse SVG aria-hidden olur.",
  },
] as const;

/** Dönen alanlar. */
export const ALANLAR = [
  {
    ad: "svg",
    tip: "string",
    en: "Self-contained SVG markup",
    tr: "Bağımsız SVG metni",
  },
  {
    ad: "name",
    tip: "string",
    en: "Turkish name, with the motifs as they are woven",
    tr: "Türkçe ad, motifler dokunduğu hâliyle",
  },
  {
    ad: "nameEn",
    tip: "string",
    en: "English name — this is what goes in <title>",
    tr: "İngilizce ad — <title> içine giren bu",
  },
  {
    ad: "motifs",
    tip: "string[]",
    en: "Turkish motif names used",
    tr: "Kullanılan motiflerin Türkçe adları",
  },
  {
    ad: "region",
    tip: "KilimRegion",
    en: "konya · milas · sivas · yoruk · usak · iznik",
    tr: "konya · milas · sivas · yoruk · usak · iznik",
  },
  {
    ad: "palette",
    tip: "string[]",
    en: "The five hex values used (a fresh copy each call)",
    tr: "Kullanılan beş hex (her çağrıda yeni kopya)",
  },
  {
    ad: "layout",
    tip: "string",
    en: "Field layout: rows, brick-laid, medallion or banded",
    tr: "Zemin düzeni: sıra, kaydırmalı, göbek ya da bantlı",
  },
] as const;
