/**
 * Session Picker Component
 *
 * Horizontal scrollable picker for selecting weighing sessions.
 * Used in the weighing workflow to quickly switch between open sessions.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Batch } from '@/domain/entities/batch';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { StatusBadge } from './ui/badge';

/**
 * SessionPicker component props
 */
export interface SessionPickerProps {
  /**
   * List of sessions (batches) to display
   */
  sessions: Batch[];
  /**
   * Currently selected session ID
   */
  selectedSessionId?: string;
  /**
   * Handler for session selection
   */
  onSelect: (session: Batch) => void;
  /**
   * Optional handler for creating a new session
   */
  onCreateNew?: () => void;
  /**
   * Optional map of session IDs to transaction counts
   */
  transactionCounts?: Map<string, number>;
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
 * Get badge variant for batch type
 */
const getTypeBadgeVariant = (type: Batch['type']): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  switch (type) {
    case 'Arrival':
      return 'info';
    case 'Routine':
      return 'success';
    case 'Shipment':
      return 'warning';
    case 'Auction':
      return 'info';
    case 'Other':
    default:
      return 'neutral';
  }
};

/**
 * SessionPicker Component
 *
 * Displays open sessions in a horizontal scrollable list.
 * Each session shows name, type badge, and animals weighed count.
 * Selected session is highlighted.
 *
 * @example
 * ```tsx
 * <SessionPicker
 *   sessions={openSessions}
 *   selectedSessionId={selectedBatch?.batch_id}
 *   onSelect={handleSessionSelect}
 *   onCreateNew={() => router.push('/batch-setup')}
 *   transactionCounts={sessionTransactionCounts}
 *   testID="session-picker"
 * />
 * ```
 */
export const SessionPicker: React.FC<SessionPickerProps> = ({
  sessions,
  selectedSessionId,
  onSelect,
  onCreateNew,
  transactionCounts,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  if (sessions.length === 0 && !onCreateNew) {
    return null;
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID={testID ? `${testID}-scroll` : undefined}
      >
        {sessions.map((session) => {
          const isSelected = selectedSessionId === session.batch_id;
          const txCount = transactionCounts?.get(session.batch_id) || 0;
          const typeVariant = getTypeBadgeVariant(session.type);

          return (
            <TouchableOpacity
              key={session.batch_id}
              style={[
                styles.sessionItem,
                {
                  backgroundColor: isSelected
                    ? theme.interactive.primary
                    : theme.background.secondary,
                  borderColor: isSelected ? theme.interactive.primary : theme.border.default,
                },
              ]}
              onPress={() => onSelect(session)}
              activeOpacity={0.8}
              testID={testID ? `${testID}-session-${session.batch_id}` : undefined}
            >
              <View style={styles.sessionContent}>
                <Text
                  style={[
                    TEXT_STYLES.body,
                    {
                      color: isSelected ? theme.text.inverse : theme.text.primary,
                      fontWeight: isSelected ? '600' : '400',
                      marginBottom: SPACING[1],
                    },
                  ]}
                  testID={testID ? `${testID}-session-name-${session.batch_id}` : undefined}
                >
                  {session.name}
                </Text>
                <View style={styles.sessionMeta}>
                  <StatusBadge
                    label={session.type}
                    variant={typeVariant}
                    style={styles.typeBadge}
                    testID={testID ? `${testID}-session-type-${session.batch_id}` : undefined}
                  />
                  <View style={styles.countContainer}>
                    <Ionicons
                      name="paw-outline"
                      size={12}
                      color={isSelected ? theme.text.inverse : theme.text.secondary}
                    />
                    <Text
                      style={[
                        TEXT_STYLES.caption,
                        {
                          color: isSelected ? theme.text.inverse : theme.text.secondary,
                          marginLeft: SPACING[1],
                        },
                      ]}
                      testID={testID ? `${testID}-session-count-${session.batch_id}` : undefined}
                    >
                      {txCount}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Create New Session Button */}
        {onCreateNew && (
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: theme.interactive.secondary,
                borderColor: theme.border.default,
              },
            ]}
            onPress={onCreateNew}
            activeOpacity={0.8}
            testID={testID ? `${testID}-create-new` : undefined}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.interactive.primary} />
            <Text
              style={[TEXT_STYLES.caption, { color: theme.text.primary, marginTop: SPACING[1] }]}
              testID={testID ? `${testID}-create-new-label` : undefined}
            >
              New
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
  },
  scrollContent: {
    paddingHorizontal: SPACING[2],
    gap: SPACING[2],
  },
  sessionItem: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  sessionContent: {
    alignItems: 'center',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    marginTop: SPACING[1],
  },
  typeBadge: {
    // StatusBadge already has proper styling
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

