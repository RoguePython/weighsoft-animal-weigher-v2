/**
 * Add/Edit Animal Screen - Simple Form
 * 
 * Easy form to add or edit an animal with manual name entry.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { container } from '@/infrastructure/di/container';
import { generateUUID } from '@/shared/utils/uuid';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { Batch } from '@/domain/entities/batch';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function AddAnimalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ entityId?: string }>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tag, setTag] = useState('');
  const [name, setName] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [weighingHistory, setWeighingHistory] = useState<Transaction[]>([]);
  const [batches, setBatches] = useState<Map<string, Batch>>(new Map());
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isEditing = !!params.entityId;

  useEffect(() => {
    if (isEditing && params.entityId) {
      loadEntity();
      loadWeighingHistory();
    }
  }, [params.entityId]);

  const loadEntity = async () => {
    try {
      setLoading(true);
      const entityRepo = container.entityRepository;
      const entity = await entityRepo.findById(params.entityId!);

      if (entity) {
        setTag(entity.primary_tag);
        setName(entity.name || '');
        setTargetWeight(entity.target_weight_kg?.toString() || '');
      } else {
        Alert.alert('Not Found', 'Animal not found');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load entity:', error);
      Alert.alert('Error', 'Failed to load animal');
    } finally {
      setLoading(false);
    }
  };

  const loadWeighingHistory = async () => {
    if (!params.entityId) return;
    
    try {
      setLoadingHistory(true);
      const transactionRepo = container.transactionRepository;
      const batchRepo = container.batchRepository;

      const transactions = await transactionRepo.findByEntityId(params.entityId);
      setWeighingHistory(transactions);

      // Load batches for context
      const batchIds = [...new Set(transactions.map((t) => t.batch_id))];
      const batchResults = await Promise.all(
        batchIds.map((id) => batchRepo.findById(id))
      );

      const batchMap = new Map<string, Batch>();
      batchResults.forEach((batch) => {
        if (batch) batchMap.set(batch.batch_id, batch);
      });
      setBatches(batchMap);
    } catch (error) {
      console.error('Failed to load weighing history:', error);
    } finally {
      setLoadingHistory(false);
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

  const handleSave = async () => {
    if (!tag.trim()) {
      Alert.alert('Required Field', 'Please enter the animal tag number');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter the animal name');
      return;
    }

    const targetWeightValue = targetWeight ? parseFloat(targetWeight) : undefined;
    if (targetWeight && (isNaN(targetWeightValue!) || targetWeightValue! <= 0)) {
      Alert.alert('Invalid Weight', 'Target weight must be a positive number');
      return;
    }

    setSaving(true);
    try {
      const entityRepo = container.entityRepository;

      if (isEditing && params.entityId) {
        // Update existing
        const existing = await entityRepo.findById(params.entityId);
        if (!existing) {
          Alert.alert('Error', 'Animal not found');
          setSaving(false);
          return;
        }

        // Check if tag changed and if new tag exists
        if (existing.primary_tag.toLowerCase() !== tag.trim().toLowerCase()) {
          const allEntities = await entityRepo.findAll(DEFAULT_TENANT_ID);
          const duplicate = allEntities.find(
            (e) => e.entity_id !== params.entityId && e.primary_tag.toLowerCase() === tag.trim().toLowerCase()
          );

          if (duplicate) {
            Alert.alert('Tag Already Exists', `An animal with tag "${tag}" already exists.`);
            setSaving(false);
            return;
          }
        }

        const updated: Entity = {
          ...existing,
          primary_tag: tag.trim(),
          name: name.trim(),
          target_weight_kg: targetWeightValue,
          updated_at: new Date(),
          updated_by: DEFAULT_USER_ID,
        };

        await entityRepo.update(updated);
        Alert.alert('Success', 'Animal updated successfully');
      } else {
        // Create new
        // Check if tag already exists
        const allEntities = await entityRepo.findAll(DEFAULT_TENANT_ID);
        const existing = allEntities.find(
          (e) => e.primary_tag.toLowerCase() === tag.trim().toLowerCase()
        );

        if (existing) {
          Alert.alert('Tag Already Exists', `An animal with tag "${tag}" already exists.`);
          setSaving(false);
          return;
        }

        const now = new Date();
        const entity: Entity = {
          entity_id: generateUUID(),
          tenant_id: DEFAULT_TENANT_ID,
          primary_tag: tag.trim(),
          species: 'cattle', // Default
          name: name.trim(),
          sex: 'Unknown',
          status: 'Active',
          target_weight_kg: targetWeightValue,
          created_at: now,
          created_by: DEFAULT_USER_ID,
          updated_at: now,
        };

        await entityRepo.create(entity);
        Alert.alert('Success', 'Animal added successfully');
      }

      router.back();
    } catch (error) {
      console.error('Failed to save animal:', error);
      Alert.alert('Error', 'Failed to save animal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {isEditing ? 'Edit Animal' : 'Add Animal'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Enter the animal's basic information
        </Text>
      </View>

      <View style={styles.form}>
        {/* Tag Number */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Tag Number *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              },
            ]}
            value={tag}
            onChangeText={setTag}
            placeholder="e.g., A1234"
            placeholderTextColor={theme.text.tertiary}
            autoFocus={!isEditing}
            testID="tag-input"
          />
        </View>

        {/* Animal Name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Animal Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Bessie, Spot, etc."
            placeholderTextColor={theme.text.tertiary}
            testID="name-input"
          />
        </View>

        {/* Target Weight (Optional) */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Target Weight (kg) <Text style={{ fontWeight: 'normal' }}>Optional</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              },
            ]}
            value={targetWeight}
            onChangeText={setTargetWeight}
            placeholder="e.g., 500"
            placeholderTextColor={theme.text.tertiary}
            keyboardType="numeric"
            testID="target-weight-input"
          />
          <Text style={[styles.helpText, { color: theme.text.secondary }]}>
            Set a target weight to know when this animal is ready to sell
          </Text>
        </View>
      </View>

      {/* Weighing History Section (only when editing) */}
      {isEditing && (
        <View style={styles.historySection}>
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
            <FlatList
              data={weighingHistory}
              keyExtractor={(item) => item.tx_id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const batch = batches.get(item.batch_id);
                return (
                  <View style={[styles.historyItem, { backgroundColor: theme.background.secondary }]}>
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemInfo}>
                        <Text style={[styles.historyWeight, { color: theme.interactive.primary }]}>
                          {item.weight_kg.toFixed(1)} kg
                        </Text>
                        {batch && (
                          <Text style={[styles.historySession, { color: theme.text.secondary }]}>
                            Session: {batch.name}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.historyDate, { color: theme.text.tertiary }]}>
                        {formatDate(item.timestamp)}
                      </Text>
                    </View>
                    <Text style={[styles.historyReason, { color: theme.text.tertiary }]}>
                      {item.reason}
                    </Text>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => router.back()}
          testID="cancel-button"
        >
          <Text style={[styles.buttonText, { color: theme.text.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.interactive.primary }]}
          onPress={handleSave}
          disabled={saving}
          testID="save-button"
        >
          {saving ? (
            <ActivityIndicator color={theme.text.inverse} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Save</Text>
          )}
        </TouchableOpacity>
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
  },
  header: {
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: SPACING[5],
    marginBottom: SPACING[6],
  },
  field: {
    marginBottom: SPACING[4],
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[2],
  },
  input: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    fontSize: 18,
    minHeight: 56,
  },
  helpText: {
    fontSize: 14,
    marginTop: SPACING[2],
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  saveButton: {
    flex: 2,
    paddingVertical: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historySection: {
    marginTop: SPACING[6],
    marginBottom: SPACING[4],
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
