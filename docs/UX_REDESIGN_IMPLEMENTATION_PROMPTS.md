# UX Redesign Implementation Prompts

**Purpose**: Sequential prompts to implement the complete UX redesign from `UX_REDESIGN_PLAN.md`  
**Date**: December 2024  
**Status**: Ready for Execution

---

## How to Use This Document

Execute these prompts **in order**, one at a time. Wait for each prompt to complete before moving to the next. Each prompt is designed to be:
- ✅ Specific and actionable
- ✅ Incremental and reversible
- ✅ Following all project rules
- ✅ Testable and verifiable

---

## Pre-Implementation Checklist

Before starting, verify:
- [ ] All existing features work
- [ ] No uncommitted changes
- [ ] Backup/commit current state
- [ ] Read `UX_REDESIGN_PLAN.md` completely
- [ ] Understand the 3-phase approach

---

## PHASE 1: Navigation + Structure

### Prompt 1.1: Update Tab Layout to 4 Tabs

**Prompt**:
```
Update the tab navigation to consolidate from 7 tabs to 4 tabs as specified in UX_REDESIGN_PLAN.md Phase 1.

Requirements:
1. Modify app/(tabs)/_layout.tsx to show only 4 tabs:
   - Home (index.tsx) - new, will be created next
   - Weigh (rename from weighing.tsx)
   - Animals (keep existing)
   - More (new, will be created next)

2. Remove these tabs from the tab bar (but keep the files for later):
   - batches.tsx
   - sessions.tsx
   - custom-fields.tsx
   - history.tsx

3. Update tab icons:
   - Use standard iOS/Android tab bar style (not floating)
   - Use appropriate icons from expo-vector-icons
   - Home: home icon
   - Weigh: scale/weight icon
   - Animals: list/paw icon
   - More: more-horizontal/menu icon

4. Update tab labels to match new structure

5. Ensure tab bar follows standard iOS/Android patterns (not floating)

Follow all rules in .cursor/rules, especially:
- Use theme system from infrastructure/theme
- Use SPACING and BORDER_RADIUS constants
- Maintain TypeScript types
- Add testID attributes for E2E testing
```

**Verification**: 4 tabs visible, old tabs removed from bar, icons and labels correct

---

### Prompt 1.2: Create Home Tab (Dashboard)

**Prompt**:
```
Create the Home tab (app/(tabs)/index.tsx) that serves as the main dashboard.

Requirements:
1. Use the existing DashboardScreen from src/presentation/screens/dashboard.screen.tsx as the base

2. Enhance with quick action cards:
   - "Start Weighing" - navigates to weigh tab
   - "Add Animal" - navigates to entity-setup
   - "Create Session" - navigates to batch-setup

3. Display key metrics:
   - Total active animals
   - Open sessions count
   - Health alerts count
   - Recent weighs count

4. Show recent activity (last 5 transactions):
   - Animal name/tag
   - Weight
   - Date/time
   - Link to transaction detail

5. List open sessions with:
   - Session name
   - Session type
   - Animals weighed count
   - "Continue Weighing" button

6. Use theme system, SPACING constants, TEXT_STYLES
7. Add proper loading states
8. Add empty states with clear CTAs
9. Add testID attributes

Follow all project rules, especially:
- Clean architecture (use container for repositories)
- Use theme from useTheme hook
- Follow spacing and typography standards
- Add proper error handling
```

**Verification**: Home tab shows dashboard, quick actions work, metrics display correctly

---

### Prompt 1.3: Create More Menu Tab

**Prompt**:
```
Create the More menu tab (app/(tabs)/more.tsx) that organizes all secondary features.

Requirements:
1. Create a grid layout with sections:
   - Management Section:
     * Sessions (navigate to sessions list - create new screen if needed)
     * Batches/Groups (navigate to batches list)
     * Custom Fields (navigate to custom-fields list)
     * History (navigate to weighing-history)
   
   - Analytics Section:
     * Growth Tracking (navigate to growth-tracking if exists, or create)
     * Health Monitoring (navigate to health-monitoring if exists, or create)
     * Ready to Sell (navigate to ready-to-sell if exists, or create)
     * Feed Comparison (navigate to feed-comparison if exists, or create)
   
   - Settings Section:
     * Settings (placeholder for now)

2. Each menu item should have:
   - Icon (from expo-vector-icons)
   - Label
   - Optional badge/count (for alerts, etc.)
   - Touch target min 44pt

3. Use Card components for menu items
4. Organize in sections with section headers
5. Use theme system, SPACING, TEXT_STYLES
6. Add testID attributes

7. For screens that don't exist yet, create placeholder screens that show "Coming soon" or implement basic versions

Follow all project rules:
- Use theme system
- Follow spacing grid
- Maintain TypeScript types
- Add proper navigation using expo-router
```

