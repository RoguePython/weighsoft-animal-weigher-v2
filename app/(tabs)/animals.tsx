/**
 * Animals Tab - Manage Animals
 *
 * Create, view, edit, and manage animals. Assign animals to sessions.
 * Redesigned with new component library for better UX.
 */

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AnimalCard } from '@/presentation/components';
import {
  EmptyState,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
} from '@/presentation/components/ui';
import { SearchInput } from '@/presentation/components/ui/input';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function AnimalsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animals, setAnimals] = useState<Entity[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Ensure container is initialized
      if (!container.isInitialized) {
        console.error('Container not initialized');
        Alert.alert('Error', 'Database not ready. Please restart the app.');
        return;
      }
      const entityRepo = container.entityRepository;
      const batchRepo = container.batchRepository;

      const [allAnimals, allBatches] = await Promise.all([
        entityRepo.findByStatus(DEFAULT_TENANT_ID, 'Active'),
        batchRepo.findAll(DEFAULT_TENANT_ID),
      ]);

      setAnimals(allAnimals);
      setBatches(allBatches);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load animals');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDeleteAnimal = async (animal: Entity) => {
    Alert.alert('Delete Animal', `Are you sure you want to delete "${animal.primary_tag}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const entityRepo = container.entityRepository;
            await entityRepo.delete(animal.entity_id);
            loadData();
          } catch (error) {
            console.error('Failed to delete animal:', error);
            Alert.alert('Error', 'Failed to delete animal');
          }
        },
      },
    ]);
  };

  const handleAssignToBatch = async (animal: Entity) => {
    if (batches.length === 0) {
      Alert.alert('No Sessions', 'Please create a session first');
      return;
    }

    const batchOptions = batches.map((b) => ({
      text: b.name,
      onPress: async () => {
        try {
          const entityRepo = container.entityRepository;
          const updated = { ...animal, current_group: b.batch_id };
          await entityRepo.update(updated);
          loadData();
          Alert.alert('Assigned', `Animal assigned to session ${b.name}`);
        } catch (error) {
          console.error('Failed to assign animal:', error);
          Alert.alert('Error', 'Failed to assign animal to session');
        }
      },
    }));

    Alert.alert('Assign to Session', 'Select a session:', [
      ...batchOptions,
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleQuickWeigh = (animal: Entity) => {
    // Find an open session for this animal, or navigate to weigh screen
    const animalBatch = batches.find((b) => b.batch_id === animal.current_group);
    if (animalBatch && (animalBatch.status === 'Open' || animalBatch.status === 'Draft')) {
      router.push(`/(tabs)/weigh?batchId=${animalBatch.batch_id}` as any);
    } else {
      // Navigate to weigh screen and let user select session
      router.push('/(tabs)/weigh' as any);
    }
  };

  const filteredAnimals = animals.filter((animal) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      animal.primary_tag.toLowerCase().includes(query) ||
      animal.name?.toLowerCase().includes(query) ||
      animal.breed?.toLowerCase().includes(query) ||
      animal.rfid_tag?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.background.primary }]}
        testID="animals-screen"
      >
        <LoadingState message="Loading animals..." testID="animals-loading-state" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.interactive.primary} />
      }
      testID="animals-screen"
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]} testID="animals-title">
          Animals
        </Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginTop: SPACING[2] }]}>
          Manage your animals
        </Text>
      </View>

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by tag, name, breed, or RFID..."
        testID="animals-search-input"
        containerStyle={styles.searchContainer}
      />

      {/* Add Animal Button */}
      <PrimaryButton
        title="Add Animal"
        icon="add-circle"
        iconPosition="left"
        onPress={() => router.push('/entity-setup')}
        testID="animals-add-button"
        style={styles.addButton}
      />

      {/* Animals List or Empty State */}
      {filteredAnimals.length === 0 ? (
        <EmptyState
          icon={searchQuery ? 'search-outline' : 'paw-outline'}
          message={searchQuery ? 'No animals found' : 'No animals yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or add a new animal to your herd.'
              : 'Add your first animal to start tracking weights, monitoring health, and managing your herd. You can add animals individually or import them in bulk.'
          }
          action={
            !searchQuery
              ? {
                  label: 'Add Your First Animal',
                  onPress: () => router.push('/entity-setup'),
                  testID: 'animals-empty-state-add-button',
                }
              : undefined
          }
          testID="animals-empty-state"
        />
      ) : (
        <View style={styles.animalsList}>
          {filteredAnimals.map((animal) => {
            const batch = batches.find((b) => b.batch_id === animal.current_group);
            return (
              <View key={animal.entity_id} style={styles.animalCardWrapper}>
                <AnimalCard
                  animal={animal}
                  onPress={() => router.push(`/entity-detail?entityId=${animal.entity_id}`)}
                  onQuickWeigh={() => handleQuickWeigh(animal)}
                  onViewHistory={() => router.push(`/entity-detail?entityId=${animal.entity_id}`)}
                  onEdit={() => router.push(`/entity-setup?entityId=${animal.entity_id}`)}
                  showQuickActions={true}
                  testID={`animal-card-${animal.entity_id}`}
                />

                {/* Additional Actions */}
                <View style={styles.additionalActions}>
                  <SecondaryButton
                    title={animal.current_group ? 'Change Session' : 'Assign to Session'}
                    icon="layers-outline"
                    iconPosition="left"
                    onPress={() => handleAssignToBatch(animal)}
                    testID={`animal-assign-${animal.entity_id}`}
                    style={styles.assignButton}
                  />
                  <TouchableOpacity
                    onPress={() => handleDeleteAnimal(animal)}
                    style={styles.deleteButton}
                    testID={`animal-delete-${animal.entity_id}`}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.status.error} />
                  </TouchableOpacity>
                </View>
              </View>
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
  header: {
    marginBottom: SPACING[6],
  },
  searchContainer: {
    marginBottom: SPACING[4],
  },
  addButton: {
    marginBottom: SPACING[4],
  },
  animalsList: {
    gap: SPACING[3],
  },
  animalCardWrapper: {
    marginBottom: SPACING[3],
  },
  additionalActions: {
    flexDirection: 'row',
    gap: SPACING[2],
    marginTop: SPACING[2],
    alignItems: 'center',
  },
  assignButton: {
    flex: 1,
  },
  deleteButton: {
    padding: SPACING[2],
    minWidth: SPACING[12], // 48pt minimum
    minHeight: SPACING[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
