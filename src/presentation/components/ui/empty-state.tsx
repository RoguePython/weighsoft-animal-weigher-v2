/**
 * Empty State Component
 *
 * Displays an empty state with icon, message, and optional CTA button.
 * Used when lists or content areas are empty.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { PrimaryButton } from './button';

/**
 * EmptyState component props
 */
export interface EmptyStateProps {
  /**
   * Icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Icon size (default: 48)
   */
  iconSize?: number;
  /**
   * Main message text
   */
  message: string;
  /**
   * Optional secondary message or description
   */
  description?: string;
  /**
   * Optional CTA button props
   */
  action?: {
    label: string;
    onPress: () => void;
    testID?: string;
  };
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
 * EmptyState Component
 *
 * Displays a centered empty state with icon, message, and optional action button.
 * Used when lists or content areas are empty to guide users on next steps.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="paw-outline"
 *   message="No animals yet"
 *   description="Add your first animal to start tracking weights"
 *   action={{
 *     label: "Add Your First Animal",
 *     onPress: handleAddAnimal,
 *     testID: "empty-state-add-button"
 *   }}
 *   testID="animals-empty-state"
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconSize = 48,
  message,
  description,
  action,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }, style]} testID={testID}>
      {icon && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={theme.text.tertiary}
          style={styles.icon}
          testID={testID ? `${testID}-icon` : undefined}
        />
      )}
      <Text
        style={[TEXT_STYLES.h3, { color: theme.text.primary, marginTop: icon ? SPACING[4] : 0 }]}
        testID={testID ? `${testID}-message` : undefined}
      >
        {message}
      </Text>
      {description && (
        <Text
          style={[
            TEXT_STYLES.body,
            { color: theme.text.secondary, marginTop: SPACING[2], textAlign: 'center' },
          ]}
          testID={testID ? `${testID}-description` : undefined}
        >
          {description}
        </Text>
      )}
      {action && (
        <View style={styles.actionContainer}>
          <PrimaryButton
            title={action.label}
            onPress={action.onPress}
            testID={action.testID || (testID ? `${testID}-action` : undefined)}
            style={styles.actionButton}
          />
        </View>
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
  icon: {
    marginBottom: SPACING[2],
  },
  actionContainer: {
    marginTop: SPACING[6],
    width: '100%',
    maxWidth: 300,
  },
  actionButton: {
    width: '100%',
  },
});