**Verification**: More menu shows all items, navigation works, sections organized

---

### Prompt 1.4: Rename and Update Weigh Tab

**Prompt**:
```
Rename weighing.tsx to weigh.tsx and update it to simplify the weighing workflow.

Requirements:
1. Rename app/(tabs)/weighing.tsx to app/(tabs)/weigh.tsx
2. Update the tab reference in _layout.tsx

3. Simplify the workflow:
   - Remove the CFL selection step (use the session's CFL automatically)
   - Default to most recent open session if available
   - Show session picker at top (horizontal scroll or dropdown)
   - Direct to animal selection after session is chosen
   - Keep the existing weighing logic but streamline UI

4. Add session picker component (basic version, will be enhanced in Phase 2):
   - Show open sessions
   - Allow switching sessions
   - Display session info (name, type, animals weighed)

5. Improve animal selection:
   - Make search more prominent
   - Add "Quick Create" button near search
   - Show recent animals used in this session

6. Keep all existing functionality (weight input, custom fields, etc.)
7. Use theme system, SPACING, TEXT_STYLES
8. Add testID attributes

Follow all project rules:
- Maintain all existing business logic
- Use container for repositories
- Follow clean architecture
- Keep all validation logic
```

**Verification**: Weigh tab renamed, workflow simplified, all functionality preserved

---

### Prompt 1.5: Enhance Animals Tab

**Prompt**:
```
Enhance the Animals tab (app/(tabs)/animals.tsx) to improve UX while keeping all existing functionality.

Requirements:
1. Keep all existing functionality (search, create, edit, delete, assign to batch)

2. Improve visual hierarchy:
   - Use TEXT_STYLES for headings
   - Better spacing using SPACING constants
   - Improve card design (will be replaced with component in Phase 2)

3. Add quick action indicators on cards (prepare for Phase 2):
   - Add placeholder for "Quick Weigh" button
   - Add placeholder for "View History" button
   - These will be fully implemented in Phase 2

4. Improve empty state:
   - Better messaging
   - Clear CTA button
   - More helpful text

5. Ensure all navigation still works
6. Use theme system consistently
7. Add testID attributes

Follow all project rules:
- Maintain all existing features
- Use theme system
- Follow spacing and typography standards
- Keep all business logic intact
```

**Verification**: Animals tab enhanced, all features work, visual improvements visible

---

### Prompt 1.6: Verify Phase 1 Completion

**Prompt**:
```
Verify that Phase 1 is complete by checking all Definition of Done items:

1. Test that 4 tabs are visible and functional
2. Verify Home tab shows dashboard with quick actions
3. Verify More menu is accessible and all items navigate correctly
4. Verify all existing features are still accessible (no broken links)
5. Test navigation between all screens
6. Check that no features were removed (only reorganized)
7. Verify tab bar follows standard iOS/Android patterns

Create a checklist document listing:
- All navigation paths tested
- Any issues found
- Any features that need attention

If everything works, mark Phase 1 as complete and proceed to Phase 2.
If issues found, document them and fix before proceeding.
```

**Verification**: All Phase 1 items complete, navigation verified, ready for Phase 2

---

## PHASE 2: Key Screens Polish

### Prompt 2.1: Create UI Component Library - Buttons

**Prompt**:
```
Create the button component library as specified in UX_REDESIGN_PLAN.md Phase 2.

Requirements:
1. Create src/presentation/components/ui/button.tsx with:
   - PrimaryButton component
   - SecondaryButton component
   - IconButton component

2. PrimaryButton:
   - Uses theme.interactive.primary
   - Min height 48pt
   - Supports loading state
   - Supports disabled state
   - Supports icon prop
   - Supports fullWidth prop
   - Uses TEXT_STYLES.button for text
   - Uses BORDER_RADIUS.md
   - Uses SPACING constants for padding

3. SecondaryButton:
   - Uses theme.interactive.secondary
   - Same props as PrimaryButton
   - Different background color

4. IconButton:
   - Circular or square
   - Icon only
   - Min 44pt touch target
   - Supports different sizes

5. All buttons:
   - Use theme system
   - Support testID
   - Follow accessibility guidelines
   - Use proper TypeScript interfaces
   - Export from index file

6. Create src/presentation/components/ui/index.ts for exports

Follow all project rules:
- Use theme from useTheme hook
- Use SPACING and BORDER_RADIUS constants
- Use TEXT_STYLES for typography
- Follow TypeScript best practices
- Add JSDoc comments
```

