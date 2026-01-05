/**
 * Detail Screen Header Component
 *
 * Standardized header for detail screens with back button, title, and optional action.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { IconButton, PrimaryButton, SecondaryButton } from './ui/button';

/**
 * DetailScreenHeader component props
 */
export interface DetailScreenHeaderProps {
  /**
   * Screen title
   */
  title: string;
  /**
   * Optional subtitle
   */
  subtitle?: string;
  /**
   * Optional action button configuration
   */
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    icon?: keyof typeof Ionicons.glyphMap;
    testID?: string;
  };
  /**
   * Whether to show back button (default: true)
   */
  showBackButton?: boolean;
  /**
   * Custom back handler (default: router.back())
   */
  onBack?: () => void;
  /**
   * Custom style for container
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * DetailScreenHeader Component
 *
 * Standardized header for detail screens with back button, title, subtitle, and optional action.
 *
 * @example
 * ```tsx
 * <DetailScreenHeader
 *   title="Animal Details"
 *   subtitle="Tag: #12345"
 *   action={{
 *     label: "Edit",
 *     onPress: handleEdit,
 *     variant: "primary",
 *     icon: "create-outline",
 *     testID: "edit-button"
 *   }}
 *   testID="detail-header"
 * />
 * ```
 */
export const DetailScreenHeader: React.FC<DetailScreenHeaderProps> = ({
  title,
  subtitle,
  action,
  showBackButton = true,
  onBack,
  style,
  testID,
}) => {
  const router = useRouter();
  const { theme } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          testID={testID ? `${testID}-back` : undefined}
        >
          <Ionicons name="arrow-back" size={24} color={theme.interactive.primary} />
          <Text style={[TEXT_STYLES.body, { color: theme.interactive.primary, marginLeft: SPACING[2] }]}>
            Back
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.titleContainer}>
        <Text
          style={[TEXT_STYLES.h1, { color: theme.text.primary }]}
          testID={testID ? `${testID}-title` : undefined}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginTop: SPACING[1] }]}
            testID={testID ? `${testID}-subtitle` : undefined}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {action && (
        <View style={styles.actionContainer}>
          {action.variant === 'primary' ? (
            <PrimaryButton
              title={action.label}
              icon={action.icon}
              iconPosition="left"
              onPress={action.onPress}
              testID={action.testID || (testID ? `${testID}-action` : undefined)}
              style={styles.actionButton}
            />
          ) : (
            <SecondaryButton
              title={action.label}
              icon={action.icon}
              iconPosition="left"
              onPress={action.onPress}
              testID={action.testID || (testID ? `${testID}-action` : undefined)}
              style={styles.actionButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[6],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
    alignSelf: 'flex-start',
  },
  titleContainer: {
    marginBottom: SPACING[2],
  },
  actionContainer: {
    marginTop: SPACING[4],
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
});

