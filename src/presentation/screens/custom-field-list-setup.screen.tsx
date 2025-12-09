/**
 * Custom Field List Setup Screen
 * 
 * Screen for creating and editing Custom Field Lists (CFLs).
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
  Switch,
} from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import {
  CustomFieldList,
  CustomFieldDefinition,
  CustomFieldDataType,
  SelectOption,
} from '@/domain/entities/custom-field-list';

export interface CustomFieldListSetupScreenProps {
  cflId?: string; // If provided, editing existing CFL
  tenantId: string;
  onSave: (cfl: Omit<CustomFieldList, 'cfl_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  testID?: string;
}

export const CustomFieldListSetupScreen: React.FC<CustomFieldListSetupScreenProps> = ({
  cflId,
  tenantId,
  onSave,
  onCancel,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [isSystemDefault, setIsSystemDefault] = useState(false);

  const isEditing = !!cflId;

  useEffect(() => {
    if (isEditing) {
      loadCFL();
    }
  }, [cflId]);

  const loadCFL = async () => {
    // TODO: Load CFL data from repository
    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'CFL name is required');
      return;
    }

    if (fields.length === 0) {
      Alert.alert('Validation Error', 'At least one field is required');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        tenant_id: tenantId,
        name: name.trim(),
        version: 1, // TODO: Increment version when editing
        is_system_default: isSystemDefault,
        fields,
        created_by: 'current-user-id', // TODO: Get from auth context
        updated_by: 'current-user-id',
      });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save CFL');
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    const newField: CustomFieldDefinition = {
      field_id: `field_${Date.now()}`,
      label: '',
      data_type: 'text',
      is_required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<CustomFieldDefinition>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID={testID}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  const dataTypes: CustomFieldDataType[] = ['text', 'number', 'date', 'boolean', 'select', 'multi-select'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>
          {isEditing ? 'Edit Custom Field List' : 'Create Custom Field List'}
        </Text>
      </View>

      {/* CFL Name */}
      <View style={styles.field}>
        <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Name *
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
          placeholder="e.g., Standard Routine Weigh"
          placeholderTextColor={theme.text.tertiary}
          testID="cfl-name-input"
        />
      </View>

      {/* System Default Toggle */}
      <View style={styles.field}>
        <View style={styles.switchRow}>
          <Text style={[TEXT_STYLES.label, { color: theme.text.primary }]}>System Default</Text>
          <Switch
            value={isSystemDefault}
            onValueChange={setIsSystemDefault}
            disabled={isEditing} // Can't change after creation
            testID="cfl-system-default-switch"
          />
        </View>
        <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary, marginTop: SPACING[1] }]}>
          System defaults cannot be deleted but can be cloned
        </Text>
      </View>

      {/* Fields */}
      <View style={styles.field}>
        <View style={styles.fieldHeader}>
          <Text style={[TEXT_STYLES.label, { color: theme.text.primary }]}>Fields *</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.interactive.primary }]}
            onPress={addField}
            testID="cfl-add-field-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>+ Add Field</Text>
          </TouchableOpacity>
        </View>

        {fields.map((field, index) => (
          <View
            key={field.field_id}
            style={[styles.fieldCard, { backgroundColor: theme.background.secondary, borderColor: theme.border.default }]}
          >
            <View style={styles.fieldCardHeader}>
              <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>Field {index + 1}</Text>
              {fields.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeField(index)}
                  testID={`cfl-remove-field-${index}`}
                >
                  <Text style={[TEXT_STYLES.caption, { color: theme.status.error }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fieldInputRow}>
              <View style={styles.fieldInput}>
                <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Label *</Text>
                <TextInput
                  style={[
                    styles.smallInput,
                    {
                      backgroundColor: theme.background.primary,
                      borderColor: theme.border.default,
                      color: theme.text.primary,
                    },
                  ]}
                  value={field.label}
                  onChangeText={(text) => updateField(index, { label: text })}
                  placeholder="Field label"
                  placeholderTextColor={theme.text.tertiary}
                  testID={`cfl-field-label-${index}`}
                />
              </View>

              <View style={styles.fieldInput}>
                <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Type *</Text>
                <View style={styles.dataTypeButtons}>
                  {dataTypes.map((dt) => (
                    <TouchableOpacity
                      key={dt}
                      style={[
                        styles.dataTypeButton,
                        {
                          backgroundColor:
                            field.data_type === dt ? theme.interactive.primary : theme.background.primary,
                          borderColor: theme.border.default,
                        },
                      ]}
                      onPress={() => updateField(index, { data_type: dt })}
                      testID={`cfl-field-type-${index}-${dt}`}
                    >
                      <Text
                        style={[
                          TEXT_STYLES.caption,
                          {
                            color: field.data_type === dt ? theme.text.inverse : theme.text.primary,
                          },
                        ]}
                      >
                        {dt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.fieldOptionRow}>
              <View style={styles.switchRow}>
                <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Required</Text>
                <Switch
                  value={field.is_required}
                  onValueChange={(value) => updateField(index, { is_required: value })}
                  testID={`cfl-field-required-${index}`}
                />
              </View>
            </View>
          </View>
        ))}

        {fields.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
            <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
              No fields added. Click "Add Field" to get started.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
          onPress={onCancel}
          testID="cfl-cancel-button"
        >
          <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.interactive.primary }]}
          onPress={handleSave}
          disabled={saving}
          testID="cfl-save-button"
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  addButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
  },
  fieldCard: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING[3],
  },
  fieldCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  fieldInputRow: {
    flexDirection: 'row',
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  fieldInput: {
    flex: 1,
  },
  smallInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING[2],
    fontSize: 14,
    marginTop: SPACING[1],
  },
  dataTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[1],
    marginTop: SPACING[1],
  },
  dataTypeButton: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  fieldOptionRow: {
    marginTop: SPACING[2],
  },
  emptyState: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
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

