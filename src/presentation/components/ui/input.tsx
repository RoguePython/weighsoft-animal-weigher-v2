/**
 * Input Component Library
 *
 * Reusable input components following the design system.
 * Supports enhanced TextInput and specialized SearchInput.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

/**
 * Enhanced TextInput component props
 */
export interface TextInputProps extends RNTextInputProps {
  /**
   * Optional label text displayed above the input
   */
  label?: string;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Whether the input is required (adds asterisk to label)
   */
  required?: boolean;
  /**
   * Custom style for the container
   */
  containerStyle?: ViewStyle;
  /**
   * Custom style for the input
   */
  inputStyle?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
  /**
   * Padding size (default: SPACING[3])
   */
  padding?: keyof typeof SPACING;
}

/**
 * Enhanced TextInput Component
 *
 * A styled wrapper around React Native TextInput with label, error state,
 * and consistent theming.
 *
 * @example
 * ```tsx
 * <TextInput
 *   label="Animal Name"
 *   value={name}
 *   onChangeText={setName}
 *   placeholder="Enter animal name"
 *   error={errors.name}
 *   required
 *   testID="animal-name-input"
 * />
 * ```
 */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  required = false,
  containerStyle,
  inputStyle,
  testID,
  padding = 3,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const hasError = !!error;
  const borderColor = hasError ? theme.status.error : theme.border.default;

  return (
    <View style={[styles.container, containerStyle]} testID={testID ? `${testID}-container` : undefined}>
      {label && (
        <Text
          style={[TEXT_STYLES.label, { color: theme.text.primary, marginBottom: SPACING[2] }]}
          testID={testID ? `${testID}-label` : undefined}
        >
          {label} {required && <Text style={{ color: theme.status.error }}>*</Text>}
        </Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.background.secondary,
            borderColor,
            color: theme.text.primary,
            padding: SPACING[padding],
          },
          inputStyle,
          style,
        ]}
        placeholderTextColor={theme.text.tertiary}
        testID={testID}
        accessibilityLabel={label || props.placeholder}
        accessibilityHint={error}
        accessibilityState={{ invalid: hasError }}
        {...props}
      />
      {error && (
        <Text
          style={[TEXT_STYLES.caption, { color: theme.status.error, marginTop: SPACING[1] }]}
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

/**
 * SearchInput component props
 */
export interface SearchInputProps extends Omit<TextInputProps, 'label' | 'required'> {
  /**
   * Callback when clear button is pressed
   */
  onClear?: () => void;
  /**
   * Whether to show clear button (default: true when value is not empty)
   */
  showClearButton?: boolean;
  /**
   * Search icon size (default: 20)
   */
  iconSize?: number;
}

/**
 * SearchInput Component
 *
 * A specialized input for search functionality with search icon and clear button.
 * Extends TextInput with search-specific styling and behavior.
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search by tag, name, or breed..."
 *   onClear={() => setSearchQuery('')}
 *   testID="animal-search-input"
 * />
 * ```
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  showClearButton,
  iconSize = 20,
  containerStyle,
  inputStyle,
  testID,
  padding = 3,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const shouldShowClear = showClearButton !== undefined ? showClearButton : !!value && value.length > 0;

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('');
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={[styles.searchContainer, containerStyle]} testID={testID ? `${testID}-container` : undefined}>
      <View style={styles.searchInputWrapper}>
        <Ionicons
          name="search"
          size={iconSize}
          color={isFocused ? theme.text.primary : theme.text.tertiary}
          style={styles.searchIcon}
        />
        <RNTextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.background.secondary,
              borderColor: isFocused ? theme.border.focus : theme.border.default,
              color: theme.text.primary,
              paddingLeft: SPACING[10], // Space for icon
              paddingRight: shouldShowClear ? SPACING[10] : SPACING[padding], // Space for clear button
              paddingVertical: SPACING[padding],
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={theme.text.tertiary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          testID={testID}
          accessibilityLabel={props.placeholder || 'Search'}
          accessibilityRole="searchbox"
          {...props}
        />
        {shouldShowClear && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            testID={testID ? `${testID}-clear` : undefined}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" size={iconSize} color={theme.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    minHeight: SPACING[12], // 48pt minimum
    fontSize: 16,
    ...TEXT_STYLES.body,
  },
  searchContainer: {
    marginBottom: SPACING[4],
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: SPACING[3],
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    minHeight: SPACING[12], // 48pt minimum
    fontSize: 16,
    ...TEXT_STYLES.body,
  },
  clearButton: {
    position: 'absolute',
    right: SPACING[3],
    padding: SPACING[1],
    zIndex: 1,
  },
});

