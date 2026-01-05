/**
 * Weigh Tab - Weigh Animals
 *
 * Simplified workflow: Select session → Select animal → Weigh
 * CFL is automatically used from the session.
 * Redesigned with new component library for better UX.
 */

import { Batch } from '@/domain/entities/batch';
import { CustomFieldList } from '@/domain/entities/custom-field-list';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { generateUUID } from '@/shared/utils/uuid';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { PreviousWeightCard, SessionPicker } from '@/presentation/components';
import {
  Card,
  EmptyState,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
  SuccessToast,
  TextInput,
} from '@/presentation/components/ui';
import { SearchInput } from '@/presentation/components/ui/input';
import { hapticSuccess } from '@/shared/utils/haptics';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function WeighScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ batchId?: string }>();
  const { theme } = useTheme();
  const [step, setStep] = useState<'select-session' | 'select-animal' | 'weigh'>('select-session');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Session selection
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [openBatches, setOpenBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // CFL (automatically loaded from batch)
  const [selectedCFL, setSelectedCFL] = useState<CustomFieldList | null>(null);

  // Animal selection
  const [allAnimals, setAllAnimals] = useState<Entity[]>([]);
  const [batchAnimals, setBatchAnimals] = useState<Entity[]>([]);
  const [recentAnimals, setRecentAnimals] = useState<Entity[]>([]);
  const [animalSearchQuery, setAnimalSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Weighing
  const [weight, setWeight] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [previousTransaction, setPreviousTransaction] = useState<Transaction | null>(null);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Session transaction counts
  const [sessionTransactionCounts, setSessionTransactionCounts] = useState<Map<string, number>>(
    new Map()
  );

  useEffect(() => {
    loadBatches();
    if (params.batchId) {
      loadBatchById(params.batchId);
    }
  }, [params.batchId]);

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      const batchRepo = container.batchRepository;
      const transactionRepo = container.transactionRepository;

      const all = await batchRepo.findAll(DEFAULT_TENANT_ID);
      setAllBatches(all);

      // Filter open sessions (Open or Draft status)
      const open = all.filter((b) => b.status === 'Open' || b.status === 'Draft');
      setOpenBatches(open);

      // Count transactions per session
      const counts = new Map<string, number>();
      for (const session of open) {
        const transactions = await transactionRepo.findByBatchId(session.batch_id);
        counts.set(session.batch_id, transactions.length);
      }
      setSessionTransactionCounts(counts);

      // Default to most recent open session
      if (open.length > 0 && !selectedBatch && !params.batchId) {
        const mostRecent = open.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        await handleBatchSelect(mostRecent);
      }
    } catch (error) {
      console.error('Failed to load batches:', error);
    } finally {
      setLoading(false);
    }
  }, [params.batchId, selectedBatch]);

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
    setAnimalSearchQuery('');
    setSelectedEntity(null);
    setWeight('');
    setCustomFieldValues({});

    // Automatically load CFL from batch
    try {
      const cflRepo = container.customFieldListRepository;
      if (batch.cfl_id) {
        const allCFLs = await cflRepo.findAll(DEFAULT_TENANT_ID);
        const batchCFL = allCFLs.find((cfl) => cfl.cfl_id === batch.cfl_id);
        if (batchCFL) {
          setSelectedCFL(batchCFL);
        } else {
          Alert.alert('Error', 'Custom field list not found for this session');
          return;
        }
      } else {
        Alert.alert('Error', 'Session does not have a custom field list assigned');
        return;
      }

      // Load animals
      await loadBatchAnimals(batch.batch_id);
      await loadRecentAnimals(batch.batch_id);
      setStep('select-animal');
    } catch (error) {
      console.error('Failed to load session data:', error);
      Alert.alert('Error', 'Failed to load session data');
    }
  };

  const loadBatchAnimals = async (batchId: string) => {
    try {
      const entityRepo = container.entityRepository;
      // Load animals that belong to this batch (via current_group)
      const animals = await entityRepo.findByGroup(DEFAULT_TENANT_ID, batchId);
      setBatchAnimals(animals);

      // Also load all active animals for search
      const allActive = await entityRepo.findByStatus(DEFAULT_TENANT_ID, 'Active');
      setAllAnimals(allActive);
    } catch (error) {
      console.error('Failed to load batch animals:', error);
    }
  };

  const loadRecentAnimals = async (batchId: string) => {
    try {
      const transactionRepo = container.transactionRepository;
      const transactions = await transactionRepo.findByBatchId(batchId);

      // Get unique entity IDs from transactions (most recent first)
      const entityIds = [
        ...new Set(
          transactions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((t) => t.entity_id)
        ),
      ].slice(0, 5); // Last 5 animals weighed in this session

      // Load entities
      const entityRepo = container.entityRepository;
      const recent = await Promise.all(entityIds.map((id) => entityRepo.findById(id)));
      setRecentAnimals(recent.filter((e): e is Entity => e !== null));
    } catch (error) {
      console.error('Failed to load recent animals:', error);
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
      reason:
        selectedBatch.type === 'Arrival'
          ? 'Arrival'
          : selectedBatch.type === 'Shipment'
            ? 'Shipment'
            : 'Monthly',
      is_estimated_weight: false,
      custom_fields_definition_snapshot: selectedCFL.fields,
      custom_field_values: customFieldValues,
      created_at: now,
    };

    await transactionRepo.create(transaction);

    // Reload recent animals and transaction counts
    await loadRecentAnimals(selectedBatch.batch_id);
    const transactions = await transactionRepo.findByBatchId(selectedBatch.batch_id);
    setSessionTransactionCounts((prev) => {
      const next = new Map(prev);
      next.set(selectedBatch.batch_id, transactions.length);
      return next;
    });

    // Show success feedback
    hapticSuccess();
    setSuccessMessage(`${weightValue}kg recorded for ${selectedEntity.primary_tag}`);
    setShowSuccessToast(true);

    // Improved "Weigh Next Animal" flow
    Alert.alert('Saved!', `Weight of ${weightValue}kg recorded for ${selectedEntity.primary_tag}`, [
      {
        text: 'Weigh Next Animal',
        onPress: () => {
          // Keep session and CFL, clear animal and weight
          setSelectedEntity(null);
          setWeight('');
          setCustomFieldValues({});
          setPreviousTransaction(null);
          setStep('select-animal');
        },
      },
      {
        text: 'Done',
        onPress: () => {
          setStep('select-session');
          setSelectedBatch(null);
          setSelectedCFL(null);
          setSelectedEntity(null);
          setWeight('');
          setCustomFieldValues({});
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

  // Filter animals based on search
  const filteredAnimals = React.useMemo(() => {
    if (!animalSearchQuery.trim()) {
      return batchAnimals;
    }
    const query = animalSearchQuery.toLowerCase();
    return allAnimals.filter(
      (animal) =>
        animal.primary_tag.toLowerCase().includes(query) ||
        animal.name?.toLowerCase().includes(query) ||
        animal.breed?.toLowerCase().includes(query) ||
        animal.rfid_tag?.toLowerCase().includes(query)
    );
  }, [animalSearchQuery, batchAnimals, allAnimals]);

  if (loading && step === 'select-session') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="weigh-screen">
        <LoadingState message="Loading sessions..." testID="loading-sessions" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="weigh-screen">
      <SuccessToast
        message={successMessage}
        visible={showSuccessToast}
        onAnimationComplete={() => setShowSuccessToast(false)}
        testID="success-toast"
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]}>Weigh Animals</Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
          {step === 'select-session' && 'Select a session to start weighing'}
          {step === 'select-animal' && 'Select an animal to weigh'}
          {step === 'weigh' && 'Enter weight and details'}
        </Text>
      </View>

      {/* Session Picker - Always shown when sessions are available */}
      {openBatches.length > 0 && (
        <SessionPicker
          sessions={openBatches}
          selectedSessionId={selectedBatch?.batch_id}
          onSelect={handleBatchSelect}
          onCreateNew={step === 'select-session' ? () => router.push('/batch-setup' as any) : undefined}
          transactionCounts={sessionTransactionCounts}
          testID="session-picker"
        />
      )}

      {/* Step 1: Select Session */}
      {step === 'select-session' && (
        <View style={styles.stepContainer}>
          {openBatches.length === 0 ? (
            <EmptyState
              icon="folder-open-outline"
              message="No open sessions"
              description="Create a session to start weighing animals. Sessions help you organize weighings by date, type, or purpose, making it easier to track and manage your weighing records."
              action={{
                label: 'Create Your First Session',
                onPress: () => router.push('/batch-setup' as any),
                testID: 'create-session-button',
              }}
              testID="no-sessions-empty-state"
            />
          ) : (
            <>
              <Text style={[TEXT_STYLES.body, { color: theme.text.primary, marginBottom: SPACING[4] }]}>
                Select a session to weigh animals from
              </Text>
              <FlatList
                data={openBatches}
                keyExtractor={(item) => item.batch_id}
                renderItem={({ item }) => {
                  const txCount = sessionTransactionCounts.get(item.batch_id) || 0;
                  return (
                    <Card
                      variant="outlined"
                      onPress={() => handleBatchSelect(item)}
                      style={styles.sessionCard}
                      testID={`session-${item.batch_id}`}
                    >
                      <View style={styles.sessionCardContent}>
                        <View style={styles.sessionInfo}>
                          <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>{item.name}</Text>
                          <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
                            {item.type} • {item.status} • {txCount} animals weighed
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                      </View>
                    </Card>
                  );
                }}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      )}

      {/* Step 2: Select Animal */}
      {step === 'select-animal' && selectedBatch && (
        <View style={styles.stepContainer}>
          <View style={styles.searchContainer}>
            <SearchInput
              value={animalSearchQuery}
              onChangeText={setAnimalSearchQuery}
              placeholder="Search by tag, name, breed, or RFID..."
              testID="animal-search-input"
              containerStyle={styles.searchInputWrapper}
            />
            <SecondaryButton
              title="Quick Create"
              icon="add"
              onPress={() => router.push('/entity-setup' as any)}
              testID="quick-create-animal-button"
              style={styles.quickCreateButton}
            />
          </View>

          {/* Recent Animals in Session */}
          {recentAnimals.length > 0 && !animalSearchQuery && (
            <View style={styles.recentSection}>
              <Text style={[TEXT_STYLES.label, { color: theme.text.secondary, marginBottom: SPACING[2] }]}>
                Recent in this session
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentAnimals}>
                {recentAnimals.map((animal) => (
                  <Card
                    key={animal.entity_id}
                    variant="outlined"
                    onPress={() => handleAnimalSelect(animal)}
                    style={styles.recentAnimalCard}
                    testID={`recent-animal-${animal.entity_id}`}
                  >
                    <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>
                      {animal.primary_tag}
                    </Text>
                    {animal.name && (
                      <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>
                        {animal.name}
                      </Text>
                    )}
                  </Card>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Animal List */}
          {filteredAnimals.length === 0 ? (
            <EmptyState
              icon={animalSearchQuery ? 'search-outline' : 'paw-outline'}
              message={
                animalSearchQuery
                  ? 'No animals found matching your search'
                  : 'No animals in this session'
              }
              description={
                animalSearchQuery
                  ? 'Try a different search term, or add a new animal to your herd.'
                  : 'Add animals to this session to start weighing. You can add existing animals or create new ones on the fly.'
              }
              action={
                !animalSearchQuery
                  ? {
                      label: 'Add Animals to Session',
                      onPress: () => router.push(`/add-batch-animals?batchId=${selectedBatch.batch_id}`),
                      testID: 'add-animals-button',
                    }
                  : undefined
              }
              testID="no-animals-empty-state"
            />
          ) : (
            <View style={styles.animalsList}>
              <Text style={[TEXT_STYLES.label, { color: theme.text.secondary, marginBottom: SPACING[2] }]}>
                {animalSearchQuery ? 'Search Results' : 'Animals in Session'}
              </Text>
              <FlatList
                data={filteredAnimals}
                keyExtractor={(item) => item.entity_id}
                renderItem={({ item }) => (
                  <Card
                    variant="outlined"
                    onPress={() => handleAnimalSelect(item)}
                    style={styles.animalCard}
                    testID={`animal-${item.entity_id}`}
                  >
                    <View style={styles.animalCardContent}>
                      <View style={styles.animalInfo}>
                        <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>
                          {item.primary_tag}
                        </Text>
                        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
                          {item.name || item.breed || 'No name'}
                          {item.rfid_tag && ` • RFID: ${item.rfid_tag}`}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </View>
                  </Card>
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      )}

      {/* Step 3: Weigh */}
      {step === 'weigh' && selectedEntity && selectedCFL && selectedBatch && (
        <View style={styles.stepContainer}>
          {/* Selected Animal Card */}
          <Card variant="outlined" style={styles.animalCard}>
            <View style={styles.animalCardContent}>
              <View style={styles.animalInfo}>
                <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>
                  {selectedEntity.primary_tag}
                </Text>
                <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary }]}>
                  {selectedEntity.name || selectedEntity.breed || 'No name'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setStep('select-animal');
                  setWeight('');
                  setSelectedEntity(null);
                  setPreviousTransaction(null);
                }}
                style={styles.changeButton}
                testID="change-animal-button"
              >
                <Text style={[TEXT_STYLES.caption, { color: theme.interactive.primary }]}>Change</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Previous Weight Card */}
          {previousTransaction && (
            <PreviousWeightCard
              transaction={previousTransaction}
              currentWeight={weight ? parseFloat(weight) : undefined}
              testID="previous-weight-card"
            />
          )}

          {/* Weight Input - Enhanced with larger size */}
          <View style={styles.weightInputContainer}>
            <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
              Weight (kg) *
            </Text>
            <RNTextInput
              style={[
                styles.weightInput,
                {
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.focus,
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
              <Text style={[TEXT_STYLES.h4, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
                Additional Information
              </Text>
              {selectedCFL.fields.map((field) => (
                <View key={field.field_id} style={styles.customField}>
                  {field.data_type === 'text' && (
                    <TextInput
                      label={field.label}
                      value={customFieldValues[field.field_id] || ''}
                      onChangeText={(text) => updateCustomField(field.field_id, text)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      required={field.is_required}
                      testID={`custom-field-${field.field_id}`}
                    />
                  )}
                  {field.data_type === 'number' && (
                    <TextInput
                      label={field.label}
                      value={customFieldValues[field.field_id]?.toString() || ''}
                      onChangeText={(text) => updateCustomField(field.field_id, parseFloat(text) || 0)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      keyboardType="numeric"
                      required={field.is_required}
                      testID={`custom-field-${field.field_id}`}
                    />
                  )}
                  {field.data_type === 'select' && field.options && (
                    <View>
                      <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
                        {field.label} {field.is_required && '*'}
                      </Text>
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
                            testID={`select-option-${option.value}`}
                          >
                            <Text
                              style={[
                                TEXT_STYLES.bodySmall,
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
                    </View>
                  )}
                  {field.data_type === 'multi-select' && field.options && (
                    <View>
                      <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
                        {field.label} {field.is_required && '*'}
                      </Text>
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
                              testID={`multi-select-option-${option.value}`}
                            >
                              <Text
                                style={[
                                  TEXT_STYLES.bodySmall,
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
                    </View>
                  )}
                  {field.data_type === 'date' && (
                    <View>
                      <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
                        {field.label} {field.is_required && '*'}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.dateButton,
                          {
                            backgroundColor: theme.background.secondary,
                            borderColor: theme.border.default,
                          },
                        ]}
                        onPress={() => {
                          setActiveDateField(field.field_id);
                          setShowDatePicker(true);
                        }}
                        testID={`date-field-${field.field_id}`}
                      >
                        <Text style={[TEXT_STYLES.body, { color: theme.text.primary }]}>
                          {customFieldValues[field.field_id]
                            ? new Date(customFieldValues[field.field_id]).toLocaleDateString()
                            : 'Select date'}
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && activeDateField === field.field_id && (
                        <DateTimePicker
                          value={
                            customFieldValues[field.field_id]
                              ? new Date(customFieldValues[field.field_id])
                              : new Date()
                          }
                          mode="date"
                          display="default"
                          onChange={(event, date) => handleDateChange(field.field_id, event, date || undefined)}
                        />
                      )}
                    </View>
                  )}
                  {field.data_type === 'boolean' && (
                    <View>
                      <Text style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}>
                        {field.label} {field.is_required && '*'}
                      </Text>
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
                        testID={`boolean-field-${field.field_id}`}
                      >
                        <Text
                          style={[
                            TEXT_STYLES.body,
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
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <SecondaryButton
              title="Back"
              onPress={() => {
                setStep('select-animal');
                setWeight('');
                setSelectedEntity(null);
                setPreviousTransaction(null);
              }}
              testID="back-to-animals-button"
              style={styles.backButton}
            />

            <PrimaryButton
              title="Save Weight"
              onPress={handleSaveWeight}
              disabled={!weight.trim() || saving}
              loading={saving}
              testID="save-weight-button"
              style={styles.saveButton}
            />
          </View>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  stepContainer: {
    gap: SPACING[4],
  },
  sessionCard: {
    marginBottom: SPACING[2],
  },
  sessionCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: SPACING[4],
    gap: SPACING[2],
  },
  searchInputWrapper: {
    marginBottom: 0,
  },
  quickCreateButton: {
    minHeight: SPACING[12],
  },
  recentSection: {
    marginBottom: SPACING[4],
  },
  recentAnimals: {
    marginBottom: SPACING[2],
  },
  recentAnimalCard: {
    minWidth: 100,
    alignItems: 'center',
    marginRight: SPACING[2],
  },
  animalsList: {
    marginTop: SPACING[2],
  },
  animalCard: {
    marginBottom: SPACING[2],
  },
  animalCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalInfo: {
    flex: 1,
  },
  changeButton: {
    padding: SPACING[2],
  },
  weightInputContainer: {
    marginBottom: SPACING[4],
  },
  weightInput: {
    borderWidth: 3,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING[6],
    fontSize: 56,
    fontWeight: 'bold',
    textAlign: 'center',
    minHeight: 120,
  },
  customFieldsSection: {
    marginTop: SPACING[4],
    marginBottom: SPACING[4],
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
    minHeight: 44,
    justifyContent: 'center',
  },
  booleanButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 100,
    minHeight: 44,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[4],
  },
  backButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