**Verification**: Button components created, exported, follow design system

---

### Prompt 2.2: Create UI Component Library - Cards

**Prompt**:
```
Create the card component library as specified in UX_REDESIGN_PLAN.md Phase 2.

Requirements:
1. Create src/presentation/components/ui/card.tsx with:
   - Card component (base)
   - MetricCard component (for metrics)
   - ActionCard component (for quick actions)

2. Card component:
   - Uses theme.surface.default or theme.background.secondary
   - Rounded corners (BORDER_RADIUS.lg)
   - Padding using SPACING[4]
   - Optional border (theme.border.default)
   - Optional shadow (theme.shadow.medium)
   - Supports onPress (becomes TouchableOpacity)
   - Supports variant: 'default' | 'elevated' | 'outlined'
   - Uses SPACING constants

3. MetricCard:
   - Extends Card
   - Shows a metric value (large number)
   - Shows a label
   - Shows optional icon
   - Uses TEXT_STYLES for typography

4. ActionCard:
   - Extends Card
   - Shows an icon
   - Shows a title
   - Shows optional description
   - Has onPress handler
   - Uses theme colors

5. All cards:
   - Use theme system
   - Support testID
   - Follow spacing grid
   - Export from index

Follow all project rules:
- Use theme system
- Use SPACING and BORDER_RADIUS constants
- Use TEXT_STYLES
- Maintain TypeScript types
```

**Verification**: Card components created, variants work, theme applied

---

### Prompt 2.3: Create UI Component Library - Inputs

**Prompt**:
```
Create the input component library as specified in UX_REDESIGN_PLAN.md Phase 2.

Requirements:
1. Create src/presentation/components/ui/input.tsx with:
   - TextInput component (enhanced)
   - SearchInput component (specialized)

2. TextInput component:
   - Wraps React Native TextInput
   - Uses theme colors
   - Consistent border (theme.border.default)
   - Border radius (BORDER_RADIUS.md)
   - Padding using SPACING[3] or SPACING[4]
   - Min height 48pt
   - Supports label
   - Supports error state (red border, error message)
   - Supports placeholder
   - Uses TEXT_STYLES for text
   - Uses theme.text colors

3. SearchInput component:
   - Extends TextInput
   - Has search icon
   - Has clear button
   - Specialized styling for search

4. All inputs:
   - Use theme system
   - Support testID
   - Follow spacing grid
   - Export from index

Follow all project rules:
- Use theme system
- Use SPACING and BORDER_RADIUS constants
- Use TEXT_STYLES
- Maintain TypeScript types
- Support accessibility
```

**Verification**: Input components created, error states work, theme applied

---

### Prompt 2.4: Create UI Component Library - Empty States and Badges

**Prompt**:
```
Create empty state and badge components as specified in UX_REDESIGN_PLAN.md Phase 2.

Requirements:
1. Create src/presentation/components/ui/empty-state.tsx:
   - EmptyState component
   - Shows icon or illustration
   - Shows message
   - Shows optional CTA button
   - Centered layout
   - Uses theme colors
   - Uses TEXT_STYLES

2. Create src/presentation/components/ui/badge.tsx:
   - StatusBadge component
   - Shows status text (Active, Sold, etc.)
   - Uses theme.status colors
   - Rounded pill shape
   - Supports different variants (success, warning, error, info, neutral)

3. Create src/presentation/components/ui/loading-state.tsx:
   - LoadingState component
   - Shows loading spinner
   - Shows optional message
   - Uses theme colors

4. All components:
   - Use theme system
   - Support testID
   - Export from index
   - Follow spacing grid

Follow all project rules:
- Use theme system
- Use SPACING and BORDER_RADIUS constants
- Use TEXT_STYLES
- Maintain TypeScript types
```

**Verification**: Empty state, badge, and loading components created

---

### Prompt 2.5: Create AnimalCard Component

