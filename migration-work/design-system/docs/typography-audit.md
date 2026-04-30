# Typography Audit — zonnic.ca

> **Evidence base:** `./migration-work/design-extract/zonnic-ca-design-language.md` (full type scale with usage counts), `./migration-work/design-extract/zonnic-ca-design-tokens.json` (font-family primitives).
> **Method:** inventory → validate weights against font file reality → consolidate into a clean scale → assign roles.

## Raw Inputs

### Font families (5 declared)

| Family | Elements | Role observed | Decision |
|---|---:|---|---|
| `Santral` | 10 218 | All text (headings + body + UI) | **Keep** as primary; verify licensing + self-host WOFF2 |
| `Arial` | 440 | Body (legacy fallback) | **Drop** — collapse into fallback stack |
| `Times` | 298 | Body (likely OneTrust consent text rendering in default serif) | **Drop** — third-party leak |
| `Font Awesome 5 Free` | 22 | Icon glyphs | **Drop** — replace with inline SVGs in `icons/` |
| `sans-serif` | 8 | Raw fallback | **Merge** into fallback stack |

### Type sizes (15 distinct values)

| Size (px) | Usage role (from design-language.md) | Weight | LH | Decision |
|----------:|---|---:|---|---|
| 42 | h1 (hero) | 800 | 46 | **Keep** → `--font-size-xxl` (display-1) |
| 34 | h1 (secondary variant), h2 | 800 | 40 | **Drop** — collapse into 32 (within 2px) |
| 32 | h2, centered headings | 800 | 40 | **Keep** → `--font-size-xl` (H2) |
| 30 | icons only (svg use) | 300 | 25 | **Drop** — icon sizing, not typography |
| 24 | div/span content blocks | 400 | normal | **Keep** → `--font-size-lg` (H3) |
| 22 | h2 small / h3 | 800 | 26 | **Drop** — collapse into 20 (within 2px) |
| 20 | h4, bat-headline-default | 700 | 28 | **Keep** → `--font-size-md` (H4 / lead body) |
| 18 | p emphasis, span | 600 | 25 | **Keep** → `--font-size-body-lg` (body-large) |
| 16 | body default, html/meta | 400 | normal | **Keep** → `--font-size-base` (body) |
| 15 | a, p secondary | 400 | 15 | **Drop** — merge into 16 (within 1px) |
| 14.4 | button labels | 400 | 38 | **Drop** — rounding artefact (14.4 = 0.9rem on 16 base), snap to 14 |
| 14 | small p, legal, b | 300 | 20 | **Keep** → `--font-size-sm` (caption, meta, legal) |
| 13.6 | button/nav caption | 400 | 27.2 | **Drop** — rounding artefact (0.85rem), snap to 14 |
| 13.333 | button i/svg | 400 | normal | **Drop** — browser-computed `0.8333rem`, snap to 12 |
| 13.008 | div inside buttons | 400 | 19.512 | **Drop** — rounding artefact, snap to 12 |
| 12 | (implied, rare) | — | — | **Keep** → `--font-size-xs` (micro / legal) |

### Font weights (8 observed)

Raw count from `design-language.md`:

| Weight | Count | Role |
|-------:|------:|---|
| 300 | 6 733 | Light body, link text, nav (dominant) |
| 400 | 2 221 | Regular body, meta |
| 700 | 1 463 | Semibold — H4, strong |
| 800 | 384 | Bold — H1/H2 |
| 600 | 133 | Medium — 18px body-emphasis (single role) |
| 500 | 38 | Rarely used — labels, buttons? |
| 900 | 8 | Black — likely unintentional (font-synthesis) |
| 100 | 6 | Thin — likely unintentional (font-synthesis) |

## Font-file validation (Santral)

**Critical finding.** Source CSS declares 8 weights, but Santral is a proprietary foundry font (Ndiscovered at typetype.org, weight range 100–900). Without the actual WOFF2 files in-repo, weight availability is unverified. Design-language counts show:

- Weight `300` dominates (6 733 uses) — yet on a Sans-display-family typeface, 300 is usually too thin for body reading at 16px on white and commonly feels washed out. This may be **the intended "regular" body weight** at the designer's intent (Santral 300 is a usable light regular).
- Weight `400` may be rendered by the browser as the fallback (Arial) since no Santral 400 file is loaded.
- Weights `100` and `900` have 6 and 8 hits respectively — almost certainly **browser-synthesized faux weights** (the browser interpolates when no matching file exists).

**Assumption for normalization (must be verified by design reviewer).**
If Santral files shipped with the source site are limited to weights `300`, `700`, and `800`, the target system uses those three. Otherwise, we adopt a more conventional system (`400`, `700`) with Santral 300 demoted to an optional light display role.

**Recommended target weight set:** `400` (regular body), `700` (semibold — H3/H4/strong), `800` (bold — H1/H2). Drop 100, 300, 500, 600, 900 from the system. Weight 500 and 600 one-off usages migrate to `700`.

