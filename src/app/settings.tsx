import React from 'react';
import { router } from 'expo-router';
import { SettingsModal } from '../features/settings/screens/SettingsModal';

export default function SettingsPage() {
  return <SettingsModal visible={true} onClose={() => router.back()} />;
}
