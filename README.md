# kilim

Herhangi bir metinden deterministik Anadolu kilimi. Sıfır bağımlılık, saf SVG.

**Türkçe** · [English](./README.en.md)

```ts
import { generateKilim } from "kilim";

const k = generateKilim("furkan");

k.svg; // '<svg …>' — kendi kendine yeten, dış kaynağa bağlı değil
k.name; // 'koçboynuzu kaydırmalı, testere bordürlü'
k.motifs; // ['koçboynuzu', 'testere']
k.palette; // ['#EDE3CE', '#A8322A', '#C9922E', '#2B2620', '#1F3A5F']
```

Aynı metin her ortamda aynı sonucu verir — tarayıcıda, Node'da ve sunucu tarafı
render sırasında. `Math.random` yok, `Date` yok, locale bağımlılığı yok.

> **Yapım aşamasında.** Faz 1 ve 2 tamam: deterministik çekirdek ve dokuma
> grameri. Sırada yöresel paletler, React bileşeni ve npm yayını var.

## Hangi sorunu çözüyor

Kullanıcı hesabı olan her uygulamada aynı boşluk vardır: **profil fotoğrafı
yüklememiş kullanıcı.** Bugünkü cevaplar sınırlı — gri siluet herkeste aynıdır,
baş harfler çirkindir ve çakışır, Gravatar dış bir servise ve kullanıcının
e-posta hash'ini üçüncü tarafa göndermeye bağımlıdır.

`kilim` o boşluğa kişiye özel bir desen koyar. Tek satır:

```tsx
<img src={`data:image/svg+xml,${encodeURIComponent(generateKilim(user.id).svg)}`} />
```

### Veritabanı yok, dosya yok, istek yok

Bu kütüphanenin en önemli özelliği ne **yapmadığıdır**: hiçbir şey saklamaz.

Klasik avatar akışı şudur: kullanıcı fotoğraf yükler → dosya diske veya S3'e
yazılır → CDN'e dağıtılır → veritabanında bir satır URL'yi tutar → yedekleme,
moderasyon, boyutlandırma ve KVKK/GDPR yükümlülüğü doğar.

`kilim`'de bunların hiçbiri yoktur. Desen, her seferinde metinden **hesaplanır**.

| | Klasik avatar | kilim |
| --- | --- | --- |
| Depolama | Dosya + veritabanı satırı | Yok |
| Ağ isteği | CDN'den indirme | Yok |
| Kişisel veri | Yüklenen fotoğraf saklanır | Hiçbir şey saklanmaz |
| Çevrimdışı | Çalışmaz | Çalışır |
| Silme talebi | Dosya + kayıt + CDN önbelleği | Silinecek bir şey yok |

Determinizmin bütün mesele olmasının sebebi budur: **kaydın kendisi seed'dir.**
Kullanıcı kimliğini elinde tuttuğun sürece deseni yeniden üretebilirsin, o yüzden
saklamana gerek yoktur. Bu yüzden `Math.random` kullanmak bir tercih değil, bir
hata olurdu — sakladığın hiçbir şey olmadığı için üretimin kendisi kayıt yerine
geçer.

### Neden kilim

Mevcut avatar üreteçleri soyut şekiller çizer. Boring Avatars'ın altı stili de,
DiceBear'ın altmış bir stili de modern/soyut eksende; hiçbirinde kültürel motif
yoktur.

`kilim` gerçek Anadolu motiflerini dokur — *göz*, *elibelinde*, *koçboynuzu* —
her birinin belgelenmiş bir anlamı vardır ve ürettiği her sonucu adıyla söyler.

## Motifler

| Motif | İngilizce | Anlamı | Girebildiği yer |
| --- | --- | --- | --- |
| göz | evil eye | Kem gözden koruma | zemin, göbek |
| pıtrak | burr | Nazardan koruma ve bolluk | zemin, dolgu |
| koçboynuzu | ram's horn | Güç ve bereket | zemin, göbek |
| yıldız | eight-pointed star | Mutluluk ve doğurganlık | göbek, zemin |
| elibelinde | hands on hips | Dişilik ve analık | yalnız zemin |
| su yolu | running water | Hayat ve süreklilik | yalnız bordür |
| testere | sawtooth | Koruma | yalnız bordür |
| baklava | diamond | Bereket | yalnız bordür |

Yerleşim süs değildir. Figüratif motif bordüre asla girmez, bant motifi zeminde
tek başına duramaz — üreteç bu kuralı zorlar, testler de bunu doğrular.

## Bir kilimin katmanları

Dıştan içe: **saçak → selvedge → bordür → ince su → zemin.**

