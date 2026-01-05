/**
 * Session Detail Screen
 *
 * View all animals weighed in a specific session, grouped by batches (animal groups).
 * Redesigned with standardized detail screen components.
 */

import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { container } from '@/infrastructure/di/container';
import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { AnimalGroup } from '@/domain/entities/animal-group';
import { DetailCard, DetailScreenHeader } from '@/presentation/components';
import { Card, EmptyState, LoadingState } from '@/presentation/components/ui';
import { Ionicons } from '@expo/vector-icons';

const DEFAULT_TENANT_ID = 'default-tenant';

interface TransactionWithEntity extends Transaction {
  entity?: Entity;
}

interface GroupedTransaction {
  groupName: string;
  transactions: TransactionWithEntity[];
}

export default function SessionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ batchId?: string }>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Batch | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithEntity[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransaction[]>([]);

  useEffect(() => {
    if (params.batchId) {
      loadSessionData();
    }
  }, [params.batchId]);

  const loadSessionData = async () => {
    if (!params.batchId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const batchRepo = container.batchRepository;
      const transactionRepo = container.transactionRepository;
      const entityRepo = container.entityRepository;

      // Load session
      const loadedSession = await batchRepo.findById(params.batchId);
      if (!loadedSession) {
        Alert.alert('Error', 'Session not found');
        router.back();
        return;
      }
      setSession(loadedSession);

      // Load all transactions for this session
      const sessionTransactions = await transactionRepo.findByBatchId(params.batchId);

      // Load entities for all transactions
      const entityIds = [...new Set(sessionTransactions.map((t) => t.entity_id))];
      const entities = await Promise.all(entityIds.map((id) => entityRepo.findById(id)));
      const entityMap = new Map<string, Entity>();
      entities.forEach((entity) => {
        if (entity) entityMap.set(entity.entity_id, entity);
      });

      // Load animal groups for all entities
      const groupRepo = container.animalGroupRepository;
      const entityGroupsMap = new Map<string, AnimalGroup[]>();
      for (const entityId of entityIds) {
        const groups = await groupRepo.getGroupsForAnimal(entityId);
        entityGroupsMap.set(entityId, groups);
      }

      // Combine transactions with entities
      const transactionsWithEntities: TransactionWithEntity[] = sessionTransactions.map((tx) => ({
        ...tx,
        entity: entityMap.get(tx.entity_id),
      }));

      setTransactions(transactionsWithEntities);

      // Group by animal groups
      const grouped = new Map<string, TransactionWithEntity[]>();

      transactionsWithEntities.forEach((tx) => {
        const groups = entityGroupsMap.get(tx.entity_id) || [];

        if (groups.length === 0) {
          // No groups - put in "Ungrouped"
          const groupName = 'Ungrouped';
          if (!grouped.has(groupName)) {
            grouped.set(groupName, []);
          }
          grouped.get(groupName)!.push(tx);
        } else {
          // Add to each group the animal belongs to
          groups.forEach((group) => {
            if (!grouped.has(group.name)) {
              grouped.set(group.name, []);
            }
            grouped.get(group.name)!.push(tx);
          });
        }
      });

      // Convert to array and sort
      const groupedArray: GroupedTransaction[] = Array.from(grouped.entries()).map(([groupName, txs]) => ({
        groupName,
        transactions: txs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      }));

      // Sort groups: Ungrouped last
      groupedArray.sort((a, b) => {
        if (a.groupName === 'Ungrouped') return 1;
        if (b.groupName === 'Ungrouped') return -1;
        return a.groupName.localeCompare(b.groupName);
      });

      setGroupedTransactions(groupedArray);
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="session-detail-screen">
        <LoadingState message="Loading session details..." testID="loading-session" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="session-detail-screen">
        <EmptyState
          icon="alert-circle-outline"
          message="Session not found"
          description="The session you're looking for doesn't exist or has been deleted."
          testID="session-not-found"
        />
      </View>
    );
  }

  const subtitle = `${session.type} • ${session.status} • ${transactions.length} weighing${transactions.length !== 1 ? 's' : ''}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="session-detail-screen"
    >
      <DetailScreenHeader
        title={session.name}
        subtitle={subtitle}
        action={{
          label: 'Weigh Animals',
          onPress: () => router.push(`/(tabs)/weigh?batchId=${session.batch_id}` as any),
          variant: 'primary',
          icon: 'scale-outline',
          testID: 'weigh-animals-button',
        }}
        testID="session-detail-header"
      />

      {/* Session Information */}
      <DetailCard
        title="Session Information"
        items={[
          { label: 'Type', value: session.type, icon: 'calendar-outline' },
          { label: 'Status', value: session.status, showAsBadge: true, badgeVariant: 'info' },
          { label: 'Created', value: new Date(session.created_at).toLocaleDateString(), icon: 'time-outline' },
          { label: 'Total Weighings', value: `${transactions.length}`, icon: 'scale-outline' },
        ]}
        testID="session-info-card"
      />

      {/* Transactions by Group */}
      {transactions.length === 0 ? (
        <DetailCard title="Weighings" testID="weighings-card">
          <EmptyState
            icon="scale-outline"
            message="No weighings yet"
            description="No animals have been weighed in this session yet. Start weighing animals to record their weights and track progress."
            action={{
              label: 'Weigh Animals',
              onPress: () => router.push(`/(tabs)/weigh?batchId=${session.batch_id}` as any),
              testID: 'empty-state-weigh-animals-button',
            }}
            testID="no-weighings-empty-state"
          />
        </DetailCard>
      ) : (
        <View style={styles.transactionsContainer}>
          {groupedTransactions.map((group) => (
            <DetailCard
              key={group.groupName}
              title={group.groupName === 'Ungrouped' ? 'Ungrouped Animals' : group.groupName}
              description={`${group.transactions.length} weighing${group.transactions.length !== 1 ? 's' : ''}`}
              testID={`group-${group.groupName}-card`}
            >
              <View style={styles.transactionsList}>
                {group.transactions.map((tx) => (
                  <Card
                    key={tx.tx_id}
                    variant="outlined"
                    onPress={() => router.push(`/transaction-detail?txId=${tx.tx_id}`)}
                    style={styles.transactionCard}
                    testID={`transaction-${tx.tx_id}`}
                  >
                    <View style={styles.transactionContent}>
                      <View style={styles.transactionHeader}>
                        <View style={styles.transactionInfo}>
                          <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>
                            {tx.entity?.primary_tag || 'Unknown'}
                          </Text>
                          <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginTop: SPACING[1] }]}>
                            {tx.entity?.name || tx.entity?.breed || 'No name'}
                          </Text>
                        </View>
                        <View style={styles.weightContainer}>
                          <Text style={[TEXT_STYLES.h3, { color: theme.interactive.primary }]}>
                            {tx.weight_kg.toFixed(1)} kg
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                      </View>
                      <View style={styles.transactionFooter}>
                        <Text style={[TEXT_STYLES.caption, { color: theme.text.tertiary }]}>
                          {formatDate(tx.timestamp)}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { color: theme.text.tertiary, textTransform: 'capitalize' }]}>
                          {tx.reason}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </DetailCard>
          ))}
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
  transactionsContainer: {
    gap: SPACING[4],
  },
  transactionsList: {
    gap: SPACING[2],
    marginTop: SPACING[2],
  },
  transactionCard: {
    marginBottom: SPACING[2],
  },
  transactionContent: {
    gap: SPACING[2],
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
  },
  weightContainer: {
    alignItems: 'flex-end',
    marginRight: SPACING[2],
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
});