**Prompt**:
```
Create the AnimalCard component as specified in UX_REDESIGN_PLAN.md Phase 2.

Requirements:
1. Create src/presentation/components/animal-card.tsx:
   - AnimalCard component
   - Displays animal information (name, tag, breed, status)
   - Shows status badge
   - Supports quick actions:
     * Quick Weigh button
     * View History button
     * Edit button
   - Uses Card component from UI library
   - Uses StatusBadge component
   - Uses PrimaryButton/SecondaryButton for actions
   - Min height 64pt for touch target
   - Uses theme system
   - Uses SPACING and TEXT_STYLES

2. Props interface:
   - animal: Entity
   - onPress: () => void (navigate to detail)
   - onQuickWeigh?: () => void
   - onViewHistory?: () => void
   - onEdit?: () => void
   - showQuickActions?: boolean

3. Export from appropriate index file

4. Use theme system, SPACING, TEXT_STYLES, BORDER_RADIUS

Follow all project rules:
- Use theme system
- Use UI components created earlier
- Follow spacing and typography standards
- Maintain TypeScript types
- Add testID attributes
```

**Verification**: AnimalCard created, quick actions work, theme applied

---

### Prompt 2.6: Create SessionPicker Component

**Prompt**:
```
Create the SessionPicker component for the weighing workflow.

Requirements:
1. Create src/presentation/components/session-picker.tsx:
   - SessionPicker component
   - Shows open sessions in horizontal scroll or dropdown
   - Allows selecting a session
   - Shows session info (name, type, animals weighed count)
   - Highlights selected session
   - Uses Card component
   - Uses theme system
   - Uses SPACING and TEXT_STYLES

2. Props interface:
   - sessions: Batch[]
   - selectedSessionId?: string
   - onSelect: (session: Batch) => void
   - onCreateNew?: () => void

3. Display format:
   - Horizontal scrollable list OR
   - Dropdown picker
   - Each session shows: name, type badge, count

4. Export from appropriate index file

5. Use theme system, SPACING, TEXT_STYLES, BORDER_RADIUS

Follow all project rules:
- Use theme system
- Use UI components
- Follow spacing and typography standards
- Maintain TypeScript types
- Add testID attributes
```

**Verification**: SessionPicker created, selection works, theme applied

---

### Prompt 2.7: Redesign Weighing Screen with New Components

**Prompt**:
```
Redesign the weighing screen (app/(tabs)/weigh.tsx) using the new component library.

Requirements:
1. Replace custom buttons with PrimaryButton/SecondaryButton
2. Replace custom inputs with TextInput component
3. Add SessionPicker component at top
4. Enhance weight input:
   - Larger size (use fontSize 48 or larger)
   - More prominent styling
   - Better visual hierarchy
5. Add PreviousWeightCard component:
   - Shows previous weight prominently
   - Highlights weight changes
   - Shows date of last weigh
6. Improve animal selection:
   - Use SearchInput component
   - Better layout
   - Quick create button
7. Add "Weigh Next Animal" flow:
   - After saving, show option to weigh next animal
   - Pre-select same session
   - Clear weight input but keep session/animal if desired
8. Use all new UI components
9. Apply TEXT_STYLES throughout
10. Use SPACING constants consistently
11. Improve empty states with EmptyState component

Keep all existing functionality:
- Weight validation
- Custom fields
- Transaction creation
- Error handling

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
- Add testID attributes
```

**Verification**: Weighing screen redesigned, all components used, functionality preserved

---

### Prompt 2.8: Enhance Animals Screen with New Components

**Prompt**:
```
Enhance the Animals screen (app/(tabs)/animals.tsx) using the new component library.

Requirements:
1. Replace animal cards with AnimalCard component
2. Replace search input with SearchInput component
3. Replace buttons with PrimaryButton/SecondaryButton
4. Replace empty state with EmptyState component
5. Implement quick actions:
   - Quick Weigh button on each card
   - View History button on each card
   - Edit button (already exists, use new button component)
6. Add status badges using StatusBadge component
7. Improve visual hierarchy:
   - Use TEXT_STYLES for headings
   - Better spacing
   - Consistent card styling
8. Use Card components for sections
9. Apply TEXT_STYLES throughout
10. Use SPACING constants consistently

Keep all existing functionality:
- Search
- Create animal
- Edit animal
- Delete animal
- Assign to batch
- Navigation to detail

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
- Add testID attributes
```

**Verification**: Animals screen enhanced, new components used, all features work

