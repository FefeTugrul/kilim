"use client";

import { useEffect, useState } from "react";
import s from "./Kod.module.css";

/**
 * Kod bloğu.
 *
 * Sözdizimi renklendirmesi yok — sayfada renk yalnızca kilimlerden geliyor.
 * Hiyerarşiyi renk yerine hizalama kuruyor: sağdaki yorum sütunu, README'deki
 * gibi kendi kolonunda duruyor ve soluk mürekkeple yazılıyor.
 */
export type KodSatiri = string | { k: string; y?: string };

export function Kod({
  baslik,
  satirlar,
  kopyala,
  kopyalandi,
  kopyalandiDuyuru,
}: {
  baslik?: string;
  satirlar: readonly KodSatiri[];
  kopyala: string;
  kopyalandi: string;
  kopyalandiDuyuru: string;
}) {
  const [alindi, setAlindi] = useState(false);

  useEffect(() => {
    if (!alindi) return;
    const t = setTimeout(() => setAlindi(false), 1600);
    return () => clearTimeout(t);
  }, [alindi]);

  const duzMetin = satirlar
    .map((r) => (typeof r === "string" ? r : r.k))
    .join("\n");

  async function al() {
    try {
      await navigator.clipboard.writeText(duzMetin);
      setAlindi(true);
    } catch {
      /* pano yoksa sessiz kal — kod zaten ekranda */
    }
  }

  return (
    <div className={s.blok}>
      <div className={s.ust}>
        {/* Dil işareti şart: Türkçe sayfada text-transform:uppercase
            "TypeScript"i "TYPESCRİPT" yapıyor — i'nin büyüğü İ. */}
        {baslik ? (
          <span className={s.baslik} lang="en">
            {baslik}
          </span>
        ) : null}
        <button type="button" className={s.dugme} onClick={al}>
          {alindi ? kopyalandi : kopyala}
        </button>
        <span role="status" className="gorselGizli">
          {alindi ? kopyalandiDuyuru : ""}
        </span>
      </div>
      <pre className={s.pre}>
        <code>
          {satirlar.map((r, i) => {
            const bos = typeof r === "string" ? r === "" : r.k === "";
            return (
              <span className={s.satir} key={i}>
                <span className={s.k}>
                  {typeof r === "string" ? r : r.k}
                  {bos ? "​" : ""}
                </span>
                {typeof r !== "string" && r.y ? (
                  <span className={s.y}>{r.y}</span>
                ) : null}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