Zemin dört düzenden biriyle dokunur — `tekrar` (sıra düzenli), `kaydırmalı`
(tuğla dizilim), `göbek` (tek büyük göbek) veya `bantlı` (dönüşümlü şeritler) —
ve tamamı dikey olarak aynalanır. Yatay olarak asla: kilimin bir üstü bir altı
vardır ve bu tek asimetri, çıktıyı duvar kâğıdından ayıran şeydir.

## Detay kademeleri

38×33'lük bir ızgara 24 pikselde lapa olur, o yüzden ızgara istenen boyuta göre
seyrelir.

| Boyut | Izgara | Ne çizilir |
| --- | --- | --- |
| ≤ 32 px | 15 × 13 | Düz çerçeve içinde tek göbek |
| 33–80 px | 29 × 25 | Bordür ve küçük bir zemin |
| > 80 px | 38 × 33 | Tam gramer, saçak dahil |

Küçük kademede çeşitlilik bilinçli olarak daha düşüktür: 24 pikselde okunabilirlik
çeşitlilikten önce gelir. Ölçülen benzersizlik oranı 24 pikselde %11,7, 128
pikselde %99,4 (2000 seed). Yöresel paletler bu sayıları yaklaşık altıya
katlayacak.

## Erişilebilirlik

Üretilen SVG varsayılan olarak bir `<title>` taşır ve içeriği kilimin adıdır.
Avatarın yanında zaten kullanıcı adı yazıyorsa deseni ekran okuyucudan gizle:

```tsx
generateKilim(user.id, { label: false }); // SVG aria-hidden olur
```

## Geliştirme

```bash
npm install
npm test          # 84 test: determinizm, gramer, çeşitlilik, güvenlik
npm run typecheck
npm run build     # ESM + CJS + .d.ts
npm run size      # gzip bütçe denetimi (8 kB)
npm run onizleme  # onizleme.html üretir — açıp çıktıyı görürsün
```

## Tasarım notları

Motifler ASCII ızgara olarak yazılır, asla SVG `path` verisi olarak değil. Kilim
dokuma tezgahının ızgarasına hapistir; kısıt sahicidir ve kütüphaneyi küçük tutar.

```ts
const GOZ = [
  "..XXX..",
  ".X...X.",
  "X..O..X",
  "X.OOO.X",
  "X..O..X",
  ".X...X.",
  "..XXX..",
];
```

Hücreler kare değildir: `en : boy = 1 : 1.15`. Gerçek kilimde atkı yoğunluğu
motifleri dikey uzatır, kare hücre ise çıktıyı anında duvar kâğıdı gibi gösterir.
Izgara boyutları bu oranı telafi edecek şekilde seçildi, çünkü avatar kare olmak
zorundadır.

Tekrar eden bordür bir kenara tam bölünmüyorsa sıkıştırılmaz, **köşede kesilir.**
Dokumacı da öyle yapar; "algoritma uydurdu" ile "biri dokudu" arasındaki farkın
çoğu o dürüst kesikten gelir.

## Kararlılık

`fnv1a` çıktısı ve PRNG çekilişlerinin sırası kamuya açık sözleşmenin parçasıdır.
İkisinden birini değiştirmek her kullanıcının avatarını değiştirir; semver'e göre
kırıcı değişikliktir.

`test/golden.test.ts` bunu kilitler: sabit seed'lerin SVG hash'lerini tutar. Bu
test kırıldığında bir hata bulmuş olmazsın — kırıcı bir değişiklik yapmış olursun.
Değişiklik bilinçliyse major sürüm çıkar ve tabloyu yenile:

```bash
npm run altin   # test/golden.test.ts içindeki tabloyu yeniden üretir
```

Aynı sebeple `src/motifs.ts` içindeki `*_ADAYLARI_V1` listeleri donmuştur. Yeni
motifler `TUM_MOTIFLER`'e eklenebilir ama bir sonraki major sürümün `_V2`
listelerine girene kadar üretime karışmaz.

## Yol haritası

- [x] **Faz 1** — Çekirdek: FNV-1a hash, mulberry32 PRNG, hücre ızgarası, SVG çıkışı
- [x] **Faz 2** — Sekiz motif ve dokuma grameri
- [ ] **Faz 3** — Beş yöresel palet, algısal renk kısıtları, *abraş*
- [ ] **Faz 4** — React bileşeni, npm yayını
- [ ] **Faz 5** — Demo sitesi ve dokümantasyon

## Lisans

MIT © Furkan Efe Tuğrul

Motif adları ve anlamları kamuya açık kaynaklardan derlenmiştir; tam kaynak
listesi Faz 5'te demo sitesiyle birlikte yayınlanacak.
