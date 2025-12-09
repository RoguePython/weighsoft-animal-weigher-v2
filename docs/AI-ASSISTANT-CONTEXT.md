# AI Assistant Context - WeighsoftAnimalWeigherV2

**Purpose**: This document helps AI assistants (and new developers) understand the project quickly.  
**Last Updated**: December 2024

---

## 🎯 Project Summary (30-Second Version)

**What**: Professional animal weighing app for feedlots, farms, auction houses  
**Goal**: Make faster, smarter decisions about animal performance, health, and sales  
**Platforms**: Android + Web (React Native + Expo)  
**Architecture**: Clean Architecture with SOLID principles  
**Database**: SQLite (mobile), IndexedDB (web)

**Key Differentiator**: RFID-first with searchable dropdowns and quick-add everywhere.

---

## 🧠 Mental Model - How This App Works

### The Core Flow
```
1. Create BATCH (e.g., "Pen 7 Monthly Weigh")
   ↓
2. IDENTIFY animal (RFID scan OR select from list OR manual entry)
   ↓
3. VIEW HISTORY (last weights, growth curve, alerts)
   ↓
4. CAPTURE weight + metadata (custom fields from batch's CFL)
   ↓
5. TRANSACTION created (immutable snapshot)
   ↓
6. Repeat for next animal in batch
   ↓
7. CLOSE batch (generates reports)
```

### Three Core Entities

**Entity (Animal)**
- Persistent identity across all weighs
- Has: RFID (optional), tag, species, breed, sex, status
- Lives forever (or until marked Sold/Dead/Culled)

**Batch (Weighing Session)**
- Temporary grouping of weigh events
- Has: name, type (Arrival/Routine/Shipment), Custom Field List
- Lifecycle: Draft → Open → Closed → Locked

**Transaction (Single Weigh)**
- One animal, one weight, one moment in time
- IMMUTABLE once saved (for audit trail)
- Stores snapshot of custom fields (historical integrity)

---

## 🚨 Critical Design Decisions

### 1. Core Fields vs Custom Fields

**WRONG Thinking**: "Let's make everything custom fields for flexibility"

**RIGHT Thinking**:
- **Core fields** (in schema): RFID, tag, species, breed, sex → used in 80%+ of queries
- **Custom fields** (JSON): Client-specific data like contract IDs, exporter codes → optional metadata

**Why**: Performance (indexed queries), type safety, stable API contracts

**File**: `docs/architecture/decisions/001-data-model-core-vs-custom-fields.md`

### 2. Ship with Defaults

**WRONG Thinking**: "Let users design their own data model upfront"

**RIGHT Thinking**:
- Ship 3 pre-configured Custom Field Lists
- Users can weigh immediately (5 min to first value)
- Advanced users can customize later

**Why**: 95% reduction in time-to-first-value, 70% of users never customize

**File**: `docs/architecture/decisions/002-default-custom-field-lists.md`

### 3. RFID as Optional First-Class Identity

**UPDATED** (per user clarification):
- RFID is **optional** (can be switched off completely)
- When enabled: RFID-first workflow (2 sec/animal)
- When disabled: Select from dropdown OR manual entry (10-15 sec/animal)
- Both workflows are first-class citizens

**Why**: 
- With RFID: 85% speed improvement
- Without RFID: Still better UX than competitors

**File**: `docs/architecture/decisions/003-rfid-first-class-identity.md`

---

## ⚙️ Optional Features (User Configurable)

### 1. ✅ Images - OPTIONAL
- **Default**: Images are NOT required
- **Config**: User can choose:
  - Never capture images
  - Optional per transaction
  - Required for specific batch types
- **Storage**: Only save when explicitly captured
- **Future**: AI body condition scoring

### 2. ✅ Custom Fields - OPTIONAL
- **Default**: 3 system CFLs with sensible defaults
- **Config**: User can:
  - Use defaults as-is (70% of users)
  - Clone and modify (20% of users)
  - Create from scratch (10% power users)
- **Required**: At minimum, batch must have a CFL (even if empty)

### 3. ✅ RFID - OPTIONAL
- **Default**: RFID enabled if hardware detected
- **Config**: User can:
  - Switch RFID completely off
  - Use hybrid mode (RFID + manual)
  - RFID-only (reject manual entry)
- **Fallback**: Always support manual ID selection/entry

---

## 🗂️ File Structure (What Lives Where)

### Domain Layer (Business Logic - ZERO external dependencies)
```
src/domain/
├── entities/           # Animal, WeightRecord (pure data)
├── repositories/       # Interfaces only (no implementations!)
├── usecases/          # Business rules (CreateWeighingTransaction)
├── value-objects/     # Weight, RFID, Tag (with validation)
└── exceptions/        # Domain-specific errors
```

### Data Layer (Persistence)
```
src/data/
├── repositories/      # Repository implementations (SQLite)
├── datasources/       # Local DB, remote API (future)
├── dtos/             # Data Transfer Objects
└── mappers/          # Entity ↔ DTO conversion
```

