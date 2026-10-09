import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { IconButton } from '../../../components/common/IconButton';
import { currencyService } from '../../../services/currency/currencyService';
import { WalletState } from '../../../types/monetization';

interface ControlBarProps {
  canUndo: boolean;
  undoCount: number;
  activePowerUp: 'HAMMER' | null;
  onUndo: () => void;
  onHammer: () => void;
  onShuffle: () => void;
  onRestart: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  canUndo,
  undoCount,
  activePowerUp,
  onUndo,
  onHammer,
  onShuffle,
  onRestart,
}) => {
  const { theme } = useTheme();
  const [wallet, setWallet] = useState<WalletState>(currencyService.getWallet());

  useEffect(() => {
    return currencyService.subscribe(setWallet);
  }, []);

  const hammerBadge = wallet.powerUps.hammerCount > 0 ? wallet.powerUps.hammerCount : '50🪙';
  const shuffleBadge = wallet.powerUps.shuffleCount > 0 ? wallet.powerUps.shuffleCount : '50🪙';
  const undoBadge =
    wallet.powerUps.undoCount > 0 ? wallet.powerUps.undoCount : undoCount > 0 ? undoCount : '50🪙';

  return (
    <View style={styles.wrapper}>
      {activePowerUp === 'HAMMER' && (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.colors.danger,
              borderColor: '#FFF',
            },
          ]}
        >
          <Text style={styles.bannerText}>
            🔨 Hammer Mode: Tap any tile on the board to destroy it!
          </Text>
        </View>
      )}

      <View style={styles.container}>
        <IconButton
          icon="↩️"
          label="Undo"
          badge={undoBadge}
          disabled={!canUndo}
          onPress={onUndo}
          accessibilityLabel="Undo previous move"
        />

        <IconButton
          icon="🔨"
          label={activePowerUp === 'HAMMER' ? 'Cancel' : 'Hammer'}
          badge={hammerBadge}
          onPress={onHammer}
          style={
            activePowerUp === 'HAMMER'
              ? { borderColor: theme.colors.danger, borderWidth: 2 }
              : undefined
          }
          accessibilityLabel="Hammer power-up to remove a tile"
        />

        <IconButton
          icon="🔀"
          label="Shuffle"
          badge={shuffleBadge}
          onPress={onShuffle}
          accessibilityLabel="Shuffle all tiles on the board"
        />

        <IconButton
          icon="🔄"
          label="Restart"
          onPress={onRestart}
          accessibilityLabel="Restart current game"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    marginTop: 16,
  },
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
});
