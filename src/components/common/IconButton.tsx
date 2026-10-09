import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { hapticsService } from '../../services/haptics/hapticsService';
import { soundService } from '../../services/sound/soundService';

interface IconButtonProps {
  icon: string;
  label?: string;
  badge?: string | number;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  badge,
  onPress,
  disabled = false,
  size = 44,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 35,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    hapticsService.light();
    soundService.playClick();
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label || icon}
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.45 }}>{icon}</Text>
        {badge !== undefined && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.colors.warning,
                borderColor: theme.colors.surface,
              },
            ]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Pressable>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.colors.textSecondary, fontSize: 11 },
          ]}
        >
          {label}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  label: {
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
});
