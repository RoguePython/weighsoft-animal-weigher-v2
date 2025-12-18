/**
 * Weighing History Screen
 * 
 * View all weighing transactions across all animals and sessions.
 */

import { Batch } from '@/domain/entities/batch';
import { Entity } from '@/domain/entities/entity';
import { Transaction } from '@/domain/entities/transaction';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { useFocusEffect, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as XLSX from 'xlsx';

const DEFAULT_TENANT_ID = 'default-tenant';

export default function WeighingHistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [entities, setEntities] = useState<Map<string, Entity>>(new Map());
  const [batches, setBatches] = useState<Map<string, Batch>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

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
      setFilteredTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load history:', error);
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

  // Filter transactions based on search and filters
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

    setFilteredTransactions(filtered);
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: theme.interactive.primary }]}>← Back</Text>
          </TouchableOpacity>
          {transactions.length > 0 && (
            <TouchableOpacity
              onPress={handleExport}
              style={[styles.exportButton, { backgroundColor: theme.interactive.primary }]}
            >
              <Text style={[styles.exportButtonText, { color: theme.text.inverse }]}>Export</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.title, { color: theme.text.primary }]}>Weighing History</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {filteredTransactions.length} of {transactions.length} weighing{transactions.length !== 1 ? 's' : ''} shown
        </Text>
      </View>

      {transactions.length > 0 && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.background.secondary }]}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.background.primary,
                borderColor: theme.border.default,
                color: theme.text.primary,
              },
            ]}
            placeholder="Search by tag, name, breed, or session..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.text.secondary }]}>Reason:</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: selectedReason === null
                        ? theme.interactive.primary
                        : theme.background.primary,
                      borderColor: theme.border.default,
                    },
                  ]}
                  onPress={() => setSelectedReason(null)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color:
                          selectedReason === null ? theme.text.inverse : theme.text.primary,
                      },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {['Arrival', 'Monthly', 'Shipment', 'Reweigh', 'Other'].map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor:
                          selectedReason === reason
                            ? theme.interactive.primary
                            : theme.background.primary,
                        borderColor: theme.border.default,
                      },
                    ]}
                    onPress={() => setSelectedReason(selectedReason === reason ? null : reason)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        {
                          color:
                            selectedReason === reason ? theme.text.inverse : theme.text.primary,
                        },
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: theme.text.secondary }]}>Session:</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: selectedSession === null
                        ? theme.interactive.primary
                        : theme.background.primary,
                      borderColor: theme.border.default,
                    },
                  ]}
                  onPress={() => setSelectedSession(null)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color:
                          selectedSession === null ? theme.text.inverse : theme.text.primary,
                      },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {Array.from(batches.values()).map((batch) => (
                  <TouchableOpacity
                    key={batch.batch_id}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor:
                          selectedSession === batch.batch_id
                            ? theme.interactive.primary
                            : theme.background.primary,
                        borderColor: theme.border.default,
                      },
                    ]}
                    onPress={() =>
                      setSelectedSession(
                        selectedSession === batch.batch_id ? null : batch.batch_id
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        {
                          color:
                            selectedSession === batch.batch_id
                              ? theme.text.inverse
                              : theme.text.primary,
                        },
                      ]}
                    >
                      {batch.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {transactions.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
            No weighing history yet. Start weighing animals to see history here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.tx_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const entity = entities.get(item.entity_id);
            const batch = batches.get(item.batch_id);

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/transaction-detail?txId=${item.tx_id}`)}
                style={[styles.historyCard, { backgroundColor: theme.background.secondary }]}
              >
                <View style={styles.historyHeader}>
                  <View style={styles.historyInfo}>
                    <Text style={[styles.animalTag, { color: theme.text.primary }]}>
                      {entity?.primary_tag || 'Unknown'}
                    </Text>
                    <Text style={[styles.animalName, { color: theme.text.secondary }]}>
                      {entity?.name || entity?.breed || 'No name'}
                    </Text>
                    {batch && (
                      <Text style={[styles.sessionName, { color: theme.text.tertiary }]}>
                        Session: {batch.name}
                      </Text>
                    )}
                  </View>
                  <View style={styles.weightContainer}>
                    <Text style={[styles.weight, { color: theme.interactive.primary }]}>
                      {item.weight_kg.toFixed(1)} kg
                    </Text>
                  </View>
                </View>
                <View style={styles.historyFooter}>
                  <Text style={[styles.date, { color: theme.text.tertiary }]}>
                    {formatDate(item.timestamp)}
                  </Text>
                  <Text style={[styles.reason, { color: theme.text.tertiary }]}>
                    {item.reason}
                  </Text>
                </View>
              </TouchableOpacity>
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
  header: {
    padding: SPACING[4],
    paddingTop: SPACING[12],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  backButton: {
    // No marginBottom needed as it's in flex row
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: 16,
  },
  listContent: {
    padding: SPACING[4],
    paddingBottom: SPACING[24],
    gap: SPACING[3],
  },
  historyCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[2],
  },
  historyInfo: {
    flex: 1,
  },
  animalTag: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  animalName: {
    fontSize: 16,
    marginBottom: SPACING[1],
  },
  sessionName: {
    fontSize: 14,
  },
  weightContainer: {
    alignItems: 'flex-end',
  },
  weight: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  date: {
    fontSize: 14,
  },
  reason: {
    fontSize: 14,
    textTransform: 'capitalize',
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
  filtersContainer: {
    padding: SPACING[4],
    marginHorizontal: SPACING[4],
    marginBottom: SPACING[2],
    borderRadius: BORDER_RADIUS.lg,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING[3],
    fontSize: 16,
    marginBottom: SPACING[3],
    minHeight: 48,
  },
  filterRow: {
    gap: SPACING[3],
  },
  filterGroup: {
    marginBottom: SPACING[2],
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING[2],
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
  },
  filterButton: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

