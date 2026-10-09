import { currencyService } from '../currency/currencyService';
import { DailyRewardService, DAILY_REWARD_LADDER } from '../dailyReward/dailyRewardService';
import { storageService, DEFAULT_SETTINGS } from '../storage/storageService';

describe('Services Test Suite', () => {
  beforeEach(async () => {
    await currencyService.init();
  });

  describe('CurrencyService', () => {
    it('manages coins balance accurately without negative values', async () => {
      const initial = currencyService.getWallet().coins;
      await currencyService.addCoins(50);
      expect(currencyService.getWallet().coins).toBe(initial + 50);

      const canSpend = currencyService.canAfford(30);
      expect(canSpend).toBe(true);

      const spent = await currencyService.spendCoins(30);
      expect(spent).toBe(true);
      expect(currencyService.getWallet().coins).toBe(initial + 20);

      // Attempt to spend more than available
      const overspend = await currencyService.spendCoins(999999);
      expect(overspend).toBe(false);
      // Balance remains unchanged
      expect(currencyService.getWallet().coins).toBe(initial + 20);
    });

    it('tracks power-up counts and consumption', async () => {
      await currencyService.addPowerUp('hammer', 2);
      const walletBefore = currencyService.getWallet();
      const countBefore = walletBefore.powerUps.hammerCount;

      const used = await currencyService.usePowerUp('hammer');
      expect(used).toBe(true);
      expect(currencyService.getWallet().powerUps.hammerCount).toBe(countBefore - 1);
    });

    it('removes ads upon purchase', async () => {
      expect(currencyService.getWallet().adsRemoved).toBe(false);
      await currencyService.removeAds();
      expect(currencyService.getWallet().adsRemoved).toBe(true);
    });
  });

  describe('DailyRewardService', () => {
    it('initializes Day 1 for new players and calculates rewards', async () => {
      const service = new DailyRewardService();
      const status = await service.getStatus();
      expect(status.canClaim).toBe(true);
      expect(status.streakDay).toBe(1);
      expect(status.nextRewardAmount).toBe(DAILY_REWARD_LADDER[0]);
    });

    it('claims reward and awards coins with optional multiplier', async () => {
      const service = new DailyRewardService();
      const initialCoins = currencyService.getWallet().coins;
      const res = await service.claimReward(2); // 2x multiplier (ad watched)

      expect(res.amountReceived).toBe(DAILY_REWARD_LADDER[0] * 2);
      expect(currencyService.getWallet().coins).toBe(initialCoins + res.amountReceived);

      // Verify cannot claim twice on same day
      const statusAfter = await service.getStatus();
      expect(statusAfter.canClaim).toBe(false);
    });
  });

  describe('StorageService', () => {
    it('returns default settings when none stored', async () => {
      const settings = await storageService.loadSettings();
      expect(settings).toBeDefined();
      expect(settings.boardSize).toBe(4);
    });

    it('recovers gracefully from corrupted game storage', async () => {
      // Simulate invalid corrupted payload
      (storageService as any).memoryStorage?.set('@number_merge_current_game_v1', '{invalid_json}');
      const loaded = await storageService.loadCurrentGame();
      expect(loaded).toBeNull();
    });
  });
});
