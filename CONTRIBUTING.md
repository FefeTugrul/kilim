# Katkı

Teşekkürler. Bu dosya, projeye özel iki tuhaflığı açıklıyor — ikisini de
bilmeden gönderilen ilk PR testleri kırıyor.

## Çıktı değişikliği = kırıcı değişiklik

Bu paketin tek vaadi şudur: **aynı metin her zaman aynı SVG'yi verir.**
Kullanıcıların avatarı hiçbir yerde saklanmıyor, her seferinde yeniden
hesaplanıyor. Yani çıktıyı değiştiren her düzenleme, o paketi kullanan bütün
sitelerdeki bütün avatarları değiştirir.

`test/golden.test.ts` sabit seed'lerin SVG hash'lerini tutar. Bu test
kırıldığında bir hata bulmuş olmazsın — kırıcı bir değişiklik yapmış olursun.

Kırıldığında:

1. **Değişiklik istenmiyorsa** → geri al. Çoğu durumda doğru cevap budur.
2. **Bilinçliyse** → `npm run altin` ile tabloyu yenile ve PR açıklamasında
   neyin neden değiştiğini yaz. Sürüm etkisi major'dır.

Çıktıyı fark ettirmeden değiştiren tipik düzenlemeler:

- `doku()` içindeki `rng` çağrılarının **sırasını** değiştirmek
- `motifs.ts` veya `palette.ts` içindeki `*_V1` listelerine eleman eklemek ya da
  sırasını bozmak (bu yüzden donmuş ve elle tutuluyorlar)
- `src/kaymalar.ts` içindeki abraş dizilerini değiştirmek

Yeni bir karar eklemen gerekiyorsa **listenin sonuna** ekle: o zaman önceki
kararlar kaymaz, yalnızca yeni karar etki eder.

## Renk eklemek ölçüye tabidir

Yeni palet `src/oklch.ts` içindeki kısıtlardan geçmek zorunda: kroma aralığı,
yasak hue bölgesi, zeminle en az parlaklık farkı, motif renklerinin birbirine
yapışmaması. Bir test her paleti her çalıştırmada denetler.

Palet değiştirdikten sonra `npm run abras` çalıştır — abraş tonları derleme
zamanında hesaplanıp tabloya yazılıyor ve ayrı bir test tablonun formülle uyumunu
tutuyor.

## Geliştirme

```bash
npm install
npm test          # 105 test
npm run typecheck
npm run build     # ESM + CJS + .d.ts
npm run size      # gzip bütçe denetimi
npm run onizleme  # onizleme.html üretir, açıp çıktıya bak
```

Görsel bir değişiklik yaptıysan `npm run onizleme` çıktısını PR'a ekran görüntüsü
olarak ekle. Kilim, testlerin göremediği bir şeydir.
