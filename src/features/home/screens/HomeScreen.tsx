import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoardSize, GameState } from '../../../types/game';
import { useTheme } from '../../../theme/ThemeContext';
import { Button } from '../../../components/common/Button';
import { storageService } from '../../../services/storage/storageService';
import { currencyService } from '../../../services/currency/currencyService';
import { dailyRewardService } from '../../../services/dailyReward/dailyRewardService';
import { WalletState } from '../../../types/monetization';
import { DailyRewardModal } from '../../shop/components/DailyRewardModal';
import { hapticsService } from '../../../services/haptics/hapticsService';
import { soundService } from '../../../services/sound/soundService';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [bestScore, setBestScore] = useState<number>(0);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<BoardSize>(4);
  const [wallet, setWallet] = useState<WalletState>(currencyService.getWallet());
  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState<boolean>(false);

  // Logo floating animation
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // Load state on mount / update
  useEffect(() => {
    const unsubscribe = currencyService.subscribe(setWallet);

    const refreshData = async () => {
      const best = await storageService.loadBestScore();
      setBestScore(best);

      const savedGame: GameState | null = await storageService.loadCurrentGame();
      if (savedGame && !savedGame.isGameOver && savedGame.score > 0) {
        setHasSavedGame(true);
        setSelectedSize(savedGame.size);
      } else {
        setHasSavedGame(false);
      }

      const daily = await dailyRewardService.getStatus();
      setCanClaimDaily(daily.canClaim);
    };

    refreshData();
    return () => unsubscribe();
  }, []);

  const handleStartGame = (continueExisting: boolean) => {
    if (!continueExisting) {
      storageService.clearCurrentGame();
    }
    router.push({
      pathname: '/game',
      params: { size: selectedSize, continueExisting: continueExisting ? 'true' : 'false' },
    });
  };

  const handleBottomNav = (path: '/stats' | '/shop' | '/settings') => {
    hapticsService.light();
    soundService.playClick();
    router.push(path);
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={styles.container}>
        {/* Top Wallet & Daily Reward Bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.push('/shop')}
            style={[
              styles.coinPill,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.warning,
              },
            ]}
          >
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={[styles.coinText, { color: theme.colors.warning }]}>
              {wallet.coins.toLocaleString()}
            </Text>
            <View style={styles.plusCircle}>
              <Text style={styles.plusText}>+</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setShowDailyRewardModal(true)}
            style={[
              styles.dailyBadge,
              {
                backgroundColor: canClaimDaily
                  ? theme.colors.warning
                  : theme.colors.surfaceElevated,
                borderColor: canClaimDaily ? '#FBBF24' : theme.colors.border,
              },
            ]}
          >
            <Text style={styles.dailyBadgeIcon}>🎁</Text>
            <Text
              style={[
                styles.dailyBadgeText,
                { color: canClaimDaily ? '#000000' : theme.colors.textPrimary },
              ]}
            >
              {canClaimDaily ? 'REWARD READY!' : 'Daily Bonus'}
            </Text>
          </Pressable>
        </View>

        {/* Hero Header & Title */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.logoBadge,
              {
                backgroundColor: theme.colors.accent,
                shadowColor: theme.colors.accent,
                transform: [{ translateY: floatAnim }],
              },
            ]}
          >
            <Text style={styles.logoBadgeText}>2048+ INFINITY</Text>
          </Animated.View>

          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            NUMBER MERGE
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Drag • Merge • Reach Infinity
          </Text>

          {/* High Score Banner Card */}
          <View
            style={[
              styles.highScoreCard,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.trophyContainer}>
              <Text style={styles.trophyIcon}>🏆</Text>
            </View>
            <View style={styles.scoreTextGroup}>
              <Text style={[styles.highScoreLabel, { color: theme.colors.textSecondary }]}>
                ALL-TIME HIGH SCORE
              </Text>
              <Text style={[styles.highScoreValue, { color: theme.colors.accent }]}>
                {bestScore.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Board Size Selector */}
        <View style={styles.sizeSection}>
          <Text style={[styles.sizeLabel, { color: theme.colors.textSecondary }]}>
            SELECT GRID SIZE
          </Text>
          <View style={styles.sizeButtons}>
            {([4, 5, 6] as BoardSize[]).map((size) => {
              const isSelected = selectedSize === size;
              return (
                <Pressable
                  key={`home_size_${size}`}
                  onPress={() => {
                    hapticsService.light();
                    setSelectedSize(size);
                  }}
                  style={[
                    styles.sizeBtn,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.accent
                        : theme.colors.surfaceElevated,
                      borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                      shadowColor: isSelected ? theme.colors.accent : '#000',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeBtnText,
                      { color: isSelected ? '#000000' : theme.colors.textPrimary },
                    ]}
                  >
                    {size} × {size}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.actionsSection}>
          {hasSavedGame && (
            <Button
              title="CONTINUE GAME ▶"
              variant="accent"
              size="lg"
              onPress={() => handleStartGame(true)}
              style={styles.mainBtn}
            />
          )}

          <Button
            title={hasSavedGame ? 'NEW GAME' : 'PLAY NOW ▶'}
            variant="primary"
            size="lg"
            onPress={() => handleStartGame(false)}
            style={styles.mainBtn}
          />

          {/* Bottom Navigation Dock - Exact Same Size for all 3 buttons */}
          <View style={styles.bottomDock}>
            <Pressable
              onPress={() => handleBottomNav('/stats')}
              style={[
                styles.dockBtn,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.dockIcon}>📊</Text>
              <Text
                numberOfLines={1}
                style={[styles.dockLabel, { color: theme.colors.textPrimary }]}
              >
                Stats
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleBottomNav('/shop')}
              style={[
                styles.dockBtn,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.dockIcon}>🛒</Text>
              <Text
                numberOfLines={1}
                style={[styles.dockLabel, { color: theme.colors.textPrimary }]}
              >
                Shop
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleBottomNav('/settings')}
              style={[
                styles.dockBtn,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.dockIcon}>⚙️</Text>
              <Text
                numberOfLines={1}
                style={[styles.dockLabel, { color: theme.colors.textPrimary }]}
              >
                Settings
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <DailyRewardModal
        visible={showDailyRewardModal}
        onClose={() => setShowDailyRewardModal(false)}
        onClaimSuccess={() => setCanClaimDaily(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  topBar: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '900',
    marginRight: 6,
  },
  plusCircle: {
    backgroundColor: '#38BDF8',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 14,
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  dailyBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  heroSection: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
  },
  logoBadge: {
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  logoBadgeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  highScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 12,
    width: '100%',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyIcon: {
    fontSize: 26,
  },
  scoreTextGroup: {
    flex: 1,
  },
  highScoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  highScoreValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  sizeSection: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 8,
  },
  sizeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  sizeBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sizeBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionsSection: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
  mainBtn: {
    width: '100%',
  },
  bottomDock: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  dockBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dockIcon: {
    fontSize: 16,
  },
  dockLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
