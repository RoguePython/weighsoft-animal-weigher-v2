# Component Library Reference

**Last Updated**: December 19, 2024  
**Status**: Complete - All components documented

This document provides a complete reference for all UI components created during the UX redesign.

---

## Table of Contents

- [UI Components](#ui-components)
- [Presentation Components](#presentation-components)
- [Design System](#design-system)
- [Usage Guidelines](#usage-guidelines)

---

## UI Components

Base reusable components located in `src/presentation/components/ui/`.

### Buttons

#### PrimaryButton

Primary action button with theme colors and loading state.

**Location**: `src/presentation/components/ui/button.tsx`

**Props**:
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}
```

**Usage**:
```tsx
<PrimaryButton
  title="Save"
  onPress={handleSave}
  loading={saving}
  icon={<Ionicons name="checkmark" />}
  testID="save-button"
/>
```

**Features**:
- Theme-aware colors (primary, disabled states)
- Loading state with ActivityIndicator
- Icon support (left or right)
- Minimum 48pt touch target
- Full width option

---

#### SecondaryButton

Secondary action button with outlined style.

**Location**: `src/presentation/components/ui/button.tsx`

**Props**: Same as PrimaryButton

**Usage**:
```tsx
<SecondaryButton
  title="Cancel"
  onPress={handleCancel}
  icon={<Ionicons name="close" />}
/>
```

**Features**:
- Outlined style with theme border colors
- Same features as PrimaryButton

---

#### IconButton

Icon-only button for compact actions.

**Location**: `src/presentation/components/ui/button.tsx`

**Props**:
```typescript
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  disabled?: boolean;
  testID?: string;
}
```

**Usage**:
```tsx
<IconButton
  icon="close-outline"
  onPress={handleClose}
  size={24}
  testID="close-button"
/>
```

---

### Cards

#### Card

Base card component with variants.

**Location**: `src/presentation/components/ui/card.tsx`

**Props**:
```typescript
interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
  testID?: string;
}
```

**Usage**:
```tsx
<Card variant="outlined" onPress={handlePress}>
  <Text>Card content</Text>
</Card>
```

**Variants**:
- `default`: Standard card with background
- `elevated`: Card with shadow
- `outlined`: Card with border only

---

#### MetricCard

Card for displaying metrics (numbers with labels).

**Location**: `src/presentation/components/ui/card.tsx`

**Props**:
```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  testID?: string;
}
```

**Usage**:
```tsx
<MetricCard
  label="Active Animals"
  value={42}
  icon="paw-outline"
  onPress={handleViewAnimals}
/>
```

---

#### ActionCard

Card for quick actions with icon, title, and description.

**Location**: `src/presentation/components/ui/card.tsx`

**Props**:
```typescript
interface ActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  onPress: () => void;
  testID?: string;
}
```

**Usage**:
```tsx
<ActionCard
  icon="scale-outline"
  title="Start Weighing"
  description="Begin a new weighing session"
  onPress={handleStartWeighing}
/>
```

---

### Inputs

#### TextInput

Enhanced text input with label, error state, and validation.

**Location**: `src/presentation/components/ui/input.tsx`

**Props**:
```typescript
interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  padding?: keyof typeof SPACING;
  testID?: string;
}
```

**Usage**:
```tsx
<TextInput
  label="Animal Name"
  value={name}
  onChangeText={setName}
  placeholder="Enter animal name"
  error={errors.name}
  required
  testID="animal-name-input"
/>
```

**Features**:
- Label support
- Error state with red border and message
- Required field indicator
- Theme-aware colors
- Accessibility support

---

#### SearchInput

Specialized search input with search icon and clear button.

**Location**: `src/presentation/components/ui/input.tsx`

**Props**:
```typescript
interface SearchInputProps extends Omit<TextInputProps, 'label' | 'required'> {
  onClear?: () => void;
  showClearButton?: boolean;
}
```

**Usage**:
```tsx
<SearchInput
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search animals..."
  onClear={() => setSearchQuery('')}
  testID="search-input"
