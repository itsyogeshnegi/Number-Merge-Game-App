import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { currencyService } from '../../../services/currency/currencyService';
import { adsService } from '../../../services/ads/adsService';
import { soundService } from '../../../services/sound/soundService';
import { WalletState } from '../../../types/monetization';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [wallet, setWallet] = useState<WalletState>(currencyService.getWallet());
  const [watchingAd, setWatchingAd] = useState(false);

  useEffect(() => {
    return currencyService.subscribe(setWallet);
  }, []);

  const handleWatchAdForCoins = async () => {
    setWatchingAd(true);
    const res = await adsService.showRewarded('+100 Free Coins');
    setWatchingAd(false);
    if (res.rewarded) {
      await currencyService.addCoins(100);
      soundService.playCoin();
    }
  };

  const handleRemoveAdsPurchase = async () => {
    // Commercial in-app purchase simulation
    await currencyService.removeAds();
    soundService.playCoin();
  };

  const handleBuyPowerUp = async (type: 'undo' | 'hammer' | 'shuffle', cost: number) => {
    if (!currencyService.canAfford(cost)) {
      alert('Not enough coins! Watch a quick video to earn more.');
      return;
    }
    const spent = await currencyService.spendCoins(cost);
    if (spent) {
      await currencyService.addPowerUp(type, 3);
      soundService.playCoin();
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Item Shop & Bank">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Wallet Balance Display */}
        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.warning,
            },
          ]}
        >
          <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
            YOUR COIN BALANCE
          </Text>
          <View style={styles.coinRow}>
            <Text style={styles.largeCoin}>🪙</Text>
            <Text style={[styles.balanceText, { color: theme.colors.warning }]}>
              {wallet.coins.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Free Coins via Rewarded Ad */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.itemIcon}>🎬</Text>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                Free Coins Sponsor
              </Text>
              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                Watch a short sponsor video for +100 Coins
              </Text>
            </View>
          </View>
          <Button
            title={watchingAd ? 'Playing Video...' : 'Watch for +100 🪙'}
            variant="accent"
            size="sm"
            disabled={watchingAd}
            onPress={handleWatchAdForCoins}
            style={styles.cardBtn}
          />
        </View>

        {/* Premium: Remove Ads */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.accent,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.itemIcon}>🚫</Text>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                Remove Ads Forever
              </Text>
              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                Never see interstitial banners again
              </Text>
            </View>
          </View>
          <Button
            title={wallet.adsRemoved ? 'Active ✓' : 'Get Premium (₹79 / $0.99)'}
            variant={wallet.adsRemoved ? 'secondary' : 'primary'}
            size="sm"
            disabled={wallet.adsRemoved}
            onPress={handleRemoveAdsPurchase}
            style={styles.cardBtn}
          />
        </View>

        {/* Power-up Packs */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Power-up Bundles
        </Text>

        {/* 3x Undo */}
        <View
          style={[
            styles.powerupRow,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.powerupInfo}>
            <Text style={styles.itemIcon}>↩️</Text>
            <View>
              <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                3x Undo Pack
              </Text>
              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                Current: {wallet.powerUps.undoCount} remaining
              </Text>
            </View>
          </View>
          <Button
            title="100 🪙"
            variant="outline"
            size="sm"
            onPress={() => handleBuyPowerUp('undo', 100)}
          />
        </View>

        {/* 3x Hammer */}
        <View
          style={[
            styles.powerupRow,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.powerupInfo}>
            <Text style={styles.itemIcon}>🔨</Text>
            <View>
              <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                3x Hammer Pack
              </Text>
              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                Current: {wallet.powerUps.hammerCount} remaining
              </Text>
            </View>
          </View>
          <Button
            title="120 🪙"
            variant="outline"
            size="sm"
            onPress={() => handleBuyPowerUp('hammer', 120)}
          />
        </View>

        {/* 3x Shuffle */}
        <View
          style={[
            styles.powerupRow,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.powerupInfo}>
            <Text style={styles.itemIcon}>🔀</Text>
            <View>
              <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
                3x Shuffle Pack
              </Text>
              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                Current: {wallet.powerUps.shuffleCount} remaining
              </Text>
            </View>
          </View>
          <Button
            title="120 🪙"
            variant="outline"
            size="sm"
            onPress={() => handleBuyPowerUp('shuffle', 120)}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 8,
  },
  balanceCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  largeCoin: {
    fontSize: 22,
    marginRight: 6,
  },
  balanceText: {
    fontSize: 26,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  cardBtn: {
    width: '100%',
  },
  powerupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  powerupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
