import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Button } from '../../../components/common/Button';

interface ConfettiProps {
  visible: boolean;
  onContinue: () => void;
}

export const ConfettiCelebration: React.FC<ConfettiProps> = ({
  visible,
  onContinue,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -10,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [visible, scaleAnim, bounceAnim]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.accent,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Text
          style={[styles.trophy, { transform: [{ translateY: bounceAnim }] }]}
        >
          🏆✨
        </Animated.Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          2048 UNLOCKED!
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Incredible achievement! You have mastered the grid. Can you push forward and reach 4096 or beyond?
        </Text>

        <Button
          title="Keep Playing (Endless Mode) 🚀"
          variant="primary"
          onPress={onContinue}
          style={{ width: '100%', marginTop: 20 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 99,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  trophy: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
});