**Open action (log in normalization-log.md as DS-02):** verify which Santral weight files the client provides; re-declare token weights accordingly.

### Line-height & letter-spacing

Declared on headings (px values, non-relative):

| Size | Declared LH | Target unitless LH |
|-----:|------------:|-------------------:|
| 42 | 46 | 1.1 |
| 32 | 40 | 1.25 |
| 24 | — | 1.33 |
| 20 | 28 | 1.4 |
| 18 | 25 | 1.4 |
| 16 | `normal` | 1.5 |
| 14 | 20 | 1.45 |
| 12 | — | 1.5 |

Letter-spacing: `0.5px` on h2 at 22px (dropped), `0.144px` on buttons (rounding artefact). All other content uses `normal`. **Decision:** no letter-spacing tokens at the primitive level; buttons define their own `0.02em` if needed.

## Target Typography Tokens

### Font stacks

```css
--font-family-primary: 'Santral', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
```

Only primary is needed; secondary collapses into system fallback.

### Scale (7 steps)

| Token | Size (px) | Rem (base 16) |
|---|---:|---:|
| `--font-size-xs` | 12 | 0.75 |
| `--font-size-sm` | 14 | 0.875 |
| `--font-size-base` | 16 | 1.0 |
| `--font-size-body-lg` | 18 | 1.125 |
| `--font-size-md` | 20 | 1.25 |
| `--font-size-lg` | 24 | 1.5 |
| `--font-size-xl` | 32 | 2.0 |
| `--font-size-xxl` | 42 | 2.625 |

**Rejected sizes:** 34 (→ 32), 30 (icon only), 22 (→ 20), 15 (→ 16), 14.4 / 13.6 / 13.333 / 13.008 (rounding artefacts → 14 or 12).

### Weights

```css
--font-weight-regular: 400;
--font-weight-semibold: 700;
--font-weight-bold: 800;
```

### Line-heights

```css
--line-height-tight: 1.1;    /* display, H1 */
--line-height-snug:  1.25;   /* H2 */
--line-height-normal: 1.4;   /* H3–H5, body-lg */
--line-height-relaxed: 1.5;  /* body, meta */
```

### Letter-spacing (single token, rarely used)

```css
--letter-spacing-tight: -0.01em;  /* display only */
--letter-spacing-normal: 0;       /* default for everything */
```

## Role Assignments

| Semantic role | Size token | Weight | LH | Use |
|---|---|---|---|---|
| Display (hero H1) | `--font-size-xxl` (42) | bold (800) | tight (1.1) | Hero headlines |
| H1 | `--font-size-xl` (32) | bold (800) | snug (1.25) | Page titles |
| H2 | `--font-size-lg` (24) | bold (800) | snug (1.25) | Section titles |
| H3 | `--font-size-md` (20) | semibold (700) | normal (1.4) | Subsection titles |
| H4 | `--font-size-body-lg` (18) | semibold (700) | normal (1.4) | Micro-headings |
| Body-lg | `--font-size-body-lg` (18) | regular (400) | normal (1.4) | Lead paragraphs |
| Body | `--font-size-base` (16) | regular (400) | relaxed (1.5) | Default paragraph |
| Caption / meta | `--font-size-sm` (14) | regular (400) | relaxed (1.5) | Dates, bylines, helper |
| Legal / micro | `--font-size-xs` (12) | regular (400) | relaxed (1.5) | Legal disclaimer |
| Button label | `--font-size-sm` (14) | semibold (700) | tight (1.1) | CTA |

## Rejected / Consolidated

| Raw size | Decision | Rationale |
|---:|---|---|
| 34 | → 32 | Within 2px, same role (H1 variant); overlap |
| 30 | drop | SVG/icon sizing, not typography |
| 22 | → 20 | Within 2px, same role (H3); overlap |
| 15 | → 16 | Within 1px, same role; rounding noise |
| 14.4, 13.6, 13.333, 13.008 | → 14 or 12 | Browser-computed rem conversions; not authored intent |

| Raw weight | Decision | Rationale |
|---:|---|---|
| 100 | drop | 6 uses; font-synthesis artefact |
| 300 | drop | Dominant in raw but suspected synthesis; confirm DS-02 |
| 500 | → 700 | 38 uses; treat as H3/H4 |
| 600 | → 700 | 133 uses; treat as H4 |
| 900 | drop | 8 uses; synthesis artefact |

## Open Actions

- **DS-02**: verify Santral weight files. If only `400/700/800` ship, lock to that. If `300` ships, consider adding `--font-weight-light: 300` as an optional token with usage guidelines (avoid for body < 18px).
- **DS-03**: self-host Santral WOFF2 files from client-provided assets; add `font-display: swap` + implement aem.live font-fallback technique.
- **DS-04**: remove Font Awesome entirely; audit `icons/` directory and replace every remaining FA glyph with an inline SVG.
