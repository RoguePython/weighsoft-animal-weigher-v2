/**
 * Session Detail Screen
 * 
 * View all animals weighed in a specific session, grouped by batches (animal groups).
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { container } from '@/infrastructure/di/container';
import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { AnimalGroup } from '@/domain/entities/animal-group';
import { Alert } from 'react-native';

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
      const entities = await Promise.all(
        entityIds.map((id) => entityRepo.findById(id))
      );
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
        transactions: txs.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
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
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={{ color: theme.text.primary, textAlign: 'center' }}>Session not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.interactive.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>{session.name}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {session.type} • {session.status} • {transactions.length} weighing{transactions.length !== 1 ? 's' : ''}
        </Text>
        <Text style={[styles.date, { color: theme.text.tertiary }]}>
          Created: {new Date(session.created_at).toLocaleDateString()}
        </Text>
      </View>

      {transactions.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
            No animals have been weighed in this session yet.
          </Text>
        </View>
      ) : (
        <View style={styles.transactionsContainer}>
          {groupedTransactions.map((group) => (
            <View key={group.groupName} style={styles.groupSection}>
              <Text style={[styles.groupTitle, { color: theme.text.primary }]}>
                {group.groupName === 'Ungrouped' ? 'Ungrouped Animals' : group.groupName} ({group.transactions.length})
              </Text>
              {group.transactions.map((tx) => (
                <TouchableOpacity
                  key={tx.tx_id}
                  style={[styles.transactionCard, { backgroundColor: theme.background.secondary }]}
                  onPress={() => router.push(`/transaction-detail?txId=${tx.tx_id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.animalTag, { color: theme.text.primary }]}>
                        {tx.entity?.primary_tag || 'Unknown'}
                      </Text>
                      <Text style={[styles.animalName, { color: theme.text.secondary }]}>
                        {tx.entity?.name || tx.entity?.breed || 'No name'}
                      </Text>
                    </View>
                    <View style={styles.weightContainer}>
                      <Text style={[styles.weight, { color: theme.interactive.primary }]}>
                        {tx.weight_kg.toFixed(1)} kg
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionFooter}>
                    <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
                      {formatDate(tx.timestamp)}
                    </Text>
                    <Text style={[styles.reason, { color: theme.text.tertiary }]}>
                      {tx.reason}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  header: {
    marginBottom: SPACING[6],
  },
  backButton: {
    marginBottom: SPACING[2],
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: 16,
    marginBottom: SPACING[1],
  },
  date: {
    fontSize: 14,
  },
  emptyState: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  transactionsContainer: {
    gap: SPACING[4],
  },
  groupSection: {
    marginBottom: SPACING[4],
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[3],
    paddingBottom: SPACING[2],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  transactionCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[2],
  },
  transactionInfo: {
    flex: 1,
  },
  animalTag: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  animalName: {
    fontSize: 16,
  },
  weightContainer: {
    alignItems: 'flex-end',
  },
  weight: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  dateText: {
    fontSize: 14,
  },
  reason: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
});

