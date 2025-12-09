/**
 * Main Weighing Screen
 * 
 * Core screen for batch weighing with:
 * - Animal selection (RFID scan or search)
 * - Weight input
 * - Target weight progress
 * - Health flags
 * - Feed type selector
 * - Medical notes
 * - Real-time batch statistics
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
import { TargetWeightProgress } from '../components/target/target-weight-progress';
import { HealthFlagBadge } from '../components/health/health-flag-badge';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { Batch } from '@/domain/entities/batch';
import { CustomFieldList } from '@/domain/entities/custom-field-list';
import { HealthFlag } from '@/domain/services/health-detection.service';

export interface WeighingScreenProps {
  batchId: string;
  batch: Batch;
  cfl: CustomFieldList;
  onWeigh: (transaction: Omit<Transaction, 'tx_id' | 'created_at'>) => Promise<void>;
  onComplete: () => void;
  testID?: string;
}

export const WeighingScreen: React.FC<WeighingScreenProps> = ({
  batchId,
  batch,
  cfl,
  onWeigh,
  onComplete,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [weighing, setWeighing] = useState(false);

  // Current weighing state
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [weight, setWeight] = useState('');
  const [healthFlags, setHealthFlags] = useState<HealthFlag[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState('');

  // Batch statistics
  const [batchStats, setBatchStats] = useState({
    totalWeighed: 0,
    averageWeight: 0,
    healthFlagsCount: 0,
  });

  useEffect(() => {
    loadBatchStats();
  }, [batchId]);

  const loadBatchStats = async () => {
    // TODO: Load batch statistics from repository
    setBatchStats({
      totalWeighed: 0,
      averageWeight: 0,
      healthFlagsCount: 0,
    });
  };

  const handleEntitySelect = async (entity: Entity) => {
    setSelectedEntity(entity);
    setWeight('');
    setHealthFlags([]);
    setCustomFieldValues({});
    setNotes('');

    // TODO: Load last weight and detect health issues
    // const lastWeight = await getLastWeight(entity.entity_id);
    // if (lastWeight) {
    //   const flags = await detectHealthIssues(entity.entity_id, lastWeight);
    //   setHealthFlags(flags);
    // }
  };

  const handleWeigh = async () => {
    if (!selectedEntity) {
      Alert.alert('Error', 'Please select an animal first');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid weight');
      return;
    }

    // Validate required custom fields
    for (const field of cfl.fields) {
      if (field.is_required && !customFieldValues[field.field_id]) {
        Alert.alert('Validation Error', `${field.label} is required`);
        return;
      }
    }

    setWeighing(true);
    try {
      await onWeigh({
        tenant_id: batch.tenant_id,
        entity_id: selectedEntity.entity_id,
        batch_id: batchId,
        weight_kg: weightValue,
        timestamp: new Date(),
        operator_id: 'current-user-id', // TODO: Get from auth context
        reason: batch.type === 'Arrival' ? 'Arrival' : batch.type === 'Shipment' ? 'Shipment' : 'Monthly',
        is_estimated_weight: false,
        custom_fields_definition_snapshot: cfl.fields,
        custom_field_values: customFieldValues,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setSelectedEntity(null);
      setWeight('');
      setHealthFlags([]);
      setCustomFieldValues({});
      setNotes('');

      // Reload stats
      await loadBatchStats();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to record weight');
    } finally {
      setWeighing(false);
    }
  };

  const updateCustomField = (fieldId: string, value: any) => {
    setCustomFieldValues({ ...customFieldValues, [fieldId]: value });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      {/* Batch Header */}
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>{batch.name}</Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
          {batch.type} • {batchStats.totalWeighed} weighed
        </Text>
      </View>

      {/* Batch Statistics */}
      <View style={[styles.statsCard, { backgroundColor: theme.background.secondary }]}>
        <View style={styles.statItem}>
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Total Weighed</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>{batchStats.totalWeighed}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>Avg Weight</Text>
          <Text style={[TEXT_STYLES.h3, { color: theme.text.primary }]}>
            {batchStats.averageWeight.toFixed(1)}kg
          </Text>
        </View>
        {batchStats.healthFlagsCount > 0 && (
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: theme.status.error }]}>Health Alerts</Text>
            <Text style={[TEXT_STYLES.h3, { color: theme.status.error }]}>
              {batchStats.healthFlagsCount}
            </Text>
          </View>
        )}
      </View>

      {/* Animal Selection */}
      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
          Select Animal
        </Text>
        {selectedEntity ? (
          <View style={[styles.entityCard, { backgroundColor: theme.background.secondary }]}>
            <View style={styles.entityHeader}>
              <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>
                {selectedEntity.primary_tag}
              </Text>
              <TouchableOpacity onPress={() => setSelectedEntity(null)} testID="clear-entity-button">
                <Text style={[TEXT_STYLES.caption, { color: theme.status.error }]}>Change</Text>
              </TouchableOpacity>
            </View>
            <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
              {selectedEntity.species} • {selectedEntity.breed || 'Unknown breed'}
            </Text>

            {/* Target Weight Progress */}
            {selectedEntity.target_weight_kg && (
              <View style={styles.targetWeightSection}>
                <TargetWeightProgress
                  currentWeight={parseFloat(weight) || 0}
                  targetWeight={selectedEntity.target_weight_kg}
                  progressPercent={
                    parseFloat(weight)
                      ? (parseFloat(weight) / selectedEntity.target_weight_kg) * 100
                      : 0
                  }
                  isReady={parseFloat(weight) >= selectedEntity.target_weight_kg}
                />
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.selectButton, { backgroundColor: theme.interactive.secondary }]}
            onPress={() => {
              // TODO: Open entity selection modal/search
              Alert.alert('Info', 'Entity selection will open here');
            }}
            testID="select-entity-button"
          >
            <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>
              Scan RFID or Search Animal
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Weight Input */}
      {selectedEntity && (
        <>
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
              Weight (kg) *
            </Text>
            <TextInput
              style={[
                styles.weightInput,
                {
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.default,
                  color: theme.text.primary,
                },
              ]}
              value={weight}
              onChangeText={(text) => {
                setWeight(text);
                // TODO: Detect health issues on weight change
              }}
              placeholder="Enter weight"
              placeholderTextColor={theme.text.tertiary}
              keyboardType="numeric"
              testID="weight-input"
            />
          </View>

          {/* Health Flags */}
          {healthFlags.length > 0 && (
            <View style={styles.section}>
              <Text style={[TEXT_STYLES.h4, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
                Health Alerts
              </Text>
              {healthFlags.map((flag, index) => (
                <HealthFlagBadge
                  key={index}
                  severity={flag.severity}
                  message={flag.message}
                  weightChange={flag.weight_change}
                />
              ))}
            </View>
          )}

          {/* Custom Fields */}
          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h4, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
              Additional Information
            </Text>
            {cfl.fields.map((field) => (
              <View key={field.field_id} style={styles.customField}>
                <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[1] }]}>
                  {field.label} {field.is_required && '*'}
                </Text>
                {field.data_type === 'text' && (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.background.secondary,
                        borderColor: theme.border.default,
                        color: theme.text.primary,
                      },
                    ]}
                    value={customFieldValues[field.field_id] || ''}
                    onChangeText={(text) => updateCustomField(field.field_id, text)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    placeholderTextColor={theme.text.tertiary}
                    testID={`custom-field-${field.field_id}`}
                  />
                )}
                {field.data_type === 'number' && (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.background.secondary,
                        borderColor: theme.border.default,
                        color: theme.text.primary,
                      },
                    ]}
                    value={customFieldValues[field.field_id]?.toString() || ''}
                    onChangeText={(text) => updateCustomField(field.field_id, parseFloat(text) || 0)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    placeholderTextColor={theme.text.tertiary}
                    keyboardType="numeric"
                    testID={`custom-field-${field.field_id}`}
                  />
                )}
                {field.data_type === 'select' && field.options && (
                  <View style={styles.selectOptions}>
                    {field.options.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.selectOption,
                          {
                            backgroundColor:
                              customFieldValues[field.field_id] === option.value
                                ? theme.interactive.primary
                                : theme.background.secondary,
                            borderColor: theme.border.default,
                          },
                        ]}
                        onPress={() => updateCustomField(field.field_id, option.value)}
                        testID={`custom-field-${field.field_id}-${option.value}`}
                      >
                        <Text
                          style={[
                            TEXT_STYLES.button,
                            {
                              color:
                                customFieldValues[field.field_id] === option.value
                                  ? theme.text.inverse
                                  : theme.text.primary,
                            },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {field.data_type === 'boolean' && (
                  <View style={styles.switchRow}>
                    <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>No / Yes</Text>
                    <TouchableOpacity
                      style={[
                        styles.booleanButton,
                        {
                          backgroundColor: customFieldValues[field.field_id]
                            ? theme.interactive.primary
                            : theme.background.secondary,
                          borderColor: theme.border.default,
                        },
                      ]}
                      onPress={() => updateCustomField(field.field_id, !customFieldValues[field.field_id])}
                      testID={`custom-field-${field.field_id}`}
                    >
                      <Text
                        style={[
                          TEXT_STYLES.button,
                          {
                            color: customFieldValues[field.field_id] ? theme.text.inverse : theme.text.primary,
                          },
                        ]}
                      >
                        {customFieldValues[field.field_id] ? 'Yes' : 'No'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Notes */}
          <View style={styles.section}>
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
              placeholder="Add notes or medical records..."
              placeholderTextColor={theme.text.tertiary}
              multiline
              numberOfLines={3}
              testID="weighing-notes-input"
            />
          </View>

          {/* Weigh Button */}
          <TouchableOpacity
            style={[styles.weighButton, { backgroundColor: theme.interactive.primary }]}
            onPress={handleWeigh}
            disabled={weighing}
            testID="weigh-button"
          >
            {weighing ? (
              <ActivityIndicator color={theme.text.inverse} />
            ) : (
              <Text style={[TEXT_STYLES.button, { color: theme.text.inverse, fontSize: 18 }]}>
                Record Weight
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Complete Batch Button */}
      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: theme.background.secondary }]}
        onPress={onComplete}
        testID="complete-batch-button"
      >
        <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>Complete Batch</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING[4],
  },
  header: {
    marginBottom: SPACING[4],
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[4],
  },
  statItem: {
    alignItems: 'center',
  },
  section: {
    marginBottom: SPACING[4],
  },
  entityCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
  },
  entityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[1],
  },
  targetWeightSection: {
    marginTop: SPACING[3],
  },
  selectButton: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  weightInput: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[4],
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  customField: {
    marginBottom: SPACING[3],
  },
  selectOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  selectOption: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  booleanButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  weighButton: {
    paddingVertical: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING[4],
    marginBottom: SPACING[3],
  },
  completeButton: {
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
});

