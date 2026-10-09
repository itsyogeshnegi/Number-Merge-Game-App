import { AppTheme, TileColorStyle } from '../types/theme';

export const DARK_THEME: AppTheme = {
  mode: 'dark',
  name: 'Dark Slate',
  colors: {
    background: '#0B0F19',
    backgroundGradient: ['#0B0F19', '#111827'],
    surface: '#1E293B',
    surfaceElevated: '#334155',
    border: '#475569',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.4)',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    boardBackground: '#141E33',
    emptyCell: 'rgba(255, 255, 255, 0.05)',
    cardBg: '#1E293B',
    modalOverlay: 'rgba(0, 0, 0, 0.75)',
  },
  getTileStyle: (value: number): TileColorStyle => {
    switch (value) {
      case 2:
        return { bg: '#1E293B', text: '#F1F5F9', border: '#334155' };
      case 4:
        return { bg: '#334155', text: '#F8FAFC', border: '#475569' };
      case 8:
        return { bg: '#EA580C', text: '#FFFFFF', glow: '#EA580C' };
      case 16:
        return { bg: '#D97706', text: '#FFFFFF', glow: '#D97706' };
      case 32:
        return { bg: '#DC2626', text: '#FFFFFF', glow: '#DC2626' };
      case 64:
        return { bg: '#E11D48', text: '#FFFFFF', glow: '#E11D48' };
      case 128:
        return { bg: '#7C3AED', text: '#FFFFFF', glow: '#7C3AED' };
      case 256:
        return { bg: '#6366F1', text: '#FFFFFF', glow: '#6366F1' };
      case 512:
        return { bg: '#2563EB', text: '#FFFFFF', glow: '#2563EB' };
      case 1024:
        return { bg: '#0D9488', text: '#FFFFFF', glow: '#0D9488' };
      case 2048:
        return { bg: '#059669', text: '#FFFFFF', glow: '#10B981', border: '#34D399' };
      case 4096:
        return { bg: '#DB2777', text: '#FFFFFF', glow: '#F472B6', border: '#F472B6' };
      default:
        return { bg: '#F59E0B', text: '#FFFFFF', glow: '#FBBF24', border: '#FDE68A' };
    }
  },
};

export const CLASSIC_THEME: AppTheme = {
  mode: 'classic',
  name: 'Classic Warm',
  colors: {
    background: '#FAF8EF',
    backgroundGradient: ['#FAF8EF', '#F5F0E6'],
    surface: '#FFFFFF',
    surfaceElevated: '#EDE8DF',
    border: '#D8CFBF',
    textPrimary: '#433A33',
    textSecondary: '#776E65',
    textMuted: '#9E948A',
    accent: '#8F7A66',
    accentGlow: 'rgba(143, 122, 102, 0.3)',
    success: '#2E7D32',
    warning: '#ED943B',
    danger: '#D32F2F',
    boardBackground: '#BBADA0',
    emptyCell: '#CDC1B4',
    cardBg: '#FFFFFF',
    modalOverlay: 'rgba(0, 0, 0, 0.65)',
  },
  getTileStyle: (value: number): TileColorStyle => {
    switch (value) {
      case 2:
        return { bg: '#EEE4DA', text: '#776E65' };
      case 4:
        return { bg: '#EDE0C8', text: '#776E65' };
      case 8:
        return { bg: '#F2B179', text: '#F9F6F2' };
      case 16:
        return { bg: '#F59563', text: '#F9F6F2' };
      case 32:
        return { bg: '#F67C5F', text: '#F9F6F2' };
      case 64:
        return { bg: '#F65E3B', text: '#F9F6F2' };
      case 128:
        return { bg: '#EDCF72', text: '#F9F6F2', glow: '#EDCF72' };
      case 256:
        return { bg: '#EDCC61', text: '#F9F6F2', glow: '#EDCC61' };
      case 512:
        return { bg: '#EDC850', text: '#F9F6F2', glow: '#EDC850' };
      case 1024:
        return { bg: '#EDC53F', text: '#F9F6F2', glow: '#EDC53F' };
      case 2048:
        return { bg: '#EDC22E', text: '#F9F6F2', glow: '#FFD700', border: '#FFF' };
      case 4096:
        return { bg: '#3C3A32', text: '#F9F6F2', glow: '#3C3A32' };
      default:
        return { bg: '#1C1917', text: '#F9F6F2', glow: '#F59E0B' };
    }
  },
};

export const NEON_THEME: AppTheme = {
  mode: 'neon',
  name: 'Neon Cyber',
  colors: {
    background: '#030712',
    backgroundGradient: ['#030712', '#0A061E'],
    surface: '#0F172A',
    surfaceElevated: '#1E1B4B',
    border: '#A855F7',
    textPrimary: '#FFFFFF',
    textSecondary: '#C084FC',
    textMuted: '#6B7280',
    accent: '#06B6D4',
    accentGlow: 'rgba(6, 182, 212, 0.5)',
    success: '#10B981',
    warning: '#FBBF24',
    danger: '#F43F5E',
    boardBackground: '#0F0E26',
    emptyCell: 'rgba(168, 85, 247, 0.1)',
    cardBg: '#0F172A',
    modalOverlay: 'rgba(3, 7, 18, 0.85)',
  },
  getTileStyle: (value: number): TileColorStyle => {
    switch (value) {
      case 2:
        return { bg: '#1E1B4B', text: '#A5B4FC', border: '#4338CA' };
      case 4:
        return { bg: '#2E1065', text: '#E9D5FF', border: '#7E22CE' };
      case 8:
        return { bg: '#831843', text: '#FDF2F8', glow: '#DB2777', border: '#F472B6' };
      case 16:
        return { bg: '#701A75', text: '#FDF4FF', glow: '#C026D3', border: '#E879F9' };
      case 32:
        return { bg: '#4C1D95', text: '#EDE9FE', glow: '#7C3AED', border: '#A78BFA' };
      case 64:
        return { bg: '#1E3A8A', text: '#EFF6FF', glow: '#2563EB', border: '#60A5FA' };
      case 128:
        return { bg: '#0E7490', text: '#ECFEFF', glow: '#06B6D4', border: '#67E8F9' };
      case 256:
        return { bg: '#047857', text: '#ECFDF5', glow: '#10B981', border: '#6EE7B7' };
      case 512:
        return { bg: '#B45309', text: '#FFFBEB', glow: '#F59E0B', border: '#FCD34D' };
      case 1024:
        return { bg: '#BE123C', text: '#FFF1F2', glow: '#F43F5E', border: '#FDA4AF' };
      case 2048:
        return { bg: '#FF007F', text: '#FFFFFF', glow: '#FF007F', border: '#FFFFFF' };
      case 4096:
        return { bg: '#00F5D4', text: '#000000', glow: '#00F5D4', border: '#FFFFFF' };
      default:
        return { bg: '#FFE600', text: '#000000', glow: '#FFE600', border: '#FFFFFF' };
    }
  },
};

export const THEMES: Record<string, AppTheme> = {
  dark: DARK_THEME,
  classic: CLASSIC_THEME,
  neon: NEON_THEME,
};
