/**
 * Weighing Detail Screen (Read-Only)
 *
 * View a single weighing (transaction) with all its custom fields.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ txId?: string }>();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!params.txId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const txRepo = container.transactionRepository;
        const entityRepo = container.entityRepository;
        const batchRepo = container.batchRepository;

        const tx = await txRepo.findById(params.txId);
        if (!tx) {
          setLoading(false);
          router.back();
          return;
        }

        setTransaction(tx);
        const [loadedEntity, loadedBatch] = await Promise.all([
          entityRepo.findById(tx.entity_id),
          batchRepo.findById(tx.batch_id),
        ]);
        setEntity(loadedEntity);
        setBatch(loadedBatch);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.txId, router]);

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  const renderCustomFieldValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value == null) {
      return '-';
    }
    return String(value);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={{ color: theme.text.primary, textAlign: 'center' }}>Weighing not found.</Text>
      </View>
    );
  }

  const fields = transaction.custom_fields_definition_snapshot ?? [];
  const values = transaction.custom_field_values ?? {};

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Weighing Summary</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {entity?.name || entity?.breed || 'Animal'} ({entity?.primary_tag ?? 'Unknown tag'})
        </Text>
        {batch && (
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Session: {batch.name}
          </Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: theme.background.secondary }]}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>Weight</Text>
        <Text style={[styles.weight, { color: theme.interactive.primary }]}>
          {transaction.weight_kg.toFixed(1)} kg
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: theme.text.secondary }]}>Date</Text>
          <Text style={[styles.metaValue, { color: theme.text.primary }]}>
            {formatDateTime(transaction.timestamp)}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: theme.text.secondary }]}>Reason</Text>
          <Text style={[styles.metaValue, { color: theme.text.primary }]}>
            {transaction.reason}
          </Text>
        </View>
      </View>

      {fields.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Custom Fields
          </Text>
          {fields.map((field) => (
            <View
              key={field.field_id}
              style={[styles.customFieldRow, { borderColor: theme.border.default }]}
            >
              <Text style={[styles.customFieldLabel, { color: theme.text.secondary }]}>
                {field.label}
              </Text>
              <Text style={[styles.customFieldValue, { color: theme.text.primary }]}>
                {renderCustomFieldValue(values[field.field_id])}
              </Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[1],
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[6],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 14,
    marginBottom: SPACING[1],
  },
  weight: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: SPACING[3],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING[1],
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING[3],
  },
  customFieldRow: {
    paddingVertical: SPACING[2],
    borderBottomWidth: 1,
  },
  customFieldLabel: {
    fontSize: 14,
    marginBottom: SPACING[1],
  },
  customFieldValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});


