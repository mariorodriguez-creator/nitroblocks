# Tasks: Tic-Tac-Toe Block

**Input**: Design documents from `.specify/specs/567234-tic-tac-toe/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md
**Complexity**: Standard (upper range) — single new block, no global file changes, but complex game logic and extensive CSS animations

## Format: `[Category-ID] [P?] Description with file path`

- **Category Prefixes**: BJ (Block JS), BC (Block CSS), CT (Content), TS (Testing), SC (Scaffolding), T (Setup)
- **[P]**: Can run in parallel (different files, no dependencies)

---

## Phase 1: Setup

**Purpose**: Verify test content and confirm block does not already exist

- [X] T001 Verify draft test content at `drafts/tic-tac-toe/tic-tac-toe.plain.html` covers all variants and edge cases (CDD Phase 2 gate)

---

## Phase 2: Foundation

**Purpose**: Scaffold the block directory so user story work can begin

- [X] SC001 Create block directory and files: `blocks/tic-tac-toe/tic-tac-toe.js` (exports `default function decorate(block)`) and `blocks/tic-tac-toe/tic-tac-toe.css` (scoped to `.tic-tac-toe`)

**Checkpoint**: Block structure ready — user story implementation can begin

---

## Phase 3: User Story — Tic-Tac-Toe Engagement Game

**Goal**: Deliver a fully playable Tic-Tac-Toe block with minimax AI, configurable difficulty, game timer, session score, and full accessibility

**Independent Test**: Load `http://localhost:3000/drafts/tic-tac-toe/tic-tac-toe` — verify all five block instances (default, easy, hard, no-title, invalid-option) render and play correctly

### Block JavaScript

**File**: `blocks/tic-tac-toe/tic-tac-toe.js`

- [X] BJ001 Implement `decorate(block)` with full game logic in `blocks/tic-tac-toe/tic-tac-toe.js`
  - Extract title from authored content row; omit `<h2>` if empty
  - Build decorated DOM: title, status bar (timer + score), 3×3 grid of `<button>` cells, outcome area (`aria-live="polite"`), Play Again button, SR announcement region
  - Implement minimax algorithm for AI move computation (`checkWinner`, `isDraw`, `minimax`, `getBestMove`)
  - Implement difficulty system: parse variant from `block.classList` (easy/medium/hard, default medium); mix optimal vs random moves per probability ratios (30%/60%/100%)
  - Add AI response delay scaled by difficulty (~200ms easy, ~400ms medium, ~700ms hard) with `.ttt-cell--thinking` class during delay
  - Implement game timer: starts on first visitor click, counts up in M:SS format, stops on game end
  - Implement session score counter (wins/losses/draws): accumulates across replays, resets on page reload
  - Implement win detection with `.ttt-cell--win` highlight on winning combo cells
  - Implement Play Again: reset board, timer, outcome; preserve score
  - Disable cells during AI turn; re-enable empty cells after AI responds
  - All state closure-scoped for multi-instance isolation (no module-level state)
  - ARIA: `aria-label` on each cell with dynamic position + state, `aria-live` region for outcomes, screen reader announcements for AI moves
  - Use `loadCSS()` from `aem.js` to load Orbitron Google Font in `decorate()`

### Block CSS

**File**: `blocks/tic-tac-toe/tic-tac-toe.css`

- [X] BC001 [P] Implement block styles and animations in `blocks/tic-tac-toe/tic-tac-toe.css`
  - Define block-scoped CSS custom properties on `main .tic-tac-toe` (`--ttt-bg`, `--ttt-accent-x`, `--ttt-accent-o`, `--ttt-accent-win`, etc.) — self-contained dark palette
  - Base layout: flex column, centered, dark background, `--ttt-radius` rounding
  - Title: Orbitron display font, uppercase, letter-spacing, `clamp()` sizing
  - Status bar: flex row, timer (monospace, tabular-nums) and score (colored per result type)
  - Grid: CSS Grid 3×3 with `--ttt-cell-size` and `--ttt-grid-gap`
  - Cells: dark card surfaces, hover state, `:focus-visible` outline, disabled cursor
  - X mark: two pseudo-elements rotated ±45° with `--ttt-accent-x` background
  - O mark: pseudo-element circle outline with `--ttt-accent-o` border
  - Win highlight: `box-shadow` glow with `--ttt-accent-win`
  - AI thinking: `@keyframes ttt-pulse` background oscillation
  - Mark placement: `@keyframes ttt-mark-in` scale(0)→scale(1) ~150ms ease-out
  - Outcome: opacity transition 0→1, display:none when `:empty`
  - Play Again button: pill shape, border, uppercase Orbitron, hover invert
  - SR-only helper class for screen reader announcements
  - Font fallback `@font-face` for Orbitron with `size-adjust`
  - Mobile-first responsive: base → `@media (width >= 600px)` → `@media (width >= 900px)` with `--ttt-cell-size` and padding scaling

