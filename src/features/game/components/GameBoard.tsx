import React, { useMemo } from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { BoardMatrix, BoardSize, TileData } from '../../../types/game';
import { useTheme } from '../../../theme/ThemeContext';
import { calculateBoardDimensions } from '../../../theme/dimensions';
import { Tile } from './Tile';

interface GameBoardProps {
  board: BoardMatrix;
  size: BoardSize;
  isHammerMode?: boolean;
  selectedTile?: { row: number; col: number } | null;
  onTilePress?: (row: number, col: number) => void;
  onDragMerge: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  size,
  isHammerMode = false,
  selectedTile = null,
  onTilePress,
  onDragMerge,
}) => {
  const { theme } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Compute dynamic responsive sizes based on window dimensions
  const layout = useMemo(
    () => calculateBoardDimensions(windowWidth, windowHeight, size),
    [windowWidth, windowHeight, size]
  );

  const { boardSizePx, tileSizePx, gapPx, borderRadius } = layout;

  // Extract all non-null tiles for rendering
  const activeTiles: TileData[] = useMemo(() => {
    const list: TileData[] = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        const tile = board[r][c];
        if (tile !== null) {
          list.push(tile);
        }
      }
    }
    return list;
  }, [board]);

  return (
    <View
      style={[
        styles.boardContainer,
        {
          width: boardSizePx,
          height: boardSizePx,
          borderRadius: borderRadius * 1.5,
          backgroundColor: theme.colors.boardBackground,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Background Grid Cells */}
      {Array.from({ length: size }).map((_, r) => (
        <View key={`row_${r}`} style={styles.gridRow}>
          {Array.from({ length: size }).map((_, c) => (
            <View
              key={`cell_${r}_${c}`}
              style={[
                styles.emptyCell,
                {
                  width: tileSizePx,
                  height: tileSizePx,
                  borderRadius,
                  backgroundColor: theme.colors.emptyCell,
                  margin: gapPx / 2,
                },
              ]}
            />
          ))}
        </View>
      ))}

      {/* Active Number Tiles with Drag-to-Merge */}
      {activeTiles.map((tile) => {
        const isSelected = selectedTile?.row === tile.row && selectedTile?.col === tile.col;
        return (
          <Tile
            key={tile.id}
            tile={tile}
            tileSize={tileSizePx}
            gap={gapPx}
            boardSize={size}
            isHammerMode={isHammerMode}
            isSelected={isSelected}
            onPress={() => onTilePress?.(tile.row, tile.col)}
            onDragTo={onDragMerge}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    borderWidth: 2,
    position: 'relative',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  gridRow: {
    flexDirection: 'row',
  },
  emptyCell: {},
});
