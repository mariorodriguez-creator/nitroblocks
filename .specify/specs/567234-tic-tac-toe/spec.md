# Feature Specification: Tic-Tac-Toe Block

**Feature Branch**: `f/567234-tic-tac-toe`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "Create a tic-tac-toe block with a title, game timer, minimax AI opponent, and configurable difficulty levels to keep users engaged on the site."

New interactive Tic-Tac-Toe block that allows authors to add a playable game to any page. The block features an author-defined title, a live game timer, and an AI opponent powered by the minimax algorithm. Authors can configure difficulty levels to tailor the challenge. The game is designed as an engagement tool to increase time-on-site.

## Project Context *(mandatory)*

**Scope**: New block

**Affected Pages/Sections**: Any page where the author places the Tic-Tac-Toe block. Expected use on engagement-focused pages (e.g., promotions, wait pages, entertainment sections, 404 pages).

**Content Approach**:
- Authors create a standard block table labeled "Tic Tac Toe" in their document-based authoring environment (Word, Google Docs, or da.live)
- The block contains a single content row with the game title
- Difficulty is selected via block option notation in the block name (e.g., "Tic Tac Toe (hard)")
- Draft content location: `/drafts/tic-tac-toe/`

**Existing Blocks/Patterns**:
- No existing blocks in this project are directly related to interactive games
- Existing blocks (cards, columns, hero, header, footer, fragment) provide reference for standard block architecture patterns
- No known Block Collection or Block Party references for game blocks; this is a custom implementation

## User Story & Testing *(mandatory)*

### User Story - Tic-Tac-Toe Engagement Game

As a **content author**,
I want to add an interactive Tic-Tac-Toe game to any page by creating a simple block table with a title and difficulty setting,
so that I can increase visitor engagement and time-on-site without needing developer assistance.

As a **site visitor**,
I want to play a Tic-Tac-Toe game against a computer opponent on the website,
so that I am entertained and stay engaged with the site.

**Context**:

The Tic-Tac-Toe block is an engagement feature designed to keep visitors on the site longer. Visitors always play as "X" and move first. The AI opponent ("O") uses the minimax algorithm, with difficulty levels controlling how optimally the AI plays. A visible timer tracks the duration of each game, reinforcing the sense of active engagement.

**User journey**:

Primary journey (visitor plays a game):
1. Visitor lands on a page containing the Tic-Tac-Toe block
2. Visitor sees the game title, an empty 3×3 grid, and a timer showing 0:00
3. Visitor clicks any cell on the grid to place their "X" mark; the timer starts
4. The AI opponent responds by placing an "O" mark (response speed is near-instant)
5. Visitor and AI alternate turns until one wins or the board is full
6. Game ends with a clear outcome message: win, loss, or draw
7. Timer stops and displays the total game duration
8. Visitor clicks a "Play Again" button to reset the board and timer for a new game

Secondary journey (author creates the block):
1. Author opens a page document in their authoring environment
2. Author creates a table with "Tic Tac Toe" as the block label, optionally adding a difficulty option (e.g., "Tic Tac Toe (hard)")
3. Author types the desired game title in the first row of the table
4. Author previews the page via Sidekick and sees the fully functional game

**Acceptance Criteria**:

AC1. **Block MUST render a playable 3×3 Tic-Tac-Toe grid with title and timer**
1. Block MUST display the author-defined title above the game grid
2. Block MUST render a 3×3 grid of clickable cells
3. Block MUST display a game timer that starts at 0:00 when the visitor makes the first move
4. Timer MUST count up in seconds (displayed as M:SS format) until the game ends

AC2. **Visitor MUST always play first as "X"**
1. The visitor MUST be assigned the "X" mark
2. The visitor MUST always take the first turn
3. Clicking an empty cell MUST place the visitor's "X" mark in that cell
4. Clicking an occupied cell MUST have no effect

