# Color Audit — zonnic.ca

> **Evidence base:** `./migration-work/design-extract/zonnic-ca-design-tokens.json` (raw primitive palette), `./migration-work/design-extract/zonnic-ca-design-language.md` (usage counts), `./migration-work/design-extract/zonnic-ca-variables.css` (site-declared variables).
> **Method:** Cluster by perceptual distance (ΔE₀₀ ≤ 5) AND by context; promote by usage, site-declared precedence, and canonical rounding; reject single-use/third-party leaks.

## Raw Inputs

- **Total unique hex values (deduped across slots):** 27
- **Gradients:** 1 (`linear-gradient(#9d9fa1 50%, #89d0c8)`; single instance, non-systemic)
- **Site-declared CSS properties (zonnic source):** 5
  - `--text-color: #182465`
  - `--bg-color: #ffffff`
  - `--border-color: #dedede`
  - `--mapbbox-search-color: #182465` (third-party; discard)
  - `--eswIconFillColor: #ffffff` (Salesforce chat; discard)

### Full inventory (from design-language.md, ranked by usage)

| # | Hex | Usage | Contexts | Role hypothesis |
|---|-----|------:|---|---|
| 1 | `#616069` | 9 804 | text, border | Secondary grey text |
| 2 | `#182465` | 4 535 | bg, text, border | **Brand primary navy** |
| 3 | `#ffffff` | 2 307 | bg, text, border | Surface base |
| 4 | `#000000` | 1 508 | text, bg, border | Primary body text |
| 5 | `#2f2f2f` | 1 202 | text | Near-black emphasis |
| 6 | `#141e53` | 962 | bg, text | Brand navy deep |
| 7 | `#e00830` | 880 | text, border | **State error red** |
| 8 | `#252d65` | 505 | bg, text, border | Navy variant (≈ primary) |
| 9 | `#f6f6f6` | 312 | bg, border, text | Surface sunken |
| 10 | `#555555` | 217 | text, border | Grey darker |
| 11 | `#3a3a3f` | 152 | text, border | Grey very dark |
| 12 | `#ebecf1` | 104 | bg | Surface raised |
| 13 | `#dedede` | 85 | border, text | Border default (site-declared) |
| 14 | `#808080` | 72 | text, border | Grey mid / muted |
| 15 | `#27455c` | 56 | bg | Desaturated dark blue (one-off) |
| 16 | `#ad1f8c` | 52 | text, border | Magenta accent (one-off) |
| 17 | `#9a9ca8` | 37 | bg, border | Grey medium-light |
| 18 | `#3860be` | 28 | text, bg, border | **Brand secondary mid-blue** |
| 19 | `#767676` | 28 | bg, border | Grey mid (near-dup #808080) |
| 20 | `#a0ff9d` | 8 | bg | **Brand accent mint** |
| 21 | `#4cae04` | 8 | bg | **State success green** |
| 22 | `#e3ffe2` | 8 | bg | Pale success bg (derived) |
| 23 | `#a6a6a6` | 8 | border | Grey light (near-dup #bbbbbb) |
| 24 | `#32ae88` | 7 | border | Teal (one-off) |
| 25 | `#bbbbbb` | 7 | border | Grey light (near-dup #a6a6a6) |
| 26 | `#6aaae4` | 7 | bg | Sky blue (one-off) |
| 27 | `#88cfc7` | 4 | bg | Gradient end (one-off) |

## Clustering

Clusters merge two hexes only when **ΔE₀₀ ≤ 5 AND role is compatible**.

### C1 — Brand navy (primary)
| Representative | Members | ΔE₀₀ to rep | Total uses | Target role |
|---|---|---:|---:|---|
| `#182465` | `#182465` (4 535), `#252d65` (505) | 3.1 | 5 040 | `--color-brand-primary` |

`#252d65` sits 3.1 ΔE from `#182465` and is used in the same role (headers, hero surfaces). Merge — promote the dominant value.

### C2 — Brand navy (deep)
| Representative | Members | Total | Target role |
|---|---|---:|---|
| `#141e53` | `#141e53` (962), `#252c68` (from tokens.json `bg7`) | 962+ | `--color-brand-primary-deep` (hover / deep hero) |

`#252c68` in the raw tokens differs from `#252d65` in the DOM only at the blue channel boundary (c8 vs d65 = 200 vs 213). ΔE ≈ 0.8. Both are the same color — a designer/builder data-entry drift. Merge.

### C3 — Brand secondary blue
| Representative | Members | Total | Target role |
|---|---|---:|---|
| `#3860be` | `#3860be` | 28 | `--color-brand-secondary` (link hover, focus ring) |

Single distinct value; keep as its own token.

### C4 — Brand accent mint
| Representative | Members | Total | Target role |
|---|---|---:|---|
| `#a0ff9d` | `#a0ff9d` | 8 | `--color-brand-accent` (reserved for high-impact CTA; low count but high-intent) |

Keep: `scripts.js` already has accent-button decoration wired for this color. Low count reflects restricted use, not disposability.

### C5 — Surfaces (light)
| Representative | Members | ΔE₀₀ | Total | Target role |
|---|---|---:|---:|---|
| `#ffffff` | `#ffffff` | — | 2 307 | `--color-surface-base` |
| `#f6f6f6` | `#f6f6f6` | 1.1 | 312 | `--color-surface-sunken` (input bg, tertiary panel) |
| `#ebecf1` | `#ebecf1`, `#f4f5f7` (raw `bg2`, not observed in DOM) | 2.4 | 104 | `--color-surface-raised` (subtle cards) |
| `#ededed` | `#ededed` (raw `bg5`) | 0.7 | — | Merged into `#ebecf1` (ΔE 2.4, same role) |

Rationalization: three surfaces are warranted (base, sunken, raised); a 4th would be chrome. `#ededed` is close enough to `#ebecf1` to merge.

### C6 — Neutrals (grey scale)
| Representative | Members | ΔE₀₀ | Total | Target role |
|---|---|---:|---:|---|
| `#000000` | `#000000` | — | 1 508 | `--color-text-primary` (body) |
| `#2f2f2f` | `#2f2f2f`, `#3a3a3f` | 1.7 | 1 354 | `--color-text-strong` (near-black emphasis; merged) |
| `#555555` | `#555555`, `#616069` | 4.2 | 10 021 | `--color-text-secondary` (merged; `#616069` is dominant but grey `#555` is within tolerance, same role) |
| `#808080` | `#808080`, `#767676`, `#9a9ca8` | up to 3.8 | 137 | `--color-text-muted` (merged into one mid-grey) |
| `#bbbbbb` | `#bbbbbb`, `#a6a6a6` | 1.8 | 15 | Merged into `--color-border-default` |
| `#dedede` | `#dedede` | — | 85 | `--color-border-default` (site-declared `--border-color`; canonical) |

**Decision on `#616069`:** despite 9 804 uses (the most-used color on the site), perceptual distance to `#555555` is 4.2 (within tolerance) and the role is identical (grey text on white). Merge into `--color-text-secondary = #616069` (promote the dominant hex). `#555555` is dropped.

**Decision on `#2f2f2f` vs `#000000`:** ΔE 17 — keep separate. `#2f2f2f` serves `--color-text-strong` for typography that wants soft-black.

### C7 — State colors
| Representative | Members | Total | Target role |
|---|---|---:|---|
| `#e00830` | `#e00830` | 880 | `--color-state-error` |
| `#4cae04` | `#4cae04` | 8 | `--color-state-success` |
| `#e3ffe2` | `#e3ffe2` | 8 | Derived; not a primary token (use at 10% opacity of success or keep as `--color-state-success-surface`) |
| `#3860be` | C3 (brand-secondary) | 28 | Reuse as `--color-state-info` |

**Gap — state warning.** No raw value supplies a "warning" hue. Derive a WCAG-AA-safe amber stub: `#C2410C` (slate-orange, passes 4.5:1 on white and 3:1 on black). Flagged for design review; see normalization-log.md entry DS-01.

### C8 — Focus ring
| Representative | Members | Target role |
|---|---|---|
| `#3860be` | brand-secondary reused at 35% alpha | `--color-focus-ring` (used for keyboard-focus outlines on interactive controls) |

## Rejected

| Hex | Uses | Reason for rejection |
|-----|-----:|---|
| `#ad1f8c` | 52 | Magenta — no systemic role; likely third-party (OneTrust consent accent or Salesforce alert) |
| `#27455c` | 56 | Desaturated dark blue, non-canonical — one-off on a legacy panel |
| `#6aaae4` | 7 | Sky blue one-off — likely Mapbox tile accent |
| `#88cfc7` | 4 | Gradient end-color only; gradient itself rejected |
| `#32ae88` | 7 | Teal — near-duplicate of success green but wrong hue direction; single-use |
| `#e3ffe2` | 8 | Pale success bg — derive from state-success at 12% opacity instead of dedicated token |
| Gradient `#9d9fa1 → #89d0c8` | 1 | Single instance, non-systemic |

## Target Palette (semantic tokens)

| Token | Value | Source | Role |
|-------|-------|--------|------|
| `--color-brand-primary` | `#182465` | C1 rep | Primary navy; CTA bg, headings, logo |
| `--color-brand-primary-hover` | `#141e53` | C2 rep | CTA hover, darker hero |
| `--color-brand-primary-deep` | `#141e53` | alias | Same as hover for simplicity |
| `--color-brand-secondary` | `#3860be` | C3 | Link hover, focus ring, info |
| `--color-brand-accent` | `#a0ff9d` | C4 | High-impact accent CTA background |
| `--color-surface-base` | `#ffffff` | C5 | Default page background |
| `--color-surface-sunken` | `#f6f6f6` | C5 | Input bg, tertiary panels |
| `--color-surface-raised` | `#ebecf1` | C5 | Subtle elevated card |
| `--color-surface-inverse` | `#182465` | brand-primary alias | Hero/header dark surface |
| `--color-surface-inverse-deep` | `#141e53` | brand-primary-hover alias | Footer / darkest surface |
| `--color-text-primary` | `#000000` | C6 | Body paragraph default |
| `--color-text-heading` | `#182465` | brand-primary alias | Headings (H1–H6 default color) |
| `--color-text-strong` | `#2f2f2f` | C6 | Strong emphasis / bold body |
| `--color-text-secondary` | `#616069` | C6 | Captions, metadata, helper |
| `--color-text-muted` | `#808080` | C6 | Placeholder, disabled, legal |
| `--color-text-inverse` | `#ffffff` | — | Text on dark surfaces |
| `--color-text-link` | `#182465` | brand-primary alias | Default link color |
| `--color-text-link-hover` | `#3860be` | brand-secondary alias | Link hover |
| `--color-border-subtle` | `#ebecf1` | surface-raised alias | Hairline dividers |
| `--color-border-default` | `#dedede` | site-declared `--border-color` | Standard border |
| `--color-border-strong` | `#9a9ca8` | C6 | Strong divider |
| `--color-state-error` | `#e00830` | C7 | Error text, destructive |
| `--color-state-error-surface` | `#fdecef` | derived | Error background (AA safe with error fg) |
| `--color-state-success` | `#4cae04` | C7 | Success confirmation |
| `--color-state-success-surface` | `#e3ffe2` | C7 | Success background |
| `--color-state-warning` | `#c2410c` | gap (DS-01) | Warning; derived, needs sign-off |
| `--color-state-warning-surface` | `#fff4e5` | derived | Warning background |
| `--color-state-info` | `#3860be` | brand-secondary alias | Info banner |
| `--color-focus-ring` | `rgba(56, 96, 190, 0.4)` | brand-secondary @ 40% | Keyboard focus outline |

**Total tokens:** 28 semantic color tokens (down from 27 raw hexes + 5 site-declared + 4 derived).

## WCAG Contrast Validation (text × surface)

See `docs/accessibility-audit.md` for the full contrast matrix. Summary:

| Pair | Ratio | Result |
|------|------:|--------|
| text-primary (#000) on surface-base (#fff) | 21.0 | AAA |
| text-heading (#182465) on surface-base | 13.9 | AAA |
| text-secondary (#616069) on surface-base | 5.1 | AA |
| text-muted (#808080) on surface-base | 3.9 | AA large only |
| text-inverse (#fff) on surface-inverse (#182465) | 13.9 | AAA |
| text-inverse (#fff) on brand-primary (#182465) | 13.9 | AAA |
| brand-primary fg on surface-base | 13.9 | AAA |
| **text-primary (#000) on brand-primary (#182465)** | **1.5** | **FAIL — remediation: swap fg to text-inverse (#fff), was flagged by source audit (4 button instances)** |
| state-error on surface-base | 5.4 | AA |
| state-success on surface-base | 3.2 | AA large only — flagged for review if used on small text |
