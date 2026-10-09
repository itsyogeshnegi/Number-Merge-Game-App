import React from 'react';
import { router } from 'expo-router';
import { StatisticsModal } from '../features/statistics/screens/StatisticsModal';

export default function StatsPage() {
  return <StatisticsModal visible={true} onClose={() => router.back()} />;
}
