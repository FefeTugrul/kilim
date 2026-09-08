import {
  LISANSLAR,
  MOTIF_KAYNAKLARI,
  RENK_KAYNAKLARI,
  type Kunye,
} from "@/lib/kaynaklar";
import type { Icerik } from "@/lib/icerik";
import s from "./Kaynaklar.module.css";

function Grup({
  baslik,
  kunyeler,
}: {
  baslik: string;
  kunyeler: readonly Kunye[];
}) {
  return (
    <div className={s.grup}>
      <h3 className="seritBaslik">{baslik}</h3>
      <ul className={s.liste}>
        {kunyeler.map((k) => (
          <li className={s.kunye} key={k.bag ?? k.ne}>
            <div className={s.kim}>{k.kim}</div>
            <div className={s.govde}>
              <div className={s.ne}>{k.ne}</div>
              <div className={s.nerede}>{k.nerede}</div>
              {k.bag ? (
                // Görünen metin kısa bir DOI ya da alan adı; bağlantı
                // listesinde tek başına duyulduğunda ne olduğu anlaşılmıyor.
                // Erişilebilir ad eserin kendi adını taşıyor.
                <a
                  className={s.bag}
                  href={k.bag}
                  aria-label={`${k.ne} — ${k.bagAd ?? k.bag}`}
                >
                  {k.bagAd ?? k.bag}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Kaynaklar({ icerik }: { icerik: Icerik }) {
  const t = icerik.kaynaklar;
  return (
    <>
      <Grup baslik={t.motifBaslik} kunyeler={MOTIF_KAYNAKLARI} />
      <Grup baslik={t.renkBaslik} kunyeler={RENK_KAYNAKLARI} />
      <Grup baslik={t.lisansBaslik} kunyeler={LISANSLAR} />
      <div className={s.uyari}>
        <p className="notyazi">{t.uyari}</p>
      </div>
    </>
  );
}
