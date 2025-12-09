/**
 * Dashboard Screen
 * 
 * Main dashboard showing key metrics and quick actions.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

export interface DashboardScreenProps {
  onNavigateToBatches?: () => void;
  onNavigateToEntities?: () => void;
  onNavigateToWeighing?: () => void;
  onNavigateToReadyToSell?: () => void;
  onNavigateToHealthMonitoring?: () => void;
  testID?: string;
}

interface DashboardStats {
  totalAnimals: number;
  activeAnimals: number;
  readyToSell: number;
  healthAlerts: number;
  openBatches: number;
  recentWeighs: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToBatches,
  onNavigateToEntities,
  onNavigateToWeighing,
  onNavigateToReadyToSell,
  onNavigateToHealthMonitoring,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    activeAnimals: 0,
    readyToSell: 0,
    healthAlerts: 0,
    openBatches: 0,
    recentWeighs: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // TODO: Load actual data from repositories
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setStats({
        totalAnimals: 150,
        activeAnimals: 142,
        readyToSell: 23,
        healthAlerts: 5,
        openBatches: 2,
        recentWeighs: 47,
      });
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID={testID}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]}>Dashboard</Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.primary }]}
            onPress={onNavigateToWeighing}
            testID="dashboard-weigh-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>Start Weighing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
            onPress={onNavigateToBatches}
            testID="dashboard-batches-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>Manage Batches</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
            onPress={onNavigateToEntities}
            testID="dashboard-entities-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>Manage Animals</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
          Key Metrics
        </Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Total Animals</Text>
            <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>{stats.totalAnimals}</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Active</Text>
            <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>{stats.activeAnimals}</Text>
          </View>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: stats.readyToSell > 0 ? theme.status.successBackground : theme.background.secondary,
              },
            ]}
          >
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Ready to Sell</Text>
            <Text
              style={[
                TEXT_STYLES.h2,
                { color: stats.readyToSell > 0 ? theme.status.success : theme.text.primary },
              ]}
            >
              {stats.readyToSell}
            </Text>
            {stats.readyToSell > 0 && (
              <TouchableOpacity onPress={onNavigateToReadyToSell} style={styles.metricLink}>
                <Text style={[TEXT_STYLES.caption, { color: theme.status.success }]}>View →</Text>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: stats.healthAlerts > 0 ? theme.status.errorBackground : theme.background.secondary,
              },
            ]}
          >
            <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Health Alerts</Text>
            <Text
              style={[
                TEXT_STYLES.h2,
                { color: stats.healthAlerts > 0 ? theme.status.error : theme.text.primary },
              ]}
            >
              {stats.healthAlerts}
            </Text>
            {stats.healthAlerts > 0 && (
              <TouchableOpacity onPress={onNavigateToHealthMonitoring} style={styles.metricLink}>
                <Text style={[TEXT_STYLES.caption, { color: theme.status.error }]}>View →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
          Recent Activity
        </Text>
        <View style={[styles.activityCard, { backgroundColor: theme.background.secondary }]}>
          <View style={styles.activityRow}>
            <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>Open Batches</Text>
            <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>{stats.openBatches}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>Recent Weighs (Today)</Text>
            <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>{stats.recentWeighs}</Text>
          </View>
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
    marginBottom: SPACING[6],
  },
  section: {
    marginBottom: SPACING[6],
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  actionButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    minWidth: 120,
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  metricLink: {
    marginTop: SPACING[1],
  },
  activityCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
});

