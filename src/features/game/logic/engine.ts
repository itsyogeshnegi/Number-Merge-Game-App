import { BoardMatrix, BoardSize, Direction, MoveResult, TileData } from '../../../types/game';

let tileCounter = 0;

/**
 * Creates a unique identifier for each tile
 */
export function generateTileId(): string {
  tileCounter += 1;
  return `tile_${Date.now()}_${tileCounter}`;
}

/**
 * Resets tile ID counter (useful for deterministic tests)
 */
export function resetTileCounter(): void {
  tileCounter = 0;
}

/**
 * Creates an empty board of size x size filled with null
 */
export function createEmptyBoard(size: BoardSize): BoardMatrix {
  const board: BoardMatrix = [];
  for (let r = 0; r < size; r++) {
    const row: (TileData | null)[] = [];
    for (let c = 0; c < size; c++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

/**
 * Deep clones a board matrix
 */
export function cloneBoard(board: BoardMatrix): BoardMatrix {
  return board.map((row) =>
    row.map((tile) => (tile ? { ...tile } : null))
  );
}

/**
 * Generates a random starter number: predominantly 2 and 4, sometimes 8, rarely 16
 */
export function getRandomNumberValue(
  highestOnBoard: number = 16,
  randomFn: () => number = Math.random
): number {
  const rand = randomFn();
  if (highestOnBoard >= 64) {
    if (rand < 0.40) return 2;
    if (rand < 0.70) return 4;
    if (rand < 0.90) return 8;
    return 16;
  }
  if (rand < 0.55) return 2;
  if (rand < 0.85) return 4;
  return 8;
}

/**
 * Creates a board where EVERY box is filled with a random number.
 * Guarantees that at least one valid vertical merge exists initially.
 */
export function createFullBoard(
  size: BoardSize = 4,
  randomFn: () => number = Math.random
): BoardMatrix {
  const board: BoardMatrix = [];
  for (let r = 0; r < size; r++) {
    const row: (TileData | null)[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        id: generateTileId(),
        value: getRandomNumberValue(16, randomFn),
        row: r,
        col: c,
        isNew: true,
      });
    }
    board.push(row);
  }

  // Ensure at least one vertical adjacent match exists so the player can merge immediately
  if (!canAnyMerge(board, false)) {
    // Force a matching pair on col 0, rows 0 and 1
    const matchVal = board[0][0]?.value ?? 2;
    board[1][0] = {
      id: generateTileId(),
      value: matchVal,
      row: 1,
      col: 0,
    };
  }

  return board;
}

/**
 * Validates whether dragging tile A (fromRow, fromCol) to tile B (toRow, toCol) is a valid merge.
 * Rules:
 * 1. Must be different cells.
 * 2. Numbers must be identical.
 * 3. Only directly adjacent "upside down" (vertical neighbors: distance = 1), or optionally horizontal.
 * 4. Never allowed if far away ("not far once go it").
 */
export function isValidDragMerge(
  board: BoardMatrix,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  allowHorizontal: boolean = true
): boolean {
  const size = board.length;
  if (
    fromRow < 0 ||
    fromRow >= size ||
    fromCol < 0 ||
    fromCol >= size ||
    toRow < 0 ||
    toRow >= size ||
    toCol < 0 ||
    toCol >= size
  ) {
    return false;
  }

  if (fromRow === toRow && fromCol === toCol) {
    return false;
  }

  const fromTile = board[fromRow][fromCol];
  const toTile = board[toRow][toCol];

  if (!fromTile || !toTile) {
    return false;
  }

  // Same number check
  if (fromTile.value !== toTile.value) {
    return false;
  }

  // Vertical adjacent check ("upside down" directly above or below, distance = 1)
  const isVerticalAdjacent = Math.abs(toRow - fromRow) === 1 && fromCol === toCol;

  // Horizontal adjacent check (left or right, distance = 1)
  const isHorizontalAdjacent =
    allowHorizontal && Math.abs(toCol - fromCol) === 1 && fromRow === toRow;

  return isVerticalAdjacent || isHorizontalAdjacent;
}

/**
 * Executes the drag merge:
 * 1. Target tile doubles in value (e.g. 2 + 2 = 4, 4 + 4 = 8).
 * 2. Source tile is refilled with a new random number.
 * 3. Returns updated board and score.
 */
export function executeDragMerge(
  board: BoardMatrix,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  allowHorizontal: boolean = true,
  randomFn: () => number = Math.random
): {
  board: BoardMatrix;
  scoreGained: number;
  mergedValue: number;
  success: boolean;
} {
  if (!isValidDragMerge(board, fromRow, fromCol, toRow, toCol, allowHorizontal)) {
    return {
      board,
      scoreGained: 0,
      mergedValue: 0,
      success: false,
    };
  }

  const newBoard = cloneBoard(board);
  const fromTile = newBoard[fromRow][fromCol]!;
  const toTile = newBoard[toRow][toCol]!;

  const mergedValue = toTile.value * 2;
  const scoreGained = mergedValue;

  // Target tile merges and pops
  newBoard[toRow][toCol] = {
    id: generateTileId(),
    value: mergedValue,
    row: toRow,
    col: toCol,
    mergedFrom: [fromTile, toTile],
  };

  // Source tile gets refilled with a new random number
  const highestTile = getHighestTile(newBoard);
  newBoard[fromRow][fromCol] = {
    id: generateTileId(),
    value: getRandomNumberValue(highestTile, randomFn),
    row: fromRow,
    col: fromCol,
    isNew: true,
  };

  return {
    board: newBoard,
    scoreGained,
    mergedValue,
    success: true,
  };
}

/**
 * Checks if ANY valid merge remains on the board.
 */
export function canAnyMerge(
  board: BoardMatrix,
  allowHorizontal: boolean = true
): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const current = board[r][c];
      if (!current) return true;

      // Check vertical neighbor below
      if (r + 1 < size && board[r + 1][c]?.value === current.value) {
        return true;
      }
      // Check horizontal neighbor to the right
      if (allowHorizontal && c + 1 < size && board[r][c + 1]?.value === current.value) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Finds all empty cell coordinates on the board
 */
export function getEmptyCells(board: BoardMatrix): { row: number; col: number }[] {
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === null) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

/**
 * Spawns a new tile on a random empty cell.
 */
export function spawnTile(
  board: BoardMatrix,
  twoProbability: number = 0.9,
  randomFn: () => number = Math.random
): BoardMatrix {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    return board;
  }

  const newBoard = cloneBoard(board);
  const randomIndex = Math.floor(randomFn() * emptyCells.length);
  const chosenCell = emptyCells[randomIndex];
  const value = randomFn() < twoProbability ? 2 : 4;

  newBoard[chosenCell.row][chosenCell.col] = {
    id: generateTileId(),
    value,
    row: chosenCell.row,
    col: chosenCell.col,
    isNew: true,
  };

  return newBoard;
}

/**
 * Creates initial game board (either full or sparse)
 */
export function createInitialGame(
  size: BoardSize = 4,
  randomFn: () => number = Math.random
): BoardMatrix {
  return createFullBoard(size, randomFn);
}

/**
 * Checks if any valid moves remain on the board
 */
export function canMove(board: BoardMatrix): boolean {
  return canAnyMerge(board, true);
}

/**
 * Returns true if no further moves can be made
 */
export function isGameOver(board: BoardMatrix): boolean {
  return !canAnyMerge(board, true);
}

/**
 * Finds the highest tile value currently on the board
 */
export function getHighestTile(board: BoardMatrix): number {
  let highest = 0;
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const val = board[r][c]?.value ?? 0;
      if (val > highest) {
        highest = val;
      }
    }
  }
  return highest;
}

/**
 * Checks whether the winning tile (default 2048) has been reached
 */
export function hasWonGame(board: BoardMatrix, targetTile: number = 2048): boolean {
  return getHighestTile(board) >= targetTile;
}
