# kilim-avatars

Herhangi bir metinden deterministik Anadolu kilimi. Sıfır bağımlılık, saf SVG, SSR uyumlu.

[![npm](https://img.shields.io/npm/v/kilim-avatars?color=%23A8322A&labelColor=%232E2419)](https://www.npmjs.com/package/kilim-avatars)
[![dependencies](https://img.shields.io/badge/dependencies-0-%232C5580?labelColor=%232E2419)](https://www.npmjs.com/package/kilim-avatars?activeTab=dependencies)
[![CI](https://github.com/FefeTugrul/kilim/actions/workflows/ci.yml/badge.svg)](https://github.com/FefeTugrul/kilim/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/kilim-avatars?color=%235C6B3C&labelColor=%232E2419)](./LICENSE)

**[Canlı demo](https://fefetugrul.github.io/kilim)** · [Gizlilik](./PRIVACY.md) · [Güvenlik](./SECURITY.md) · [English](./README.md) · **Türkçe**

```bash
npm install kilim-avatars
```

```ts
import { generateKilim } from "kilim-avatars";

const k = generateKilim("furkan");

k.svg; // '<svg …>' — kendi kendine yeten, dış kaynağa bağlı değil
k.name; // 'Milas — koçboynuzu sıra düzenli iki tonlu, baklava bordürlü'
k.nameEn; // "Milas kilim — ram's horn in rows, two-tone, diamond border"
k.motifs; // ['koçboynuzu', 'baklava']
k.region; // 'milas' — yöre de tohumdan seçilir
k.palette; // ['#EFE5D0', '#A8322A', '#C9922E', '#2E2419', '#2C5580']
```

Aynı metin her ortamda aynı sonucu verir — tarayıcıda, Node'da ve sunucu tarafı
render sırasında. `Math.random` yok, `Date` yok, locale bağımlılığı yok.

Mevcut bir sayfaya eklemek tek satır:

```tsx
<img src={`data:image/svg+xml,${encodeURIComponent(generateKilim(user.id).svg)}`} />
```

Belirli bir palet istiyorsan yöreyi sabitleyebilirsin:

```ts
generateKilim("furkan", { region: "sivas" }); // lacivert zeminli
```

> **npm sayfasında görünen dosya `README.md`.** Bu sayfa onun Türkçe karşılığıdır
> ve aynı bölümleri aynı sırayla izler. Kaynak koddaki yorumlar ve
> `CONTRIBUTING.md` Türkçedir.

## Veritabanı yok, dosya yok, istek yok

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
| Silme talebi | Dosya + kayıt + CDN önbelleği | Ayrıca silinecek bir avatar kaydı yok |

Determinizmin bütün mesele olmasının sebebi budur: **kaydın kendisi tohumdur.**
Kullanıcı kimliğini elinde tuttuğun sürece deseni yeniden üretebilirsin; saklaman
gereken ayrı bir şey kalmaz. Bu yüzden burada `Math.random` kullanmak bir üslup
tercihi değil, doğrudan hata olurdu — çünkü üretimin kendisi depolamanın yerine
geçiyor.

## Nerede işine yarar

Avatarı saklamak yerine hesaplamak, tek bir durumda iyi bir takas:
**her hesabın görsel bir kimliğe ihtiyacı var ve çoğu hiçbir zaman fotoğraf
yüklemeyecek.** Bu, kulağa geldiğinden daha çok ürünü tarif ediyor.

- **Panolar, yönetim ekranları, kullanıcı tabloları.** Buradaki iş yüz göstermek
  değil, gözle tararken satırı bulunur kılmak. Renk ve desen bunu isimden daha
  hızlı yapar.
- **Yorum akışları, forumlar, değişiklik günlükleri, inceleme kuyrukları.**
  İnsanların çoğu fotoğraf koymaz ve gri siluet hepsini aynı kişiye çevirir.
- **Sohbet ve ortak çalışma.** Yoğun bir akışta "bunu kim yazdı" sorusunu,
  isim okunmadan önce kenardaki biçim cevaplar.
- **İnsan olmayan hesaplar.** Botlar, servis hesapları, API anahtarları, CI
  koşucuları, webhook'lar, entegrasyonlar. Hiçbiri fotoğraf koymayacak ama yine
  de ayırt edilmeleri gerekiyor — ve bir kilim, daire içindeki renkli harften
  iyidir.
- **Tohumlanmış demo verisi, fixture, ekran görüntüsü.**
  `generateKilim("musteri-1")` sana gerçek birinin yüzünü ödünç almadan ve stok
  fotoğrafa para vermeden inandırıcı bir kullanıcı listesi verir.
- **Testler ve görsel anlık görüntüler.** Çıktı bayt bayt kararlı, dolayısıyla
  avatar hiçbir zaman bir snapshot testinin çatlama sebebi olmaz.
- **KVKK ya da GDPR kapsamındaki ürünler.** Yükleme yoksa; saklanacak,
  boyutlanacak, denetlenecek, yedeklenecek ve "unutulma hakkı" geldiğinde
  silinecek bir görsel de yoktur.
- **Önce-çevrimdışı çalışan uygulamalar.** Hiçbir şey indirilmiyor, yani avatar
  ağdan önce orada.

Fotoğraf yüklemeye izin veren bir üründe bu, alttaki katman: kullanıcı aksini
seçene kadar kilimi göster. Pratikte bu, kullanıcılarının çoğu, zamanın çoğunda
demek.

## Nerede işine yaramaz

- **Avatarın ayırt etmesi değil, kimliklendirmesi gerekiyorsa.** 0.3.0'da
  ölçüldü: yaklaşık 3,9 milyon görsel olarak ayrışan dokuma. 1.000 kullanıcıda
  herhangi iki kişinin aynı deseni paylaşma ihtimali %12; 5.000'de neredeyse
  kesin, ortalama üç çift. Bir satırı gözle tanımak için fazlasıyla yeterli,
  "iki kişi asla birbirine benzememeli" diyen bir yer için yanlış.
- **Kullanıcı kendi yüzünü bekliyorsa.** Fotoğrafın kendisinin mesele olduğu bir
  sosyal üründe bunu fotoğrafın yerine koyma; cevap değil, yedek olarak kullan.
- **Arayüzün tek renkli ya da çok sade ise.** Beş doygun kök boya rengiyle
  dokunmuş bir kilim güçlü bir görsel sestir. Sessizce arka plana karışmaz,
  zaten karışması da amaçlanmadı.
- **32 piksel ve altında.** Bordür ve saçak o boyutta bilerek düşürülüyor,
  çünkü lapaya dönüyorlar. Kalan şey hâlâ desen olarak okunuyor ama katmanlı
  yapı gidiyor.
- **Sert bir daire kırpması altında.** Çıktı bir kilim: üstte ve altta saçak,
  dört yanda bordür. Daire maskesi köşeleri ve saçağın çoğunu kesip atar.
  Yuvarlatılmış köşe çalışır; tam daire, onu dokuma gibi gösteren kısmı atar.

## Neden kilim

Kullanıcı hesabı olan her üründe aynı boşluk vardır: profil fotoğrafı
yüklememiş kullanıcı. Bugünkü cevaplar zayıf. Gri siluet herkesi aynı kişiye
çevirir, baş harfler çirkindir ve sürekli çakışır, Gravatar ise dış bir servise
bağımlıdır.

Mevcut üreteçler o boşluğu soyut şekillerle doldurur. Boring Avatars'ın altı
stili de, DiceBear'ın altmış bir stili de modern/soyut eksende; hiçbirinde
kültürel motif yoktur.

`kilim` gerçek Anadolu motiflerini dokur — *göz*, *elibelinde*, *koçboynuzu* —
her birinin belgelenmiş bir anlamı vardır ve ürettiği her sonucu adıyla söyler.

Gravatar'a ayrıca bakmak gerekir, çünkü ekiplerin ilk uzandığı seçenek odur.
Avatarı, ziyaretçinin tarayıcısına `gravatar.com/avatar/<e-postanın sha256'sı>`
adresini istettirerek çözer — yani her sayfa görüntülemesinde hash'i,
ziyaretçinin IP adresini ve geldiği sayfayı üçüncü bir tarafa taşıyan bir istek.
`kilim` hiçbir istek yapmaz: desen, gösterildiği yerde hesaplanır.

## React

```bash
npm install kilim-avatars react
```

```tsx
import { Kilim } from "kilim-avatars/react";

<Kilim seed={user.id} size={40} rounded />;
```

React isteğe bağlı bir peer bağımlılık ve kendi alt yolunda duruyor — `kilim`'i
bir Node betiğinde, worker'da ya da Deno'da import etmek React'i hiç çekmiyor.

`<Kilim />` bir `<svg>` öğesinin kabul ettiği her şeyi kabul eder: `className`,
`style`, `onClick`, `id`, `ref`, `aria-*`, `data-*` — artı `seed`, `size`,
`region`, `label` ve `rounded` kısayolu.

Öğe yerine sonucu isteyenler için hook da var:

```tsx
const { svg, name, palette } = useKilim(user.id, { size: 64 });
```

## API

```ts
generateKilim(seed: string, opts?: KilimSecenek): KilimSonuc
```

| Seçenek | Tip | Varsayılan | Etki |
| --- | --- | --- | --- |
| `size` | `number` | `128` | Kenar uzunluğu (px). 8–2048 arasına sıkıştırılır, detay kademesini belirler |
| `region` | `KilimYore` | tohumdan seçilir | Yöre paletini ve profilini sabitler. Bilinmeyen değer hata fırlatır |
| `label` | `string \| false` | `nameEn` | SVG `<title>`. `false` → `aria-hidden`, ekran okuyucudan gizlenir |

| Dönen alan | Tip | Ne |
| --- | --- | --- |
| `svg` | `string` | Kendi kendine yeten SVG metni |
| `name` | `string` | Türkçe ad, motifler dokundukları adla |
| `nameEn` | `string` | İngilizce ad — `<title>` içine giren budur |
| `motifs` | `string[]` | Kullanılan motiflerin Türkçe adları |
| `region` | `KilimYore` | `'konya' \| 'milas' \| 'sivas' \| 'yoruk' \| 'usak' \| 'iznik'` |
| `palette` | `string[]` | Kullanılan beş hex (her çağrıda yeni bir kopya) |
| `layout` | `string` | Zemin düzeni |

Geçersiz girdide tahmin yürütülmez, hata fırlatılır. Tanımsız bir tohum, boş
metin, bilinmeyen bir yöre — bunların her biri koca bir kullanıcı kümesine
sessizce aynı avatarı verirdi ve kimse fark etmezdi.

### Aynı kullanıcı her boyutta aynı kilim

Palet, ana motif ve düzen `size`'dan bağımsızdır. Kullanıcının yorum
listesindeki 24 piksellik avatarı ile profilindeki 128 piksellik avatarı aynı
kilimdir; yalnızca detay seviyesi değişir. Testler bunu 1.000 tohumda doğruluyor.

### Çıktı boyutu

SVG metin olduğu için ağ isteği yok, ama bedeli HTML'e biniyor:

| `size` | SVG ham | gzip'li transferde |
| --- | --- | --- |
| 24 | 4–8 kB | 0,5–0,9 kB |
| 32 | 4–8 kB | 0,6–1,0 kB |
| 64 | 12–28 kB | 1,2–2,2 kB |
| 128 (varsayılan) | 20–43 kB | 1,7–3,2 kB |

Data-URI olarak gömerken `encodeURIComponent` boyutu yaklaşık %55 şişirir. Çok
avatarlı listelerde `size: 64` kullan, ya da SVG'yi bir `<symbol>` olarak bir kez
tanımlayıp `<use>` ile tekrarla.

Üretilen SVG hiç `id` niteliği taşımaz; bu yüzden aynı sayfaya istediğin kadar
avatar gömebilirsin, hiçbiri diğeriyle çakışmaz.

## Tohumu seçerken

Üretim deterministik ve algoritma açık. Zaten olay bu — ama aynı sebeple tohum
bir ayrıntı değil, bir karar: **desen, verdiğin girdinin yeniden hesaplanabilir
bir tanımlayıcısıdır.**

E-posta adresiyle tohumlarsan, o adresi tahmin eden biri kilimini çevrimdışı
üretip senin sayfandakiyle karşılaştırabilir; giriş yapmadan hesabın var
olduğunu doğrulamış olur. Aynı adres, bu kütüphaneyi kullanan her sitede aynı
kilimi verir — yani hesaplar servisler arasında eşleştirilebilir hale gelir.

**Tohum olarak opak bir iç kimlik kullan — bir UUID.** Kararlıdır, zaten
veritabanında duruyordur ve kişi hakkında hiçbir şey söylemez.

Tohumun e-postadan türemesi şartsa, önce uygulamaya özel bir gizli anahtarla
tuzla:

```ts
import { createHmac } from "node:crypto";

const tohum = createHmac("sha256", process.env.AVATAR_SECRET)
  .update(user.email)
  .digest("hex");

generateKilim(tohum);
```

Avatar kullanıcın için kararlı kalır, tahmin ve siteler arası eşleştirme ise
çalışmaz olur.

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
| bereket | fertility | Bolluk; elibelinde ile koçboynuzunun bileşimi | zemin, göbek |
| çengel | hook | Tutunma ve nazardan korunma | zemin, dolgu |
| akrep | scorpion | Zararlıdan korunma | yalnız zemin |
| kurtağzı | wolf's mouth | Sürüyü ve evi tehlikeden sakınma | yalnız bordür |
| sandık | chest | Çeyiz ve birikim; gelinin sandığı | yalnız zemin |
| muska | amulet | Kötülükten korunma | yalnız dolgu |
| saçbağı | hair-tie | Evlenme ve birleşme dileği | yalnız zemin |
| göbek | medallion | Kilimin merkezi; ocak ve aile | yalnız göbek |
| kırkbudak | forty branches | Çoğalma ve bereket | yalnız zemin |
| tarak | comb | Temizlik ve düzen; gelin tarağı | yalnız bordür |

Yerleşim süs değildir. Figüratif motif bordüre asla girmez, bant motifi zeminde
tek başına duramaz — üreteç bu kuralı zorlar, testler de bunu doğrular.

Anlamlar **yaygın yorumdur, kesin bilgi değil.** Bugün dolaşımdaki eşleştirmelerin
büyük kısmı Güran Erbek'in kataloğuna ve onu izleyen literatüre dayanır; aynı
biçim köyden köye başka adla anılır. Yukarıdaki sütunu bir sözlük değil, etnografik
bir teamül olarak oku.

## Bir kilimin katmanları

Dıştan içe: **saçak → selvedge (zencirek) → bordür → ince su → zemin.**

Zemin dört düzenden biriyle dokunur — `tekrar` (sıra düzenli), `kaydırmalı`
(tuğla dizilim), `göbek` (tek büyük göbek) veya `bantlı` (dönüşümlü şeritler) —
ve tamamı dikey olarak aynalanır. Yatay olarak asla: kilimin bir üstü bir altı
vardır ve bu tek asimetri, çıktıyı duvar kâğıdından ayıran şeydir.

Tekrar eden bordür bir kenara tam bölünmüyorsa sıkıştırılmaz, **köşede kesilir.**
Dokumacı da öyle yapar; "algoritma uydurdu" ile "biri dokudu" arasındaki farkın
çoğu o dürüst kesikten gelir.

## Yöreler

Stil adları uydurma değil. `bauhaus` ve `marble` estetik kapristir; `konya` ve
`milas` belgelenebilir dokuma gelenekleridir.

Yöre yalnızca bir renk şeması değildir. Rengi, **düzen dağılımını, yoğunluğu,
bordür genişliğini ve motif ağırlıklarını** birlikte belirler — aynı tohum
Konya'da ve Yörük'te gözle görülür biçimde farklı bir kilim dokur.

| Yöre | Renk | Düzen eğilimi | Bordür | Yoğunluk | Öne çıkan motifler |
| --- | --- | --- | --- | --- | --- |
| `konya` | Kırmızı zemin, krem motif, lacivert ve altın | göbekli | normal | orta | göbek, çengel, elibelinde, tarak |
| `milas` | Krem zemin, hardal ve lacivert | sıra düzenli | **en geniş** | düşük | koçboynuzu, çengel, su yolu |
| `sivas` | Lacivert zemin, açık kontur | sıra düzenli, bantlı | ince | **en yüksek** | bereket, kırkbudak, baklava, pıtrak |
| `yoruk` | Kahve-siyah zemin, toprak tonları | sıra düzenli | **en dar** | **en düşük** | akrep, saçbağı, koçboynuzu, testere |
| `usak` | Gri-krem zemin, zeytin ve bordo | **kaydırmalı** | geniş | yüksek | yıldız, baklava, sandık, muska |
| `iznik` | İznik pigmentleri — kobalt, turkuaz, mercan | nötr | normal | orta | atama yok |

### Eleme değil, ağırlık

Taranan hiçbir kaynak bir motifi tek bir yöreye hasretmiyor. Göz, koçboynuzu,
elibelinde ve yıldız pan-Anadolu'dur; bir geleneği diğerinden ayıran şey hangi
motifin merkezî rolü aldığı, zeminin ne kadar dolu olduğu ve bordürün ne kadar
geniş gittiğidir. Bu yüzden profiller motifleri **elemiyor, ağırlıklandırıyor**:
her motif her yörede çıkabilir, sadece olasılığı kayar. Bir test bunu kanıtlıyor
— yeterince tohum çekildiğinde her yöre bütün zemin motiflerini er geç dokuyor.

En güçlü belgelenmiş eşleme Uşak'ta. Türk Patent'in coğrafi işaret tescili
(No. 152, 2012) "Yıldızlı Uşak" tipini *sekiz kollu yıldızlarla küçük baklava
biçimindeki madalyonların kaydırılmış eksenler üzerinde alternatif sıralanması*
diye tanımlıyor — bu, kütüphanenin `yıldız` ve `baklava` motiflerinin kaydırmalı
düzendeki hâlinin birebir tarifi.

### İznik'e bilerek motif atanmadı

İznik için bir kilim/düz dokuma geleneği arandı, **bulunamadı**: İznik adı
yalnızca çini ve seramik literatüründe geçiyor. Gerçek dağarcığı — rumi, hatayi,
lale, karanfil — eğrisel ve bitkiseldir; kilimin basamaklı, dik açılı geometrisine
tercüme olmaz. Bu yüzden İznik yalnızca pigment veriyor ve profili bilinçli
olarak nötr. Ona uydurma bir motif seti atamak, bu kütüphanenin gerçekten vaat
ettiği tek şeyi bozardı.

### Profiller ne, ne değil

Ağırlıklar kaynaklardan **türetilmiş tasarım yorumudur, alıntı değildir.**
Özellikle yoğunluk ve bordür genişliği için literatürde nicel ölçüm yok; nitel
tariflerden çıkarıldı. Milas ağırlıklı bir düğümlü halı merkezidir ve Milas'a
özgü ayrı bir *kilim* şeması için güçlü akademik kaynak bulunamadı. Yörük
kilimlerinde bordür yapısını doğrudan anlatan bir kaynak yok. Her profil,
[`src/yore.ts`](./src/yore.ts) içinde kendi kaynaklarını ve kendi sınırlarını
üstündeki yorumda taşıyor.

### Renkler ölçülerek seçildi

Her palet beş slot doldurur: zemin, ana, ikincil, kontur, vurgu. Hiçbiri göz
kararıyla konmadı — her hex, OKLCH uzayında tanımlı kısıtlardan geçiyor:

| Kural | Değer | Neden |
| --- | --- | --- |
| Kroma aralığı | 0.01 – 0.16 | Doğal boya bu aralığın dışına çıkmaz; üstü dijital görünür |
| Yasak hue | 280° – 330° | Kök boyada mor ve magenta karşılığı yoktur |
| Zeminle parlaklık farkı | ≥ 0.18 | Bu farkın altında motif zemine gömülür |
| Motifler arası fark | ΔL ≥ 0.08 **ya da** ΔH ≥ 25° | Yoksa iki motif rengi gri tonlamada birbirine karışır |
| Zemin parlaklığı | orta **ve** soluk yasak | L 0.45–0.62 aralığında, kroması 0.09'un altındaki zemin motifi yutar |
| Saf uçlar | `#000000` / `#FFFFFF` yasak | Koyu renk kahverengi-siyahtır, açık renk boyasız yündür |

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

Üreteç zemin parlaklığını 5–9 hücrelik bantlar halinde ±%1–3 kaydırıyor.
Bilinçaltında algılanır; "el yapımı" hissinin çoğu buradan gelir. Kusursuz düz
zemin sentetik görünür.

Kaymalar rastgele gürültü değil, elle seçilmiş dizilerden geliyor — çünkü gerçek
abraş bir yerde başlayıp bir süre devam eden bir kaymadır, hücre hücre zıplayan
bir gürültü değil. Tonlar derleme zamanında hesaplanıp tabloya yazılıyor
(`npm run abras`), böylece OKLCH dönüşüm matematiği pakete hiç girmiyor ve bir
test tablonun formülle uyumlu kaldığını doğruluyor.

## Detay kademeleri

38×33'lük bir ızgara 24 pikselde lapa olur, o yüzden ızgara istenen boyuta göre
seyrelir.

| Boyut | Izgara | Ne çizilir |
| --- | --- | --- |
| ≤ 32 px | 15 × 13 | Düz çerçeve içinde tek göbek |
| 33–80 px | 29 × 25 | Bordür ve küçük bir zemin |
| > 80 px | 38 × 33 | Tam gramer, saçak dahil |

2.000 tohumda ölçülen benzersizlik: **24 pikselde %85, 64 piksel ve üzerinde
%100.** Küçük kademede çeşitlilik bilinçli olarak daha düşük, çünkü o kademe
artık kendi düzenini ayrı çekmiyor; büyük boyut için verilmiş karardan
türetiyor. 24 pikselde okunabilirlik çeşitlilikten önce gelir, boyutlar arası
kimlik tutarlılığı ise ikisinden de önce.

## Erişilebilirlik

Üretilen SVG bir `<title>` taşır ve içeriği kilimin İngilizce adıdır. Avatarın
yanında zaten kullanıcı adı yazıyorsa deseni ekran okuyucudan gizle:

```tsx
generateKilim(user.id, { label: false }); // SVG aria-hidden olur
```

Türkçe `name` kültürel içeriktir ve Türkçe kalır; erişilebilir ad ise
İngilizcedir, çünkü onu okuyan ekran okuyucu kullanıcısı dünyanın herhangi bir
yerinde olabilir.

## Tasarım notları

Motifler ASCII ızgara olarak yazılır, asla SVG `path` verisi olarak değil. Kilim
dokuma tezgâhının ızgarasına bağlıdır; kısıt sahicidir ve kütüphaneyi küçük tutar.

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

Hücreler kare değildir: `en : boy ≈ 1 : 1.15`. Gerçek kilimde atkı yoğunluğu
motifleri dikey uzatır, kare hücre ise çıktıyı anında duvar kâğıdı gibi gösterir.
Izgara boyutları bu oranı telafi edecek şekilde seçildi, çünkü avatar kare olmak
zorundadır.

## Kararlılık

`fnv1a` çıktısı ve PRNG çekilişlerinin sırası kamuya açık sözleşmenin parçasıdır.
İkisinden birini değiştirmek her kullanıcının avatarını değiştirir; semver'e göre
kırıcı değişikliktir.

`test/golden.test.ts` bunu kilitler: sabit tohumların SVG hash'lerini tutar. Bu
test kırıldığında bir hata bulmuş olmazsın — kırıcı bir değişiklik yapmış
olursun. Değişiklik bilinçliyse sürümü yükselt ve tabloyu yenile:

```bash
npm run altin   # test/golden.test.ts içindeki tabloyu yeniden üretir
```

Aynı sebeple `src/motifs.ts` içindeki `*_ADAYLARI_V1` listeleri donmuştur. Yeni
motifler `TUM_MOTIFLER`'e eklenebilir ama bir sonraki kırıcı sürümün `_V2`
listelerine girene kadar üretime karışmaz. Katkı kuralları için
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Geliştirme

```bash
npm install
npm test          # 166 test: determinizm, gramer, palet kısıtları, çeşitlilik, güvenlik
npm run typecheck
npm run build     # ESM + CJS + .d.ts, iki giriş noktası
npm run size      # gzip bütçe denetimi (9 kB)
npm run onizleme  # onizleme.html üretir — açıp çıktıyı görürsün
npm run abras     # abraş ton tablosunu yeniden üretir (palet değişince)
npm run altin     # altın hash tablosunu yeniler (bilinçli kırıcı değişiklikten sonra)
```

## Lisans

MIT © Furkan Efe Tuğrul

Motif adları, anlamları ve yöresel karakteristikler kamuya açık kaynaklardan
derlenmiştir — başlıcaları *Arış* (Atatürk Kültür Merkezi), Güran Erbek'in
*Kilim Catalogue No. 1*'i, Türk Patent coğrafi işaret tescil kayıtları ve Koç
Üniversitesi'nin Josephine Powell koleksiyonu. Tam künyeler
[`src/yore.ts`](./src/yore.ts) içindeki yorumlarda.
