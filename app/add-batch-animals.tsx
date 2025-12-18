/**
 * Add Batch Animals Screen
 * 
 * Bulk add animals to a batch/group.
 */

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { generateUUID } from '@/shared/utils/uuid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

interface AnimalInput {
  id: string;
  tag: string;
  name: string;
}

export default function AddBatchAnimalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ batchId?: string }>();
  const { theme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [animals, setAnimals] = useState<AnimalInput[]>([
    { id: generateUUID(), tag: '', name: '' },
  ]);

  useEffect(() => {
    loadBatch();
  }, [params.batchId]);

  const loadBatch = async () => {
    if (!params.batchId) {
      setLoading(false);
      return;
    }

    try {
      const batchRepo = container.batchRepository;
      const loadedBatch = await batchRepo.findById(params.batchId);
      setBatch(loadedBatch);
    } catch (error) {
      console.error('Failed to load batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAnimalRow = () => {
    setAnimals([...animals, { id: generateUUID(), tag: '', name: '' }]);
  };

  const updateAnimal = (id: string, field: 'tag' | 'name', value: string) => {
    setAnimals(
      animals.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAnimal = (id: string) => {
    if (animals.length > 1) {
      setAnimals(animals.filter((a) => a.id !== id));
    }
  };

  const handleSave = async () => {
    // Validate
    const validAnimals = animals.filter((a) => a.tag.trim() && a.name.trim());
    if (validAnimals.length === 0) {
      Alert.alert('No Animals', 'Please add at least one animal with tag and name');
      return;
    }

    // Check for duplicate tags
    const tags = validAnimals.map((a) => a.tag.trim().toLowerCase());
    const duplicates = tags.filter((tag, index) => tags.indexOf(tag) !== index);
    if (duplicates.length > 0) {
      Alert.alert('Duplicate Tags', 'Please ensure each animal has a unique tag');
      return;
    }

    setSaving(true);
    try {
      const entityRepo = container.entityRepository;
      const batchId = params.batchId || generateUUID();

      // Check existing animals
      const allEntities = await entityRepo.findAll(DEFAULT_TENANT_ID);
      const existingTags = new Set(allEntities.map((e) => e.primary_tag.toLowerCase()));

      const now = new Date();
      const entitiesToCreate: Entity[] = [];

      for (const animal of validAnimals) {
        const tagLower = animal.tag.trim().toLowerCase();
        if (existingTags.has(tagLower)) {
          Alert.alert('Tag Exists', `Animal with tag "${animal.tag}" already exists. Skipping.`);
          continue;
        }

        entitiesToCreate.push({
          entity_id: generateUUID(),
          tenant_id: DEFAULT_TENANT_ID,
          primary_tag: animal.tag.trim(),
          species: 'cattle', // Default, user can change later
          name: animal.name.trim(),
          sex: 'Unknown',
          status: 'Active',
          current_group: batchId, // Link to batch
          created_at: now,
          created_by: DEFAULT_USER_ID,
          updated_at: now,
        });
      }

      // Create all animals
      for (const entity of entitiesToCreate) {
        await entityRepo.create(entity);
      }

      Alert.alert('Saved!', `Added ${entitiesToCreate.length} animals to batch`, [
        {
          text: 'Add More',
          onPress: () => {
            setAnimals([{ id: generateUUID(), tag: '', name: '' }]);
          },
        },
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save animals:', error);
      Alert.alert('Error', 'Failed to save animals. Please try again.');
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
        <Text style={[styles.title, { color: theme.text.primary }]}>Add Animals to Batch</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {batch ? batch.name : 'Enter animal details below'}
        </Text>
      </View>

      <View style={styles.form}>
        {animals.map((animal, index) => (
          <View key={animal.id} style={[styles.animalRow, { backgroundColor: theme.background.secondary }]}>
            <View style={styles.animalRowHeader}>
              <Text style={[styles.animalNumber, { color: theme.text.secondary }]}>
                Animal {index + 1}
              </Text>
              {animals.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeAnimal(animal.id)}
                  style={styles.removeButton}
                >
                  <Text style={[styles.removeButtonText, { color: theme.status.error }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text.primary }]}>Tag *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background.primary,
                      borderColor: theme.border.default,
                      color: theme.text.primary,
                    },
                  ]}
                  value={animal.tag}
                  onChangeText={(value) => updateAnimal(animal.id, 'tag', value)}
                  placeholder="A1234"
                  placeholderTextColor={theme.text.tertiary}
                  testID={`animal-tag-${index}`}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.text.primary }]}>Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background.primary,
                      borderColor: theme.border.default,
                      color: theme.text.primary,
                    },
                  ]}
                  value={animal.name}
                  onChangeText={(value) => updateAnimal(animal.id, 'name', value)}
                  placeholder="Animal name"
                  placeholderTextColor={theme.text.tertiary}
                  testID={`animal-name-${index}`}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.interactive.secondary }]}
          onPress={addAnimalRow}
          testID="add-animal-row-button"
        >
          <Text style={[styles.addButtonText, { color: theme.text.primary }]}>+ Add Another Animal</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => router.back()}
          testID="cancel-button"
        >
          <Text style={[styles.buttonText, { color: theme.text.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.interactive.primary }]}
          onPress={handleSave}
          disabled={saving}
          testID="save-button"
        >
          {saving ? (
            <ActivityIndicator color={theme.text.inverse} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Save Animals</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: SPACING[3],
    marginBottom: SPACING[6],
  },
  animalRow: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  animalRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  animalNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    padding: SPACING[1],
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    fontSize: 16,
    minHeight: 48,
  },
  addButton: {
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING[2],
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
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
  saveButton: {
    flex: 2,
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

