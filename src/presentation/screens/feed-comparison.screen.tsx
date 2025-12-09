/**
 * Feed Comparison Screen
 * 
 * Compares ADG by feed type with visual charts and date range selector.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { FeedPerformanceCard } from '../components/feed/feed-performance-card';
import { CompareFeedPerformanceUseCase } from '@/domain/usecases/compare-feed-performance.use-case';

export interface FeedComparisonScreenProps {
  tenantId: string;
  useCase: CompareFeedPerformanceUseCase;
  onExport?: () => void;
  testID?: string;
}

export const FeedComparisonScreen: React.FC<FeedComparisonScreenProps> = ({
  tenantId,
  useCase,
  onExport,
  testID,
}) => {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    end: new Date(),
  });

  // In real implementation, would load feed comparison data
  const metrics = []; // Placeholder

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>Feed Comparison</Text>
        {onExport && (
          <TouchableOpacity
            onPress={onExport}
            style={[styles.exportButton, { backgroundColor: theme.interactive.primary }]}
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>Export</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dateRangeContainer}>
        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>Date Range</Text>
        <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>
          {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
        </Text>
      </View>

      {metrics.length === 0 ? (
        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
          No feed comparison data available
        </Text>
      ) : (
        metrics.map((metric, index) => (
          <FeedPerformanceCard
            key={index}
            metrics={metric}
            rank={metric.performance_rank}
            isBest={index === 0}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  exportButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
  },
  dateRangeContainer: {
    marginBottom: SPACING[4],
  },
});

