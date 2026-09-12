"use client";

import { useEffect, useMemo, useState } from "react";
import { generateKilim, PALETLER, OLCULER, kademeSec } from "kilim-avatars";
import type { KilimYore } from "kilim-avatars";
import { KURULUM } from "@/lib/paket";
import type { Dil, HeroMetni } from "@/lib/icerik";
import { useTohum } from "./TohumSaglayici";
import s from "./Playground.module.css";

/** Hero'daki kilimlerin piksel boyutu. `tam` kademe (>80 px) burada başlıyor. */
const BOYUT = 128;
/** Satır başına dokuma süresi. Tek hareket anının tek sabiti. */
const MS_SATIR = 12;
/**
 * Yörelerin İngilizce karakter notları.
 *
 * Türkçesi kütüphanenin kendi `not` alanından geliyor — orada tek gerçeklik
 * kaynağı var ve burada kopyalanmıyor.
 */
const YORE_NOT_EN: Record<KilimYore, string> = {
  konya: "Red ground, cream motifs, deep navy and gold",
  milas: "Cream ground, widest border, mustard and navy",
  sivas: "Navy ground, dense layout, a light outline between motifs",
  yoruk: "Brown-black ground, few colours, earth tones",
  usak: "Muted grey-cream ground, brick-laid layout, olive and burgundy",
  iznik: "İznik pigments — cobalt, turquoise, coral. The geometry stays kilim.",
};

function bayt(metin: string): number {
  return new TextEncoder().encode(metin).length;
}

async function gzipBayt(metin: string): Promise<number | null> {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const akis = new Blob([metin])
      .stream()
      .pipeThrough(new CompressionStream("gzip"));
    return (await new Response(akis).arrayBuffer()).byteLength;
  } catch {
    return null;
  }
}

/** Alt ve üst sınır aynı basamağa yuvarlanıyorsa aralık göstermek gürültü. */
function aralik(min: number, max: number): string {
  const alt = (min / 1000).toFixed(1);
  const ust = (max / 1000).toFixed(1);
  return alt === ust ? `${ust} kB` : `${alt}–${ust} kB`;
}

