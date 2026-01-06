/**
 * Settings Screen
 *
 * App settings and configuration.
 * Includes theme selection (Light, Dark, System).
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { DetailScreenHeader } from '@/presentation/components';
import { Card } from '@/presentation/components/ui';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeOptionData {
  value: ThemeOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const themeOptions: ThemeOptionData[] = [
  {
    value: 'light',
    label: 'Light',
    icon: 'sunny-outline',
    description: 'Always use light theme',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: 'moon-outline',
    description: 'Always use dark theme',
  },
  {
    value: 'system',
    label: 'System',
    icon: 'phone-portrait-outline',
    description: 'Follow device settings',
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setTheme } = useTheme();

  const handleThemeSelect = (option: ThemeOption) => {
    setTheme(option);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
      testID="settings-screen"
    >
      <DetailScreenHeader
        title="Settings"
        onBack={() => router.back()}
        testID="settings-header"
      />

      <View style={styles.section}>
        <Text style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[3] }]}>
          Appearance
        </Text>
        <Text style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginBottom: SPACING[4] }]}>
          Choose your preferred theme
        </Text>

        <Card style={styles.themeCard}>
          {themeOptions.map((option) => {
            const isSelected = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: isSelected
                      ? theme.interactive.primary
                      : theme.background.secondary,
                    borderColor: isSelected ? theme.interactive.primary : theme.border.default,
                  },
                ]}
                onPress={() => handleThemeSelect(option.value)}
                activeOpacity={0.7}
                testID={`theme-option-${option.value}`}
              >
                <View style={styles.themeOptionContent}>
                  <View style={styles.themeOptionLeft}>
                    <Ionicons
                      name={option.icon}
                      size={SPACING[6]}
                      color={isSelected ? theme.text.inverse : theme.text.primary}
                    />
                    <View style={styles.themeOptionText}>
                      <Text
                        style={[
                          TEXT_STYLES.body,
                          {
                            color: isSelected ? theme.text.inverse : theme.text.primary,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          TEXT_STYLES.caption,
                          {
                            color: isSelected ? theme.text.inverse : theme.text.secondary,
                            marginTop: SPACING[1],
                          },
                        ]}
                      >
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={SPACING[6]}
                      color={theme.text.inverse}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card>
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
    paddingTop: SPACING[4],
    paddingBottom: SPACING[24],
  },
  section: {
    marginBottom: SPACING[6],
  },
  themeCard: {
    padding: SPACING[2],
  },
  themeOption: {
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    marginBottom: SPACING[2],
    overflow: 'hidden',
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[4],
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeOptionText: {
    marginLeft: SPACING[3],
    flex: 1,
  },
});

