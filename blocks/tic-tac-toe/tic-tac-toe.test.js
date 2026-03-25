import {
  describe, it, expect, vi,
} from 'vitest';
import {
  checkWinner,
  isDraw,
  minimax,
  getBestMove,
  getDifficulty,
  getAIMove,
  formatTime,
  DIFFICULTY,
} from './tic-tac-toe.js';

vi.mock('../../scripts/aem.js', () => ({ loadCSS: vi.fn() }));

// Helper to build a board from a string: 'X.O X.O ...' (9 chars)
function board(str) {
  return str.split('').filter((c) => c !== ' ').map((c) => {
    if (c === 'X') return 'X';
    if (c === 'O') return 'O';
    return null;
  });
}

describe('checkWinner', () => {
  it('returns null for empty board', () => {
    expect(checkWinner(Array(9).fill(null))).toBeNull();
  });

  it('detects row win', () => {
    const b = board('XXX......');
    const result = checkWinner(b);
    expect(result).not.toBeNull();
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([0, 1, 2]);
  });

  it('detects column win', () => {
    const b = board('X..X..X..');
    const result = checkWinner(b);
    expect(result).not.toBeNull();
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([0, 3, 6]);
  });

  it('detects diagonal win (top-left to bottom-right)', () => {
    const b = board('X...X...X');
    const result = checkWinner(b);
    expect(result).not.toBeNull();
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([0, 4, 8]);
  });

  it('detects diagonal win (top-right to bottom-left)', () => {
    const b = board('..X.X.X..');
    const result = checkWinner(b);
    expect(result).not.toBeNull();
    expect(result.winner).toBe('X');
    expect(result.combo).toEqual([2, 4, 6]);
  });

  it('detects O win', () => {
    const b = board('OOO......');
    const result = checkWinner(b);
    expect(result).not.toBeNull();
    expect(result.winner).toBe('O');
  });

  it('returns null for no winner on partial board', () => {
    const b = board('XO.OX.X..');
    expect(checkWinner(b)).toBeNull();
  });
});

describe('isDraw', () => {
  it('returns false for empty board', () => {
    expect(isDraw(Array(9).fill(null))).toBe(false);
  });

  it('returns false for partial board', () => {
    const b = board('XO.OX.X..');
    expect(isDraw(b)).toBe(false);
  });

  it('returns true for fully filled board with no winner', () => {
    // X O X / X O X / O X O — no winner, classic draw
    const b = board('XOXXOXOXO');
    expect(checkWinner(b)).toBeNull();
    expect(isDraw(b)).toBe(true);
  });
});

describe('minimax', () => {
  it('returns 10 when O wins', () => {
    // O has three in a row
    const b = board('OOOXXXXXX');
    // After O wins, checkWinner returns O — minimax before checking would return 10
    // Call minimax on a fresh winning board (result already determined)
    expect(minimax(b, false)).toBe(10);
  });

  it('returns -10 when X wins', () => {
    const b = board('XXXOOOXXX');
    // X wins at [0,1,2] — minimax returns -10
    expect(minimax(b, false)).toBe(-10);
  });

  it('returns 0 for a draw board', () => {
    const b = board('XOXXOXOXO');
    expect(minimax(b, false)).toBe(0);
  });
});

describe('minimax + getBestMove', () => {
  it('picks winning move for O at index 5', () => {
    // X X O (O already blocked row 0)
    // O O . <- O wins at 5, completing [3,4,5]
    // . . .
    const b = board('XXOOO....');
    const move = getBestMove(b);
    expect(move).toBe(5); // O completes row [3,4,5] — first winning move found
  });

  it('blocks X from winning', () => {
    // X X . <- X wins at 2 if O doesn't block
    // . . .
    // . . .
    const b = board('XX.......');
    const move = getBestMove(b);
    expect(move).toBe(2); // O must block [0,1,2]
  });

  it('returns a valid index (0-8) for any non-full board', () => {
    const b = board('XO.......'); // O just played; it's O turn
    const move = getBestMove(b);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
    expect(b[move]).toBeNull();
  });
});

describe('getDifficulty', () => {
  function fakeBlock(classes) {
    return { classList: { contains: (cls) => classes.includes(cls) } };
  }

  it('returns hard config for hard class', () => {
    expect(getDifficulty(fakeBlock(['hard']))).toBe(DIFFICULTY.hard);
  });

  it('returns easy config for easy class', () => {
    expect(getDifficulty(fakeBlock(['easy']))).toBe(DIFFICULTY.easy);
  });

  it('returns medium for no matching class', () => {
    expect(getDifficulty(fakeBlock([]))).toBe(DIFFICULTY.medium);
  });

  it('returns medium for unknown class (e.g. extreme)', () => {
    expect(getDifficulty(fakeBlock(['extreme']))).toBe(DIFFICULTY.medium);
  });

  it('returns medium when medium class is present', () => {
    expect(getDifficulty(fakeBlock(['medium']))).toBe(DIFFICULTY.medium);
  });
});

describe('getAIMove', () => {
  it('returns a valid empty-cell index', () => {
    const b = board('XO.......'); // cells 2-8 empty
    const move = getAIMove(b, DIFFICULTY.medium);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
    expect(b[move]).toBeNull();
  });

  it('always picks optimal move at hard difficulty (100% optimalRate)', () => {
    // With a board where there is only one best move, hard should always pick it
    const b = board('XX.......'); // O must block at 2
    const move = getAIMove(b, DIFFICULTY.hard);
    expect(move).toBe(2);
  });
});

describe('formatTime', () => {
  it('formats 0 seconds as 0:00', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats 65 seconds as 1:05', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('formats 600 seconds as 10:00', () => {
    expect(formatTime(600)).toBe('10:00');
  });

  it('formats 59 seconds as 0:59', () => {
    expect(formatTime(59)).toBe('0:59');
  });

  it('formats 3661 seconds as 61:01', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});
