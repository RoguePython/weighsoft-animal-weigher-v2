/**
 * Weight Progress Chart Component
 * 
 * Displays a line chart showing weight over time with:
 * - Target weight line
 * - Health issue highlights
 * - Interactive tap for details
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

export interface ChartDataPoint {
  date: Date;
  weight: number;
  hasHealthIssue?: boolean;
}

export interface WeightProgressChartProps {
  data: ChartDataPoint[];
  targetWeight?: number;
  onPointPress?: (point: ChartDataPoint) => void;
  testID?: string;
}

/**
 * Simple line chart component
 * Note: For production, consider using react-native-chart-kit or victory-native
 */
export const WeightProgressChart: React.FC<WeightProgressChartProps> = ({
  data,
  targetWeight,
  onPointPress,
  testID,
}) => {
  const { theme } = useTheme();

  if (data.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.background.secondary }]}
        testID={testID}
      >
        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
          No data available
        </Text>
      </View>
    );
  }

  // Calculate chart dimensions and scales
  const minWeight = Math.min(...data.map((d) => d.weight), targetWeight || Infinity);
  const maxWeight = Math.max(...data.map((d) => d.weight), targetWeight || 0);
  const weightRange = maxWeight - minWeight || 1;
  const chartHeight = 200;
  const chartWidth = 300;

  // Format dates for x-axis
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.secondary }]}
      testID={testID}
    >
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: theme.text.secondary }]}>
            {maxWeight.toFixed(0)}kg
          </Text>
          <Text style={[styles.axisLabel, { color: theme.text.secondary }]}>
            {minWeight.toFixed(0)}kg
          </Text>
        </View>

        {/* Chart area */}
        <View style={[styles.chartArea, { height: chartHeight, width: chartWidth }]}>
          {/* Target weight line */}
          {targetWeight && (
            <View
              style={[
                styles.targetLine,
                {
                  bottom: ((targetWeight - minWeight) / weightRange) * chartHeight,
                  borderColor: theme.status.info,
                },
              ]}
            >
              <Text style={[styles.targetLabel, { color: theme.status.info }]}>
                Target: {targetWeight}kg
              </Text>
            </View>
          )}

          {/* Data points and line */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1 || 1)) * chartWidth;
            const y = chartHeight - ((point.weight - minWeight) / weightRange) * chartHeight;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => onPointPress?.(point)}
                style={[
                  styles.dataPoint,
                  {
                    left: x - 6,
                    top: y - 6,
                    backgroundColor: point.hasHealthIssue
                      ? theme.status.error
                      : theme.interactive.primary,
                  },
                ]}
              >
                {point.hasHealthIssue && (
                  <View
                    style={[
                      styles.healthIndicator,
                      { backgroundColor: theme.status.errorBackground },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 4) !== 0 && index !== data.length - 1) {
            return null;
          }
          return (
            <Text
              key={index}
              style={[styles.axisLabel, { color: theme.text.secondary }]}
            >
              {formatDate(point.date)}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxis: {
    justifyContent: 'space-between',
    height: 200,
    paddingRight: SPACING[2],
  },
  chartArea: {
    position: 'relative',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  targetLabel: {
    ...TEXT_STYLES.caption,
    position: 'absolute',
    right: 0,
    top: -12,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  healthIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -4,
    left: -4,
    opacity: 0.3,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING[2],
    paddingLeft: 40,
  },
  axisLabel: {
    ...TEXT_STYLES.caption,
  },
});

