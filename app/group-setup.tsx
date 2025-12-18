/**
 * Group Setup Screen
 * 
 * Create or edit an animal group.
 */

import { AnimalGroup } from '@/domain/entities/animal-group';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { generateUUID } from '@/shared/utils/uuid';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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

export default function GroupSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<AnimalGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const isEditing = !!params.groupId;

  const loadData = useCallback(async () => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const groupRepo = container.animalGroupRepository;
      const groupData = await groupRepo.findById(params.groupId!);

      if (!groupData) {
        Alert.alert('Error', 'Group not found');
        router.back();
        return;
      }

      setGroup(groupData);
      setGroupName(groupData.name);
      setGroupDescription(groupData.description || '');
    } catch (error) {
      console.error('Failed to load group:', error);
      Alert.alert('Error', 'Failed to load group');
    } finally {
      setLoading(false);
    }
  }, [isEditing, params.groupId, router]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert('Required Field', 'Please enter a group name');
      return;
    }

    setSaving(true);
    try {
      const groupRepo = container.animalGroupRepository;

      if (isEditing && group) {
        // Update existing group
        const updatedGroup: AnimalGroup = {
          ...group,
          name: groupName.trim(),
          description: groupDescription.trim() || undefined,
          updated_at: new Date(),
          updated_by: DEFAULT_USER_ID,
        };

        // Check for duplicate name (excluding current group)
        const allGroups = await groupRepo.findAll(DEFAULT_TENANT_ID);
        const duplicate = allGroups.find(
          (g) => g.group_id !== group.group_id && g.name.toLowerCase() === groupName.trim().toLowerCase()
        );

        if (duplicate) {
          Alert.alert('Duplicate Name', 'A group with this name already exists');
          setSaving(false);
          return;
        }

        await groupRepo.update(updatedGroup);
        Alert.alert('Success', 'Group updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        // Create new group
        const groupId = generateUUID();
        const now = new Date();

        // Check for duplicate name
        const allGroups = await groupRepo.findAll(DEFAULT_TENANT_ID);
        if (allGroups.some((g) => g.name.toLowerCase() === groupName.trim().toLowerCase())) {
          Alert.alert('Duplicate Name', 'A group with this name already exists');
          setSaving(false);
          return;
        }

        const newGroup: AnimalGroup = {
          group_id: groupId,
          tenant_id: DEFAULT_TENANT_ID,
          name: groupName.trim(),
          description: groupDescription.trim() || undefined,
          created_at: now,
          created_by: DEFAULT_USER_ID,
          updated_at: now,
        };

        await groupRepo.create(newGroup);
        Alert.alert('Success', 'Group created successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to save group:', error);
      Alert.alert('Error', 'Failed to save group. Please try again.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.interactive.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {isEditing ? 'Edit Group' : 'Create Group'}
        </Text>
      </View>

      <View style={styles.form}>
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
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: theme.text.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.interactive.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={theme.text.inverse} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
              {isEditing ? 'Update' : 'Create'}
            </Text>
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
  },
  form: {
    marginBottom: SPACING[6],
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[3],
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

