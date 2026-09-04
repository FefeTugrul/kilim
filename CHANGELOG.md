# Değişiklik günlüğü

Bu paket [Semantic Versioning](https://semver.org/lang/tr/) izler.

**Özel kural:** üretilen SVG'nin kendisi kamuya açık API'nin parçasıdır. Aynı
girdinin farklı çıktı vermesi bir iyileştirme değil, **kırıcı değişikliktir** —
çünkü herkesin avatarı değişir. `test/golden.test.ts` bunu kilitler.

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
- `kilim/react` alt yolunda `<Kilim />` bileşeni ve `useKilim` hook'u. React
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
