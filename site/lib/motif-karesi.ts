import {
  CELL_ASPECT,
  createGrid,
  motifBoyut,
  stamp,
  toSvg,
  MILAS,
  type Motif,
} from "kilim-avatars";

/**
 * Sözlükteki izole motif karesi.
 *
 * 15 × 15 hücre. Kare değil, dikdörtgen — çünkü hücrenin kendisi 1 : 1.15.
 * Avatarın kare olmak zorunda olması, motifin de kare gösterilmesi gerektiği
 * anlamına gelmiyor; tam tersine, motifi kareye sıkıştırmak onu yalan
 * gösterirdi. En büyük motif (elibelinde, 11 × 13) burada nefes alıyor.
 *
 * Hepsi tek paletle (Milas) çiziliyor: sözlükte karşılaştırılan şey biçim,
 * renk değil.
 */
const IZGARA = { w: 15, h: 15 } as const;

export function motifKaresi(motif: Motif, piksel: number): string {
  const g = createGrid(IZGARA.w, IZGARA.h);
  const { w, h } = motifBoyut(motif);

  if (motif.slots.length === 1 && motif.slots[0] === "bordur") {
    // Bant motifi tek başına durmaz — kilimde de durmuyor. Yatayda tekrarlanıp
    // bir şerit olarak, dikeyde ortalanmış gösteriliyor.
    const y0 = Math.floor((IZGARA.h - h) / 2);
    for (let x = 0; x + w <= IZGARA.w; x += w) stamp(g, motif.grid, x, y0);
  } else {
    stamp(
      g,
      motif.grid,
      Math.floor((IZGARA.w - w) / 2),
      Math.floor((IZGARA.h - h) / 2),
    );
  }

  const cell = piksel / IZGARA.w;
  return toSvg(g, MILAS.renkler, { cell, cellH: cell * CELL_ASPECT });
}
