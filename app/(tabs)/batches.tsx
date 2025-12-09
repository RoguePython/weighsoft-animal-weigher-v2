/**
 * Batches Tab - Manage Weighing Sessions
 * 
 * Create, view, edit, and manage batches.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { container } from '@/infrastructure/di/container';
import { generateUUID } from '@/shared/utils/uuid';
import { Batch } from '@/domain/entities/batch';
import { CustomFieldList } from '@/domain/entities/custom-field-list';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function BatchesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [cfls, setCfls] = useState<CustomFieldList[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [batchName, setBatchName] = useState('');
  const [batchType, setBatchType] = useState<Batch['type']>('Routine');
  const [selectedCFLId, setSelectedCFLId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const batchRepo = container.batchRepository;
      const cflRepo = container.customFieldListRepository;

      const [allBatches, allCFLs] = await Promise.all([
        batchRepo.findAll(DEFAULT_TENANT_ID),
        cflRepo.findAll(DEFAULT_TENANT_ID),
      ]);

      setBatches(allBatches);
      setCfls(allCFLs);

      // Auto-select default CFL
      if (allCFLs.length > 0 && !selectedCFLId) {
        const defaultCFL = allCFLs.find((cfl) => cfl.name.includes('Routine')) || allCFLs[0];
        if (defaultCFL) {
          setSelectedCFLId(defaultCFL.cfl_id);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!batchName.trim()) {
      Alert.alert('Required Field', 'Please enter a batch name');
      return;
    }

    if (!selectedCFLId) {
      Alert.alert('Required Field', 'Please select a custom field list');
      return;
    }

    setCreating(true);
    try {
      const batchRepo = container.batchRepository;
      const selectedCFL = cfls.find((cfl) => cfl.cfl_id === selectedCFLId);

      if (!selectedCFL) {
        Alert.alert('Error', 'Selected custom field list not found');
        setCreating(false);
        return;
      }

      const batchId = generateUUID();
      const now = new Date();
      const batch: Batch = {
        batch_id: batchId,
        tenant_id: DEFAULT_TENANT_ID,
        name: batchName.trim(),
        type: batchType,
        cfl_id: selectedCFL.cfl_id,
        cfl_version: selectedCFL.version,
        status: 'Draft',
        created_at: now,
        created_by: DEFAULT_USER_ID,
        updated_at: now,
      };

      await batchRepo.create(batch);
      await batchRepo.start(batchId);

      Alert.alert('Batch Created!', 'Would you like to add animals to this batch?', [
        {
          text: 'Later',
          onPress: () => {
            setShowCreateForm(false);
            setBatchName('');
            loadData();
          },
        },
        {
          text: 'Add Animals',
          onPress: () => {
            setShowCreateForm(false);
            setBatchName('');
            router.push(`/add-batch-animals?batchId=${batchId}`);
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to create batch:', error);
      Alert.alert('Error', 'Failed to create batch. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBatch = async (batch: Batch) => {
    if (batch.status !== 'Draft') {
      Alert.alert('Cannot Delete', 'Only draft batches can be deleted');
      return;
    }

    Alert.alert('Delete Batch', `Are you sure you want to delete "${batch.name}"?`, [
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
            console.error('Failed to delete batch:', error);
            Alert.alert('Error', 'Failed to delete batch');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  const batchTypes: Batch['type'][] = ['Arrival', 'Routine', 'Shipment', 'Auction', 'Other'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Batches</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Manage your weighing sessions
        </Text>
      </View>

      {!showCreateForm ? (
        <>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={[styles.createButtonText, { color: theme.text.inverse }]}>
              + Create New Batch
            </Text>
          </TouchableOpacity>

          {batches.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
                No batches yet. Create your first batch to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.batchesList}>
              {batches.map((batch) => (
                <View key={batch.batch_id} style={[styles.batchCard, { backgroundColor: theme.background.secondary }]}>
                  <View style={styles.batchHeader}>
                    <View style={styles.batchInfo}>
                      <Text style={[styles.batchName, { color: theme.text.primary }]}>{batch.name}</Text>
                      <Text style={[styles.batchMeta, { color: theme.text.secondary }]}>
                        {batch.type} • {batch.status} • {new Date(batch.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {batch.status === 'Draft' && (
                      <TouchableOpacity
                        onPress={() => handleDeleteBatch(batch)}
                        style={styles.deleteButton}
                      >
                        <Text style={[styles.deleteButtonText, { color: theme.status.error }]}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.batchActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
                      onPress={() => router.push(`/add-batch-animals?batchId=${batch.batch_id}`)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                        Add Animals
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
                      onPress={() => router.push(`/weighing?batchId=${batch.batch_id}`)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                        Weigh Animals
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.createForm}>
          <Text style={[styles.formTitle, { color: theme.text.primary }]}>Create New Batch</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Batch Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                },
              ]}
              value={batchName}
              onChangeText={setBatchName}
              placeholder="e.g., Pen 7 - Dec 2024"
              placeholderTextColor={theme.text.tertiary}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Batch Type *</Text>
            <View style={styles.typeButtons}>
              {batchTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        batchType === type ? theme.interactive.primary : theme.background.secondary,
                      borderColor: theme.border.default,
                    },
                  ]}
                  onPress={() => setBatchType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color: batchType === type ? theme.text.inverse : theme.text.primary,
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Custom Field List *</Text>
            {cfls.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
                <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
                  No custom field lists. Create one in the Custom Fields tab first.
                </Text>
              </View>
            ) : (
              <View style={styles.cflList}>
                {cfls.map((cfl) => (
                  <TouchableOpacity
                    key={cfl.cfl_id}
                    style={[
                      styles.cflItem,
                      {
                        backgroundColor:
                          selectedCFLId === cfl.cfl_id ? theme.interactive.primary : theme.background.secondary,
                        borderColor: theme.border.default,
                      },
                    ]}
                    onPress={() => setSelectedCFLId(cfl.cfl_id)}
                  >
                    <Text
                      style={[
                        styles.cflItemText,
                        {
                          color: selectedCFLId === cfl.cfl_id ? theme.text.inverse : theme.text.primary,
                        },
                      ]}
                    >
                      {cfl.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
              onPress={() => {
                setShowCreateForm(false);
                setBatchName('');
              }}
            >
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
              onPress={handleCreateBatch}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={theme.text.inverse} />
              ) : (
                <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
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
  createButton: {
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING[4],
    minHeight: 56,
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  batchesList: {
    gap: SPACING[3],
  },
  batchCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  batchInfo: {
    flex: 1,
  },
  batchName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  batchMeta: {
    fontSize: 14,
  },
  deleteButton: {
    padding: SPACING[2],
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  batchActions: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createForm: {
    marginBottom: SPACING[6],
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING[4],
  },
  field: {
    marginBottom: SPACING[4],
  },
  label: {
    fontSize: 16,
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
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  typeButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cflList: {
    gap: SPACING[2],
  },
  cflItem: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  cflItemText: {
    fontSize: 16,
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
  formActions: {
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
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

