/**
 * Target Weight Progress Component
 * 
 * Displays progress toward target weight with:
 * - Circular or linear progress bar
 * - Percentage complete
 * - "Ready" indicator when reached
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

export interface TargetWeightProgressProps {
  currentWeight: number;
  targetWeight: number;
  progressPercent: number;
  isReady: boolean;
  testID?: string;
}

export const TargetWeightProgress: React.FC<TargetWeightProgressProps> = ({
  currentWeight,
  targetWeight,
  progressPercent,
  isReady,
  testID,
}) => {
  const { theme } = useTheme();

  const remainingKg = Math.max(0, targetWeight - currentWeight);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.secondary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>Target Weight</Text>
        {isReady && (
          <View
            style={[
              styles.readyBadge,
              { backgroundColor: theme.status.successBackground },
            ]}
          >
            <Text style={[TEXT_STYLES.caption, { color: theme.status.success }]}>READY</Text>
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        {/* Progress bar */}
        <View style={[styles.progressBarBackground, { backgroundColor: theme.border.default }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                backgroundColor: isReady ? theme.status.success : theme.interactive.primary,
              },
            ]}
          />
        </View>

        {/* Progress text */}
        <View style={styles.progressText}>
          <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>
            {progressPercent.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Weight details */}
      <View style={styles.weightDetails}>
        <View style={styles.weightItem}>
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Current</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {currentWeight.toFixed(1)}kg
          </Text>
        </View>
        <View style={styles.weightItem}>
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Target</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {targetWeight.toFixed(1)}kg
          </Text>
        </View>
        {!isReady && (
          <View style={styles.weightItem}>
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Remaining</Text>
            <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
              {remainingKg.toFixed(1)}kg
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING[2],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  readyBadge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  progressContainer: {
    marginBottom: SPACING[3],
  },
  progressBarBackground: {
    height: 12,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  progressText: {
    alignItems: 'center',
    marginTop: SPACING[1],
  },
  weightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weightItem: {
    alignItems: 'center',
  },
});

