import {
  bordurKalinlik,
  doku,
  fnv1a,
  get,
  kademeSec,
  mulberry32,
  OLCULER,
  profilBul,
  type DokumaSonuc,
  type KilimYore,
} from "kilim-avatars";

/**
 * Bir kilimin katmanlarını, herhangi bir tohum için hesaplar.
 *
 * Katman yığını kütüphanede sabit: saçak → selvedge → bordür → ince su →
 * zemin. Kalınlıkların hepsi `OLCULER` tablosunda yazılı; tek değişken,
 * selvedge'in tek mi çift halka mı olduğu (`kalinSelvedge`, gramerde
 * `rng.bool(0.45)`).
 *
 * O tek bilinmeyen ızgaradan okunuyor: selvedge halkası satırın TAMAMINI tek
 * renge boyar, bordür bandı ise yalnız selvedge'in içini boyar ve hiçbir
 * bordür motifinin ilk satırı dolu değildir (su yolu `X...X`, testere `..X..`,
 * baklava `..X..`). Dolayısıyla saçaktan sonraki ikinci satır tekdüzeyse
 * selvedge çift halkadır. 3000 tohumda ölçüldü: %44.9 — gramerdeki 0.45 ile
 * aynı.
 *
 * İç yapıyı taklit etmek yerine çıktıyı okumanın sebebi bu: gramere yeni bir
 * çekiliş eklenirse burası etkilenmez.
 */

export type KatmanId = "sacak" | "selvedge" | "bordur" | "inceSu" | "zemin";

export interface Katman {
  id: KatmanId;
  /** "halka" dört yandan sarar; "bant" yalnız üstte ve altta durur. */
  bicim: "halka" | "bant";
  /** Dış sınır (hücre cinsinden, sol üst köşe ve ölçüler). */
  dis: { x: number; y: number; w: number; h: number };
  /** Kalınlık (hücre). Zeminde 0 — zemin bir halka değil, kalan alan. */
  kalinlik: number;
}

export interface Anatomi {
  sonuc: DokumaSonuc;
  izgara: { w: number; h: number };
  katmanlar: Katman[];
  /** Zemin tonunun kaydığı satırlar (abraş bant sınırları), zemin içinde. */
  abrasSinirlari: number[];
  /** Selvedge kaç halka: 1 ya da 2. */
  selvedgeKalinligi: number;
}

/** Saçaktan sonraki ikinci satır tekdüze mi — selvedge çift halka mı? */
function selvedgeKalin(sonuc: DokumaSonuc, sacak: number, w: number): boolean {
  const y = sacak + 1;
  const ilk = get(sonuc.grid, 0, y);
  for (let x = 1; x < w; x++) if (get(sonuc.grid, x, y) !== ilk) return false;
  return true;
}

/**
 * Yöre parametresi 0.3.0'da eklendi ve zorunlu.
 *
 * Önceden burada `doku(rng, kademe)` çağrılıyordu — yöresiz, yani NÖTR profille.
 * 0.2.0'da yöre dokumayı da belirlemeye başlayınca levha sessizce yalan söyler
 * hale geldi: altında "usak" yazarken İznik'in dokumasını çiziyor, katman
 * sınırlarını da yörenin bordür kalınlığından habersiz hesaplıyordu. Milas'ın
 * bordürü 5 hücre, Yörük'ünki 2; ikisi de 3 sanılıyordu.
 *
 * İsteğe bağlı bir parametre yapmadım: varsayılana düşmek tam olarak eski
 * hatayı geri getirirdi.
 */
export function anatomiCoz(
  tohum: string,
  piksel: number,
  yore: KilimYore,
): Anatomi {
  const kademe = kademeSec(piksel);
  const o = OLCULER[kademe];
  const profil = profilBul(yore);
  const sonuc = doku(mulberry32(fnv1a(tohum)), kademe, profil);
  const bordur = bordurKalinlik(o.bordur, profil.bordurCarpani);

  const kalin = o.selvedge > 0 && selvedgeKalin(sonuc, o.sacak, o.w);
  const selvedgeKat = o.selvedge + (kalin ? 1 : 0);

  const katmanlar: Katman[] = [];
  let ust = 0;
  let sol = 0;
  let gen = o.w;
  let yuk = o.h;

  if (o.sacak > 0) {
    katmanlar.push({
      id: "sacak",
      bicim: "bant",
      dis: { x: 0, y: 0, w: o.w, h: o.h },
      kalinlik: o.sacak,
    });
    ust += o.sacak;
    yuk -= 2 * o.sacak;
  }

  if (selvedgeKat > 0) {
    katmanlar.push({
      id: "selvedge",
      bicim: "halka",
      dis: { x: sol, y: ust, w: gen, h: yuk },
      kalinlik: selvedgeKat,
    });
    ust += selvedgeKat;
    sol += selvedgeKat;
    gen -= 2 * selvedgeKat;
    yuk -= 2 * selvedgeKat;
  }

  if (bordur > 0) {
    katmanlar.push({
      id: "bordur",
      bicim: "halka",
      dis: { x: sol, y: ust, w: gen, h: yuk },
      kalinlik: bordur,
    });
    ust += bordur;
    sol += bordur;
    gen -= 2 * bordur;
    yuk -= 2 * bordur;
  }

  if (o.inceSu > 0) {
    katmanlar.push({
      id: "inceSu",
      bicim: "halka",
      dis: { x: sol, y: ust, w: gen, h: yuk },
      kalinlik: o.inceSu,
    });
    ust += o.inceSu;
    sol += o.inceSu;
    gen -= 2 * o.inceSu;
    yuk -= 2 * o.inceSu;
  }

  katmanlar.push({
    id: "zemin",
    bicim: "halka",
    dis: { x: sol, y: ust, w: gen, h: yuk },
    kalinlik: 0,
  });

  // Abraş bant sınırları: zeminin içine düşen, bant genişliğinin katı satırlar.
  const bant = sonuc.abras.bant;
  const abrasSinirlari: number[] = [];
  for (let y = Math.ceil(ust / bant) * bant; y < ust + yuk; y += bant) {
    if (y > ust) abrasSinirlari.push(y);
  }

  return {
    sonuc,
    izgara: { w: o.w, h: o.h },
    katmanlar,
    abrasSinirlari,
    selvedgeKalinligi: selvedgeKat,
  };
}
