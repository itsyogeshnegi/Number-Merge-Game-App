export type ThemeMode = 'dark' | 'classic' | 'neon';

export interface TileColorStyle {
  bg: string;
  text: string;
  glow?: string;
  border?: string;
}

export interface AppTheme {
  mode: ThemeMode;
  name: string;
  colors: {
    background: string;
    backgroundGradient: [string, string];
    surface: string;
    surfaceElevated: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentGlow: string;
    success: string;
    warning: string;
    danger: string;
    boardBackground: string;
    emptyCell: string;
    cardBg: string;
    modalOverlay: string;
  };
  getTileStyle: (value: number) => TileColorStyle;
}
