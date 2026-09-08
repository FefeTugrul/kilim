"use client";

import { useMemo, useState } from "react";
import { generateKilim, PALETLER, type KilimYore } from "kilim-avatars";
import { anatomiCoz, type Katman, type KatmanId } from "@/lib/katmanlar";
import { svgGovdesi } from "@/lib/sembol";
import { PAKET_AD, REPO_KISA } from "@/lib/paket";
import type { Icerik } from "@/lib/icerik";
import { useTohum } from "./TohumSaglayici";
import s from "./Anatomi.module.css";

/** Levhadaki kilimin piksel boyu. `tam` kademeyi (>80 px) fazlasıyla geçiyor. */
const BOY = 440;
/** Tohum boşken levha neyi gösteriyor. */
const YEDEK_TOHUM = "kilim";

/** Seçilebilecek şeyler: katmanlar + abraş (o bir katman değil, bir davranış). */
type Secim = KatmanId | "abras";

export default function Anatomi({ icerik }: { icerik: Icerik }) {
  const { tohum } = useTohum();
  const [yore, setYore] = useState<KilimYore>("konya");
  const [secili, setSecili] = useState<Secim | null>(null);

  const kullanilan = tohum.length > 0 ? tohum : YEDEK_TOHUM;
  const t = icerik.anatomi;

  const a = useMemo(
    () => anatomiCoz(kullanilan, BOY, yore),
    [kullanilan, yore],
  );
  const kilim = useMemo(
    () => generateKilim(kullanilan, { size: BOY, region: yore, label: false }),
    [kullanilan, yore],
  );

  const hw = BOY / a.izgara.w;
  const hh = BOY / a.izgara.h;

  /** Katmanın dış ve iç sınırı — üstüne çizilecek saç teli dikdörtgenler. */
  function sinirlar(k: Katman) {
    const d = k.dis;
    const dis = { x: d.x * hw, y: d.y * hh, w: d.w * hw, h: d.h * hh };
    if (k.id === "zemin") return [dis];
    if (k.bicim === "bant") {
      const kal = k.kalinlik * hh;
      return [
        { x: dis.x, y: dis.y, w: dis.w, h: kal },
        { x: dis.x, y: dis.y + dis.h - kal, w: dis.w, h: kal },
      ];
    }
    return [
      dis,
      {
        x: dis.x + k.kalinlik * hw,
        y: dis.y + k.kalinlik * hh,
        w: dis.w - 2 * k.kalinlik * hw,
        h: dis.h - 2 * k.kalinlik * hh,
      },
    ];
  }

  /** Zemin katmanı düzenine göre iki ayrı şey anlatır. */
  const zeminId = a.sonuc.duzen === "gobek" ? "gobek" : "zemin";
  const seciliKatman = a.katmanlar.find((k) => k.id === secili);

  return (
    <>
      <div className={s.duzen}>
        <figure className={s.levhaKutu}>
          <svg
            className={s.levha}
            viewBox={`0 0 ${BOY} ${BOY}`}
            role="img"
            aria-label={`${kullanilan} — ${icerik.dil === "tr" ? a.sonuc.govde : a.sonuc.govdeEn}`}
          >
            <g dangerouslySetInnerHTML={{ __html: svgGovdesi(kilim.svg) }} />

            {/* Hiçbir şey seçili değilken levhanın üstünde tek çizgi yok:
                dokuma önce kendisi olarak görünüyor. */}
            {seciliKatman
              ? sinirlar(seciliKatman).flatMap((b, i) =>
                  [s.sinirAlt, s.sinir].map((c) => (
                    <rect
                      key={`${c}-${i}`}
                      className={c}
                      x={b.x}
                      y={b.y}
                      width={b.w}
                      height={b.h}
                    />
                  )),
                )
              : null}

            {secili === "abras"
              ? a.abrasSinirlari.flatMap((y) =>
                  [s.sinirAlt, s.sinir].map((c) => (
                    <line
                      key={`${c}-${y}`}
                      className={c}
                      x1={0}
                      y1={y * hh}
                      x2={BOY}
                      y2={y * hh}
                    />
                  )),
                )
              : null}
          </svg>

          <figcaption className={s.kunye}>
            <span>
              seed “{kullanilan}” · {yore} · {a.izgara.w}×{a.izgara.h}
            </span>
            <span className={s.kunyeSag}>
              {PAKET_AD} · {REPO_KISA}
            </span>
          </figcaption>
        </figure>

        <div className={s.yan}>
          <p className={s.dokumaAdi}>
            {icerik.dil === "tr" ? a.sonuc.govde : a.sonuc.govdeEn}
          </p>
          <p className={s.yanGiris}>{t.giris}</p>

          <ul className={s.liste}>
            {a.katmanlar.map((katman, n) => {
              const id = katman.id === "zemin" ? zeminId : katman.id;
              return (
                <li key={katman.id}>
                  <Satir
                    acik={secili === katman.id}
                    ac={() => setSecili(katman.id)}
                    kapat={() => setSecili(null)}
                    cevir={() =>
                      setSecili(secili === katman.id ? null : katman.id)
                    }
                    simge={
                      <Simge
                        sira={n}
                        toplam={a.katmanlar.length}
                        bicim={katman.bicim}
                      />
                    }
                    ad={t.etiketler[id].ad}
                    not={t.etiketler[id].not}
                  />
                </li>
              );
            })}
            <li>
              <Satir
                acik={secili === "abras"}
                ac={() => setSecili("abras")}
                kapat={() => setSecili(null)}
                cevir={() => setSecili(secili === "abras" ? null : "abras")}
                simge={<SimgeAbras />}
                ad={t.etiketler.abras.ad}
                not={t.abrasNot.replace("{n}", String(a.sonuc.abras.bant))}
              />
            </li>
          </ul>

          <div className={s.yoreSecim}>
            <span className={s.yoreEtiket}>{t.yoreEtiket}</span>
            <div className={s.yoreDugmeler}>
              {PALETLER.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${s.yoreDugme} ${yore === p.id ? s.yoreAcik : ""}`}
                  onClick={() => setYore(p.id)}
                  aria-pressed={yore === p.id}
                >
                  {p.ad}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={s.altyazi}>
        <p className="notyazi">{t.altyazi}</p>
      </div>
    </>
  );
}

function Satir({
  acik,
  ac,
  kapat,
  cevir,
  simge,
  ad,
  not,
}: {
  acik: boolean;
  ac: () => void;
  kapat: () => void;
  cevir: () => void;
  simge: React.ReactNode;
  ad: string;
  not: string;
}) {
  return (
    <button
      type="button"
      className={`${s.katman} ${acik ? s.katmanAcik : ""}`}
      onMouseEnter={ac}
      onFocus={ac}
      onMouseLeave={kapat}
      onBlur={kapat}
      onClick={cevir}
      aria-pressed={acik}
    >
      {simge}
      <span className={s.katmanAd}>{ad}</span>
      <span className={s.katmanNot}>{not}</span>
    </button>
  );
}

/**
 * Satır başındaki minik şema.
 *
 * Ölçekli DEĞİL, şematik: gerçek oranda selvedge 22 pikselde yarım piksele
 * düşüyor ve simge boş bir kareye dönüşüyordu. Halkalar burada eşit kalınlıkta,
 * sırayla içe doğru diziliyor — anlatmak istediği şey kalınlık değil, sıra.
 */
function Simge({ sira, toplam, bicim }: {
  sira: number;
  toplam: number;
  bicim: "halka" | "bant";
}) {
  const b = 26;
  const kal = 1.8;
  // Sabit adım: oransal dağıtınca en içteki halka 2 pikselik bir noktaya
  // düşüyor ve "zemin" bir ALAN olduğunu söyleyemiyordu.
  const ic = 1.5 + sira * 1.6;
  const w = b - 2 * ic;
  const son = sira === toplam - 1;

  return (
    <svg className={s.simge} viewBox={`0 0 ${b} ${b}`} aria-hidden="true">
      <rect className={s.simgeCerceve} x={0.5} y={0.5} width={b - 1} height={b - 1} />
      {son ? (
        <rect className={s.simgeDolu} x={ic} y={ic} width={w} height={w} />
      ) : bicim === "bant" ? (
        <>
          <rect className={s.simgeDolu} x={ic} y={ic} width={w} height={kal} />
          <rect className={s.simgeDolu} x={ic} y={ic + w - kal} width={w} height={kal} />
        </>
      ) : (
        <path
          className={s.simgeDolu}
          fillRule="evenodd"
          d={
            `M${ic} ${ic}h${w}v${w}h${-w}z` +
            `M${ic + kal} ${ic + kal}h${w - 2 * kal}v${w - 2 * kal}h${-(w - 2 * kal)}z`
          }
        />
      )}
    </svg>
  );
}

function SimgeAbras() {
  const b = 26;
  return (
    <svg className={s.simge} viewBox={`0 0 ${b} ${b}`} aria-hidden="true">
      <rect className={s.simgeCerceve} x={0.5} y={0.5} width={b - 1} height={b - 1} />
      {[8, 13, 18].map((y) => (
        <line key={y} className={s.simgeCizgi} x1={4} y1={y} x2={22} y2={y} />
      ))}
    </svg>
  );
}
