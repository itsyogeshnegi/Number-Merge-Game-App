import { currencyService } from '../currency/currencyService';

export interface AdRequestConfig {
  type: 'REWARDED' | 'INTERSTITIAL';
  title: string;
  rewardDescription?: string;
  durationSeconds: number;
}

export type AdUIHandler = (
  config: AdRequestConfig,
  onComplete: () => void,
  onCancel: () => void
) => void;

class AdsService {
  private adUIHandler: AdUIHandler | null = null;
  private movesSinceLastAd = 0;
  private gamesSinceLastAd = 0;
  private lastInterstitialTimestamp = 0;

  // Configurable thresholds for healthy monetization balance
  readonly MIN_MOVES_BEFORE_INTERSTITIAL = 25;
  readonly MIN_GAMES_BEFORE_INTERSTITIAL = 2;
  readonly MIN_INTERVAL_SECONDS = 90;

  registerUIHandler(handler: AdUIHandler) {
    this.adUIHandler = handler;
  }

  recordMove() {
    this.movesSinceLastAd += 1;
  }

  recordGameCompleted() {
    this.gamesSinceLastAd += 1;
  }

  shouldShowInterstitial(): boolean {
    const wallet = currencyService.getWallet();
    if (wallet.adsRemoved) {
      return false;
    }

    const now = Date.now();
    const timeElapsedSec = (now - this.lastInterstitialTimestamp) / 1000;

    const hasEnoughMoves = this.movesSinceLastAd >= this.MIN_MOVES_BEFORE_INTERSTITIAL;
    const hasEnoughGames = this.gamesSinceLastAd >= this.MIN_GAMES_BEFORE_INTERSTITIAL;
    const hasCooledDown = timeElapsedSec >= this.MIN_INTERVAL_SECONDS;

    return (hasEnoughMoves || hasEnoughGames) && hasCooledDown;
  }

  async showInterstitial(context: string): Promise<boolean> {
    if (!this.shouldShowInterstitial()) {
      return false;
    }

    if (!this.adUIHandler) {
      // In automated/headless environments, mark as shown
      this.movesSinceLastAd = 0;
      this.gamesSinceLastAd = 0;
      this.lastInterstitialTimestamp = Date.now();
      return true;
    }

    return new Promise((resolve) => {
      this.adUIHandler!(
        {
          type: 'INTERSTITIAL',
          title: `Sponsor Break (${context})`,
          durationSeconds: 3,
        },
        () => {
          this.movesSinceLastAd = 0;
          this.gamesSinceLastAd = 0;
          this.lastInterstitialTimestamp = Date.now();
          resolve(true);
        },
        () => {
          resolve(false);
        }
      );
    });
  }

  isRewardedReady(): boolean {
    return true; // Always ready to serve
  }

  async showRewarded(
    rewardDescription: string = 'Game Reward'
  ): Promise<{ rewarded: boolean }> {
    if (!this.adUIHandler) {
      return { rewarded: true };
    }

    return new Promise((resolve) => {
      this.adUIHandler!(
        {
          type: 'REWARDED',
          title: 'Watch Ad for Reward',
          rewardDescription,
          durationSeconds: 5,
        },
        () => {
          resolve({ rewarded: true });
        },
        () => {
          resolve({ rewarded: false });
        }
      );
    });
  }
}

export const adsService = new AdsService();
