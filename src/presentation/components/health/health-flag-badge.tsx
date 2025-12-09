/**
 * Health Flag Badge Component
 * 
 * Displays a color-coded health flag with severity indicator and tooltip.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { HealthSeverity } from '@/domain/services/health-detection.service';

export interface HealthFlagBadgeProps {
  severity: HealthSeverity;
  message: string;
  weightChange?: number;
  onPress?: () => void;
  testID?: string;
}

export const HealthFlagBadge: React.FC<HealthFlagBadgeProps> = ({
  severity,
  message,
  weightChange,
  onPress,
  testID,
}) => {
  const { theme } = useTheme();

  const getSeverityColor = (): { background: string; text: string; border: string } => {
    switch (severity) {
      case 'severe':
        return {
          background: theme.status.errorBackground,
          text: theme.status.error,
          border: theme.status.error,
        };
      case 'moderate':
        return {
          background: theme.status.warningBackground,
          text: theme.status.warning,
          border: theme.status.warning,
        };
      case 'minor':
        return {
          background: theme.status.infoBackground,
          text: theme.status.info,
          border: theme.status.info,
        };
      default:
        return {
          background: theme.background.secondary,
          text: theme.text.primary,
          border: theme.border.default,
        };
    }
  };

  const getSeverityIcon = (): string => {
    switch (severity) {
      case 'severe':
        return '⚠️';
      case 'moderate':
        return '⚡';
      case 'minor':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  const colors = getSeverityColor();
  const icon = getSeverityIcon();

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.severity, { color: colors.text }]}>
          {severity.toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.message, { color: theme.text.primary }]}>{message}</Text>
      {weightChange !== undefined && (
        <Text style={[styles.weightChange, { color: colors.text }]}>
          {weightChange > 0 ? '+' : ''}
          {weightChange.toFixed(1)}kg
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginVertical: SPACING[1],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING[1],
  },
  severity: {
    ...TEXT_STYLES.label,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  message: {
    ...TEXT_STYLES.bodySmall,
    marginBottom: SPACING[1],
  },
  weightChange: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
});

