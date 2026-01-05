/**
 * Custom Fields List Screen
 *
 * Standalone custom field lists accessible from More menu.
 * Redesigned with new component library for better UX.
 */

import { CustomFieldList } from '@/domain/entities/custom-field-list';
import { container } from '@/infrastructure/di/container';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DetailScreenHeader } from '@/presentation/components';
import {
  Card,
  EmptyState,
  LoadingState,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from '@/presentation/components/ui';
import { SearchInput } from '@/presentation/components/ui/input';

const DEFAULT_TENANT_ID = 'default-tenant';

export default function CustomFieldsListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [cfls, setCfls] = useState<CustomFieldList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCFLs = useCallback(async () => {
    try {
      setLoading(true);
      const cflRepo = container.customFieldListRepository;
      const allCFLs = await cflRepo.findAll(DEFAULT_TENANT_ID);
      setCfls(allCFLs);
    } catch (error) {
      console.error('Failed to load CFLs:', error);
      Alert.alert('Error', 'Failed to load custom field lists');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadCFLs();
    }, [loadCFLs])
  );

  const handleDeleteCFL = async (cfl: CustomFieldList) => {
    if (cfl.is_system_default) {
      Alert.alert('Cannot Delete', 'System default custom field lists cannot be deleted');
      return;
    }

    Alert.alert('Delete Custom Field List', `Are you sure you want to delete "${cfl.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const cflRepo = container.customFieldListRepository;
            await cflRepo.delete(cfl.cfl_id);
            loadCFLs();
          } catch (error) {
            console.error('Failed to delete CFL:', error);
            Alert.alert('Error', 'Failed to delete custom field list');
          }
        },
      },
    ]);
  };

  // Filter CFLs based on search
  const filteredCFLs = cfls.filter((cfl) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      cfl.name.toLowerCase().includes(query) ||
      cfl.fields.some((field) => field.label.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID="custom-fields-list-screen">
        <LoadingState message="Loading custom field lists..." testID="loading-cfls" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="custom-fields-list-screen"
    >
      <DetailScreenHeader
        title="Custom Fields"
        subtitle="Manage custom field lists for weighing sessions"
        action={{
          label: 'Create CFL',
          onPress: () => router.push('/custom-field-list-setup' as any),
          variant: 'primary',
          icon: 'add-circle-outline',
          testID: 'create-cfl-button',
        }}
        testID="custom-fields-header"
      />

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name or field label..."
        testID="cfls-search-input"
        containerStyle={styles.searchContainer}
      />

      {/* Create CFL Button (Alternative) */}
      <PrimaryButton
        title="Create New Custom Field List"
        icon="add-circle"
        iconPosition="left"
        onPress={() => router.push('/custom-field-list-setup' as any)}
        testID="create-cfl-button-alt"
        style={styles.createButton}
      />

      {/* CFLs List or Empty State */}
      {filteredCFLs.length === 0 ? (
        <EmptyState
          icon={searchQuery ? 'search-outline' : 'list-outline'}
          message={searchQuery ? 'No custom field lists found' : 'No custom field lists yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or create a new custom field list to capture additional information during weighing.'
              : 'Create your first custom field list to capture additional information during weighing. Custom fields help you track specific data like feed type, health notes, location, or any other information relevant to your operation.'
          }
          action={
            !searchQuery
              ? {
                  label: 'Create Your First Custom Field List',
                  onPress: () => router.push('/custom-field-list-setup' as any),
                  testID: 'empty-state-create-button',
                }
              : undefined
          }
          testID="cfls-empty-state"
        />
      ) : (
        <View style={styles.cflsList}>
          {filteredCFLs.map((cfl) => (
            <Card key={cfl.cfl_id} variant="outlined" style={styles.cflCard} testID={`cfl-${cfl.cfl_id}`}>
              <View style={styles.cflCardContent}>
                {/* CFL Header */}
                <View style={styles.cflHeader}>
                  <View style={styles.cflInfo}>
                    <View style={styles.cflNameRow}>
                      <Text
                        style={[TEXT_STYLES.h4, { color: theme.text.primary }]}
                        testID={`cfl-name-${cfl.cfl_id}`}
                      >
                        {cfl.name}
                      </Text>
                      {cfl.is_system_default && (
                        <StatusBadge
                          label="System Default"
                          variant="info"
                          testID={`cfl-system-badge-${cfl.cfl_id}`}
                        />
                      )}
                    </View>
                    <View style={styles.cflMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="list-outline" size={16} color={theme.text.secondary} />
                        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[2] }]}>
                          {cfl.fields.length} field{cfl.fields.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={16} color={theme.text.secondary} />
                        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginLeft: SPACING[2] }]}>
                          v{cfl.version}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {!cfl.is_system_default && (
                    <TouchableOpacity
                      onPress={() => handleDeleteCFL(cfl)}
                      style={styles.deleteButton}
                      testID={`cfl-delete-${cfl.cfl_id}`}
                    >
                      <Ionicons name="trash-outline" size={20} color={theme.status.error} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Fields Preview */}
                {cfl.fields.length > 0 && (
                  <View style={styles.fieldsPreview}>
                    <Text style={[TEXT_STYLES.label, { color: theme.text.secondary, marginBottom: SPACING[2] }]}>
                      Fields:
                    </Text>
                    <View style={styles.fieldsList}>
                      {cfl.fields.slice(0, 5).map((field) => (
                        <View key={field.field_id} style={styles.fieldTag}>
                          <Text style={[TEXT_STYLES.caption, { color: theme.text.secondary }]}>
                            {field.label}
                            {field.is_required && (
                              <Text style={{ color: theme.status.error }}> *</Text>
                            )}
                          </Text>
                        </View>
                      ))}
                      {cfl.fields.length > 5 && (
                        <Text style={[TEXT_STYLES.caption, { color: theme.text.tertiary }]}>
                          +{cfl.fields.length - 5} more
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* CFL Actions */}
                <View style={styles.cflActions}>
                  <SecondaryButton
                    title="View"
                    icon="eye-outline"
                    iconPosition="left"
                    onPress={() => router.push(`/custom-field-list-setup?cflId=${cfl.cfl_id}`)}
                    testID={`cfl-view-${cfl.cfl_id}`}
                    style={styles.actionButton}
                  />
                  <SecondaryButton
                    title="Edit"
                    icon="create-outline"
                    iconPosition="left"
                    onPress={() => router.push(`/custom-field-list-setup?cflId=${cfl.cfl_id}`)}
                    testID={`cfl-edit-${cfl.cfl_id}`}
                    style={styles.actionButton}
                  />
                </View>
              </View>
            </Card>
          ))}
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
  searchContainer: {
    marginBottom: SPACING[4],
  },
  createButton: {
    marginBottom: SPACING[4],
  },
  cflsList: {
    gap: SPACING[3],
  },
  cflCard: {
    marginBottom: SPACING[3],
  },
  cflCardContent: {
    gap: SPACING[3],
  },
  cflHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cflInfo: {
    flex: 1,
    gap: SPACING[2],
  },
  cflNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    flexWrap: 'wrap',
  },
  cflMetaRow: {
    flexDirection: 'row',
    gap: SPACING[4],
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: SPACING[2],
    minWidth: SPACING[12],
    minHeight: SPACING[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldsPreview: {
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  fieldsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginTop: SPACING[2],
  },
  fieldTag: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  cflActions: {
    flexDirection: 'row',
    gap: SPACING[2],
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButton: {
    flex: 1,
  },
});
