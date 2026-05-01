# Normalization Report — Zonnic Canada

## Principle

The migration target is a **normalized, best-practice EDS system** — not a like-for-like replica of the source. Per `dev-collab-and-good-practices`, less is more: fewer tokens, fewer fonts, fewer weights, simpler scales. Authors and developers both benefit; performance budgets are easier to hold.

This document lists every normalisation decision the migration applies, with a justification and a delta count. Stakeholders sign off on the deltas during Phase 2 (Design System Build).

## Changes Applied

### Colors

- **Primitives reduced:** 27 → **13** (kept primary, primary-deep, secondary, accent-mint, success, warning, destructive + 6 neutrals)
- **Removed:** `#252d65`, `#252c68`, `#27455c` (collapsed into `#141e53`); `#666666`, `#767676`, `#808080` (collapsed into `#616069`); `#dedede`, `#bbbbbb`, `#a6a6a6` (collapsed into `#9a9ca8`); `#ad1f8c` (one-off campaign — moved to a section variant CSS var so the campaign page can opt back in)
- **Fixed:** 4 WCAG AA contrast failures remediated by tightening neutral text to `#3a3a3f` minimum on white and to `#ffffff` on `#182465`/`#141e53`. Health-warning banner contrast (red on white) verified at AAA.
- **Result:** **3 brand tokens + 4 semantic tokens (success/warning/destructive/info) + 6 neutral tokens = 13 primitives**, exposed as CSS custom properties in `styles.css` and authoring-friendly section style names (`zonnic-mint`, `zonnic-navy`).

### Typography

- **Removed font families:** Times New Roman, Times, Font Awesome 5 (icons → inline SVG), Arial (fallback inheritance)
- **Removed weights:** 100, 300, 500, 600, 900 (kept 400 / 700 / 800)
- **Removed sizes:** 13.008, 13.3333, 13.6, 14.4, 30, 34 px (effectively duplicates of 13/14/32px)
- **Normalised line-heights** to a 1.2 / 1.4 / 1.5 ratio (heading / sub-heading / body)
- **Normalised type scale:** 12 / 14 / 16 / 20 / 24 / 32 / 42 px (modular ratio ≈ 1.25)
- **Result:** **1 family (Santral) + system fallback stack, 3 weights, 7-step scale**.

### Spacing

- **Normalised to:** **8-step scale on a 4px base**: 4, 8, 16, 24, 32, 48, 64, 96 + macro 160, 240
- **Removed:** the 17 ad-hoc values (38, 55, 70, 102, 123, 140, 203, 207, 236, 256, 320…) collapsed onto the nearest scale step
- **Result:** **10-step scale, 4px base** — drives all section paddings, gutter widths, form field rhythm

### Shadows

- **Removed** 6 distinct shadow recipes
- **Result:** **2 shadows**: `--shadow-sm` (cards), `--shadow-md` (modals, popovers).

### Radii

- **Removed** the 17 / 50 / 100px outliers
- **Result:** **5 tokens**: `xs=2`, `sm=6`, `md=14`, `lg=24`, `full=9999`.

### Components

- **Merged near-duplicate organisms** during atomic structuring (next file): the source had 3 hero variants and 5 card variants that collapse to **1 hero block** (3 modifiers) + **2 card blocks** (cards / feature-cards) + **1 carousel block**.
- **Rationalised** the FAQ accordion + "How to use" numbered-step layout + step-cards into **2 patterns**: an `accordion` block and a `steps` block.
- **Rationalised** the testimonial carousel + the campaign quote-strip into a single `testimonial-carousel` block.

### Behaviour

- **Removed** the heavy custom animation library — fades, reveals and the testimonial carousel now use CSS animation tokens + a 30-line carousel utility (no third-party).
- **Removed** the in-page `helpButton` floating widget (Salesforce chat) from the critical path; it loads ≥ 3s after LCP.

## Delta Summary

| Aspect | Source | Normalised | Change |
|--------|--------|-----------|--------|
| Color tokens | 27 | 13 | −14 (−52%) |
| Type sizes | 15 | 7 | −8 (−53%) |
| Type weights | 8 | 3 | −5 (−63%) |
| Spacing values | 17 | 10 | −7 (−41%) |
| Shadow recipes | 6 | 2 | −4 (−67%) |
| Radius values | 7 | 5 | −2 |
| Font families | 6 | 1 | −5 |
| `!important` rules | 179 | **0** | −179 |
| Hero variants | 3 | 1 (3 modifiers) | -2 organism types |
| Card variants | 5 | 2 | -3 organism types |
| WCAG contrast failures | 4 | **0** | -4 |

## Justification (per decision)

| Decision | Rationale |
|---|---|
| Drop `Times New Roman/Times` | Used only by the legal disclaimer at page foot; Santral inherits cleanly |
| Drop weights 100/500/600/900 | Used <1% combined; visually indistinguishable at body sizes |
| Drop magenta `#ad1f8c` from primitives | Single-page usage; authors can opt into via a section-style variable |
| Collapse 4 navies | All within 5 ΔE; visually identical |
| Move from 17-step spacing to 10-step on 4px base | Aligns with Adobe Spectrum and EDS Block Collection conventions; simpler for authors |
| Drop Adobe DTM bootstrap from critical path | Lighthouse 100 cannot be held with synchronous third-party JS — moving to `delayed.js` is the only viable EDS approach |
| Replace Font Awesome 5 with inline SVG | Eliminates a 75KB icon-font payload; per-icon SVG is ~1KB |
| Replace 179 `!important` rules with proper specificity | Direct EDS best practice; avoids style-leakage between blocks |

## What is **not** changed

The migration **preserves**:
- Health-warning banner content (regulator-mandated; verbatim)
- All copy in legal/disclaimer footers (regulator-mandated; verbatim)
- The age-gate UX flow (replaced with edge-worker + static gate page; the user-visible behaviour is identical)
- Information architecture (URL structure `/ca/en/{template}` preserved; redirects published for any URL changes)
- Font: Santral remains the canonical brand face
- Brand navy `#182465` remains the canonical primary

## Open questions for stakeholders (Phase 2)

1. Confirm Santral can be self-hosted on aem.live infrastructure (license check)
2. Confirm migration-period for the magenta campaign page (`#ad1f8c`) — keep the single-page palette or sunset it?
3. Confirm Adobe Target experiments inventory — which are active and need to migrate vs which can be retired?
4. Confirm OneTrust geographic configuration (Canada-specific consent groups)
5. Approve the WCAG remediations (text colour darkens by ~5–8 lightness units)
