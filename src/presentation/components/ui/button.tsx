/**
 * Button Component Library
 *
 * Reusable button components following the design system.
 * Supports primary, secondary, and icon button variants.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

/**
 * Base button props shared by all button variants
 */
export interface BaseButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Whether the button is in a loading state
   */
  loading?: boolean;
  /**
   * Whether the button should take full width of container
   */
  fullWidth?: boolean;
  /**
   * Custom style to apply to the button container
   */
  style?: ViewStyle;
}

/**
 * Props for PrimaryButton and SecondaryButton
 */
export interface ButtonProps extends BaseButtonProps {
  /**
   * Button label text
   */
  title: string;
  /**
   * Icon name from Ionicons (optional)
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Icon position relative to text
   */
  iconPosition?: 'left' | 'right';
  /**
   * Icon size (default: 20)
   */
  iconSize?: number;
}

/**
 * Props for IconButton
 */
export interface IconButtonProps extends BaseButtonProps {
  /**
   * Icon name from Ionicons
   */
  icon: keyof typeof Ionicons.glyphMap;
  /**
   * Icon size (default: 24)
   */
  iconSize?: number;
  /**
   * Button size variant
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether button should be circular
   */
  circular?: boolean;
  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Primary Button Component
 *
 * Used for primary actions. Uses theme.interactive.primary background.
 *
 * @example
 * ```tsx
 * <PrimaryButton
 *   title="Save"
 *   onPress={handleSave}
 *   loading={saving}
 *   testID="save-button"
 * />
 * ```
 */
export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  icon,
  iconPosition = 'left',
  iconSize = 20,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID,
  ...props
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    backgroundColor: isDisabled ? theme.interactive.primaryDisabled : theme.interactive.primary,
    minHeight: SPACING[12], // 48pt minimum
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[5],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(fullWidth && { width: '100%' }),
    ...style,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.text.inverse} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={theme.text.inverse}
              style={{ marginRight: SPACING[2] }}
            />
          )}
          <Text style={[TEXT_STYLES.button, { color: theme.text.inverse }]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={theme.text.inverse}
              style={{ marginLeft: SPACING[2] }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * Secondary Button Component
 *
 * Used for secondary actions. Uses theme.interactive.secondary background.
 *
 * @example
 * ```tsx
 * <SecondaryButton
 *   title="Cancel"
 *   onPress={handleCancel}
 *   testID="cancel-button"
 * />
 * ```
 */
export const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  icon,
  iconPosition = 'left',
  iconSize = 20,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID,
  ...props
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    backgroundColor: theme.interactive.secondary,
    borderWidth: 1,
    borderColor: theme.border.default,
    minHeight: SPACING[12], // 48pt minimum
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[5],
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    opacity: isDisabled ? 0.5 : 1,
    ...(fullWidth && { width: '100%' }),
    ...style,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.text.primary} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={theme.text.primary}
              style={{ marginRight: SPACING[2] }}
            />
          )}
          <Text style={[TEXT_STYLES.button, { color: theme.text.primary }]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={theme.text.primary}
              style={{ marginLeft: SPACING[2] }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * Icon Button Component
 *
 * Used for icon-only actions. Supports different sizes and circular/square shapes.
 * Minimum touch target is 44pt for accessibility.
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon="trash-outline"
 *   onPress={handleDelete}
 *   size="medium"
 *   circular
 *   testID="delete-button"
 * />
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  iconSize = 24,
  size = 'medium',
  circular = false,
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
  ...props
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  // Size mappings
  const sizeMap = {
    small: {
      container: SPACING[11], // 44pt minimum for accessibility
      icon: 18,
      padding: SPACING[2],
    },
    medium: {
      container: SPACING[12], // 48pt
      icon: 24,
      padding: SPACING[3],
    },
    large: {
      container: SPACING[16], // 64pt
      icon: 32,
      padding: SPACING[4],
    },
  };

  const sizeConfig = sizeMap[size];
  const actualIconSize = iconSize || sizeConfig.icon;

  const buttonStyle: ViewStyle = {
    width: sizeConfig.container,
    height: sizeConfig.container,
    minWidth: sizeConfig.container,
    minHeight: sizeConfig.container,
    borderRadius: circular ? BORDER_RADIUS.full : BORDER_RADIUS.md,
    backgroundColor: theme.interactive.secondary,
    borderWidth: 1,
    borderColor: theme.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizeConfig.padding,
    opacity: isDisabled ? 0.5 : 1,
    ...style,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
      accessibilityLabel={accessibilityLabel || icon}
      accessibilityRole="button"
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.text.primary} size="small" />
      ) : (
        <Ionicons name={icon} size={actualIconSize} color={theme.text.primary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Styles are defined inline for better theme integration
});

