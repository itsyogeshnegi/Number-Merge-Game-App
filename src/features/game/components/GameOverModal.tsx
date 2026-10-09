import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { adsService } from '../../../services/ads/adsService';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  bestScore: number;
  highestTile: number;
  hasContinued: boolean;
  onRevive: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  bestScore,
  highestTile,
  hasContinued,
  onRevive,
  onRestart,
  onGoHome,
}) => {
  const { theme } = useTheme();
  const [loadingAd, setLoadingAd] = useState(false);

  const handleWatchAdToRevive = async () => {
    setLoadingAd(true);
    const result = await adsService.showRewarded('Revive Game & Clear Lowest Tiles');
    setLoadingAd(false);
    if (result.rewarded) {
      onRevive();
    }
  };

  const isNewRecord = score >= bestScore && score > 0;

  return (
    <Modal visible={visible} onClose={onRestart} title="Game Over" showCloseButton={false}>
      <View style={styles.container}>
        <Text style={styles.skull}>💀</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          No More Moves!
        </Text>

        {isNewRecord && (
          <View style={[styles.recordBadge, { backgroundColor: theme.colors.warning }]}>
            <Text style={styles.recordText}>🎉 NEW HIGH SCORE! 🎉</Text>
          </View>
        )}

        {/* Stats Summary */}
        <View
          style={[
            styles.statsBox,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Final Score:
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
              {score.toLocaleString()}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Best Score:
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>
              {bestScore.toLocaleString()}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Highest Tile:
            </Text>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {highestTile}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!hasContinued && (
            <Button
              title={loadingAd ? 'Loading Ad...' : 'Revive Game (Watch Ad 🎬)'}
              variant="accent"
              size="lg"
              disabled={loadingAd}
              onPress={handleWatchAdToRevive}
              style={styles.button}
            />
          )}

          <Button
            title="Play Again"
            variant="primary"
            size="lg"
            onPress={onRestart}
            style={styles.button}
          />

          <Button
            title="Main Menu"
            variant="outline"
            size="md"
            onPress={onGoHome}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  skull: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  recordBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  recordText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
  },
  statsBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
  },
});
