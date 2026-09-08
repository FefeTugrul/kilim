import type { ReactNode } from "react";
import { NPM_URL, REPO, SURUM } from "@/lib/paket";
import type { BolumMetni, Icerik } from "@/lib/icerik";
import s from "./Kabuk.module.css";

function bolumSirasi(icerik: Icerik): readonly BolumMetni[] {
  const b = icerik.bolumler;
  return [b.hero, b.neden, b.kullanim, b.anatomi, b.motifler, b.baglam, b.kaynaklar];
}

export function Ustbilgi({ icerik }: { icerik: Icerik }) {
  return (
    <header className={s.ustbilgi}>
      <a className={s.marka} href={icerik.anasayfa}>
        kilim
      </a>
      <span className={s.surum}>{SURUM}</span>

      {/*
        Gezinti bölüm ADLARIYLA. Önce yalnız "01 02 03" yazıyordu: sayfanın
        kendi içinde anlamlı ama dışarıdan bakan için hiçbir şey söylemiyor.
      */}
      <nav className={s.bolumler} aria-label={icerik.bolumNav}>
        {bolumSirasi(icerik).map((b) => (
          <a key={b.kimlik} href={`#${b.kimlik}`}>
            {b.kisa}
          </a>
        ))}
      </nav>

      <nav className={s.baglantilar} aria-label={icerik.digerDil.etiket}>
        <a
          href={icerik.digerDil.href}
          hrefLang={icerik.digerDil.hreflang}
          lang={icerik.digerDil.hreflang}
        >
          {icerik.digerDil.etiket}
        </a>
        <a href={NPM_URL}>npm</a>
        <a href={REPO}>GitHub</a>
      </nav>
    </header>
  );
}

export function Altbilgi({ icerik }: { icerik: Icerik }) {
  return (
    <footer className={s.altbilgi}>
      <span>
        {icerik.altbilgi.lisans} © {icerik.altbilgi.yazar}
      </span>
      <a className={s.altbilgiSag} href={REPO}>
        {icerik.altbilgi.kaynakKodu}
      </a>
    </footer>
  );
}

export function Bolum({
  metin,
  children,
}: {
  metin: BolumMetni;
  children: ReactNode;
}) {
  return (
    <section className="bolum" id={metin.kimlik} aria-labelledby={`${metin.kimlik}-ad`}>
      <div className="bolumBaslik">
        <span className="sira">{metin.sira}</span>
        <h2 id={`${metin.kimlik}-ad`}>{metin.baslik}</h2>
        <p className="bolumOzet">{metin.ozet}</p>
      </div>
      {children}
    </section>
  );
}
