/**
 * Loading Skeleton Component
 *
 * Displays skeleton placeholders for loading states.
 * Provides better UX than ActivityIndicator alone.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/infrastructure/theme/theme-context';
import { BORDER_RADIUS, SPACING } from '@/shared/constants/spacing';

export interface LoadingSkeletonProps {
  /**
   * Width of the skeleton (default: '100%')
   */
  width?: number | string;
  /**
   * Height of the skeleton
   */
  height: number;
  /**
   * Border radius (default: BORDER_RADIUS.md)
   */
  borderRadius?: number;
  /**
   * Custom style
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Loading Skeleton Component
 *
 * Shows an animated skeleton placeholder.
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height,
  borderRadius = BORDER_RADIUS.md,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer animation
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border.default,
          opacity,
        },
        style,
      ]}
      testID={testID}
    />
  );
};

/**
 * Card Skeleton Component
 *
 * Displays a skeleton placeholder for a card.
 */
export const CardSkeleton: React.FC<{ testID?: string }> = ({ testID }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.default,
        },
      ]}
      testID={testID}
    >
      <LoadingSkeleton width="60%" height={20} style={styles.titleSkeleton} />
      <LoadingSkeleton width="40%" height={16} style={styles.subtitleSkeleton} />
      <LoadingSkeleton width="100%" height={16} style={styles.lineSkeleton} />
      <LoadingSkeleton width="80%" height={16} style={styles.lineSkeleton} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    padding: SPACING[4],
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING[3],
    gap: SPACING[2],
  },
  titleSkeleton: {
    marginBottom: SPACING[2],
  },
  subtitleSkeleton: {
    marginBottom: SPACING[3],
  },
  lineSkeleton: {
    marginBottom: SPACING[1],
  },
});

