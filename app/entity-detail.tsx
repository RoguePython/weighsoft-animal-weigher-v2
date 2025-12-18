/**
 * Animal Detail Screen (Read-Only)
 *
 * View an animal's core info and full weighing history without editing.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';

const DEFAULT_TENANT_ID = 'default-tenant';

export default function EntityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ entityId?: string }>();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [weighingHistory, setWeighingHistory] = useState<Transaction[]>([]);
  const [batches, setBatches] = useState<Map<string, Batch>>(new Map());

  const loadEntity = useCallback(async () => {
    if (!params.entityId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const entityRepo = container.entityRepository;
      const result = await entityRepo.findById(params.entityId);

      if (!result) {
        router.back();
        return;
      }

      setEntity(result);
    } finally {
      setLoading(false);
    }
  }, [params.entityId, router]);

  const loadWeighingHistory = useCallback(async () => {
    if (!params.entityId) return;

    try {
      setLoadingHistory(true);
      const transactionRepo = container.transactionRepository;
      const batchRepo = container.batchRepository;

      const transactions = await transactionRepo.findByEntityId(params.entityId);
      setWeighingHistory(transactions);

      const batchIds = [...new Set(transactions.map((t) => t.batch_id))];
      const batchResults = await Promise.all(
        batchIds.map((id) => batchRepo.findById(id)),
      );

      const batchMap = new Map<string, Batch>();
      batchResults.forEach((batch) => {
        if (batch) batchMap.set(batch.batch_id, batch);
      });
      setBatches(batchMap);
    } finally {
      setLoadingHistory(false);
    }
  }, [params.entityId]);

  useEffect(() => {
    loadEntity();
    loadWeighingHistory();
  }, [loadEntity, loadWeighingHistory]);

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

  if (!entity) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={{ color: theme.text.primary, textAlign: 'center' }}>
          Animal not found.
        </Text>
      </View>
    );
  }

  const displayName = entity.name || entity.breed || 'No name';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{displayName}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Tag: {entity.primary_tag}
        </Text>
        {entity.target_weight_kg && (
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Target weight: {entity.target_weight_kg} kg
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Weighing History
        </Text>
        {loadingHistory ? (
          <ActivityIndicator size="small" color={theme.interactive.primary} />
        ) : weighingHistory.length === 0 ? (
          <View style={[styles.emptyHistory, { backgroundColor: theme.background.secondary }]}>
            <Text style={[styles.emptyHistoryText, { color: theme.text.secondary }]}>
              No weighing history yet. This animal hasn't been weighed.
            </Text>
          </View>
        ) : (
          weighingHistory.map((tx) => {
            const batch = batches.get(tx.batch_id);
            return (
              <View
                key={tx.tx_id}
                style={[styles.historyItem, { backgroundColor: theme.background.secondary }]}
              >
                <View style={styles.historyItemHeader}>
                  <View style={styles.historyItemInfo}>
                    <Text style={[styles.historyWeight, { color: theme.interactive.primary }]}>
                      {tx.weight_kg.toFixed(1)} kg
                    </Text>
                    {batch && (
                      <Text style={[styles.historySession, { color: theme.text.secondary }]}>
                        Session: {batch.name}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.historyDate, { color: theme.text.tertiary }]}>
                    {formatDate(tx.timestamp)}
                  </Text>
                </View>
                <Text style={[styles.historyReason, { color: theme.text.tertiary }]}>
                  {tx.reason}
                </Text>
              </View>
            );
          })
        )}
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[1],
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING[3],
  },
  emptyHistory: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  historyItem: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[1],
  },
  historyItemInfo: {
    flex: 1,
  },
  historyWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING[1],
  },
  historySession: {
    fontSize: 14,
  },
  historyDate: {
    fontSize: 12,
  },
  historyReason: {
    fontSize: 12,
    textTransform: 'capitalize',
    marginTop: SPACING[1],
  },
});