---

### Prompt 2.9: Standardize Detail Screens

**Prompt**:
```
Standardize all detail screens to use consistent patterns and new components.

Requirements:
1. Create DetailScreenHeader component:
   - Back button
   - Title
   - Optional action button
   - Uses theme system
   - Uses TEXT_STYLES

2. Create DetailCard component:
   - Consistent card layout
   - Section headers
   - Key-value pairs
   - Uses theme system

3. Create ActionButtonBar component:
   - Bottom action buttons
   - Consistent spacing
   - Uses PrimaryButton/SecondaryButton

4. Update these detail screens:
   - app/entity-detail.tsx
   - app/session-detail.tsx
   - app/transaction-detail.tsx
   - app/group-detail.tsx
   - app/entity-setup.tsx
   - app/group-setup.tsx
   - app/custom-field-list-setup.tsx

5. For each screen:
   - Use DetailScreenHeader
   - Use DetailCard for information sections
   - Use ActionButtonBar for actions
   - Use new UI components throughout
   - Apply TEXT_STYLES
   - Use SPACING constants
   - Improve loading states

Keep all existing functionality:
- All CRUD operations
- All validation
- All navigation
- All business logic

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
- Add testID attributes
```

**Verification**: Detail screens standardized, consistent patterns, all features work

---

### Prompt 2.10: Verify Phase 2 Completion

**Prompt**:
```
Verify that Phase 2 is complete by checking all Definition of Done items:

1. All UI components created and documented
2. Weighing screen redesigned with new components
3. Animals screen enhanced with new components
4. Detail screens consistent and using new components
5. All screens use new components (no old custom styles)
6. Visual design consistent across app
7. Spacing uses SPACING constants
8. Typography uses TEXT_STYLES
9. Touch targets meet 44pt minimum
10. Theme system used consistently

Create a checklist document listing:
- All components created
- All screens updated
- Any inconsistencies found
- Any components that need refinement

If everything works, mark Phase 2 as complete and proceed to Phase 3.
If issues found, document them and fix before proceeding.
```

**Verification**: All Phase 2 items complete, components working, ready for Phase 3

---

## PHASE 3: Secondary Screens + Consistency

### Prompt 3.1: Update Sessions List Screen (in More Menu)

**Prompt**:
```
Update the Sessions list screen to be accessible from More menu and use new components.

Requirements:
1. If sessions list doesn't exist as standalone screen, create app/sessions-list.tsx
2. If it exists, update it to use new component library

3. Use new components:
   - Card components for session items
   - PrimaryButton/SecondaryButton for actions
   - SearchInput for search
   - EmptyState for empty state
   - StatusBadge for session status

4. Display sessions with:
   - Session name
   - Session type
   - Status (Open, Closed, etc.)
   - Animals weighed count
   - Date created
   - Actions: View, Edit, Continue Weighing

5. Apply TEXT_STYLES throughout
6. Use SPACING constants
7. Use theme system
8. Add testID attributes

9. Ensure navigation from More menu works
10. Keep all existing functionality

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
```

**Verification**: Sessions list updated, accessible from More menu, uses new components

---

### Prompt 3.2: Update Batches/Groups List Screen (in More Menu)

**Prompt**:
```
Update the Batches/Groups list screen (app/(tabs)/batches.tsx or create new) to be accessible from More menu and use new components.

Requirements:
1. Create or update app/batches-list.tsx (or use existing batches.tsx)
2. Make it accessible from More menu

3. Use new components:
   - Card components for group items
   - PrimaryButton/SecondaryButton for actions
   - SearchInput for search
   - EmptyState for empty state

4. Display groups with:
   - Group name
   - Description
   - Animal count
   - Actions: View, Edit, Add Animals

5. Apply TEXT_STYLES throughout
6. Use SPACING constants
7. Use theme system
8. Add testID attributes

9. Ensure navigation from More menu works
10. Keep all existing functionality

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
```

**Verification**: Batches/Groups list updated, accessible from More menu, uses new components

---

### Prompt 3.3: Update Custom Fields List Screen (in More Menu)

