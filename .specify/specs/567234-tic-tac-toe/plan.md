# Implementation Plan: Tic-Tac-Toe Block

**Branch**: `f/567234-tic-tac-toe` | **Date**: 2026-03-25 | **Spec**: `specs/567234-tic-tac-toe/spec.md`
**Input**: Feature specification from `/specs/567234-tic-tac-toe/spec.md`

## Summary

New interactive Tic-Tac-Toe block that renders a playable game from a minimal authored content model (single-row title + difficulty variant). The block implements minimax AI with configurable difficulty, a game timer, session score tracking, and full keyboard/screen-reader accessibility — all in vanilla JS/CSS with no dependencies.

## Project Context *(mandatory)*

**Language/Version**: Vanilla JavaScript (ES6+), CSS3, HTML5 — no transpiling, no build steps
**Primary Dependencies**: AEM Edge Delivery Services (aem.live CDN), AEM CLI (`@adobe/aem-cli`), ESLint (Airbnb), Stylelint
**Content Source**: Local HTML drafts for development; CMS (Google Drive / SharePoint / DA) for PR validation
**Testing**: ESLint + Stylelint (mandatory), PageSpeed Insights (mandatory), Playwright (recommended for interactive game logic)
**Target Platform**: AEM Edge Delivery Services — Preview (.aem.page) and Live (.aem.live) environments
**Project Type**: Buildless EDS site (blocks/, styles/, scripts/)
**Performance Goals**: Lighthouse 100 (mobile + desktop), LCP < 1560ms, CLS ≈ 0, eager payload < 100 KB
**Constraints**: Three-phase loading (E-L-D), block-scoped CSS, no frameworks in LCP path, WCAG 2.2 AA, backward-compatible content models
**Scale/Scope**: 1 new block (tic-tac-toe), 0 global file changes, test content in `/drafts/tic-tac-toe/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with AEM Edge Delivery Services Constitution (v1.0.0):

### Core Principles
- [x] **Code Quality (Principle I)**: Vanilla JS/CSS only. All CSS scoped to `.tic-tac-toe`. ESLint/Stylelint configured. No frameworks, no transpiling.
- [x] **Performance & Optimization (Principle II)**: Block loads in lazy phase. Minimax on 3×3 grid completes in <1ms — no TBT impact. Google Font loaded via `loadCSS()` in decorate, not in eager phase. No second-origin connections before LCP unless block is in first section (unlikely per design). Block CSS + JS well under 20 KB each.
- [x] **Security (Principle III)**: No user input rendered as HTML (all via `textContent` and DOM APIs). No secrets. No third-party scripts. `loadCSS()` for Google Fonts is same-origin–safe.
- [x] **Accessibility (Principle IV)**: Grid cells are `<button>` elements (native keyboard access). `aria-label` on every cell with dynamic state. `aria-live="polite"` region for game outcomes. Visible focus indicators via `:focus-visible`. High contrast text on dark background. Minimum 44×44px touch targets.
- [x] **Maintainability (Principle V)**: Self-contained block in `blocks/tic-tac-toe/`. No changes to `aem.js` or global scripts. Content model is simple (1 row, 1 column + variant). Backward-compatible (new block, no existing content affected).
- [x] **Testing (Principle VI)**: Linting will pass. Preview URL available for PSI checks. Interactive logic warrants Playwright tests for game flow, keyboard nav, and multi-instance isolation.
- [x] **Specification-Driven Development (Principle VII)**: Spec complete. Draft content created before coding. Content model defined in data-model.md and reviewed.
- [x] **Observability (Principle VIII)**: RUM enabled at project level (AEM built-in). Block uses `try/catch` for error resilience. CWV targets defined in constitution (LCP < 1560ms).

**No violations identified.**

## Project Structure

### Documentation (this feature)

```text
specs/567234-tic-tac-toe/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 content model
├── quickstart.md        # Phase 1 integration + test scenarios
└── tasks.md             # Phase 2 output (speckit-tasks — NOT created by speckit-plan)
```

### Source Code (repository root)

```text
blocks/tic-tac-toe/
├── tic-tac-toe.js       # Block decoration + minimax game logic
└── tic-tac-toe.css      # Scoped styles, dark palette, animations

drafts/tic-tac-toe/
└── tic-tac-toe.plain.html  # Local test content for dev server
```

**Files to Create**:
- `blocks/tic-tac-toe/tic-tac-toe.js` (new)
- `blocks/tic-tac-toe/tic-tac-toe.css` (new)
- `drafts/tic-tac-toe/tic-tac-toe.plain.html` (new — test content)

**Files to Modify**: None. No changes to global styles, scripts, or configuration.

## Complexity Tracking

> No constitution violations identified. Table left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
