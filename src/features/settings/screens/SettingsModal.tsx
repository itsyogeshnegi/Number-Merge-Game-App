import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, Pressable } from 'react-native';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { BoardSize, UserSettings } from '../../../types/game';
import { storageService, DEFAULT_SETTINGS, DEFAULT_STATS } from '../../../services/storage/storageService';
import { soundService } from '../../../services/sound/soundService';
import { hapticsService } from '../../../services/haptics/hapticsService';
import { ThemeMode } from '../../../types/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onBoardSizeChange?: (size: BoardSize) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onBoardSizeChange,
}) => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (visible) {
      storageService.loadSettings().then(setSettings);
    }
  }, [visible]);

  const updateSetting = <K extends keyof UserSettings>(key: K, val: UserSettings[K]) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    storageService.saveSettings(updated);

    if (key === 'soundEnabled') {
      soundService.setEnabled(Boolean(val));
    }
    if (key === 'vibrationEnabled') {
      hapticsService.setEnabled(Boolean(val));
    }
    if (key === 'boardSize' && onBoardSizeChange) {
      onBoardSizeChange(val as BoardSize);
    }
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    updateSetting('theme', mode);
  };

  const handleResetStats = async () => {
    await storageService.saveStats(DEFAULT_STATS);
    alert('Game statistics have been reset.');
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Settings">
      <View style={styles.container}>
        {/* Audio FX Toggle */}
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
              Sound Effects
            </Text>
            <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>
              Audio cues for moves, merges and achievements
            </Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(v) => updateSetting('soundEnabled', v)}
            trackColor={{ false: '#334155', true: theme.colors.accent }}
          />
        </View>

        {/* Vibration / Haptics Toggle */}
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>
              Haptic Feedback
            </Text>
            <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>
              Vibrate slightly when merging tiles
            </Text>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={(v) => updateSetting('vibrationEnabled', v)}
            trackColor={{ false: '#334155', true: theme.colors.accent }}
          />
        </View>

        {/* Theme Chooser */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Visual Theme
          </Text>
          <View style={styles.themeSelector}>
            {(['dark', 'classic', 'neon'] as ThemeMode[]).map((mode) => {
              const isSelected = themeMode === mode;
              const title = mode === 'dark' ? 'Dark Slate' : mode === 'classic' ? 'Classic' : 'Neon Cyber';
              return (
                <Pressable
                  key={mode}
                  onPress={() => handleSelectTheme(mode)}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.accent
                        : theme.colors.surfaceElevated,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeBtnText,
                      {
                        color: isSelected
                          ? '#000000'
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Board Size Setting */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Default Grid Size
          </Text>
          <View style={styles.themeSelector}>
            {([4, 5, 6] as BoardSize[]).map((bSize) => {
              const isSelected = settings.boardSize === bSize;
              return (
                <Pressable
                  key={`bs_${bSize}`}
                  onPress={() => updateSetting('boardSize', bSize)}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.warning
                        : theme.colors.surfaceElevated,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeBtnText,
                      {
                        color: isSelected
                          ? '#000000'
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {bSize} x {bSize}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Reset Stats */}
        <Button
          title="Reset Player Stats"
          variant="outline"
          size="sm"
          onPress={handleResetStats}
          style={{ marginTop: 8 }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
    maxWidth: 220,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
