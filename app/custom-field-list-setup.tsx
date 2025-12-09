/**
 * Custom Field List Setup Screen
 * 
 * Create and edit Custom Field Lists (CFLs).
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { container } from '@/infrastructure/di/container';
import { generateUUID } from '@/shared/utils/uuid';
import {
  CustomFieldDefinition,
  CustomFieldDataType,
  CustomFieldList,
} from '@/domain/entities/custom-field-list';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function CustomFieldListSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cflId?: string }>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [isSystemDefault, setIsSystemDefault] = useState(false);

  const isEditing = !!params.cflId;

  useEffect(() => {
    if (isEditing && params.cflId) {
      loadCFL();
    }
  }, [params.cflId]);

  const loadCFL = async () => {
    try {
      setLoading(true);
      const cflRepo = container.customFieldListRepository;
      const cfl = await cflRepo.findById(params.cflId!);

      if (cfl) {
        setName(cfl.name);
        setFields(cfl.fields);
        setIsSystemDefault(cfl.is_system_default);
      } else {
        Alert.alert('Not Found', 'Custom field list not found');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load CFL:', error);
      Alert.alert('Error', 'Failed to load custom field list');
    } finally {
      setLoading(false);
    }
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

    // Validate all fields have labels
    for (const field of fields) {
      if (!field.label.trim()) {
        Alert.alert('Validation Error', 'All fields must have a label');
        return;
      }
    }

    setSaving(true);
    try {
      const cflRepo = container.customFieldListRepository;
      const now = new Date();

      if (isEditing && params.cflId) {
        // Update existing
        const existing = await cflRepo.findById(params.cflId);
        if (!existing) {
          Alert.alert('Error', 'Custom field list not found');
          setSaving(false);
          return;
        }

        const updated: CustomFieldList = {
          ...existing,
          name: name.trim(),
          fields,
          updated_at: now,
          updated_by: DEFAULT_USER_ID,
        };

        await cflRepo.update(updated);
        Alert.alert('Success', 'Custom field list updated successfully');
      } else {
        // Create new
        const cfl: CustomFieldList = {
          cfl_id: generateUUID(),
          tenant_id: DEFAULT_TENANT_ID,
          name: name.trim(),
          version: 1,
          is_system_default: isSystemDefault,
          fields,
          created_at: now,
          created_by: DEFAULT_USER_ID,
          updated_at: now,
        };

        await cflRepo.create(cfl);
        Alert.alert('Success', 'Custom field list created successfully');
      }

      router.back();
    } catch (error) {
      console.error('Failed to save CFL:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save custom field list');
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

  const addOption = (fieldIndex: number) => {
    const updated = [...fields];
    const field = updated[fieldIndex];
    if (!field.options) {
      field.options = [];
    }
    field.options.push({ value: `option_${Date.now()}`, label: '' });
    setFields(updated);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, updates: Partial<{ value: string; label: string }>) => {
    const updated = [...fields];
    const field = updated[fieldIndex];
    if (field.options) {
      field.options[optionIndex] = { ...field.options[optionIndex], ...updates };
      setFields(updated);
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...fields];
    const field = updated[fieldIndex];
    if (field.options) {
      field.options = field.options.filter((_, i) => i !== optionIndex);
      setFields(updated);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  const dataTypes: CustomFieldDataType[] = ['text', 'number', 'date', 'boolean', 'select', 'multi-select'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {isEditing ? 'Edit Custom Field List' : 'Create Custom Field List'}
        </Text>
      </View>

      {/* CFL Name */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.text.primary }]}>Name *</Text>
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
      {!isEditing && (
        <View style={styles.field}>
          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: theme.text.primary }]}>System Default</Text>
            <Switch
              value={isSystemDefault}
              onValueChange={setIsSystemDefault}
              testID="cfl-system-default-switch"
            />
          </View>
          <Text style={[styles.helpText, { color: theme.text.secondary }]}>
            System defaults cannot be deleted but can be cloned
          </Text>
        </View>
      )}

      {/* Fields */}
      <View style={styles.field}>
        <View style={styles.fieldHeader}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Fields *</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.interactive.primary }]}
            onPress={addField}
            testID="cfl-add-field-button"
          >
            <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>+ Add Field</Text>
          </TouchableOpacity>
        </View>

        {fields.map((field, index) => (
          <View
            key={field.field_id}
            style={[styles.fieldCard, { backgroundColor: theme.background.secondary, borderColor: theme.border.default }]}
          >
            <View style={styles.fieldCardHeader}>
              <Text style={[styles.fieldNumber, { color: theme.text.primary }]}>Field {index + 1}</Text>
              {fields.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeField(index)}
                  testID={`cfl-remove-field-${index}`}
                >
                  <Text style={[styles.removeText, { color: theme.status.error }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fieldInputRow}>
              <View style={styles.fieldInput}>
                <Text style={[styles.smallLabel, { color: theme.text.secondary }]}>Label *</Text>
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
                <Text style={[styles.smallLabel, { color: theme.text.secondary }]}>Type *</Text>
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
                          styles.dataTypeButtonText,
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

            {/* Options for select/multi-select */}
            {(field.data_type === 'select' || field.data_type === 'multi-select') && (
              <View style={styles.optionsSection}>
                <View style={styles.optionsHeader}>
                  <Text style={[styles.smallLabel, { color: theme.text.secondary }]}>Options</Text>
                  <TouchableOpacity
                    style={[styles.addOptionButton, { backgroundColor: theme.interactive.secondary }]}
                    onPress={() => addOption(index)}
                  >
                    <Text style={[styles.addOptionText, { color: theme.text.primary }]}>+ Add</Text>
                  </TouchableOpacity>
                </View>
                {field.options?.map((option, optIndex) => (
                  <View key={optIndex} style={styles.optionRow}>
                    <TextInput
                      style={[
                        styles.optionInput,
                        {
                          backgroundColor: theme.background.primary,
                          borderColor: theme.border.default,
                          color: theme.text.primary,
                        },
                      ]}
                      value={option.label}
                      onChangeText={(text) => updateOption(index, optIndex, { label: text })}
                      placeholder="Option label"
                      placeholderTextColor={theme.text.tertiary}
                    />
                    <TouchableOpacity
                      onPress={() => removeOption(index, optIndex)}
                      style={styles.removeOptionButton}
                    >
                      <Text style={[styles.removeText, { color: theme.status.error }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.fieldOptionRow}>
              <View style={styles.switchRow}>
                <Text style={[styles.smallLabel, { color: theme.text.secondary }]}>Required</Text>
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
            <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
              No fields added. Click "Add Field" to get started.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.background.secondary }]}
          onPress={() => router.back()}
          testID="cfl-cancel-button"
        >
          <Text style={[styles.buttonText, { color: theme.text.primary }]}>Cancel</Text>
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
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Save</Text>
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
  },
  header: {
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  field: {
    marginBottom: SPACING[4],
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[2],
  },
  smallLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  input: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[4],
    fontSize: 18,
    minHeight: 56,
  },
  helpText: {
    fontSize: 14,
    marginTop: SPACING[2],
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
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  fieldNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
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
    minHeight: 40,
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
  dataTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionsSection: {
    marginTop: SPACING[3],
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  addOptionButton: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
  },
  addOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    gap: SPACING[2],
    marginBottom: SPACING[2],
    alignItems: 'center',
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING[2],
    fontSize: 14,
    minHeight: 40,
  },
  removeOptionButton: {
    padding: SPACING[1],
  },
  fieldOptionRow: {
    marginTop: SPACING[2],
  },
  emptyState: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
    marginBottom: SPACING[6],
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
