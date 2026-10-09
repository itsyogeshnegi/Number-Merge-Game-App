import { DailyRewardStatus } from '../../types/monetization';
import { currencyService } from '../currency/currencyService';
import { storageService, DEFAULT_DAILY_REWARD } from '../storage/storageService';

export const DAILY_REWARD_LADDER = [50, 75, 100, 150, 200, 300, 500];

export class DailyRewardService {
  private status: DailyRewardStatus = { ...DEFAULT_DAILY_REWARD };

  private getTodayString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
  }

  private getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(
      yesterday.getDate()
    ).padStart(2, '0')}`;
  }

  async getStatus(): Promise<DailyRewardStatus> {
    this.status = await storageService.loadDailyReward();
    const today = this.getTodayString();
    const yesterday = this.getYesterdayString();

    if (!this.status.lastClaimDate) {
      // First time user
      this.status.canClaim = true;
      this.status.streakDay = 1;
    } else if (this.status.lastClaimDate === today) {
      // Already claimed today
      this.status.canClaim = false;
    } else if (this.status.lastClaimDate === yesterday) {
      // Claimed yesterday, can advance streak today!
      this.status.canClaim = true;
    } else {
      // Missed one or more days, reset streak to 1
      this.status.canClaim = true;
      this.status.streakDay = 1;
    }

    const currentRewardIndex = (this.status.streakDay - 1) % DAILY_REWARD_LADDER.length;
    this.status.nextRewardAmount = DAILY_REWARD_LADDER[currentRewardIndex];

    return { ...this.status };
  }

  async claimReward(multiplier: number = 1): Promise<{ amountReceived: number; newStreak: number }> {
    const status = await this.getStatus();
    if (!status.canClaim) {
      return { amountReceived: 0, newStreak: status.streakDay };
    }

    const rewardBase = status.nextRewardAmount;
    const finalAmount = rewardBase * multiplier;

    await currencyService.addCoins(finalAmount);

    const today = this.getTodayString();
    const nextStreak = (status.streakDay % 7) + 1;

    this.status = {
      lastClaimDate: today,
      streakDay: nextStreak,
      canClaim: false,
      nextRewardAmount: DAILY_REWARD_LADDER[(nextStreak - 1) % DAILY_REWARD_LADDER.length],
    };

    await storageService.saveDailyReward(this.status);
    return { amountReceived: finalAmount, newStreak: this.status.streakDay };
  }
}

export const dailyRewardService = new DailyRewardService();
