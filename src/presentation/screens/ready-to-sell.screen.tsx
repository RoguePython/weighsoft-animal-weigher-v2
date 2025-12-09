/**
 * Ready to Sell Screen
 * 
 * Lists animals that have reached target weight with filters and quick batch creation.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { TargetWeightProgress } from '../components/target/target-weight-progress';
import { GetReadyToSellUseCase, ReadyToSellEntity } from '@/domain/usecases/get-ready-to-sell.use-case';

export interface ReadyToSellScreenProps {
  tenantId: string;
  useCase: GetReadyToSellUseCase;
  onCreateBatch?: (entityIds: string[]) => void;
  testID?: string;
}

export const ReadyToSellScreen: React.FC<ReadyToSellScreenProps> = ({
  tenantId,
  useCase,
  onCreateBatch,
  testID,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [readyEntities, setReadyEntities] = useState<ReadyToSellEntity[]>([]);

  useEffect(() => {
    loadReadyToSell();
  }, [tenantId]);

  const loadReadyToSell = async () => {
    try {
      setLoading(true);
      const result = await useCase.execute(tenantId);
      setReadyEntities(result);
    } catch (err) {
      console.error('Failed to load ready to sell:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]} testID={testID}>
        <ActivityIndicator size="large" color={theme.interactive.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[TEXT_STYLES.h2, { color: theme.text.primary }]}>Ready to Sell</Text>
        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
          {readyEntities.length} animals
        </Text>
      </View>

      {readyEntities.length === 0 ? (
        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary }]}>
          No animals ready to sell
        </Text>
      ) : (
        readyEntities.map((item) => (
          <View
            key={item.entity.entity_id}
            style={[styles.entityCard, { backgroundColor: theme.background.secondary }]}
          >
            <Text style={[TEXT_STYLES.h4, { color: theme.text.primary }]}>
              {item.entity.primary_tag}
            </Text>
            <TargetWeightProgress
              currentWeight={item.current_weight}
              targetWeight={item.target_weight}
              progressPercent={item.progress_percent}
              isReady={item.progress_percent >= 100}
            />
            {onCreateBatch && (
              <TouchableOpacity
                onPress={() => onCreateBatch([item.entity.entity_id])}
                style={[styles.batchButton, { backgroundColor: theme.interactive.primary }]}
              >
                <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>
                  Create Batch
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
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
  entityCard: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING[3],
  },
  batchButton: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING[3],
    alignItems: 'center',
  },
});

