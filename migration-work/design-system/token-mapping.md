# Token Mapping — Pencil → EDS CSS

Cross-reference between Pencil canvas variables (`design-system.pen`), normalized CSS custom properties (`tokens/tokens.css`), and W3C DTCG JSON (`tokens/tokens.json`).

The Pencil canvas is the single design source of truth. `tokens.css` is the EDS-consumable export and must be regenerated from `get_variables` whenever canvas variables change.

## Colors — Brand

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| `color-brand-primary` | `--color-brand-primary` | `#182465` | color-audit.md §C1 |
| `color-brand-primary-hover` | `--color-brand-primary-hover` | `#141e53` | color-audit.md §C2 |
| *(CSS alias)* | `--color-brand-primary-deep` | `var(--color-brand-primary-hover)` | color-audit.md §C2 |
| `color-brand-secondary` | `--color-brand-secondary` | `#3860be` | color-audit.md §C3 |
| `color-brand-accent` | `--color-brand-accent` | `#a0ff9d` | color-audit.md §C4 |

## Colors — Surface

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| `color-surface-base` | `--color-surface-base` | `#ffffff` | color-audit.md §C5 |
| `color-surface-sunken` | `--color-surface-sunken` | `#f6f6f6` | color-audit.md §C5 |
| `color-surface-raised` | `--color-surface-raised` | `#ebecf1` | color-audit.md §C5 |
| `color-surface-inverse` | `--color-surface-inverse` | `#182465` (in CSS: alias of brand-primary) | color-audit.md §C5 |
| `color-surface-inverse-deep` | `--color-surface-inverse-deep` | `#141e53` (in CSS: alias of brand-primary-hover) | color-audit.md §C2 |

> **Note on Pencil limitation.** Pencil variables cannot alias other variables (see normalization-log DS-06). `color-surface-inverse` is set to the literal `#182465` in the canvas. CSS tokens use `var(--color-brand-primary)` for true aliasing. Changing `color-brand-primary` alone in Pencil does **not** automatically update `color-surface-inverse` — both must be updated together (or accept the divergence for hover / deep variants).

## Colors — Text

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| `color-text-primary` | `--color-text-primary` | `#000000` | color-audit.md §C6 |
| `color-text-heading` | `--color-text-heading` | `#182465` (in CSS: alias of brand-primary) | color-audit.md §C6 |
| `color-text-strong` | `--color-text-strong` | `#2f2f2f` | color-audit.md §C6 |
| `color-text-secondary` | `--color-text-secondary` | `#616069` | color-audit.md §C6 |
| `color-text-muted` | `--color-text-muted` | `#808080` | color-audit.md §C6 |
| `color-text-inverse` | `--color-text-inverse` | `#ffffff` | color-audit.md §C6 |
| `color-text-link` | `--color-text-link` | `#182465` (CSS alias of brand-primary) | color-audit.md §C6 |
| `color-text-link-hover` | `--color-text-link-hover` | `#3860be` (CSS alias of brand-secondary) | color-audit.md §C3 |

## Colors — Border

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| `color-border-subtle` | `--color-border-subtle` | `#ebecf1` (CSS alias of surface-raised) | color-audit.md §C5 |
| `color-border-default` | `--color-border-default` | `#dedede` | color-audit.md §C6; site-declared `--border-color` |
| `color-border-strong` | `--color-border-strong` | `#9a9ca8` | color-audit.md §C6 |

## Colors — State

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| `color-state-error` | `--color-state-error` | `#e00830` | color-audit.md §C7 |
| `color-state-error-surface` | `--color-state-error-surface` | `#fdecef` | color-audit.md §C7 (derived) |
| `color-state-success` | `--color-state-success` | `#4cae04` | color-audit.md §C7 |
| `color-state-success-surface` | `--color-state-success-surface` | `#e3ffe2` | color-audit.md §C7 |
| `color-state-warning` | `--color-state-warning` | `#c2410c` | DS-01 (derived; pending sign-off) |
| `color-state-warning-surface` | `--color-state-warning-surface` | `#fff4e5` | derived |
| `color-state-info` | `--color-state-info` | `#3860be` (CSS alias of brand-secondary) | color-audit.md §C7 |
| `color-focus-ring` | `--color-focus-ring` | `rgba(56, 96, 190, 0.4)` | color-audit.md §C8 |

