/**
 * Sessions Tab - Manage Weighing Sessions
 * 
 * Create, view, edit, and manage sessions.
 */

import { Batch } from '@/domain/entities/batch';
import { CustomFieldList } from '@/domain/entities/custom-field-list';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { generateUUID } from '@/shared/utils/uuid';
import { EmptyState } from '@/presentation/components/ui';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function SessionsScreen() {
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

  const loadData = useCallback(async () => {
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
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [selectedCFLId]);

  // Refresh sessions whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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

      Alert.alert('Session Created!', 'Would you like to add animals to this session?', [
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
      console.error('Failed to create session:', error);
      Alert.alert('Error', 'Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

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
        <Text style={[styles.title, { color: theme.text.primary }]}>Sessions</Text>
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
              + Create New Session
            </Text>
          </TouchableOpacity>

          {batches.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              message="No sessions yet"
              description="Create your first session to start organizing and weighing animals. Sessions help you track weighings by date, type, or purpose."
              action={{
                label: 'Create Your First Session',
                onPress: () => setShowCreateForm(true),
                testID: 'empty-state-create-session-button',
              }}
              testID="sessions-empty-state"
            />
          ) : (
            <View style={styles.batchesList}>
              {batches.map((batch) => (
                <TouchableOpacity
                  key={batch.batch_id}
                  style={[styles.batchCard, { backgroundColor: theme.background.secondary }]}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/session-detail?batchId=${batch.batch_id}`)}
                >
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
                      onPress={() => router.push(`/session-detail?batchId=${batch.batch_id}`)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                        View Weighings
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
                      onPress={() => router.push(`/(tabs)/weigh?batchId=${batch.batch_id}`)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                        Weigh Animals
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.createForm}>
          <Text style={[styles.formTitle, { color: theme.text.primary }]}>Create New Session</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Session Name *</Text>
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
            <Text style={[styles.label, { color: theme.text.primary }]}>Session Type *</Text>
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
              <EmptyState
                icon="list-outline"
                message="No custom field lists available"
                description="Create a custom field list in the Custom Fields tab first. Custom field lists define what additional information you want to capture during weighing."
                action={{
                  label: 'Go to Custom Fields',
                  onPress: () => router.push('/(tabs)/custom-fields' as any),
                  testID: 'empty-state-custom-fields-button',
                }}
                testID="no-cfls-empty-state"
              />
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
    paddingTop: SPACING[12],
    paddingBottom: SPACING[24],
  },
  header: {
    marginBottom: SPACING[6],
  },
  title: {
    ...TEXT_STYLES.h1,
    marginBottom: SPACING[2],
  },
  subtitle: {
    ...TEXT_STYLES.body,
  },
  createButton: {
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING[4],
    minHeight: SPACING[12] + SPACING[2], // 48 + 8 = 56pt minimum touch target
    justifyContent: 'center',
  },
  createButtonText: {
    ...TEXT_STYLES.button,
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
    ...TEXT_STYLES.h4,
    marginBottom: SPACING[1],
  },
  batchMeta: {
    ...TEXT_STYLES.bodySmall,
  },
  deleteButton: {
    padding: SPACING[2],
  },
  deleteButtonText: {
    ...TEXT_STYLES.label,
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
    ...TEXT_STYLES.label,
  },
  createForm: {
    marginBottom: SPACING[6],
  },
  formTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING[4],
  },
  field: {
    marginBottom: SPACING[4],
  },
  label: {
    ...TEXT_STYLES.label,
    marginBottom: SPACING[2],
  },
  input: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    ...TEXT_STYLES.bodyLarge,
    minHeight: SPACING[12] + SPACING[2], // 48 + 8 = 56pt minimum touch target
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
    ...TEXT_STYLES.label,
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
    ...TEXT_STYLES.body,
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
    minHeight: SPACING[12] + SPACING[2], // 48 + 8 = 56pt minimum touch target
    justifyContent: 'center',
  },
  buttonText: {
    ...TEXT_STYLES.button,
  },
});

