/**
 * Card Component Library
 *
 * Reusable card components following the design system.
 * Supports base Card, MetricCard, and ActionCard variants.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View, ViewStyle } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'elevated' | 'outlined';

/**
 * Base Card component props
 */
export interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Card content
   */
  children: ReactNode;
  /**
   * Optional press handler - makes card pressable
   */
  onPress?: () => void;
  /**
   * Card variant style
   */
  variant?: CardVariant;
  /**
   * Custom style to apply to the card container
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Base Card Component
 *
 * A flexible card container that can be pressable or static.
 * Supports three variants: default, elevated (with shadow), and outlined (with border).
 *
 * @example
 * ```tsx
 * <Card variant="elevated" onPress={handlePress} testID="my-card">
 *   <Text>Card content</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  style,
  testID,
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyle: ViewStyle = {
    backgroundColor: variant === 'elevated' ? theme.surface.default : theme.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
  };

  // Apply variant-specific styles
  const variantStyle: ViewStyle = {};
  if (variant === 'elevated') {
    // React Native shadow properties (iOS)
    variantStyle.shadowColor = '#000000';
    variantStyle.shadowOffset = { width: 0, height: 2 };
    variantStyle.shadowOpacity = 0.1;
    variantStyle.shadowRadius = 4;
    variantStyle.elevation = 4; // Android shadow
  } else if (variant === 'outlined') {
    variantStyle.borderWidth = 1;
    variantStyle.borderColor = theme.border.default;
  }

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[baseStyle, variantStyle, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      testID={testID}
      {...props}
    >
      {children}
    </Wrapper>
  );
};

/**
 * MetricCard component props
 */
export interface MetricCardProps extends Omit<CardProps, 'children' | 'onPress'> {
  /**
   * Metric value (large number)
   */
  value: string | number;
  /**
   * Metric label
   */
  label: string;
  /**
   * Optional icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Icon size (default: 24)
   */
  iconSize?: number;
  /**
   * Optional press handler
   */
  onPress?: () => void;
  /**
   * Optional accent color for value
   */
  valueColor?: string;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * MetricCard Component
 *
 * Displays a metric with a large value, label, and optional icon.
 * Used for displaying key metrics like "Active Animals: 42" or "Open Sessions: 3".
 *
 * @example
 * ```tsx
 * <MetricCard
 *   value={42}
 *   label="Active Animals"
 *   icon="paw-outline"
 *   variant="elevated"
 *   testID="metric-active-animals"
 * />
 * ```
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  icon,
  iconSize = 24,
  variant = 'default',
  onPress,
  valueColor,
  style,
  testID,
  ...props
}) => {
  const { theme } = useTheme();

  const displayValue = typeof value === 'number' ? value.toString() : value;
  const valueTextColor = valueColor || theme.text.primary;

  return (
    <Card variant={variant} onPress={onPress} style={style} testID={testID} {...props}>
      <View style={styles.metricContainer}>
        {icon && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={theme.text.secondary}
            style={styles.metricIcon}
          />
        )}
        <View style={styles.metricContent}>
          <Text
            style={[TEXT_STYLES.h2, { color: valueTextColor }]}
            testID={testID ? `${testID}-value` : undefined}
          >
            {displayValue}
          </Text>
          <Text
            style={[TEXT_STYLES.caption, { color: theme.text.secondary, marginTop: SPACING[1] }]}
            testID={testID ? `${testID}-label` : undefined}
          >
            {label}
          </Text>
        </View>
      </View>
    </Card>
  );
};

/**
 * ActionCard component props
 */
export interface ActionCardProps extends Omit<CardProps, 'children'> {
  /**
   * Icon name from Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap;
  /**
   * Card title
   */
  title: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Icon size (default: 28)
   */
  iconSize?: number;
  /**
   * Press handler (required for ActionCard)
   */
  onPress: () => void;
  /**
   * Optional icon color
   */
  iconColor?: string;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * ActionCard Component
 *
 * A pressable card with an icon, title, and optional description.
 * Used for quick actions like "Start Weighing" or "Add Animal".
 *
 * @example
 * ```tsx
 * <ActionCard
 *   icon="scale-outline"
 *   title="Start Weighing"
 *   description="Begin a new weighing session"
 *   onPress={handleStartWeighing}
 *   variant="elevated"
 *   testID="action-start-weighing"
 * />
 * ```
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  iconSize = 28,
  variant = 'default',
  onPress,
  iconColor,
  style,
  testID,
  ...props
}) => {
  const { theme } = useTheme();

  const iconColorFinal = iconColor || theme.interactive.primary;

  return (
    <Card variant={variant} onPress={onPress} style={[styles.actionCardContainer, style]} testID={testID} {...props}>
      <View style={styles.actionCardContent}>
        <Ionicons name={icon} size={iconSize} color={iconColorFinal} style={styles.actionCardIcon} />
        <View style={styles.actionCardText}>
          <Text
            style={[TEXT_STYLES.button, { color: theme.text.primary }]}
            testID={testID ? `${testID}-title` : undefined}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={[TEXT_STYLES.caption, { color: theme.text.secondary, marginTop: SPACING[1] }]}
              testID={testID ? `${testID}-description` : undefined}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  metricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    marginRight: SPACING[2],
  },
  metricContent: {
    flex: 1,
    alignItems: 'center',
  },
  actionCardContainer: {
    minHeight: SPACING[16], // 64pt minimum for good touch target
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardIcon: {
    marginRight: SPACING[3],
  },
  actionCardText: {
    flex: 1,
    alignItems: 'center',
  },
});