AC3. **AI opponent MUST use the minimax algorithm with configurable difficulty**
1. The AI MUST respond after each visitor move by placing an "O" mark
2. On "hard" difficulty, the AI MUST play optimally using the full minimax algorithm (100% optimal moves; unbeatable)
3. On "medium" difficulty, the AI MUST select the optimal move 60% of the time and a random valid move 40% of the time
4. On "easy" difficulty, the AI MUST select the optimal move 30% of the time and a random valid move 70% of the time
5. If no difficulty is specified, the block MUST default to "medium"
6. The AI MUST introduce a brief artificial delay before placing its mark, scaled by difficulty: ~200ms (easy), ~400ms (medium), ~700ms (hard)

AC4. **Game MUST detect and communicate end-of-game states**
1. Block MUST detect when a player has three marks in a row (horizontal, vertical, or diagonal)
2. Block MUST detect when the board is full with no winner (draw)
3. Block MUST display a clear outcome message: "You win!", "You lose!", or "It's a draw!"
4. Block MUST visually highlight the winning combination when there is a winner
5. All remaining empty cells MUST become non-clickable when the game ends
6. Timer MUST stop when the game ends

AC5. **Block MUST provide a way to restart the game and track session score**
1. A "Play Again" button MUST appear after the game ends
2. Clicking "Play Again" MUST reset the grid to empty, clear the outcome message, and reset the timer to 0:00
3. The visitor MUST take the first turn again after restart
4. Block MUST display a session score counter showing wins, losses, and draws (e.g., "Wins: 1 / Losses: 0 / Draws: 2")
5. The score counter MUST persist across replays within the same page visit
6. The score counter MUST reset when the page is reloaded

AC6. **Block MUST be authored via standard document table structure**
1. Authors MUST be able to create the block using a labeled table in the document-based authoring environment
2. Difficulty level MUST be configurable via block option notation: `Tic Tac Toe (easy)`, `Tic Tac Toe (medium)`, `Tic Tac Toe (hard)`
3. Block MUST render correctly after Sidekick preview and publish

### Edge Cases

- What happens when the visitor navigates away and returns? The game state is not persisted; a fresh game is presented.
- What happens if the visitor resizes the browser mid-game? The grid MUST remain usable and responsive; game state is preserved.
- What happens if JavaScript is disabled? The block content (title) remains visible as static text; the game is not functional without JavaScript.
- What happens if the author leaves the title row empty? The block MUST still render the game grid without a title.
- What happens if the author provides an invalid difficulty option (e.g., "Tic Tac Toe (extreme)")? The block MUST ignore the unrecognized option and default to "medium" difficulty.
- What happens if multiple Tic-Tac-Toe blocks are placed on the same page? Each instance MUST operate independently with its own game state, timer, and score counter. No interaction between instances.

## Content Model *(mandatory for block features)*

**Canonical Model Type**: Standalone

The Tic-Tac-Toe block is a distinct, self-contained interactive element. It is not a collection of repeating items, nor is it pulling data from an API. It uses a single content row for the title, making Standalone the most appropriate model. Behavioral configuration (difficulty) is handled via block options rather than configuration rows, keeping the authoring experience minimal.

**Block Table Structure**:

| Tic Tac Toe |
|---|
| Game title text |

With difficulty option:

| Tic Tac Toe (hard) |
|---|
| Beat the unbeatable AI! |

**Semantic Formatting**:
- Regular paragraph text → game title displayed above the grid
- Block label → "Tic Tac Toe" identifies the block type
- Parenthetical options → difficulty level (easy, medium, hard)

**Block Options (Variants)**:
- `Tic Tac Toe (easy)` → AI plays mostly random moves; forgiving for casual play
- `Tic Tac Toe (medium)` → AI plays a balanced mix of optimal and random moves (default)
- `Tic Tac Toe (hard)` → AI plays optimally using full minimax; unbeatable

**Section Metadata**: None required. The block is self-contained and does not depend on section-level styling.

## Design Guidelines

The block's visual identity follows a **sleek / modern** aesthetic — sharp geometry, bold contrast, editorial typography, and purposeful motion. The game should feel like a polished, design-forward mini-app embedded within the page, not a generic tutorial project.