/>
```

**Features**:
- Search icon on left
- Clear button (X) when text entered
- Auto-focus support
- Theme-aware styling

---

### Empty States

#### EmptyState

Component for displaying empty states with icon, message, and optional CTA.

**Location**: `src/presentation/components/ui/empty-state.tsx`

**Props**:
```typescript
interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  message: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
    testID?: string;
  };
  style?: ViewStyle;
  testID?: string;
}
```

**Usage**:
```tsx
<EmptyState
  icon="paw-outline"
  message="No animals yet"
  description="Add your first animal to start tracking weights"
  action={{
    label: "Add Your First Animal",
    onPress: handleAddAnimal,
    testID: "empty-state-add-button"
  }}
  testID="animals-empty-state"
/>
```

**Features**:
- Contextual icons
- Helpful, specific messages
- Optional description
- Optional CTA button
- Theme-aware colors

---

### Loading States

#### LoadingState

Simple loading state with message.

**Location**: `src/presentation/components/ui/loading-state.tsx`

**Props**:
```typescript
interface LoadingStateProps {
  message?: string;
  testID?: string;
}
```

**Usage**:
```tsx
<LoadingState message="Loading animals..." testID="loading-animals" />
```

---

#### LoadingSkeleton

Animated shimmer placeholder for loading content.

**Location**: `src/presentation/components/ui/loading-skeleton.tsx`

**Props**:
```typescript
interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}
```

**Usage**:
```tsx
<LoadingSkeleton width="100%" height={100} borderRadius={8} />
```

---

#### CardSkeleton

Pre-built card-like skeleton for list items.

**Location**: `src/presentation/components/ui/loading-skeleton.tsx`

**Usage**:
```tsx
<CardSkeleton testID="card-skeleton" />
```

---

### Badges

#### StatusBadge

Color-coded status badge with variants.

**Location**: `src/presentation/components/ui/badge.tsx`

**Props**:
```typescript
interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  testID?: string;
}
```

**Usage**:
```tsx
<StatusBadge label="Active" variant="success" />
<StatusBadge label="Weight Loss" variant="warning" />
<StatusBadge label="Error" variant="error" />
```

**Variants**:
- `success`: Green (for positive states)
- `warning`: Amber (for warnings)
- `error`: Red (for errors)
- `info`: Blue (for informational)
- `neutral`: Gray (for neutral states)

---

### Feedback

#### SuccessToast

Temporary success message with animation.

**Location**: `src/presentation/components/ui/success-toast.tsx`

**Props**:
```typescript
interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  testID?: string;
}
```

**Usage**:
```tsx
<SuccessToast
  message="Transaction saved successfully"
  visible={showToast}
  onDismiss={() => setShowToast(false)}
  testID="success-toast"
/>
```

**Features**:
- Fade-in/scale animation
- Auto-dismiss after duration
- Checkmark icon
- Theme success color

---

## Presentation Components

Domain-specific components located in `src/presentation/components/`.

### AnimalCard

Card for displaying animal information with quick actions.

**Location**: `src/presentation/components/animal-card.tsx`

**Props**:
```typescript
interface AnimalCardProps {
  animal: Entity;
  onPress: () => void;
  onQuickWeigh?: () => void;
  onViewHistory?: () => void;
  onEdit?: () => void;
  showQuickActions?: boolean;
  testID?: string;
}
```

**Usage**:
```tsx
<AnimalCard
  animal={animal}
  onPress={() => router.push(`/entity-detail?entityId=${animal.entity_id}`)}
  onQuickWeigh={() => router.push(`/(tabs)/weigh?entityId=${animal.entity_id}`)}
  onViewHistory={() => router.push(`/entity-detail?entityId=${animal.entity_id}`)}
  onEdit={() => router.push(`/entity-setup?entityId=${animal.entity_id}`)}
  showQuickActions
  testID={`animal-card-${animal.entity_id}`}
