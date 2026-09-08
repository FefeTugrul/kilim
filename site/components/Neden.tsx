import type { Icerik } from "@/lib/icerik";
import s from "./Neden.module.css";

/**
 * Projenin asıl iddiası: avatar saklanmıyor, hesaplanıyor.
 *
 * Karşılaştırma bir tablo, çünkü asıl mesele satır satır aynı soruya iki farklı
 * cevap: yüklenen fotoğraf ne yapıyor, hesaplanan desen ne yapmıyor.
 */
export default function Neden({ icerik }: { icerik: Icerik }) {
  const t = icerik.neden;

  return (
    <>
      <div className={s.ust}>
        <p className={s.iddia}>{t.iddia}</p>
        <div className={s.akis}>
          {t.akis.map((c) => (
            <p className={s.akisMetin} key={c}>
              {c}
            </p>
          ))}
        </div>
      </div>

      <div className={s.tabloKutu}>
        <table className={s.tablo}>
          <caption className="gorselGizli">{t.tabloAd}</caption>
          <thead>
            <tr>
              <th scope="col" className={s.bosBaslik}>
                <span className="gorselGizli">{t.olcut}</span>
              </th>
              <th scope="col">{t.sutunYuklenen}</th>
              <th scope="col" className={s.bizSutun}>
                {t.sutunKilim}
              </th>
            </tr>
          </thead>
          <tbody>
            {t.satirlar.map((r) => (
              <tr key={r.olcut}>
                <th scope="row" className={s.olcut}>
                  {r.olcut}
                </th>
                <td>{r.yuklenen}</td>
                <td className={s.bizSutun}>{r.kilim}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={s.altSatir}>
        {t.notlar.map((n) => (
          <div className={s.not} key={n.baslik}>
            <h3 className={s.notBaslik}>{n.baslik}</h3>
            <p className={s.notMetin}>{n.metin}</p>
          </div>
        ))}
      </div>
    </>
  );
}
