/**
 * Health Monitoring Screen
 * 
 * Lists animals with health flags, filtered by severity, with quick actions.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { HealthFlagBadge } from '../components/health/health-flag-badge';
import { DetectHealthIssuesUseCase } from '@/domain/usecases/detect-health-issues.use-case';
import { HealthFlag, HealthSeverity } from '@/domain/services/health-detection.service';

export interface HealthMonitoringScreenProps {
  tenantId: string;
  useCase: DetectHealthIssuesUseCase;
  onFlagReview?: (flag: HealthFlag) => void;
  testID?: string;
}

export const HealthMonitoringScreen: React.FC<HealthMonitoringScreenProps> = ({
  tenantId,
  useCase,
  onFlagReview,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [healthFlags, setHealthFlags] = useState<HealthFlag[]>([]);
  const [filteredFlags, setFilteredFlags] = useState<HealthFlag[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<HealthSeverity | 'all'>('all');

  useEffect(() => {
    loadHealthFlags();
  }, [tenantId]);

  useEffect(() => {
    filterBySeverity(selectedSeverity);
  }, [healthFlags, selectedSeverity]);

  const loadHealthFlags = async () => {
    try {
      setLoading(true);
      // In real implementation, would load all entities and their health flags
      // For now, this is a placeholder
      setHealthFlags([]);
    } catch (err) {
      console.error('Failed to load health flags:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterBySeverity = (severity: HealthSeverity | 'all') => {
    if (severity === 'all') {
      setFilteredFlags(healthFlags);
    } else {
      setFilteredFlags(healthFlags.filter((flag) => flag.severity === severity));
    }
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
      <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>Health Monitoring</Text>

      <View style={styles.filters}>
        {(['all', 'minor', 'moderate', 'severe'] as const).map((severity) => (
          <TouchableOpacity
            key={severity}
            onPress={() => {
              setSelectedSeverity(severity);
              filterBySeverity(severity);
            }}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedSeverity === severity
                    ? theme.interactive.primary
                    : theme.background.secondary,
              },
            ]}
          >
            <Text
              style={[
                TEXT_STYLES.button,
                {
                  color:
                    selectedSeverity === severity ? theme.text.inverse : theme.text.primary,
                },
              ]}
            >
              {severity === 'all' ? 'All' : severity.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.flagsContainer}>
        {filteredFlags.length === 0 ? (
          <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
            No health flags found
          </Text>
        ) : (
          filteredFlags.map((flag, index) => (
            <HealthFlagBadge
              key={index}
              severity={flag.severity}
              message={flag.message}
              weightChange={flag.weight_change}
              onPress={() => onFlagReview?.(flag)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING[4],
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING[2],
    marginVertical: SPACING[4],
  },
  filterButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
  },
  flagsContainer: {
    marginTop: SPACING[2],
  },
});

