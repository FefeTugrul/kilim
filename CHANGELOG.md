# Değişiklik günlüğü

Bu paket [Semantic Versioning](https://semver.org/lang/tr/) izler.

**Özel kural:** üretilen SVG'nin kendisi kamuya açık API'nin parçasıdır. Aynı
girdinin farklı çıktı vermesi bir iyileştirme değil, **kırıcı değişikliktir** —
çünkü herkesin avatarı değişir. `test/golden.test.ts` bunu kilitler.

## [0.3.1] — 2026-09-12

Kırıcı değişiklik yok: üretilen SVG bayt bayt 0.3.0 ile aynı. Bu sürüm
belgelerin koddan sapmış olduğu yerleri kapatıyor.

### Eklendi

- **İngilizce tip takma adları:** `KilimOptions`, `KilimResult`, `KilimRegion`.

  İngilizce README bu üç adı belgeliyordu ama paket yalnızca `KilimSecenek`,
  `KilimSonuc` ve `KilimYore`'yi dışa aktarıyordu. `import type { KilimResult }
  from "kilim-avatars"` yazan bir TypeScript kullanıcısı, belgedeki ilk satırda
  derleme hatası alıyordu. Yeniden adlandırmak yerine takma ad eklendi: Türkçe
  adlar kırılmıyor, İngilizce okuyan da belgede gördüğü adı buluyor. Tipler
  derlemede silindiği için çalışma zamanına maliyeti yok.

  `test/api-yuzeyi.test.ts` iki adın da ayakta kalmasını ve aynı tipi
  göstermesini kilitliyor.

### Düzeltildi

- **Yöre notlarındaki iki çelişki.** `MILAS.not` "ince bordür" diyordu; 0.3.0
  Milas'a altı yörenin en geniş bordürünü verdi (`bordurCarpani: 1.7`).
  `USAK.not` "seyrek göbek" diyordu; Uşak'ın düzen ağırlığı `[15, 65, 12, 8]`,
  yani göbek %12 ve baskın düzen kaydırmalı — üstelik `seyreklik: 0.3` ile
  Sivas'tan sonra en yoğun ikinci yöre. İkisi de demo sitesinde görünüyordu.
  `SIVAS.not` ise çelişkili değil yalnızca bulanıktı ("açık konturla ayrılmış" →
  "motifleri ayıran açık kontur"); neyin neyden ayrıldığı artık yazıyor.

- **Sivas'ın düzen eğilimi yanlış sırada yazılıydı.** İki README de "sıra
  düzenli, bantlı" diyordu; Sivas'ın ağırlıkları `[25, 25, 5, 45]`, yani baskın
  düzen **bantlı** (%45), sıra düzenli %25'te kalıyor. Tablo "bantlı, sıra
  düzenli" olarak düzeltildi.

- **`KURULUM.md` hâlâ `NPM_TOKEN` repo secret'ı oluşturmayı anlatıyordu.**
  Yayın 0.2.1'den beri trusted publishing (OIDC) ile yapılıyor ve workflow
  böyle bir secret okumuyor — duran bir token yalnızca sızma yüzeyi olurdu.
  Bölüm npm tarafındaki trusted publisher ayarıyla değiştirildi.

- **18 motifin `anlam` metni tek üslupta birleştirildi.** İlk sekizi düz ve
  kesin, Faz 6'da gelen onu ise sürekli "... olarak yorumlanır" çekincesiyle
  yazılmıştı. Çekince yalnızca yenilerde olduğu için ilk sekizinin kesin bilgi
  olduğunu ima ediyordu; oysa anlamların tek okuma olduğu uyarısı zaten
  belgelerde duruyor.

- **Bayat örnek çıktı.** README'ler ve demo sitesi hâlâ 0.2.x'in çıktısını
  gösteriyordu (`kaydırmalı`/`testere`); "furkan" tohumu 0.3.0'dan beri
  `sıra düzenli`/`baklava` veriyor.

- **Demo sitesi "Sekiz motif" diyordu**, altında 18 motif listeliyken.

- **Dışa aktarılan motif listeleri dondurulmamıştı.** `motifs.ts` içindeki
  yorum "listeler elle ve donmuş halde tutulur" diyordu ama `TUM_MOTIFLER` ve
  gramerin fiilen okuduğu `ZEMIN_ADAYLARI_V2` / `GOBEK_ADAYLARI_V2` /
  `BORDUR_ADAYLARI_V2` / `DOLGU_ADAYLARI_V2` dizileri `Object.freeze`
  içermiyordu — `PALETLER_V1`'in aksine. Sonuç: bu dizileri import eden bir
  tüketici `.push`/`.reverse`/`.sort` ile yanlışlıkla mutasyona uğratırsa,
  `doku()`'nun okuduğu GERÇEK referans bozuluyor ve o process'teki bütün
  kullanıcıların avatarı kalıcı olarak değişiyordu — "aynı seed her zaman aynı
  kilim" garantisi sessizce çöküyordu. Beş liste de artık dondurulmuş;
  `test/determinism.test.ts` bunu kilitliyor. **Görünür davranış değişikliği:**
  bu dizilerde `.push`/`.sort`/`.splice` çağıran bir tüketici artık sessizce
  başarılı olmak yerine `TypeError` alıyor. Tipleri zaten `readonly` olduğu
  için TypeScript bunu derlemede de reddediyordu; değişen yalnızca çalışma
  zamanının artık sessiz kalmaması.

- **`label` içindeki yasak XML karakterleri kaçıştan sonra da kalıyordu.**
  `xmlKacis` yalnızca `& < > "` karakterlerini kaçırıyordu; bir NUL baytı,
  başka bir C0 kontrol karakteri ya da eşleşmemiş (lone) bir surrogate
  `<title>` içine olduğu gibi sızıyor ve çıktı geçersiz XML oluyordu. Kaçış bu
  karakterleri "güvenli" yapmaz — sorun söz dizimi değil karakterin kendisi.
  Tarayıcılar `<img src="...svg">` üzerinden SVG'yi KATI XML olarak
  ayrıştırdığı için böyle bir avatar sessizce hiç render olmuyordu. Bu
  karakterler artık kaçıştan önce süzülüyor; geçerli surrogate çiftleri
  (emoji dahil) etkilenmiyor. `test/grammar.test.ts` içindeki "çıktı
  güvenliği" bloğu hem süzmeyi hem de kalan çıktının XML açısından geçerli
  kaldığını doğruluyor.

### Değişmedi

- `fnv1a` çıktısı, PRNG çekiliş sırası, paletler, profiller, üretilen SVG.
  `test/golden.test.ts` doğruluyor.

## [0.3.0] — 2026-09-08

**KIRICI:** yöre profilleri keskinleştirildi; bütün seed'lerin dokuması değişti.
Yöre seçimi ve paletler değişmedi.

### Neden

0.2.0 yöreleri *toplamda* ayırıyordu — 1000 tohumda hiçbir yöre çifti aynı
geometriyi vermiyordu. Ama **tek bir tohum için** ayrışma zayıftı: altı profilin
dördü varsayılan olarak "sıra düzenli" düzene düşüyordu. Ölçüldü: rastgele iki
yöre %69.5 oranında aynı düzeni, %31.7 oranında hem aynı düzeni hem aynı ana
motifi seçiyordu.

Bu, istatistiksel olarak savunulabilir ama pratikte yanlış: demo tek tohum
gösteriyor, kullanıcı da gördüğüne bakarak karar veriyor. "Uşak ile İznik aynı"
demek için haklı bir sebep vardı.

### Değişti

- **Düzen ağırlıkları keskinleştirildi.** Her yöre artık kendi baskın düzenine
  sahip: Konya göbekli (%55), Uşak kaydırmalı (%65), Sivas bantlı (%45),
  Yörük sıra düzenli + göbek, Milas sıra düzenli. İznik nötr kalıyor
- **İmza motif ağırlıkları güçlendirildi.** Ağırlıklar 11 aday arasında
  dağılırken sinyal sönüyordu; Yörük'te akrep ve saçbağı 8'e, Uşak'ta yıldız
  8'e, Milas'ta koçboynuzu 7'ye çıktı
- Ölçüm sonucu: aynı düzen **%69.5 → %50.7**, aynı düzen ve ana motif
  **%31.7 → %15.3**. İznik hariç bakıldığında %13.1

### Düzeltildi

- **Demo sitesindeki anatomi levhası yöreyi görmüyordu.** `anatomiCoz` doku
  çağrısını profilsiz yapıyordu; levha altında "usak" yazarken İznik'in
  dokumasını çiziyor, katman sınırlarını da yörenin bordür kalınlığından
  habersiz hesaplıyordu (Milas'ın bordürü 5 hücre, Yörük'ünki 2; ikisi de 3
  sanılıyordu). Yöre parametresi artık zorunlu — varsayılana düşmek tam olarak
  bu hatayı geri getirirdi
- Sitenin derleme zamanı katman denetimi artık 300 tohumu **altı yörenin
  hepsinde** tarıyor (1800 kontrol). Eskiden tek profil taranıyordu, yani
  Milas'ın kalın bordürünün zemini ezdiği bir durum fark edilmeden yayına
  çıkabilirdi

### Değişmeyen

Motif kütüphanesi, paletler, katman yığını, aday listeleri ve `rng` çekiliş
sırası aynı. Değişen yalnızca ağırlık sayıları — yani bu sürüm yeni bir yetenek
eklemiyor, var olan yeteneği görünür kılıyor.

## [0.2.1] — 2026-09-08

Yalnızca paket yüzeyi ve yayın hattı; üretilen SVG'de tek bir bayt değişmedi.
`test/golden.test.ts` tablosu dokunulmadan geçiyor — bu sürümün kırıcı bir yanı
olmadığının kanıtı da bu.

### Değişti

- README'lere npm sürümü, bağımlılık sayısı, CI durumu ve lisans rozetleri
  eklendi. README tarball'a dahil olduğu için npm sayfası da güncelleniyor;
  sürümün yayınlanma sebebi bu
- Yayın artık **trusted publishing (OIDC)** ile yapılıyor: depoda saklanan bir
  npm token'ı yok, GitHub her koşu için kısa ömürlü bir kimlik üretiyor
- `release.yml`: `setup-node`'un `registry-url` girdisi kaldırıldı (boş bir
  `_authToken` yazıp OIDC'yi engelliyordu), Node 22'ye ve npm 12'ye çıkıldı
  (trusted publishing npm 11.5.1+ istiyor)

### Not

Bu sürüm aynı zamanda otomatik yayın hattının ilk gerçek sınavı. 0.2.0 elle
yayınlanmıştı; hattı boş bir sürümle denemek, onu ilk kez içerik dolu bir
sürümde denemekten daha ucuz.

## [0.2.0] — 2026-09-08

**KIRICI:** yöre artık yalnızca renk paleti değil. Motif ağırlığını, düzen
dağılımını, yoğunluğu ve bordür genişliğini de belirliyor. Bu, mevcut bütün
seed'lerin dokumasını değiştirir. Yöre seçimi değişmez — 0.1.0'da Milas olan bir
seed 0.2.0'da da Milas kalır, sadece dokuduğu kilim farklıdır.

### Neden

0.1.0'da altı yörenin tamamı, aynı seed için bayt bayt aynı geometriyi
üretiyordu; değişen tek şey renkti. "Yöresel kilim" diyen bir kütüphane için bu
bir eksiklik değil, iddianın karşılanmamasıydı.

### Eklendi

- **Yöre profilleri** (`src/yore.ts`). Her yöre için düzen ağırlıkları, bordür
  kalınlığı çarpanı, yoğunluk eğilimi ve motif ağırlık tabloları. Kaynak
  dayanakları profillerin başındaki yorumlarda künyeleriyle duruyor
- **On yeni motif:** bereket, çengel, akrep, kurtağzı, sandık, muska, saçbağı,
  göbek, kırkbudak, tarak. Motif sayısı 8'den 18'e çıktı
- `YORE_PROFILLERI`, `NOTR_PROFIL`, `profilBul`, `bordurKalinlik` ve
  `YoreProfil` / `MotifAgirlik` tipleri dışa aktarıldı
- `ZEMIN_ADAYLARI_V2`, `GOBEK_ADAYLARI_V2`, `BORDUR_ADAYLARI_V2`,
  `DOLGU_ADAYLARI_V2` — üretimin okuduğu yeni aday listeleri
- `doku()` üçüncü bir `profil` argümanı alıyor; verilmezse nötr profil kullanılır
  (imza geriye dönük uyumlu)
- Altın test tablosu artık altı yöreyi de ayrı ayrı kilitliyor: bir profildeki
  değişiklik yalnızca o yöreyi kırıyor ve testte adıyla görünüyor
- `test/yore.test.ts` — 17 yeni test. Aralarında en değerlisi: ağırlık
  tablosundaki her motif kimliğinin gerçekten var olduğunu doğrulayan test.
  Yazım hatası sessizce hiçbir şey yapmaz, bu onu yakalar

### Değişti

- Motif seçimi `rng.pick` yerine `rng.weighted` kullanıyor. İkisi de TEK çekiliş
  harcadığı için aynı seed farklı yörelerde aynı karar dizisini yürüyor,
  yalnızca sonuçlar kayıyor
- Palet seçimi dokumanın önüne alındı (yöreyi bilmeden dokunamıyor). İki hash
  akışı bağımsız olduğu için bu, palet seçimini etkilemiyor
- `kurtağzı` yalnızca bordür slotunda. İlk tanımda zemin de vardı; kütüphanenin
  kendi kuralı bant motiflerinin zeminde tek başına kullanılmamasını söylüyor
- Bundle bütçesi 8 → 9 kB (React girişi 9 → 10 kB). Ölçüldü: 6.36 → 7.88 kB
  gzip. Artışın tamamı on motif ve altı profilden geliyor
- `_V1` aday listeleri yerinde duruyor ama artık üretimde kullanılmıyor; 0.1.0'ın
  donmuş sözleşmesi olarak kalıyorlar

### Kararlar

- **Profiller motif ELEMİYOR, ağırlıklandırıyor.** Taranan kaynakların hiçbiri
  bir motifi tek bir yöreye hasretmiyor; göz, koçboynuzu, elibelinde, yıldız
  hepsi pan-Anadolu. Bir yöreye "şu motifler yasak" demek kaynakların
  desteklemediği bir kesinlik iddiası olurdu. Her motif her yörede çıkabilir,
  sadece olasılığı kayar — bir test bunu doğruluyor
- **İznik nötr bırakıldı.** İznik'in bir kilim/düz dokuma geleneği arandı,
  bulunamadı; İznik adı yalnızca çini bağlamında geçiyor. Gerçek dağarcığı
  (rumi, hatayi, lale, karanfil) eğrisel ve bitkiseldir, kilimin basamaklı
  geometrisine tercüme olmaz. İznik'ten yalnızca pigment alınıyor. Bir test bu
  kararın sessizce bozulmasını engelliyor
- **En güçlü kaynaklı eşleme Uşak.** Türk Patent'in coğrafi işaret tescili
  (No. 152, 2012) "Yıldızlı Uşak"ı "sekiz kollu yıldızlarla küçük baklava
  biçimindeki madalyonların kaydırılmış eksenler üzerinde alternatif sıralanması"
  diye tanımlıyor — kütüphanenin yıldız + baklava motiflerinin ve kaydırmalı
  düzeninin birebir tarifi

### Bilinen sınırlar

- Yoğunluk ve bordür genişliği için nicel ölçüm veren kaynak bulunamadı; bu iki
  parametre nitel tariflerden türetilmiş tasarım yorumudur
- Milas'a özgü ayrı bir *kilim* (halı değil) şeması için güçlü akademik kaynak
  bulunamadı; profil halı ve Muğla yöresi düz dokuma verisinden çıkarıldı
- Yörük kilimlerinde bordür yapısına dair doğrudan kaynak yok; dar bordür bir
  çıkarımdır
- Motif anlamları kültürel yorumdur ve tek doğrusu yoktur; büyük kısmı Erbek'in
  kataloğuna ve onu izleyen literatüre dayanır

## [0.1.0] — 2026-09-04

İlk yayın.

### Eklendi

- `generateKilim(seed, opts)` — metinden deterministik Anadolu kilimi SVG'si
- Sekiz motif: göz, pıtrak, koçboynuzu, yıldız, elibelinde, su yolu, testere,
  baklava. Her birinin adı, İngilizcesi, anlamı ve yerleşim yetkisi var
- Dokuma grameri: saçak, selvedge, bordür, ince su, zemin katmanları; dört zemin
  düzeni; her zaman dikey ayna, asla yatay
- Altı yöresel palet: Konya, Milas, Sivas, Yörük, Uşak ve palet teması İznik.
  `opts.region` ile sabitlenebilir
- OKLCH tabanlı palet kısıt doğrulayıcısı — her palet her testte denetlenir
- Abraş: zemin renginin bant bant algısal kayması
- Üç detay kademesi; 24 pikselde ızgara seyreliyor
- `opts.label` ile erişilebilir ad; `false` ile `aria-hidden`
- `kilim-avatars/react` alt yolunda `<Kilim />` bileşeni ve `useKilim` hook'u. React
  isteğe bağlı peer bağımlılık; çekirdeği kullanan onu hiç çekmiyor
- Girdi doğrulaması: geçersiz seed, boş seed, bilinmeyen yöre ve hatalı `label`
  sessizce yanlış çalışmak yerine anlamlı hata verir
- Sıfır bağımlılık, ESM + CJS + tip tanımları, iki giriş noktası

### Kararlar

- Erişilebilir ad (`<title>`) İngilizce; Türkçe `name` alanı kültürel içerik
  olarak ayrı duruyor
- `style` değil `region`: React'ta `style` her zaman CSS demek
- Kaynak haritalar yayınlanmıyor — tarball'ın dörtte üçünü tutuyorlardı ve çıktı
  minify edilmediği için yığın izleri haritasız da okunabilir

### Bilinen sınırlar

- 24 pikselde benzersizlik oranı ~%85 (128 pikselde %100). Küçük ızgara fiziksel
  bir sınır: o boyutta okunabilirlik çeşitlilikten önce gelir
- 128 piksellik SVG çıktısı ~34 kB ham metin. Çok avatarlı listelerde `size: 64`
  kullan (~19 kB) veya çıktıyı bir `<symbol>` olarak tekrar kullan
