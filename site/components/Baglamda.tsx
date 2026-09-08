import { generateKilim, kademeSec, OLCULER } from "kilim-avatars";
import { MERDIVEN, MERDIVEN_TOHUM, UYELER, YORUMCULAR } from "@/lib/baglam";
import { svgGovdesi } from "@/lib/sembol";
import type { Icerik } from "@/lib/icerik";
import s from "./Baglamda.module.css";

/**
 * Avatar. `label: false` bilinçli: adı zaten yanında yazıyor, ekran okuyucunun
 * deseni ikinci kez okumasına gerek yok — kütüphanenin kendi tavsiyesi bu.
 * Kütüphane bu durumda SVG'yi zaten `aria-hidden` basıyor.
 */
function Avatar({ tohum, boy }: { tohum: string; boy: number }) {
  const { svg } = generateKilim(tohum, { size: boy, label: false });
  return (
    <span className={s.avatar} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

export default function Baglamda({ icerik }: { icerik: Icerik }) {
  const t = icerik.baglam;

  // Merdivendeki her boy bir kez üretilip iki kez kullanılıyor: gerçek boyunda
  // ve büyütülmüş hâlinde.
  const basamaklar = MERDIVEN.map((boy) => ({
    boy,
    olcu: OLCULER[kademeSec(boy)],
    govde: svgGovdesi(
      generateKilim(MERDIVEN_TOHUM, { size: boy, label: false }).svg,
    ),
  }));

  return (
    <>
      <div className={s.ikili}>
        <div className={s.sutun}>
          <div className="seritBaslik">
            <h3>{t.yorumBaslik}</h3>
          </div>
          <ul className={s.yorumlar}>
            {YORUMCULAR.map((k, i) => (
              <li className={s.yorum} key={k.tohum}>
                <Avatar tohum={k.tohum} boy={32} />
                <div>
                  <div className={s.yorumBas}>
                    <span className={s.kisiAd}>{k.ad}</span>
                    <span className={s.zaman}>{k.zaman[icerik.dil]}</span>
                  </div>
                  <p className={s.yorumMetin}>{t.yorumlar[i]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.sutun}>
          <div className="seritBaslik">
            <h3>{t.uyeBaslik}</h3>
            <span className="seritSag">
              {UYELER.length} {t.uyeSayiSonEk}
            </span>
          </div>
          <ul className={s.uyeler}>
            {UYELER.map((k) => (
              <li className={s.uye} key={k.tohum}>
                <Avatar tohum={k.tohum} boy={24} />
                <span className={s.uyeAd}>{k.ad}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={s.merdiven}>
        <div className="seritBaslik">
          <h3>{t.merdivenBaslik}</h3>
          <span className="seritSag">{MERDIVEN_TOHUM}</span>
        </div>

        <p className={`${s.merdivenNot} notyazi`}>{t.merdivenBuyutme}</p>

        <svg className={s.gizliTanim} aria-hidden="true" focusable="false">
          <defs>
            {basamaklar.map(({ boy, govde }) => (
              <symbol
                key={boy}
                id={`merdiven-${boy}`}
                viewBox={`0 0 ${boy} ${boy}`}
                dangerouslySetInnerHTML={{ __html: govde }}
              />
            ))}
          </defs>
        </svg>

        <div className={s.merdivenSira}>
          {basamaklar.map(({ boy, olcu }) => (
            <div className={s.basamak} key={boy}>
              {/* Gerçek boy: hepsi ortak bir tabana oturuyor. */}
              <div className={s.gercekYuva}>
                <svg
                  width={boy}
                  height={boy}
                  viewBox={`0 0 ${boy} ${boy}`}
                  aria-hidden="true"
                  focusable="false"
                >
                  <use href={`#merdiven-${boy}`} width={boy} height={boy} />
                </svg>
              </div>
              {/* Aynı ızgaranın büyütülmüş hâli: o boyun neyi feda ettiği. */}
              <svg
                className={s.buyutme}
                viewBox={`0 0 ${boy} ${boy}`}
                aria-hidden="true"
                focusable="false"
              >
                <use href={`#merdiven-${boy}`} width={boy} height={boy} />
              </svg>
              <span className={s.basamakNot}>
                {boy} px · {olcu.w}×{olcu.h}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.altyazi}>
        <p className="notyazi">{t.altyazi}</p>
      </div>
    </>
  );
}
