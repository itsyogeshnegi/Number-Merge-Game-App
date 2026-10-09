import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../theme/ThemeContext';
import {
  dailyRewardService,
  DAILY_REWARD_LADDER,
} from '../../../services/dailyReward/dailyRewardService';
import { DailyRewardStatus } from '../../../types/monetization';
import { adsService } from '../../../services/ads/adsService';
import { soundService } from '../../../services/sound/soundService';

interface DailyRewardModalProps {
  visible: boolean;
  onClose: () => void;
  onClaimSuccess?: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  visible,
  onClose,
  onClaimSuccess,
}) => {
  const { theme } = useTheme();
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (visible) {
      dailyRewardService.getStatus().then(setStatus);
    }
  }, [visible]);

  if (!status) return null;

  const handleClaim = async (multiplier: number = 1) => {
    setClaiming(true);
    if (multiplier > 1) {
      const adResult = await adsService.showRewarded('Double Daily Reward');
      if (!adResult.rewarded) {
        setClaiming(false);
        return;
      }
    }

    const res = await dailyRewardService.claimReward(multiplier);
    setClaiming(false);
    if (res.amountReceived > 0) {
      soundService.playCoin();
      onClaimSuccess?.();
      onClose();
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Daily Streak Rewards">
      <View style={styles.container}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Log in every day to collect escalating coin rewards!
        </Text>

        {/* 7 Day Ladder Grid */}
        <View style={styles.grid}>
          {DAILY_REWARD_LADDER.map((amount, index) => {
            const dayNum = index + 1;
            const isCurrent = status.streakDay === dayNum;
            const isCompleted = status.streakDay > dayNum;

            return (
              <View
                key={`day_${dayNum}`}
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: isCurrent
                      ? theme.colors.surfaceElevated
                      : theme.colors.surface,
                    borderColor: isCurrent
                      ? theme.colors.warning
                      : theme.colors.border,
                    borderWidth: isCurrent ? 2 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayTitle,
                    {
                      color: isCurrent
                        ? theme.colors.warning
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  Day {dayNum}
                </Text>
                <Text style={styles.coinIcon}>{isCompleted ? '✅' : '🪙'}</Text>
                <Text
                  style={[
                    styles.coinAmount,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  +{amount}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Claim Buttons */}
        <View style={styles.actions}>
          {status.canClaim ? (
            <>
              <Button
                title={
                  claiming
                    ? 'Claiming...'
                    : `Claim 2x Reward (+${status.nextRewardAmount * 2} 🪙) 🎬`
                }
                variant="accent"
                size="lg"
                disabled={claiming}
                onPress={() => handleClaim(2)}
                style={styles.button}
              />
              <Button
                title={`Claim (+${status.nextRewardAmount} 🪙)`}
                variant="primary"
                size="md"
                disabled={claiming}
                onPress={() => handleClaim(1)}
                style={styles.button}
              />
            </>
          ) : (
            <View style={styles.claimedNotice}>
              <Text style={[styles.claimedText, { color: theme.colors.success }]}>
                ✓ You have already claimed today's reward! Come back tomorrow for Day{' '}
                {status.streakDay}.
              </Text>
              <Button
                title="Got it"
                variant="secondary"
                size="md"
                onPress={onClose}
                style={{ ...styles.button, marginTop: 12 }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginBottom: 20,
  },
  dayCard: {
    width: '22%',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTitle: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  coinIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  coinAmount: {
    fontSize: 11,
    fontWeight: '900',
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
  },
  claimedNotice: {
    width: '100%',
    alignItems: 'center',
  },
  claimedText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
});
