import { BoardMatrix, TileData } from '../../../types/game';
import { cloneBoard } from './engine';

/**
 * Removes a specific tile from the board by row and column
 */
export function applyHammer(board: BoardMatrix, row: number, col: number): {
  board: BoardMatrix;
  success: boolean;
  removedValue: number;
} {
  if (
    row < 0 ||
    row >= board.length ||
    col < 0 ||
    col >= board[row].length ||
    board[row][col] === null
  ) {
    return { board, success: false, removedValue: 0 };
  }

  const newBoard = cloneBoard(board);
  const removedValue = newBoard[row][col]?.value ?? 0;
  newBoard[row][col] = null;

  return {
    board: newBoard,
    success: true,
    removedValue,
  };
}

/**
 * Shuffles all active tiles on the board, rearranging them into new positions
 */
export function applyShuffle(
  board: BoardMatrix,
  randomFn: () => number = Math.random
): {
  board: BoardMatrix;
  success: boolean;
} {
  const tiles: TileData[] = [];
  const positions: { row: number; col: number }[] = [];

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const tile = board[r][c];
      if (tile !== null) {
        tiles.push({ ...tile });
        positions.push({ row: r, col: c });
      }
    }
  }

  if (tiles.length <= 1) {
    return { board, success: false };
  }

  // Fisher-Yates shuffle on tile values
  const shuffledTiles = [...tiles];
  for (let i = shuffledTiles.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = shuffledTiles[i];
    shuffledTiles[i] = shuffledTiles[j];
    shuffledTiles[j] = temp;
  }

  const newBoard = cloneBoard(board);
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const tile = shuffledTiles[i];
    newBoard[pos.row][pos.col] = {
      ...tile,
      row: pos.row,
      col: pos.col,
    };
  }

  return {
    board: newBoard,
    success: true,
  };
}

/**
 * Clears the lowest-value tiles on the board (e.g. Revive after Game Over)
 */
export function clearLowestTiles(
  board: BoardMatrix,
  countToClear: number = 2
): {
  board: BoardMatrix;
  clearedCount: number;
} {
  const tiles: { row: number; col: number; value: number }[] = [];

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const tile = board[r][c];
      if (tile !== null) {
        tiles.push({ row: r, col: c, value: tile.value });
      }
    }
  }

  // Sort ascending by tile value
  tiles.sort((a, b) => a.value - b.value);

  const newBoard = cloneBoard(board);
  const toRemove = tiles.slice(0, countToClear);

  for (const item of toRemove) {
    newBoard[item.row][item.col] = null;
  }

  return {
    board: newBoard,
    clearedCount: toRemove.length,
  };
}