**Prompt**:
```
Update the Custom Fields list screen (app/(tabs)/custom-fields.tsx) to be accessible from More menu and use new components.

Requirements:
1. Update app/(tabs)/custom-fields.tsx or create app/custom-fields-list.tsx
2. Make it accessible from More menu

3. Use new components:
   - Card components for CFL items
   - PrimaryButton/SecondaryButton for actions
   - SearchInput for search
   - EmptyState for empty state
   - StatusBadge for system default indicator

4. Display CFLs with:
   - CFL name
   - Session types
   - Field count
   - System default badge (if applicable)
   - Actions: View, Edit, Delete

5. Apply TEXT_STYLES throughout
6. Use SPACING constants
7. Use theme system
8. Add testID attributes

9. Ensure navigation from More menu works
10. Keep all existing functionality

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
```

**Verification**: Custom Fields list updated, accessible from More menu, uses new components

---

### Prompt 3.4: Update History Screen (in More Menu)

**Prompt**:
```
Update the History screen (app/weighing-history.tsx) to use new components and be accessible from More menu.

Requirements:
1. Update app/weighing-history.tsx

2. Use new components:
   - Card components for transaction items
   - PrimaryButton/SecondaryButton for actions
   - SearchInput for search/filter
   - EmptyState for empty state
   - StatusBadge for weight loss indicators

3. Improve layout:
   - Better visual hierarchy
   - Clearer transaction cards
   - Better filter UI
   - Improved export button

4. Apply TEXT_STYLES throughout
5. Use SPACING constants
6. Use theme system
7. Add testID attributes

8. Ensure navigation from More menu works
9. Keep all existing functionality (search, filter, export)

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
```

**Verification**: History screen updated, uses new components, all features work

---

### Prompt 3.5: Update Analytics Screens (Growth, Health, Ready to Sell, Feed Comparison)

**Prompt**:
```
Update all analytics screens to use new components and be accessible from More menu.

Requirements:
1. For each analytics screen that exists:
   - app/growth-tracking.tsx (or create if doesn't exist)
   - app/health-monitoring.tsx (or create if doesn't exist)
   - app/ready-to-sell.tsx (or create if doesn't exist)
   - app/feed-comparison.tsx (or create if doesn't exist)

2. For each screen:
   - Use new component library (Card, Button, Input, Badge, etc.)
   - Apply TEXT_STYLES throughout
   - Use SPACING constants
   - Use theme system
   - Add testID attributes
   - Improve empty states
   - Better visual hierarchy

3. If screens don't exist, create basic versions that:
   - Show "Coming soon" or basic implementation
   - Use new components
   - Follow design system
   - Are accessible from More menu

4. Ensure all screens are accessible from More menu
5. Keep all existing functionality

Follow all project rules:
- Use new component library
- Use theme system
- Follow spacing and typography standards
- Maintain all business logic
```

**Verification**: Analytics screens updated/created, accessible from More menu, use new components

---

### Prompt 3.6: Add Micro-Interactions

**Prompt**:
```
Add micro-interactions and animations to improve user feedback.

Requirements:
1. Add success animations:
   - After saving a transaction, show success feedback
   - After creating an animal, show success feedback
   - Use theme.status.success color
   - Simple fade-in or scale animation

2. Improve loading states:
   - Replace ActivityIndicator with loading skeletons where appropriate
   - Show skeleton placeholders for cards
   - Better loading messages

3. Add pull-to-refresh:
   - On list screens (Animals, Sessions, History, etc.)
   - Use RefreshControl from React Native
   - Show refresh indicator

4. Add haptic feedback (if available):
   - On button presses
   - On successful actions
   - Use HapticTab pattern if exists

5. Add smooth transitions:
   - Screen transitions
   - Card animations
   - List item animations

6. Keep animations subtle and performant
7. Use React Native Animated API or react-native-reanimated if available

Follow all project rules:
- Don't break existing functionality
- Keep animations performant
- Use theme system
- Test on both iOS and Android
```

**Verification**: Micro-interactions added, animations smooth, feedback clear

---

### Prompt 3.7: Final Consistency Pass - Spacing and Typography

**Prompt**:
```
Perform final consistency pass to ensure all screens use SPACING constants and TEXT_STYLES.

Requirements:
1. Search codebase for hardcoded spacing values:
   - Find all fontSize values that aren't from TEXT_STYLES
   - Find all padding/margin values that aren't from SPACING
   - Find all borderRadius values that aren't from BORDER_RADIUS

2. Replace all hardcoded values with constants:
   - Replace fontSize with TEXT_STYLES
   - Replace spacing with SPACING constants
   - Replace borderRadius with BORDER_RADIUS constants

3. Verify touch targets:
   - All buttons min 44pt height
   - All touchable areas meet minimum
   - Check all interactive elements

4. Verify color usage:
   - All colors from theme system
   - No hardcoded colors
   - Status colors used consistently

5. Create a report of:
   - Files updated
   - Values replaced
   - Any remaining hardcoded values (with justification)

Follow all project rules:
- Use SPACING constants
- Use TEXT_STYLES
- Use BORDER_RADIUS constants
- Use theme system
- Maintain TypeScript types
```

