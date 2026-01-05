/**
 * Growth Tracking Screen
 *
 * Analytics screen for tracking animal growth over time.
 * Enhanced with new component library for better UX.
 */

import { DetailScreenHeader } from '@/presentation/components';
import { EmptyState } from '@/presentation/components/ui';
import { useTheme } from '@/infrastructure/theme/theme-context';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function GrowthTrackingScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="growth-tracking-screen"
    >
      <DetailScreenHeader
        title="Growth Tracking"
        subtitle="Track animal growth trends and patterns over time"
        testID="growth-tracking-header"
      />

      <EmptyState
        icon="trending-up-outline"
        message="Coming Soon"
        description="Growth tracking analytics will be available in a future update. This feature will help you visualize weight trends, calculate average daily gain (ADG), and identify growth patterns across your herd."
        testID="growth-tracking-empty-state"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
});
