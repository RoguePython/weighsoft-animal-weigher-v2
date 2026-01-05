/**
 * Weighing History Screen
 *
 * View all weighing transactions across all animals and sessions.
 * Redesigned with new component library for better UX.
 */

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

import { DetailScreenHeader } from '@/presentation/components';
import { Card, EmptyState, LoadingState, SecondaryButton, StatusBadge } from '@/presentation/components/ui';
import { SearchInput } from '@/presentation/components/ui/input';

const DEFAULT_TENANT_ID = 'default-tenant';

interface TransactionWithHealth extends Transaction {
  weightChange?: number;
  weightChangePercent?: number;
  hasWeightLoss?: boolean;
  severity?: 'minor' | 'moderate' | 'severe';
}

export default function WeighingHistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithHealth[]>([]);
  const [entities, setEntities] = useState<Map<string, Entity>>(new Map());
  const [batches, setBatches] = useState<Map<string, Batch>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const transactionRepo = container.transactionRepository;
      const entityRepo = container.entityRepository;
      const batchRepo = container.batchRepository;

      // Load all transactions
      const allTransactions = await transactionRepo.findAll(DEFAULT_TENANT_ID);
      setTransactions(allTransactions);

      // Load unique entity IDs and batch IDs
      const entityIds = [...new Set(allTransactions.map((t) => t.entity_id))];
      const batchIds = [...new Set(allTransactions.map((t) => t.batch_id))];

      // Load entities and batches in parallel
      const [entityResults, batchResults] = await Promise.all([
        Promise.all(entityIds.map((id) => entityRepo.findById(id))),
        Promise.all(batchIds.map((id) => batchRepo.findById(id))),
      ]);

      // Build maps for quick lookup
      const entityMap = new Map<string, Entity>();
      entityResults.forEach((entity) => {
        if (entity) entityMap.set(entity.entity_id, entity);
      });

      const batchMap = new Map<string, Batch>();
      batchResults.forEach((batch) => {
        if (batch) batchMap.set(batch.batch_id, batch);
      });

      setEntities(entityMap);
      setBatches(batchMap);
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert('Error', 'Failed to load weighing history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh history whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  // Calculate weight changes and filter transactions
  useEffect(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tx) => {
        const entity = entities.get(tx.entity_id);
        const batch = batches.get(tx.batch_id);
        return (
          entity?.primary_tag?.toLowerCase().includes(query) ||
          entity?.name?.toLowerCase().includes(query) ||
          entity?.breed?.toLowerCase().includes(query) ||
          batch?.name?.toLowerCase().includes(query)
        );
      });
    }

    // Reason filter
    if (selectedReason) {
      filtered = filtered.filter((tx) => tx.reason === selectedReason);
    }

    // Session filter
    if (selectedSession) {
      filtered = filtered.filter((tx) => tx.batch_id === selectedSession);
    }

    // Calculate weight changes for each transaction
    const transactionsWithHealth: TransactionWithHealth[] = filtered.map((tx) => {
      const entity = entities.get(tx.entity_id);
      if (!entity) return { ...tx };

      // Find previous transaction for this entity
      const entityTransactions = transactions
        .filter((t) => t.entity_id === tx.entity_id)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      const currentIndex = entityTransactions.findIndex((t) => t.tx_id === tx.tx_id);
      if (currentIndex > 0) {
        const previous = entityTransactions[currentIndex - 1];
        const weightChange = tx.weight_kg - previous.weight_kg;
        const weightChangePercent = (weightChange / previous.weight_kg) * 100;

        // Detect weight loss
        if (weightChange < 0) {
          const lossPercent = Math.abs(weightChangePercent);
          let severity: 'minor' | 'moderate' | 'severe' = 'minor';
          if (lossPercent > 5) {
            severity = 'severe';
          } else if (lossPercent > 2) {
            severity = 'moderate';
          }

          return {
            ...tx,
            weightChange,
            weightChangePercent,
            hasWeightLoss: true,
            severity,
          };
        }

        return {
          ...tx,
          weightChange,
          weightChangePercent,
          hasWeightLoss: false,
        };
      }

      return { ...tx };
    });

    // Sort by timestamp (newest first)
    transactionsWithHealth.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredTransactions(transactionsWithHealth);
  }, [searchQuery, selectedReason, selectedSession, transactions, entities, batches]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCustomFieldValue = (value: any, fieldType?: string): string => {
    if (value === null || value === undefined) return '';

    // Handle multi-select arrays
    if (Array.isArray(value)) {
      return value.join('; ');
    }

    // Handle dates
    if (fieldType === 'date' && value) {
      try {
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } catch {
        return String(value);
      }
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle numbers
    if (typeof value === 'number') {
      return value.toString();
    }

    return String(value);
  };

  const handleExport = async () => {
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;

    if (dataToExport.length === 0) {
      Alert.alert('No Data', 'There is no weighing history to export.');
      return;
    }

    try {
      // Collect all unique custom field definitions across all transactions
      const customFieldMap = new Map<string, { label: string; dataType: string }>();

      dataToExport.forEach((tx) => {
        tx.custom_fields_definition_snapshot?.forEach((field) => {
          if (!customFieldMap.has(field.field_id)) {
            customFieldMap.set(field.field_id, {
              label: field.label,
              dataType: field.data_type,
            });
          }
        });
      });

      // Build headers: core fields first, then custom fields
      const coreHeaders = [
        'Date',
        'Time',
        'Animal Tag',
        'Animal Name',
        'Breed',
        'Species',
        'Weight (kg)',
        'Reason',
        'Session Name',
        'Session Type',
        'Estimated Weight',
        'Notes',
      ];

      const customHeaders = Array.from(customFieldMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fieldId, { label }]) => label);

      const allHeaders = [...coreHeaders, ...customHeaders];

      // Build data rows
      const rows = dataToExport.map((tx) => {
        const entity = entities.get(tx.entity_id);
        const batch = batches.get(tx.batch_id);
        const txDate = new Date(tx.timestamp);

        // Core fields
        const coreData = [
          txDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
          txDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          entity?.primary_tag || '',
          entity?.name || entity?.breed || '',
          entity?.breed || '',
          entity?.species || '',
          tx.weight_kg,
          tx.reason,
          batch?.name || '',
          batch?.type || '',
          tx.is_estimated_weight ? 'Yes' : 'No',
          tx.notes || '',
        ];

        // Custom fields (in same order as headers)
        const customData = Array.from(customFieldMap.keys())
          .sort()
          .map((fieldId) => {
            const fieldDef = customFieldMap.get(fieldId);
            const value = tx.custom_field_values?.[fieldId];
            return formatCustomFieldValue(value, fieldDef?.dataType);
          });

        return [...coreData, ...customData];
      });

      // Create workbook
      const worksheet = XLSX.utils.aoa_to_sheet([allHeaders, ...rows]);

      // Set column widths
      const colWidths = allHeaders.map((header, idx) => {
        const maxLength = Math.max(
          header.length,
          ...rows.map((row) => String(row[idx] || '').length)
        );
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
      });
      worksheet['!cols'] = colWidths;

      // Style header row (bold)
      const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'E3F2FD' } }, // Light blue background
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Weighing History');

      // Generate file
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

      // Create file path
      const fileName = `weighing-history-${new Date().toISOString().split('T')[0]}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Export Weighing History',
      });

      Alert.alert('Success', `Exported ${dataToExport.length} weighing records to Excel.`);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Failed to export weighing history. Please try again.');
    }
  };

  const getSeverityVariant = (severity?: 'minor' | 'moderate' | 'severe'): 'warning' | 'error' => {
    if (severity === 'severe') return 'error';
    return 'warning';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="weighing-history-screen">
        <LoadingState message="Loading weighing history..." testID="loading-history" />
      </View>
    );
  }

  const uniqueReasons = ['Arrival', 'Monthly', 'Shipment', 'Reweigh', 'Other'];
  const uniqueBatches = Array.from(batches.values());

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="weighing-history-screen">
      <DetailScreenHeader
        title="Weighing History"
        subtitle={`${filteredTransactions.length} of ${transactions.length} weighing${transactions.length !== 1 ? 's' : ''} shown`}
        action={
          transactions.length > 0
            ? {
                label: 'Export',
                onPress: handleExport,
                variant: 'secondary',
                icon: 'download-outline',
                testID: 'export-button',
              }
            : undefined
        }
        testID="history-header"
      />

      {/* Search Input */}
      {transactions.length > 0 && (
        <View style={styles.searchContainer}>
          <SearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by tag, name, breed, or session..."
            testID="history-search-input"
          />
          <SecondaryButton
            title={showFilters ? 'Hide Filters' : 'Show Filters'}
            icon={showFilters ? 'chevron-up-outline' : 'chevron-down-outline'}
            iconPosition="right"
            onPress={() => setShowFilters(!showFilters)}
            testID="toggle-filters-button"
            style={styles.filterToggleButton}
          />
        </View>
      )}

      {/* Filters */}
      {showFilters && transactions.length > 0 && (
        <Card variant="outlined" style={styles.filtersCard} testID="filters-card">
          <View style={styles.filterSection}>
            <Text style={[TEXT_STYLES.label, { color: theme.text.secondary, marginBottom: SPACING[2] }]}>
              Reason:
            </Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                onPress={() => setSelectedReason(null)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedReason === null ? theme.interactive.primary : theme.interactive.secondary,
                    borderColor: theme.border.default,
                  },
                ]}
                testID="filter-reason-all"
              >
                <Text
                  style={[
                    TEXT_STYLES.bodySmall,
                    {
                      color: selectedReason === null ? theme.text.inverse : theme.text.primary,
                    },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {uniqueReasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(selectedReason === reason ? null : reason)}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        selectedReason === reason ? theme.interactive.primary : theme.interactive.secondary,
                      borderColor: theme.border.default,
                    },
                  ]}
                  testID={`filter-reason-${reason.toLowerCase()}`}
                >
                  <Text
                    style={[
                      TEXT_STYLES.bodySmall,
                      {
                        color: selectedReason === reason ? theme.text.inverse : theme.text.primary,
                      },
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {uniqueBatches.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={[TEXT_STYLES.label, { color: theme.text.secondary, marginBottom: SPACING[2] }]}>
                Session:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
                <TouchableOpacity
                  onPress={() => setSelectedSession(null)}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        selectedSession === null ? theme.interactive.primary : theme.interactive.secondary,
                      borderColor: theme.border.default,
                    },
                  ]}
                  testID="filter-session-all"
                >
                  <Text
                    style={[
                      TEXT_STYLES.bodySmall,
                      {
                        color: selectedSession === null ? theme.text.inverse : theme.text.primary,
                      },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {uniqueBatches.map((batch) => (
                  <TouchableOpacity
                    key={batch.batch_id}
                    onPress={() => setSelectedSession(selectedSession === batch.batch_id ? null : batch.batch_id)}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor:
                          selectedSession === batch.batch_id ? theme.interactive.primary : theme.interactive.secondary,
                        borderColor: theme.border.default,
                      },
                    ]}
                    testID={`filter-session-${batch.batch_id}`}
                  >
                    <Text
                      style={[
                        TEXT_STYLES.bodySmall,
                        {
                          color: selectedSession === batch.batch_id ? theme.text.inverse : theme.text.primary,
                        },
                      ]}
                    >
                      {batch.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </Card>
      )}

      {/* Transactions List or Empty State */}
      {transactions.length === 0 ? (
        <EmptyState
          icon="time-outline"
          message="No weighing history yet"
          description="Start weighing animals to see history here. Your weighing history helps you track growth trends, monitor health, and analyze performance over time."
          action={{
            label: 'Start Weighing',
            onPress: () => router.push('/(tabs)/weigh' as any),
            testID: 'empty-state-start-weighing-button',
          }}
          testID="history-empty-state"
        />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          icon="search-outline"
          message="No transactions found"
          description="Try adjusting your search or filter criteria."
          testID="history-filtered-empty-state"
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.tx_id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.interactive.primary} />
          }
          renderItem={({ item }) => {
            const entity = entities.get(item.entity_id);
            const batch = batches.get(item.batch_id);

            return (
              <Card
                variant="outlined"
                onPress={() => router.push(`/transaction-detail?txId=${item.tx_id}`)}
                style={styles.transactionCard}
                testID={`transaction-${item.tx_id}`}
              >
                <View style={styles.transactionContent}>
                  {/* Transaction Header */}
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <View style={styles.animalInfoRow}>
                        <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]} testID={`tx-tag-${item.tx_id}`}>
                          {entity?.primary_tag || 'Unknown'}
                        </Text>
                        {item.hasWeightLoss && item.severity && (
                          <StatusBadge
                            label={`${Math.abs(item.weightChangePercent || 0).toFixed(1)}% loss`}
                            variant={getSeverityVariant(item.severity)}
                            testID={`tx-weight-loss-badge-${item.tx_id}`}
                          />
                        )}
                      </View>
                      {entity?.name && (
                        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]} testID={`tx-name-${item.tx_id}`}>
                          {entity.name}
                        </Text>
                      )}
                      {batch && (
                        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.tertiary }]} testID={`tx-session-${item.tx_id}`}>
                          Session: {batch.name}
                        </Text>
                      )}
                    </View>
                    <View style={styles.weightContainer}>
                      <Text style={[TEXT_STYLES.h2, { color: theme.interactive.primary }]} testID={`tx-weight-${item.tx_id}`}>
                        {item.weight_kg.toFixed(1)} kg
                      </Text>
                      {item.weightChange !== undefined && item.weightChange !== 0 && (
                        <View style={styles.weightChangeRow}>
                          <Ionicons
                            name={item.weightChange > 0 ? 'arrow-up' : 'arrow-down'}
                            size={14}
                            color={item.weightChange > 0 ? theme.status.success : theme.status.error}
                          />
                          <Text
                            style={[
                              TEXT_STYLES.caption,
                              {
                                color: item.weightChange > 0 ? theme.status.success : theme.status.error,
                                marginLeft: SPACING[1],
                              },
                            ]}
                            testID={`tx-weight-change-${item.tx_id}`}
                          >
                            {item.weightChange > 0 ? '+' : ''}
                            {item.weightChange.toFixed(1)} kg ({item.weightChangePercent && item.weightChangePercent > 0 ? '+' : ''}
                            {item.weightChangePercent?.toFixed(1)}%)
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Transaction Footer */}
                  <View style={styles.transactionFooter}>
                    <View style={styles.footerRow}>
                      <Ionicons name="time-outline" size={14} color={theme.text.tertiary} />
                      <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.tertiary, marginLeft: SPACING[2] }]}>
                        {formatDate(item.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.footerRow}>
                      <Ionicons name="flag-outline" size={14} color={theme.text.tertiary} />
                      <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.tertiary, marginLeft: SPACING[2] }]}>
                        {item.reason}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[2],
    gap: SPACING[2],
  },
  filterToggleButton: {
    marginTop: SPACING[2],
  },
  filtersCard: {
    marginHorizontal: SPACING[4],
    marginTop: SPACING[2],
    marginBottom: SPACING[2],
  },
  filterSection: {
    marginBottom: SPACING[4],
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  filterButton: {
    minWidth: 80,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SPACING[12],
  },
  listContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[24],
    gap: SPACING[3],
  },
  transactionCard: {
    marginBottom: SPACING[3],
  },
  transactionContent: {
    gap: SPACING[3],
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
    gap: SPACING[1],
  },
  animalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    flexWrap: 'wrap',
  },
  weightContainer: {
    alignItems: 'flex-end',
    gap: SPACING[1],
  },
  weightChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
