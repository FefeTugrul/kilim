# kilim-avatars

Deterministic Anatolian kilim avatars from any string. Zero dependencies, pure SVG, SSR-safe.

[![npm](https://img.shields.io/npm/v/kilim-avatars?color=%23A8322A&labelColor=%232E2419)](https://www.npmjs.com/package/kilim-avatars)
[![dependencies](https://img.shields.io/badge/dependencies-0-%232C5580?labelColor=%232E2419)](https://www.npmjs.com/package/kilim-avatars?activeTab=dependencies)
[![CI](https://github.com/FefeTugrul/kilim/actions/workflows/ci.yml/badge.svg)](https://github.com/FefeTugrul/kilim/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/kilim-avatars?color=%235C6B3C&labelColor=%232E2419)](./LICENSE)

**[Live demo](https://fefetugrul.github.io/kilim)** · [Privacy](./PRIVACY.md) · [Security](./SECURITY.md) · **English** · [Türkçe](./README.tr.md)

```bash
npm install kilim-avatars
```

```ts
import { generateKilim } from "kilim-avatars";

const k = generateKilim("furkan");

k.svg; // '<svg …>' — self-contained, no external references
k.name; // 'Milas — koçboynuzu sıra düzenli iki tonlu, baklava bordürlü'
k.nameEn; // "Milas kilim — ram's horn in rows, two-tone, diamond border"
k.motifs; // ['koçboynuzu', 'baklava']
k.region; // 'milas' — the region is picked from the seed too
k.palette; // ['#EFE5D0', '#A8322A', '#C9922E', '#2E2419', '#2C5580']
```

The same input always produces the same output — in the browser, in Node, and
during server-side rendering. No `Math.random`, no `Date`, no locale.

Dropping it into an existing page takes one line:

```tsx
<img src={`data:image/svg+xml,${encodeURIComponent(generateKilim(user.id).svg)}`} />
```

You can pin the region when you want a particular palette:

```ts
generateKilim("furkan", { region: "sivas" }); // navy ground
```

## No database, no files, no requests

The most important thing this library does is what it does **not** do: it stores
nothing.

The usual avatar flow is: user uploads a photo → the file goes to disk or S3 →
it is served from a CDN → a database row holds the URL — and with it come
backups, moderation, resizing, and data-protection obligations.

`kilim` has none of that. The pattern is **computed** from the string, every time.

|  | Uploaded avatar | kilim |
| --- | --- | --- |
| Storage | File + database row | None |
| Network request | CDN fetch | None |
| Personal data | The uploaded photo is stored | Nothing is stored |
| Offline | Fails | Works |
| Deletion request | File + row + CDN cache | No separate avatar record to delete |

This is why determinism is the whole point: **the seed is the record.** As long
as you have the user id you can regenerate the pattern, so there is nothing to
keep. Using `Math.random` here would not be a stylistic choice — it would be a
bug, because generation *is* the storage.

## Where it fits

Computing an avatar instead of storing one is a good trade in one specific
situation: **you need a visual identity for every account, and most of them will
never upload a picture.** That describes more products than it sounds.

- **Dashboards, admin panels, user tables.** The avatar's job here is to make a
  row findable while you scan, not to show a face. Colour and pattern do that
  faster than a name does.
- **Comment threads, forums, changelogs, review queues.** Most people never set
  a photo, and the grey silhouette makes all of them look like the same person.
- **Chat and collaboration.** In a dense thread, "who said this" is answered by
  the shape in the margin before the name is read.
- **Non-human accounts.** Bots, service accounts, API keys, CI runners,
  webhooks, integrations. They will never have a photo and they still have to be
  told apart — and a kilim beats a coloured letter in a circle.
- **Seeded demo data, fixtures, screenshots.** `generateKilim("customer-1")`
  gives you a full, plausible user list without borrowing a real person's face
  or paying for stock photography.
- **Tests and visual snapshots.** The output is byte-stable, so the avatar never
  becomes the reason a snapshot test flakes.
- **Products under GDPR or KVKK.** No upload means no image to store, resize,
  moderate, back up, or delete when someone asks to be forgotten.
- **Offline-first and local-first apps.** Nothing is fetched, so the avatar is
  there before the network is.

In a product that *does* let people upload a photo, this is the layer
underneath: show the kilim until they choose otherwise. That is usually most of
your users, most of the time.

## Where it doesn't

- **When the avatar has to identify, not just distinguish.** Measured as of 0.3.0:
  roughly 3.9 million visually distinct weaves. At 1,000 users the chance that
  any two share a pattern is about 12%; at 5,000 it is near certain, with about
  three colliding pairs. That is fine for recognising a row at a glance and
  wrong for anything where two people must never look alike.
- **When users expect their own face.** A social product where the photo *is*
  the point should not replace it — use this as the fallback, not the answer.
- **When your interface is strictly monochrome or very minimal.** A flat-woven
  rug with five saturated dye colours is a strong visual voice. It will not
  quietly blend in, and it is not meant to.
- **At 32 px and below.** The border and the fringe are dropped by design at
  that size, because they turn to mush. What remains still reads as a pattern,
  but the layered structure is gone.
- **Under a hard circular crop.** The output is a rug: fringe at top and bottom,
  a border on all four sides. A circle mask cuts the corners and most of the
  fringe. Rounded corners work; a full circle throws away the part that makes it
  look woven.

## Why kilim

Every product with accounts has the same gap: the user who never uploads a
photo. The usual answers are thin. A grey silhouette makes everyone look like
the same person, initials are ugly and collide constantly, and Gravatar depends
on a third-party service.

Existing generators fill that gap with abstract shapes. Boring Avatars ships six
styles, DiceBear sixty-one; all of them sit on a modern/abstract axis and none
carry a cultural motif.

`kilim` weaves real Anatolian motifs — *göz*, *elibelinde*, *koçboynuzu* — each
with a documented meaning, and it names every result it produces.

Gravatar deserves a closer look, because it is the option most teams reach for
first. It resolves an avatar by having the visitor's browser request
`gravatar.com/avatar/<sha256 of the email>` — a request that hands the hash, the
visitor's IP address, and the referring page to a third party on every page view.
`kilim` makes no request at all: the pattern is computed where it is displayed.

## React

```bash
npm install kilim-avatars react
```

```tsx
import { Kilim } from "kilim-avatars/react";

<Kilim seed={user.id} size={40} rounded />;
```

React is an optional peer dependency and lives on its own subpath, so importing
`kilim` in a Node script, a worker, or Deno never pulls React in.

`<Kilim />` accepts everything an `<svg>` element accepts — `className`,
`style`, `onClick`, `id`, `ref`, `aria-*`, `data-*` — plus `seed`, `size`,
`region`, `label`, and the `rounded` shorthand.

There is also a hook when you need the result rather than the element:

```tsx
const { svg, name, palette } = useKilim(user.id, { size: 64 });
```

## API

```ts
generateKilim(seed: string, opts?: KilimOptions): KilimResult
```

| Option | Type | Default | Effect |
| --- | --- | --- | --- |
| `size` | `number` | `128` | Side length in px. Clamped to 8–2048; picks the level of detail |
| `region` | `KilimRegion` | from the seed | Pins the regional palette and profile. Unknown values throw |
| `label` | `string \| false` | `nameEn` | SVG `<title>`. `false` marks the SVG `aria-hidden` |

| Returned field | Type | What |
| --- | --- | --- |
| `svg` | `string` | Self-contained SVG markup |
| `name` | `string` | Turkish name, with motif names as they are woven |
| `nameEn` | `string` | English name — this is what goes in `<title>` |
| `motifs` | `string[]` | Turkish motif names used |
| `region` | `KilimRegion` | `'konya' \| 'milas' \| 'sivas' \| 'yoruk' \| 'usak' \| 'iznik'` |
| `palette` | `string[]` | The five hex values used (a fresh copy each call) |
| `layout` | `string` | Field layout |

Invalid input throws rather than guessing. An `undefined` seed, an empty string,
an unknown region — each of these would silently give a whole group of users the
same avatar, and nobody would notice.

### The same user gets the same kilim at every size

Palette, main motif, and layout do not depend on `size`. A user's 24 px avatar in
a comment list and their 128 px avatar on a profile page are the same kilim, only
drawn with more or less detail. Tests verify this over 1,000 seeds.

### Output size

The SVG is text, so there is no network request — but the cost lands in your HTML:

| `size` | SVG | gzipped over the wire |
| --- | --- | --- |
| 24 | 4–8 kB | 0.5–0.9 kB |
| 32 | 4–8 kB | 0.6–1.0 kB |
| 64 | 12–28 kB | 1.2–2.2 kB |
| 128 (default) | 20–43 kB | 1.7–3.2 kB |

Embedding as a data URI inflates it by roughly 55%. For avatar-heavy lists use
`size: 64`, or define the SVG once as a `<symbol>` and repeat it with `<use>`.

The generated SVG contains no `id` attributes, so any number of avatars can sit
inline on one page without colliding.

## Choosing a seed

Generation is deterministic and the algorithm is public. That is the point — and
it is also why the seed is a decision rather than a detail: **the pattern is a
recomputable identifier of whatever you put in.**

Seed with an email address, and anyone who guesses that address can render its
kilim offline and compare it with the one your page shows, confirming the
account exists without signing in. The same address also produces the same
kilim on every site that uses this library, which makes accounts linkable
across services.

**Use an opaque internal id — a UUID — as the seed.** It is stable, it is
already in your database, and it says nothing about the person.

If the seed has to come from an email, salt it with a per-application secret
first:

```ts
import { createHmac } from "node:crypto";

const seed = createHmac("sha256", process.env.AVATAR_SECRET)
  .update(user.email)
  .digest("hex");

generateKilim(seed);
```

The avatar stays stable for your users, and both the guessing and the
cross-site linkage stop working.

## Motifs

| Motif | English | Meaning | Allowed in |
| --- | --- | --- | --- |
| göz | evil eye | Protection from the evil eye | field, medallion |
| pıtrak | burr | Protection and abundance | field, filler |
| koçboynuzu | ram's horn | Strength and fertility | field, medallion |
| yıldız | eight-pointed star | Happiness and fertility | medallion, field |
| elibelinde | hands on hips | Femininity and motherhood | field only |
| su yolu | running water | Life and continuity | border only |
| testere | sawtooth | Protection | border only |
| baklava | diamond | Abundance | border only |
| bereket | fertility | Abundance; elibelinde joined to a ram's horn | field, medallion |
| çengel | hook | Holding fast and warding off the evil eye | field, filler |
| akrep | scorpion | Protection from harm | field only |
| kurtağzı | wolf's mouth | Keeping the flock and the home from danger | border only |
| sandık | chest | Dowry and savings; the bride's chest | field only |
| muska | amulet | Protection from evil | filler only |
| saçbağı | hair-tie | A wish for marriage and union | field only |
| göbek | medallion | The centre of the kilim; hearth and family | medallion only |
| kırkbudak | forty branches | Multiplication and abundance | field only |
| tarak | comb | Cleanliness and order; the bride's comb | border only |

Placement is not decoration. A figurative motif never enters the border and a
band motif never stands alone in the field — the generator enforces this and the
tests check it.

Meanings are **common readings, not settled fact.** Most of what circulates today
traces back to Güran Erbek's catalogue and the literature that followed it, and
the same shape is named differently from village to village. Treat the column
above as ethnographic convention, not as a dictionary.

## Structure of a woven kilim

Outside in: **fringe → selvedge → border → thin water → field.**

The field uses one of four layouts — rows, brick-laid, medallion, or banded — and
the whole thing is mirrored vertically. Never horizontally: a kilim has a top and
a bottom, and that single asymmetry is what separates it from wallpaper.

Where a repeating border does not divide evenly into an edge, it is **cut at the
corner** rather than squeezed to fit. A weaver does the same; that honest cut is
most of the difference between "an algorithm made this" and "someone wove this".

## Regions

Style names are not invented. `bauhaus` and `marble` are aesthetic whims;
`konya` and `milas` are documented weaving traditions.

A region is not just a colour scheme. It sets the **colour, the layout
distribution, the density, the border width, and the motif weights** — so the
same seed weaves a visibly different kilim in Konya and in Yörük.

| Region | Colour | Layout bias | Border | Density | Leading motifs |
| --- | --- | --- | --- | --- | --- |
| `konya` | Red ground, cream motifs, navy and gold | medallion | normal | medium | göbek, çengel, elibelinde, tarak |
| `milas` | Cream ground, mustard and navy | rows | **widest** | low | koçboynuzu, çengel, su yolu |
| `sivas` | Navy ground, light outline | rows, banded | thin | **highest** | bereket, kırkbudak, baklava, pıtrak |
| `yoruk` | Brown-black ground, earth tones | rows | **narrowest** | **lowest** | akrep, saçbağı, koçboynuzu, testere |
| `usak` | Grey-cream ground, olive and burgundy | **brick-laid** | wide | high | yıldız, baklava, sandık, muska |
| `iznik` | İznik pigments — cobalt, turquoise, coral | neutral | normal | medium | none assigned |

### Weights, not whitelists

No source consulted assigns a motif to a single region. The motifs göz,
koçboynuzu, elibelinde, and yıldız are pan-Anatolian; what separates one tradition from
another is which motif takes the central role, how dense the field is, and how
wide the border runs. So the profiles **weight** motifs rather than filtering
them: every motif can appear in every region, only the odds shift. A test proves
it — draw enough seeds and each region eventually weaves every field motif.

The strongest documented match is Uşak. The Turkish Patent geographical
indication (No. 152, 2012) defines the "Starred Uşak" type as *eight-pointed
stars alternating with small diamond medallions on staggered axes* — which is a
literal description of this library's `yıldız` and `baklava` motifs in the
brick-laid layout.

### İznik carries no motifs, on purpose

A kilim tradition for İznik was searched for and **not found**: the name appears
only in tile and ceramic scholarship. İznik's real vocabulary — rumi, hatayi,
tulip, carnation — is curved and floral, and does not translate into the stepped,
right-angled geometry of a flatweave. So İznik contributes pigment only and its
profile is deliberately neutral. Assigning it an invented motif set would have
broken the one thing this library actually promises.

### What the profiles are, and are not

The weights are a **design interpretation derived from sources, not a quotation.**
Density and border width in particular have no quantitative measurement in the
literature; they were inferred from qualitative descriptions. Milas is primarily
a knotted-carpet centre and no strong academic source for a distinct Milas
*kilim* scheme was found. No direct source describes border structure in Yörük
kilims. Each profile in [`src/yore.ts`](./src/yore.ts) carries its own sources
and its own limitations in the comment above it.

### Colours were measured, not eyeballed

Every palette fills five slots: ground, primary, secondary, outline, and accent.
None of them were picked by eye — each hex passes constraints defined in OKLCH
space:

| Rule | Value | Why |
| --- | --- | --- |
| Chroma range | 0.01 – 0.16 | Natural dye does not leave this range; above it reads digital |
| Forbidden hue | 280° – 330° | Madder and indigo have no purple or magenta |
| Lightness vs. ground | ≥ 0.18 | Below this the motif sinks into the ground |
| Motif vs. motif | ΔL ≥ 0.08 **or** ΔH ≥ 25° | Otherwise two motif colours merge in greyscale |
| Ground lightness | mid **and** muted forbidden | A ground at L 0.45–0.62 with chroma under 0.09 swallows the motif |
| Pure extremes | `#000000` / `#FFFFFF` forbidden | Dark is brown-black; light is undyed wool |

These rules live as code in `src/oklch.ts`, and a test checks every palette on
every run. Anyone adding a palette goes through the same gate — the point is to
turn colour choice from a matter of taste into a measurable decision.

Two of these rules were too strict when first written, and it was the rules that
had to change, not the palettes: a red-ground Konya kilim is real and beautiful
even at mid lightness, because what swallows a motif is not mid lightness but mid
lightness *and* low chroma.

### Abraş

In a real kilim the ground colour is not uniform: when the weaver opens a new
skein, the dye lot changes and the colour shifts slightly. This is called **abraş**.

The generator shifts ground lightness by ±1–3% in bands of 5–9 cells. It registers
below conscious awareness, and most of the handmade feel comes from it — a
perfectly flat ground reads synthetic.

The shifts are hand-picked sequences rather than random noise, because real abraş
starts somewhere and continues for a while; it does not jump from cell to cell. The
tones are computed at build time into a table (`npm run abras`), which keeps the
OKLCH conversion maths out of the shipped bundle entirely, and a test verifies
that the table still matches the formula.

## Levels of detail

A 38×33 grid turns to mush at 24 px, so the grid thins out with the requested size.

| Size | Grid | What is drawn |
| --- | --- | --- |
| ≤ 32 px | 15 × 13 | A single medallion inside a solid frame |
| 33–80 px | 29 × 25 | Border plus a small field |
| > 80 px | 38 × 33 | Full grammar, fringe included |

Measured uniqueness over 2,000 seeds: **85% at 24 px, 100% at 64 px and above.**
Variety is deliberately lower at the smallest size, because the small level no
longer draws its own layout — it derives one from the decision already made for
the large size. At 24 px legibility comes before variety, and identity across
sizes comes before both.

## Accessibility

The SVG carries a `<title>` whose text is the English name. If the username is
already next to the avatar, hide the pattern from screen readers:

```tsx
generateKilim(user.id, { label: false }); // marks the SVG aria-hidden
```

The Turkish `name` is cultural content and stays Turkish; the accessible name is
English because a screen-reader user reading it may be anywhere.

## Design notes

Motifs are written as ASCII grids, never as SVG `path` data. A kilim is bound to
the loom's grid, so the constraint is authentic — and it keeps the library small.

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

Cells are not square: `width : height ≈ 1 : 1.15`. Weft density stretches motifs
vertically in a real kilim, and square cells make the output read as wallpaper.
Grid dimensions compensate so the rendered result is exactly square, because an
avatar has to be.

## Stability

The output of `fnv1a` and the order of PRNG draws are part of the public
contract. Changing either changes every user's avatar, so both are treated as
breaking changes under semver.

`test/golden.test.ts` locks this down with SVG hashes for fixed seeds. When that
test fails, you have not found a bug — you have made a breaking change. If the
change is deliberate, ship a version bump and refresh the table:

```bash
npm run altin   # regenerates the table inside test/golden.test.ts
```

For the same reason the `*_ADAYLARI_V1` lists in `src/motifs.ts` are frozen. New
motifs can join `TUM_MOTIFLER`, but they do not reach production until they enter
the `_V2` lists of the next breaking release. See
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Development

```bash
npm install
npm test          # 168 tests: determinism, grammar, palette constraints, variety, safety
npm run typecheck
npm run build     # ESM + CJS + .d.ts, two entry points
npm run size      # gzip budget check (9 kB)
npm run onizleme  # writes onizleme.html — open it to see the output
npm run abras     # regenerate the abraş tone table (after changing a palette)
npm run altin     # refresh the golden hashes (after a deliberate breaking change)
```

## License

MIT © Furkan Efe Tuğrul

Motif names, meanings, and regional characteristics are documented from public
sources — among them *Arış* (Atatürk Kültür Merkezi), Güran Erbek's *Kilim
Catalogue No. 1*, the Turkish Patent geographical indication register and Koç
University's Josephine Powell collection. Full citations sit in the comments of
[`src/yore.ts`](./src/yore.ts).
