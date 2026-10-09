export interface DailyRewardStatus {
  lastClaimDate: string | null; // ISO Date string (YYYY-MM-DD)
  streakDay: number; // 1 to 7
  canClaim: boolean;
  nextRewardAmount: number;
}

export interface WalletState {
  coins: number;
  adsRemoved: boolean;
  powerUps: {
    undoCount: number;
    hammerCount: number;
    shuffleCount: number;
  };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  priceCoins?: number;
  priceRealCurrency?: string;
  type: 'COINS' | 'REMOVE_ADS' | 'POWERUP_UNDO' | 'POWERUP_HAMMER' | 'POWERUP_SHUFFLE';
  amount?: number;
  icon: string;
  popular?: boolean;
}
