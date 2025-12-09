/**
 * Feed Performance Card Component
 * 
 * Displays feed type metrics and compares against other feeds.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { FeedPerformanceMetrics } from '@/domain/usecases/compare-feed-performance.use-case';

export interface FeedPerformanceCardProps {
  metrics: FeedPerformanceMetrics;
  rank?: number;
  isBest?: boolean;
  testID?: string;
}

export const FeedPerformanceCard: React.FC<FeedPerformanceCardProps> = ({
  metrics,
  rank,
  isBest,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background.secondary,
          borderColor: isBest ? theme.status.success : theme.border.default,
          borderWidth: isBest ? 2 : 1,
        },
      ]}
      testID={testID}
    >
      {isBest && (
        <View
          style={[
            styles.bestBadge,
            { backgroundColor: theme.status.successBackground },
          ]}
        >
          <Text style={[TEXT_STYLES.caption, { color: theme.status.success }]}>BEST</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>
          {metrics.feed_type}
        </Text>
        {rank && (
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>
            Rank #{rank}
          </Text>
        )}
      </View>

      {metrics.feed_brand && (
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
          {metrics.feed_brand}
        </Text>
      )}

      <View style={styles.metrics}>
        <View style={styles.metricItem}>
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Animals</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {metrics.animal_count}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Avg ADG</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {metrics.avg_adg.toFixed(2)}kg/day
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Avg Gain</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {metrics.avg_total_gain.toFixed(1)}kg
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[TEXT_STYLES.caption, { color: theme.text.tertiary }]}>
          Avg {metrics.avg_days_on_feed.toFixed(0)} days on feed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING[2],
    position: 'relative',
  },
  bestBadge: {
    position: 'absolute',
    top: SPACING[2],
    right: SPACING[2],
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING[3],
  },
  metricItem: {
    alignItems: 'center',
  },
  footer: {
    marginTop: SPACING[2],
    alignItems: 'center',
  },
});

