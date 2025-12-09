# ADR 004: Optional Features - User-Configurable Preferences

**Date**: 2024-12-09  
**Status**: ✅ Accepted  
**Deciders**: Product Team, User Feedback  
**Context Tags**: #configuration #ux #flexibility

---

## Context

During requirements definition, we identified several features that should be **optional** rather than mandatory:

1. **Images**: Not all users want to capture images on every weigh
2. **Custom Fields**: Many users are happy with system defaults
3. **RFID**: Some users don't have RFID infrastructure

**Problem**: If we make these features:
- Too rigid → Excludes users with different needs
- Too complex → Overwhelming configuration
- One-size-fits-all → Poor fit for everyone

**Goal**: Provide sensible defaults with optional enhancements.

---

## Decision

**We will make key features OPTIONAL with smart defaults that work for 70%+ of users. Advanced users can enable/customize as needed.**

### Feature 1: Images - OPTIONAL

**Default Behavior**: Images are NOT required

**Configuration Options**:
```typescript
interface ImageSettings {
  // Capture mode
  mode: 'never' | 'optional' | 'required' | 'rule-based';
  
  // Rule-based triggers (if mode = 'rule-based')
  rules?: {
    on_first_weigh: boolean;
    on_final_weigh: boolean;
    on_weight_loss: boolean;
    on_condition_score_below: number;
  };
  
  // Storage
  max_images_per_transaction: number;  // Default: 3
  compress_quality: number;             // 0-100, default: 80
}
```

**UI Settings**:
```
Settings > Weighing > Images
  ○ Never capture images
  ● Optional (operator decides)          ← DEFAULT
  ○ Always required
  ○ Rule-based (smart prompts)
```

**Benefits**:
- No storage bloat for users who don't need images
- Fast weighing (no photo delay)
- Flexibility for users who want visual records
- Future-ready for AI body condition scoring

---

### Feature 2: Custom Fields - OPTIONAL

**Default Behavior**: Ship with 3 system CFLs, use as-is

**Configuration Options**:
```typescript
interface CFLSettings {
  // Default behavior
  auto_select_cfl_by_batch_type: boolean;  // Default: true
  
  // Customization
  allow_custom_cfls: boolean;              // Default: true
  allow_cfl_editing: boolean;              // Default: true (admins only)
  
  // Validation
  require_all_required_fields: boolean;    // Default: true
}
```

**User Journey**:
```
New User (Day 1):
  → Uses "Standard Arrival Weigh" CFL
  → 3 minutes to first weigh
  → No configuration needed
  
Power User (Week 2):
  → Clones "Standard Arrival Weigh"
  → Adds 2 custom fields ("Supplier Contract ID", "Import Permit")
  → Applies to future batches
```

**Benefits**:
- 70% of users never create custom CFLs
- 20% clone and tweak slightly
- 10% create from scratch
- Everyone gets value immediately

---

### Feature 3: RFID - OPTIONAL (Can Be Switched Off)

**Default Behavior**: RFID enabled if hardware detected, otherwise disabled

**Configuration Options**:
```typescript
interface RFIDSettings {
  // Enable/disable
  enabled: boolean;                        // Default: auto-detect
  
  // Mode
  mode: 'rfid-first' | 'hybrid' | 'rfid-only';
  
  // Hardware
  reader_type: 'allflex' | 'gallagher' | 'tru-test' | 'generic';
  connection: 'bluetooth' | 'usb' | 'network';
  
  // Behavior
  auto_read_timeout_ms: number;            // Default: 2000
  require_confirmation: boolean;            // Default: false
  fallback_to_manual: boolean;             // Default: true
}
```

**UI Settings**:
```
Settings > Identification
  
  RFID Reader
  ☑ Enable RFID scanning                  ← Can be toggled off
  
  If RFID disabled:
    → Searchable dropdown (type-ahead)
    → Barcode scanning
    → Manual entry
    
  All methods are equally supported!
```

**Workflow Examples**:

**Scenario A: RFID Enabled**
```
1. Animal enters → RFID auto-reads (2 sec)
2. History loads instantly
3. Weight captured
```

**Scenario B: RFID Disabled**
```
1. Animal enters → Searchable dropdown opens
2. Operator types "A12" → Results filter instantly
3. Select from list OR quick-create
4. Weight captured (10-15 sec total)
```

**Scenario C: RFID Failed**
```
1. Animal enters → RFID attempts read (2 sec timeout)
2. No tag found → Dropdown auto-opens
3. Manual selection/entry
4. Weight captured
```

**Benefits**:
- No exclusion based on RFID availability
- Both modes get excellent UX
- Smooth transition path (manual → RFID later)
- No "degraded" experience

---

## Configuration Architecture

