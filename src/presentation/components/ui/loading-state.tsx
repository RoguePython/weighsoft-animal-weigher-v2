/**
 * Loading State Component
 *
 * Displays a loading indicator with optional message.
 * Used during data fetching or async operations.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

/**
 * LoadingState component props
 */
export interface LoadingStateProps {
  /**
   * Optional loading message
   */
  message?: string;
  /**
   * Size of the loading indicator (default: 'large')
   */
  size?: 'small' | 'large';
  /**
   * Custom style for container
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * LoadingState Component
 *
 * Displays a centered loading spinner with optional message.
 * Used during data fetching or async operations.
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading animals..." testID="loading-animals" />
 * <LoadingState size="small" />
 * ```
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  style,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }, style]}
      testID={testID}
    >
      <ActivityIndicator size={size} color={theme.interactive.primary} testID={testID ? `${testID}-spinner` : undefined} />
      {message && (
        <Text
          style={[TEXT_STYLES.body, { color: theme.text.secondary, marginTop: SPACING[4] }]}
          testID={testID ? `${testID}-message` : undefined}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[8],
    minHeight: 200,
  },
});

