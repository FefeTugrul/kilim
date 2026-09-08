# kilim-avatars

Deterministic Anatolian kilim avatars from any string. Zero dependencies, pure SVG, SSR-safe.

[![npm](https://img.shields.io/npm/v/kilim-avatars?color=%23A8322A&labelColor=%232E2419)](https://www.npmjs.com/package/kilim-avatars)
[![dependencies](https://img.shields.io/badge/dependencies-0-%232C5580?labelColor=%232E2419)](https://www.npmjs.com/package/kilim-avatars?activeTab=dependencies)
[![CI](https://github.com/FefeTugrul/kilim/actions/workflows/ci.yml/badge.svg)](https://github.com/FefeTugrul/kilim/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/kilim-avatars?color=%235C6B3C&labelColor=%232E2419)](./LICENSE)

**[Live demo](https://fefetugrul.github.io/kilim)** · **English** · [Türkçe](./README.tr.md)

```bash
npm install kilim-avatars
```

```ts
import { generateKilim } from "kilim-avatars";

const k = generateKilim("furkan");

k.svg; // '<svg …>' — self-contained, no external references
k.name; // 'Milas — koçboynuzu kaydırmalı iki tonlu, testere bordürlü'
k.nameEn; // 'Milas kilim — ram's horn in brick-laid, two-tone, sawtooth border'
k.motifs; // ['koçboynuzu', 'testere']
k.region; // 'milas' — picked from the seed too
k.palette; // ['#EFE5D0', '#A8322A', '#C9922E', '#2E2419', '#2C5580']
```

The same input always produces the same output — in the browser, in Node, and
during server-side rendering. No `Math.random`, no `Date`, no locale.

## No database, no files, no requests

The most important thing this library does is what it does **not** do: it stores
nothing.

The usual avatar flow is: user uploads a photo → the file goes to disk or S3 →
it is served from a CDN → a database row holds the URL → and with it come
backups, moderation, resizing, and data-protection obligations.

`kilim` has none of that. The pattern is **computed** from the string, every time.

|  | Uploaded avatar | kilim |
| --- | --- | --- |
| Storage | File + database row | None |
| Network request | CDN fetch | None |
| Personal data | The uploaded photo is stored | Nothing is stored |
| Offline | Fails | Works |
| Deletion request | File + row + CDN cache | Nothing to delete |

This is why determinism is the whole point: **the seed is the record.** As long
as you have the user id you can regenerate the pattern, so there is nothing to
keep. Using `Math.random` here would not be a stylistic choice — it would be a
bug, because generation *is* the storage.

## Why kilim

Existing avatar generators draw abstract shapes. Boring Avatars ships six styles,
DiceBear sixty-one; all of them sit on a modern/abstract axis and none carry a
cultural motif.

`kilim` weaves real Anatolian motifs — *göz*, *elibelinde*, *koçboynuzu* — each
with a documented meaning, and it names every result it produces.

## React

```bash
npm install kilim-avatars react
```

```tsx
import { Kilim } from "kilim-avatars/react";

<Kilim seed={user.id} size={40} rounded />;
```

React is an optional peer dependency and lives on its own subpath, so importing
`kilim` in a Node script, a worker or Deno never pulls React in.

`<Kilim />` accepts everything an `<svg>` element accepts — `className`,
`style`, `onClick`, `id`, `ref`, `aria-*`, `data-*` — plus `seed`, `size`,
`region`, `label` and the `rounded` shorthand.

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
| `region` | `KilimRegion` | from the seed | Pins the regional palette. Unknown values throw |
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

Palette, main motif and layout do not depend on `size`. A user's 24 px avatar in
a comment list and their 128 px avatar on a profile page are the same kilim, only
drawn with more or less detail. Tests verify this over 1000 seeds.

### Output size

The SVG is text, so there is no network request — but the cost lands in your HTML:

| `size` | SVG | gzipped over the wire |
| --- | --- | --- |
| 32 | ~4 kB | ~0.7 kB |
| 64 | ~19 kB | ~1.8 kB |
| 128 (default) | ~20–39 kB | ~1.8–3.0 kB |

Embedding as a data URI inflates it by roughly 55%. For avatar-heavy lists use
`size: 64`, or define the SVG once as a `<symbol>` and repeat it with `<use>`.

The generated SVG contains no `id` attributes, so any number of avatars can sit
inline on one page without colliding.

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
| bereket | fertility | Abundance; read as elibelinde joined to a ram's horn | field, medallion |
| çengel | hook | Holding fast, and warding off the evil eye | field, filler |
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

The field uses one of four layouts — rows, brick-laid, medallion or banded — and
the whole thing is mirrored vertically. Never horizontally: a kilim has a top and
a bottom, and that single asymmetry is what separates it from wallpaper.

Where a repeating border does not divide evenly into an edge it is **cut at the
corner** rather than squeezed to fit. A weaver does the same; that honest cut is
most of the difference between "an algorithm made this" and "someone wove this".

## Regions

Style names are not invented. `bauhaus` and `marble` are aesthetic whims;
`konya` and `milas` are documented weaving traditions.

A region is not just a colour scheme. It sets the **colour, the layout
distribution, the density, the border width and the motif weights** — so the
same seed weaves a visibly different kilim in Konya and in Yörük.

| Region | Colour | Layout bias | Border | Density | Leading motifs |
| --- | --- | --- | --- | --- | --- |
| `konya` | Red ground, cream motifs, navy and gold | medallion | normal | medium | göbek, çengel, elibelinde, tarak |
| `milas` | Cream ground, mustard and navy | rows | **widest** | low | koçboynuzu, çengel, su yolu |
| `sivas` | Navy ground, light outline | rows, banded | thin | **highest** | bereket, kırkbudak, baklava, pıtrak |
| `yoruk` | Brown-black ground, earth tones | rows | **narrowest** | **lowest** | akrep, saçbağı, koçboynuzu, testere |
| `usak` | Grey-cream ground, olive and burgundy | **brick-laid** | wide | medium | yıldız, baklava, sandık, muska |
| `iznik` | İznik pigments — cobalt, turquoise, coral | neutral | normal | medium | none assigned |

### Weights, not whitelists

No source consulted assigns a motif to a single region. göz, koçboynuzu,
elibelinde and yıldız are pan-Anatolian; what separates one tradition from
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

Every hex passes constraints defined in OKLCH space, and a test checks every
palette on every run:

| Rule | Value | Why |
| --- | --- | --- |
| Chroma range | 0.01 – 0.16 | Natural dye does not leave this range; above it reads digital |
| Forbidden hue | 280° – 330° | Madder and indigo have no purple or magenta |
| Lightness vs. ground | ≥ 0.18 | Below this the motif sinks into the ground |
| Motif vs. motif | ΔL ≥ 0.08 **or** ΔH ≥ 25° | Otherwise two motif colours merge in greyscale |
| Pure extremes | `#000000` / `#FFFFFF` forbidden | Dark is brown-black; light is undyed wool |

Two of these rules were too strict when first written, and it was the rules that
had to change, not the palettes: a red-ground Konya kilim is real and beautiful
even at mid lightness, because what swallows a motif is not mid lightness but mid
lightness *and* low chroma.

### Abraş

In a real kilim the ground colour is not uniform: when the weaver opens a new
skein the dye lot changes and the colour shifts slightly. This is called **abraş**.

The generator shifts ground lightness by ±1–3% in bands of 5–9 cells. It is
perceived below awareness, and most of the handmade feel comes from it — a
perfectly flat ground reads synthetic.

The shifts are hand-picked sequences rather than random noise, because real abraş
starts somewhere and continues for a while; it does not jump cell to cell. The
tones are computed at build time into a table, which keeps the OKLCH conversion
maths out of the shipped bundle entirely.

## Levels of detail

A 38×33 grid turns to mush at 24 px, so the grid thins out with the requested size.

| Size | Grid | What is drawn |
| --- | --- | --- |
| ≤ 32 px | 15 × 13 | A single medallion inside a solid frame |
| 33–80 px | 29 × 25 | Border plus a small field |
| > 80 px | 38 × 33 | Full grammar, fringe included |

Measured uniqueness over 2000 seeds: **85% at 24 px, 100% at 64 px and above.**
Variety is deliberately lower at the smallest size — at 24 px legibility comes
before variety, and identity across sizes comes before both.

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
test fails you have not found a bug — you have made a breaking change. See
[CONTRIBUTING.md](./CONTRIBUTING.md).

## Development

```bash
npm install
npm test          # 135 tests
npm run typecheck
npm run build     # ESM + CJS + .d.ts, two entry points
npm run size      # gzip budget check
npm run onizleme  # writes onizleme.html — open it to see the output
npm run abras     # regenerate the abraş tone table (after changing a palette)
npm run altin     # refresh the golden hashes (after a deliberate breaking change)
```

## License

MIT © Furkan Efe Tuğrul

Motif names, meanings and regional characteristics are documented from public
sources — among them *Arış* (Atatürk Kültür Merkezi), Güran Erbek's *Kilim
Catalogue No. 1*, the Turkish Patent geographical indication register and Koç
University's Josephine Powell collection. Full citations sit in the comments of
[`src/yore.ts`](./src/yore.ts).
