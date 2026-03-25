# Quickstart: Tic-Tac-Toe Block

**Feature Branch**: `f/567234-tic-tac-toe`
**Date**: 2026-03-25

## Files to Create

```
blocks/tic-tac-toe/
├── tic-tac-toe.js    # Block decoration + game logic
└── tic-tac-toe.css   # Scoped styles + animations
```

No changes to global styles, scripts, or `head.html`.

## JavaScript Scaffold

```javascript
// blocks/tic-tac-toe/tic-tac-toe.js

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

const DIFFICULTY = {
  easy: { optimalRate: 0.3, delay: 200 },
  medium: { optimalRate: 0.6, delay: 400 },
  hard: { optimalRate: 1.0, delay: 700 },
};

function getDifficulty(block) {
  // Check variant classes; default to medium
  if (block.classList.contains('hard')) return DIFFICULTY.hard;
  if (block.classList.contains('easy')) return DIFFICULTY.easy;
  return DIFFICULTY.medium;
}

function checkWinner(board) {
  // Return winning combo indices or null
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return null;
}

function isDraw(board) {
  return board.every((cell) => cell !== null);
}

function minimax(board, isMaximizing) {
  const result = checkWinner(board);
  if (result) return result.winner === 'O' ? 10 : -10;
  if (isDraw(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i += 1) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  }

  let best = Infinity;
  for (let i = 0; i < 9; i += 1) {
    if (!board[i]) {
      board[i] = 'X';
      best = Math.min(best, minimax(board, true));
      board[i] = null;
    }
  }
  return best;
}

function getBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i += 1) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function getRandomMove(board) {
  const empty = board.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getAIMove(board, difficulty) {
  if (Math.random() < difficulty.optimalRate) return getBestMove(board);
  return getRandomMove(board);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateCellAria(cell, index, value) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const state = value || 'empty';
  cell.setAttribute('aria-label', `Row ${row}, Column ${col}, ${state}`);
}

export default function decorate(block) {
  const difficulty = getDifficulty(block);

  // Extract title from authored content
  const titleText = block.querySelector(':scope > div > div')?.textContent?.trim();

  // Game state (closure-scoped for multi-instance isolation)
  let board = Array(9).fill(null);
  let gameOver = false;
  let timerSeconds = 0;
  let timerInterval = null;
  const score = { wins: 0, losses: 0, draws: 0 };

  // Build decorated DOM
  block.textContent = '';

  // Title
  if (titleText) {
    const title = document.createElement('h2');
    title.className = 'ttt-title';
    title.textContent = titleText;
    block.append(title);
  }

  // Status bar
  const status = document.createElement('div');
  status.className = 'ttt-status';

  const timer = document.createElement('div');
  timer.className = 'ttt-timer';
  timer.setAttribute('aria-label', 'Game timer');
  timer.textContent = '0:00';

  const scoreEl = document.createElement('div');
  scoreEl.className = 'ttt-score';
  scoreEl.setAttribute('aria-label', 'Session score');
  // score inner elements created by updateScore()

  status.append(timer, scoreEl);
  block.append(status);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'ttt-grid';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Tic-tac-toe game board');

  const cells = [];
  for (let i = 0; i < 9; i += 1) {
    const cell = document.createElement('button');
    cell.className = 'ttt-cell';
    cell.dataset.index = i;
    updateCellAria(cell, i, null);
    cells.push(cell);
    grid.append(cell);
  }
  block.append(grid);

  // Outcome
  const outcome = document.createElement('div');
  outcome.className = 'ttt-outcome';
  outcome.setAttribute('aria-live', 'polite');
  block.append(outcome);

  // Play Again
  const playAgain = document.createElement('button');
  playAgain.className = 'ttt-play-again';
  playAgain.textContent = 'Play Again';
  playAgain.hidden = true;
  block.append(playAgain);

  // SR announcements
  const srAnnounce = document.createElement('div');
  srAnnounce.className = 'ttt-sr-only';
  srAnnounce.setAttribute('aria-live', 'polite');
  srAnnounce.setAttribute('aria-atomic', 'true');
  block.append(srAnnounce);

  function announce(text) {
    srAnnounce.textContent = '';
    requestAnimationFrame(() => { srAnnounce.textContent = text; });
  }

  function updateScore() {
    scoreEl.innerHTML = '';
    const parts = [
      { label: 'W', value: score.wins, cls: 'ttt-wins' },
      { label: 'D', value: score.draws, cls: 'ttt-draws' },
      { label: 'L', value: score.losses, cls: 'ttt-losses' },
    ];
    parts.forEach(({ label, value, cls }) => {
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = `${value} ${label}`;
      scoreEl.append(span);
    });
  }

  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      timerSeconds += 1;
      timer.textContent = formatTime(timerSeconds);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function endGame(result, combo) {
    gameOver = true;
    stopTimer();

    if (combo) {
      combo.forEach((i) => cells[i].classList.add('ttt-cell--win'));
    }

    cells.forEach((c) => { c.disabled = true; });

    let message;
    if (result === 'X') {
      message = 'You win!';
      score.wins += 1;
    } else if (result === 'O') {
      message = 'You lose!';
      score.losses += 1;
    } else {
      message = "It's a draw!";
      score.draws += 1;
    }

    outcome.textContent = message;
    outcome.classList.add('ttt-outcome--visible');
    playAgain.hidden = false;
    updateScore();
    announce(message);
  }

  function aiMove() {
    if (gameOver) return;
    const moveIndex = getAIMove(board, difficulty);
    if (moveIndex < 0) return;

    cells[moveIndex].classList.add('ttt-cell--thinking');

    setTimeout(() => {
      cells[moveIndex].classList.remove('ttt-cell--thinking');
      board[moveIndex] = 'O';
      cells[moveIndex].classList.add('ttt-cell--o');
      cells[moveIndex].disabled = true;
      updateCellAria(cells[moveIndex], moveIndex, 'O');
      announce('AI played O');

      const result = checkWinner(board);
      if (result) {
        endGame(result.winner, result.combo);
      } else if (isDraw(board)) {
        endGame('draw', null);
      }
    }, difficulty.delay);
  }

  function handleCellClick(e) {
    const cell = e.target.closest('.ttt-cell');
    if (!cell || gameOver) return;

    const index = parseInt(cell.dataset.index, 10);
    if (board[index]) return;

    // Start timer on first move
    if (board.every((v) => v === null)) startTimer();

    board[index] = 'X';
    cell.classList.add('ttt-cell--x');
    cell.disabled = true;
    updateCellAria(cell, index, 'X');

    const result = checkWinner(board);
    if (result) {
      endGame(result.winner, result.combo);
      return;
    }
    if (isDraw(board)) {
      endGame('draw', null);
      return;
    }

    // Disable remaining cells during AI turn
    cells.forEach((c) => { if (!board[c.dataset.index]) c.disabled = true; });
    aiMove();
    // Re-enable empty cells after AI move completes
    setTimeout(() => {
      if (!gameOver) {
        cells.forEach((c, i) => { if (!board[i]) c.disabled = false; });
      }
    }, difficulty.delay + 50);
  }

  function resetGame() {
    board = Array(9).fill(null);
    gameOver = false;
    timerSeconds = 0;
    stopTimer();
    timer.textContent = '0:00';
    outcome.textContent = '';
    outcome.classList.remove('ttt-outcome--visible');
    playAgain.hidden = true;

    cells.forEach((cell, i) => {
      cell.className = 'ttt-cell';
      cell.disabled = false;
      updateCellAria(cell, i, null);
    });
  }

  // Event listeners
  grid.addEventListener('click', handleCellClick);
  playAgain.addEventListener('click', resetGame);

  // Initial render
  updateScore();
}
```

