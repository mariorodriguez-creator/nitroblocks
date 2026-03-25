import { loadCSS } from '../../scripts/aem.js';

export const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

export const DIFFICULTY = {
  easy: { optimalRate: 0.3, delay: 200 },
  medium: { optimalRate: 0.6, delay: 400 },
  hard: { optimalRate: 1.0, delay: 700 },
};

export function getDifficulty(block) {
  if (block.classList.contains('hard')) return DIFFICULTY.hard;
  if (block.classList.contains('easy')) return DIFFICULTY.easy;
  return DIFFICULTY.medium;
}

export function checkWinner(board) {
  const found = WINNING_COMBOS.find(([a, b, c]) => (
    board[a] && board[a] === board[b] && board[a] === board[c]
  ));
  return found ? { winner: board[found[0]], combo: found } : null;
}

export function isDraw(board) {
  return board.every((cell) => cell !== null);
}

export function minimax(board, isMaximizing) {
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

export function getBestMove(board) {
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

export function getRandomMove(board) {
  const empty = board.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}

export function getAIMove(board, difficulty) {
  if (Math.random() < difficulty.optimalRate) return getBestMove(board);
  return getRandomMove(board);
}

export function formatTime(seconds) {
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
  loadCSS('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

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
