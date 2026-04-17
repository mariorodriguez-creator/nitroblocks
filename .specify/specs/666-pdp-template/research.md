# Research: PDP Template (666)

**Feature**: PDP Template  
**Branch**: `f/666-pdp-template`  
**Date**: 2026-04-16

Phase 0 resolves implementation unknowns before `data-model.md` / `quickstart.md`. Sources: `spec.md`, `design.md`, existing `nitroblocks` blocks, Block Collection docs, constitution.

---

## R-001 — Block Collection vs net-new

**Decision**: Add **carousel**, **accordion**, and **video** from the [AEM Block Collection](https://www.aem.live/developer/block-collection). Implement **product-detail** as a new local block. Extend Collection blocks only via project variants (`carousel` + `product`, `accordion` + `faq`) and scoped CSS/JS.

**Rationale**: Spec NFR-004 requires Collection reuse. Maintenance and accessibility patterns stay aligned with Adobe defaults.

**Alternatives considered**: Build carousel/accordion from scratch — rejected (higher risk, duplicates a11y behaviour).

---

## R-002 — Hero auto-block vs product-detail

**Decision**: Update `buildHeroBlock` in `scripts/scripts.js` so PDP pages do **not** synthesize a hero when the main content is already a Product Detail layout. Use **either** `body` class `pdp` (from `<meta name="template" content="pdp">` in authored pages) **or** presence of `.product-detail` in `main` before hero runs — prefer **template meta** as primary signal per spec; `.product-detail` as a safe fallback for drafts without meta in `head`.

**Rationale**: Spec: product-detail replaces hero role; accidental hero + product-detail breaks layout and LCP.

**Alternatives considered**: Rely only on template meta — rejected for local `.plain.html` drafts where global `head.html` may not include page-specific meta.

---

## R-003 — Typography (Santral vs Roboto)

**Decision**: **Phase 1 implementation** maps PDP visuals to existing project tokens (`--heading-font-family`, `--body-font-family`) per `design.md` CSS Skeleton. Treat live-site **Santral** as reference-only; licensing or adding Santral is a **separate product decision**.

**Rationale**: Constitution and project already standardise on Roboto stack; `design.md` documents the delta explicitly.

**Alternatives considered**: Block implementation until Santral is licensed — rejected (blocks implementation without changing the spec).

---

## R-004 — “Read more” / “Read less” strings

**Decision**: Toggle labels MUST come from **Placeholders** (`readMore`, `readLess` keys) per FR-002. Implementation loads via the same placeholder mechanism the project uses elsewhere (e.g. `fetchPlaceholders` / spreadsheet); if keys are missing during dev, use **empty fallback only in local dev** behind a single documented guard — not user-facing hard-coded English in production paths.

**Rationale**: Spec clarification session locked EN/FR via Placeholders.

**Alternatives considered**: Hard-code English — rejected (violates FR-002 / constitution on strings).

---

## R-005 — Gallery behaviour (mobile swipe, single image)

**Decision**: Match `design.md` and spec edge cases: thumbnail strip + prev/next always present; swipe on touch where the base implementation allows; keyboard-operable controls; first gallery image **eager** load, others **lazy** (NFR-001).

**Rationale**: AC1, AC7, and edge-case clarifications.

**Alternatives considered**: Hide controls for single image — rejected (spec says keep chrome, dim/disable).

---

## R-006 — Video column and failure mode

**Decision**: Use Block Collection **video** inside the columns cell (autoplay, loop, muted). On load failure, decoration leaves text column full width and removes or collapses the video cell per edge case — exact DOM strategy follows `building-blocks` / Collection video behaviour.

**Rationale**: FR-006 and spec edge case.

---

## R-007 — Fragment path and missing fragment

**Decision**: Draft PDP references `/drafts/dev/fragments/newsletter-signup`. Production uses the same fragment path pattern under the site root (e.g. `/fragments/newsletter-signup`). `fragment.js` already fetches `{path}.plain.html`; invalid path → implementer ensures block renders empty section (spec edge case).

**Rationale**: Matches existing `blocks/fragment/fragment.js` contract.

---

## R-008 — FAQ section heading

**Decision**: Place an authored **H2** (e.g. “FAQ”) as **default content in the same section** before the `accordion faq` block, unless variant JS is later extended to inject the heading (not required by spec).

**Rationale**: AC3 requires a section heading above questions; Collection accordion may not add it by default.

---

## Status

All items above are **resolved**; no `NEEDS CLARIFICATION` remains for plan/tasks phases.
