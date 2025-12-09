/**
 * Animals Tab - Manage Animals
 * 
 * Create, view, edit, and manage animals. Assign animals to batches.
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
import { Entity } from '@/domain/entities/entity';
import { Batch } from '@/domain/entities/batch';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function AnimalsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState<Entity[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
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
  };

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
      Alert.alert('No Batches', 'Please create a batch first');
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
          Alert.alert('Assigned', `Animal assigned to ${b.name}`);
        } catch (error) {
          console.error('Failed to assign animal:', error);
          Alert.alert('Error', 'Failed to assign animal to batch');
        }
      },
    }));

    Alert.alert('Assign to Batch', 'Select a batch:', [
      ...batchOptions,
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const filteredAnimals = animals.filter((animal) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      animal.primary_tag.toLowerCase().includes(query) ||
      animal.name?.toLowerCase().includes(query) ||
      animal.breed?.toLowerCase().includes(query)
    );
  });

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
        <Text style={[styles.title, { color: theme.text.primary }]}>Animals</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Manage your animals
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by tag or name..."
          placeholderTextColor={theme.text.tertiary}
        />
      </View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
        onPress={() => router.push('/entity-setup')}
      >
        <Text style={[styles.createButtonText, { color: theme.text.inverse }]}>
          + Add Animal
        </Text>
      </TouchableOpacity>

      {filteredAnimals.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
            {searchQuery ? 'No animals found' : 'No animals yet. Add your first animal to get started.'}
          </Text>
        </View>
      ) : (
        <View style={styles.animalsList}>
          {filteredAnimals.map((animal) => {
            const batch = batches.find((b) => b.batch_id === animal.current_group);
            return (
              <View key={animal.entity_id} style={[styles.animalCard, { backgroundColor: theme.background.secondary }]}>
                <View style={styles.animalHeader}>
                  <View style={styles.animalInfo}>
                    <Text style={[styles.animalTag, { color: theme.text.primary }]}>
                      {animal.primary_tag}
                    </Text>
                    <Text style={[styles.animalName, { color: theme.text.secondary }]}>
                      {animal.name || animal.breed || 'No name'}
                    </Text>
                    {batch && (
                      <Text style={[styles.animalBatch, { color: theme.text.tertiary }]}>
                        Batch: {batch.name}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteAnimal(animal)}
                    style={styles.deleteButton}
                  >
                    <Text style={[styles.deleteButtonText, { color: theme.status.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.animalActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
                    onPress={() => router.push(`/entity-setup?entityId=${animal.entity_id}`)}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.interactive.secondary }]}
                    onPress={() => handleAssignToBatch(animal)}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                      {animal.current_group ? 'Change Batch' : 'Assign to Batch'}
                    </Text>
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
  searchContainer: {
    marginBottom: SPACING[4],
  },
  searchInput: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    fontSize: 18,
    minHeight: 56,
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
  animalsList: {
    gap: SPACING[3],
  },
  animalCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  animalInfo: {
    flex: 1,
  },
  animalTag: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  animalName: {
    fontSize: 16,
    marginBottom: SPACING[1],
  },
  animalBatch: {
    fontSize: 14,
  },
  deleteButton: {
    padding: SPACING[2],
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  animalActions: {
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
  emptyState: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

