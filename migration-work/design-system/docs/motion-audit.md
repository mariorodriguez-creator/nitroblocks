# Motion, Shadows & Radii Audit — zonnic.ca

> **Evidence base:** `./migration-work/design-extract/zonnic-ca-design-tokens.json`, `./migration-work/design-extract/zonnic-ca-motion-tokens.json`, `./migration-work/design-extract/zonnic-ca-design-language.md` (shadows section, motion section).

## Shadows

### Raw Inputs (10 distinct)

| # | Value | Labelled tier | Observed blur | Cluster |
|--:|---|---|---:|---|
| 1 | `rgba(47, 47, 47, 0.3) 0px 2px 5px 0px` | sm | 5 | SM |
| 2 | `rgb(199, 197, 199) -3px -3px 5px -2px` | md | 5 | inset-noise (drop) |
| 3 | `rgba(0, 0, 0, 0.3) 0px 0px 10px 0px` | md | 10 | MD |
| 4 | `rgb(153, 153, 153) 0px 2px 10px -3px` | md | 10 | MD |
| 5 | `rgb(199, 197, 199) 0px 0px 12px 2px` | md | 12 | MD |
| 6 | `rgba(0, 0, 0, 0.2) 0px 4px 8px 0px` | md | 8 | MD |
| 7 | `rgb(97, 96, 105) 0px 5px 10px 0px` | md | 10 | MD |
| 8 | `rgba(0, 0, 0, 0.3) 3px 6px 10px 0px` | lg | 10 | LG |
| 9 | `rgba(0, 0, 0, 0.2) 0px 6px 12px 0px` | lg | 12 | LG |
| 10 | `rgba(0, 0, 0, 0.2) 0px 0px 18px 0px` | lg | 18 | LG |

### Clustering

- **SM** (1 value, blur 5): keep as-is; used on subtle chip/button hover.
- **MD** (5 values, blur 8–12): all four positive-offset items express "card raised" at slightly different alpha and blur. Merge to a single canonical definition.
- **LG** (3 values, blur 10–18): merge to a single canonical definition.
- **Inset-noise shadow** (item 2) uses opaque RGB from the neutral palette with negative offset — evidence of an `inset`-like decoration. Single use. **Drop.**

### Target Tokens (4 total)

```css
--shadow-sm: 0 2px 5px rgba(47, 47, 47, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 6px 12px rgba(0, 0, 0, 0.2);
--shadow-focus: 0 0 0 3px rgba(56, 96, 190, 0.4);  /* derived, brand-secondary @ 40% */
```

**Mapping:**
- Source SM → `--shadow-sm` (kept)
- Source MD (5 variants) → `--shadow-md` (canonicalized `rgba(0, 0, 0, 0.2) 0 4px 8px`)
- Source LG (3 variants) → `--shadow-lg` (canonicalized `rgba(0, 0, 0, 0.2) 0 6px 12px`)
- Focus ring → new derived token using brand-secondary blue

## Border Radii

### Raw Inputs (7 distinct)

| Value | Labelled tier | Count | Cluster |
|------:|---|------:|---|
| 1 px | xs | 56 | hairline-noise (drop — 1 px is not a visible corner) |
| 6 px | md | 8 | SM |
| 14 px | lg | 26 | MD |
| 17 px | xl | 7 | LG |
| 20 px | xl | 21 | LG |
| 50 px | full | 15 | FULL |
| 100 px | full | 163 | FULL |

### Clustering & Decision

- **1 px:** drop — too close to 0 to register as rounded; probably border artefact.
- **6 px** (8 uses): keep as `--radius-sm` — form fields.
- **14 px** (26 uses): keep as `--radius-md` — cards (most-used non-pill radius).
- **17 px / 20 px:** merge into single `--radius-lg` at 20 px. Delta 3 px.
- **50 px / 100 px:** both are pill-intent (button with `padding-inline: 24`). Merge. The 100 px value dominates (163 uses) and is visually identical to 50 px for any control under 100 px tall — promote to `--radius-full: 9999px` for true pill semantics.

### Target Tokens (5 total)

```css
--radius-none: 0;
--radius-sm: 6px;     /* form inputs, small chips */
--radius-md: 14px;    /* cards, modals, panels */
--radius-lg: 20px;    /* large cards, feature blocks */
--radius-full: 9999px; /* pill buttons, avatars */
```

## Motion

### Raw Inputs

**Durations** (from `zonnic-ca-motion-tokens.json` + `design-language.md`):

| Value | Count | Cluster |
|------:|------:|---|
| 0.1s (100ms) | common on hover | FAST |
| 0.2s (200ms) | transition opacity | FAST |
| 0.25s (250ms) | rare | — |
| 0.3s (300ms) | max-height, accordion | BASE |
| 0.5s (500ms) | color, bg-color, border | SLOW |
| 0.6s (600ms) | single use | — (drop) |

**Easings:**
- `ease` (default)
- `ease-in`
- `ease-in-out`
- Custom cubics: **none observed** (the raw motion-tokens.json reports only `ease` with family `ease-in-out`)

### Clustering

- **FAST** (100, 200 ms): merge to 150 ms canonical for hover/interactive micro-transitions.
  - Source 100 ms (ease-in) on hover, 200 ms on opacity → single 150 ms base tunes both.
- **BASE** (250, 300 ms): keep as 250 ms (default), align with standard Material-ish base.
- **SLOW** (500 ms): keep at 500 ms for cross-fade, theme swap.
- **DROP** 600 ms — single-use outlier.

### Target Tokens

```css
--motion-fast: 150ms;
--motion-base: 250ms;
--motion-slow: 500ms;

--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);   /* hover exits, reveal */
--ease-in:     cubic-bezier(0.64, 0, 0.78, 0);  /* hover enters, hide */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* bi-directional transforms */
--ease-linear: linear;                          /* progress indicators */
```

### Mapping to existing site animations

| Site animation | Current tokens | Target tokens |
|---|---|---|
| Button hover (color change) | `0.1s ease-in` | `var(--motion-fast) var(--ease-in)` |
| Dropdown / nav reveal | `0.2s ease-in` on opacity | `var(--motion-fast) var(--ease-out)` |
| Accordion expand | `max-height 0.3s ease-in` | `var(--motion-base) var(--ease-in-out)` |
| Theme / color transition | `0.5s` color/bg | `var(--motion-slow) var(--ease-in-out)` |
| Dropped: `fa-spin`, `bounce-arrow`, `showHours`, `rotateGeoloc`, OneTrust intros | — | Remove — third-party or unused |

## Summary

| Category | Raw count | Consolidated |
|---|---:|---:|
| Shadows | 10 | 4 (sm, md, lg, focus) |
| Radii | 7 | 5 (none, sm, md, lg, full) |
| Durations | 6 | 3 (fast, base, slow) |
| Easings | 3 + undefined | 4 (out, in, in-out, linear) |

All rejected values are logged in `normalization-log.md`.
