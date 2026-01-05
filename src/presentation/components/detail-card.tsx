/**
 * Detail Card Component
 *
 * Standardized card for displaying key-value pairs and sections in detail screens.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';
import { Card } from './ui/card';
import { StatusBadge } from './ui/badge';

/**
 * Key-value pair for DetailCard
 */
export interface DetailCardItem {
  /**
   * Label text
   */
  label: string;
  /**
   * Value text
   */
  value: string | number | ReactNode;
  /**
   * Optional icon name from Ionicons
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Optional badge variant for value
   */
  badgeVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  /**
   * Whether to show as badge
   */
  showAsBadge?: boolean;
}

/**
 * DetailCard component props
 */
export interface DetailCardProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Optional section description
   */
  description?: string;
  /**
   * Key-value pairs to display
   */
  items?: DetailCardItem[];
  /**
   * Optional custom content (rendered instead of items)
   */
  children?: ReactNode;
  /**
   * Card variant (default: 'outlined')
   */
  variant?: 'default' | 'elevated' | 'outlined';
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
 * DetailCard Component
 *
 * Standardized card for displaying information sections in detail screens.
 * Supports key-value pairs or custom content.
 *
 * @example
 * ```tsx
 * <DetailCard
 *   title="Animal Information"
 *   items={[
 *     { label: "Tag", value: "#12345", icon: "pricetag-outline" },
 *     { label: "Status", value: "Active", showAsBadge: true, badgeVariant: "success" },
 *     { label: "Weight", value: "450 kg", icon: "scale-outline" }
 *   ]}
 *   testID="animal-info-card"
 * />
 * ```
 */
export const DetailCard: React.FC<DetailCardProps> = ({
  title,
  description,
  items,
  children,
  variant = 'outlined',
  style,
  testID,
}) => {
  const { theme } = useTheme();

  return (
    <Card variant={variant} style={[styles.card, style]} testID={testID}>
      <Text
        style={[TEXT_STYLES.h3, { color: theme.text.primary, marginBottom: SPACING[2] }]}
        testID={testID ? `${testID}-title` : undefined}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[TEXT_STYLES.bodySmall, { color: theme.text.secondary, marginBottom: SPACING[3] }]}
          testID={testID ? `${testID}-description` : undefined}
        >
          {description}
        </Text>
      )}

      {items && items.length > 0 && (
        <View style={styles.itemsContainer} testID={testID ? `${testID}-items` : undefined}>
          {items.map((item, index) => (
            <View key={index} style={styles.item} testID={testID ? `${testID}-item-${index}` : undefined}>
              <View style={styles.itemLabelContainer}>
                {item.icon && (
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={theme.text.secondary}
                    style={styles.itemIcon}
                  />
                )}
                <Text style={[TEXT_STYLES.label, { color: theme.text.secondary }]}>{item.label}</Text>
              </View>
              <View style={styles.itemValueContainer}>
                {item.showAsBadge && typeof item.value === 'string' ? (
                  <StatusBadge
                    label={item.value}
                    variant={item.badgeVariant || 'neutral'}
                    testID={testID ? `${testID}-badge-${index}` : undefined}
                  />
                ) : (
                  <Text
                    style={[TEXT_STYLES.body, { color: theme.text.primary }]}
                    testID={testID ? `${testID}-value-${index}` : undefined}
                  >
                    {item.value}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {children && <View style={styles.childrenContainer}>{children}</View>}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING[4],
  },
  itemsContainer: {
    gap: SPACING[3],
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[2],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: SPACING[2],
  },
  itemValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  childrenContainer: {
    marginTop: SPACING[2],
  },
});