## CSS Skeleton (Mobile-First)

```css
/* blocks/tic-tac-toe/tic-tac-toe.css */

/* === Block-scoped custom properties === */
main .tic-tac-toe {
  --ttt-bg: #0f0f0f;
  --ttt-bg-cell: #1a1a1a;
  --ttt-bg-cell-hover: #252525;
  --ttt-text: #f0f0f0;
  --ttt-text-muted: #888;
  --ttt-accent-x: #3b82f6;       /* electric blue */
  --ttt-accent-o: #f97316;       /* warm orange */
  --ttt-accent-win: #22c55e;     /* green highlight */
  --ttt-font-display: 'Orbitron', sans-serif;
  --ttt-font-mono: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  --ttt-grid-gap: 6px;
  --ttt-cell-size: clamp(80px, 22vw, 120px);
  --ttt-mark-stroke: 4px;
  --ttt-radius: 8px;
}

/* === Base (mobile-first) === */
main .tic-tac-toe {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 2rem 1rem;
  background-color: var(--ttt-bg);
  border-radius: var(--ttt-radius);
  color: var(--ttt-text);
  text-align: center;
}

/* Title */
main .tic-tac-toe .ttt-title {
  margin: 0;
  font-family: var(--ttt-font-display);
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ttt-text);
}

/* Status bar */
main .tic-tac-toe .ttt-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: calc(var(--ttt-cell-size) * 3 + var(--ttt-grid-gap) * 2);
}

main .tic-tac-toe .ttt-timer {
  font-family: var(--ttt-font-mono);
  font-size: 1.125rem;
  color: var(--ttt-text-muted);
  font-variant-numeric: tabular-nums;
}

main .tic-tac-toe .ttt-score {
  display: flex;
  gap: 0.75rem;
  font-family: var(--ttt-font-mono);
  font-size: 0.875rem;
  color: var(--ttt-text-muted);
}

main .tic-tac-toe .ttt-wins { color: var(--ttt-accent-win); }
main .tic-tac-toe .ttt-losses { color: var(--ttt-accent-o); }
main .tic-tac-toe .ttt-draws { color: var(--ttt-text-muted); }

/* Grid */
main .tic-tac-toe .ttt-grid {
  display: grid;
  grid-template-columns: repeat(3, var(--ttt-cell-size));
  grid-template-rows: repeat(3, var(--ttt-cell-size));
  gap: var(--ttt-grid-gap);
}

/* Cells */
main .tic-tac-toe .ttt-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ttt-cell-size);
  height: var(--ttt-cell-size);
  border: none;
  border-radius: calc(var(--ttt-radius) / 2);
  background-color: var(--ttt-bg-cell);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

main .tic-tac-toe .ttt-cell:hover:not(:disabled) {
  background-color: var(--ttt-bg-cell-hover);
}

main .tic-tac-toe .ttt-cell:focus-visible {
  outline: 2px solid var(--ttt-accent-x);
  outline-offset: 2px;
}

main .tic-tac-toe .ttt-cell:disabled {
  cursor: default;
}

/* X mark — two crossing diagonal lines via pseudo-elements */
main .tic-tac-toe .ttt-cell--x::before,
main .tic-tac-toe .ttt-cell--x::after {
  content: '';
  position: absolute;
  width: 60%;
  height: var(--ttt-mark-stroke);
  background-color: var(--ttt-accent-x);
  border-radius: 2px;
  animation: ttt-mark-in 0.15s ease-out;
}

main .tic-tac-toe .ttt-cell--x::before { transform: rotate(45deg); }
main .tic-tac-toe .ttt-cell--x::after { transform: rotate(-45deg); }

/* O mark — circle outline via pseudo-element */
main .tic-tac-toe .ttt-cell--o::before {
  content: '';
  position: absolute;
  width: 55%;
  aspect-ratio: 1;
  border: var(--ttt-mark-stroke) solid var(--ttt-accent-o);
  border-radius: 50%;
  animation: ttt-mark-in 0.15s ease-out;
}

/* Win highlight */
main .tic-tac-toe .ttt-cell--win {
  box-shadow: 0 0 0 2px var(--ttt-accent-win), 0 0 12px var(--ttt-accent-win);
}

/* AI thinking pulse */
main .tic-tac-toe .ttt-cell--thinking {
  animation: ttt-pulse 0.6s ease-in-out infinite;
}

/* Outcome message */
main .tic-tac-toe .ttt-outcome:empty {
  display: none;
}

main .tic-tac-toe .ttt-outcome {
  font-family: var(--ttt-font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  opacity: 0;
  transition: opacity 0.2s ease;
}

main .tic-tac-toe .ttt-outcome--visible {
  opacity: 1;
}

/* Play Again button */
main .tic-tac-toe .ttt-play-again {
  padding: 0.625rem 1.5rem;
  border: 2px solid var(--ttt-text);
  border-radius: 2rem;
  background: transparent;
  color: var(--ttt-text);
  font-family: var(--ttt-font-display);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

main .tic-tac-toe .ttt-play-again:hover {
  background-color: var(--ttt-text);
  color: var(--ttt-bg);
}

main .tic-tac-toe .ttt-play-again:focus-visible {
  outline: 2px solid var(--ttt-accent-x);
  outline-offset: 2px;
}

/* SR-only helper */
main .tic-tac-toe .ttt-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* === Animations === */
@keyframes ttt-mark-in {
  from { transform: scale(0) rotate(var(--_rotation, 0deg)); opacity: 0; }
  to { opacity: 1; }
}

@keyframes ttt-pulse {
  0%, 100% { background-color: var(--ttt-bg-cell); }
  50% { background-color: var(--ttt-bg-cell-hover); }
}

/* === 600px breakpoint === */
@media (width >= 600px) {
  main .tic-tac-toe {
    padding: 2.5rem 2rem;
    gap: 1.5rem;
  }

  main .tic-tac-toe .ttt-title {
    font-size: 1.5rem;
  }

  main .tic-tac-toe .ttt-timer {
    font-size: 1.25rem;
  }
}

/* === 900px breakpoint === */
@media (width >= 900px) {
  main .tic-tac-toe {
    --ttt-cell-size: 120px;
    --ttt-grid-gap: 8px;
    padding: 3rem;
    max-width: 520px;
    margin-inline: auto;
  }

  main .tic-tac-toe .ttt-title {
    font-size: 1.75rem;
  }
}
```

