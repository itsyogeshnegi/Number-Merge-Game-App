import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '../theme/ThemeContext';
import { AdPlayerModal } from '../components/common/AdPlayerModal';
import { currencyService } from '../services/currency/currencyService';
import { analyticsService } from '../services/analytics/analyticsService';

export default function RootLayout() {
  useEffect(() => {
    currencyService.init();
    analyticsService.logEvent('app_open');
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="game" />
            <Stack.Screen
              name="stats"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="settings"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="shop"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
          <AdPlayerModal />
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
