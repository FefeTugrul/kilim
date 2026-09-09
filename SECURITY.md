# Security

## Reporting

Report a vulnerability through
[GitHub's private advisory form](https://github.com/FefeTugrul/kilim/security/advisories/new).
Please do not open a public issue for something exploitable.

There is no bounty. Expect a first reply within a week.

## What this package can and cannot do

`kilim-avatars` has **no dependencies**, makes **no network request**, reads
**no environment**, touches **no filesystem**, and uses no `eval`. It is a pure
function from a string to an SVG string. That removes most of the surface a
library normally has — but not all of it, so the two real concerns are written
down here.

### Untrusted input reaching the SVG

Two values from the caller are written into the SVG: `opts.label` and the
palette hex codes.

Both are escaped at the boundary in `src/grid.ts`:

- `xmlKacis()` escapes `&`, `<`, `>` and `"` before the label is written into
  `<title>`.
- `renkGuvenli()` matches every colour against `/^#[0-9A-Fa-f]{6}$/` and falls
  back to `#000000` when it does not match.

This means `label={user.name}` is safe even when the name is attacker-supplied.
The tests cover it, and **the escaping must not be removed without replacing
it** — the SVG is usually inserted with `dangerouslySetInnerHTML` or an
equivalent, so a hole here is a stored XSS in the consumer's application.

### The pattern is a public function of the seed

The algorithm is deterministic, open source, and takes no secret. Anyone can
compute the kilim for any string offline.

That is the library's whole design, but it has a consequence worth stating:
**the avatar is a recomputable identifier of the seed.** If you seed with an
email address, someone who guesses that address can render its kilim and
compare it with the one your page shows — confirming the account exists without
signing in. The same seed also produces the same avatar on every site using
this library, which makes accounts linkable across services.

This is not a bug to be fixed; it is what determinism means. The mitigation is
on the calling side and is documented under **Choosing a seed** in the README:
use an opaque internal id, or salt the email with an application secret before
passing it in.

## Supported versions

The latest minor release. This is a small project; older lines are not
backported.
