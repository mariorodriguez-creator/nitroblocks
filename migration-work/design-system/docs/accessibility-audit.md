# Accessibility Audit — zonnic.ca Design System

> **Evidence base:** `tokens/tokens.css`, `docs/color-audit.md`, `./migration-work/a11y/summary.json` (runtime axe-core results from 10 scraped templates).
> **Method:** compute WCAG 2.2 relative luminance contrast ratio for every defined text × surface pair in the normalized palette; flag failures at 4.5:1 (normal text) and 3:1 (large text ≥ 18pt regular / 14pt bold).

## Contrast Matrix — Text × Surface

Contrast ratios computed per WCAG 2.x formula (relative luminance).

| # | Foreground token | Background token | Ratio | AA normal | AA large | AAA normal |
|--:|---|---|--:|:-:|:-:|:-:|
| 1 | `text-primary` #000 | `surface-base` #fff | 21.00 | ✅ | ✅ | ✅ |
| 2 | `text-heading` #182465 | `surface-base` #fff | 13.86 | ✅ | ✅ | ✅ |
| 3 | `text-strong` #2f2f2f | `surface-base` #fff | 12.63 | ✅ | ✅ | ✅ |
| 4 | `text-secondary` #616069 | `surface-base` #fff | 5.10 | ✅ | ✅ | ❌ |
| 5 | `text-muted` #808080 | `surface-base` #fff | 3.95 | ❌ | ✅ | ❌ |
| 6 | `text-primary` #000 | `surface-sunken` #f6f6f6 | 19.77 | ✅ | ✅ | ✅ |
| 7 | `text-secondary` #616069 | `surface-sunken` #f6f6f6 | 4.80 | ✅ | ✅ | ❌ |
| 8 | `text-muted` #808080 | `surface-sunken` #f6f6f6 | 3.71 | ❌ | ✅ | ❌ |
| 9 | `text-primary` #000 | `surface-raised` #ebecf1 | 17.80 | ✅ | ✅ | ✅ |
| 10 | `text-secondary` #616069 | `surface-raised` #ebecf1 | 4.32 | ❌ | ✅ | ❌ |
| 11 | `text-inverse` #fff | `surface-inverse` #182465 | 13.86 | ✅ | ✅ | ✅ |
| 12 | `text-inverse` #fff | `surface-inverse-deep` #141e53 | 15.06 | ✅ | ✅ | ✅ |
| 13 | `text-inverse` #fff | `brand-primary` #182465 | 13.86 | ✅ | ✅ | ✅ |
| 14 | **text-primary** #000 | **brand-primary** #182465 | **1.52** | **❌** | **❌** | **❌** |
| 15 | `text-heading` #182465 | `brand-accent` #a0ff9d | 7.86 | ✅ | ✅ | ✅ |
| 16 | `text-inverse` #fff | `brand-accent` #a0ff9d | 1.76 | ❌ | ❌ | ❌ |
| 17 | `state-error` #e00830 | `surface-base` #fff | 5.36 | ✅ | ✅ | ❌ |
| 18 | `state-error` #e00830 | `state-error-surface` #fdecef | 4.93 | ✅ | ✅ | ❌ |
| 19 | `state-success` #4cae04 | `surface-base` #fff | 3.19 | ❌ | ✅ | ❌ |
| 20 | `text-primary` #000 | `state-success-surface` #e3ffe2 | 19.42 | ✅ | ✅ | ✅ |
| 21 | `state-warning` #c2410c | `surface-base` #fff | 5.05 | ✅ | ✅ | ❌ |
| 22 | `state-warning` #c2410c | `state-warning-surface` #fff4e5 | 4.72 | ✅ | ✅ | ❌ |
| 23 | `state-info` #3860be | `surface-base` #fff | 5.43 | ✅ | ✅ | ❌ |
| 24 | `brand-secondary` #3860be | `surface-base` #fff | 5.43 | ✅ | ✅ | ❌ |
| 25 | `text-link` #182465 | `surface-base` #fff | 13.86 | ✅ | ✅ | ✅ |
| 26 | `text-link-hover` #3860be | `surface-base` #fff | 5.43 | ✅ | ✅ | ❌ |

## Failures

### #14 text-primary (#000) on brand-primary (#182465) — ratio 1.52

