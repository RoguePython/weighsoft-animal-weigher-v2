# AI Quick Reference - WeighsoftAnimalWeigherV2

**Purpose**: Single-page cheat sheet for AI assistants  
**Last Updated**: December 2024

---

## 🎯 Before Writing Any Code

### 1. Verify First (Rule 34)
```bash
# Check structure exists
list_dir("src/")

# Read relevant docs
read_file("docs/architecture/data-model.md")

# Search for patterns
grep("<term>", path="src/")
```

### 2. Check todo.md (Rule 01)
```bash
read_file("todo.md")
```

### 3. Understand layer (Rule 02)
- Domain: Business logic, NO external deps
- Data: Implements domain interfaces
- Presentation: Uses domain only

---

## 📁 File Naming (Rule 03)

| Type | Format | Example |
|------|--------|---------|
| Files | kebab-case.ts | `animal-repository.ts` |
| Components | PascalCase.tsx | `AnimalCard.tsx` |
| Interfaces | IPascalCase | `IAnimalRepository` |
| Tests | filename.test.ts | `animal.test.ts` |

---

## 📦 Import Order (Rule 11)

```typescript
// 1. React/React Native
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Third-party libraries
import { observer } from 'mobx-react-lite';

// 3. Domain layer (@/domain)
import { Animal } from '@/domain/entities/animal';

// 4. Other internal imports
import { container } from '@/infrastructure/di/container';

// 5. Relative imports
import { styles } from './styles';
```

---

## 🗄️ Database Quick Facts

### Tables (from docs/architecture/data-model.md)
- **entities** (not "animals") - Animal identity
- **batches** - Weighing sessions
- **transactions** (not "weight_records") - Individual weighs
- **custom_field_list_definitions** - CFL templates
- **images** - Photos linked to transactions

### Key Fields
```typescript
// Entity
entity_id, primary_tag, rfid_tag, species, breed, sex, status

// Transaction
tx_id, entity_id, batch_id, weight_kg, timestamp, operator_id

// Batch
batch_id, name, type, status, cfl_id
```

---

## 🏗️ Common Patterns

### Error Handling (Rule 09)
```typescript
// Use Result<T, E> pattern
import { Result } from '@/shared/utils/result';

function doSomething(): Result<Data, Error> {
  try {
    return Result.ok(data);
  } catch (error) {
    return Result.failure(new DomainError('Failed'));
  }
}
```

### Repository Pattern (Rule 02)
```typescript
// Domain: Interface
export interface IAnimalRepository {
  findById(id: string): Promise<Animal | null>;
}

// Data: Implementation
export class AnimalRepositoryImpl implements IAnimalRepository {
  async findById(id: string): Promise<Animal | null> {
    // SQLite implementation
  }
}
```

### ViewModel Pattern (Rule 18)
```typescript
export class AnimalListViewModel {
  @observable animals: Animal[] = [];
  @observable loading = false;
  @observable error: string | null = null;

  @action
  async loadAnimals() {
    this.loading = true;
    // Load data
    this.loading = false;
  }
}
```

---

## ✅ Quick Checks

Before committing code:
- [ ] Tests written (Rule 04)
- [ ] TypeScript strict mode (Rule 03)
- [ ] No `any` types (Rule 13)
- [ ] testID added to UI (Rule 07)
- [ ] Docs updated (Rule 08/33)
- [ ] APK builds (Rule 01)

---

## 🎨 Theme Usage (Rule 25)

```typescript
import { useTheme } from '@/infrastructure/theme/theme-context';

export const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background.primary }}>
      <Text style={{ color: theme.text.primary }}>
        Hello
      </Text>
    </View>
  );
};
```

---

## 🧪 Testing Patterns (Rule 04)

### Unit Test
```typescript
describe('Animal', () => {
  it('should create valid animal', () => {
    const animal = new Animal({
      entity_id: '123',
      primary_tag: 'A001',
      species: 'cattle'
    });
    
    expect(animal.primary_tag).toBe('A001');
  });
});
```

### E2E Test
```typescript
test('can add new animal', async ({ page }) => {
  await page.goto('/entities');
  await page.click('[data-testid="add-animal-button"]');
  await page.fill('[data-testid="tag-input"]', 'A001');
  await page.click('[data-testid="save-button"]');
  
  await expect(page.locator('text=A001')).toBeVisible();
});
```

