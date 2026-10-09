import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { hapticsService } from '../../services/haptics/hapticsService';
import { soundService } from '../../services/sound/soundService';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  icon,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled) return;
    hapticsService.light();
    soundService.playClick();
    onPress();
  };

  // Resolve background and text colors
  let bgColor = theme.colors.accent;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';

  if (variant === 'primary') {
    bgColor = theme.colors.accent;
    textColor = theme.mode === 'neon' ? '#000000' : '#0B0F19';
  } else if (variant === 'secondary') {
    bgColor = theme.colors.surfaceElevated;
    textColor = theme.colors.textPrimary;
    borderColor = theme.colors.border;
  } else if (variant === 'accent') {
    bgColor = theme.colors.warning;
    textColor = '#0B0F19';
  } else if (variant === 'danger') {
    bgColor = theme.colors.danger;
    textColor = '#FFFFFF';
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    borderColor = theme.colors.border;
    textColor = theme.colors.textPrimary;
  }

  // Exact fixed heights to ensure all buttons of the same size match 100%
  const height = size === 'sm' ? 38 : size === 'lg' ? 56 : 48;
  const paddingHorizontal = size === 'sm' ? 12 : size === 'lg' ? 24 : 14;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
  const borderRadius = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        style={[
          styles.base,
          {
            height,
            backgroundColor: bgColor,
            borderColor,
            borderWidth: variant === 'outline' || variant === 'secondary' ? 1.5 : 0,
            borderRadius,
            paddingHorizontal,
            opacity: disabled ? 0.45 : 1,
          },
        ]}
      >
        {icon}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.text,
            {
              color: textColor,
              fontSize,
              marginLeft: icon ? 6 : 0,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  text: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
