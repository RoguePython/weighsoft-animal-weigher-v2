/**
 * Add Group Animals Screen
 * 
 * Add existing animals to an animal group.
 */

import { AnimalGroup } from '@/domain/entities/animal-group';
import { Entity } from '@/domain/entities/entity';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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

export default function AddGroupAnimalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId: string }>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<AnimalGroup | null>(null);
  const [allAnimals, setAllAnimals] = useState<Entity[]>([]);
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<string>>(new Set());
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
      const entityRepo = container.entityRepository;

      const [groupData, animalsData, groupAnimals] = await Promise.all([
        groupRepo.findById(params.groupId),
        entityRepo.findByStatus(DEFAULT_TENANT_ID, 'Active'),
        groupRepo.getAnimalsInGroup(params.groupId),
      ]);

      if (!groupData) {
        Alert.alert('Error', 'Group not found');
        router.back();
        return;
      }

      setGroup(groupData);

      // Filter out animals already in the group
      const groupAnimalIds = new Set(groupAnimals.map((a) => a.entity_id));
      const availableAnimals = animalsData.filter((a) => !groupAnimalIds.has(a.entity_id));
      setAllAnimals(availableAnimals);
      setFilteredAnimals(availableAnimals);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load animals');
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
      setFilteredAnimals(allAnimals);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allAnimals.filter(
      (animal) =>
        animal.primary_tag?.toLowerCase().includes(query) ||
        animal.name?.toLowerCase().includes(query) ||
        animal.breed?.toLowerCase().includes(query) ||
        animal.rfid_tag?.toLowerCase().includes(query)
    );
    setFilteredAnimals(filtered);
  }, [searchQuery, allAnimals]);

  const toggleAnimalSelection = (entityId: string) => {
    const newSelected = new Set(selectedAnimalIds);
    if (newSelected.has(entityId)) {
      newSelected.delete(entityId);
    } else {
      newSelected.add(entityId);
    }
    setSelectedAnimalIds(newSelected);
  };

  const handleSave = async () => {
    if (!group || selectedAnimalIds.size === 0) {
      Alert.alert('No Selection', 'Please select at least one animal to add');
      return;
    }

    setSaving(true);
    try {
      const groupRepo = container.animalGroupRepository;
      await groupRepo.addAnimalsToGroup(group.group_id, Array.from(selectedAnimalIds));

      Alert.alert('Success', `Added ${selectedAnimalIds.size} animal(s) to group`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to add animals:', error);
      Alert.alert('Error', 'Failed to add animals to group');
    } finally {
      setSaving(false);
    }
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
          <Text style={[styles.title, { color: theme.text.primary }]}>Add Animals</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Select animals to add to "{group.name}"
          </Text>
        </View>
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
          placeholder="Search animals..."
          placeholderTextColor={theme.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredAnimals.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
            {allAnimals.length === 0
              ? 'All active animals are already in this group.'
              : 'No animals match your search.'}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.selectionInfo}>
            <Text style={[styles.selectionText, { color: theme.text.secondary }]}>
              {selectedAnimalIds.size} animal{selectedAnimalIds.size !== 1 ? 's' : ''} selected
            </Text>
          </View>
          <FlatList
            data={filteredAnimals}
            keyExtractor={(item) => item.entity_id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = selectedAnimalIds.has(item.entity_id);
              return (
                <TouchableOpacity
                  style={[
                    styles.animalCard,
                    {
                      backgroundColor: isSelected
                        ? theme.interactive.primary
                        : theme.background.secondary,
                      borderColor: isSelected ? theme.interactive.primary : theme.border.default,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => toggleAnimalSelection(item.entity_id)}
                >
                  <View style={styles.animalInfo}>
                    <Text
                      style={[
                        styles.animalName,
                        { color: isSelected ? theme.text.inverse : theme.text.primary },
                      ]}
                    >
                      {item.name || item.breed || 'No name'}
                    </Text>
                    <Text
                      style={[
                        styles.animalTag,
                        { color: isSelected ? theme.text.inverse : theme.text.secondary },
                      ]}
                    >
                      Tag: {item.primary_tag}
                    </Text>
                    {item.breed && (
                      <Text
                        style={[
                          styles.animalBreed,
                          { color: isSelected ? theme.text.inverse : theme.text.tertiary },
                        ]}
                      >
                        {item.breed} • {item.species}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={[styles.checkmarkText, { color: theme.text.inverse }]}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}

      {selectedAnimalIds.size > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.background.primary }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.interactive.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.text.inverse} />
            ) : (
              <Text style={[styles.saveButtonText, { color: theme.text.inverse }]}>
                Add {selectedAnimalIds.size} Animal{selectedAnimalIds.size !== 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  subtitle: {
    fontSize: 16,
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
  selectionInfo: {
    paddingHorizontal: SPACING[4],
    marginBottom: SPACING[2],
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[24],
    gap: SPACING[3],
  },
  animalCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
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
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING[4],
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

