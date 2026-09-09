# Privacy · Gizlilik

*English below · Türkçesi aşağıda*

---

## English

### The package

`kilim-avatars` collects nothing. It makes no network request, writes no file,
sets no cookie and reads no storage. The seed you pass exists in memory for the
duration of the call and is never sent anywhere. There is no telemetry, and
there is no way to add one without a dependency, which the package does not
have.

**Choosing a seed is your decision and it matters.** Generation is
deterministic and the algorithm is public, so the pattern is a recomputable
identifier of whatever you put in. See *Choosing a seed* in the
[README](./README.md) before seeding with an email address.

### The demo site

<https://fefetugrul.github.io/kilim> is a fully static page. Measured in a
browser, with a seed typed into the field:

- no cookies — `document.cookie` stays empty
- no `localStorage`, no `sessionStorage`
- no third-party requests at all; the fonts are bundled with the site, there is
  no analytics, no embedded video and no external stylesheet

Whatever you type into the seed field is processed in your browser and is never
transmitted or stored.

Because nothing is stored on your device and nothing is sent anywhere, there is
no consent to ask for and the site shows no cookie banner. That is not an
oversight.

### Hosting

The site is hosted on GitHub Pages. GitHub states in its own documentation that
it logs visitor IP addresses for security purposes. We have no access to those
logs, cannot query or delete them, and they are governed by
[GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

### Contact

Open an issue: <https://github.com/FefeTugrul/kilim/issues>

---

## Türkçe

### Paket

`kilim-avatars` hiçbir şey toplamaz. Ağ isteği yapmaz, dosya yazmaz, çerez
koymaz, hiçbir depolamayı okumaz. Verdiğin tohum yalnızca çağrı süresince
bellekte durur ve hiçbir yere gönderilmez. Telemetri yoktur; eklemenin yolu da
yoktur, çünkü paketin hiç bağımlılığı yok.

**Tohumu seçmek senin kararın ve önemli.** Üretim deterministik, algoritma
açık; dolayısıyla desen, verdiğin girdinin yeniden hesaplanabilir bir
tanımlayıcısıdır. E-posta adresiyle tohumlamadan önce
[README](./README.tr.md) içindeki *Tohumu seçerken* bölümünü oku.

### Demo sitesi

<https://fefetugrul.github.io/kilim> tamamen statik bir sayfadır. Tarayıcıda,
alana bir tohum yazılarak ölçüldü:

- çerez yok — `document.cookie` boş kalıyor
- `localStorage` yok, `sessionStorage` yok
- hiçbir üçüncü taraf isteği yok; yazı tipleri sitenin kendisiyle geliyor,
  analitik yok, gömülü video yok, harici stil dosyası yok

Tohum alanına yazdığın şey tarayıcında işlenir; hiçbir yere gönderilmez ve
saklanmaz.

Cihazına hiçbir şey yazılmadığı ve hiçbir yere veri gönderilmediği için
alınacak bir rıza da yoktur; site bu yüzden çerez banner'ı göstermez. Bu bir
ihmal değil.

### Barındırma

Site GitHub Pages üzerinde barındırılıyor. GitHub, kendi dokümantasyonunda
güvenlik amacıyla ziyaretçi IP adreslerini kaydettiğini belirtiyor. Bu
kayıtlara erişimimiz yok, sorgulayamıyor ve silemiyoruz; kayıtlar
[GitHub'ın Gizlilik Bildirimi'ne](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)
tabidir.

### İletişim

Konu aç: <https://github.com/FefeTugrul/kilim/issues>
