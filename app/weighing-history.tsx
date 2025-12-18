/**
 * Weighing History Screen
 * 
 * View all weighing transactions across all animals and sessions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { container } from '@/infrastructure/di/container';
import { Transaction } from '@/domain/entities/transaction';
import { Entity } from '@/domain/entities/entity';
import { Batch } from '@/domain/entities/batch';

const DEFAULT_TENANT_ID = 'default-tenant';

export default function WeighingHistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [entities, setEntities] = useState<Map<string, Entity>>(new Map());
  const [batches, setBatches] = useState<Map<string, Batch>>(new Map());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const transactionRepo = container.transactionRepository;
      const entityRepo = container.entityRepository;
      const batchRepo = container.batchRepository;

      // Load all transactions
      const allTransactions = await transactionRepo.findAll(DEFAULT_TENANT_ID);
      setTransactions(allTransactions);

      // Load unique entity IDs and batch IDs
      const entityIds = [...new Set(allTransactions.map((t) => t.entity_id))];
      const batchIds = [...new Set(allTransactions.map((t) => t.batch_id))];

      // Load entities and batches in parallel
      const [entityResults, batchResults] = await Promise.all([
        Promise.all(entityIds.map((id) => entityRepo.findById(id))),
        Promise.all(batchIds.map((id) => batchRepo.findById(id))),
      ]);

      // Build maps for quick lookup
      const entityMap = new Map<string, Entity>();
      entityResults.forEach((entity) => {
        if (entity) entityMap.set(entity.entity_id, entity);
      });

      const batchMap = new Map<string, Batch>();
      batchResults.forEach((batch) => {
        if (batch) batchMap.set(batch.batch_id, batch);
      });

      setEntities(entityMap);
      setBatches(batchMap);
    } catch (error) {
      console.error('Failed to load history:', error);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: theme.interactive.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>Weighing History</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {transactions.length} weighing{transactions.length !== 1 ? 's' : ''} recorded
        </Text>
      </View>

      {transactions.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
            No weighing history yet. Start weighing animals to see history here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.tx_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const entity = entities.get(item.entity_id);
            const batch = batches.get(item.batch_id);

            return (
              <View style={[styles.historyCard, { backgroundColor: theme.background.secondary }]}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyInfo}>
                    <Text style={[styles.animalTag, { color: theme.text.primary }]}>
                      {entity?.primary_tag || 'Unknown'}
                    </Text>
                    <Text style={[styles.animalName, { color: theme.text.secondary }]}>
                      {entity?.name || entity?.breed || 'No name'}
                    </Text>
                    {batch && (
                      <Text style={[styles.sessionName, { color: theme.text.tertiary }]}>
                        Session: {batch.name}
                      </Text>
                    )}
                  </View>
                  <View style={styles.weightContainer}>
                    <Text style={[styles.weight, { color: theme.interactive.primary }]}>
                      {item.weight_kg.toFixed(1)} kg
                    </Text>
                  </View>
                </View>
                <View style={styles.historyFooter}>
                  <Text style={[styles.date, { color: theme.text.tertiary }]}>
                    {formatDate(item.timestamp)}
                  </Text>
                  <Text style={[styles.reason, { color: theme.text.tertiary }]}>
                    {item.reason}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING[4],
    paddingTop: SPACING[6],
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
  },
  listContent: {
    padding: SPACING[4],
    gap: SPACING[3],
  },
  historyCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[2],
  },
  historyInfo: {
    flex: 1,
  },
  animalTag: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  animalName: {
    fontSize: 16,
    marginBottom: SPACING[1],
  },
  sessionName: {
    fontSize: 14,
  },
  weightContainer: {
    alignItems: 'flex-end',
  },
  weight: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  date: {
    fontSize: 14,
  },
  reason: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING[4],
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

