/**
 * Health Monitoring Screen
 *
 * Analytics screen for monitoring animal health alerts.
 * Enhanced with new component library for better UX.
 */

import { DetailScreenHeader } from '@/presentation/components';
import { EmptyState } from '@/presentation/components/ui';
import { useTheme } from '@/infrastructure/theme/theme-context';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function HealthMonitoringScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="health-monitoring-screen"
    >
      <DetailScreenHeader
        title="Health Monitoring"
        subtitle="Monitor health alerts and weight loss patterns"
        testID="health-monitoring-header"
      />

      <EmptyState
        icon="heart-outline"
        message="Coming Soon"
        description="Health monitoring and alerts will be available in a future update. This feature will help you identify animals with weight loss, track health trends, and receive alerts for animals that need attention."
        testID="health-monitoring-empty-state"
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