### Presentation Layer (UI)
```
src/presentation/
├── screens/          # Full-screen views (AnimalListScreen)
├── components/       # Reusable UI (SearchableSelect, Card)
├── viewmodels/       # MobX ViewModels (screen state)
└── navigation/       # React Navigation setup
```

### Infrastructure Layer (External Services)
```
src/infrastructure/
├── di/              # Dependency Injection container
├── database/        # SQLite setup, migrations
├── rfid/           # RFID reader integration
├── theme/          # ThemeProvider, colors
├── i18n/           # Translations
└── logging/        # Winston logger
```

---

## 🔍 Common Implementation Patterns

### Pattern 1: Adding a New Entity

```typescript
// 1. Domain entity (src/domain/entities/location.ts)
export interface Location {
  location_id: string;
  name: string;
  type: 'Yard' | 'Pen' | 'Paddock';
  capacity?: number;
}

// 2. Repository interface (src/domain/repositories/location.repository.ts)
export interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
  findAll(): Promise<Location[]>;
  create(location: Location): Promise<Location>;
}

// 3. Repository implementation (src/data/repositories/location.repository.ts)
export class LocationRepository implements ILocationRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async findById(id: string): Promise<Location | null> {
    const row = await this.db.getFirstAsync(
      'SELECT * FROM locations WHERE location_id = ?',
      [id]
    );
    return row ? this.mapToEntity(row) : null;
  }
}

// 4. Register in DI container (src/infrastructure/di/container.ts)
container.register('LocationRepository', () => new LocationRepository(db));

// 5. Use in ViewModel (src/presentation/viewmodels/location-list.viewmodel.ts)
export class LocationListViewModel {
  constructor(private locationRepo: ILocationRepository) {}
  
  async loadLocations() {
    this.locations = await this.locationRepo.findAll();
  }
}
```

### Pattern 2: Searchable Dropdown with Quick Add

```typescript
// From Rule 32: UI Component Patterns
<SearchableSelect
  label="Species"
  items={speciesList}
  value={selectedSpecies}
  onValueChange={setSelectedSpecies}
  onQuickAdd={handleQuickAddSpecies}  // Optional!
  quickAddLabel="Add New Species"
/>

// Implementation
const handleQuickAddSpecies = async () => {
  const newSpecies = await showQuickAddModal();
  await speciesRepository.create(newSpecies);
  setSpeciesList([...speciesList, newSpecies]);
  setSelectedSpecies(newSpecies.value); // Auto-select
};
```

### Pattern 3: RFID Detection with Fallback

```typescript
// Flexible identity resolution
async function identifyAnimal(): Promise<Entity> {
  const settings = await settingsRepository.getSettings();
  
  if (settings.rfidEnabled) {
    // Try RFID first
    const rfid = await rfidService.readTag({ timeout: 2000 });
    if (rfid) {
      return await entityRepository.findByRFID(rfid);
    }
  }
  
  // Fallback: searchable dropdown
  return await showEntitySearchModal();
}
```

---

## 🎨 Design System Quick Reference

### Colors (Business Professional)
```typescript
// Light Mode
primary: '#1976D2'      // Professional blue
success: '#2E7D32'      // Green
error: '#C62828'        // Red
background: '#FFFFFF'
text: '#212121'

// Dark Mode
primary: '#1E88E5'
success: '#66BB6A'
error: '#EF5350'
background: '#121212'
text: '#FFFFFF'
```

### Spacing
```typescript
SPACING = {
  1: 4px,   // Tiny
  2: 8px,   // Small
  3: 12px,  // Medium-small
  4: 16px,  // Medium (default)
  6: 24px,  // Large
  8: 32px,  // X-Large
}
```

### Typography
```typescript
// Headings
h1: 30px, bold
h2: 24px, bold
h3: 20px, semibold
h4: 18px, semibold

// Body
body: 16px, regular
bodySmall: 14px, regular
caption: 12px, regular
```

---

## 📊 Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| **Weigh Speed (RFID)** | 3 sec/animal | 200 animals in 10 min |
| **Weigh Speed (Manual)** | 15 sec/animal | Acceptable fallback |
| **History Load** | <200ms | Instant feedback |
| **Batch Open** | <500ms | No perceived lag |
| **Search Results** | <100ms | Real-time feel |
| **Database Query** | <50ms | Core field queries |
| **APK Size** | <30MB | Fast download |

---

## 🧪 Testing Strategy

### Unit Tests (80%+ coverage on domain layer)
```typescript
// Test business logic in isolation
describe('WeightValidator', () => {
  it('should reject negative weights', () => {
    const result = WeightValidator.validate(-10);
    expect(result.isFailure).toBe(true);
  });
});
```

### Integration Tests (Repository + Database)
```typescript
describe('EntityRepository', () => {
  it('should enforce unique RFID per tenant', async () => {
    await repo.create({ rfid_tag: 'RFID123', ... });
    await expect(
      repo.create({ rfid_tag: 'RFID123', ... })
    ).rejects.toThrow('Duplicate RFID');
  });
});
```