### Content Validation

- [X] CT001 Verify all block variants render correctly on `localhost:3000/drafts/tic-tac-toe/tic-tac-toe`
  - Default (medium): game plays with ~400ms AI delay, 60/40 optimal/random
  - Easy: ~200ms delay, 30/70 mix
  - Hard: ~700ms delay, 100% optimal (unbeatable)
  - No title: grid renders without `<h2>`, fully playable
  - Invalid option (`extreme`): defaults to medium behavior
  - Multi-instance: each block has independent game state, timer, and score

**Checkpoint**: Block fully functional and testable on localhost:3000

---

## Final Phase: QA & Polish

**Purpose**: Verify quality, performance, accessibility before PR

### Linting (always required)

- [X] TS001 Run ESLint and fix violations: `npm run lint` — `blocks/tic-tac-toe/tic-tac-toe.js`
- [X] TS002 [P] Run Stylelint and fix violations: `npm run lint` — `blocks/tic-tac-toe/tic-tac-toe.css`

### Testing

- [ ] TS003 Browser test: verify interactive gameplay across breakpoints (Playwright or manual)
  - Play full game on each difficulty, verify win/lose/draw flows
  - Verify timer starts on first click, stops on game end
  - Verify Play Again resets correctly, score persists
  - Verify cells disabled during AI turn
  - Verify click on occupied cell has no effect
  - Test responsive: <600px (full-width grid), 600–899px (padded), ≥900px (max-width constrained)
  - Test multi-instance isolation

- [ ] TS005 Accessibility check: keyboard navigation, ARIA attributes, screen reader
  - Tab through cells, verify `:focus-visible` indicators
  - Activate cells with Enter/Space
  - Verify `aria-label` updates dynamically on cells (position + state)
  - Verify outcome announced via `aria-live` region
  - Verify minimum 44×44px touch targets at all breakpoints

- [X] TS006 Unit tests for logic-heavy helpers in `blocks/tic-tac-toe/tic-tac-toe.test.js`
  - `checkWinner()`: detect row/column/diagonal wins, return null for no winner
  - `isDraw()`: detect full board with no winner
  - `minimax()` + `getBestMove()`: verify optimal move selection on known board states
  - `getDifficulty()`: parse block classList → correct difficulty config, default to medium
  - `getAIMove()`: verify optimal vs random mixing respects probability threshold
  - `formatTime()`: verify M:SS formatting (0→"0:00", 65→"1:05", 600→"10:00")

**Checkpoint**: All quality checks passed — ready for PR

---

## Dependencies & Execution Order

```
T001 ──→ SC001 ──→ ┬── BJ001 ──┬── CT001 ──→ TS001 + TS002 + TS003 + TS005 + TS006
                    └── BC001 ──┘
```

### Parallel Opportunities

**Can run in parallel (different files):**
- BJ001 + BC001 (block JS and block CSS operate on different files)
- TS001 + TS002 (ESLint and Stylelint)

**Must run sequentially:**
- T001 → SC001 (verify content before scaffolding)
- SC001 → BJ001/BC001 (scaffold before decoration)
- BJ001 + BC001 → CT001 (implementation before content validation)
- CT001 → TS001–TS006 (all implementation complete before QA)

---

## Notes

- All game state is closure-scoped in `decorate()` — no module-level variables — to support multiple instances per page
- Minimax on 3×3 grid completes in <1ms; no performance concern
- Google Font (Orbitron) loaded via `loadCSS()` in `decorate()`, not imported in CSS — avoids render-blocking
- No changes to `scripts/scripts.js`, `scripts/aem.js`, `styles/styles.css`, or `head.html`
- Helper functions (`checkWinner`, `isDraw`, `minimax`, `getBestMove`, `getRandomMove`, `getDifficulty`, `formatTime`, `getAIMove`) must be exported or structured for unit test access (TS006)