### Aesthetic Direction
- **Tone**: Sleek, modern, architectural. Clean lines and intentional negative space. Every visual choice should feel deliberate.
- **Differentiation**: The block should stand out as a distinct interactive experience within the page, clearly communicating "this is something you can play."

### Color Palette
- **Self-contained dark palette** — The block uses its own scoped color system, independent of the site's global tokens.
- Dark background (near-black, e.g., `#0a0a0a` to `#1a1a1a` range) as the block container.
- Two sharp accent colors to differentiate X and O marks (e.g., electric blue for visitor's X, warm coral/orange for AI's O). The exact accent colors should be defined as block-scoped CSS custom properties.
- High-contrast white or near-white for text (title, timer, score counter).
- Muted gray for grid cell backgrounds and borders.
- A distinct highlight color for the winning combination (differentiated from both X and O accent colors).

### Typography
- **Title**: A distinctive display font — bold, geometric, with strong character. Avoid generic choices (Inter, Roboto, Arial, system fonts). Consider fonts with sharp geometry to match the aesthetic (e.g., from Google Fonts — the specific choice is left to implementation, but it must be intentional and distinctive).
- **Game elements** (timer, score, outcome message): A clean monospace or geometric sans-serif for numerical/status information. Provides functional contrast against the display title.
- **Marks (X and O)**: Not typography — rendered as geometric strokes (see Marks section).

### Marks (X and O)
- **Geometric strokes** — X rendered as two crossing diagonal lines, O rendered as a circle outline. Both drawn with CSS (borders, pseudo-elements, or inline SVG).
- Marks should have visible stroke weight that feels bold but not heavy.
- Each mark uses its own accent color from the palette.
- Marks should feel precise and architectural — clean vector aesthetic, consistent stroke width.

### Grid and Layout
- **Card cells with gap** — Each cell is a distinct surface (slightly lighter than the block background, with sharp or subtly rounded corners) separated by uniform gaps.
- Cells should have a hover state (subtle brightness or border change) to communicate interactivity.
- The grid is the visual centerpiece — it should be prominently sized and centered within the block.
- **Layout hierarchy** (top to bottom): Title → Timer + Score counter → Grid → Outcome message + Play Again button.
- On mobile (<600px), the grid MUST scale to near-full-width while maintaining square cells and touch-friendly tap targets (minimum 44×44px per cell).
- On desktop (≥900px), the grid MUST be constrained to a comfortable max-width (not stretched edge-to-edge) to maintain visual proportion.

### Motion and Animation
- **Targeted polish** — CSS-only animations at key interaction moments:
  - **Mark placement**: Marks animate in with a quick scale or draw-on effect (e.g., scale from 0 to 1 with ease-out, ~150ms).
  - **AI "thinking"**: During the AI delay, the cell where the AI will play shows a subtle pulse or shimmer to indicate processing.
  - **Win highlight**: The winning three-cell combination gets a strike-through line animation or a glow/color-shift to draw attention.
  - **Outcome message**: Fades in smoothly (~200ms).
  - **Play Again reset**: Board cells reset with a brief staggered fade or scale-out before the new empty grid appears.
- No heavy animations (confetti, particles, 3D transforms). Motion should feel controlled and intentional, matching the sleek tone.

### Responsive Behavior
- Mobile (<600px): Full-width block, grid scales to fill available space, stacked vertical layout for all elements.
- Tablet (600px–899px): Grid slightly constrained, comfortable padding.
- Desktop (≥900px): Grid constrained to max-width (~400px), centered, generous surrounding whitespace.
- All interactive elements MUST maintain minimum 44×44px touch targets across all breakpoints.

## Clarifications

### Session 2026-03-25

