import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  BackHandler,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoardSize } from '../../../types/game';
import { useTheme } from '../../../theme/ThemeContext';
import { useGameEngine } from '../state/useGameEngine';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameBoard } from '../components/GameBoard';
import { ControlBar } from '../components/ControlBar';
import { PauseModal } from '../components/PauseModal';
import { GameOverModal } from '../components/GameOverModal';
import { ConfettiCelebration } from '../components/ConfettiCelebration';
import { IconButton } from '../../../components/common/IconButton';
import { storageService } from '../../../services/storage/storageService';
import { soundService } from '../../../services/sound/soundService';
import { hapticsService } from '../../../services/haptics/hapticsService';

interface GameScreenProps {
  initialBoardSize?: BoardSize;
}

export const GameScreen: React.FC<GameScreenProps> = ({ initialBoardSize = 4 }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [soundOn, setSoundOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);
  const [isPauseOpen, setIsPauseOpen] = useState(false);

  const engine = useGameEngine(initialBoardSize);

  // Load sound and haptics preferences
  useEffect(() => {
    storageService.loadSettings().then((settings) => {
      setSoundOn(settings.soundEnabled);
      setHapticsOn(settings.vibrationEnabled);
      soundService.setEnabled(settings.soundEnabled);
      hapticsService.setEnabled(settings.vibrationEnabled);
    });
  }, []);

  // Hardware back button behavior on Android
  useEffect(() => {
    const onBackPress = () => {
      if (isPauseOpen) {
        setIsPauseOpen(false);
        return true;
      }
      setIsPauseOpen(true);
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isPauseOpen]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundService.setEnabled(next);
    storageService.loadSettings().then((s) => {
      storageService.saveSettings({ ...s, soundEnabled: next });
    });
  };

  const toggleHaptics = () => {
    const next = !hapticsOn;
    setHapticsOn(next);
    hapticsService.setEnabled(next);
    storageService.loadSettings().then((s) => {
      storageService.saveSettings({ ...s, vibrationEnabled: next });
    });
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 14),
        },
      ]}
    >
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <IconButton
            icon="←"
            size={40}
            onPress={() => setIsPauseOpen(true)}
            accessibilityLabel="Back to menu or pause"
          />

          <View style={styles.headerRight}>
            <IconButton
              icon={soundOn ? '🔊' : '🔇'}
              size={38}
              onPress={toggleSound}
              accessibilityLabel="Toggle sound"
            />
            <IconButton
              icon={hapticsOn ? '📳' : '📴'}
              size={38}
              onPress={toggleHaptics}
              accessibilityLabel="Toggle vibration"
            />
            <IconButton
              icon="⏸️"
              size={38}
              onPress={() => setIsPauseOpen(true)}
              accessibilityLabel="Pause game"
            />
          </View>
        </View>

        {/* Score Board */}
        <ScoreBoard
          score={engine.score}
          bestScore={engine.bestScore}
          highestTile={engine.highestTile}
        />

        {/* Game Board */}
        <GameBoard
          board={engine.board}
          size={engine.size}
          isHammerMode={engine.activePowerUp === 'HAMMER'}
          selectedTile={engine.selectedTile}
          onTilePress={engine.handleTilePress}
          onDragMerge={engine.handleDragMerge}
        />

        {/* Control Bar (Powerups & Undo) */}
        <ControlBar
          canUndo={engine.canUndo}
          undoCount={engine.undoHistoryLength}
          activePowerUp={engine.activePowerUp}
          onUndo={engine.handleUndo}
          onHammer={engine.activateHammer}
          onShuffle={engine.handleShuffle}
          onRestart={() => engine.handleRestart(engine.size)}
        />

        {/* Pause Modal */}
        <PauseModal
          visible={isPauseOpen}
          onResume={() => setIsPauseOpen(false)}
          onRestart={() => {
            setIsPauseOpen(false);
            engine.handleRestart(engine.size);
          }}
          onOpenSettings={() => {
            setIsPauseOpen(false);
            router.push('/settings');
          }}
          onGoHome={() => {
            setIsPauseOpen(false);
            router.replace('/');
          }}
        />

        {/* Game Over Modal */}
        <GameOverModal
          visible={engine.isGameOver}
          score={engine.score}
          bestScore={engine.bestScore}
          highestTile={engine.highestTile}
          hasContinued={engine.hasContinued}
          onRevive={engine.handleRevive}
          onRestart={() => engine.handleRestart(engine.size)}
          onGoHome={() => router.replace('/')}
        />

        {/* 2048 Celebration Overlay */}
        <ConfettiCelebration
          visible={engine.showCelebration}
          onContinue={engine.dismissCelebration}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBar: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
});
