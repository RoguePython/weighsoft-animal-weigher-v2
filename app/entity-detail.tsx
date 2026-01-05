/**
 * Animal Detail Screen (Read-Only)
 *
 * View an animal's core info and full weighing history without editing.
 * Redesigned with standardized detail screen components.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { DetailCard, DetailScreenHeader } from '@/presentation/components';
import { Card, EmptyState, LoadingState } from '@/presentation/components/ui';
import { Ionicons } from '@expo/vector-icons';

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
      const batchResults = await Promise.all(batchIds.map((id) => batchRepo.findById(id)));

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
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="entity-detail-screen">
        <LoadingState message="Loading animal details..." testID="loading-entity" />
      </View>
    );
  }

  if (!entity) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="entity-detail-screen">
        <EmptyState
          icon="alert-circle-outline"
          message="Animal not found"
          description="The animal you're looking for doesn't exist or has been deleted."
          testID="entity-not-found"
        />
      </View>
    );
  }

  const displayName = entity.name || entity.breed || 'No name';
  const subtitle = `Tag: ${entity.primary_tag}${entity.target_weight_kg ? ` • Target: ${entity.target_weight_kg} kg` : ''}`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="entity-detail-screen"
    >
      <DetailScreenHeader
        title={displayName}
        subtitle={subtitle}
        action={{
          label: 'Edit',
          onPress: () => router.push(`/entity-setup?entityId=${entity.entity_id}`),
          variant: 'primary',
          icon: 'create-outline',
          testID: 'edit-entity-button',
        }}
        testID="entity-detail-header"
      />

      {/* Animal Information */}
      <DetailCard
        title="Animal Information"
        items={[
          { label: 'Tag', value: entity.primary_tag, icon: 'pricetag-outline' },
          { label: 'Status', value: entity.status, showAsBadge: true, badgeVariant: 'success' },
          ...(entity.rfid_tag ? [{ label: 'RFID', value: entity.rfid_tag, icon: 'radio-outline' }] : []),
          ...(entity.breed ? [{ label: 'Breed', value: entity.breed, icon: 'paw-outline' }] : []),
          ...(entity.species ? [{ label: 'Species', value: entity.species, icon: 'paw-outline' }] : []),
          ...(entity.sex && entity.sex !== 'Unknown' ? [{ label: 'Sex', value: entity.sex, icon: 'person-outline' }] : []),
          ...(entity.target_weight_kg ? [{ label: 'Target Weight', value: `${entity.target_weight_kg} kg`, icon: 'scale-outline' }] : []),
        ]}
        testID="animal-info-card"
      />

      {/* Weighing History */}
      <DetailCard
        title="Weighing History"
        description={`${weighingHistory.length} weighing${weighingHistory.length !== 1 ? 's' : ''} recorded`}
        testID="weighing-history-card"
      >
        {loadingHistory ? (
          <LoadingState message="Loading history..." testID="loading-history" />
        ) : weighingHistory.length === 0 ? (
          <EmptyState
            icon="scale-outline"
            message="No weighing history yet"
            description="This animal hasn't been weighed yet. Start a weighing session to record weights and track growth over time."
            action={{
              label: 'Start Weighing',
              onPress: () => router.push('/(tabs)/weigh' as any),
              testID: 'empty-state-start-weighing-button',
            }}
            testID="no-history-empty-state"
          />
        ) : (
          <View style={styles.historyList}>
            {weighingHistory.map((tx) => {
              const batch = batches.get(tx.batch_id);
              return (
                <Card
                  key={tx.tx_id}
                  variant="outlined"
                  onPress={() => router.push(`/transaction-detail?txId=${tx.tx_id}`)}
                  style={styles.historyItem}
                  testID={`history-item-${tx.tx_id}`}
                >
                  <View style={styles.historyItemContent}>
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemInfo}>
                        <Text style={[TEXT_STYLES.h4, { color: theme.interactive.primary }]}>
                          {tx.weight_kg.toFixed(1)} kg
                        </Text>
                        {batch && (
                          <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginTop: SPACING[1] }]}>
                            Session: {batch.name}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </View>
                    <View style={styles.historyItemFooter}>
                      <Text style={[TEXT_STYLES.caption, { color: theme.text.tertiary }]}>
                        {formatDate(tx.timestamp)}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: theme.text.tertiary, textTransform: 'capitalize' }]}>
                        {tx.reason}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </DetailCard>
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
  historyList: {
    gap: SPACING[2],
    marginTop: SPACING[2],
  },
  historyItem: {
    marginBottom: SPACING[2],
  },
  historyItemContent: {
    gap: SPACING[2],
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
});
