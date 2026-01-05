/**
 * Ready to Sell Screen
 *
 * Analytics screen for identifying animals ready to sell.
 * Enhanced with new component library for better UX.
 */

import { DetailScreenHeader } from '@/presentation/components';
import { EmptyState } from '@/presentation/components/ui';
import { useTheme } from '@/infrastructure/theme/theme-context';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function ReadyToSellScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="ready-to-sell-screen"
    >
      <DetailScreenHeader
        title="Ready to Sell"
        subtitle="Identify animals that have reached target weight"
        testID="ready-to-sell-header"
      />

      <EmptyState
        icon="cash-outline"
        message="Coming Soon"
        description="Ready to sell analytics will be available in a future update. This feature will help you identify animals that have reached their target weight and are ready for sale, optimizing your sales timing."
        testID="ready-to-sell-empty-state"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
});
