import { WalletState } from '../../types/monetization';
import { storageService, DEFAULT_WALLET } from '../storage/storageService';

type WalletListener = (wallet: WalletState) => void;

class CurrencyService {
  private currentWallet: WalletState = { ...DEFAULT_WALLET };
  private listeners: Set<WalletListener> = new Set();
  private initialized: boolean = false;

  async init(): Promise<WalletState> {
    if (!this.initialized) {
      this.currentWallet = await storageService.loadWallet();
      this.initialized = true;
    }
    return this.currentWallet;
  }

  getWallet(): WalletState {
    return this.currentWallet;
  }

  subscribe(listener: WalletListener): () => void {
    this.listeners.add(listener);
    listener(this.currentWallet);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.currentWallet }));
    storageService.saveWallet(this.currentWallet);
  }

  canAfford(amount: number): boolean {
    return this.currentWallet.coins >= amount;
  }

  async addCoins(amount: number): Promise<number> {
    if (amount <= 0) return this.currentWallet.coins;
    this.currentWallet.coins += Math.round(amount);
    this.notify();
    return this.currentWallet.coins;
  }

  async spendCoins(amount: number): Promise<boolean> {
    if (amount <= 0) return true;
    if (this.currentWallet.coins < amount) return false;

    this.currentWallet.coins -= Math.round(amount);
    this.notify();
    return true;
  }

  async removeAds(): Promise<void> {
    this.currentWallet.adsRemoved = true;
    this.notify();
  }

  async usePowerUp(type: 'undo' | 'hammer' | 'shuffle'): Promise<boolean> {
    const key = `${type}Count` as keyof typeof this.currentWallet.powerUps;
    const currentCount = this.currentWallet.powerUps[key];

    if (currentCount > 0) {
      this.currentWallet.powerUps[key] -= 1;
      this.notify();
      return true;
    }

    // If no free charges left, check if player has enough coins to purchase one on the fly (50 coins)
    const coinCost = 50;
    if (this.canAfford(coinCost)) {
      await this.spendCoins(coinCost);
      return true;
    }

    return false;
  }

  async addPowerUp(type: 'undo' | 'hammer' | 'shuffle', count: number = 1): Promise<void> {
    const key = `${type}Count` as keyof typeof this.currentWallet.powerUps;
    this.currentWallet.powerUps[key] += count;
    this.notify();
  }
}

export const currencyService = new CurrencyService();
