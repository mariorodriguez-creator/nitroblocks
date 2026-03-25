# Research: Tic-Tac-Toe Block

**Feature Branch**: `f/567234-tic-tac-toe`
**Date**: 2026-03-25

## R1: Minimax Algorithm — Performance on 3×3 Grid

**Decision**: Implement standard minimax without alpha-beta pruning.

**Rationale**: A 3×3 tic-tac-toe grid has a maximum game-tree size of ~255,168 terminal states (with symmetry, far fewer in practice). Modern browsers evaluate this in under 1ms. Alpha-beta pruning is unnecessary and adds complexity for zero perceptible benefit. The minimax function will be a simple recursive function operating on a 9-element array.

**Alternatives considered**:
- Alpha-beta pruning: Rejected — unnecessary optimization for trivially small search space.
- Lookup table: Rejected — larger code size, harder to maintain, and provides no UX improvement.
- Web Worker: Rejected — computation is sub-millisecond; offloading to a worker adds latency and complexity for no benefit.

## R2: Difficulty Mixing Strategy

**Decision**: Use probability-based mixing at move selection time. On each AI turn, generate a random number [0, 1). If below the threshold, compute the minimax-optimal move; otherwise, pick a random empty cell.

**Rationale**: This approach is simple, stateless, and produces natural-feeling gameplay variation. The probability thresholds (easy: 30% optimal, medium: 60% optimal, hard: 100% optimal) come directly from the spec.

**Alternatives considered**:
- Depth-limited minimax: Rejected — on a 3×3 grid, limiting depth doesn't meaningfully change difficulty; moves still tend toward optimal.
- Pre-computed move tables per difficulty: Rejected — adds code size without improving UX.

## R3: Font Loading Strategy for Block-Scoped Display Font

**Decision**: Load a Google Font via `loadCSS()` in the block's `decorate()` function. Define a local fallback `@font-face` in the block CSS to prevent CLS.

**Rationale**: The block loads in the lazy phase (not first section), so loading a font here does not affect LCP or the eager-phase budget. Using `loadCSS()` from `aem.js` is the established EDS pattern for deferred CSS loading. The font-fallback technique (a local `@font-face` with `size-adjust`) ensures text renders immediately with the fallback and swaps seamlessly when the web font loads.

**Font choice**: Orbitron (Google Fonts) — a geometric, futuristic display font with sharp edges and bold character that matches the "sleek / modern / architectural" aesthetic. Fallback: `Arial` with `size-adjust`.

**Alternatives considered**:
- `@import` in CSS: Rejected — render-blocking.
- Inline `@font-face` with external URL: Rejected — equivalent to preloading which is prohibited before LCP (though moot for lazy-phase blocks, `loadCSS()` is the canonical EDS pattern).
- Using project's existing fonts (Roboto Condensed): Rejected — spec explicitly calls for a "distinctive display font" different from generic choices.

## R4: Block-Scoped Dark Color Palette

**Decision**: Define all block colors as CSS custom properties scoped to `main .tic-tac-toe`. The block uses its own dark palette independent of site tokens.

**Rationale**: The spec explicitly requires a "self-contained dark palette" independent of the site's global tokens. Scoping custom properties to the block selector ensures zero style leakage and allows the block to maintain visual integrity regardless of the surrounding page theme.

**Custom property naming**: Prefix all with `--ttt-` (e.g., `--ttt-bg`, `--ttt-accent-x`, `--ttt-accent-o`) per the CSS guidelines recommendation to prefix block-private variables with the block name.

**Alternatives considered**:
- Using site tokens with overrides: Rejected — spec requires independence from global tokens.
- Hardcoded color values without custom properties: Rejected — less maintainable, harder to theme.

## R5: CSS-Only Animations

**Decision**: Use CSS `@keyframes` and `transition` for all animation effects. No JavaScript animation libraries or `requestAnimationFrame` loops.

**Rationale**: The spec requires mark placement animation (~150ms scale), AI thinking pulse, win highlight, and outcome fade-in — all achievable with CSS transitions and keyframes. CSS animations are GPU-accelerated and have zero main-thread impact, which aligns with the performance requirements.

**Implementation approach**:
- Mark placement: `transform: scale(0) → scale(1)` with `ease-out`, ~150ms.
- AI thinking: `@keyframes` pulse on the target cell (opacity oscillation), applied via a `.thinking` class.
- Win highlight: Overlay pseudo-element with a strike-through line using `transform: scaleX(0) → scaleX(1)`, or a glow effect on the three winning cells.
- Outcome message: `opacity: 0 → 1` transition, ~200ms.
- Play Again reset: Staggered `transition-delay` on cells for sequential fade-out.

**Alternatives considered**:
- GSAP or anime.js: Rejected — third-party library dependency, violates NFR-006.
- `requestAnimationFrame` in JS: Rejected — more complex, higher main-thread cost for effects achievable in CSS.

## R6: Accessibility — Grid Keyboard Navigation

**Decision**: Implement grid cells as `<button>` elements within the block. Use `aria-label` on each cell to describe its state. Add an `aria-live="polite"` region for game outcome announcements.

**Rationale**: Buttons are natively keyboard-accessible (focusable, activatable with Enter/Space). Using `<button>` instead of `<div>` with `tabindex` gives us focus management, `:focus-visible` styling, and assistive technology semantics for free. An ARIA live region ensures screen readers announce game outcomes and AI moves.

**Keyboard pattern**: Standard linear tab navigation through the 9 cells. Arrow key navigation within the grid is a nice-to-have but not required by WCAG for a flat list of buttons. Tab order follows DOM order (left-to-right, top-to-bottom).

**Alternatives considered**:
- `role="grid"` with arrow key navigation: Rejected — overkill for a 3×3 grid; adds implementation complexity. Could be added as a future enhancement.
- `<div>` with `tabindex` and `role="button"`: Rejected — re-invents what `<button>` provides natively.

## R7: Multiple Independent Instances

**Decision**: All game state (board array, timer ID, score counters, current player) lives in local variables within the `decorate()` function closure. No module-level or global state.

**Rationale**: Each block instance on a page gets its own `decorate()` call, creating a unique closure. This naturally isolates state between instances without any additional mechanism.

**Alternatives considered**:
- `WeakMap` keyed by block element: Rejected — unnecessarily complex when closure-scoped state suffices.
- Data attributes on the DOM: Rejected — game state (board array, scores) doesn't map well to string attributes.

## R8: Block Collection / Block Party References

**Decision**: No directly applicable references found. Build from scratch.

**Rationale**: Searched Block Party for "game", "interactive", "engagement" — 0 results. No game or interactive entertainment blocks exist in the Block Collection or Block Party repositories. The standard block patterns (cards, accordion, carousel) don't apply to an interactive game. The block architecture (decorate function, scoped CSS, DOM manipulation) is the same; only the internal logic is unique.

**Patterns borrowed from existing blocks**:
- `cards` block: Pattern for iterating over block children and replacing with semantic elements.
- General block architecture: `export default function decorate(block)`, block-scoped CSS, variant handling via `block.classList.contains()`.
