/**
 * Entity Setup Screen
 * 
 * Screen for creating and editing entities (animals).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Entity, Species, Sex, EntityStatus } from '@/domain/entities/entity';

export interface EntitySetupScreenProps {
  entityId?: string; // If provided, editing existing entity
  tenantId: string;
  onSave: (entity: Omit<Entity, 'entity_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  testID?: string;
}

export const EntitySetupScreen: React.FC<EntitySetupScreenProps> = ({
  entityId,
  tenantId,
  onSave,
  onCancel,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [primaryTag, setPrimaryTag] = useState('');
  const [rfidTag, setRfidTag] = useState('');
  const [species, setSpecies] = useState<Species>('cattle');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<Sex>('Unknown');
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState<EntityStatus>('Active');
  const [currentGroup, setCurrentGroup] = useState('');
  const [sourceType, setSourceType] = useState<string>('');
  const [sourceName, setSourceName] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState('');

  const isEditing = !!entityId;

  useEffect(() => {
    if (isEditing) {
      loadEntity();
    }
  }, [entityId]);

  const loadEntity = async () => {
    // TODO: Load entity data from repository
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleSave = async () => {
    if (!primaryTag.trim()) {
      Alert.alert('Validation Error', 'Primary tag is required');
      return;
    }

    if (!species) {
      Alert.alert('Validation Error', 'Species is required');
      return;
    }

    const targetWeight = targetWeightKg ? parseFloat(targetWeightKg) : undefined;
    if (targetWeightKg && (isNaN(targetWeight!) || targetWeight! <= 0)) {
      Alert.alert('Validation Error', 'Target weight must be a positive number');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        tenant_id: tenantId,
        primary_tag: primaryTag.trim(),
        rfid_tag: rfidTag.trim() || undefined,
        species,
        breed: breed.trim() || undefined,
        sex,
        birth_date: birthDate ? new Date(birthDate) : undefined,
        status,
        current_group: currentGroup.trim() || undefined,
        source_type: sourceType || undefined,
        source_name: sourceName.trim() || undefined,
        target_weight_kg: targetWeight,
        created_by: 'current-user-id', // TODO: Get from auth context
        updated_by: 'current-user-id',
      });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save entity');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID={testID}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  const speciesOptions: Species[] = ['cattle', 'sheep', 'pig', 'goat'];
  const sexOptions: Sex[] = ['M', 'F', 'Unknown'];
  const statusOptions: EntityStatus[] = ['Active', 'Sold', 'Dead', 'Culled'];
  const sourceTypeOptions = ['Farm', 'Auction', 'Feedlot', 'Other'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>
          {isEditing ? 'Edit Animal' : 'Add Animal'}
        </Text>
      </View>

      {/* Primary Tag */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Primary Tag *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={primaryTag}
          onChangeText={setPrimaryTag}
          placeholder="e.g., A1234"
          placeholderTextColor={theme.text.tertiary}
          testID="entity-primary-tag-input"
        />
      </View>

      {/* RFID Tag */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          RFID Tag (Optional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={rfidTag}
          onChangeText={setRfidTag}
          placeholder="RFID EPC code"
          placeholderTextColor={theme.text.tertiary}
          testID="entity-rfid-input"
        />
      </View>

      {/* Species */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Species *
        </Text>
        <View style={styles.optionsRow}>
          {speciesOptions.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.optionButton,
                {
                  backgroundColor: species === s ? theme.interactive.primary : theme.background.secondary,
                  borderColor: theme.border.default,
                },
              ]}
              onPress={() => setSpecies(s)}
              testID={`entity-species-${s}`}
            >
              <Text
                style={[
                  TEXT_STYLES.button,
                  {
                    color: species === s ? theme.text.inverse : theme.text.primary,
                    textTransform: 'capitalize',
                  },
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Breed */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Breed (Optional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={breed}
          onChangeText={setBreed}
          placeholder="e.g., Angus, Holstein"
          placeholderTextColor={theme.text.tertiary}
          testID="entity-breed-input"
        />
      </View>

      {/* Sex */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Sex
        </Text>
        <View style={styles.optionsRow}>
          {sexOptions.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.optionButton,
                {
                  backgroundColor: sex === s ? theme.interactive.primary : theme.background.secondary,
                  borderColor: theme.border.default,
                },
              ]}
              onPress={() => setSex(s)}
              testID={`entity-sex-${s}`}
            >
              <Text
                style={[
                  TEXT_STYLES.button,
                  {
                    color: sex === s ? theme.text.inverse : theme.text.primary,
                  },
                ]}
              >
                {s === 'M' ? 'Male' : s === 'F' ? 'Female' : 'Unknown'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Birth Date */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Birth Date (Optional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.text.tertiary}
          testID="entity-birth-date-input"
        />
      </View>

      {/* Target Weight */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Target Weight (kg) (Optional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={targetWeightKg}
          onChangeText={setTargetWeightKg}
          placeholder="e.g., 500"
          placeholderTextColor={theme.text.tertiary}
          keyboardType="numeric"
          testID="entity-target-weight-input"
        />
        <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary, marginTop: SPACING[1] }]}>
          Set target weight to track when animal is ready to sell
        </Text>
      </View>

      {/* Current Group */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Current Group (Optional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={currentGroup}
          onChangeText={setCurrentGroup}
          placeholder="Pen/Lot ID"
          placeholderTextColor={theme.text.tertiary}
          testID="entity-group-input"
        />
      </View>

      {/* Source */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Source Type (Optional)
        </Text>
        <View style={styles.optionsRow}>
          {sourceTypeOptions.map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.optionButton,
                {
                  backgroundColor: sourceType === st ? theme.interactive.primary : theme.background.secondary,
                  borderColor: theme.border.default,
                },
              ]}
              onPress={() => setSourceType(st)}
              testID={`entity-source-type-${st}`}
            >
              <Text
                style={[
                  TEXT_STYLES.button,
                  {
                    color: sourceType === st ? theme.text.inverse : theme.text.primary,
                  },
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Source Name */}
      {sourceType && (
        <View style={styles.field}>
          <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
            Source Name (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              },
            ]}
            value={sourceName}
            onChangeText={setSourceName}
            placeholder="Farm/Auction name"
            placeholderTextColor={theme.text.tertiary}
            testID="entity-source-name-input"
          />
        </View>
      )}

      {/* Status (only when editing) */}
      {isEditing && (
        <View style={styles.field}>
          <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
            Status
          </Text>
          <View style={styles.optionsRow}>
            {statusOptions.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: status === s ? theme.interactive.primary : theme.background.secondary,
                    borderColor: theme.border.default,
                  },
                ]}
                onPress={() => setStatus(s)}
                testID={`entity-status-${s}`}
              >
                <Text
                  style={[
                    TEXT_STYLES.button,
                    {
                      color: status === s ? theme.text.inverse : theme.text.primary,
                    },
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
          onPress={onCancel}
          testID="entity-cancel-button"
        >
          <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.interactive.primary }]}
          onPress={handleSave}
          disabled={saving}
          testID="entity-save-button"
        >
          {saving ? (
            <ActivityIndicator color={theme.text.inverse} />
          ) : (
            <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING[4],
  },
  header: {
    marginBottom: SPACING[6],
  },
  field: {
    marginBottom: SPACING[4],
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  optionButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
    marginBottom: SPACING[6],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
});

