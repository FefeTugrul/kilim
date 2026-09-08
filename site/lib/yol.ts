/**
 * Kök-mutlak yolları dağıtım önekiyle birleştirir.
 *
 * GitHub Pages proje sayfası siteyi `/kilim` altında sunuyor. Next `<Link>`,
 * router ve `_next` varlıklarını bu önekle kendisi üretiyor, ama düz bir
 * `<a href="/tr">` etiketine dokunmuyor — o bağlantı yayında kökü işaret edip
 * 404 veriyordu.
 *
 * İçerik dosyaları yolları kök-göreli tutuyor (`/`, `/tr`); bu doğru, çünkü
 * bir metin dosyasının nereye deploy edildiğini bilmesi gerekmez. Önek burada,
 * yani çizim sınırında ekleniyor.
 */
const TABAN = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function yol(p: string): string {
  if (!TABAN) return p;
  return p === "/" ? TABAN : `${TABAN}${p}`;
}
