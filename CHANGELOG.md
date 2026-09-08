# Değişiklik günlüğü

Bu paket [Semantic Versioning](https://semver.org/lang/tr/) izler.

**Özel kural:** üretilen SVG'nin kendisi kamuya açık API'nin parçasıdır. Aynı
girdinin farklı çıktı vermesi bir iyileştirme değil, **kırıcı değişikliktir** —
çünkü herkesin avatarı değişir. `test/golden.test.ts` bunu kilitler.

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
