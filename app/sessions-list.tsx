/**
 * Sessions List Screen
 *
 * Standalone sessions list accessible from More menu.
 * Redesigned with new component library for better UX.
 */

import { Batch } from '@/domain/entities/batch';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DetailScreenHeader } from '@/presentation/components';
import {
  Card,
  EmptyState,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from '@/presentation/components/ui';
import { SearchInput } from '@/presentation/components/ui/input';

const DEFAULT_TENANT_ID = 'default-tenant';

/**
 * Get badge variant for batch status
 */
const getStatusBadgeVariant = (
  status: Batch['status']
): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  switch (status) {
    case 'Open':
      return 'success';
    case 'Closed':
      return 'info';
    case 'Draft':
      return 'warning';
    default:
      return 'neutral';
  }
};

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

export default function SessionsListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionCounts, setTransactionCounts] = useState<Map<string, number>>(new Map());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Ensure container is initialized
      if (!container.isInitialized) {
        console.error('Container not initialized');
        Alert.alert('Error', 'Database not ready. Please restart the app.');
        return;
      }
      const batchRepo = container.batchRepository;
      const transactionRepo = container.transactionRepository;

      const allBatches = await batchRepo.findAll(DEFAULT_TENANT_ID);
      setBatches(allBatches);

      // Count transactions per session
      const counts = new Map<string, number>();
      for (const batch of allBatches) {
        const transactions = await transactionRepo.findByBatchId(batch.batch_id);
        counts.set(batch.batch_id, transactions.length);
      }
      setTransactionCounts(counts);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDeleteBatch = async (batch: Batch) => {
    if (batch.status !== 'Draft') {
      Alert.alert('Cannot Delete', 'Only draft sessions can be deleted');
      return;
    }

    Alert.alert('Delete Session', `Are you sure you want to delete "${batch.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const batchRepo = container.batchRepository;
            await batchRepo.delete(batch.batch_id);
            loadData();
          } catch (error) {
            console.error('Failed to delete session:', error);
            Alert.alert('Error', 'Failed to delete session');
          }
        },
      },
    ]);
  };

  // Filter sessions based on search
  const filteredBatches = batches.filter((batch) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      batch.name.toLowerCase().includes(query) ||
      batch.type.toLowerCase().includes(query) ||
      batch.status.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="sessions-list-screen">
        <LoadingState message="Loading sessions..." testID="loading-sessions" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.interactive.primary} />
      }
      testID="sessions-list-screen"
    >
      <DetailScreenHeader
        title="Sessions"
        subtitle="Manage your weighing sessions"
        action={{
          label: 'Create Session',
          onPress: () => router.push('/batch-setup' as any),
          variant: 'primary',
          icon: 'add-circle-outline',
          testID: 'create-session-button',
        }}
        testID="sessions-header"
      />

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, type, or status..."
        testID="sessions-search-input"
        containerStyle={styles.searchContainer}
      />

      {/* Create Session Button (Alternative) */}
      <PrimaryButton
        title="Create New Session"
        icon="add-circle"
        iconPosition="left"
        onPress={() => router.push('/batch-setup' as any)}
        testID="create-session-button-alt"
        style={styles.createButton}
      />

      {/* Sessions List or Empty State */}
      {filteredBatches.length === 0 ? (
        <EmptyState
          icon={searchQuery ? 'search-outline' : 'calendar-outline'}
          message={searchQuery ? 'No sessions found' : 'No sessions yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or create a new session to start weighing animals.'
              : 'Create your first session to start weighing animals. Sessions help you organize weighings by date, type (Arrival, Routine, Shipment), or purpose.'
          }
          action={
            !searchQuery
              ? {
                  label: 'Create Your First Session',
                  onPress: () => router.push('/batch-setup' as any),
                  testID: 'empty-state-create-button',
                }
              : undefined
          }
          testID="sessions-empty-state"
        />
      ) : (
        <View style={styles.sessionsList}>
          {filteredBatches.map((batch) => {
            const txCount = transactionCounts.get(batch.batch_id) || 0;
            const statusVariant = getStatusBadgeVariant(batch.status);
            const typeVariant = getTypeBadgeVariant(batch.type);

            return (
              <Card key={batch.batch_id} variant="outlined" style={styles.sessionCard} testID={`session-${batch.batch_id}`}>
                <View style={styles.sessionCardContent}>
                  {/* Session Header */}
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionInfo}>
                      <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]} testID={`session-name-${batch.batch_id}`}>
                        {batch.name}
                      </Text>
                      <View style={styles.badgeRow}>
                        <StatusBadge
                          label={batch.type}
                          variant={typeVariant}
                          testID={`session-type-${batch.batch_id}`}
                        />
                        <StatusBadge
                          label={batch.status}
                          variant={statusVariant}
                          testID={`session-status-${batch.batch_id}`}
                        />
                      </View>
                    </View>
                    {batch.status === 'Draft' && (
                      <TouchableOpacity
                        onPress={() => handleDeleteBatch(batch)}
                        style={styles.deleteButton}
                        testID={`session-delete-${batch.batch_id}`}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.status.error} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Session Details */}
                  <View style={styles.sessionDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="scale-outline" size={16} color={theme.text.secondary} />
                      <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[2] }]}>
                        {txCount} animal{txCount !== 1 ? 's' : ''} weighed
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={theme.text.secondary} />
                      <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[2] }]}>
                        Created: {new Date(batch.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Session Actions */}
                  <View style={styles.sessionActions}>
                    <SecondaryButton
                      title="View"
                      icon="eye-outline"
                      iconPosition="left"
                      onPress={() => router.push(`/session-detail?batchId=${batch.batch_id}`)}
                      testID={`session-view-${batch.batch_id}`}
                      style={styles.actionButton}
                    />
                    {(batch.status === 'Open' || batch.status === 'Draft') && (
                      <SecondaryButton
                        title="Continue Weighing"
                        icon="scale-outline"
                        iconPosition="left"
                        onPress={() => router.push(`/(tabs)/weigh?batchId=${batch.batch_id}` as any)}
                        testID={`session-weigh-${batch.batch_id}`}
                        style={styles.actionButton}
                      />
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING[4],
    paddingTop: SPACING[12],
    paddingBottom: SPACING[24],
  },
  searchContainer: {
    marginBottom: SPACING[4],
  },
  createButton: {
    marginBottom: SPACING[4],
  },
  sessionsList: {
    gap: SPACING[3],
  },
  sessionCard: {
    marginBottom: SPACING[3],
  },
  sessionCardContent: {
    gap: SPACING[3],
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
    gap: SPACING[2],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING[2],
    flexWrap: 'wrap',
  },
  deleteButton: {
    padding: SPACING[2],
    minWidth: SPACING[12],
    minHeight: SPACING[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDetails: {
    gap: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButton: {
    flex: 1,
  },
});
