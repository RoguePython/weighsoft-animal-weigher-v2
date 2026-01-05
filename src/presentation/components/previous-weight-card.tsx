/**
 * Previous Weight Card Component
 *
 * Displays the previous weight for an animal prominently,
 * highlighting weight changes and showing the date of last weigh.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Transaction } from '@/domain/entities/transaction';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Card } from './ui/card';

/**
 * PreviousWeightCard component props
 */
export interface PreviousWeightCardProps {
  /**
   * Previous transaction (weight record)
   */
  transaction: Transaction;
  /**
   * Current weight being entered (optional, for comparison)
   */
  currentWeight?: number;
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
 * Calculate weight change percentage
 */
const calculateWeightChange = (previous: number, current: number): { value: number; isIncrease: boolean } => {
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    isIncrease: change > 0,
  };
};

/**
 * PreviousWeightCard Component
 *
 * Displays previous weight prominently with date and optional weight change indicator.
 *
 * @example
 * ```tsx
 * <PreviousWeightCard
 *   transaction={previousTransaction}
 *   currentWeight={parseFloat(weight)}
 *   testID="previous-weight-card"
 * />
 * ```
 */
export const PreviousWeightCard: React.FC<PreviousWeightCardProps> = ({
  transaction,
  currentWeight,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const previousWeight = transaction.weight_kg;
  const hasCurrentWeight = currentWeight !== undefined && !isNaN(currentWeight);
  const weightChange = hasCurrentWeight ? calculateWeightChange(previousWeight, currentWeight) : null;

  return (
    <Card variant="outlined" style={[styles.container, style]} testID={testID}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="time-outline" size={20} color={theme.text.secondary} />
          <Text style={[TEXT_STYLES.label, { color: theme.text.secondary, marginLeft: SPACING[2] }]}>
            Previous Weight
          </Text>
        </View>

        <View style={styles.weightRow}>
          <Text
            style={[TEXT_STYLES.h1, { color: theme.interactive.primary }]}
            testID={testID ? `${testID}-weight` : undefined}
          >
            {previousWeight.toFixed(1)} kg
          </Text>
          {weightChange && weightChange.value > 0.1 && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: weightChange.isIncrease
                    ? theme.status.successBackground
                    : theme.status.warningBackground,
                },
              ]}
              testID={testID ? `${testID}-change-badge` : undefined}
            >
              <Ionicons
                name={weightChange.isIncrease ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={weightChange.isIncrease ? theme.status.success : theme.status.warning}
              />
              <Text
                style={[
                  TEXT_STYLES.caption,
                  {
                    color: weightChange.isIncrease ? theme.status.success : theme.status.warning,
                    marginLeft: SPACING[1],
                    fontWeight: '600',
                  },
                ]}
                testID={testID ? `${testID}-change-value` : undefined}
              >
                {weightChange.value.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[TEXT_STYLES.caption, { color: theme.text.tertiary, marginTop: SPACING[1] }]}
          testID={testID ? `${testID}-date` : undefined}
        >
          {new Date(transaction.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
});

