/**
 * Weighing Tab - Weigh Animals
 * 
 * Select a session, then weigh animals from that session.
 */

import { Batch } from '@/domain/entities/batch';
import { CustomFieldList } from '@/domain/entities/custom-field-list';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { generateUUID } from '@/shared/utils/uuid';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function WeighingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ batchId?: string }>();
  const { theme } = useTheme();
  const [step, setStep] = useState<'select-batch' | 'select-cfl' | 'select-animal' | 'weigh'>('select-batch');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Batch selection
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // CFL selection
  const [cfls, setCfls] = useState<CustomFieldList[]>([]);
  const [selectedCFL, setSelectedCFL] = useState<CustomFieldList | null>(null);

  // Animal selection
  const [batchAnimals, setBatchAnimals] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Weighing
  const [weight, setWeight] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [previousTransaction, setPreviousTransaction] = useState<Transaction | null>(null);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Initial load for web deep links; focus effect will keep it fresh
    loadBatches();
    if (params.batchId) {
      loadBatchById(params.batchId);
    }
  }, [params.batchId]);

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      const batchRepo = container.batchRepository;
      const allBatches = await batchRepo.findAll(DEFAULT_TENANT_ID);
      setBatches(allBatches);
    } catch (error) {
      console.error('Failed to load batches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh sessions whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadBatches();
    }, [loadBatches])
  );

  const loadBatchById = async (batchId: string) => {
    try {
      const batchRepo = container.batchRepository;
      const batch = await batchRepo.findById(batchId);
      if (batch) {
        await handleBatchSelect(batch);
      }
    } catch (error) {
      console.error('Failed to load batch:', error);
    }
  };

  const handleBatchSelect = async (batch: Batch) => {
    setSelectedBatch(batch);
    
    // Load CFLs
    try {
      const cflRepo = container.customFieldListRepository;
      const allCFLs = await cflRepo.findAll(DEFAULT_TENANT_ID);
      setCfls(allCFLs);
      
      // Auto-select CFL if batch has one
      if (batch.cfl_id) {
        const batchCFL = allCFLs.find((cfl) => cfl.cfl_id === batch.cfl_id);
        if (batchCFL) {
          setSelectedCFL(batchCFL);
          await loadBatchAnimals(batch.batch_id);
          setStep('select-animal');
          return;
        }
      }
      
      setStep('select-cfl');
    } catch (error) {
      console.error('Failed to load CFLs:', error);
      Alert.alert('Error', 'Failed to load custom field lists');
    }
  };

  const handleCFLSelect = async (cfl: CustomFieldList) => {
    setSelectedCFL(cfl);
    
    // Update batch with selected CFL if needed
    if (selectedBatch && selectedBatch.cfl_id !== cfl.cfl_id) {
      const batchRepo = container.batchRepository;
      const updatedBatch = { ...selectedBatch, cfl_id: cfl.cfl_id, cfl_version: cfl.version };
      await batchRepo.update(updatedBatch);
      setSelectedBatch(updatedBatch);
    }
    
    await loadBatchAnimals(selectedBatch!.batch_id);
    setStep('select-animal');
  };

  const loadBatchAnimals = async (batchId: string) => {
    try {
      const entityRepo = container.entityRepository;
      // Load animals that belong to this batch (via current_group)
      const animals = await entityRepo.findByGroup(DEFAULT_TENANT_ID, batchId);
      setBatchAnimals(animals);
      
      if (animals.length === 0) {
        Alert.alert(
          'No Animals',
          'This batch has no animals. Would you like to add some?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add Animals',
              onPress: () => router.push(`/add-batch-animals?batchId=${batchId}`),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to load batch animals:', error);
    }
  };

  const handleAnimalSelect = async (entity: Entity) => {
    setSelectedEntity(entity);
    setWeight('');
    setCustomFieldValues({});

    // Load latest previous weighing for this animal
    try {
      const transactionRepo = container.transactionRepository;
      const latest = await transactionRepo.findLatestByEntityId(entity.entity_id, 1);
      setPreviousTransaction(latest[0] ?? null);
    } catch (error) {
      console.error('Failed to load previous weighing:', error);
      setPreviousTransaction(null);
    }

    setStep('weigh');
  };

  const handleSaveWeight = async () => {
    if (!selectedEntity || !selectedBatch || !selectedCFL) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kilograms');
      return;
    }

    // Validate required custom fields
    for (const field of selectedCFL.fields) {
      if (field.is_required && !customFieldValues[field.field_id]) {
        Alert.alert('Validation Error', `${field.label} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const transactionRepo = container.transactionRepository;

      // Check for duplicate in batch
      const existingTransactions = await transactionRepo.findByBatchId(selectedBatch.batch_id);
      const duplicate = existingTransactions.find((t) => t.entity_id === selectedEntity.entity_id);

      if (duplicate) {
        Alert.alert(
          'Already Weighed',
          `This animal was already weighed in this session: ${duplicate.weight_kg}kg`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue Anyway',
              onPress: async () => {
                await createTransaction(weightValue);
              },
            },
          ]
        );
        setSaving(false);
        return;
      }

      await createTransaction(weightValue);
    } catch (error) {
      console.error('Failed to save weight:', error);
      Alert.alert('Error', 'Failed to save weight. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const createTransaction = async (weightValue: number) => {
    if (!selectedEntity || !selectedBatch || !selectedCFL) return;

    const transactionRepo = container.transactionRepository;
    const txId = generateUUID();
    const now = new Date();

    const transaction: Transaction = {
      tx_id: txId,
      tenant_id: DEFAULT_TENANT_ID,
      entity_id: selectedEntity.entity_id,
      batch_id: selectedBatch.batch_id,
      weight_kg: weightValue,
      timestamp: now,
      operator_id: DEFAULT_USER_ID,
      reason: selectedBatch.type === 'Arrival' ? 'Arrival' : selectedBatch.type === 'Shipment' ? 'Shipment' : 'Monthly',
      is_estimated_weight: false,
      custom_fields_definition_snapshot: selectedCFL.fields,
      custom_field_values: customFieldValues,
      created_at: now,
    };

    await transactionRepo.create(transaction);

    Alert.alert('Saved!', `Weight of ${weightValue}kg recorded for ${selectedEntity.primary_tag}`, [
      {
        text: 'Weigh Another',
        onPress: () => {
          setSelectedEntity(null);
          setWeight('');
          setCustomFieldValues({});
          setStep('select-animal');
        },
      },
      {
        text: 'Done',
        onPress: () => {
          setStep('select-batch');
          setSelectedBatch(null);
          setSelectedCFL(null);
          setSelectedEntity(null);
        },
      },
    ]);
  };

  const updateCustomField = (fieldId: string, value: any) => {
    setCustomFieldValues({ ...customFieldValues, [fieldId]: value });
  };

  const handleDateChange = (fieldId: string, event: any, date?: Date) => {
    setShowDatePicker(false);
    setActiveDateField(null);
    if (event?.type === 'dismissed') {
      return;
    }
    if (date) {
      updateCustomField(fieldId, date.toISOString());
    }
  };

  if (loading && step === 'select-batch') {
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
        <Text style={[styles.title, { color: theme.text.primary }]}>Weigh Animals</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {step === 'select-batch' && 'Step 1: Select a session'}
          {step === 'select-cfl' && 'Step 2: Select custom fields'}
          {step === 'select-animal' && 'Step 3: Select an animal'}
          {step === 'weigh' && 'Step 4: Enter weight'}
        </Text>
      </View>

      {/* Step 1: Select Batch */}
      {step === 'select-batch' && (
        <View style={styles.stepContainer}>
          {batches.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
                No sessions yet. Create a session in the Sessions tab first.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.instruction, { color: theme.text.primary }]}>
                Select a session to weigh animals from
              </Text>
              <FlatList
                data={batches}
                keyExtractor={(item) => item.batch_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.batchCard,
                      {
                        backgroundColor:
                          selectedBatch?.batch_id === item.batch_id
                            ? theme.interactive.primary
                            : theme.background.secondary,
                      },
                    ]}
                    onPress={() => handleBatchSelect(item)}
                  >
                    <Text
                      style={[
                        styles.batchName,
                        {
                          color:
                            selectedBatch?.batch_id === item.batch_id
                              ? theme.text.inverse
                              : theme.text.primary,
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.batchInfo,
                        {
                          color:
                            selectedBatch?.batch_id === item.batch_id
                              ? theme.text.inverse
                              : theme.text.secondary,
                        },
                      ]}
                    >
                      {item.type} • {item.status}
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      )}

      {/* Step 2: Select CFL */}
      {step === 'select-cfl' && (
        <View style={styles.stepContainer}>
          <Text style={[styles.instruction, { color: theme.text.primary }]}>
            Select custom fields for this weighing session
          </Text>
          {cfls.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
                No custom field lists. Create one in the Custom Fields tab first.
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cfls}
                keyExtractor={(item) => item.cfl_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.cflCard,
                      {
                        backgroundColor:
                          selectedCFL?.cfl_id === item.cfl_id
                            ? theme.interactive.primary
                            : theme.background.secondary,
                      },
                    ]}
                    onPress={() => handleCFLSelect(item)}
                  >
                    <Text
                      style={[
                        styles.cflName,
                        {
                          color:
                            selectedCFL?.cfl_id === item.cfl_id ? theme.text.inverse : theme.text.primary,
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.cflInfo,
                        {
                          color:
                            selectedCFL?.cfl_id === item.cfl_id ? theme.text.inverse : theme.text.secondary,
                        },
                      ]}
                    >
                      {item.fields.length} fields
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: theme.background.secondary }]}
                onPress={() => {
                  setStep('select-batch');
                  setSelectedBatch(null);
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Step 3: Select Animal */}
      {step === 'select-animal' && (
        <View style={styles.stepContainer}>
          <Text style={[styles.instruction, { color: theme.text.primary }]}>
            Select an animal to weigh
          </Text>
          {batchAnimals.length === 0 ? (
            <>
              <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
                No animals in this session. Add animals first.
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.interactive.primary }]}
                onPress={() => router.push(`/add-batch-animals?batchId=${selectedBatch?.batch_id}`)}
              >
                <Text style={[styles.primaryButtonText, { color: theme.text.inverse }]}>
                  Add Animals to Session
                </Text>
              </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: theme.background.secondary }]}
                onPress={() => {
                  setStep('select-cfl');
                  setSelectedEntity(null);
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <FlatList
                data={batchAnimals}
                keyExtractor={(item) => item.entity_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.animalCard, { backgroundColor: theme.background.secondary }]}
                    onPress={() => handleAnimalSelect(item)}
                  >
                    <Text style={[styles.animalTag, { color: theme.text.primary }]}>
                      {item.primary_tag}
                    </Text>
                    <Text style={[styles.animalName, { color: theme.text.secondary }]}>
                      {item.name || item.breed || 'No name'}
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: theme.background.secondary }]}
                onPress={() => {
                  setStep('select-cfl');
                  setSelectedEntity(null);
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Step 4: Weigh */}
      {step === 'weigh' && selectedEntity && selectedCFL && (
        <View style={styles.stepContainer}>
          <View style={[styles.animalCard, { backgroundColor: theme.background.secondary }]}>
            <Text style={[styles.animalTag, { color: theme.text.primary }]}>
              {selectedEntity.primary_tag}
            </Text>
            <Text style={[styles.animalName, { color: theme.text.secondary }]}>
              {selectedEntity.name || selectedEntity.breed || 'No name'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setStep('select-animal');
                setWeight('');
                setSelectedEntity(null);
              }}
              style={styles.changeButton}
            >
              <Text style={[styles.changeButtonText, { color: theme.interactive.primary }]}>
                Change
              </Text>
            </TouchableOpacity>
          </View>

          {previousTransaction && (
            <View style={[styles.previousWeighCard, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.previousWeighTitle, { color: theme.text.primary }]}>
                Previous weighing
              </Text>
              <Text style={[styles.previousWeighValue, { color: theme.interactive.primary }]}>
                {previousTransaction.weight_kg.toFixed(1)} kg
              </Text>
              <Text style={[styles.previousWeighMeta, { color: theme.text.tertiary }]}>
                {new Date(previousTransaction.timestamp).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text.primary }]}>Weight (kg) *</Text>
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
              onChangeText={setWeight}
              placeholder="0.0"
              placeholderTextColor={theme.text.tertiary}
              keyboardType="decimal-pad"
              autoFocus
              testID="weight-input"
            />
          </View>

          {/* Custom Fields */}
          {selectedCFL.fields.length > 0 && (
            <View style={styles.customFieldsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Additional Information
              </Text>
              {selectedCFL.fields.map((field) => (
                <View key={field.field_id} style={styles.customField}>
                  <Text style={[styles.label, { color: theme.text.primary }]}>
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
                        >
                          <Text
                            style={[
                              styles.selectOptionText,
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
                  {field.data_type === 'multi-select' && field.options && (
                    <View style={styles.selectOptions}>
                      {field.options.map((option) => {
                        const current = customFieldValues[field.field_id];
                        const selectedArray: string[] = Array.isArray(current) ? current : [];
                        const isSelected = selectedArray.includes(option.value);
                        const next = isSelected
                          ? selectedArray.filter((v) => v !== option.value)
                          : [...selectedArray, option.value];

                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.selectOption,
                              {
                                backgroundColor: isSelected
                                  ? theme.interactive.primary
                                  : theme.background.secondary,
                                borderColor: theme.border.default,
                              },
                            ]}
                            onPress={() => updateCustomField(field.field_id, next)}
                          >
                            <Text
                              style={[
                                styles.selectOptionText,
                                {
                                  color: isSelected ? theme.text.inverse : theme.text.primary,
                                },
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                  {field.data_type === 'date' && (
                    <View>
                      <TouchableOpacity
                        style={[styles.dateButton, { backgroundColor: theme.background.secondary, borderColor: theme.border.default }]}
                        onPress={() => {
                          setActiveDateField(field.field_id);
                          setShowDatePicker(true);
                        }}
                      >
                        <Text style={{ color: theme.text.primary }}>
                          {customFieldValues[field.field_id]
                            ? new Date(customFieldValues[field.field_id]).toLocaleDateString()
                            : 'Select date'}
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && activeDateField === field.field_id && (
                        <DateTimePicker
                          value={customFieldValues[field.field_id]
                            ? new Date(customFieldValues[field.field_id])
                            : new Date()}
                          mode="date"
                          display="default"
                          onChange={(event, date) => handleDateChange(field.field_id, event, date || undefined)}
                        />
                      )}
                    </View>
                  )}
                  {field.data_type === 'boolean' && (
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
                    >
                      <Text
                        style={[
                          styles.booleanButtonText,
                          {
                            color: customFieldValues[field.field_id]
                              ? theme.text.inverse
                              : theme.text.primary,
                          },
                        ]}
                      >
                        {customFieldValues[field.field_id] ? 'Yes' : 'No'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: theme.background.secondary }]}
              onPress={() => {
                setStep('select-animal');
                setWeight('');
                setSelectedEntity(null);
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: weight.trim() ? theme.interactive.primary : theme.interactive.primaryDisabled,
                  flex: 2,
                },
              ]}
              onPress={handleSaveWeight}
              disabled={!weight.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.text.inverse} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.text.inverse }]}>
                  Save Weight
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: 16,
  },
  stepContainer: {
    gap: SPACING[4],
  },
  instruction: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: SPACING[4],
  },
  emptyState: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    gap: SPACING[4],
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  batchCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  batchName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  batchInfo: {
    fontSize: 14,
  },
  cflCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cflName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  cflInfo: {
    fontSize: 14,
  },
  animalCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  animalTag: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING[1],
  },
  animalName: {
    fontSize: 16,
  },
  changeButton: {
    alignSelf: 'flex-end',
    padding: SPACING[2],
    marginTop: SPACING[2],
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: SPACING[4],
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[2],
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    fontSize: 16,
    minHeight: 48,
  },
  weightInput: {
    borderWidth: 3,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[6],
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    minHeight: 100,
  },
  customFieldsSection: {
    marginTop: SPACING[4],
    marginBottom: SPACING[4],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[3],
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
  selectOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  booleanButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  booleanButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: SPACING[5],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  previousWeighCard: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[3],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  previousWeighTitle: {
    fontSize: 14,
    marginBottom: SPACING[1],
  },
  previousWeighValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING[1],
  },
  previousWeighMeta: {
    fontSize: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    justifyContent: 'center',
    minHeight: 48,
  },
});
