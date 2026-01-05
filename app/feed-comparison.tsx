/**
 * Feed Comparison Screen
 *
 * Analytics screen for comparing feed performance.
 * Enhanced with new component library for better UX.
 */

import { DetailScreenHeader } from '@/presentation/components';
import { EmptyState } from '@/presentation/components/ui';
import { useTheme } from '@/infrastructure/theme/theme-context';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function FeedComparisonScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="feed-comparison-screen"
    >
      <DetailScreenHeader
        title="Feed Comparison"
        subtitle="Compare feed performance and efficiency metrics"
        testID="feed-comparison-header"
      />

      <EmptyState
        icon="bar-chart-outline"
        message="Coming Soon"
        description="Feed comparison analytics will be available in a future update. This feature will help you compare feed performance, calculate feed conversion ratios, and optimize your feeding strategies."
        testID="feed-comparison-empty-state"
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
