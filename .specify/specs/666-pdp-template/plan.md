# Implementation Plan: PDP Template

**Branch**: `f/666-pdp-template` | **Date**: 2026-04-16 | **Spec**: `.specify/specs/666-pdp-template/spec.md`  
**Design**: `.specify/specs/666-pdp-template/design.md`  
**Input**: Feature specification (PDP template for Zonnic migration)

## Summary

Deliver the Product Detail Page template: new **`product-detail`** block (gallery, expandable description, buy panel, CTAs), Block Collection integrations **`carousel` + `product`**, **`accordion` + `faq`**, **`video`**, plus existing **`columns`**, **`fragment`**, **`header`**, **`footer`**. Wire template behaviour in `scripts.js` (hero suppression / PDP identification per `research.md`). Use `design.md` for all layout/CSS skeleton decisions; use `spec.md` for functional MUSTs. Local validation uses `drafts/dev/pdp-spearmint.plain.html` and newsletter fragment draft.

## Project Context *(mandatory)*

**Language/Version**: Vanilla JavaScript (ES6+), CSS3, HTML5 — no transpiling, no build steps  
**Primary Dependencies**: AEM Edge Delivery Services (aem.live CDN), AEM CLI (`@adobe/aem-cli`), ESLint (Airbnb), Stylelint  
**Content Source**: Google Docs / SharePoint / Document Authoring (per site CMS — author workflow described in spec)  
**Testing**: ESLint + Stylelint (mandatory), PageSpeed Insights (mandatory for PRs), browser validation on draft URL  
**Target Platform**: AEM Edge Delivery Services — Preview (`.aem.page`) and Live (`.aem.live`)  
**Project Type**: Buildless EDS site (`blocks/`, `styles/`, `scripts/`)  
**Performance Goals**: Lighthouse 100 (mobile + desktop), LCP &lt; 1560ms, CLS ≈ 0, eager payload &lt; 100 KB  
**Constraints**: Three-phase loading (E-L-D), block-scoped CSS, no frameworks in LCP path, WCAG 2.2 AA, backward-compatible content models  
**Scale/Scope**: 1 new local block, 3 Block Collection blocks with variants/additions, 1 scripts.js behaviour update, global tokens/CSS as needed per `design.md`; all product variant PDPs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with AEM Edge Delivery Services Constitution (v1.0.0):

### Core Principles

- [x] **Code Quality (Principle I)**: Vanilla JS/CSS, ESLint/Stylelint, scoped block CSS
- [x] **Performance & Optimization (Principle II)**: First gallery image eager, remainder lazy; video in lazy phase; third-party only delayed
- [x] **Security (Principle III)**: No secrets in client; author content only; partner links authored
- [x] **Accessibility (Principle IV)**: Keyboard + ARIA for gallery, accordion, description toggle (per spec + Collection defaults)
- [x] **Maintainability (Principle V)**: Collection blocks reused; `aem.js` unchanged
- [x] **Testing (Principle VI)**: Lint + manual/CLI check on draft path; PSI on preview URL for PR
- [x] **Specification-Driven Development (Principle VII)**: `data-model.md` + draft HTML in `drafts/dev/` before implementation
- [x] **Observability (Principle VIII)**: No change to RUM strategy in this plan; follow project defaults

**If any principle cannot be met**, document justification in Complexity Tracking section below — *none for this feature*.

## Project Structure

### Documentation (this feature)

```text
specs/666-pdp-template/
├── plan.md              # This file
├── spec.md
├── design.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements-readiness-check.md
├── page-styles/
│   ├── styles-report.json
│   └── styles-summary.md
└── tasks.md             # Phase 2: /speckit-tasks (not created by speckit-plan)
```

**design.md** (present): Block CSS MUST follow **CSS Skeleton** order (base → 600px → 900px → optional 1200px) and **`## Layout Matrix`** sections.

### Source Code (repository root)

```text
blocks/
├── product-detail/          # NEW
│   ├── product-detail.js
│   └── product-detail.css
├── carousel/                # FROM Block Collection + project variant product
│   ├── carousel.js
│   └── carousel.css
├── accordion/
│   ├── accordion.js
│   └── accordion.css
├── video/
│   ├── video.js
│   └── video.css
├── columns/                 # EXTEND if PDP-specific tweaks required
├── fragment/
├── header/
└── footer/

styles/
├── styles.css               # Token updates only if approved (see design.md)
└── lazy-styles.css

scripts/
├── scripts.js               # buildHeroBlock / template PDP guard; any auto-block helpers
├── delayed.js
└── aem.js                   # NEVER MODIFY

icons/                       # NEW SVGs only if design requires (e.g. gallery chevrons — prefer CSS/unicode per design)

drafts/dev/
├── pdp-spearmint.plain.html
└── fragments/
    └── newsletter-signup.plain.html
```

**Files to Create/Modify**

| Action | Path |
|--------|------|
| Create | `blocks/product-detail/product-detail.js`, `product-detail.css` |
| Add (Collection) | `blocks/carousel/*`, `blocks/accordion/*`, `blocks/video/*` from Block Collection baseline, then project variants |
| Modify | `scripts/scripts.js` — PDP / hero guard per `research.md` R-002 |
| Modify | `styles/styles.css` or `lazy-styles.css` — only for shared tokens/section styles per `design.md` (e.g. newsletter, testimonial-teaser, centred range intro) |
| Create | `drafts/dev/pdp-spearmint.plain.html`, `drafts/dev/fragments/newsletter-signup.plain.html` |
| Configure | Placeholders spreadsheet (or project equivalent): keys `readMore`, `readLess` |

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitution violations requiring justification.*
