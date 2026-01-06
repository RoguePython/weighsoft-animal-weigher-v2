/**
 * Batches/Groups List Screen
 *
 * Standalone animal groups list accessible from More menu.
 * Redesigned with new component library for better UX.
 */

import { AnimalGroup } from '@/domain/entities/animal-group';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DetailScreenHeader } from '@/presentation/components';
import { Card, EmptyState, LoadingState, PrimaryButton, SecondaryButton } from '@/presentation/components/ui';
import { SearchInput } from '@/presentation/components/ui/input';

const DEFAULT_TENANT_ID = 'default-tenant';

export default function BatchesListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<AnimalGroup[]>([]);
  const [animalCounts, setAnimalCounts] = useState<Map<string, number>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Ensure container is initialized
      try {
        container.database; // This will throw if not initialized
      } catch (error) {
        console.error('Container not initialized:', error);
        Alert.alert('Error', 'Database not ready. Please restart the app.');
        return;
      }
      const groupRepo = container.animalGroupRepository;

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
      console.error('Failed to load groups:', error);
      Alert.alert('Error', 'Failed to load animal groups');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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

  // Filter groups based on search
  const filteredGroups = groups.filter((group) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.name.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="batches-list-screen">
        <LoadingState message="Loading groups..." testID="loading-groups" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="batches-list-screen"
    >
      <DetailScreenHeader
        title="Animal Groups"
        subtitle="Organize animals into groups for easier management"
        action={{
          label: 'Create Group',
          onPress: () => router.push('/group-setup' as any),
          variant: 'primary',
          icon: 'add-circle-outline',
          testID: 'create-group-button',
        }}
        testID="groups-header"
      />

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name or description..."
        testID="groups-search-input"
        containerStyle={styles.searchContainer}
      />

      {/* Create Group Button (Alternative) */}
      <PrimaryButton
        title="Create New Group"
        icon="add-circle"
        iconPosition="left"
        onPress={() => router.push('/group-setup' as any)}
        testID="create-group-button-alt"
        style={styles.createButton}
      />

      {/* Groups List or Empty State */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={searchQuery ? 'search-outline' : 'layers-outline'}
          message={searchQuery ? 'No groups found' : 'No groups yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or create a new group to organize your animals.'
              : 'Create your first group to organize animals. Groups help you categorize animals by pen, lot, breed, or any other classification that makes sense for your operation.'
          }
          action={
            !searchQuery
              ? {
                  label: 'Create Your First Group',
                  onPress: () => router.push('/group-setup' as any),
                  testID: 'empty-state-create-button',
                }
              : undefined
          }
          testID="groups-empty-state"
        />
      ) : (
        <View style={styles.groupsList}>
          {filteredGroups.map((group) => {
            const animalCount = animalCounts.get(group.group_id) || 0;
            return (
              <Card
                key={group.group_id}
                variant="outlined"
                style={styles.groupCard}
                testID={`group-${group.group_id}`}
              >
                <View style={styles.groupCardContent}>
                  {/* Group Header */}
                  <TouchableOpacity
                    onPress={() => router.push(`/group-detail?groupId=${group.group_id}`)}
                    activeOpacity={0.8}
                    style={styles.groupHeaderTouchable}
                  >
                    <View style={styles.groupHeader}>
                      <View style={styles.groupInfo}>
                        <Text
                          style={[TEXT_STYLES.h4, { color: theme.text.primary }]}
                          testID={`group-name-${group.group_id}`}
                        >
                          {group.name}
                        </Text>
                        {group.description && (
                          <Text
                            style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginTop: SPACING[1] }]}
                            testID={`group-description-${group.group_id}`}
                          >
                            {group.description}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteGroup(group)}
                        style={styles.deleteButton}
                        testID={`group-delete-${group.group_id}`}
                      >
                        <Ionicons name="trash-outline" size={20} color={theme.status.error} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {/* Group Details */}
                  <View style={styles.groupDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="paw-outline" size={16} color={theme.text.secondary} />
                      <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[2] }]}>
                        {animalCount} animal{animalCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={theme.text.secondary} />
                      <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[2] }]}>
                        Created: {new Date(group.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Group Actions */}
                  <View style={styles.groupActions}>
                    <SecondaryButton
                      title="View"
                      icon="eye-outline"
                      iconPosition="left"
                      onPress={() => router.push(`/group-detail?groupId=${group.group_id}`)}
                      testID={`group-view-${group.group_id}`}
                      style={styles.actionButton}
                    />
                    <SecondaryButton
                      title="Edit"
                      icon="create-outline"
                      iconPosition="left"
                      onPress={() => router.push(`/group-setup?groupId=${group.group_id}`)}
                      testID={`group-edit-${group.group_id}`}
                      style={styles.actionButton}
                    />
                    <SecondaryButton
                      title="Add Animals"
                      icon="add-outline"
                      iconPosition="left"
                      onPress={() => router.push(`/group-detail?groupId=${group.group_id}`)}
                      testID={`group-add-animals-${group.group_id}`}
                      style={styles.actionButton}
                    />
                  </View>
                </View>
              </Card>
            );
          })}
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
  searchContainer: {
    marginBottom: SPACING[4],
  },
  createButton: {
    marginBottom: SPACING[4],
  },
  groupsList: {
    gap: SPACING[3],
  },
  groupCard: {
    marginBottom: SPACING[3],
  },
  groupCardContent: {
    gap: SPACING[3],
  },
  groupHeaderTouchable: {
    marginBottom: SPACING[2],
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupInfo: {
    flex: 1,
  },
  deleteButton: {
    padding: SPACING[2],
    minWidth: SPACING[12],
    minHeight: SPACING[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupDetails: {
    gap: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupActions: {
    flexDirection: 'row',
    gap: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
});
