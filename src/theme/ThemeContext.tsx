import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme, ThemeMode } from '../types/theme';
import { THEMES, DARK_THEME } from './colors';
import { storageService } from '../services/storage/storageService';

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DARK_THEME,
  themeMode: 'dark',
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    storageService.loadSettings().then((settings) => {
      if (settings?.theme && THEMES[settings.theme]) {
        setThemeModeState(settings.theme);
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    storageService.loadSettings().then((settings) => {
      storageService.saveSettings({ ...settings, theme: mode });
    });
  };

  const theme = THEMES[themeMode] || DARK_THEME;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