1. **Session score tracking** — Block displays a session score counter (Wins / Losses / Draws) that accumulates across replays within the same page visit and resets on page reload. (Integrated into AC5 and FR-013)
2. **AI response timing** — AI introduces a difficulty-scaled artificial delay before responding: ~200ms (easy), ~400ms (medium), ~700ms (hard). (Integrated into AC3 and FR-014)
3. **Difficulty probability ratios** — Easy: 30% optimal / 70% random. Medium: 60% optimal / 40% random. Hard: 100% optimal. (Integrated into AC3 and FR-006)
4. **Multiple instances** — Each block instance on a page operates independently with its own game state, timer, and score counter. (Integrated into Edge Cases)
5. **Out-of-scope declaration** — Not added; spec is sufficiently clear about included scope.
6. **Design: Aesthetic tone** — Sleek / Modern: sharp geometry, bold contrast, editorial typography. (Integrated into Design Guidelines)
7. **Design: Color approach** — Self-contained dark palette with 2–3 accent colors, independent of site tokens. (Integrated into Design Guidelines)
8. **Design: Mark styling** — Geometric strokes: X as crossing lines, O as circle outline. Pure CSS, no font dependency. (Integrated into Design Guidelines)
9. **Design: Motion level** — Targeted polish: mark placement animation, AI thinking pulse, win highlight strike-through, outcome fade-in. CSS-only. (Integrated into Design Guidelines)
10. **Design: Grid layout** — Card cells with gap: each cell a distinct elevated surface with uniform spacing. Modern UI component feel. (Integrated into Design Guidelines)

## Requirements *(mandatory)*

### Functional Requirements *(mandatory)*

- **FR-001**: Block MUST render a 3×3 interactive grid where each cell is clickable to place a mark
- **FR-002**: Block MUST display the authored title text above the game grid
- **FR-003**: Block MUST include a visible timer that starts on the visitor's first move and stops when the game ends, displayed in M:SS format
- **FR-004**: Block MUST assign the visitor as "X" and the AI as "O", with the visitor always moving first
- **FR-005**: Block MUST implement the minimax algorithm for AI move selection
- **FR-014**: AI MUST introduce a difficulty-scaled artificial delay before responding: ~200ms (easy), ~400ms (medium), ~700ms (hard)
- **FR-006**: Block MUST support three difficulty levels controlled via block options, defaulting to "medium": easy (30% optimal / 70% random), medium (60% optimal / 40% random), hard (100% optimal)
- **FR-007**: Block MUST detect win conditions (three in a row horizontally, vertically, or diagonally) and draw conditions (full board, no winner)
- **FR-008**: Block MUST display an outcome message ("You win!", "You lose!", "It's a draw!") when the game ends
- **FR-009**: Block MUST visually highlight the winning three-cell combination
- **FR-010**: Block MUST provide a "Play Again" button after the game ends that resets the board, timer, and outcome message
- **FR-013**: Block MUST display a session score counter (wins, losses, draws) that accumulates across replays and resets on page reload
- **FR-011**: Block MUST prevent interaction with occupied cells and all cells after the game ends
- **FR-012**: Block MUST handle an empty title gracefully by rendering the game grid without a title element

### Non-Functional Requirements *(mandatory)*

- **NFR-001**: Block MUST be fully operable via keyboard navigation — cells MUST be focusable and activatable with Enter or Space keys (Principle IV: Accessibility)
- **NFR-002**: Block MUST use ARIA attributes to communicate game state to assistive technologies — cells MUST have accessible labels indicating their state (empty, X, or O) (Principle IV: Accessibility)
- **NFR-003**: Block MUST announce game outcomes and AI moves to screen readers via an ARIA live region (Principle IV: Accessibility)
- **NFR-004**: Block MUST scope all CSS selectors to the `.tic-tac-toe` block class to prevent style leakage (Principle I: Code Quality)
- **NFR-005**: Block MUST be responsive across standard breakpoints (600px, 900px, 1200px) with the grid sizing appropriately for each viewport (Principle I: Code Quality)
- **NFR-006**: Block MUST NOT introduce external dependencies — all game logic MUST be implemented in vanilla JavaScript (Principle I: Code Quality)
- **NFR-007**: Block MUST NOT negatively impact Lighthouse performance score — the minimax computation for a 3×3 grid is trivially fast and MUST NOT block the main thread (Principle II: Performance)
