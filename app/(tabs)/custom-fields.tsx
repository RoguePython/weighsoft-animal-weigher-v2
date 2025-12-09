/**
 * Custom Fields Tab - Manage Custom Field Lists
 * 
 * Create, view, edit, and manage custom field lists (CFLs).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { container } from '@/infrastructure/di/container';
import { CustomFieldList } from '@/domain/entities/custom-field-list';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export default function CustomFieldsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [cfls, setCfls] = useState<CustomFieldList[]>([]);

  useEffect(() => {
    loadCFLs();
  }, []);

  const loadCFLs = async () => {
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
  };

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

  if (loading) {
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
        <Text style={[styles.title, { color: theme.text.primary }]}>Custom Fields</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Manage custom field lists for weighing sessions
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.interactive.primary }]}
        onPress={() => router.push('/custom-field-list-setup')}
      >
        <Text style={[styles.createButtonText, { color: theme.text.inverse }]}>
          + Create New Custom Field List
        </Text>
      </TouchableOpacity>

      {cfls.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
            No custom field lists yet. Create your first one to get started.
          </Text>
        </View>
      ) : (
        <View style={styles.cflsList}>
          {cfls.map((cfl) => (
            <View key={cfl.cfl_id} style={[styles.cflCard, { backgroundColor: theme.background.secondary }]}>
              <View style={styles.cflHeader}>
                <View style={styles.cflInfo}>
                  <Text style={[styles.cflName, { color: theme.text.primary }]}>{cfl.name}</Text>
                  <Text style={[styles.cflMeta, { color: theme.text.secondary }]}>
                    {cfl.fields.length} fields • {cfl.is_system_default ? 'System Default' : 'Custom'}
                  </Text>
                </View>
                {!cfl.is_system_default && (
                  <TouchableOpacity
                    onPress={() => handleDeleteCFL(cfl)}
                    style={styles.deleteButton}
                  >
                    <Text style={[styles.deleteButtonText, { color: theme.status.error }]}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fieldsPreview}>
                {cfl.fields.slice(0, 3).map((field) => (
                  <View key={field.field_id} style={styles.fieldTag}>
                    <Text style={[styles.fieldTagText, { color: theme.text.secondary }]}>
                      {field.label}
                    </Text>
                  </View>
                ))}
                {cfl.fields.length > 3 && (
                  <Text style={[styles.moreFields, { color: theme.text.secondary }]}>
                    +{cfl.fields.length - 3} more
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.interactive.secondary }]}
                onPress={() => router.push(`/custom-field-list-setup?cflId=${cfl.cfl_id}`)}
              >
                <Text style={[styles.editButtonText, { color: theme.text.primary }]}>Edit</Text>
              </TouchableOpacity>
            </View>
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
  },
  header: {
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: 16,
  },
  createButton: {
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING[4],
    minHeight: 56,
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cflsList: {
    gap: SPACING[3],
  },
  cflCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cflHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[3],
  },
  cflInfo: {
    flex: 1,
  },
  cflName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING[1],
  },
  cflMeta: {
    fontSize: 14,
  },
  deleteButton: {
    padding: SPACING[2],
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fieldsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[2],
    marginBottom: SPACING[3],
  },
  fieldTag: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  fieldTagText: {
    fontSize: 12,
  },
  moreFields: {
    fontSize: 12,
    alignSelf: 'center',
  },
  editButton: {
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

