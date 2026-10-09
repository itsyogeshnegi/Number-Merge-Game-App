export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type BoardSize = 4 | 5 | 6;

export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  mergedFrom?: [TileData, TileData];
}

export type BoardMatrix = (TileData | null)[][];

export interface MoveResult {
  board: BoardMatrix;
  scoreGained: number;
  highestMerged: number;
  moved: boolean;
  mergeCount: number;
}

export interface GameSnapshot {
  board: BoardMatrix;
  score: number;
  highestTile: number;
  movesCount: number;
}

export interface GameState {
  board: BoardMatrix;
  size: BoardSize;
  score: number;
  bestScore: number;
  highestTile: number;
  movesCount: number;
  mergesCount: number;
  isGameOver: boolean;
  hasWon: boolean;
  hasContinued: boolean;
  history: GameSnapshot[];
  activePowerUp: 'HAMMER' | null;
}

export interface GameStats {
  totalGames: number;
  wins: number;
  totalScore: number;
  highestScore: number;
  highestTile: number;
  totalMoves: number;
  totalMerges: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'dark' | 'classic' | 'neon';
  boardSize: BoardSize;
  hasSeenTutorial: boolean;
}
