# Değişiklik günlüğü

Bu paket [Semantic Versioning](https://semver.org/lang/tr/) izler.

**Özel kural:** üretilen SVG'nin kendisi kamuya açık API'nin parçasıdır. Aynı
girdinin farklı çıktı vermesi bir iyileştirme değil, **kırıcı değişikliktir** —
çünkü herkesin avatarı değişir. `test/golden.test.ts` bunu kilitler.

## [Yayınlanmamış]

İlk yayın hazırlığı. Aşağıdakiler `0.1.0` ile çıkacak.

### Eklendi

- `generateKilim(seed, opts)` — metinden deterministik Anadolu kilimi SVG'si
- Sekiz motif: göz, pıtrak, koçboynuzu, yıldız, elibelinde, su yolu, testere,
  baklava. Her birinin adı, İngilizcesi, anlamı ve yerleşim yetkisi var
- Dokuma grameri: saçak, selvedge, bordür, ince su, zemin katmanları; dört zemin
  düzeni; her zaman dikey ayna, asla yatay
- Altı yöresel palet: Konya, Milas, Sivas, Yörük, Uşak ve palet teması İznik.
  `opts.style` ile sabitlenebilir
- OKLCH tabanlı palet kısıt doğrulayıcısı — her palet her testte denetlenir
- Abraş: zemin renginin bant bant algısal kayması
- Üç detay kademesi; 24 pikselde ızgara seyreliyor
- `opts.label` ile erişilebilir ad; `false` ile `aria-hidden`
- Sıfır bağımlılık, ESM + CJS + tip tanımları

### Bilinen sınırlar

- 24 pikselde benzersizlik oranı ~%85 (128 pikselde %100). Küçük ızgara fiziksel
  bir sınır: o boyutta okunabilirlik çeşitlilikten önce gelir
- 128 piksellik SVG çıktısı ~34 kB ham metin. Çok avatarlı listelerde `size: 64`
  kullan (~19 kB) veya çıktıyı bir `<symbol>` olarak tekrar kullan
