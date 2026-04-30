# Design System Assessment

> **Scope note.** This file catalogues what designlang extracted and quantifies the work needed to **normalize** it. It does not prescribe target values. Normalization is the responsibility of the `migration-design-system` skill, which runs an evidence-based audit against the raw outputs.

Every claim below carries a confidence level from [`./migration-work/verification/report.md`](../verification/report.md):

- **HIGH** → stated plainly
- **MEDIUM** → qualified with "based on the homepage sample..."
- **LOW** → flagged as an open question

## Overall confidence: **LOW**

Per the verification report, bypass leaked OneTrust and Salesforce chat fingerprints into designlang's extraction, and the anatomy.tsx surfaced only 2 organisms (Card, Button) despite 28 observed in the DOM. Token values themselves (HIGH confidence, corroborated) are reliable; component counts (LOW confidence) are not.

## Per-dimension scores

| Dimension | Score | Gap | Normalization effort |
|---|---:|---|---|
| Color Discipline | 80 | 27 distinct colors, only 3 named brand slots. Neutrals over-scale (14 values including 3 near-duplicates 127/128/136 grey). | **Medium** — cluster into ~12 primitives, define ~8 semantic tokens |
| Typography Consistency | **35** | 5 font families, 8 weights, 15+ one-off sizes (`13.008px`, `14.4px`, `12.992px`). | **Large** — define 2-family stack (heading Santral + body Santral), 3 weights (400/700/800), 7-step scale |
| Spacing System | 85 | Base 2 px detected but scale has non-aligned values (55, 95, 102, 123, 203, 207, 213). | **Small** — snap to 8 px grid: 8/16/24/32/48/64/96/128/... (loses 3 one-off values) |
| Elevation | 78 | 10 shadows; 5 labelled `md` with just color/alpha tweaks. | **Small** — merge to 3 levels (sm/md/lg) |
| Border Radii | 90 | 7 values; two `full` (50/100 px) and two `xl` (17/20 px) overlap. | **XS** — merge overlapping; keep 4 (xs 2 px, md 8 px, lg 14 px, full 100 px) |
| Accessibility (tokens) | 88 | 1 failing pair (black on navy, 4 button instances). | **XS** — swap foreground to white |
| Tokenization | 75 | Source exposes only 5 CSS vars (`--text-color`, `--bg-color`, `--border-color`, two Mapbox-specific). | **Medium** — write full `:root` token set (40+ vars) in EDS `styles.css` |
| CSS Health | **35** | 179 `!important` + 92% unused CSS + 11,611 duplicate declarations. Consequence of `bat-*` Shadow DOM leak + legacy ADA overrides. | **N/A** — EDS migration discards all source CSS; grade becomes ≥ 95 by default |

## Issues flagged for migration-design-system

These are open decisions that the DS skill will resolve through its audit-first methodology. Each must be validated against designlang evidence + stakeholder input.

### 1. Color palette normalization (MEDIUM confidence — leak-affected)
- 27 distinct colors in use; 14 are "neutrals" that probably cluster into 6 tones + 3 brand + 2 status
- Gradient `linear-gradient(#9D9FA1 50%, #89D0C8)` appears once; classify as one-off or promote to token
- Consent banner (OneTrust) leaked into the token dump → verify the 4–6 least-used colors are not OneTrust UI chrome before promoting them to the palette

### 2. Typography normalization (HIGH confidence — major work)
- Santral is custom; hosting, licensing, and fallback metrics must be confirmed
- Multiple weights for same role (h1 at weight 800, h2 at both 800 and 400) suggest inconsistent authoring
- 18 px size (600 weight) used only on 1 `<p>` → likely legitimate body-large; otherwise drop
- 13.008 px, 14.4 px, 12.8 px, 12.992 px → all rounding artefacts from rem/em conversions; drop

### 3. Spacing grid (MEDIUM)
- 2 px base is unusual; 4 px or 8 px base simplifies authoring and matches EDS block-gap convention
- Recommend: `2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 320` (14-step, removes 38, 55, 70, 78, 95, 102, 120, 123, 140, 203, 207, 213, 236)

### 4. Font weights collapse (HIGH)
- Current: 100, 300, 400, 500, 600, 700, 800, 900
- Drop 100 (5 uses, likely unintentional), 900 (8 uses, likely unintentional)
- Consolidate 500/600 → 500 for non-heading emphasis
- Target: 400, 500, 700, 800 (four)

### 5. Component anatomy (LOW — needs discovery validation)
- designlang's anatomy.tsx surfaced only `Card` + `Button`. DOM evidence shows 28 distinct `bat-*` custom elements (see `migration-work/structure/organism-catalog.md`)
- The DOM-driven catalog is **homepage-biased** despite 10 templates sampled — specialized bat-* elements on the other 15 URL-template groups were not scraped
- `migration-discovery` must re-sample at least 3 more URL groups: `healthcare-professionals/*`, `faq/*`, `real-people-real-success/*`

### 6. CSS health (will be solved by migration)
- EDS rewrite discards all 179 `!important` rules, all 11,611 duplicate declarations, and the 92% unused CSS
- Target post-migration: `lint` clean, Lighthouse 100 (which forbids unused CSS > 20 KB in the critical path)

## Normalization scope estimate

| Task | Size | Est. hours |
|---|---|---:|
| Cluster 27 colors → 12 primitives + 8 semantic (evidence-driven audit) | M | 6 |
| Define 2-family + 4-weight + 7-size type scale (include Santral licensing check) | L | 12 |
| Snap spacing to 8 px grid; remove 13 one-off values | S | 3 |
| Consolidate 10 shadows → 3 (sm/md/lg) | S | 3 |
| Merge overlapping radii → 4 canonical | XS | 1 |
| Fix 1 WCAG contrast pair | XS | 1 |
| Write full `:root` token set in `styles/styles.css` | M | 6 |
| Validate decisions via Pencil canvas review | M | 8 |
| Stakeholder sign-off cycle | M | 6 |
| **Subtotal** | | **46h** |

This work is the core of **Execution Phase 2** (Design System Build). Combined with Pencil design definition and cross-referencing against the `migration-discovery` output, the full Phase 2 effort lands at **~70–110h** (see [07-timeline-and-resources.md](07-timeline-and-resources.md)).
