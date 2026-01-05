/**
 * Animal Card Component
 *
 * Reusable card component for displaying animal information with quick actions.
 * Used in animal lists and detail screens.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Entity, EntityStatus } from '@/domain/entities/entity';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Card } from './ui/card';
import { IconButton, SecondaryButton } from './ui/button';
import { StatusBadge } from './ui/badge';

/**
 * AnimalCard component props
 */
export interface AnimalCardProps {
  /**
   * Animal entity data
   */
  animal: Entity;
  /**
   * Handler for card press (navigate to detail)
   */
  onPress: () => void;
  /**
   * Optional handler for quick weigh action
   */
  onQuickWeigh?: () => void;
  /**
   * Optional handler for view history action
   */
  onViewHistory?: () => void;
  /**
   * Optional handler for edit action
   */
  onEdit?: () => void;
  /**
   * Whether to show quick action buttons (default: true)
   */
  showQuickActions?: boolean;
  /**
   * Custom style for container
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Get badge variant based on entity status
 */
const getStatusBadgeVariant = (status: EntityStatus): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Sold':
      return 'info';
    case 'Dead':
    case 'Culled':
      return 'error';
    default:
      return 'neutral';
  }
};

/**
 * AnimalCard Component
 *
 * Displays animal information in a card format with quick action buttons.
 * Uses Card component from UI library, StatusBadge, and action buttons.
 *
 * @example
 * ```tsx
 * <AnimalCard
 *   animal={animal}
 *   onPress={() => router.push(`/entity-detail?entityId=${animal.entity_id}`)}
 *   onQuickWeigh={() => handleQuickWeigh(animal)}
 *   onViewHistory={() => router.push(`/entity-detail?entityId=${animal.entity_id}`)}
 *   onEdit={() => router.push(`/entity-setup?entityId=${animal.entity_id}`)}
 *   showQuickActions={true}
 *   testID={`animal-card-${animal.entity_id}`}
 * />
 * ```
 */
export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  onPress,
  onQuickWeigh,
  onViewHistory,
  onEdit,
  showQuickActions = true,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const displayName = animal.name || animal.breed || 'No name';
  const statusVariant = getStatusBadgeVariant(animal.status);

  return (
    <Card
      variant="outlined"
      onPress={onPress}
      style={[styles.card, { minHeight: SPACING[16] }, style]} // 64pt minimum
      testID={testID}
    >
      <View style={styles.cardContent}>
        {/* Header: Name and Status */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text
              style={[TEXT_STYLES.h4, { color: theme.text.primary }]}
              testID={testID ? `${testID}-name` : undefined}
            >
              {displayName}
            </Text>
            <StatusBadge
              label={animal.status}
              variant={statusVariant}
              testID={testID ? `${testID}-status` : undefined}
            />
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
        </View>

        {/* Animal Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={16} color={theme.text.secondary} />
            <Text
              style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[1] }]}
              testID={testID ? `${testID}-tag` : undefined}
            >
              {animal.primary_tag}
            </Text>
            {animal.rfid_tag && (
              <>
                <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.tertiary, marginLeft: SPACING[2] }]}>
                  •
                </Text>
                <Text
                  style={[TEXT_STYLES.bodySmall, { color: theme.text.tertiary, marginLeft: SPACING[1] }]}
                  testID={testID ? `${testID}-rfid` : undefined}
                >
                  RFID: {animal.rfid_tag}
                </Text>
              </>
            )}
          </View>

          {(animal.breed || animal.species) && (
            <View style={styles.detailRow}>
              <Ionicons name="paw-outline" size={16} color={theme.text.secondary} />
              <Text
                style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[1] }]}
                testID={testID ? `${testID}-species` : undefined}
              >
                {animal.breed ? `${animal.breed} • ` : ''}
                {animal.species}
                {animal.sex !== 'Unknown' && ` • ${animal.sex}`}
              </Text>
            </View>
          )}

          {animal.current_group && (
            <View style={styles.detailRow}>
              <Ionicons name="layers-outline" size={16} color={theme.text.tertiary} />
              <Text
                style={[TEXT_STYLES.caption, { color: theme.text.tertiary, marginLeft: SPACING[1] }]}
                testID={testID ? `${testID}-group` : undefined}
              >
                Group: {animal.current_group}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        {showQuickActions && (onQuickWeigh || onViewHistory || onEdit) && (
          <View style={styles.actions}>
            {onQuickWeigh && (
              <SecondaryButton
                title="Quick Weigh"
                icon="scale-outline"
                iconPosition="left"
                onPress={onQuickWeigh}
                style={styles.actionButton}
                testID={testID ? `${testID}-quick-weigh` : undefined}
              />
            )}
            {onViewHistory && (
              <SecondaryButton
                title="History"
                icon="time-outline"
                iconPosition="left"
                onPress={onViewHistory}
                style={styles.actionButton}
                testID={testID ? `${testID}-view-history` : undefined}
              />
            )}
            {onEdit && (
              <IconButton
                icon="create-outline"
                size="small"
                onPress={onEdit}
                testID={testID ? `${testID}-edit` : undefined}
                accessibilityLabel="Edit animal"
              />
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING[3],
  },
  cardContent: {
    gap: SPACING[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    flexWrap: 'wrap',
  },
  details: {
    gap: SPACING[2],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[2],
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
});

