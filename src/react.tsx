/**
 * React sarmalayıcı — `kilim/react` alt yolundan gelir.
 *
 * Neden ayrı giriş noktası:
 *
 * 1. `peerDependencies`. React ana girişte olsaydı, çekirdeği Node'da, bir
 *    worker'da ya da Deno'da kullanan herkes React peer uyarısı alırdı. Ayrı
 *    alt yolda peer yalnızca `kilim/react` import edeni ilgilendirir.
 * 2. Tree-shaking. `react/jsx-runtime` import'u ana girişte olsaydı bazı
 *    paketleyiciler onu ayıklayamazdı. Ayrı entry'de bu sorun hiç doğmaz.
 * 3. Çekirdeğin boyutu React kullanmayanlara yansımaz.
 */
import {
  createElement,
  useMemo,
  type CSSProperties,
  type ReactElement,
  type Ref,
  type SVGProps,
} from "react";
import { generateKilim, type KilimSecenek, type KilimSonuc } from "./index.js";

/**
 * `<svg>` üzerine geçebilecek her prop kabul edilir — `onClick`, `id`, `ref`,
 * `aria-*`, `data-*`. Kendi ürettiğimiz öznitelikler (`viewBox`, `role`,
 * `width`, `height`) dışlanır; onları çağıran değil üreteç belirler.
 */
type GecenSvgProp = Omit<
  SVGProps<SVGSVGElement>,
  "viewBox" | "role" | "width" | "height" | "children" | "dangerouslySetInnerHTML" | "style"
>;

export interface KilimProps extends GecenSvgProp, KilimSecenek {
  /** Kilimi belirleyen metin — kullanıcı kimliği, e-posta, ad. */
  seed: string;
  /**
   * Kök öğeye geçirilecek CSS. React'ta `style` her zaman CSS demektir; yöresel
   * paleti seçmek için `region` kullanılır.
   */
  style?: CSSProperties;
  /**
   * SVG'yi yuvarlak göstermek için kısayol. Çoğu site avatarı daire gösterir;
   * bu, `border-radius: 50%` yazmayı unutmaya karşı bir kolaylık.
   */
  rounded?: boolean;
  ref?: Ref<SVGSVGElement>;
}

/**
 * React, SVG özniteliklerini camelCase bekler; `aria-*` ve `data-*` istisnadır.
 *
 * Tireli her ismi genel kuralla çeviriyoruz. Sabit bir eşleme tablosu kırılgan
 * olurdu: emitter'a yeni bir tireli öznitelik eklendiğinde React sessizce uyarı
 * basar ve öznitelik düşerdi.
 */
function reactNitelikAdi(ad: string): string {
  if (ad.startsWith("aria-") || ad.startsWith("data-")) return ad;
  return ad.replace(/-([a-z])/g, (_, harf: string) => harf.toUpperCase());
}

/**
 * Üretilen SVG metnini açılış özniteliklerine ve gövdeye ayırır.
 *
 * Kök `<svg>` React'in kendi ağacında kalıyor — böylece `className`, `style`,
 * `onClick` ve `ref` normal yoldan geçiyor. Yalnızca gövde (`<title>` ve
 * `<rect>` dizisi) `dangerouslySetInnerHTML` ile basılıyor; o içerik tamamen
 * bizim ürettiğimiz, kaçışı yapılmış metin — çağıranın ham girdisi asla
 * doğrudan oraya yazılmaz.
 */
function svgIcerigi(svg: string): {
  govde: string;
  nitelikler: Record<string, string>;
} {
  const acilis = svg.slice(0, svg.indexOf(">") + 1);
  const govde = svg.slice(acilis.length, svg.lastIndexOf("</svg>"));
  const nitelikler: Record<string, string> = {};
  for (const [, ad, deger] of acilis.matchAll(/([\w-]+)="([^"]*)"/g)) {
    nitelikler[reactNitelikAdi(ad as string)] = deger as string;
  }
  return { govde, nitelikler };
}

/**
 * Bir metinden kilim avatarı çizer.
 *
 * ```tsx
 * <Kilim seed={user.id} size={40} rounded />
 * ```
 *
 * Aynı `seed` her zaman aynı kilimi verir; sunucu tarafı render ile istemci
 * arasında fark oluşmaz.
 */
export function Kilim({
  seed,
  size,
  region,
  label,
  rounded,
  style,
  ...svgProps
}: KilimProps): ReactElement {
  const sonuc = useMemo(
    () =>
      generateKilim(seed, {
        ...(size === undefined ? {} : { size }),
        ...(label === undefined ? {} : { label }),
        ...(region === undefined ? {} : { region }),
      }),
    [seed, size, label, region],
  );

  const { govde, nitelikler } = useMemo(
    () => svgIcerigi(sonuc.svg),
    [sonuc.svg],
  );

  return createElement("svg", {
    ...nitelikler,
    ...svgProps,
    style: rounded ? { borderRadius: "50%", ...style } : style,
    dangerouslySetInnerHTML: { __html: govde },
  });
}

/**
 * Bileşeni kullanmadan sonucu almak isteyen için — memoize edilmiş hâli.
 *
 * ```tsx
 * const { svg, name } = useKilim(user.id, { size: 64 });
 * ```
 */
export function useKilim(seed: string, opts?: KilimSecenek): KilimSonuc {
  const boyut = opts?.size;
  const etiket = opts?.label;
  const yore = opts?.region;
  return useMemo(
    () =>
      generateKilim(seed, {
        ...(boyut === undefined ? {} : { size: boyut }),
        ...(etiket === undefined ? {} : { label: etiket }),
        ...(yore === undefined ? {} : { region: yore }),
      }),
    [seed, boyut, etiket, yore],
  );
}

export type { KilimSecenek, KilimSonuc };
