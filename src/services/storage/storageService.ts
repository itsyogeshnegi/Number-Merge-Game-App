import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSnapshot, GameState, GameStats, UserSettings } from '../../types/game';
import { DailyRewardStatus, WalletState } from '../../types/monetization';

const STORAGE_KEYS = {
  CURRENT_GAME: '@number_merge_current_game_v1',
  BEST_SCORE: '@number_merge_best_score_v1',
  USER_SETTINGS: '@number_merge_settings_v1',
  GAME_STATS: '@number_merge_stats_v1',
  WALLET: '@number_merge_wallet_v1',
  DAILY_REWARD: '@number_merge_daily_reward_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
  boardSize: 4,
  hasSeenTutorial: false,
};

export const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  totalScore: 0,
  highestScore: 0,
  highestTile: 0,
  totalMoves: 0,
  totalMerges: 0,
};

export const DEFAULT_WALLET: WalletState = {
  coins: 100, // starting welcome bonus
  adsRemoved: false,
  powerUps: {
    undoCount: 3,
    hammerCount: 1,
    shuffleCount: 1,
  },
};

export const DEFAULT_DAILY_REWARD: DailyRewardStatus = {
  lastClaimDate: null,
  streakDay: 1,
  canClaim: true,
  nextRewardAmount: 50,
};

// In-memory fallback in case AsyncStorage encounters an environment issue
const memoryStorage = new Map<string, string>();

class StorageService {
  private async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryStorage.set(key, value);
    }
  }

  private async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
      return memoryStorage.get(key) ?? null;
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  }

  private async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memoryStorage.delete(key);
    }
  }

  // --- CURRENT GAME PERSISTENCE ---
  async saveCurrentGame(state: GameState): Promise<void> {
    try {
      const serializable = {
        board: state.board,
        size: state.size,
        score: state.score,
        bestScore: state.bestScore,
        highestTile: state.highestTile,
        movesCount: state.movesCount,
        mergesCount: state.mergesCount,
        isGameOver: state.isGameOver,
        hasWon: state.hasWon,
        hasContinued: state.hasContinued,
        history: state.history.slice(-5), // Keep max 5 snapshots
      };
      await this.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(serializable));
    } catch (err) {
      console.warn('StorageService: Failed to save game state', err);
    }
  }

  async loadCurrentGame(): Promise<GameState | null> {
    try {
      const raw = await this.getItem(STORAGE_KEYS.CURRENT_GAME);
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      // Validate parsed game structure
      if (
        !parsed ||
        !Array.isArray(parsed.board) ||
        typeof parsed.score !== 'number' ||
        isNaN(parsed.score)
      ) {
        return null;
      }

      return {
        board: parsed.board,
        size: parsed.size || 4,
        score: parsed.score || 0,
        bestScore: parsed.bestScore || 0,
        highestTile: parsed.highestTile || 0,
        movesCount: parsed.movesCount || 0,
        mergesCount: parsed.mergesCount || 0,
        isGameOver: !!parsed.isGameOver,
        hasWon: !!parsed.hasWon,
        hasContinued: !!parsed.hasContinued,
        history: Array.isArray(parsed.history) ? parsed.history : [],
        activePowerUp: null,
      };
    } catch (err) {
      console.warn('StorageService: Corrupted saved game, clearing', err);
      await this.clearCurrentGame();
      return null;
    }
  }

  async clearCurrentGame(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.CURRENT_GAME);
  }

  // --- BEST SCORE ---
  async saveBestScore(score: number): Promise<void> {
    try {
      const current = await this.loadBestScore();
      if (score > current) {
        await this.setItem(STORAGE_KEYS.BEST_SCORE, score.toString());
      }
    } catch (err) {
      console.warn('StorageService: Failed to save best score', err);
    }
  }

  async loadBestScore(): Promise<number> {
    try {
      const raw = await this.getItem(STORAGE_KEYS.BEST_SCORE);
      const val = Number(raw);
      return !isNaN(val) && val > 0 ? val : 0;
    } catch {
      return 0;
    }
  }

  // --- USER SETTINGS ---
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('StorageService: Failed to save settings', err);
    }
  }

  async loadSettings(): Promise<UserSettings> {
    try {
      const raw = await this.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  // --- GAME STATS ---
  async saveStats(stats: GameStats): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
    } catch (err) {
      console.warn('StorageService: Failed to save game stats', err);
    }
  }

  async loadStats(): Promise<GameStats> {
    try {
      const raw = await this.getItem(STORAGE_KEYS.GAME_STATS);
      if (!raw) return DEFAULT_STATS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATS, ...parsed };
    } catch {
      return DEFAULT_STATS;
    }
  }

  // --- WALLET / MONETIZATION ---
  async saveWallet(wallet: WalletState): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    } catch (err) {
      console.warn('StorageService: Failed to save wallet', err);
    }
  }

  async loadWallet(): Promise<WalletState> {
    try {
      const raw = await this.getItem(STORAGE_KEYS.WALLET);
      if (!raw) return DEFAULT_WALLET;
      const parsed = JSON.parse(raw);
      return {
        coins: Math.max(0, parsed.coins ?? DEFAULT_WALLET.coins),
        adsRemoved: !!parsed.adsRemoved,
        powerUps: {
          undoCount: Math.max(0, parsed.powerUps?.undoCount ?? DEFAULT_WALLET.powerUps.undoCount),
          hammerCount: Math.max(0, parsed.powerUps?.hammerCount ?? DEFAULT_WALLET.powerUps.hammerCount),
          shuffleCount: Math.max(0, parsed.powerUps?.shuffleCount ?? DEFAULT_WALLET.powerUps.shuffleCount),
        },
      };
    } catch {
      return DEFAULT_WALLET;
    }
  }

  // --- DAILY REWARD ---
  async saveDailyReward(reward: DailyRewardStatus): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.DAILY_REWARD, JSON.stringify(reward));
    } catch (err) {
      console.warn('StorageService: Failed to save daily reward', err);
    }
  }

  async loadDailyReward(): Promise<DailyRewardStatus> {
    try {
      const raw = await this.getItem(STORAGE_KEYS.DAILY_REWARD);
      if (!raw) return DEFAULT_DAILY_REWARD;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DAILY_REWARD, ...parsed };
    } catch {
      return DEFAULT_DAILY_REWARD;
    }
  }
}

export const storageService = new StorageService();
