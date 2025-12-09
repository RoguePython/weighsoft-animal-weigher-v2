# Component Library - Build Order

**Purpose**: Reusable components built in priority order  
**Philosophy**: Build once, use everywhere

---

## Priority 1: Foundation (Week 1)

Build these FIRST - everything else depends on them.

### 1. Theme Provider & Hooks

**File**: `src/infrastructure/theme/theme-provider.tsx`

```typescript
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  
  const theme = useMemo(() => {
    const isDark = themeMode === 'system' ? colorScheme === 'dark' : themeMode === 'dark';
    return isDark ? darkTheme : lightTheme;
  }, [themeMode, colorScheme]);
  
  return <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
```

### 2. Base Typography Components

**File**: `src/presentation/components/typography/*.tsx`

```typescript
// Heading1, Heading2, BodyText, Caption, etc.
export const Heading1: React.FC<TextProps> = ({ children, style, ...props }) => {
  const { theme } = useTheme();
  return (
    <Text style={[TEXT_STYLES.h1, { color: theme.text.primary }, style]} {...props}>
      {children}
    </Text>
  );
};
```

**Components to build**:
- `<Heading1>` through `<Heading4>`
- `<BodyText>`, `<BodyTextSmall>`
- `<Caption>`, `<Label>`

---

## Priority 2: Basic UI (Week 1)

### 3. Button Components

**File**: `src/presentation/components/buttons/*.tsx`

```typescript
export const PrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  testID,
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? theme.interactive.primaryDisabled
            : theme.interactive.primary,
        },
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.text.inverse} />
      ) : (
        <Text style={[styles.buttonText, { color: theme.text.inverse }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
```

**Components to build**:
- `<PrimaryButton>`
- `<SecondaryButton>`
- `<IconButton>`
- `<TextButton>`

### 4. Card Component

```typescript
export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const { theme } = useTheme();
  
  const Wrapper = onPress ? TouchableOpacity : View;
  
  return (
    <Wrapper
      onPress={onPress}
      style={[
        {
          backgroundColor: theme.surface.default,
          borderRadius: BORDER_RADIUS.lg,
          padding: SPACING[4],
          borderWidth: 1,
          borderColor: theme.border.default,
        },
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
};
```

### 5. Loading & Empty States

```typescript
export const LoadingSpinner: React.FC = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" />
    <BodyText style={styles.loadingText}>Loading...</BodyText>
  </View>
);

export const EmptyState: React.FC<{ message: string; action?: () => void; actionLabel?: string }> = ({
  message,
  action,
  actionLabel,
}) => (
  <View style={styles.center}>
    <BodyText>{message}</BodyText>
    {action && <PrimaryButton title={actionLabel || 'Add'} onPress={action} />}
  </View>
);
```

---

## Priority 3: Form Components (Week 2)

### 6. Text Input

```typescript
export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  ...props
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container}>
      {label && <Label>{label}</Label>}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.text.tertiary}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface.default,
            borderColor: error ? theme.status.error : theme.border.default,
            color: theme.text.primary,
          },
        ]}
        {...props}
      />
      {error && <Caption style={{ color: theme.status.error }}>{error}</Caption>}
    </View>
  );
};
```

### 7. Searchable Dropdown (CRITICAL)

**File**: `src/presentation/components/form/searchable-select.tsx`

See Rule 32 for full implementation. This is one of our key differentiators!

```typescript
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  items,
  value,
  onValueChange,
  label,
  onQuickAdd,
  quickAddLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);
  
  // ... (see Rule 32 for complete implementation)
};
```

### 8. Quick Add Modal

```typescript
export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  onClose,
  onAdd,
  title,
  fields,
}) => {
  // Simple form modal for quick-adding items
  // Used with SearchableSelect when user wants to add new item
};
```

---

## Priority 4: List Components (Week 2)

### 9. List Item Components

```typescript
export const EntityListItem: React.FC<{ entity: Entity; onPress: () => void }> = ({
  entity,
  onPress,
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <Heading4>{entity.primary_tag}</Heading4>
        <Caption>{entity.species} • {entity.breed || 'Unknown'}</Caption>
      </View>
      <View style={styles.listItemRight}>
        <Icon name="chevron-right" color={theme.text.secondary} />
      </View>
    </TouchableOpacity>
  );
};

export const BatchListItem: React.FC<{ batch: Batch; onPress: () => void }> = ({
  batch,
  onPress,
}) => {
  // Similar pattern
};
```

### 10. FlatList with Search

```typescript
export const SearchableList: React.FC<SearchableListProps> = ({
  data,
  renderItem,
  onSearch,
  searchPlaceholder,
  emptyMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredData = useMemo(() => {
    return onSearch(data, searchQuery);
  }, [data, searchQuery, onSearch]);
  
  return (
    <View style={styles.container}>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={searchPlaceholder}
        leftIcon={<SearchIcon />}
      />
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={emptyMessage} />}
      />
    </View>
  );
};
```

---

## Priority 5: Domain-Specific Components (Week 3)

### 11. Weight Display

```typescript
export const WeightDisplay: React.FC<{ weight: number; unit?: string; size?: 'small' | 'large' }> = ({
  weight,
  unit = 'kg',
  size = 'large',
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.weightContainer}>
      <Text style={[styles.weight, size === 'large' && styles.weightLarge]}>
        {weight.toFixed(1)}
      </Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
};
```

### 12. Weight Loss Flag

