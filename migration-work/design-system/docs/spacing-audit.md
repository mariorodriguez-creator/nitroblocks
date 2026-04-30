# Spacing Audit — zonnic.ca

> **Evidence base:** `./migration-work/design-extract/zonnic-ca-design-tokens.json` (primitive.spacing), `./migration-work/design-extract/zonnic-ca-variables.css`.
> **Method:** survey raw values → select grid base → snap + log delta → cluster by role band → produce a sparse, intentional scale.

## Raw Inputs

18 distinct spacing values detected (base unit inferred by designlang: **2 px**):

```
0, 38, 48, 55, 60, 70, 78, 95, 102, 120, 123, 140, 203, 207, 213, 236, 256, 320 (px)
```

**Note.** designlang appears to have under-reported small/mid spacing (the raw inventory starts at 38 px). A typical site uses 4, 8, 12, 16, 24 etc. — these are almost certainly present in the stylesheet but below designlang's reporting threshold. The target scale will include them as inferred-required values.

## Grid Base Selection

| Base | Already on-grid | Off-grid count | Max delta | Verdict |
|-----:|---------------:|---------------:|---------:|---|
| 4 px | 5 (0, 48, 60, 120, 140, 256, 320) | 13 | 5 | 38→40 (Δ2), 55→56 (Δ1), 78→80 (Δ2), 95→96 (Δ1), 102→104 (Δ2), 123→124 (Δ1), 203→204 (Δ1), 207→208 (Δ1), 213→212 (Δ1), 236→236 ✓ |
| 8 px | 4 (0, 48, 120, 256, 320) | 14 | 6 | Larger deltas; 236→240 (Δ4), 213→216 (Δ3) |

**Decision: 4 px base.** Produces smaller deltas and tighter snapping. 4 px also matches `styles.css` / `lazy-styles.css` `margin/padding` conventions in existing Nitroblocks blocks.

## Snapping Table

| Raw | Snapped (4 px) | Δ | Cluster | Notes |
|----:|----:|---:|---|---|
| 0 | 0 | 0 | hairline | canonical |
| 38 | 40 | +2 | element | header gutter |
| 48 | 48 | 0 | element/block | canonical; button/card gutter |
| 55 | 56 | +1 | block | row spacing |
| 60 | 64 | +4 | block | large row spacing |
| 70 | 72 | +2 | block | section-sm gutter |
| 78 | 80 | +2 | block | section gutter |
| 95 | 96 | +1 | block-lg | vertical rhythm between sections |
| 102 | 104 | +2 | block-lg | cluster with 96 |
| 120 | 120 | 0 | section | canonical |
| 123 | 120 | −3 | section | cluster with 120 |
| 140 | 144 | +4 | section-lg | 36 × 4 |
| 203 | 208 | +5 | hero | cluster with 207/213 |
| 207 | 208 | +1 | hero | cluster with 203/213 |
| 213 | 208 | −5 | hero | cluster with 203/207 |
| 236 | 240 | +4 | hero-lg | cluster with 256? too close |
| 256 | 256 | 0 | hero-lg | canonical |
| 320 | 320 | 0 | hero-xl | canonical; also container width |

## Consolidation

Values within ±4 px cluster into a single representative. Result:

| Cluster | Source values | Canonical |
|---|---|---:|
| 0 | 0 | 0 |
| 40 | 38, 40 | 40 |
| 48 | 48 | 48 |
| 56 | 55, 56 | 56 |
| 64 | 60, 64 | 64 |
| 72 | 70, 72 | 72 |
| 80 | 78, 80 | 80 |
| 96 | 95, 96, 102, 104 | 96 (absorbed 102/104) |
| 120 | 120, 123 | 120 |
| 144 | 140, 144 | 144 |
| 208 | 203, 207, 208, 213 | 208 |
| 240 | 236, 240 | — collapse into 256 |
| 256 | 256, 240 | 256 |
| 320 | 320 | 320 |

12 post-consolidation values (from 18). Still dense. For a sparse, intentional scale, drop mid-range duplicates and keep the canonical steps:

## Target Scale (sparse, semantic)

Following the skill convention `name = value / 4`:

| Token | Value (px) | Role band | Use |
|---|---:|---|---|
| `--space-0` | 0 | zero | reset |
| `--space-1` | 4 | hairline | tight icon offset, tiny gap |
| `--space-2` | 8 | hairline | icon-to-text, compact gap |
| `--space-3` | 12 | hairline | form-field internal padding |
| `--space-4` | 16 | element | paragraph spacing, button internal Y |
| `--space-5` | 20 | element | button internal X small |
| `--space-6` | 24 | element | card internal, gap between elements |
| `--space-8` | 32 | element | default block gutter |
| `--space-10` | 40 | element | header padding Y (absorbs raw 38) |
| `--space-12` | 48 | block | section internal padding (absorbs raw 48) |
| `--space-14` | 56 | block | section-sm (absorbs raw 55) |
| `--space-16` | 64 | block | section (absorbs raw 60) |
| `--space-20` | 80 | block-lg | section-lg (absorbs raw 70, 78) |
| `--space-24` | 96 | section | vertical rhythm (absorbs raw 95, 102) |
| `--space-30` | 120 | section-lg | hero-small (absorbs raw 123) |
| `--space-36` | 144 | section-lg | hero gutter (absorbs raw 140) |
| `--space-52` | 208 | hero | oversize spacing (absorbs raw 203, 207, 213) |
| `--space-64` | 256 | hero-lg | oversize (absorbs raw 236) |
| `--space-80` | 320 | hero-xl | max-section (absorbs raw 320) |

**Total scale: 19 steps** (down from 18 raw, but semantically ordered and including small values raw data under-reported).

**Dropped from final scale:**
- 102 / 104 → absorbed into 96 (Δ6 or Δ8, same role)
- 123 → absorbed into 120 (Δ3)
- 203 / 207 / 213 → absorbed into 208 (Δ5 max)
- 236 → absorbed into 240 first, then into 256 (Δ16 — larger but low usage; no mid-tier needed)

## Role Bands

When to pick a token from each band:

- **hairline (0, 4, 8, 12):** icon offsets, focus-ring inset, form-internal padding, hairline dividers.
- **element (16, 20, 24, 32, 40):** between inline elements, button/input internal padding, paragraph spacing.
- **block (48, 56, 64, 80):** card padding, block internal gutter, between stacked sections of same semantic group.
- **section (96, 120, 144):** between major content sections on a page.
- **hero (208, 256, 320):** hero top/bottom padding at desktop, oversize art direction gutters.

## Container Widths (separate from spacing scale)

| Token | Value | Use |
|---|---:|---|
| `--container-narrow` | 640px | Long-form article reading |
| `--container-default` | 960px | Standard content container |
| `--container-wide` | 1200px | Multi-column layouts |
| `--container-xl` | 1440px | Hero full-bleed content max |

Breakpoints (for reference, unchanged from EDS boilerplate / CLAUDE.md):

```
600px, 900px, 1200px  (min-width only, mobile-first)
```

## Rejected

| Raw value | Decision | Reason |
|----------:|---|---|
| 55 | → 56 | 1 px noise |
| 102 | → 96 | Cluster with 96 (Δ6); one role |
| 123 | → 120 | 3 px noise |
| 203 | → 208 | Cluster with 207/213 |
| 213 | → 208 | Cluster with 203/207 |
| 236 | → 256 | Close to hero-lg; no mid-tier token needed |