### Settings Storage
```sql
CREATE TABLE tenant_settings (
  tenant_id TEXT PRIMARY KEY,
  
  -- Images
  image_mode TEXT DEFAULT 'optional'
    CHECK (image_mode IN ('never', 'optional', 'required', 'rule-based')),
  image_rules TEXT,                        -- JSON
  
  -- RFID
  rfid_enabled INTEGER DEFAULT 1,          -- Boolean
  rfid_mode TEXT DEFAULT 'rfid-first',
  rfid_config TEXT,                        -- JSON
  
  -- Custom Fields
  auto_select_cfl INTEGER DEFAULT 1,
  allow_custom_cfls INTEGER DEFAULT 1,
  
  -- General
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
```

### Settings UI
```typescript
// src/presentation/screens/settings.screen.tsx
export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <ScrollView>
      {/* RFID Section */}
      <SettingsSection title="Animal Identification">
        <SettingsSwitch
          label="Enable RFID Scanning"
          value={settings.rfidEnabled}
          onChange={(enabled) => updateSettings({ rfidEnabled: enabled })}
        />
        
        {!settings.rfidEnabled && (
          <InfoBox>
            Animals will be identified via searchable dropdown or manual entry.
          </InfoBox>
        )}
      </SettingsSection>
      
      {/* Images Section */}
      <SettingsSection title="Image Capture">
        <SettingsRadio
          options={[
            { label: 'Never', value: 'never' },
            { label: 'Optional', value: 'optional' },
            { label: 'Always Required', value: 'required' },
            { label: 'Rule-Based', value: 'rule-based' },
          ]}
          value={settings.imageMode}
          onChange={(mode) => updateSettings({ imageMode: mode })}
        />
      </SettingsSection>
    </ScrollView>
  );
};
```

---

## Consequences

### Positive
- ✅ **Inclusive**: Supports users with/without RFID, with/without image needs
- ✅ **Flexible**: Users configure to their workflow
- ✅ **Simple defaults**: 70%+ never touch settings
- ✅ **No degraded experience**: All modes are first-class
- ✅ **Easy migration**: Manual users can add RFID later

### Negative
- ⚠️ **More testing**: Must test all configuration combinations
- ⚠️ **Documentation**: Need clear guides for each mode
- ⚠️ **Support complexity**: More configuration = more support questions

### Mitigation
- Smart defaults work for majority
- Progressive disclosure (hide advanced options)
- In-app help and tooltips
- Setup wizard for advanced configurations

---

## Validation

### Pre-Launch Testing

**Test with 3 customer profiles**:

1. **Basic User (No RFID, No Images)**
   - ✅ Searchable dropdown works well
   - ✅ No image prompts
   - ✅ Fast, simple workflow

2. **Intermediate User (RFID, Optional Images)**
   - ✅ RFID auto-read works
   - ✅ Can capture images when needed
   - ✅ Can skip images when not needed

3. **Power User (RFID, Required Images, Custom CFLs)**
   - ✅ All features enabled
   - ✅ Custom CFLs work
   - ✅ Image validation works

### Success Metrics
- [ ] 70%+ of users never change default settings
- [ ] <5% support tickets about configuration
- [ ] All customer types can complete weighing successfully
- [ ] Net Promoter Score (NPS) ≥ 40 across all modes

---

## Implementation Notes

### Feature Flags Pattern
```typescript
// src/shared/utils/feature-flags.ts
export class FeatureFlags {
  constructor(private settings: TenantSettings) {}
  
  isRFIDEnabled(): boolean {
    return this.settings.rfidEnabled;
  }
  
  shouldCaptureImages(context: WeighContext): boolean {
    switch (this.settings.imageMode) {
      case 'never':
        return false;
      case 'required':
        return true;
      case 'optional':
        return false; // Let user decide
      case 'rule-based':
        return this.evaluateImageRules(context);
    }
  }
  
  private evaluateImageRules(context: WeighContext): boolean {
    const rules = this.settings.imageRules;
    
    if (rules.on_first_weigh && context.isFirstWeigh) return true;
    if (rules.on_weight_loss && context.weightLoss) return true;
    if (rules.on_condition_score_below && 
        context.conditionScore < rules.on_condition_score_below) {
      return true;
    }
    
    return false;
  }
}
```

### Settings Hook
```typescript
// src/presentation/hooks/use-settings.ts
export function useSettings() {
  const [settings, setSettings] = useState<TenantSettings>();
  
  const updateSettings = async (updates: Partial<TenantSettings>) => {
    await settingsRepository.update(updates);
    setSettings({ ...settings, ...updates });
  };
  
  const featureFlags = useMemo(
    () => new FeatureFlags(settings),
    [settings]
  );
  
  return { settings, updateSettings, featureFlags };
}
```

---

## References

- [Progressive Disclosure (Nielsen Norman Group)](https://www.nngroup.com/articles/progressive-disclosure/)
- [Smart Defaults in UX](https://www.nngroup.com/articles/defaults/)
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)

---

**Related ADRs**:
- ADR 001: Core Fields vs Custom Fields
- ADR 002: Default Custom Field Lists
- ADR 003: RFID as Optional First-Class Identity

