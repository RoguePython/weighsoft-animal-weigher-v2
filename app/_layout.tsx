import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { container } from '@/infrastructure/di/container';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/infrastructure/theme/theme-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { isDark } = useTheme();
  const colorScheme = useColorScheme();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        // Initialize container (which initializes database)
        await container.initialize();
        
        // Double-check initialization succeeded
        if (!container.isInitialized) {
          throw new Error('Container initialization completed but isInitialized is false');
        }

        // Verify database is actually usable
        try {
          await container.database.database.execAsync('SELECT 1');
        } catch (dbError) {
          throw new Error(`Database verification failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
        }

        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (isMounted) {
          // Don't set isInitialized to true if DB fails - this will prevent screens from crashing
          // The app will stay on the loading screen, which is better than crashing
          Alert.alert(
            'Database Error',
            `Failed to initialize database: ${errorMessage}\n\nPlease restart the app.`,
            [
              {
                text: 'Retry',
                onPress: () => {
                  // Retry initialization
                  initialize();
                },
              },
              { text: 'OK' },
            ]
          );
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Use app theme for React Navigation theme
  const navigationTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="entity-setup" options={{ presentation: 'modal', title: 'Animal' }} />
        <Stack.Screen name="add-batch-animals" options={{ presentation: 'modal', title: 'Add Animals' }} />
        <Stack.Screen name="custom-field-list-setup" options={{ presentation: 'modal', title: 'Custom Fields' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutContent />
    </AppThemeProvider>
  );
}
