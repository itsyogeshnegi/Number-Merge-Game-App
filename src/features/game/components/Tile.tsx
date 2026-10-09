import React, { useEffect, useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
} from 'react-native';
import { TileData } from '../../../types/game';
import { useTheme } from '../../../theme/ThemeContext';
import { getTileFontSize } from '../../../theme/typography';

interface TileProps {
  tile: TileData;
  tileSize: number;
  gap: number;
  boardSize: number;
  isHammerMode?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  onDragTo?: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  tileSize,
  gap,
  boardSize,
  isHammerMode = false,
  isSelected = false,
  onPress,
  onDragTo,
}) => {
  const { theme } = useTheme();
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleAnim = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
  const isDraggingRef = useRef(false);

  const tileStyle = theme.getTileStyle(tile.value);
  const fontSize = getTileFontSize(tile.value, tileSize);

  const top = tile.row * (tileSize + gap) + gap;
  const left = tile.col * (tileSize + gap) + gap;

  useEffect(() => {
    if (tile.isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else if (tile.mergedFrom) {
      scaleAnim.setValue(0.8);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [tile.isNew, tile.mergedFrom, scaleAnim]);

  // PanResponder to handle dragging this specific tile onto an adjacent tile
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (isHammerMode) return false;
        return Math.abs(gesture.dx) > 6 || Math.abs(gesture.dy) > 6;
      },
      onPanResponderGrant: () => {
        isDraggingRef.current = false;
      },
      onPanResponderMove: (_, gesture) => {
        if (isHammerMode) return;
        isDraggingRef.current = true;
        pan.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (isHammerMode) {
          onPress?.();
          return;
        }

        const { dx, dy } = gesture;
        const DRAG_THRESHOLD = 24;

        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          let targetRow = tile.row;
          let targetCol = tile.col;

          if (Math.abs(dy) >= Math.abs(dx)) {
            // Dragged vertically: upside down
            if (dy < -DRAG_THRESHOLD && tile.row > 0) {
              targetRow = tile.row - 1; // Dragged UP
            } else if (dy > DRAG_THRESHOLD && tile.row < boardSize - 1) {
              targetRow = tile.row + 1; // Dragged DOWN
            }
          } else {
            // Dragged horizontally: left / right
            if (dx < -DRAG_THRESHOLD && tile.col > 0) {
              targetCol = tile.col - 1; // Dragged LEFT
            } else if (dx > DRAG_THRESHOLD && tile.col < boardSize - 1) {
              targetCol = tile.col + 1; // Dragged RIGHT
            }
          }

          if (targetRow !== tile.row || targetCol !== tile.col) {
            onDragTo?.(tile.row, tile.col, targetRow, targetCol);
          }
        } else if (!isDraggingRef.current || (Math.abs(dx) < 8 && Math.abs(dy) < 8)) {
          // Tap without significant drag
          onPress?.();
        }

        // Return tile back to its cell origin
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const hasGlow = Boolean(tileStyle.glow);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          width: tileSize,
          height: tileSize,
          top,
          left,
          backgroundColor: tileStyle.bg,
          borderColor: isHammerMode
            ? theme.colors.danger
            : isSelected
            ? theme.colors.warning
            : tileStyle.border || 'transparent',
          borderWidth: isHammerMode || isSelected ? 2.5 : tileStyle.border ? 1.5 : 0,
          shadowColor: isSelected ? theme.colors.warning : tileStyle.glow || '#000',
          shadowOpacity: isSelected ? 0.9 : hasGlow ? 0.6 : 0.2,
          shadowRadius: isSelected ? 10 : hasGlow ? 8 : 2,
          elevation: isSelected ? 8 : hasGlow ? 6 : 2,
          zIndex: isSelected ? 50 : 10,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: isSelected ? 1.06 : scaleAnim },
          ],
        },
      ]}
    >
      <Animated.View style={styles.center}>
        <Text
          style={[
            styles.text,
            {
              color: tileStyle.text,
              fontSize,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {tile.value}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
    textAlign: 'center',
    userSelect: 'none',
  },
});
