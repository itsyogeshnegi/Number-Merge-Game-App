import { Dimensions, PixelRatio } from 'react-native';
import { BoardSize } from '../types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base reference for standard mobile design (iPhone 11 / modern Android width: 375-400)
const BASE_WIDTH = 375;

export function scaleSize(size: number, currentWidth: number = SCREEN_WIDTH): number {
  const scale = currentWidth / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function moderateScale(
  size: number,
  factor: number = 0.5,
  currentWidth: number = SCREEN_WIDTH
): number {
  return Math.round(size + (scaleSize(size, currentWidth) - size) * factor);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

export interface BoardLayout {
  boardSizePx: number;
  tileSizePx: number;
  gapPx: number;
  borderRadius: number;
}

/**
 * Dynamically computes responsive board dimensions without hardcoded sizes
 */
export function calculateBoardDimensions(
  windowWidth: number,
  windowHeight: number,
  size: BoardSize
): BoardLayout {
  // Constrain board width so it looks gorgeous on both narrow phones and wide tablets/desktop
  const maxBoardWidth = Math.min(windowWidth - 32, 440);
  // Also guard against vertical height overflow on short screens
  const maxBoardHeight = windowHeight * 0.56;
  const boardSizePx = Math.floor(Math.min(maxBoardWidth, maxBoardHeight));

  // Determine gap between tiles based on board size
  const gapPx = size === 4 ? 10 : size === 5 ? 8 : 6;
  const totalGaps = (size + 1) * gapPx;
  const availableSpace = boardSizePx - totalGaps;
  const tileSizePx = Math.floor(availableSpace / size);

  // Readjust actual boardSizePx to exact integer fit
  const adjustedBoardSize = tileSizePx * size + totalGaps;

  return {
    boardSizePx: adjustedBoardSize,
    tileSizePx,
    gapPx,
    borderRadius: size === 4 ? 12 : 8,
  };
}
