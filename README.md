# kilim

Herhangi bir metinden deterministik Anadolu kilimi. Sıfır bağımlılık, saf SVG.

**Türkçe** · [English](./README.en.md)

```bash
npm install kilim
```

```ts
import { generateKilim } from "kilim";

const k = generateKilim("furkan");

k.svg; // '<svg …>' — kendi kendine yeten, dış kaynağa bağlı değil
k.name; // 'Milas — koçboynuzu kaydırmalı iki tonlu, testere bordürlü'
k.motifs; // ['koçboynuzu', 'testere']
k.style; // 'milas' — yöre de seed'den seçilir
k.palette; // ['#EFE5D0', '#A8322A', '#C9922E', '#2E2419', '#2C5580']
```

Aynı metin her ortamda aynı sonucu verir — tarayıcıda, Node'da ve sunucu tarafı
render sırasında. `Math.random` yok, `Date` yok, locale bağımlılığı yok.

İstersen yöreyi sabitleyebilirsin:

```ts
generateKilim("furkan", { style: "sivas" }); // lacivert zeminli
```

> **Yapım aşamasında.** Faz 1, 2 ve 3 tamam: deterministik çekirdek, dokuma
> grameri ve yöresel paletler. Sırada React bileşeni ve npm yayını var.

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

## Yöresel paletler

Stil adları uydurma değil. `bauhaus` ve `marble` estetik kaprisdir; `konya` ve
`milas` belgelenebilir dokuma gerçeğidir. Bu, projenin en güçlü ayırt edici
kararı — çıktının bir yöresi olması onu "renkli desen üreteci" olmaktan çıkarır.

| Yöre | Karakter |
| --- | --- |
| `konya` | Kırmızı zemin, krem motif, koyu lacivert ve altın vurgu |
| `milas` | Krem zemin, ince bordür, hardal ve lacivert |
| `sivas` | Lacivert zemin, yoğun düzen, açık konturla ayrılmış |
| `yoruk` | Kahve-siyah zemin, az renk, toprak tonları |
| `usak` | Soluk zemin, seyrek göbek, zeytin ve gül |
| `iznik` | Çini pigmentleri — kobalt, turkuaz, mercan |

İznik yalnızca bir **palet temasıdır**; geometri kilim olarak kalır. Çini
eğrisel ve serbesttir, kilim açısal ve ızgara kısıtlıdır — ikisini geometride
birleştirmek ne kilim ne çini olan bir şey üretir.

### Renkler ölçülerek seçildi

Her palet beş slot doldurur: zemin, ana, ikincil, kontur, vurgu. Hiçbiri göz
kararıyla konmadı — hepsi OKLCH uzayında tanımlı kısıtlardan geçti:

| Kural | Değer | Neden |
| --- | --- | --- |
| Kroma aralığı | 0.01 – 0.16 | Doğal boya bu aralığın dışına çıkmaz; üstü dijital görünür |
| Yasak hue | 280° – 330° | Kök boyada mor ve magenta karşılığı yoktur |
| Zeminle parlaklık farkı | ≥ 0.18 | Bu farkın altında motif zemine gömülür |
| Saf uçlar | `#000000` / `#FFFFFF` yasak | Koyu renk kahverengi-siyahtır, açık renk boyasız yündür |
| Zemin parlaklığı | orta + soluk yasak | Orta parlaklıkta *ve* soluk bir zemin motifi yutar |

Bu kurallar `src/oklch.ts` içinde kod olarak duruyor ve bir test her paleti her
çalıştırmada denetliyor. Yeni palet eklemek isteyen aynı kapıdan geçer — renk
seçimi zevk meselesi olmaktan çıkıp ölçülebilir bir karara dönüşsün diye.

Kuralların ikisi ilk yazıldıklarında fazla katıydı ve paletleri değil kendilerini
düzeltmek gerekti: kırmızı zeminli Konya kilimi gerçek ve güzeldir, orta
parlaklıkta olmasına rağmen motifi yutmaz — çünkü motifi yutan şey orta parlaklık
değil, orta parlaklık *ve* solukluktur.

### Abraş

Gerçek kilimde zemin rengi tek düze değildir: dokumacı yeni bir yumak açtığında
boya partisi değişir ve renk hafifçe kayar. Buna **abraş** denir.

Üreteç zemin parlaklığını 5–9 hücrelik bantlar halinde algısal olarak ±%1–3
kaydırıyor. Bilinçaltında algılanır; "el yapımı" hissinin çoğu buradan gelir.
Kusursuz düz zemin sentetik görünür.

Kaymalar rastgele gürültü değil, elle seçilmiş dizilerden geliyor — çünkü gerçek
abraş bir yerde başlayıp bir süre devam eden bir kaymadır, hücre hücre zıplayan
bir gürültü değil.

Tonlar derleme zamanında hesaplanıp tabloya yazılıyor (`npm run abras`), böylece
OKLCH dönüşüm matematiği pakete hiç girmiyor. Bir test tablonun formülle uyumlu
kaldığını doğruluyor.

