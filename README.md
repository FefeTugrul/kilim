# kilim

Deterministic Anatolian kilim avatars from any string. Zero dependencies, pure SVG.

> **Work in progress.** The core seed → hash → PRNG → grid → SVG chain is in place.
> Motifs, weaving grammar, and regional palettes are next.

```ts
import { debugGrid } from "kilim";

debugGrid("furkan"); // -> '<svg ...>'
```

The same input always produces the same output — in the browser, in Node, and
during server-side rendering. No `Math.random`, no `Date`, no locale.

## Why

Most avatar libraries generate abstract shapes. `kilim` weaves real Anatolian
motifs — *göz*, *elibelinde*, *koçboynuzu* — each carrying a documented meaning,
and names every result it produces.

## Roadmap

- [x] **Phase 1** — Core chain: FNV-1a hash, mulberry32 PRNG, cell grid, SVG emitter
- [ ] **Phase 2** — Six motifs and the weaving grammar (border, field, symmetry)
- [ ] **Phase 3** — Five regional palettes, perceptual colour constraints, *abraş*
- [ ] **Phase 4** — React component, LOD, npm release
- [ ] **Phase 5** — Demo site and documentation

## Development

```bash
npm install
npm test          # determinism suite
npm run typecheck
npm run build     # ESM + CJS + .d.ts
npm run size      # gzip budget check (4 kB)
```

## Design notes

Motifs are written as ASCII grids, never as SVG `path` data. A kilim is bound to
the loom's grid, so the constraint is authentic — and it keeps the whole library
under the size budget.

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

## Stability

The output of `fnv1a` and the draw order of PRNG calls are part of the public
contract. Changing either changes every user's avatar, so both are treated as
breaking changes under semver.

## License

MIT © Furkan Efe Tuğrul

Motif names and meanings are documented from public sources; see the demo site's
references section (Phase 5).