**Verification**: All spacing and typography consistent, no hardcoded values

---

### Prompt 3.8: Improve All Empty States

**Prompt**:
```
Improve all empty states across the app with better messaging, icons, and CTAs.

Requirements:
1. Find all empty states in the app:
   - Animals list
   - Sessions list
   - Groups list
   - Custom fields list
   - History
   - Detail screens
   - Weighing screen

2. For each empty state:
   - Use EmptyState component
   - Add appropriate icon or illustration
   - Write helpful, specific message
   - Add clear CTA button
   - Use theme colors
   - Use TEXT_STYLES

3. Empty state messages should:
   - Be specific to the context
   - Explain what the user can do
   - Be encouraging, not negative
   - Include actionable next steps

4. Icons should:
   - Be from expo-vector-icons
   - Match the context
   - Use theme colors
   - Appropriate size

5. CTA buttons should:
   - Use PrimaryButton
   - Have clear labels
   - Navigate to appropriate action

Follow all project rules:
- Use EmptyState component
- Use theme system
- Use TEXT_STYLES
- Use SPACING constants
- Maintain consistency
```

**Verification**: All empty states improved, consistent, helpful

---

### Prompt 3.9: Final Testing and Verification

**Prompt**:
```
Perform final testing and verification of the complete redesign.

Requirements:
1. Test all navigation paths:
   - All tabs work
   - All More menu items navigate correctly
   - All detail screens accessible
   - All quick actions work
   - Back navigation works

2. Test all features:
   - Create animal
   - Edit animal
   - Delete animal
   - Create session
   - Weigh animal
   - View history
   - Export data
   - All CRUD operations

3. Test visual consistency:
   - All screens use new components
   - Spacing is consistent
   - Typography is consistent
   - Colors are from theme
   - Touch targets meet minimums

4. Test on both platforms:
   - iOS (if available)
   - Android
   - Web (if applicable)

5. Create final checklist:
   - All Phase 3 Definition of Done items
   - All features working
   - All screens consistent
   - All navigation working
   - Any remaining issues

6. Document any known issues or future improvements

Follow all project rules:
- Test thoroughly
- Document findings
- Fix any critical issues
- Note any non-critical improvements for future
```

**Verification**: All testing complete, all features work, redesign complete

---

### Prompt 3.10: Update Documentation

**Prompt**:
```
Update project documentation to reflect the redesign.

Requirements:
1. Update README.md:
   - Update screenshots section (if applicable)
   - Update navigation description
   - Update feature descriptions

2. Update UX_REDESIGN_PLAN.md:
   - Mark as "Completed"
   - Add completion date
   - Note any deviations from plan
   - Document lessons learned

3. Create or update component documentation:
   - Document all new UI components
   - Usage examples
   - Props interfaces
   - Design guidelines

4. Update any architecture docs if navigation structure changed significantly

5. Update setup/development docs if needed

Follow all project rules:
- Follow documentation standards
- Keep docs up to date
- Link to relevant docs
- Don't duplicate content
```

**Verification**: Documentation updated, reflects current state

---

## Post-Implementation Checklist

After completing all prompts, verify:

- [ ] All 4 tabs visible and functional
- [ ] Home dashboard shows metrics and quick actions
- [ ] More menu accessible to all secondary features
- [ ] All existing features still work
- [ ] All screens use new component library
- [ ] Spacing and typography consistent
- [ ] Touch targets meet minimums
- [ ] Theme system used throughout
- [ ] No broken navigation
- [ ] All empty states improved
- [ ] Micro-interactions added
- [ ] Documentation updated
- [ ] APK builds successfully (if applicable)
- [ ] No linter errors
- [ ] TypeScript compiles without errors

---

## Notes

- Execute prompts **one at a time**
- Wait for each to complete before proceeding
- Test after each major change
- Commit after each phase
- If a prompt fails, fix issues before proceeding
- Adjust prompts if needed based on actual codebase structure

---

**End of Implementation Prompts**

