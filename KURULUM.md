# Kurulum — PowerShell (Windows)

Bu dosya sadece senin için. Baştan sona sırayla izle; her adımın ne işe yaradığı
altında yazıyor. (Projeyi yayınlarken bu dosyayı silebilirsin — README zaten
İngilizce ve dış dünyaya bakıyor.)

---

## 0. Ön kontrol

PowerShell aç ve üçünün de sürüm verdiğini gör:

```powershell
node -v
npm -v
git --version
```

`node` veya `npm` tanınmıyorsa: <https://nodejs.org> adresinden LTS sürümünü kur,
sonra **PowerShell'i kapatıp yeniden aç** (PATH ancak yeni pencerede güncellenir).

Node sürümü 18 veya üstü olmalı.

---

## 1. Script çalıştırma iznini aç

Windows'ta PowerShell varsayılan olarak `npm.ps1` gibi betikleri çalıştırmayı
engeller. `npm install` derken şuna benzer bir hata alırsan sebebi budur:

> npm.ps1 cannot be loaded because running scripts is disabled on this system

Tek seferlik çözüm — sadece kendi kullanıcın için, yönetici gerekmez:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Onay sorarsa `Y` yaz. Kontrol:

```powershell
Get-ExecutionPolicy -Scope CurrentUser   # RemoteSigned yazmalı
```

---

## 2. Türkçe karakter kodlaması

Windows PowerShell 5.1'de Türkçe karakterler bozuk görünebilir (`ğ` yerine `ð`
gibi). Commit mesajlarında sorun çıkarmaması için, **her yeni PowerShell
penceresinde** şunu çalıştır:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

Her seferinde yazmak istemiyorsan profiline kalıcı ekle:

```powershell
if (-not (Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }
Add-Content $PROFILE '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8'
Add-Content $PROFILE '$OutputEncoding = [System.Text.Encoding]::UTF8'
```

Git'in de UTF-8 kullanmasını garantiye al (tek seferlik):

```powershell
git config --global i18n.commitEncoding utf-8
git config --global i18n.logOutputEncoding utf-8
git config --global core.quotepath false
```

---

## 3. Projeyi yerleştir

Zip'i indirdiğin yerden çıkar. Aşağıdaki komut `C:\Users\<sen>\kilim` klasörünü
oluşturur:

```powershell
Expand-Archive -Path "$HOME\Downloads\kilim.zip" -DestinationPath "$HOME" -Force
cd "$HOME\kilim"
```

Zip başka bir klasördeyse `-Path` kısmını ona göre değiştir. Doğru yerde
olduğunu kontrol et:

```powershell
Get-ChildItem
```

`src`, `test`, `package.json`, `README.md` görünmeli.

---

## 4. Kur ve çalıştığını gör

```powershell
npm install
npm test
```

**15 testin de geçmesi gerekiyor.** Geçmiyorsa dur ve bana yaz.

Sonra kalan üç kontrol:

```powershell
npm run typecheck   # tip hatası var mı
npm run build       # dist klasörünü üretir (ESM + CJS + tip tanımları)
npm run size        # gzip boyutunu ölçer, 4 kB bütçeyi denetler
```

`npm run size` çıktısı yaklaşık **1.56 kB** olmalı.

---

## 5. Çıktıyı gözle gör

```powershell
npm run onizleme
Invoke-Item .\onizleme.html
```

Tarayıcıda altı kutu açılır. Her biri bir metinden üretildi ve altında
"iki çağrı aynı ✓" yazıyor — projenin tüm meselesi bu.

Kendi metinlerini denemek istersen:

```powershell
node scripts\onizleme.mjs "furkan" "ahmet" "zeynep@mail.com"
Invoke-Item .\onizleme.html
```

Henüz kilim değil, renkli kareler. Motifler Faz 2'de geliyor.

---

## 6. GitHub'a bağla

GitHub'da **boş** bir repo aç: `FefeTugrul/kilim`.

> Açarken **README, .gitignore ve lisans ekleme.** Üçü de pakette zaten var;
> eklersen push sırasında çakışma çıkar.

Sonra klasörün içinde:

```powershell
git remote add origin https://github.com/FefeTugrul/kilim.git
git push -u origin main
```

İlk push'ta bir tarayıcı penceresi açılıp GitHub girişi isteyecek (Git Credential
Manager). Giriş yap, bir daha sormaz.

Git geçmişi zaten kurulu — ilk commit atılmış durumda:

```powershell
git log --oneline
```

---

## 7. Her fazın sonunda

```powershell
npm test
npm run build
npm run size

git add -A
git commit -m "Faz 2: motifler ve dokuma grameri"
git push
```

Commit mesajında Türkçe karakter kullanacaksan 2. adımdaki kodlama ayarının
yapılmış olduğundan emin ol.

---

## 8. npm'e yayın (Faz 4'te)

Tek seferlik ayar:

1. <https://npmjs.com> hesabına gir → Access Tokens → **Generate New Token** →
   tipi **Automation** olsun.
2. GitHub'da repo → **Settings** → Secrets and variables → **Actions** →
   **New repository secret**. Adı tam olarak `NPM_TOKEN`, değeri az önceki token.

Sonrası her sürümde iki satır:

```powershell
npm version 1.0.0
git push --follow-tags
```

Tag push edilince GitHub Actions testleri çalıştırır, derler, boyutu ölçer ve
paketi otomatik yayınlar. Elle `npm publish` yazmana gerek yok.

---

## Sık karşılaşılan hatalar

| Hata | Sebep ve çözüm |
|---|---|
| `npm.ps1 cannot be loaded ... scripts is disabled` | 1. adımdaki `Set-ExecutionPolicy` komutunu çalıştır |
| `node : The term 'node' is not recognized` | Node kurulu değil ya da PowerShell'i kurulumdan sonra yeniden açmadın |
| Türkçe harfler `ð`, `þ` gibi görünüyor | 2. adımdaki kodlama satırlarını çalıştır |
| `failed to push some refs` | GitHub'da repo açarken README/lisans eklemişsin. Çözüm: `git pull --rebase origin main` sonra tekrar `git push` |
| `remote origin already exists` | Daha önce eklemişsin. `git remote set-url origin https://github.com/FefeTugrul/kilim.git` |
| `npm ERR! code ENOENT ... package.json` | Yanlış klasördesin. `cd "$HOME\kilim"` |

---

## Şu an nerede duruyoruz

- [x] **Faz 1** — Çekirdek: hash, PRNG, ızgara, SVG çıkışı
- [ ] **Faz 2** — Altı motif ve dokuma grameri
- [ ] **Faz 3** — Beş yöresel palet, renk kısıtları, abraş
- [ ] **Faz 4** — React bileşeni, LOD, npm yayını
- [ ] **Faz 5** — Demo sitesi ve dokümantasyon
