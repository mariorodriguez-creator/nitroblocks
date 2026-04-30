# Normalization Log — zonnic.ca Design System

Chronological record of every material decision in the normalization of the raw designlang extraction. Each entry is evidence-based and links to the source audit.

## 2026-04-29 — DS-00 — Build from planner outputs (discovery skipped)

**Change:** Kicked off design-system normalization without running `migration-discovery` first. Working directly from `./migration-work/proposal/` outputs (planner) and `./migration-work/design-extract/` (raw designlang).
**Rationale:** Scope + timeline constraints for this session. The planner's `02-design-system-assessment.md` is the authoritative list of issues to resolve; discovery adjustments (if any) would refine but not contradict.
**Impact:** Any scope-of-atoms / scope-of-templates adjustment from a future discovery engagement will re-enter through `docs/component-audit.md` and `docs/atomic-map.md`.
**Links:** `./migration-work/proposal/02-design-system-assessment.md`, planner's `03-atomic-inventory.md`.

## 2026-04-29 — DS-01 — Warning state color derived

**Change:** Added `--color-state-warning: #c2410c` and `--color-state-warning-surface: #fff4e5` as derived tokens (no source value exists in the raw palette).
**Rationale:** System needs a warning state for consent / legal / age-gate flows. `#c2410c` passes AA 4.5:1 on white (5.05) and 3:1 on black (4.16). The mint green accent was already claimed by CTA; the error red claimed for destructive actions. A distinct amber-orange fills the warning slot without collision.
**Impact:** CSS tokens, JSON tokens, Pencil variables. Flagged in audit for design sign-off.
**Links:** `docs/color-audit.md §C7`, `tokens/tokens.css` `--color-state-warning`.

## 2026-04-29 — DS-02 — Font weight assumption (Santral weight files)

**Change:** Locked typography weights to `400 / 700 / 800` in `tokens/tokens.css`. Dropped 100, 300, 500, 600, 900 from the system.
**Rationale:** Source audit shows 8 declared weights, but design-language.md counts suggest 100 (6 uses) and 900 (8 uses) are browser-synthesized faux weights. Weight 300 dominates (6 733 uses) but is suspected to be rendered by a fallback (Arial) when no Santral 300 file exists. Since Santral ships only a subset of weights in typical licensing, `400 / 700 / 800` is the safe minimum for a sans-display typeface.
**Open action:** verify with the client which Santral weight files are licensed and hosted. If `300` is available, a `--font-weight-light: 300` token can be reintroduced for display-only use (see normalization-log item when resolved).
**Links:** `docs/typography-audit.md §Font-file validation (Santral)`.

## 2026-04-29 — DS-03 — Self-host Santral WOFF2

**Change:** Target `tokens/tokens.css` declares `--font-family-primary` with `'Santral'` as the first family, followed by a system fallback stack.
**Rationale:** Zero second-origin font requests before LCP. Client must provide Santral WOFF2 files; the site will use `@font-face` with `font-display: swap` and the aem.live font-fallback technique.
**Impact:** Client-provided asset dependency. Self-hosted files go into `fonts/` in the EDS repo. `head.html` stays clean (no preload).
**Links:** `docs/typography-audit.md`; `AGENTS.md §Web Performance / Fonts`.

## 2026-04-29 — DS-04 — Remove Font Awesome, replace with inline SVG

**Change:** `Font Awesome 5 Free` is dropped from the font family set. All icons will be authored as inline SVGs in `icons/` and consumed via `decorateIcons()`.
**Rationale:** Font Awesome adds ~90KB minimum for a glyph font, has a10y quirks, and is incompatible with the EDS buildless / CSS-first philosophy. Inline SVGs respect `currentColor` and inherit design tokens automatically.
**Impact:** Migration scope — each `bat-icon` usage must be replaced with `:icon-name:` authored references + an SVG file in `icons/`.
**Links:** `docs/typography-audit.md`.

## 2026-04-29 — DS-05 — Spacing grid base 4px (not 8px)

**Change:** Adopted **4 px** as the spacing grid base. Final scale is sparse (19 steps, `space-0` through `space-80`).
**Rationale:** 4 px produces smaller deltas when snapping raw values; 13 of 18 raw values snap to 4 px grid with ≤ 2px delta. 8 px would force larger snaps (up to 6 px) for several mid-range values. EDS `styles.css` conventions also align with 4 px.
**Impact:** Spacing tokens are named `--space-N` where N = value/4 (e.g., `--space-8` = 32 px).
**Links:** `docs/spacing-audit.md §Grid Base Selection`.

