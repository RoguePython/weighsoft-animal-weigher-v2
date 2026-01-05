/**
 * Group Detail Screen
 * 
 * View and manage animals in an animal group.
 */

import { AnimalGroup } from '@/domain/entities/animal-group';
import { Entity } from '@/domain/entities/entity';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { EmptyState } from '@/presentation/components/ui';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_TENANT_ID = 'default-tenant';

export default function GroupDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId: string }>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<AnimalGroup | null>(null);
  const [animals, setAnimals] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAnimals, setFilteredAnimals] = useState<Entity[]>([]);

  const loadData = useCallback(async () => {
    if (!params.groupId) {
      Alert.alert('Error', 'Group ID is required');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const groupRepo = container.animalGroupRepository;

      const [groupData, animalsData] = await Promise.all([
        groupRepo.findById(params.groupId),
        groupRepo.getAnimalsInGroup(params.groupId),
      ]);

      if (!groupData) {
        Alert.alert('Error', 'Group not found');
        router.back();
        return;
      }

      setGroup(groupData);
      setAnimals(animalsData);
      setFilteredAnimals(animalsData);
    } catch (error) {
      console.error('Failed to load group data:', error);
      Alert.alert('Error', 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  }, [params.groupId, router]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter animals based on search
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAnimals(animals);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = animals.filter(
      (animal) =>
        animal.primary_tag?.toLowerCase().includes(query) ||
        animal.name?.toLowerCase().includes(query) ||
        animal.breed?.toLowerCase().includes(query) ||
        animal.rfid_tag?.toLowerCase().includes(query)
    );
    setFilteredAnimals(filtered);
  }, [searchQuery, animals]);

  const handleRemoveAnimal = async (animal: Entity) => {
    if (!group) return;

    Alert.alert('Remove Animal', `Remove "${animal.primary_tag}" from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const groupRepo = container.animalGroupRepository;
            await groupRepo.removeAnimalsFromGroup(group.group_id, [animal.entity_id]);
            loadData();
          } catch (error) {
            console.error('Failed to remove animal:', error);
            Alert.alert('Error', 'Failed to remove animal from group');
          }
        },
      },
    ]);
  };

  const handleAddAnimals = () => {
    if (!group) return;
    router.push(`/add-group-animals?groupId=${group.group_id}`);
  };

  if (loading || !group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.interactive.primary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{group.name}</Text>
          {group.description && (
            <Text style={[styles.description, { color: theme.text.secondary }]}>
              {group.description}
            </Text>
          )}
          <Text style={[styles.meta, { color: theme.text.tertiary }]}>
            {animals.length} animal{animals.length !== 1 ? 's' : ''} in this group
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.interactive.primary }]}
          onPress={handleAddAnimals}
        >
          <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>+ Add Animals</Text>
        </TouchableOpacity>
      </View>

      {animals.length > 0 && (
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
            placeholder="Search animals..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {animals.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          message="No animals in this group"
          description="Add animals to this group to organize them together. Groups help you manage animals by pen, lot, breed, or any other classification."
          action={{
            label: 'Add Animals to Group',
            onPress: handleAddAnimals,
            testID: 'empty-state-add-animals-button',
          }}
          testID="no-animals-empty-state"
        />
      ) : filteredAnimals.length === 0 ? (
        <EmptyState
          icon="search-outline"
          message="No animals match your search"
          description="Try adjusting your search terms to find the animals you're looking for."
          testID="no-search-results-empty-state"
        />
      ) : (
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.entity_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.animalCard, { backgroundColor: theme.background.secondary }]}
              activeOpacity={0.8}
              onPress={() => router.push(`/entity-detail?entityId=${item.entity_id}`)}
            >
              <View style={styles.animalInfo}>
                <Text style={[styles.animalName, { color: theme.text.primary }]}>
                  {item.name || item.breed || 'No name'}
                </Text>
                <Text style={[styles.animalTag, { color: theme.text.secondary }]}>
                  Tag: {item.primary_tag}
                </Text>
                {item.breed && (
                  <Text style={[styles.animalBreed, { color: theme.text.tertiary }]}>
                    {item.breed} • {item.species}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.removeButton, { borderColor: theme.status.error }]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleRemoveAnimal(item);
                }}
              >
                <Text style={[styles.removeButtonText, { color: theme.status.error }]}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING[4],
    paddingTop: SPACING[12],
  },
  backButton: {
    marginBottom: SPACING[2],
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    marginTop: SPACING[2],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  description: {
    fontSize: 16,
    marginBottom: SPACING[1],
  },
  meta: {
    fontSize: 14,
  },
  actions: {
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[3],
  },
  addButton: {
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[3],
  },
  searchInput: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[3],
    fontSize: 16,
    minHeight: 48,
  },
  listContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[24],
    gap: SPACING[3],
  },
  animalCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  animalTag: {
    fontSize: 14,
    marginBottom: SPACING[1],
  },
  animalBreed: {
    fontSize: 14,
  },
  removeButton: {
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

