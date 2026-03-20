# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `speckit-plan` skill.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Project Context *(mandatory)*

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the spec. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Vanilla JavaScript (ES6+), CSS3, HTML5 — no transpiling, no build steps  
**Primary Dependencies**: AEM Edge Delivery Services (aem.live CDN), AEM CLI (`@adobe/aem-cli`), ESLint (Airbnb), Stylelint  
**Content Source**: [SharePoint / Google Drive / da.live — or NEEDS CLARIFICATION]  
**Testing**: ESLint + Stylelint (mandatory), PageSpeed Insights (mandatory), Playwright/Puppeteer (optional for complex interactions)  
**Target Platform**: AEM Edge Delivery Services — Preview (.aem.page) and Live (.aem.live) environments  
**Project Type**: Buildless EDS site (blocks/, styles/, scripts/)  
**Performance Goals**: Lighthouse 100 (mobile + desktop), LCP < 1560ms, CLS ≈ 0, eager payload < 100 KB  
**Constraints**: Three-phase loading (E-L-D), block-scoped CSS, no frameworks in LCP path, WCAG 2.2 AA, backward-compatible content models  
**Scale/Scope**: [e.g., number of blocks, affected pages/templates, or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with AEM Edge Delivery Services Constitution (v1.0.0):

### Core Principles
- [ ] **Code Quality (Principle I)**: Will code use vanilla JS/CSS, pass ESLint/Stylelint, and scope all CSS to blocks?
- [ ] **Performance & Optimization (Principle II)**: Will Lighthouse remain at 100? Does design respect three-phase loading and the < 100 KB eager budget? (NON-NEGOTIABLE)
- [ ] **Security (Principle III)**: Are all user inputs sanitized? No secrets in client-side code? Third-party scripts in delayed phase only?
- [ ] **Accessibility (Principle IV)**: Will UI meet WCAG 2.2 AA (semantic HTML, keyboard nav, ARIA states, contrast)?
- [ ] **Maintainability (Principle V)**: Is block architecture preserved? Are content models backward-compatible? Is aem.js unmodified?
- [ ] **Testing (Principle VI)**: Will linting pass? Is a preview URL available for PSI checks? Are browser tests needed? (NON-NEGOTIABLE)
- [ ] **Specification-Driven Development (Principle VII)**: Does draft content exist before coding? Is the content model designed and reviewed?
- [ ] **Observability (Principle VIII)**: Is RUM enabled? Are CWV field data targets defined? Is client-side error reporting in place?

**If any principle cannot be met**, document justification in Complexity Tracking section below.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md
├── design.md            # From /speckit figma-specify — includes Layout matrix + mobile-first CSS Skeleton
├── research.md          # Phase 0 output (speckit-plan skill)
├── data-model.md        # Phase 1 output (speckit-plan skill)
├── quickstart.md        # Phase 1 output (speckit-plan skill)
└── tasks.md             # Phase 2 output (speckit-tasks skill - NOT created by speckit-plan)
```

**design.md** (when present): Block CSS in implementation MUST follow the **CSS Skeleton** order (base → 600px → 900px) and match **`## Layout matrix (flex / grid)`**. Template: `.specify/templates/design-reference-template.md`.

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths.
-->

```text
# Block (one directory per block)
blocks/[blockname]/
├── [blockname].js                # Block JavaScript — export default function decorate(block) { ... }
└── [blockname].css               # Block CSS — all selectors scoped to .blockname

# Global styles (modify only if feature affects site-wide layout or tokens)
styles/
├── styles.css                    # Eager-phase global styles (LCP critical — keep minimal)
└── lazy-styles.css               # Lazy-phase global styles (below the fold)

# Core scripts (modify only if feature requires decoration or auto-blocking changes)
scripts/
├── scripts.js                    # Page decoration, auto-blocking, utility functions
├── delayed.js                    # Delayed-phase scripts (analytics, third-party tags)
└── aem.js                        # AEM library — NEVER MODIFY

# Icons (if feature introduces new icons)
icons/
└── [icon-name].svg               # Referenced via :icon-name: notation in authored content

# Test content (drafts for development, not deployed to production)
drafts/[developer]/
└── [test-page].html              # Local test content for AEM CLI dev server
```

**Files to Create/Modify**: [List specific files that will be created or modified for this feature]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., third-party library in lazy phase] | [current need] | [why vanilla JS alternative insufficient] |
| [e.g., eager payload exceeds 100 KB] | [current need] | [why decomposition not feasible] |
