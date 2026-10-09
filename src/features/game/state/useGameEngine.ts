import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardMatrix,
  BoardSize,
  Direction,
  GameSnapshot,
  GameState,
  GameStats,
} from '../../../types/game';
import {
  createFullBoard,
  createInitialGame,
  executeDragMerge,
  isValidDragMerge,
  isGameOver,
  getHighestTile,
  hasWonGame,
  cloneBoard,
} from '../logic/engine';
import {
  applyHammer,
  applyShuffle,
  clearLowestTiles,
} from '../logic/powerups';
import { storageService, DEFAULT_STATS } from '../../../services/storage/storageService';
import { hapticsService } from '../../../services/haptics/hapticsService';
import { soundService } from '../../../services/sound/soundService';
import { adsService } from '../../../services/ads/adsService';
import { currencyService } from '../../../services/currency/currencyService';
import { analyticsService } from '../../../services/analytics/analyticsService';

const MAX_UNDO_HISTORY = 5;

export function useGameEngine(boardSize: BoardSize = 4) {
  const [board, setBoard] = useState<BoardMatrix>(() => createFullBoard(boardSize));
  const [size, setSize] = useState<BoardSize>(boardSize);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [highestTile, setHighestTile] = useState<number>(2);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [mergesCount, setMergesCount] = useState<number>(0);
  const [isGameOverState, setIsGameOverState] = useState<boolean>(false);
  const [hasWonState, setHasWonState] = useState<boolean>(false);
  const [hasContinuedState, setHasContinuedState] = useState<boolean>(false);
  const [history, setHistory] = useState<GameSnapshot[]>([]);
  const [activePowerUp, setActivePowerUp] = useState<'HAMMER' | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ row: number; col: number } | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Moving lock to prevent rapid swipe race conditions
  const isMovingRef = useRef<boolean>(false);
  const comboStreakRef = useRef<number>(0);
  const lastMergeTimeRef = useRef<number>(0);

  // Load saved state or best score on mount
  useEffect(() => {
    let isMounted = true;
    async function initGame() {
      const savedBest = await storageService.loadBestScore();
      if (!isMounted) return;
      setBestScore(savedBest);

      const savedGame = await storageService.loadCurrentGame();
      if (isMounted && savedGame && savedGame.size === boardSize && !savedGame.isGameOver) {
        setBoard(savedGame.board);
        setSize(savedGame.size);
        setScore(savedGame.score);
        setBestScore(Math.max(savedBest, savedGame.bestScore));
        setHighestTile(savedGame.highestTile);
        setMovesCount(savedGame.movesCount);
        setMergesCount(savedGame.mergesCount);
        setIsGameOverState(savedGame.isGameOver);
        setHasWonState(savedGame.hasWon);
        setHasContinuedState(savedGame.hasContinued);
        setHistory(savedGame.history || []);
      } else if (isMounted) {
        // Start fresh with a fully filled board
        const newBoard = createFullBoard(boardSize);
        setBoard(newBoard);
        setSize(boardSize);
        setScore(0);
        setHighestTile(getHighestTile(newBoard));
      }
      setIsLoaded(true);
    }

    initGame();
    return () => {
      isMounted = false;
    };
  }, [boardSize]);

  // Persist current state whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    const stateToSave: GameState = {
      board,
      size,
      score,
      bestScore,
      highestTile,
      movesCount,
      mergesCount,
      isGameOver: isGameOverState,
      hasWon: hasWonState,
      hasContinued: hasContinuedState,
      history,
      activePowerUp: null,
    };

    storageService.saveCurrentGame(stateToSave);
  }, [
    isLoaded,
    board,
    size,
    score,
    bestScore,
    highestTile,
    movesCount,
    mergesCount,
    isGameOverState,
    hasWonState,
    hasContinuedState,
    history,
  ]);

  // Execute a drag-and-drop merge from (fromRow, fromCol) to (toRow, toCol)
  const handleDragMerge = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
      if (isGameOverState || activePowerUp !== null) {
        return false;
      }

      if (!isValidDragMerge(board, fromRow, fromCol, toRow, toCol, true)) {
        hapticsService.warning();
        return false;
      }

      // Record undo snapshot before merging
      const snapshot: GameSnapshot = {
        board: cloneBoard(board),
        score,
        highestTile,
        movesCount,
      };

      const res = executeDragMerge(board, fromRow, fromCol, toRow, toCol, true);
      if (!res.success) return false;

      const newScore = score + res.scoreGained;
      const newBestScore = Math.max(bestScore, newScore);
      const newHighestTile = Math.max(highestTile, res.mergedValue);
      const newMoves = movesCount + 1;
      const newMerges = mergesCount + 1;
      const gameOver = isGameOver(res.board);
      const won = !hasWonState && hasWonGame(res.board, 2048);

      // Audio & Haptics Feedback
      soundService.playMerge(res.mergedValue);
      if (res.mergedValue >= 128) {
        hapticsService.heavy();
      } else {
        hapticsService.medium();
      }

      if (won) {
        setHasWonState(true);
        setShowCelebration(true);
        soundService.playWin();
        hapticsService.success();
        analyticsService.logEvent('highest_tile_reached', { tile: 2048 });
      }

      if (gameOver) {
        setIsGameOverState(true);
        soundService.playGameOver();
        hapticsService.warning();
        adsService.recordGameCompleted();
        analyticsService.logEvent('game_over', { score: newScore, highestTile: newHighestTile });

        storageService.loadStats().then((stats) => {
          const updated: GameStats = {
            totalGames: stats.totalGames + 1,
            wins: stats.wins + (hasWonState || won ? 1 : 0),
            totalScore: stats.totalScore + newScore,
            highestScore: Math.max(stats.highestScore, newBestScore),
            highestTile: Math.max(stats.highestTile, newHighestTile),
            totalMoves: stats.totalMoves + newMoves,
            totalMerges: stats.totalMerges + newMerges,
          };
          storageService.saveStats(updated);
        });
      }

      setBoard(res.board);
      setScore(newScore);
      if (newBestScore > bestScore) {
        setBestScore(newBestScore);
        storageService.saveBestScore(newBestScore);
      }
      setHighestTile(newHighestTile);
      setMovesCount(newMoves);
      setMergesCount(newMerges);
      setHistory((prev) => [...prev.slice(-MAX_UNDO_HISTORY + 1), snapshot]);
      setSelectedTile(null);
      adsService.recordMove();
      return true;
    },
    [
      board,
      score,
      bestScore,
      highestTile,
      movesCount,
      mergesCount,
      isGameOverState,
      hasWonState,
      activePowerUp,
    ]
  );

  // Handle Tile Tap (supports Hammer mode, and Tap-to-Select / Tap-to-Merge)
  const handleTilePress = useCallback(
    async (row: number, col: number) => {
      // 1. Hammer power-up active
      if (activePowerUp === 'HAMMER') {
        const canUse = await currencyService.usePowerUp('hammer');
        if (!canUse) {
          setActivePowerUp(null);
          return;
        }

        const res = applyHammer(board, row, col);
        if (res.success) {
          // Refill emptied spot with new random number
          const refilledBoard = cloneBoard(res.board);
          const highest = getHighestTile(refilledBoard);
          refilledBoard[row][col] = {
            id: `tile_${Date.now()}`,
            value: 2,
            row,
            col,
            isNew: true,
          };
          setBoard(refilledBoard);
          hapticsService.medium();
          soundService.playMerge(res.removedValue);
          analyticsService.logEvent('powerup_used', { type: 'hammer' });
        }
        setActivePowerUp(null);
        return;
      }

      // 2. Tap to select and merge
      if (!selectedTile) {
        setSelectedTile({ row, col });
        soundService.playClick();
        hapticsService.light();
      } else if (selectedTile.row === row && selectedTile.col === col) {
        // Deselect if tapping the same tile
        setSelectedTile(null);
      } else {
        // Attempt merge from selectedTile to tapped tile
        const merged = handleDragMerge(selectedTile.row, selectedTile.col, row, col);
        if (!merged) {
          // If not a valid merge, select the newly tapped tile instead
          setSelectedTile({ row, col });
          soundService.playClick();
        }
      }
    },
    [activePowerUp, board, selectedTile, handleDragMerge]
  );

  // Directional Swipe fallback
  const handleMove = useCallback(
    (direction: Direction): boolean => {
      // Allow directional move if preferred
      return false;
    },
    []
  );

  // Undo Move
  const handleUndo = useCallback(async (): Promise<boolean> => {
    if (history.length === 0 || isGameOverState) return false;

    const canUse = await currencyService.usePowerUp('undo');
    if (!canUse) return false;

    const previousSnapshot = history[history.length - 1];
    setBoard(previousSnapshot.board);
    setScore(previousSnapshot.score);
    setHighestTile(previousSnapshot.highestTile);
    setMovesCount(previousSnapshot.movesCount);
    setHistory((prev) => prev.slice(0, -1));
    setSelectedTile(null);
    hapticsService.light();
    soundService.playClick();
    analyticsService.logEvent('powerup_used', { type: 'undo' });
    return true;
  }, [history, isGameOverState]);

  // Activate Hammer Mode
  const activateHammer = useCallback(() => {
    setSelectedTile(null);
    setActivePowerUp((prev) => (prev === 'HAMMER' ? null : 'HAMMER'));
  }, []);

  // Shuffle Power-up
  const handleShuffle = useCallback(async (): Promise<boolean> => {
    const canUse = await currencyService.usePowerUp('shuffle');
    if (!canUse) return false;

    const res = applyShuffle(board);
    if (res.success) {
      setBoard(res.board);
      setSelectedTile(null);
      hapticsService.medium();
      soundService.playClick();
      analyticsService.logEvent('powerup_used', { type: 'shuffle' });
      return true;
    }
    return false;
  }, [board]);

  // Revive / Continue Game
  const handleRevive = useCallback(() => {
    // Re-roll 4 tiles to guarantee matching pairs
    const newBoard = createFullBoard(size);
    setBoard(newBoard);
    setIsGameOverState(false);
    setHasContinuedState(true);
    setSelectedTile(null);
    hapticsService.success();
    analyticsService.logEvent('continue_clicked');
  }, [size]);

  // Restart / New Game
  const handleRestart = useCallback(
    (newSize: BoardSize = size) => {
      const newBoard = createFullBoard(newSize);
      setBoard(newBoard);
      setSize(newSize);
      setScore(0);
      setHighestTile(getHighestTile(newBoard));
      setMovesCount(0);
      setMergesCount(0);
      setIsGameOverState(false);
      setHasWonState(false);
      setHasContinuedState(false);
      setHistory([]);
      setActivePowerUp(null);
      setSelectedTile(null);
      setShowCelebration(false);
      storageService.clearCurrentGame();
      analyticsService.logEvent('game_started', { size: newSize });
    },
    [size]
  );

  return {
    board,
    size,
    score,
    bestScore,
    highestTile,
    movesCount,
    mergesCount,
    isGameOver: isGameOverState,
    hasWon: hasWonState,
    hasContinued: hasContinuedState,
    canUndo: history.length > 0 && !isGameOverState,
    undoHistoryLength: history.length,
    activePowerUp,
    selectedTile,
    showCelebration,
    dismissCelebration: () => setShowCelebration(false),
    handleMove,
    handleDragMerge,
    handleTilePress,
    handleUndo,
    activateHammer,
    handleShuffle,
    handleRevive,
    handleRestart,
  };
}