## Integration Scenarios

### S1: Standard Page with Tic-Tac-Toe Block

**Setup**: Author creates a page with other content (headings, paragraphs) and adds a Tic-Tac-Toe block.

**Verification**:
1. Block renders in its own dark container, visually distinct from surrounding content
2. Title displays the authored text
3. Grid is 3×3 with clickable cells
4. Surrounding content is unaffected (no style leakage)

### S2: Multiple Instances on Same Page

**Setup**: Author places two Tic-Tac-Toe blocks on the same page — one easy, one hard.

**Verification**:
1. Both blocks render independently
2. Playing in one does not affect the other
3. Each has its own timer and score counter
4. Difficulty behavior differs per block

### S3: Empty Title

**Setup**: Author creates the block table but leaves the content row empty.

**Verification**:
1. No title element is rendered (no empty `<h2>`)
2. Grid, timer, and score render normally
3. Game is fully playable

### S4: Invalid Difficulty Option

**Setup**: Author types `Tic Tac Toe (extreme)` as the block label.

**Verification**:
1. Block renders with default medium difficulty
2. No console errors
3. Game plays as expected for medium

### S5: Block in First Section (LCP Impact)

**Setup**: Place the block in the first section of a page (eager-loaded).

**Verification**:
1. Block renders correctly
2. Font loading does not block LCP (Google Font loaded via `loadCSS`, not `@import`)
3. Lighthouse score remains at 100