### E2E Tests (Playwright - Critical Flows)
```typescript
test('complete weighing session', async ({ page }) => {
  // 1. Create batch
  await page.click('[data-testid="create-batch-button"]');
  
  // 2. Scan RFID
  await mockRFIDScan('RFID123');
  
  // 3. Enter weight
  await page.fill('[data-testid="weight-input"]', '450.5');
  
  // 4. Save
  await page.click('[data-testid="save-transaction-button"]');
  
  // 5. Verify
  await expect(page.locator('[data-testid="transaction-list"]'))
    .toContainText('450.5 kg');
});
```

---

## 🚨 Common Pitfalls (Learn from ChatGPT Conversation)

### ❌ DON'T: Put everything in custom fields
```typescript
// BAD
custom_fields: {
  species: 'cattle',
  rfid: 'RFID123',
  sex: 'M'
}
```

### ✅ DO: Use core fields for common data
```typescript
// GOOD
species: 'cattle',
rfid_tag: 'RFID123',
sex: 'M',
custom_field_values: {
  contract_id: 'XYZ789'  // Client-specific
}
```

### ❌ DON'T: Force users to configure before using
```typescript
// BAD: Wizard on first launch
if (!user.hasConfiguredCFL) {
  showCFLConfigWizard();
}
```

### ✅ DO: Ship with smart defaults
```typescript
// GOOD: Use defaults, customize later
const defaultCFL = getSystemDefaultCFL(batchType);
```

### ❌ DON'T: Make RFID mandatory
```typescript
// BAD
if (!animal.rfid_tag) {
  throw new Error('RFID required');
}
```

### ✅ DO: Support both workflows equally well
```typescript
// GOOD
if (settings.rfidEnabled && rfidAvailable) {
  animal = await identifyByRFID();
} else {
  animal = await identifyBySearch();
}
```

---

## 🔗 Quick Links for AI Assistants

### When Asked About...

**"How does weighing work?"**
→ Read: `docs/PROJECT-BRIEF.md` Use Cases section

**"What's the data model?"**
→ Read: `docs/architecture/data-model.md`

**"Why core fields instead of custom?"**
→ Read: `docs/architecture/decisions/001-data-model-core-vs-custom-fields.md`

**"How should I style this component?"**
→ Read: `.cursor/rules/25-theming-design-system.mdc`

**"How do I make a searchable dropdown?"**
→ Read: `.cursor/rules/32-ui-component-patterns.mdc`

**"How do I handle errors?"**
→ Read: `.cursor/rules/09-error-handling.mdc`

**"How do I test this?"**
→ Read: `.cursor/rules/04-testing-standards.mdc`

**"What coding standards?"**
→ Read: `.cursor/rules/03-coding-standards.mdc`

---

## 💡 Philosophy & Principles

### From "The AI-Driven Leader"

1. **Strategy Before Features**
   - Every feature must serve one of: Performance, Efficiency, or Traceability
   - If it doesn't, it's scope creep

2. **AI as Critical Partner**
   - Challenge assumptions
   - Push back on weak ideas
   - Ask "why?" three times

3. **Focus on High-Value Decisions**
   - Design around key questions users need to answer
   - Not around features competitors have

4. **Measure What Matters**
   - 3 sec/animal, not "fast"
   - <2% errors, not "accurate"
   - 5 min to value, not "easy"

### From Clean Architecture

1. **Dependencies point inward**
   - Domain knows nothing about UI or database
   - Data depends on domain
   - Presentation depends on domain

2. **Use cases are king**
   - Each use case = one business operation
   - Clear inputs, clear outputs
   - Testable in isolation

3. **Interfaces at boundaries**
   - Repository interfaces in domain
   - Implementations in data
   - Easy to mock, easy to swap

---

## 🎯 Success Criteria

The app is successful when:

- ✅ Feedlot manager processes 200 cattle in 10 minutes (vs 66 min manual)
- ✅ New operator is productive after 4 hours training (vs 2 days)
- ✅ Data entry errors drop below 2% (from 15%)
- ✅ Weight anomalies detected within 24 hours (vs 2 weeks)
- ✅ Full traceability for 100% of animals
- ✅ Net Promoter Score (NPS) ≥ 40

---

## 🔄 What's Next (Development Phases)

### Phase 2: Project Setup
- Initialize React Native + Expo
- Configure SQLite with migrations
- Set up folder structure (domain/data/presentation/infrastructure)
- Implement dependency injection

### Phase 3: Core Features (MVP)
- Entity (Animal) management
- Batch creation & lifecycle
- Transaction recording
- History viewing
- Basic search

### Phase 4: Advanced Features
- Analytics dashboard
- Growth curve visualization
- Anomaly detection
- Export to CSV
- Multi-language support

### Phase 5: AI Enhancements
- Body condition scoring from images
- Predictive weight gain
- Automated auction recommendations

---

*Use this document to get up to speed quickly. The goal is to make animal weighing faster, smarter, and more reliable.* 🚀

