import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Modal } from '../../../components/common/Modal';
import { useTheme } from '../../../theme/ThemeContext';
import { storageService, DEFAULT_STATS } from '../../../services/storage/storageService';
import { GameStats } from '../../../types/game';

interface StatisticsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  useEffect(() => {
    if (visible) {
      storageService.loadStats().then(setStats);
    }
  }, [visible]);

  const winRate =
    stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <Modal visible={visible} onClose={onClose} title="Player Statistics">
      <View style={styles.container}>
        <View style={styles.grid}>
          {/* Total Games */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
              {stats.totalGames}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Played
            </Text>
          </View>

          {/* Win Rate */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {winRate}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Win Rate
            </Text>
          </View>

          {/* Best Score */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>
              {stats.highestScore.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              High Score
            </Text>
          </View>

          {/* Highest Tile */}
          <View
            style={[
              styles.statBox,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {stats.highestTile || 2}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Highest Tile
            </Text>
          </View>
        </View>

        {/* Detailed Metrics */}
        <View
          style={[
            styles.detailsBox,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Total Swipes / Moves:
            </Text>
            <Text style={[styles.detailVal, { color: theme.colors.textPrimary }]}>
              {stats.totalMoves.toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Total Tiles Merged:
            </Text>
            <Text style={[styles.detailVal, { color: theme.colors.textPrimary }]}>
              {stats.totalMerges.toLocaleString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Total Accumulated Score:
            </Text>
            <Text style={[styles.detailVal, { color: theme.colors.textPrimary }]}>
              {stats.totalScore.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '800',
  },
});