## Detay kademeleri

38×33'lük bir ızgara 24 pikselde lapa olur, o yüzden ızgara istenen boyuta göre
seyrelir.

| Boyut | Izgara | Ne çizilir |
| --- | --- | --- |
| ≤ 32 px | 15 × 13 | Düz çerçeve içinde tek göbek |
| 33–80 px | 29 × 25 | Bordür ve küçük bir zemin |
| > 80 px | 38 × 33 | Tam gramer, saçak dahil |

Küçük kademede çeşitlilik bilinçli olarak daha düşüktür: 24 pikselde okunabilirlik
çeşitlilikten önce gelir. Ölçülen benzersizlik (2000 seed):

| Boyut | Faz 2 | Faz 3 (paletlerle) |
| --- | --- | --- |
| 24 px | %11,7 | **%85,2** |
| 64 px | %98,4 | **%100** |
| 128 px | %99,4 | **%100** |

24 pikseldeki oran Faz 3.5'te bilinçli olarak biraz düştü: küçük kademe artık
kendi düzenini ayrı çekmiyor, büyük boyuttaki karardan türetiyor. Kimlik
tutarlılığı, birkaç puan çeşitlilikten önemli.

## API

```ts
generateKilim(seed: string, opts?: KilimSecenek): KilimSonuc
```

| Seçenek | Tip | Varsayılan | Etki |
| --- | --- | --- | --- |
| `size` | `number` | `128` | Kenar uzunluğu (px). 8–2048 arasına sıkıştırılır, detay kademesini belirler |
| `style` | `string` | seed'den seçilir | Yöreyi sabitler. Geçersiz kimlik sessizce varsayılana düşer |
| `label` | `string \| false` | üretilen ad | SVG `<title>`. `false` → `aria-hidden`, ekran okuyucudan gizlenir |

| Dönen alan | Tip | Ne |
| --- | --- | --- |
| `svg` | `string` | Bağımsız SVG metni |
| `name` | `string` | `"Milas — koçboynuzu kaydırmalı iki tonlu, testere bordürlü"` |
| `motifs` | `string[]` | Kullanılan motiflerin Türkçe adları |
| `style` | `string` | Seçilen yörenin kimliği |
| `palette` | `string[]` | Kullanılan beş hex |
| `layout` | `string` | Zemin düzeni |

### Aynı kullanıcı her boyutta aynı kilim

Palet, ana motif ve düzen `size`'dan bağımsızdır. Kullanıcının yorum
listesindeki 24 piksellik avatarı ile profilindeki 128 piksellik avatarı aynı
kilimdir; yalnızca detay seviyesi değişir. Testler bunu 1000 seed'de doğruluyor.

### Çıktı boyutu

SVG metin olduğu için ağ isteği yok, ama bedeli HTML'e biniyor:

| `size` | SVG ham | gzip'li transferde |
| --- | --- | --- |
| 32 | ~4 kB | ~0,7 kB |
| 64 | ~19 kB | ~1,8 kB |
| 128 (varsayılan) | ~34 kB | ~2,9 kB |

Data-URI olarak gömerken `encodeURIComponent` boyutu yaklaşık %55 şişirir. Çok
avatarlı listelerde `size: 64` kullan, ya da SVG'yi bir `<symbol>` olarak bir kez
tanımlayıp `<use>` ile tekrarla.

## Erişilebilirlik

Üretilen SVG varsayılan olarak bir `<title>` taşır ve içeriği kilimin adıdır.
Avatarın yanında zaten kullanıcı adı yazıyorsa deseni ekran okuyucudan gizle:

```tsx
generateKilim(user.id, { label: false }); // SVG aria-hidden olur
```

## Geliştirme

```bash
npm install
npm test          # 105 test: determinizm, gramer, palet kısıtları, çeşitlilik, güvenlik
npm run typecheck
npm run build     # ESM + CJS + .d.ts
npm run size      # gzip bütçe denetimi (8 kB)
npm run onizleme  # onizleme.html üretir — açıp çıktıyı görürsün
npm run abras     # abraş ton tablosunu yeniden üretir (palet değişince)
npm run altin     # altın hash tablosunu yeniler (bilinçli kırıcı değişiklikten sonra)
```

Katkı kuralları ve bu projeye özel iki tuhaflık için [CONTRIBUTING.md](./CONTRIBUTING.md).

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
- [x] **Faz 3** — Altı yöresel palet, algısal renk kısıtları, *abraş*
- [ ] **Faz 4** — React bileşeni, npm yayını
- [ ] **Faz 5** — Demo sitesi ve dokümantasyon

## Lisans

MIT © Furkan Efe Tuğrul

Motif adları ve anlamları kamuya açık kaynaklardan derlenmiştir; tam kaynak
listesi Faz 5'te demo sitesiyle birlikte yayınlanacak.
