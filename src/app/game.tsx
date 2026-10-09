import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { GameScreen } from '../features/game/screens/GameScreen';
import { BoardSize } from '../types/game';

export default function GamePage() {
  const params = useLocalSearchParams<{ size?: string }>();
  const parsedSize = Number(params.size);
  const size: BoardSize = parsedSize === 5 ? 5 : parsedSize === 6 ? 6 : 4;

  return <GameScreen initialBoardSize={size} />;
}
