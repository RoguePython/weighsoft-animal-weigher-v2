/**
 * Growth Tracking Screen
 * 
 * Displays weight history chart, ADG calculations, and export functionality.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { WeightProgressChart, ChartDataPoint } from '../components/growth/weight-progress-chart';
import { CalculateGrowthMetricsUseCase } from '@/domain/usecases/calculate-growth-metrics.use-case';
import { GrowthMetrics } from '@/domain/services/growth-calculation.service';

export interface GrowthTrackingScreenProps {
  entityId: string;
  useCase: CalculateGrowthMetricsUseCase;
  onExport?: () => void;
  testID?: string;
}

export const GrowthTrackingScreen: React.FC<GrowthTrackingScreenProps> = ({
  entityId,
  useCase,
  onExport,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrowthData();
  }, [entityId]);

  const loadGrowthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await useCase.execute(entityId);
      setMetrics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load growth data');
    } finally {
      setLoading(false);
    }
  };

  const chartData: ChartDataPoint[] = metrics
    ? metrics.weekly_gains.map((wg) => ({
        date: wg.week_end,
        weight: wg.weight_end,
        hasHealthIssue: false, // Would be determined from health flags
      }))
    : [];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID={testID}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID={testID}>
        <Text style={[TEXT_STYLES.body, { color: theme.status.error }]}>{error}</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID={testID}>
        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>Growth Tracking</Text>
        {onExport && (
          <TouchableOpacity
            onPress={onExport}
            style={[styles.exportButton, { backgroundColor: theme.interactive.primary }]}
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>Export</Text>
          </TouchableOpacity>
        )}
      </View>

      <WeightProgressChart data={chartData} />

      <View style={[styles.metricsCard, { backgroundColor: theme.background.secondary }]}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>Metrics</Text>
        <View style={styles.metricRow}>
          <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>Total Gain</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {metrics.total_gain.toFixed(1)}kg
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>Avg Daily Gain</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {metrics.avg_daily_gain.toFixed(2)}kg/day
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>Days on Feed</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>{metrics.total_days}</Text>
        </View>
      </View>
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
  metricsCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING[4],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[3],
  },
});