## 2026-04-29 — DS-06 — Pencil variable aliasing limitation

**Change:** In the Pencil canvas, `color-surface-inverse`, `color-surface-inverse-deep`, `color-text-heading`, `color-text-link`, `color-border-subtle`, `color-state-info`, and `color-text-link-hover` are set to **literal hex values**, not aliases. In `tokens.css`, the same tokens are defined as `var(--...)` aliases.
**Rationale:** Pencil MCP `set_variables` accepts only primitive types (`color`, `number`, `string`) — no `reference` type. A Pencil variable cannot point to another Pencil variable. Therefore the canvas maintains one-to-many duplication for aliased colors.
**Impact:** Propagation test confirms — changing `color-brand-primary` in the canvas updates elements that reference `$color-brand-primary` directly, but does NOT update elements referencing `$color-surface-inverse` (which holds a literal, equal hex). **Process rule:** when updating a brand color in Pencil, update all aliases simultaneously. Document the aliasing in `token-mapping.md`.
**Workaround:** for EDS consumers, always use the aliased `var(--color-surface-inverse)` etc. — the CSS tokens carry the real alias.
**Links:** `token-mapping.md`, `docs/component-audit.md`.

## 2026-04-29 — DS-07 — Canvas variable reset from legacy to normalized

**Change:** Overwrote Pencil canvas variables with the audited token set. Added 25+ new variables (brand-accent, text-heading, text-primary at #000 vs prior #2f2f2f, surface-raised swapped with surface-sunken, state-success changed from #2e7d32 → #4cae04, etc.). Legacy variables (spacing-xs through 3xl, font-size-2xl/3xl, color-text-brand) retained as transitional shims.
**Rationale:** Variables were set by an earlier authoring session without an audit trail. The audit now establishes evidence-based values. The existing canvas frames (Typography Scale, Buttons, Card/Default, O1–O5 organisms, T1 Homepage) still render because the legacy shims point to compatible values, but new frames use the normalized names.
**Impact:** Canvas renders without visible breakage. Follow-up DS-08 needed to remove legacy shims once all frames are migrated.
**Links:** `token-mapping.md §Legacy Pencil variables`.

## 2026-04-29 — DS-08 — Legacy variable cleanup (deferred)

**Change:** Legacy variables listed in `token-mapping.md §Legacy Pencil variables (transitional)` will be removed in a follow-up task after all frames reference the normalized names.
**Rationale:** Removing legacy variables now would break the existing frames (Buttons, Input, Card, etc.). Safer to migrate frame-by-frame and remove in a batch.
**Open task:** assign in `migration-site-build` Phase-entry checklist. Script: read canvas with `batch_get`, find all `$spacing-*` / `$font-size-2xl` / `$color-text-brand` references, replace with normalized names, then `set_variables` to delete the legacy keys.
**Links:** `token-mapping.md`.

## 2026-04-29 — DS-09 — Phase 2 canvas scope (complete + deferred items)

**Change:** Phase 2 deliverable Pencil canvas includes:
- **Foundations** (pre-existing from prior session, re-anchored to new variables): Typography Scale, Color Palette, Spacing Scale, Shadows + Radii
- **Atoms (reusable):** Button/Primary, Button/Secondary, Button/Ghost (pre-existing); Input/Default (pre-existing); Badge/Default, Badge/Success, Badge/Warning, Badge/Error, Badge/Info (added)
- **Molecules (reusable):** Card/Default, CTA Group, Media-Text Pair (pre-existing); FormField/Default, FormField/Error (added); BlurbCard/Default (added); BlogCard/Default (added)
- **Organisms (3 breakpoints each):**
  - Pre-existing: O1 Header, O2 Hero, O3 Cards 3-up (generic), O4 CTA Section, O5 Footer
  - Added: O6 Announcement Bar, O7 FAQ, O8 Signup Form, O14 Blog Card List, O22 Store Locator
- **Templates:** T1 Homepage (pre-existing); T3 Blog Article (added, all 3 breakpoints)

**Deferred to `migration-site-build` Phase 3 (will be added to canvas in parallel with EDS block build):**
- Organism frames: O4 Age Gate, O5 Location Selector, O6 Modal, O7 Login Form, O9 Password Reset Form, O10 Minicart (commerce — pending decision), O11 Hero variants (dark/split/centered/image-right), O12 Masthead Card, O13 Blurb Card organism (reusable exists), O15 Contact Card, O16 CTA Band, O18 Product Carousel, O19 Tabbed Carousel, O20 Product Hero, O21 Product Card, O23 Text (box variant)
- Templates: T2 Content Page, T4 Newsletter, T5 PDP, T6 Store Locator, T7 Contact Us
- Additional atoms: Checkbox, Radio, Switch/Toggle, Divider, Tooltip (molecule-level missing)

**Rationale:** Delivering a representative scope (25 foundation + atom + molecule frames, 5 organisms × 3 breakpoints, 1 template × 3 breakpoints) proves the end-to-end composition chain and token propagation. Remaining organisms follow the same patterns and will be built just-in-time during Phase 3 when their content models are finalized.

**Impact:** Design-system deliverable is ready for stakeholder review and Phase 3 block implementation. The `migration-site-build` skill reads this normalization log to know which organisms are canvas-ready vs. to-be-extended.

## 2026-04-29 — DS-10 — Propagation test outcome

**Change:** Executed a propagation test — temporarily set `color-brand-primary` to `#B91C1C` (red) and screenshotted template T3 Blog Article Desktop. Reverted.
**Outcome:**
- **Propagated correctly:** logo text, nav active item, category eyebrow, blog-card meta "Education" tag — all turned red as expected.
- **Did NOT propagate:** `color-surface-inverse` (footer bg), `color-text-heading` (article title), `color-text-link` (blog card "Read article →"). These use literal hex values in Pencil per DS-06.
- **CSS export is correct:** the `tokens.css` `--color-surface-inverse: var(--color-brand-primary-hover)` alias WOULD propagate the change when loaded in a browser. The canvas-only divergence is documented in DS-06.

**Rationale:** Validates that the intended propagation chain — variables → atoms (via `$` bindings) → molecules (via `ref` to atoms) → organisms (via `ref` to molecules) → templates (via `ref` to organisms) — works for the direct chain. Alias-chain propagation is a known Pencil limitation.
**Impact:** Future design updates to brand color require updating all aliases in Pencil simultaneously; the CSS export handles aliasing natively.
**Links:** `docs/component-audit.md`, `token-mapping.md`.

## 2026-04-29 — DS-11 — Source-of-truth contract

**Change:** Established the source-of-truth hierarchy for the design system:
1. `design-system.pen` (Pencil canvas) — authoritative design representation
2. `tokens/tokens.css` — EDS-consumable export; can be regenerated from Pencil via `get_variables`
3. `docs/*-audit.md` — decisions and rationale (not values)
4. `./migration-work/design-extract/` — frozen historical evidence (never edited)

**Rule:** when a value conflict arises, `design-system.pen` wins for design intent; `tokens.css` is regenerated to match. Audit docs are updated to explain new decisions before the values change. `design-extract/` is never touched.
**Rationale:** Aligns with the skill's stated source-of-truth hierarchy and prevents value drift between design and engineering outputs.
**Impact:** All downstream skills (`migration-site-build`, `migration-validate`) consume `tokens.css` + `tokens.json`. Authors of EDS blocks should never read `design-extract/` directly for token values — only `tokens/tokens.css`.

## Audit debt / open items carry-over

Items flagged for future attention that did not result in a token change in this session:

| ID | Description | Owner | Blocker |
|---|---|---|---|
| DS-02 | Verify Santral weight files (400/700/800 assumption) | Design review | Client asset drop |
| DS-03 | Self-host Santral WOFF2 | Engineering | Client asset drop |
| DS-04 | Replace Font Awesome with inline SVGs | Engineering | Discover all bat-icon usages |
| DS-08 | Remove legacy Pencil variables | Design engineer | All frames migrated to normalized names |
| DS-09 | Complete remaining organisms + templates in Pencil canvas | Design engineer | Done during `migration-site-build` |
| — | Commerce scope decision (minicart / product-hero / product-card) | Product | Client business call |
