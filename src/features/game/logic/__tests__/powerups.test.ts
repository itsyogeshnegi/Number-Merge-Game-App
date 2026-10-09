import { createEmptyBoard } from '../engine';
import { applyHammer, applyShuffle, clearLowestTiles } from '../powerups';
import { TileData } from '../../../../types/game';

function makeTile(value: number, row: number = 0, col: number = 0): TileData {
  return { id: `test_${value}_${row}_${col}`, value, row, col };
}

describe('Powerups Engine Tests', () => {
  describe('Hammer Powerup', () => {
    it('removes target tile and clears its position', () => {
      const board = createEmptyBoard(4);
      board[1][2] = makeTile(64, 1, 2);

      const res = applyHammer(board, 1, 2);
      expect(res.success).toBe(true);
      expect(res.removedValue).toBe(64);
      expect(res.board[1][2]).toBeNull();
    });

    it('returns success: false when targeting an empty cell', () => {
      const board = createEmptyBoard(4);
      const res = applyHammer(board, 0, 0);
      expect(res.success).toBe(false);
      expect(res.removedValue).toBe(0);
    });
  });

  describe('Shuffle Powerup', () => {
    it('rearranges tiles across occupied cells', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(2, 0, 0);
      board[0][1] = makeTile(4, 0, 1);
      board[1][0] = makeTile(8, 1, 0);
      board[1][1] = makeTile(16, 1, 1);

      const res = applyShuffle(board, () => 0.5);
      expect(res.success).toBe(true);
      // Ensure all 4 tiles still exist
      const activeTiles = res.board.flat().filter(Boolean);
      expect(activeTiles.length).toBe(4);
      const values = activeTiles.map((t) => t?.value).sort((a, b) => (a ?? 0) - (b ?? 0));
      expect(values).toEqual([2, 4, 8, 16]);
    });

    it('returns success: false if 1 or 0 tiles exist', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(2, 0, 0);
      const res = applyShuffle(board);
      expect(res.success).toBe(false);
    });
  });

  describe('Clear Lowest Tiles (Revive)', () => {
    it('clears lowest tiles on board', () => {
      const board = createEmptyBoard(4);
      board[0][0] = makeTile(2, 0, 0);
      board[0][1] = makeTile(2, 0, 1);
      board[1][0] = makeTile(32, 1, 0);
      board[1][1] = makeTile(64, 1, 1);

      const res = clearLowestTiles(board, 2);
      expect(res.clearedCount).toBe(2);
      // Both 2s should be removed, 32 and 64 remain
      const activeValues = res.board.flat().filter(Boolean).map((t) => t?.value);
      expect(activeValues).toContain(32);
      expect(activeValues).toContain(64);
      expect(activeValues).not.toContain(2);
    });
  });
});
