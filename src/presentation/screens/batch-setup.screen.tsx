/**
 * Batch Setup Screen
 * 
 * Screen for creating and editing batches (weighing sessions).
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
import { Batch, BatchType, BatchStatus } from '@/domain/entities/batch';
import { CustomFieldList } from '@/domain/entities/custom-field-list';

export interface BatchSetupScreenProps {
  batchId?: string; // If provided, editing existing batch
  tenantId: string;
  onSave: (batch: Omit<Batch, 'batch_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  customFieldLists: CustomFieldList[];
  testID?: string;
}

export const BatchSetupScreen: React.FC<BatchSetupScreenProps> = ({
  batchId,
  tenantId,
  onSave,
  onCancel,
  customFieldLists,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<BatchType>('Routine');
  const [selectedCFLId, setSelectedCFLId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [notes, setNotes] = useState('');

  const isEditing = !!batchId;

  useEffect(() => {
    // Auto-select CFL based on batch type
    const defaultCFL = customFieldLists.find((cfl) => {
      if (type === 'Arrival') return cfl.name.includes('Arrival');
      if (type === 'Routine') return cfl.name.includes('Routine');
      if (type === 'Shipment' || type === 'Auction') return cfl.name.includes('Shipment');
      return false;
    });
    if (defaultCFL) {
      setSelectedCFLId(defaultCFL.cfl_id);
    }
  }, [type, customFieldLists]);

  useEffect(() => {
    if (isEditing) {
      loadBatch();
    }
  }, [batchId]);

  const loadBatch = async () => {
    // TODO: Load batch data from repository
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Batch name is required');
      return;
    }

    if (!selectedCFLId) {
      Alert.alert('Validation Error', 'Custom Field List is required');
      return;
    }

    const selectedCFL = customFieldLists.find((cfl) => cfl.cfl_id === selectedCFLId);
    if (!selectedCFL) {
      Alert.alert('Validation Error', 'Selected Custom Field List not found');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        tenant_id: tenantId,
        name: name.trim(),
        type,
        cfl_id: selectedCFLId,
        cfl_version: selectedCFL.version,
        location_id: locationId || undefined,
        status: isEditing ? 'Draft' : 'Draft',
        created_by: 'current-user-id', // TODO: Get from auth context
        notes: notes.trim() || undefined,
      });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save batch');
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

  const batchTypes: BatchType[] = ['Arrival', 'Routine', 'Shipment', 'Auction', 'Other'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>
          {isEditing ? 'Edit Batch' : 'Create Batch'}
        </Text>
      </View>

      {/* Batch Name */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Batch Name *
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
          value={name}
          onChangeText={setName}
          placeholder="e.g., Pen 7 - Dec 2024"
          placeholderTextColor={theme.text.tertiary}
          testID="batch-name-input"
        />
      </View>

      {/* Batch Type */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Batch Type *
        </Text>
        <View style={styles.typeButtons}>
          {batchTypes.map((batchType) => (
            <TouchableOpacity
              key={batchType}
              style={[
                styles.typeButton,
                {
                  backgroundColor: type === batchType ? theme.interactive.primary : theme.background.secondary,
                  borderColor: theme.border.default,
                },
              ]}
              onPress={() => setType(batchType)}
              testID={`batch-type-${batchType}`}
            >
              <Text
                style={[
                  TEXT_STYLES.button,
                  {
                    color: type === batchType ? theme.text.inverse : theme.text.primary,
                  },
                ]}
              >
                {batchType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Field List */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Custom Field List *
        </Text>
        <View style={styles.cflList}>
          {customFieldLists.map((cfl) => (
            <TouchableOpacity
              key={cfl.cfl_id}
              style={[
                styles.cflItem,
                {
                  backgroundColor:
                    selectedCFLId === cfl.cfl_id ? theme.interactive.primary : theme.background.secondary,
                  borderColor: theme.border.default,
                },
              ]}
              onPress={() => setSelectedCFLId(cfl.cfl_id)}
              testID={`cfl-${cfl.cfl_id}`}
            >
              <Text
                style={[
                  TEXT_STYLES.body,
                  {
                    color: selectedCFLId === cfl.cfl_id ? theme.text.inverse : theme.text.primary,
                  },
                ]}
              >
                {cfl.name} (v{cfl.version})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location (Optional) */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Location (Optional)
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
          value={locationId}
          onChangeText={setLocationId}
          placeholder="Pen/Lot ID"
          placeholderTextColor={theme.text.tertiary}
          testID="batch-location-input"
        />
      </View>

      {/* Notes (Optional) */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Notes (Optional)
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.default,
              color: theme.text.primary,
            },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          placeholderTextColor={theme.text.tertiary}
          multiline
          numberOfLines={4}
          testID="batch-notes-input"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
          onPress={onCancel}
          testID="batch-cancel-button"
        >
          <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.interactive.primary }]}
          onPress={handleSave}
          disabled={saving}
          testID="batch-save-button"
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
  textArea: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  typeButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  cflList: {
    gap: SPACING[2],
  },
  cflItem: {
    padding: SPACING[3],
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

