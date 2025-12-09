/**
 * View Sessions Screen - Simple List with Create Option
 * 
 * View and manage weighing sessions. Create new batches.
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
import { TEXT_STYLES } from '@/shared/constants/typography';
import { container } from '@/infrastructure/di/container';
import { generateUUID } from '@/shared/utils/uuid';
import { Batch } from '@/domain/entities/batch';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function ViewSessionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Array<Batch & { transactionCount: number }>>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [batchName, setBatchName] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const batchRepo = container.batchRepository;
      const transactionRepo = container.transactionRepository;
      const cflRepo = container.customFieldListRepository;

      const allBatches = await batchRepo.findAll(DEFAULT_TENANT_ID);
      const allCFLs = await cflRepo.findAll(DEFAULT_TENANT_ID);
      const defaultCFL = allCFLs.find((cfl) => cfl.name.includes('Routine')) || allCFLs[0];

      // Get transaction count for each batch
      const sessionsWithCounts = await Promise.all(
        allBatches.map(async (batch) => {
          const transactions = await transactionRepo.findByBatchId(batch.batch_id);
          return {
            ...batch,
            transactionCount: transactions.length,
          };
        })
      );

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!batchName.trim()) {
      Alert.alert('Required Field', 'Please enter a batch name');
      return;
    }

    setCreating(true);
    try {
      const batchRepo = container.batchRepository;
      const cflRepo = container.customFieldListRepository;

      const allCFLs = await cflRepo.findAll(DEFAULT_TENANT_ID);
      const defaultCFL = allCFLs.find((cfl) => cfl.name.includes('Routine')) || allCFLs[0];

      if (!defaultCFL) {
        Alert.alert('Error', 'No custom field lists available. Please create one first.');
        setCreating(false);
        return;
      }

      const batchId = generateUUID();
      const now = new Date();
      const batch: Batch = {
        batch_id: batchId,
        tenant_id: DEFAULT_TENANT_ID,
        name: batchName.trim(),
        type: 'Routine',
        cfl_id: defaultCFL.cfl_id,
        cfl_version: defaultCFL.version,
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
            loadSessions();
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
        <Text style={[styles.title, { color: theme.text.primary }]}>Weighing Sessions</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          View your past and current weighing sessions
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

          {sessions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
                No sessions yet. Create a batch to get started.
              </Text>
            </View>
          ) : (
            <View style={styles.sessionsList}>
              {sessions.map((session) => (
                <TouchableOpacity
                  key={session.batch_id}
                  style={[styles.sessionCard, { backgroundColor: theme.background.secondary }]}
                  onPress={() => {
                    // Navigate to add animals or view details
                    router.push(`/add-batch-animals?batchId=${session.batch_id}`);
                  }}
                >
                  <View style={styles.sessionHeader}>
                    <Text style={[styles.sessionName, { color: theme.text.primary }]}>
                      {session.name}
                    </Text>
                    <Text style={[styles.sessionDate, { color: theme.text.secondary }]}>
                      {new Date(session.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionType, { color: theme.text.secondary }]}>
                      {session.type}
                    </Text>
                    <Text style={[styles.sessionStatus, { color: theme.text.secondary }]}>
                      {session.status}
                    </Text>
                  </View>
                  <Text style={[styles.sessionCount, { color: theme.text.primary }]}>
                    {session.transactionCount} animals weighed
                  </Text>
                </TouchableOpacity>
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

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.background.secondary }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { color: theme.text.primary }]}>Back</Text>
      </TouchableOpacity>
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
  sessionsList: {
    gap: SPACING[3],
    marginBottom: SPACING[6],
  },
  sessionCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[2],
  },
  sessionType: {
    fontSize: 14,
  },
  sessionStatus: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  sessionCount: {
    fontSize: 16,
  },
  emptyState: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
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
  backButton: {
    paddingVertical: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
