/**
 * Success Toast Component
 *
 * Displays a success message with animation.
 * Uses theme.status.success color and fade-in animation.
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

export interface SuccessToastProps {
  /**
   * Message to display
   */
  message: string;
  /**
   * Whether the toast is visible
   */
  visible: boolean;
  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;
  /**
   * Duration in milliseconds (default: 2000)
   */
  duration?: number;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Success Toast Component
 *
 * Shows a success message with fade-in animation.
 * Automatically hides after duration.
 */
export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  visible,
  onAnimationComplete,
  duration = 2000,
  testID,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Fade in and scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onAnimationComplete?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, duration, fadeAnim, scaleAnim, onAnimationComplete]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: theme.status.successBackground,
          borderColor: theme.status.success,
        },
      ]}
      testID={testID}
    >
      <Ionicons name="checkmark-circle" size={24} color={theme.status.success} />
      <Text style={[TEXT_STYLES.body, { color: theme.status.success, marginLeft: SPACING[2] }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING[12],
    left: SPACING[4],
    right: SPACING[4],
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});

