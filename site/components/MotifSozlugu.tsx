import { TUM_MOTIFLER } from "kilim-avatars";
import { motifKaresi } from "@/lib/motif-karesi";
import { ANLAM_EN, SLOT_EN, SLOT_TR } from "@/lib/motif-en";
import type { Icerik } from "@/lib/icerik";
import s from "./MotifSozlugu.module.css";

// SVG vektör: ekrandaki boyla aynı üretmek yeterli, 2× üretmek yalnızca
// koordinat metnini uzatır.
const KARE_PIKSEL = 168;

export default function MotifSozlugu({ icerik }: { icerik: Icerik }) {
  const tr = icerik.dil === "tr";
  const slotAd = tr ? SLOT_TR : SLOT_EN;

  return (
    <>
      <div className={s.izgara}>
        {TUM_MOTIFLER.map((m) => (
          <div className={s.hucre} key={m.id}>
            <div
              className={s.kare}
              dangerouslySetInnerHTML={{ __html: motifKaresi(m, KARE_PIKSEL) }}
            />
            <div className={s.metin}>
              <div className={s.adSatiri}>
                <span className={s.ad} lang="tr">
                  {m.ad}
                </span>
                <span className={s.adEn}>{m.en}</span>
              </div>
              <p className={s.anlam}>{tr ? m.anlam : ANLAM_EN[m.id]}</p>
              <div className={s.slotlar}>
                {m.slots.map((slot, i) => (
                  <span key={slot}>
                    {i > 0 ? <span className={s.slotAyrac}>· </span> : null}
                    {slotAd[slot]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={s.kural}>
        <p className="notyazi">{icerik.motifKurali}</p>
      </div>
    </>
  );
}
