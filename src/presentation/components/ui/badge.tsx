/**
 * Badge Component Library
 *
 * Status badge component for displaying status indicators.
 * Supports different variants with theme-based colors.
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

/**
 * Badge variant types
 */
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

/**
 * StatusBadge component props
 */
export interface StatusBadgeProps {
  /**
   * Badge text content
   */
  label: string;
  /**
   * Badge variant (determines color scheme)
   */
  variant?: BadgeVariant;
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
 * StatusBadge Component
 *
 * A pill-shaped badge for displaying status information.
 * Uses theme status colors based on variant.
 *
 * @example
 * ```tsx
 * <StatusBadge label="Active" variant="success" testID="status-active" />
 * <StatusBadge label="Sold" variant="neutral" />
 * <StatusBadge label="Warning" variant="warning" />
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const getVariantColors = (): { background: string; text: string } => {
    switch (variant) {
      case 'success':
        return {
          background: theme.status.successBackground,
          text: theme.status.success,
        };
      case 'warning':
        return {
          background: theme.status.warningBackground,
          text: theme.status.warning,
        };
      case 'error':
        return {
          background: theme.status.errorBackground,
          text: theme.status.error,
        };
      case 'info':
        return {
          background: theme.status.infoBackground,
          text: theme.status.info,
        };
      case 'neutral':
      default:
        return {
          background: theme.background.secondary,
          text: theme.text.secondary,
        };
    }
  };

  const colors = getVariantColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
      testID={testID}
    >
      <Text style={[TEXT_STYLES.caption, { color: colors.text }]} testID={testID ? `${testID}-label` : undefined}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.full, // Pill shape
    alignSelf: 'flex-start',
    minHeight: 24, // Minimum touch target consideration
  },
});

