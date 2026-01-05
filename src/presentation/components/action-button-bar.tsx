/**
 * Action Button Bar Component
 *
 * Standardized bottom action bar for detail screens with consistent spacing and button layout.
 */

import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { SPACING } from '@/shared/constants/spacing';
import { PrimaryButton, SecondaryButton } from './ui/button';

/**
 * Action button configuration
 */
export interface ActionButton {
  /**
   * Button label
   */
  label: string;
  /**
   * Button press handler
   */
  onPress: () => void;
  /**
   * Button variant (default: 'primary')
   */
  variant?: 'primary' | 'secondary';
  /**
   * Optional icon name
   */
  icon?: string;
  /**
   * Whether button is disabled
   */
  disabled?: boolean;
  /**
   * Whether button is in loading state
   */
  loading?: boolean;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * ActionButtonBar component props
 */
export interface ActionButtonBarProps {
  /**
   * Primary action button (required)
   */
  primaryAction: ActionButton;
  /**
   * Optional secondary action button
   */
  secondaryAction?: ActionButton;
  /**
   * Optional custom content (rendered between buttons)
   */
  children?: ReactNode;
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
 * ActionButtonBar Component
 *
 * Standardized bottom action bar for detail screens.
 * Provides consistent spacing and button layout.
 *
 * @example
 * ```tsx
 * <ActionButtonBar
 *   primaryAction={{
 *     label: "Save",
 *     onPress: handleSave,
 *     loading: saving,
 *     testID: "save-button"
 *   }}
 *   secondaryAction={{
 *     label: "Cancel",
 *     onPress: handleCancel,
 *     variant: "secondary",
 *     testID: "cancel-button"
 *   }}
 *   testID="action-bar"
 * />
 * ```
 */
export const ActionButtonBar: React.FC<ActionButtonBarProps> = ({
  primaryAction,
  secondaryAction,
  children,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {secondaryAction && (
        <SecondaryButton
          title={secondaryAction.label}
          icon={secondaryAction.icon as any}
          iconPosition="left"
          onPress={secondaryAction.onPress}
          disabled={secondaryAction.disabled}
          loading={secondaryAction.loading}
          testID={secondaryAction.testID || (testID ? `${testID}-secondary` : undefined)}
          style={styles.secondaryButton}
        />
      )}

      {children && <View style={styles.childrenContainer}>{children}</View>}

      <PrimaryButton
        title={primaryAction.label}
        icon={primaryAction.icon as any}
        iconPosition="left"
        onPress={primaryAction.onPress}
        disabled={primaryAction.disabled}
        loading={primaryAction.loading}
        testID={primaryAction.testID || (testID ? `${testID}-primary` : undefined)}
        style={styles.primaryButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginTop: SPACING[6],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  secondaryButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 2,
  },
  childrenContainer: {
    flex: 1,
  },
});