## Typography

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| `font-family-primary` | `--font-family-primary` | `'Santral', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | typography-audit.md |
| `font-size-xs` | `--font-size-xs` | `12px` / `0.75rem` | typography-audit.md |
| `font-size-sm` | `--font-size-sm` | `14px` / `0.875rem` | typography-audit.md |
| `font-size-base` | `--font-size-base` | `16px` / `1rem` | typography-audit.md |
| `font-size-body-lg` | `--font-size-body-lg` | `18px` / `1.125rem` | typography-audit.md |
| `font-size-md` | `--font-size-md` | `20px` / `1.25rem` | typography-audit.md |
| `font-size-lg` | `--font-size-lg` | `24px` / `1.5rem` | typography-audit.md |
| `font-size-xl` | `--font-size-xl` | `32px` / `2rem` | typography-audit.md |
| `font-size-xxl` | `--font-size-xxl` | `42px` / `2.625rem` | typography-audit.md |
| `font-weight-regular` | `--font-weight-regular` | `400` | typography-audit.md (DS-02 pending) |
| `font-weight-semibold` | `--font-weight-semibold` | `700` | typography-audit.md |
| `font-weight-bold` | `--font-weight-bold` | `800` | typography-audit.md |
| `line-height-tight` | `--line-height-tight` | `1.1` | typography-audit.md |
| `line-height-snug` | `--line-height-snug` | `1.25` | typography-audit.md |
| `line-height-normal` | `--line-height-normal` | `1.4` | typography-audit.md |
| `line-height-relaxed` | `--line-height-relaxed` | `1.5` | typography-audit.md |

## Spacing

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| `space-0` | `--space-0` | `0` | spacing-audit.md |
| `space-1` | `--space-1` | `4px` | spacing-audit.md |
| `space-2` | `--space-2` | `8px` | spacing-audit.md |
| `space-3` | `--space-3` | `12px` | spacing-audit.md |
| `space-4` | `--space-4` | `16px` | spacing-audit.md |
| `space-5` | `--space-5` | `20px` | spacing-audit.md |
| `space-6` | `--space-6` | `24px` | spacing-audit.md |
| `space-8` | `--space-8` | `32px` | spacing-audit.md |
| `space-10` | `--space-10` | `40px` | spacing-audit.md (absorbs raw 38) |
| `space-12` | `--space-12` | `48px` | spacing-audit.md |
| `space-14` | `--space-14` | `56px` | spacing-audit.md (absorbs raw 55) |
| `space-16` | `--space-16` | `64px` | spacing-audit.md (absorbs raw 60) |
| `space-20` | `--space-20` | `80px` | spacing-audit.md (absorbs 70, 78) |
| `space-24` | `--space-24` | `96px` | spacing-audit.md (absorbs 95, 102) |
| `space-30` | `--space-30` | `120px` | spacing-audit.md (absorbs 123) |
| `space-36` | `--space-36` | `144px` | spacing-audit.md (absorbs 140) |
| `space-52` | `--space-52` | `208px` | spacing-audit.md (absorbs 203, 207, 213) |
| `space-64` | `--space-64` | `256px` | spacing-audit.md (absorbs 236) |
| `space-80` | `--space-80` | `320px` | spacing-audit.md |

## Layout

| Pencil variable | CSS custom property | Value |
|---|---|---|
| `container-narrow` | `--container-narrow` | `640px` |
| `container-default` | `--container-default` | `960px` |
| `container-wide` | `--container-wide` | `1200px` |
| `container-xl` | `--container-xl` | `1440px` |

## Shadows, Radii, Motion

| Pencil variable | CSS custom property | Value | Audit ref |
|---|---|---|---|
| — (applied as effect) | `--shadow-sm` | `0 2px 5px rgba(47, 47, 47, 0.3)` | motion-audit.md |
| — (applied as effect) | `--shadow-md` | `0 4px 8px rgba(0, 0, 0, 0.2)` | motion-audit.md |
| — (applied as effect) | `--shadow-lg` | `0 6px 12px rgba(0, 0, 0, 0.2)` | motion-audit.md |
| — (applied as effect) | `--shadow-focus` | `0 0 0 3px var(--color-focus-ring)` | motion-audit.md |
| `radius-none` | `--radius-none` | `0` | motion-audit.md |
| `radius-sm` | `--radius-sm` | `6px` / `0.375rem` | motion-audit.md |
| `radius-md` | `--radius-md` | `14px` / `0.875rem` | motion-audit.md |
| `radius-lg` | `--radius-lg` | `20px` / `1.25rem` | motion-audit.md (absorbs raw 17) |
| `radius-full` | `--radius-full` | `9999px` | motion-audit.md (absorbs 50, 100) |
| — | `--motion-fast` | `150ms` | motion-audit.md |
| — | `--motion-base` | `250ms` | motion-audit.md |
| — | `--motion-slow` | `500ms` | motion-audit.md |
| — | `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | motion-audit.md |
| — | `--ease-in` | `cubic-bezier(0.64, 0, 0.78, 0)` | motion-audit.md |
| — | `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | motion-audit.md |
| — | `--ease-linear` | `linear` | motion-audit.md |

> **Note on Pencil motion.** Pencil's animation system operates on individual frames (hover/state transitions); durations and easings are not canvas-level variables. They exist only in `tokens.css` / `tokens.json` and are consumed by EDS block CSS directly.

## Legacy Pencil variables (transitional)

The canvas still carries variables from the prior authoring session (`spacing-xs`, `spacing-sm`, ..., `font-size-2xl`, `color-text-brand`). These are:
- Value-equivalent to the normalized tokens (no semantic drift)
- Referenced by the first-built frames (Typography Scale, Buttons, Card/Default)
- Retained as transitional shims to avoid breaking existing frames

They will be removed in a follow-up migration (log entry DS-08) once all frames are migrated to the new naming scheme.

| Legacy Pencil variable | Equivalent normalized variable | Drop-by task |
|---|---|---|
| `spacing-xs` = 8 | `space-2` = 8 | DS-08 |
| `spacing-sm` = 16 | `space-4` = 16 | DS-08 |
| `spacing-md` = 24 | `space-6` = 24 | DS-08 |
| `spacing-lg` = 32 | `space-8` = 32 | DS-08 |
| `spacing-xl` = 48 | `space-12` = 48 | DS-08 |
| `spacing-2xl` = 64 | `space-16` = 64 | DS-08 |
| `spacing-3xl` = 96 | `space-24` = 96 | DS-08 |
| `font-size-2xl` = 32 | `font-size-xl` = 32 | DS-08 |
| `font-size-3xl` = 36 | — (dropped; 36 not in target scale) | DS-08 |
| `color-text-brand` = #182465 | `color-text-heading` = #182465 | DS-08 |
| `font-family-secondary` = Arial | — (dropped; fallback is in primary stack) | DS-08 |
