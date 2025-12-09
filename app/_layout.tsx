import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as AppThemeProvider } from '@/infrastructure/theme/theme-context';
import { container } from '@/infrastructure/di/container';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        await container.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsInitialized(true); // Still show app even if DB fails
      }
    }
    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="entity-setup" options={{ presentation: 'modal', title: 'Animal' }} />
          <Stack.Screen name="add-batch-animals" options={{ presentation: 'modal', title: 'Add Animals' }} />
          <Stack.Screen name="custom-field-list-setup" options={{ presentation: 'modal', title: 'Custom Fields' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