## Test Scenarios

### T1: Visitor Plays and Wins (Easy Mode)

1. Load page with easy difficulty block
2. Click cells strategically to attempt a win
3. Verify X mark appears with animation
4. Verify AI responds with O after ~200ms delay
5. Verify timer starts on first click and counts up
6. Win the game
7. Verify winning cells are highlighted
8. Verify "You win!" message appears
9. Verify timer stops
10. Verify score updates to "1 W / 0 D / 0 L"
11. Verify "Play Again" button appears

### T2: Visitor Loses to Hard AI

1. Load page with hard difficulty block
2. Play non-optimally
3. Verify AI response delay is ~700ms
4. Verify AI plays optimally (unbeatable)
5. Lose the game
6. Verify "You lose!" message appears
7. Verify score updates

### T3: Draw Game

1. Play a game that results in a draw
2. Verify "It's a draw!" message
3. Verify all cells occupied, no winning highlight
4. Verify score draws counter increments

### T4: Play Again Flow

1. Complete a game
2. Click "Play Again"
3. Verify board clears
4. Verify timer resets to 0:00
5. Verify outcome message disappears
6. Verify cells are re-enabled
7. Verify score persists across games
8. Play another game, verify score accumulates

### T5: Keyboard Navigation

1. Tab through cells — verify focus indicators visible
2. Press Enter or Space on a cell — verify X is placed
3. Continue tabbing and playing via keyboard
4. Verify game is fully playable without mouse

### T6: Screen Reader Accessibility

1. Verify cells have meaningful aria-labels ("Row 1, Column 1, empty")
2. Verify game outcome is announced via aria-live region
3. Verify score and timer have aria-labels

### T7: Responsive Behavior

1. Resize browser to <600px — verify grid fills available width
2. Resize to 600–899px — verify comfortable padding
3. Resize to ≥900px — verify grid constrained to max-width, centered
4. Verify cells maintain 44×44px minimum at all breakpoints

### T8: Occupied Cell Click

1. Click a cell to place X
2. Click the same cell again
3. Verify nothing happens (no error, no state change)

### T9: Click During AI Turn

1. Place X in a cell
2. Immediately try clicking another empty cell before AI responds
3. Verify cells are disabled during AI thinking
4. After AI responds, verify empty cells re-enabled
