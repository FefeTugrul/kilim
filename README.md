# kilim

Deterministic Anatolian kilim avatars from any string. Zero dependencies, pure SVG.

```ts
import { generateKilim } from "kilim";

const k = generateKilim("furkan");

k.svg; // '<svg …>' — self-contained, no external references
k.name; // 'koçboynuzu kaydırmalı, testere bordürlü'
k.motifs; // ['koçboynuzu', 'testere']
k.palette; // ['#EDE3CE', '#A8322A', '#C9922E', '#2B2620', '#1F3A5F']
```

The same input always produces the same output — in the browser, in Node, and
during server-side rendering. No `Math.random`, no `Date`, no locale.

> **Work in progress.** Phases 1 and 2 are done: the deterministic core and the
> weaving grammar. Regional palettes, the React component and the npm release
> are next.

## Why

Most avatar libraries generate abstract shapes. `kilim` weaves real Anatolian
motifs — *göz*, *elibelinde*, *koçboynuzu* — each carrying a documented meaning,
and names every result it produces.

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

Placement is not decorative. A figurative motif never enters the border, and a
band motif never stands alone in the field — the generator enforces this.

## Structure of a woven kilim

Outside in: **fringe → selvedge → border → thin water → field.**

The field is laid out in one of four ways — `tekrar` (rows), `kaydırmalı`
(brick), `göbek` (single medallion) or `bantlı` (alternating bands) — and the
whole thing is mirrored vertically. Never horizontally: a kilim has a top and a
bottom, and that single asymmetry is what separates it from wallpaper.

## Levels of detail

A 38×33 grid turns to mush at 24 px, so the grid thins out with the requested size.

| Size | Grid | What is drawn |
| --- | --- | --- |
| ≤ 32 px | 15 × 13 | Single medallion inside a solid frame |
| 33–80 px | 29 × 25 | Border plus a small field |
| > 80 px | 38 × 33 | Full grammar, fringe included |

## Development

```bash
npm install
npm test          # determinism and grammar suites
npm run typecheck
npm run build     # ESM + CJS + .d.ts
npm run size      # gzip budget check (8 kB)
npm run onizleme  # writes onizleme.html — open it to see the output
```

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

Cells are not square: `width : height = 1 : 1.15`. Weft density stretches motifs
vertically in a real kilim, and square cells make the output read as wallpaper.
Grid dimensions are chosen so the rendered result still comes out square, because
an avatar has to be.

Where a repeating border does not divide evenly into an edge, it is **cut at the
corner** rather than squeezed to fit. A weaver does the same; that honest cut is
most of the difference between "an algorithm made this" and "someone wove this".

## Stability

The output of `fnv1a` and the order of PRNG draws are part of the public
contract. Changing either changes every user's avatar, so both are treated as
breaking changes under semver.

## Roadmap

- [x] **Phase 1** — Core chain: FNV-1a hash, mulberry32 PRNG, cell grid, SVG emitter
- [x] **Phase 2** — Eight motifs and the weaving grammar
- [ ] **Phase 3** — Five regional palettes, perceptual colour constraints, *abraş*
- [ ] **Phase 4** — React component, npm release
- [ ] **Phase 5** — Demo site and documentation

## License

MIT © Furkan Efe Tuğrul

Motif names and meanings are documented from public sources; a full reference
list ships with the demo site in Phase 5.
