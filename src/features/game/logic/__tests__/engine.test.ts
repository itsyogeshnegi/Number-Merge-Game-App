import {
  createEmptyBoard,
  createFullBoard,
  isValidDragMerge,
  executeDragMerge,
  canAnyMerge,
  getHighestTile,
  hasWonGame,
  getEmptyCells,
  resetTileCounter,
} from '../engine';
import { BoardMatrix, TileData } from '../../../../types/game';

function makeTile(value: number, row: number = 0, col: number = 0): TileData {
  return { id: `test_${value}_${row}_${col}`, value, row, col };
}

describe('Number Merge Drag-and-Drop Engine Tests', () => {
  beforeEach(() => {
    resetTileCounter();
  });

  describe('Full Board Initialization', () => {
    it('creates board where EVERY box is filled with a random number (no empty cells)', () => {
      const b4 = createFullBoard(4);
      expect(b4.length).toBe(4);
      expect(b4[0].length).toBe(4);
      expect(getEmptyCells(b4).length).toBe(0); // All 16 cells filled!

      const b5 = createFullBoard(5);
      expect(getEmptyCells(b5).length).toBe(0); // All 25 cells filled!

      const b6 = createFullBoard(6);
      expect(getEmptyCells(b6).length).toBe(0); // All 36 cells filled!
    });

    it('guarantees at least one valid merge exists on initialization', () => {
      const board = createFullBoard(4);
      expect(canAnyMerge(board)).toBe(true);
    });
  });

  describe('Drag-to-Merge Validation ("Only upside down will merge, not far ones")', () => {
    it('allows vertical adjacent merge with same number (upside down)', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(4, 0, 0);
      board[1][0] = makeTile(4, 1, 0); // directly below (vertical neighbor)

      expect(isValidDragMerge(board, 0, 0, 1, 0)).toBe(true);
      expect(isValidDragMerge(board, 1, 0, 0, 0)).toBe(true);
    });

    it('rejects drag merge if numbers are different', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(4, 0, 0);
      board[1][0] = makeTile(8, 1, 0); // different number

      expect(isValidDragMerge(board, 0, 0, 1, 0)).toBe(false);
    });

    it('strictly rejects far away tiles ("not far once go it")', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(4, 0, 0);
      board[2][0] = makeTile(4, 2, 0); // distance = 2 (not adjacent!)
      board[3][0] = makeTile(4, 3, 0); // distance = 3

      expect(isValidDragMerge(board, 0, 0, 2, 0)).toBe(false);
      expect(isValidDragMerge(board, 0, 0, 3, 0)).toBe(false);
    });

    it('rejects diagonal tiles', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(4, 0, 0);
      board[1][1] = makeTile(4, 1, 1); // diagonal

      expect(isValidDragMerge(board, 0, 0, 1, 1)).toBe(false);
    });
  });

  describe('Drag Merge Execution & Refill', () => {
    it('merges 2+2 into 4, awards score, and refills the vacated box with a new random number', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(2, 0, 0);
      board[1][0] = makeTile(2, 1, 0);

      const res = executeDragMerge(board, 0, 0, 1, 0, true, () => 0.1);
      expect(res.success).toBe(true);
      expect(res.scoreGained).toBe(4);
      expect(res.mergedValue).toBe(4);

      // Target box (1, 0) should now be 4
      expect(res.board[1][0]?.value).toBe(4);
      // Source box (0, 0) should NOT be empty; it gets refilled with a new number!
      expect(res.board[0][0]).not.toBeNull();
      expect(res.board[0][0]?.isNew).toBe(true);
    });

    it('merges 4+4 into 8, 8+8 into 16, 16+16 into 32', () => {
      const board = createEmptyBoard(4);
      board[2][1] = makeTile(16, 2, 1);
      board[3][1] = makeTile(16, 3, 1);

      const res = executeDragMerge(board, 2, 1, 3, 1, true);
      expect(res.success).toBe(true);
      expect(res.mergedValue).toBe(32);
      expect(res.scoreGained).toBe(32);
      expect(res.board[3][1]?.value).toBe(32);
    });
  });

  describe('Game Over & Win Detection', () => {
    it('detects game over when no adjacent tiles share matching numbers', () => {
      const board = createEmptyBoard(4);
      const grid = [
        [2, 4, 8, 16],
        [16, 8, 4, 2],
        [2, 4, 8, 16],
        [16, 8, 4, 2],
      ];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          board[r][c] = makeTile(grid[r][c], r, c);
        }
      }

      expect(canAnyMerge(board)).toBe(false);
    });

    it('detects high tile and 2048 win state', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(2048, 0, 0);
      expect(getHighestTile(board)).toBe(2048);
      expect(hasWonGame(board, 2048)).toBe(true);
    });
  });
});