export default function Playground({
  hero,
  dil,
}: {
  hero: HeroMetni;
  dil: Dil;
}) {
  // Tohum sayfanın tamamına ait: anatomi levhası da aynı değeri okuyor.
  const { girdi, tohum, yaz } = useTohum();
  const [kopyalandi, setKopyalandi] = useState(false);
  const [gzipAralik, setGzipAralik] = useState<[number, number] | null>(null);

  // Kütüphane yalnızca boş metni reddediyor; site de tam olarak onu yansıtsın.
  const gecerli = tohum.length > 0;

  const kilimler = useMemo(
    () =>
      gecerli
        ? PALETLER.map((palet) => ({
            palet,
            sonuc: generateKilim(tohum, {
              size: BOYUT,
              region: palet.id,
              label: false,
            }),
          }))
        : null,
    [tohum, gecerli],
  );

  const hamAralik = useMemo(() => {
    if (!kilimler) return null;
    const b = kilimler.map((k) => bayt(k.sonuc.svg));
    return [Math.min(...b), Math.max(...b)] as [number, number];
  }, [kilimler]);

  useEffect(() => {
    // Ölçüm bitene kadar önceki tohumun sayısı ekranda kalıyordu.
    setGzipAralik(null);
    if (!kilimler) return;
    let iptal = false;
    void Promise.all(kilimler.map((k) => gzipBayt(k.sonuc.svg))).then((c) => {
      if (iptal) return;
      const n = c.filter((x): x is number => x !== null);
      setGzipAralik(n.length === 0 ? null : [Math.min(...n), Math.max(...n)]);
    });
    return () => {
      iptal = true;
    };
  }, [kilimler]);

  useEffect(() => {
    if (!kopyalandi) return;
    const t = setTimeout(() => setKopyalandi(false), 1600);
    return () => clearTimeout(t);
  }, [kopyalandi]);

  // Satır sayısı ızgaradan geliyor, elle yazılmıyor: kademe tablosu da kamuya
  // açık API'nin parçası.
  const satirSayisi = OLCULER[kademeSec(BOYUT)].h;
  const dokumaStil = {
    animationDuration: `${satirSayisi * MS_SATIR}ms`,
    animationTimingFunction: `steps(${satirSayisi}, jump-start)`,
  };

  /**
   * Ad "Yöre — gövde" biçiminde ve gövde altı yörede de aynı; yalnız palet
   * değişiyor. Bilinen öneki soyuyoruz — string'i " — " arayarak ayrıştırmak,
   * kütüphanenin kendi kayıtlı hatası (palet adında tire geçerse kuyruk sızar).
   */
  const govde = (() => {
    if (!kilimler) return null;
    const { palet, sonuc } = kilimler[0]!;
    const ad = dil === "tr" ? sonuc.name : sonuc.nameEn;
    const onEk = dil === "tr" ? `${palet.ad} — ` : `${palet.ad} kilim — `;
    return ad.startsWith(onEk) ? ad.slice(onEk.length) : ad;
  })();

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(KURULUM);
      setKopyalandi(true);
    } catch {
      /* pano yoksa sessiz kal — komut zaten ekranda yazıyor */
    }
  }

  return (
    <section className={s.hero} id={hero.kimlik}>
      <h1 className={s.baslik}>{hero.baslik}</h1>
      <p className={s.altBaslik}>{hero.altBaslik}</p>

      <label className={s.girdiAlan}>
        <span className={s.girdiEtiket}>{hero.girdiEtiket}</span>
        <input
          className={s.girdi}
          value={girdi}
          onChange={(e) => yaz(e.target.value)}
          placeholder={hero.girdiIpucu}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </label>
      <p className={s.akisNot}>{hero.akisNot}</p>

      {kilimler ? (
        <>
          <div className={s.serit} key={tohum}>
            {kilimler.map(({ palet, sonuc }) => (
              <div className={s.hucre} key={palet.id}>
                <div
                  className={`${s.kilimKutu} dokuma`}
                  style={dokumaStil}
                  dangerouslySetInnerHTML={{ __html: sonuc.svg }}
                />
                <div>
                  <div className={s.yoreAd}>{palet.ad}</div>
                  <div className={s.yoreNot}>
                    {dil === "tr" ? palet.not : YORE_NOT_EN[palet.id]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={s.dokumaAdi}>
            <span className={s.ad}>{govde}</span>
            <span className={s.adNot}>{hero.yoreNot}</span>
          </div>
        </>
      ) : (
        /*
          Boş durum şeridin ızgarasını koruyor: 1072 px'lik boş bir çerçeve
          yerine, kilimlerin duracağı hücreler boş kalıyor ve mesaj ilk üç
          hücreyi kaplıyor. Sayfa da alanı silerken zıplamıyor.
        */
        <div className={`${s.serit} ${s.seritBos}`}>
          <div className={s.bosMesaj}>
            <div className={s.bosBaslik}>{hero.bosUyariBaslik}</div>
            <p className={s.bosGovde}>{hero.bosUyariGovde}</p>
          </div>
          <div className={s.hucre} aria-hidden="true" />
          <div className={s.hucre} aria-hidden="true" />
          <div className={s.hucre} aria-hidden="true" />
        </div>
      )}

      <div className={s.altSatir}>
        <div className={s.kurulum}>
          <code className={s.komut}>{KURULUM}</code>
          <button className={s.kopyaDugme} onClick={kopyala} type="button">
            {kopyalandi ? hero.kopyalandi : hero.kopyala}
          </button>
          {/* Buton metninin değişmesi ekran okuyucuya ulaşmıyordu. */}
          <span role="status" className="gorselGizli">
            {kopyalandi ? hero.kopyalandiDuyuru : ""}
          </span>
        </div>
        <dl className={s.rozet}>
          <dt className={s.rozetAd}>{hero.rozetOnEk}</dt>
          <dd className={s.rozetDeger}>
            {hamAralik ? aralik(hamAralik[0], hamAralik[1]) : "—"}
          </dd>
          <dt className={s.rozetAd}>{hero.rozetGzip}</dt>
          <dd className={s.rozetDeger}>
            {!hamAralik
              ? "—"
              : gzipAralik
                ? aralik(gzipAralik[0], gzipAralik[1])
                : hero.rozetOlculuyor}
          </dd>
        </dl>
      </div>
    </section>
  );
}