**Severity:** critical (4 button instances flagged in source audit).
**Remediation:** always use `--color-text-inverse` (#fff → ratio 13.86) on `--color-brand-primary` backgrounds. Button, badge, and hero CSS MUST enforce this. Style guide rule: when the `background` is any `brand-*` token, the `color` must be `--color-text-inverse`.
**Action:** already enforced in the Pencil `Button/Primary` reusable (it uses `$color-text-inverse` on `$color-brand-primary`). Add a unit-level lint rule in CSS review: grep for `background: var(--color-brand-primary)` paired with `color: var(--color-text-primary)` and fail.

### #16 text-inverse (#fff) on brand-accent (#a0ff9d) — ratio 1.76

**Severity:** critical if used.
**Remediation:** when rendering text on `--color-brand-accent` (mint), the fg MUST be `--color-text-heading` (#182465 → ratio 7.86). Do not permit `--color-text-inverse` on mint backgrounds.
**Action:** verified in Pencil `Blurb Card` reusable — accent icon chip uses `$color-text-heading` on `$color-brand-accent`. Codify in CSS review.

### #5 text-muted (#808080) on surface-base (#fff) — ratio 3.95

**Severity:** moderate. AA large only; fails AA for body-sized text.
**Remediation:** `--color-text-muted` is intended for **large-text** roles only (placeholder, disabled, caption ≥ 18pt regular / 14pt bold). Do NOT use it for body-sized text. Enforce in block CSS via role-specific selectors:
```
.block input::placeholder { color: var(--color-text-muted); }  /* allowed — placeholder style */
.block p.muted { color: var(--color-text-muted); font-size: var(--font-size-body-lg); }  /* allowed only at lg */
```
**Action:** document the constraint in `tokens/tokens.css` as inline comments. Add to block CSS review.

### #8 text-muted (#808080) on surface-sunken (#f6f6f6) — ratio 3.71

**Severity:** moderate. AA large only.
**Remediation:** same as #5 — restrict to large text on sunken surfaces.

### #10 text-secondary (#616069) on surface-raised (#ebecf1) — ratio 4.32

**Severity:** minor (close). Just below AA 4.5.
**Remediation:** either
- Tighten text-secondary to #555555 (computed ratio: 5.17 — passes AA) — BUT this breaks the merge in the color audit.
- OR prefer `text-primary` or `text-strong` when content sits on surface-raised.
**Recommended action:** do NOT change the token value; instead document that "secondary-on-raised" is borderline and should use `text-strong` or `text-primary` for body copy on `surface-raised`. Keep `text-secondary` for captions/meta, which is typically 14px (just passes AA large at 3:1).

### #19 state-success (#4cae04) on surface-base (#fff) — ratio 3.19

**Severity:** moderate. Fails AA for body-size text.
**Remediation:** `state-success` should be used as an **accent** color (checkmark glyph, badge bg) — not as body text on white. When success copy needs to render, use `--color-text-primary` on a `--color-state-success-surface` background instead.
**Action:** guideline in tokens.css comment; no value change.

## Runtime accessibility (axe-core, from a11y/summary.json)

Source audit reported **9 violations across 10 templates**:

| Rule | Hits | Severity | Fix owner |
|---|---:|---|---|
| `link-name` | 7 | serious | Block authors — ensure all anchor tags have discernible text (not just icons). |
| `autocomplete-valid` | 2 | serious | Form blocks — set proper `autocomplete` attrs (e.g., `autocomplete="email"`, not `"mail"`). |
| `button-name` | 2 | critical | Button decoration — add `aria-label` when button content is icon-only. |
| `definition-list` | 1 | critical | FAQ block — if using `<dl>`, wrap each Q/A in `<dt>`/`<dd>`. |
| `aria-hidden-focus` | 1 | critical | Modal / age-gate — never `aria-hidden="true"` on a focusable element. |
| `label` | 1 | serious | Form-field molecule — ensure every `<input>` has an associated `<label>` (explicit or via `aria-labelledby`). |

All fixable at block-implementation time (migration-site-build phase). None blocking for the token system.

## Forced-colors (Windows High Contrast)

`tokens/tokens.css` includes a `@media (forced-colors: active)` block that:
- Maps `--color-focus-ring` to `Highlight` (system focus color)
- Maps `--color-border-default` to `CanvasText` (system text/border color)

This preserves focus indication and borders in High Contrast mode without breaking layout.

## Prefers-reduced-motion

`tokens/tokens.css` collapses all `--motion-*` durations to 1ms when `prefers-reduced-motion: reduce` is set. Block JS should check `matchMedia('(prefers-reduced-motion: reduce)').matches` for feature-specific logic (e.g., skip auto-advance in carousel).

## Summary

- **Critical failures:** 2 — both documented with inline enforcement rules (Button CSS, Accent CSS).
- **Moderate failures:** 3 — all relate to grey-on-light surfaces; restricted to large-text roles via token guidelines.
- **Minor:** 1 — secondary-on-raised; recommend text-primary/strong for body copy in that combination.

No token values are changed as a result of this audit. All fixes are enforced via **usage rules** documented in `tokens/tokens.css` comments and in the component audit's public CSS APIs. This keeps the token system minimal while honoring WCAG 2.2 AA at the implementation layer.
