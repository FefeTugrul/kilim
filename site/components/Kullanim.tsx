"use client";

import { Kod } from "./Kod";
import {
  ALANLAR,
  HATA_KOD,
  HATA_KOD_EN,
  HOOK_KOD,
  KURULUM_KODU,
  KURULUM_REACT_KODU,
  REACT_KOD,
  SECENEKLER,
  TEMEL_KOD,
  TEMEL_KOD_EN,
} from "@/lib/ornekler";
import type { Icerik } from "@/lib/icerik";
import s from "./Kullanim.module.css";

export default function Kullanim({ icerik }: { icerik: Icerik }) {
  const t = icerik.kullanim;
  const tr = icerik.dil === "tr";
  const kod = {
    kopyala: icerik.hero.kopyala,
    kopyalandi: icerik.hero.kopyalandi,
    kopyalandiDuyuru: icerik.hero.kopyalandiDuyuru,
  };

  return (
    <>
      <div className={s.giris}>
        <p className={s.girisMetin}>{t.giris}</p>
      </div>

      <div className={s.adimlar}>
        <section className={s.adim}>
          <div className={s.adimSol}>
            <div className={s.adimBaslik}>
              <span className={s.adimNo}>1</span>
              <h3>{t.kurBaslik}</h3>
            </div>
            <p className={s.adimNot}>{t.kurNot}</p>
          </div>
          <div className={s.adimSag}>
            <Kod baslik="npm" satirlar={KURULUM_KODU} {...kod} />
          </div>
        </section>

        <section className={s.adim}>
          <div className={s.adimSol}>
            <div className={s.adimBaslik}>
              <span className={s.adimNo}>2</span>
              <h3>{t.uretBaslik}</h3>
            </div>
            <p className={s.adimNot}>{t.uretNot}</p>
          </div>
          <div className={s.adimSag}>
            <Kod
              baslik="TypeScript"
              satirlar={tr ? TEMEL_KOD : TEMEL_KOD_EN}
              {...kod}
            />
          </div>
        </section>

        <section className={s.adim}>
          <div className={s.adimSol}>
            <div className={s.adimBaslik}>
              <span className={s.adimNo}>3</span>
              <h3>{t.reactBaslik}</h3>
            </div>
            <p className={s.adimNot}>{t.reactNot}</p>
            <p className={s.adimNot}>{t.hookNot}</p>
          </div>
          <div className={s.adimSag}>
            <Kod baslik="npm" satirlar={KURULUM_REACT_KODU} {...kod} />
            <Kod baslik="TSX" satirlar={REACT_KOD} {...kod} />
            <Kod baslik="TSX" satirlar={HOOK_KOD} {...kod} />
          </div>
        </section>
      </div>

      <div className={s.tablolar}>
        <div className={s.tablo}>
          <h3 className="seritBaslik">{t.secenekBaslik}</h3>
          <dl className={s.dl}>
            {SECENEKLER.map((o) => (
              <div className={s.satir} key={o.ad}>
                <dt className={s.ad}>
                  {o.ad}
                  <span className={s.tip}>{o.tip}</span>
                </dt>
                <dd className={s.aciklama}>
                  <span className={s.varsayilan}>
                    {t.varsayilanOnEk} {o.varsayilan}
                  </span>
                  {tr ? o.tr : o.en}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={s.tablo}>
          <h3 className="seritBaslik">{t.alanBaslik}</h3>
          <dl className={s.dl}>
            {ALANLAR.map((f) => (
              <div className={s.satir} key={f.ad}>
                <dt className={s.ad}>
                  {f.ad}
                  <span className={s.tip}>{f.tip}</span>
                </dt>
                <dd className={s.aciklama}>{tr ? f.tr : f.en}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className={s.hata}>
        <h3 className="seritBaslik">{t.hataBaslik}</h3>
        <p className={s.hataNot}>{t.hataNot}</p>
        <Kod baslik="TypeScript" satirlar={tr ? HATA_KOD : HATA_KOD_EN} {...kod} />
      </div>
    </>
  );
}
