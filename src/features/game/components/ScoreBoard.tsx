import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  highestTile: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  bestScore,
  highestTile,
}) => {
  const { theme } = useTheme();
  const scaleScoreAnim = useRef(new Animated.Value(1)).current;
  const prevScoreRef = useRef(score);

  useEffect(() => {
    if (score > prevScoreRef.current) {
      Animated.sequence([
        Animated.timing(scaleScoreAnim, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleScoreAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevScoreRef.current = score;
  }, [score, scaleScoreAnim]);

  return (
    <View style={styles.container}>
      {/* Current Score */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          SCORE
        </Text>
        <Animated.View style={{ transform: [{ scale: scaleScoreAnim }] }}>
          <Text
            style={[
              styles.value,
              { color: theme.colors.textPrimary },
            ]}
          >
            {score.toLocaleString()}
          </Text>
        </Animated.View>
      </View>

      {/* Best Score */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          BEST
        </Text>
        <Text style={[styles.value, { color: theme.colors.accent }]}>
          {bestScore.toLocaleString()}
        </Text>
      </View>

      {/* Highest Tile */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          HIGHEST
        </Text>
        <Text style={[styles.value, { color: theme.colors.warning }]}>
          {highestTile}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 440,
    gap: 8,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});