---

## 🚨 Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| Import data in domain | Use dependency injection |
| Use `any` type | Use proper TypeScript types |
| Forget loading/error states | Always handle both |
| Skip tests | Write tests alongside code |
| Assume file structure | Use list_dir to verify |
| Guess table names | Read data-model.md |

---

## 📝 When Adding Features

### New Entity
1. Create `src/domain/entities/<name>.ts`
2. Create `src/domain/repositories/i-<name>-repository.ts`
3. Create `src/data/repositories/<name>-repository-impl.ts`
4. Add tests at each step
5. Update docs/architecture/data-model.md

### New Screen
1. Create `src/presentation/screens/<name>.screen.tsx`
2. Create `src/presentation/viewmodels/<name>.viewmodel.ts`
3. Add navigation types
4. Add to navigator
5. Add testID attributes
6. Create E2E test

### New Component
1. Check docs/setup/COMPONENT-LIBRARY.md for specs
2. Create in `src/presentation/components/<name>.tsx`
3. Use theme via useTheme()
4. Add testID
5. Write unit test
6. Export from index.ts

---

## 🔍 Finding Things

```bash
# Find all entities
glob_file_search("**/entities/*.ts")

# Find where Animal is used
grep("Animal", path="src/")

# Understand a feature
codebase_search("How does weight loss detection work?")

# Check database schema
read_file("docs/architecture/data-model.md")

# Find component exports
grep("export.*Component", path="src/presentation/components/")
```

---

## 🎯 Success Targets

| Metric | Target |
|--------|--------|
| Weighing speed | 3 sec/animal |
| Data entry errors | <2% |
| Test coverage | 80%+ |
| Build time | <5 min |
| App launch | <2 sec |

---

## 📚 Key Documents

| Doc | When to Read |
|-----|--------------|
| START-HERE.md | Before starting any work |
| PROJECT-BRIEF.md | To understand requirements |
| data-model.md | Before database work |
| AI-ASSISTANT-CONTEXT.md | For project overview |
| COMPONENT-LIBRARY.md | Before building UI |

---

## 🚀 Common Tasks

### Task: Add validation
1. Create validator in `src/domain/validators/`
2. Return `Result<T, ValidationError>`
3. Write tests
4. Use in use case

### Task: Add report
1. Check docs/reports/report-specifications.md
2. Create in `src/domain/usecases/reports/`
3. Use CSV format from spec
4. Add tests with sample data

### Task: Add permission check
1. Read docs/security/permissions.md
2. Use permission matrix
3. Implement in use case
4. Test all roles

---

## 🔧 When Things Break

### Build fails
```bash
# Check TypeScript
npm run type-check

# Check linting
npm run lint

# Check tests
npm test
```

### Database errors
```bash
# Verify schema
read_file("docs/architecture/data-model.md")

# Check migrations
list_dir("src/infrastructure/database/migrations/")

# Read latest migration
read_file("src/infrastructure/database/migrations/001_initial_schema.ts")
```

### Import errors
```bash
# Check if file exists
list_dir("src/domain/entities/")

# Verify export
grep("export.*Animal", path="src/domain/entities/animal.ts")

# Check path alias
read_file("tsconfig.json")
```

---

## 💡 Pro Tips

1. **Always verify before assuming** (Rule 34)
2. **Read data-model.md first** for database work
3. **Check COMPONENT-LIBRARY.md** before building UI
4. **Use Result<T, E>** instead of throwing errors
5. **Add testID** to everything for E2E tests
6. **Update todo.md** after completing tasks

---

## 🎨 Theme Quick Reference

```typescript
// Colors
theme.background.primary    // Main background
theme.background.secondary  // Card background
theme.text.primary          // Main text
theme.text.secondary        // Subdued text
theme.interactive.primary   // Button color
theme.border.default        // Border color
theme.status.success        // Success color
theme.status.error          // Error color

// Spacing (from SPACING constant)
SPACING[0]  // 0px
SPACING[1]  // 4px
SPACING[2]  // 8px
SPACING[4]  // 16px
SPACING[6]  // 24px

// Border Radius
BORDER_RADIUS.sm   // 4px
BORDER_RADIUS.md   // 8px
BORDER_RADIUS.lg   // 12px
```

---

**Remember**: Trust the system, verify the data, follow the patterns! 🚀

