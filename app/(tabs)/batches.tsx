/**
 * Batches Tab - Manage Animal Groups
 * 
 * Create, view, edit, and manage animal groups (batches).
 * Animals can belong to multiple groups.
 */

import { AnimalGroup } from '@/domain/entities/animal-group';
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

export default function BatchesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<AnimalGroup[]>([]);
  const [animalCounts, setAnimalCounts] = useState<Map<string, number>>(new Map());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const groupRepo = container.animalGroupRepository;
      const entityRepo = container.entityRepository;

      const allGroups = await groupRepo.findAll(DEFAULT_TENANT_ID);
      setGroups(allGroups);

      // Load animal counts for each group
      const counts = new Map<string, number>();
      for (const group of allGroups) {
        const animals = await groupRepo.getAnimalsInGroup(group.group_id);
        counts.set(group.group_id, animals.length);
      }
      setAnimalCounts(counts);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load animal groups');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh groups whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Required Field', 'Please enter a group name');
      return;
    }

    setCreating(true);
    try {
      const groupRepo = container.animalGroupRepository;

      // Check if group name already exists
      const existingGroups = await groupRepo.findAll(DEFAULT_TENANT_ID);
      if (existingGroups.some((g) => g.name.toLowerCase() === groupName.trim().toLowerCase())) {
        Alert.alert('Duplicate Name', 'A group with this name already exists');
        setCreating(false);
        return;
      }

      const groupId = generateUUID();
      const now = new Date();
      const group: AnimalGroup = {
        group_id: groupId,
        tenant_id: DEFAULT_TENANT_ID,
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        created_at: now,
        created_by: DEFAULT_USER_ID,
        updated_at: now,
      };

      await groupRepo.create(group);

      Alert.alert('Group Created!', 'Would you like to add animals to this group?', [
        {
          text: 'Later',
          onPress: () => {
            setShowCreateForm(false);
            setGroupName('');
            setGroupDescription('');
            loadData();
          },
        },
        {
          text: 'Add Animals',
          onPress: () => {
            setShowCreateForm(false);
            setGroupName('');
            setGroupDescription('');
            router.push(`/group-detail?groupId=${groupId}`);
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (group: AnimalGroup) => {
    Alert.alert('Delete Group', `Are you sure you want to delete "${group.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const groupRepo = container.animalGroupRepository;
            await groupRepo.delete(group.group_id);
            loadData();
          } catch (error) {
            console.error('Failed to delete group:', error);
            Alert.alert('Error', 'Failed to delete group');
          }
        },
      },
    ]);
  };

  const handleEditGroup = (group: AnimalGroup) => {
    router.push(`/group-setup?groupId=${group.group_id}`);
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
        <Text style={[styles.title, { color: theme.text.primary }]}>Animal Groups</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Organize animals into groups for easier management
        </Text>
      </View>

      {!showCreateForm ? (
        <>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={[styles.createButtonText, { color: theme.text.inverse }]}>
              + Create New Group
            </Text>
          </TouchableOpacity>

          {groups.length === 0 ? (
            <EmptyState
              icon="layers-outline"
              message="No groups yet"
              description="Create your first group to organize animals. Groups help you categorize animals by pen, lot, breed, or any other classification."
              action={{
                label: 'Create Your First Group',
                onPress: () => setShowCreateForm(true),
                testID: 'empty-state-create-group-button',
              }}
              testID="groups-empty-state"
            />
          ) : (
            <View style={styles.groupsList}>
              {groups.map((group) => {
                const animalCount = animalCounts.get(group.group_id) || 0;
                return (
                  <TouchableOpacity
                    key={group.group_id}
                    style={[styles.groupCard, { backgroundColor: theme.background.secondary }]}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/group-detail?groupId=${group.group_id}`)}
                  >
                    <View style={styles.groupHeader}>
                      <View style={styles.groupInfo}>
                        <Text style={[styles.groupName, { color: theme.text.primary }]}>
                          {group.name}
                        </Text>
                        {group.description && (
                          <Text style={[styles.groupDescription, { color: theme.text.secondary }]}>
                            {group.description}
                          </Text>
                        )}
                        <Text style={[styles.groupMeta, { color: theme.text.tertiary }]}>
                          {animalCount} animal{animalCount !== 1 ? 's' : ''} • Created{' '}
                          {new Date(group.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.groupActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push(`/group-detail?groupId=${group.group_id}`);
                        }}
                      >
                        <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                          Manage Animals
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleEditGroup(group);
                        }}
                      >
                        <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.deleteButton, { borderColor: theme.status.error }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group);
                        }}
                      >
                        <Text style={[styles.deleteButtonText, { color: theme.status.error }]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <View style={styles.createForm}>
          <Text style={[styles.formTitle, { color: theme.text.primary }]}>Create New Group</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Group Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                },
              ]}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="e.g., Pen 7, Lot A, Group 1"
              placeholderTextColor={theme.text.tertiary}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                },
              ]}
              value={groupDescription}
              onChangeText={setGroupDescription}
              placeholder="Optional description for this group"
              placeholderTextColor={theme.text.tertiary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
              onPress={() => {
                setShowCreateForm(false);
                setGroupName('');
                setGroupDescription('');
              }}
            >
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
              onPress={handleCreateGroup}
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
  groupsList: {
    gap: SPACING[3],
  },
  groupCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  groupHeader: {
    marginBottom: SPACING[3],
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: SPACING[1],
  },
  groupMeta: {
    fontSize: 14,
  },
  groupActions: {
    flexDirection: 'row',
    gap: SPACING[2],
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