/>
```

**Features**:
- Displays animal tag, name, RFID, breed, species, sex
- Status badge integration
- Quick action buttons (Quick Weigh, View History, Edit)
- Group information display

---

### SessionPicker

Horizontal scrollable picker for selecting weighing sessions.

**Location**: `src/presentation/components/session-picker.tsx`

**Props**:
```typescript
interface SessionPickerProps {
  sessions: Batch[];
  selectedSessionId?: string;
  onSelect: (session: Batch) => void;
  onCreateNew?: () => void;
  transactionCounts?: Map<string, number>;
  style?: ViewStyle;
  testID?: string;
}
```

**Usage**:
```tsx
<SessionPicker
  sessions={openBatches}
  selectedSessionId={selectedBatch?.batch_id}
  onSelect={handleBatchSelect}
  onCreateNew={() => router.push('/batch-setup')}
  transactionCounts={sessionTransactionCounts}
  testID="session-picker"
/>
```

**Features**:
- Horizontal scrollable list
- Selected state highlighting
- Transaction count display
- Create new session button
- Type badges

---

### PreviousWeightCard

Card displaying previous weight with change indicators.

**Location**: `src/presentation/components/previous-weight-card.tsx`

**Props**:
```typescript
interface PreviousWeightCardProps {
  previousWeight: number;
  currentWeight?: number;
  lastWeighDate: Date;
  testID?: string;
}
```

**Usage**:
```tsx
<PreviousWeightCard
  previousWeight={lastWeight}
  currentWeight={currentWeight}
  lastWeighDate={lastWeighDate}
  testID="previous-weight-card"
/>
```

**Features**:
- Previous weight display
- Weight change calculation (gain/loss)
- Percentage change
- Visual indicators (arrows, colors)
- Last weigh date

---

### DetailScreenHeader

Standardized header for detail screens.

**Location**: `src/presentation/components/detail-screen-header.tsx`

**Props**:
```typescript
interface DetailScreenHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    icon?: keyof typeof Ionicons.glyphMap;
    testID?: string;
  };
  testID?: string;
}
```

**Usage**:
```tsx
<DetailScreenHeader
  title="Bessie"
  subtitle="Holstein Cow • Active"
  action={{
    label: "Edit",
    onPress: handleEdit,
    variant: "secondary",
    icon: "create-outline",
    testID: "edit-button"
  }}
  testID="animal-detail-header"
/>
```

**Features**:
- Back button navigation
- Title and optional subtitle
- Optional action button (primary or secondary)
- Icon support
- Theme-aware styling

---

### DetailCard

Card for displaying information sections on detail screens.

**Location**: `src/presentation/components/detail-card.tsx`

**Props**:
```typescript
interface DetailCardProps {
  title: string;
  description?: string;
  items?: Array<{
    label: string;
    value: string;
    icon?: keyof typeof Ionicons.glyphMap;
    showAsBadge?: boolean;
    badgeVariant?: BadgeVariant;
  }>;
  children?: ReactNode;
  testID?: string;
}
```

**Usage**:
```tsx
<DetailCard
  title="Animal Information"
  items={[
    { label: 'Tag', value: animal.primary_tag, icon: 'pricetag-outline' },
    { label: 'Species', value: animal.species, icon: 'paw-outline' },
    { label: 'Status', value: animal.status, showAsBadge: true, badgeVariant: 'success' }
  ]}
  testID="animal-info-card"
/>
```

**Features**:
- Section title and description
- Key-value pairs with optional icons
- Badge support for status values
- Custom content support
- Consistent spacing and styling

---

### ActionButtonBar

Row of action buttons for detail screens.

**Location**: `src/presentation/components/action-button-bar.tsx`

**Props**:
```typescript
interface ActionButtonBarProps {
  primary?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    testID?: string;
  };
  secondary?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    testID?: string;
  };
  testID?: string;
}
```

**Usage**:
```tsx
<ActionButtonBar
  primary={{
    label: "Save",
    onPress: handleSave,
    loading: saving,
    testID: "save-button"
  }}
  secondary={{
    label: "Cancel",
    onPress: handleCancel,
    testID: "cancel-button"
  }}
  testID="action-buttons"
