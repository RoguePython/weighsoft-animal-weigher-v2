/**
 * Haptic Feedback Utility
 *
 * Provides haptic feedback for user interactions.
 * Uses expo-haptics for iOS and Android.
 */

import * as Haptics from 'expo-haptics';

/**
 * Trigger haptic feedback for button press
 */
export async function hapticPress(): Promise<void> {
  try {
    const available = await Haptics.isAvailableAsync();
    if (available) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Trigger haptic feedback for successful action
 */
export async function hapticSuccess(): Promise<void> {
  try {
    const available = await Haptics.isAvailableAsync();
    if (available) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Trigger haptic feedback for error
 */
export async function hapticError(): Promise<void> {
  try {
    const available = await Haptics.isAvailableAsync();
    if (available) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Trigger haptic feedback for warning
 */
export async function hapticWarning(): Promise<void> {
  try {
    const available = await Haptics.isAvailableAsync();
    if (available) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  } catch (error) {
    // Silently fail if haptics not available
  }
}

