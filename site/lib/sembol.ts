/**
 * Kütüphanenin ürettiği `<svg>`'nin gövdesini alır.
 *
 * Aynı kilimi sayfada iki yerde göstermek gerektiğinde (levha + dar ekran
 * görünümü, gerçek boy + büyütülmüş hâli) SVG'yi iki kez basmak belgeye aynı
 * dikdörtgen yığınını iki kez koyuyor. Gövdeyi bir `<symbol>` içine alıp
 * `<use>` ile çağırmak bunu tekilleştiriyor.
 *
 * Ayrıştırma güvenli: kaynak metni kütüphanenin kendi emitter'ından geliyor,
 * kök `<svg …>` tek satır ve `kilim/react` de tam olarak bu ayrımı yapıyor.
 */
export function svgGovdesi(svg: string): string {
  return svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));
}
