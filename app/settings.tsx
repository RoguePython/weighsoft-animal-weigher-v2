/**
 * Settings Screen
 *
 * App settings and configuration.
 * Placeholder implementation - will be enhanced in Phase 3.
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="settings-screen"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          testID="settings-back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }]}>Settings</Text>
      </View>

      <View
        style={[
          styles.placeholderCard,
          {
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.default,
          },
        ]}
      >
        <Ionicons name="settings-outline" size={48} color={theme.text.tertiary} />
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginTop: SPACING[4] }]}>
          Coming Soon
        </Text>
        <Text style={[TEXT_STYLES.body, { color: theme.text.secondary, marginTop: SPACING[2] }]}>
          App settings will be available in a future update.
        </Text>
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
    paddingTop: SPACING[12],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  backButton: {
    marginRight: SPACING[3],
    padding: SPACING[2],
  },
  placeholderCard: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});

