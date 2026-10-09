import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';

interface PauseModalProps {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  visible,
  onResume,
  onRestart,
  onOpenSettings,
  onGoHome,
}) => {
  return (
    <Modal visible={visible} onClose={onResume} title="Game Paused">
      <View style={styles.content}>
        <Button
          title="Resume"
          variant="primary"
          size="lg"
          onPress={onResume}
          style={styles.button}
        />
        <Button
          title="Restart Game"
          variant="secondary"
          size="md"
          onPress={onRestart}
          style={styles.button}
        />
        <Button
          title="Settings"
          variant="secondary"
          size="md"
          onPress={onOpenSettings}
          style={styles.button}
        />
        <Button
          title="Quit to Menu"
          variant="outline"
          size="md"
          onPress={onGoHome}
          style={styles.button}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    width: '100%',
  },
});