/>
```

**Features**:
- Primary and secondary button support
- Loading and disabled states
- Consistent spacing
- Full-width layout

---

## Design System

### Constants

All components use design system constants:

**Spacing**: `src/shared/constants/spacing.ts`
```typescript
SPACING[0]  // 0px
SPACING[1]  // 4px
SPACING[2]  // 8px
SPACING[3]  // 12px
SPACING[4]  // 16px
SPACING[6]  // 24px
SPACING[8]  // 32px
// etc.
```

**Typography**: `src/shared/constants/typography.ts`
```typescript
TEXT_STYLES.h1        // Heading 1
TEXT_STYLES.h2        // Heading 2
TEXT_STYLES.h3        // Heading 3
TEXT_STYLES.h4        // Heading 4
TEXT_STYLES.body      // Body text
TEXT_STYLES.bodySmall // Small body text
TEXT_STYLES.button    // Button text
TEXT_STYLES.caption   // Caption text
TEXT_STYLES.label     // Label text
```

**Border Radius**: `src/shared/constants/spacing.ts`
```typescript
BORDER_RADIUS.none  // 0
BORDER_RADIUS.sm    // 4px
BORDER_RADIUS.md    // 8px
BORDER_RADIUS.lg    // 12px
BORDER_RADIUS.xl    // 16px
BORDER_RADIUS.full  // 9999 (circular)
```

### Theme

All components use the theme system:

```typescript
const { theme } = useTheme();

// Colors
theme.background.primary
theme.background.secondary
theme.text.primary
theme.text.secondary
theme.interactive.primary
theme.status.success
theme.status.error
theme.border.default
```

See [Theme & Design System Rules](.cursor/rules/25-theming-design-system.mdc) for complete theme reference.

---

## Usage Guidelines

### When to Use Each Component

**PrimaryButton**: Main actions (Save, Submit, Create, etc.)  
**SecondaryButton**: Secondary actions (Cancel, Back, etc.)  
**IconButton**: Compact actions (Close, Edit, Delete icons)  
**Card**: Content containers, list items  
**MetricCard**: Dashboard metrics, statistics  
**ActionCard**: Quick actions, feature cards  
**TextInput**: Form inputs with labels  
**SearchInput**: Search functionality  
**EmptyState**: Empty lists, no data states  
**LoadingState**: Loading indicators  
**StatusBadge**: Status indicators, labels  
**SuccessToast**: Success feedback  

### Best Practices

1. **Always use theme**: Never hardcode colors
2. **Use constants**: Always use SPACING, TEXT_STYLES, BORDER_RADIUS
3. **Touch targets**: Minimum 44pt (SPACING[11]) for all interactive elements
4. **Test IDs**: Always provide testID for testing
5. **Accessibility**: Use accessibilityLabel and accessibilityHint
6. **Consistency**: Use components from library, don't create custom versions

### Import Pattern

```typescript
// UI Components
import { PrimaryButton, SecondaryButton, Card, EmptyState } from '@/presentation/components/ui';

// Presentation Components
import { AnimalCard, SessionPicker, DetailScreenHeader } from '@/presentation/components';

// Constants
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { TEXT_STYLES } from '@/shared/constants/typography';

// Theme
import { useTheme } from '@/infrastructure/theme/theme-context';
```

---

## Component Statistics

**Total Components**: 20+
- **UI Components**: 9 base components
- **Presentation Components**: 11+ domain-specific components

**Usage Across App**:
- Buttons: 26+ instances
- Cards: 166+ instances
- Empty States: 12+ instances
- Design Constants: 688+ instances

---

**For component implementation details, see source files in `src/presentation/components/`**

