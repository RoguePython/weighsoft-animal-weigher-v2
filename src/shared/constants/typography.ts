/**
 * Typography Constants
 * 
 * Font sizes, weights, and text styles used throughout the app.
 */

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const LINE_HEIGHTS = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const TEXT_STYLES = {
  h1: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.tight,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.tight,
  },
  h4: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
  },
  bodyLarge: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
  },
  body: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
  },
  button: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.tight,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.normal,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.tight,
  },
} as const;