```typescript
export const WeightLossFlag: React.FC<{ previousWeight: number; currentWeight: number }> = ({
  previousWeight,
  currentWeight,
}) => {
  const { theme } = useTheme();
  
  if (currentWeight >= previousWeight) return null;
  
  const loss = previousWeight - currentWeight;
  const lossPercent = ((loss / previousWeight) * 100).toFixed(1);
  
  return (
    <View style={[styles.flag, { backgroundColor: theme.status.warningBackground }]}>
      <Icon name="alert-triangle" color={theme.status.warning} size={16} />
      <Caption style={{ color: theme.status.warning }}>
        Weight Loss: {loss.toFixed(1)} kg ({lossPercent}%)
      </Caption>
    </View>
  );
};
```

### 13. Animal Card

```typescript
export const AnimalCard: React.FC<{ entity: Entity; lastWeight?: number; onPress: () => void }> = ({
  entity,
  lastWeight,
  onPress,
}) => {
  return (
    <Card onPress={onPress}>
      <View style={styles.cardHeader}>
        <Heading3>{entity.primary_tag}</Heading3>
        {entity.rfid_tag && <Caption>RFID: {entity.rfid_tag}</Caption>}
      </View>
      
      <View style={styles.cardBody}>
        <BodyText>{entity.species} • {entity.breed || 'Unknown'}</BodyText>
        {lastWeight && <WeightDisplay weight={lastWeight} />}
      </View>
      
      <View style={styles.cardFooter}>
        <Caption>Pen: {entity.current_group || 'N/A'}</Caption>
      </View>
    </Card>
  );
};
```

### 14. Batch Status Badge

```typescript
export const BatchStatusBadge: React.FC<{ status: BatchStatus }> = ({ status }) => {
  const { theme } = useTheme();
  
  const config = {
    Draft: { bg: theme.neutral.gray200, text: theme.text.secondary },
    Open: { bg: theme.status.infoBackground, text: theme.status.info },
    Closed: { bg: theme.status.successBackground, text: theme.status.success },
    Locked: { bg: theme.neutral.gray300, text: theme.text.primary },
  };
  
  return (
    <View style={[styles.badge, { backgroundColor: config[status].bg }]}>
      <Caption style={{ color: config[status].text }}>{status}</Caption>
    </View>
  );
};
```

---

## Priority 6: Screen Templates (Week 3)

### 15. Screen Container

```typescript
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  loading,
  error,
  onRetry,
}) => {
  const { theme } = useTheme();
  
  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <View style={styles.center}>
        <BodyText style={{ color: theme.status.error }}>{error}</BodyText>
        {onRetry && <SecondaryButton title="Retry" onPress={onRetry} />}
      </View>
    );
  }
  
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};
```

### 16. Header with Actions

```typescript
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  actions,
}) => {
  return (
    <View style={styles.header}>
      {onBack && (
        <IconButton icon="arrow-left" onPress={onBack} />
      )}
      <View style={styles.headerTitle}>
        <Heading2>{title}</Heading2>
        {subtitle && <Caption>{subtitle}</Caption>}
      </View>
      <View style={styles.headerActions}>
        {actions}
      </View>
    </View>
  );
};
```

---

## Component Testing Template

```typescript
// test/unit/presentation/components/button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '@/presentation/components/buttons/primary-button';

describe('PrimaryButton', () => {
  it('should render with title', () => {
    const { getByText } = render(<PrimaryButton title="Click Me" onPress={() => {}} />);
    expect(getByText('Click Me')).toBeTruthy();
  });
  
  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestID } = render(
      <PrimaryButton title="Click" onPress={onPress} testID="button" />
    );
    
    fireEvent.press(getByTestID('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByTestID } = render(
      <PrimaryButton title="Click" onPress={onPress} disabled testID="button" />
    );
    
    fireEvent.press(getByTestID('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
  
  it('should show loading indicator when loading', () => {
    const { queryByText, getByTestID } = render(
      <PrimaryButton title="Click" onPress={() => {}} loading testID="button" />
    );
    
    expect(queryByText('Click')).toBeNull();
    // ActivityIndicator should be present
  });
});
```

---

## Build Order Summary

### Week 1: Foundation
1. ✅ Theme Provider
2. ✅ Typography components
3. ✅ Buttons
4. ✅ Card
5. ✅ Loading & Empty states

### Week 2: Forms & Lists
6. ✅ Text Input
7. ✅ Searchable Select (CRITICAL)
8. ✅ Quick Add Modal
9. ✅ List Items
10. ✅ Searchable List

### Week 3: Domain Components
11. ✅ Weight Display
12. ✅ Weight Loss Flag
13. ✅ Animal Card
14. ✅ Batch Status Badge
15. ✅ Screen Container
16. ✅ Screen Header

**After Week 3**: You have everything needed to build any screen!

---

## Storybook (Optional but Recommended)

```bash
npm install -D @storybook/react-native

# Create stories for each component
// src/presentation/components/buttons/primary-button.stories.tsx
export default {
  title: 'Buttons/PrimaryButton',
  component: PrimaryButton,
};

export const Default = () => (
  <PrimaryButton title="Click Me" onPress={() => console.log('clicked')} />
);

export const Disabled = () => (
  <PrimaryButton title="Disabled" onPress={() => {}} disabled />
);

export const Loading = () => (
  <PrimaryButton title="Loading" onPress={() => {}} loading />
);
```

---

**Build components in this order for maximum productivity!** 🚀

