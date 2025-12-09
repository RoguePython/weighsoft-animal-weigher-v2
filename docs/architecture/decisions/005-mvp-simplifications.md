# ADR 005: MVP Simplifications - Keep It Simple

**Date**: 2024-12-09  
**Status**: ✅ Accepted  
**Deciders**: Product Team  
**Context Tags**: #mvp #simplicity #scope

---

## Context

During comprehensive review, many complex features were identified. For MVP, we need to ship fast with core value, not solve every edge case.

**Philosophy**: Simple, working solution beats complex, perfect solution.

---

## Decisions

### 1. Weight Anomaly Detection - SIMPLE

**Decision**: If `last_weight > current_weight`, flag it visually. That's it.

**Implementation**:
```typescript
function detectWeightAnomaly(entity: Entity, newWeight: number): WeightFlag | null {
  const lastTransaction = await getLastTransaction(entity.entity_id);
  
  if (!lastTransaction) return null;
  
  if (lastTransaction.weight_kg > newWeight) {
    return {
      type: 'weight_loss',
      message: `Weight decreased from ${lastTransaction.weight_kg}kg to ${newWeight}kg`,
      severity: 'warning',
      previous_weight: lastTransaction.weight_kg,
      days_since: daysSince(lastTransaction.timestamp),
    };
  }
  
  return null;
}

// UI: Show warning banner, let operator confirm or fix
```

**NOT in MVP**:
- ❌ Complex growth curve calculations
- ❌ Expected weight by breed/age
- ❌ Statistical anomaly detection
- ❌ Pen/group variance analysis

**Future (V2)**:
- Calculate expected daily gain
- Flag unusually high gain (possible scale error)
- Pen-level anomaly detection

---

### 2. Batch Permissions - SIMPLE

**Decision**: Anyone can close a batch. No approval workflows.

**Permission Matrix (MVP)**:

| Action | Admin | Manager | Operator | ReadOnly |
|--------|-------|---------|----------|----------|
| Create Entity | ✓ | ✓ | ✓ (quick-create) | ✗ |
| Create Batch | ✓ | ✓ | ✓ | ✗ |
| Close Batch | ✓ | ✓ | ✓ | ✗ |
| Lock Batch | ✓ | ✓ | ✗ | ✗ |
| Delete Batch | ✓ | ✗ | ✗ | ✗ |
| Create Transaction | ✓ | ✓ | ✓ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✓ |
| Modify Settings | ✓ | ✗ | ✗ | ✗ |
| Correct Locked Batch | ✓ | ✗ | ✗ | ✗ |

**Rationale**: Trust your operators. Complex approval workflows slow down operations.

**NOT in MVP**:
- ❌ Multi-level approvals
- ❌ Batch ownership (only creator can close)
- ❌ Supervisor review before close

**Future (V2)**:
- Optional approval workflows (configurable)
- Batch ownership rules
- Sign-off requirements for high-value batches

---

### 3. Batch Auto-Close - NO

**Decision**: No auto-close. Manual close only.

**Rationale**: 
- Operators need control over when batch is "done"
- Auto-close risks incomplete batches
- Manual close gives operator moment to review

**Implementation**: Batches stay "Open" until explicitly closed.

---

### 4. Duplicate RFID Detection - BLOCK IT

**Decision**: Block duplicate weighing in same batch (once only per batch).

**Implementation**:
```typescript
async function validateTransaction(
  batchId: string, 
  entityId: string
): Promise<ValidationResult> {
  // Check if entity already weighed in this batch
  const existing = await db.getFirstAsync(
    'SELECT tx_id FROM transactions WHERE batch_id = ? AND entity_id = ?',
    [batchId, entityId]
  );
  
  if (existing) {
    return {
      valid: false,
      error: 'DUPLICATE_IN_BATCH',
      message: `This animal has already been weighed in this batch.`,
      existing_tx_id: existing.tx_id,
      actions: [
        { label: 'View Previous Weight', action: 'view' },
        { label: 'Reweigh (Admin Override)', action: 'override' },
      ],
    };
  }
  
  return { valid: true };
}
```

**UI Flow**:
```
RFID scan → Duplicate detected
  ↓
Show alert: "Already weighed: 450kg at 10:23 AM"
  ↓
Options:
  [View Details] [Admin Override] [Cancel]
```

**Admin Override**: Requires admin password, logs reason.

---

### 5. Wrong Batch Corrections - ADMIN SCREEN

**Decision**: Provide admin correction screen for fixing mistakes.

**Scope**:
- Move transaction to different batch
- Delete transaction (with reason + audit log)
- Edit transaction metadata (weight, timestamp, custom fields)

**Implementation**:
```typescript
// Admin correction interface
interface TransactionCorrection {
  tx_id: string;
  correction_type: 'move' | 'delete' | 'edit';
  reason: string;
  corrected_by: string;
  timestamp: Date;
  
  // For 'move'
  new_batch_id?: string;
  
  // For 'edit'
  changes?: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
}

// Audit trail
CREATE TABLE transaction_corrections (
  correction_id TEXT PRIMARY KEY,
  tx_id TEXT NOT NULL,
  correction_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  corrected_by TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  details TEXT,  -- JSON
  FOREIGN KEY (tx_id) REFERENCES transactions(tx_id)
);
```

**UI**: Settings > Admin > Batch Corrections

**NOT in MVP**:
- ❌ Batch merge (combine 2 batches)
- ❌ Bulk corrections
- ❌ Approval workflow for corrections

---

### 6. Search - SIMPLE TYPE-AHEAD

**Decision**: Type in search box, list gets shorter. No fancy algorithms.

**Implementation**:
```typescript
function searchEntities(query: string, entities: Entity[]): Entity[] {
  if (!query) return entities;
  
  const lowerQuery = query.toLowerCase();
  
  return entities.filter(entity =>
    entity.primary_tag.toLowerCase().includes(lowerQuery) ||
    entity.rfid_tag?.toLowerCase().includes(lowerQuery) ||
    entity.breed?.toLowerCase().includes(lowerQuery)
  );
}
```

**Search Fields**:
- Primary tag (main)
- RFID tag
- Breed (bonus)

**Sort Order**: Exact matches first, then alphabetical.

**NOT in MVP**:
- ❌ Fuzzy matching
- ❌ Search by weight range
- ❌ Advanced filters (date range, status, etc.)
- ❌ Full-text search with ranking

**Future (V2)**:
- Fuzzy search (Levenshtein distance)
- Recent entities first
- Search history

---

## Parked for Future Versions

### Complex Features - NOT in MVP

| Feature | Status | Reason |
|---------|--------|--------|
| **Advanced validation rules** | 🅿️ Parked | Species-specific weight ranges need industry data |
| **Offline-first sync** | 🅿️ Parked | Complex conflict resolution, needs more design |
| **Hardware integration specs** | 🅿️ Parked | Test with real devices first |
| **Advanced error recovery** | 🅿️ Parked | Add as issues emerge in production |
| **Performance optimization** | 🅿️ Parked | Optimize when we have real data volumes |

### Why Park These?

**Philosophy**: 
- Ship MVP fast
- Get real user feedback
- Build what's actually needed, not what we think is needed
- Avoid over-engineering

**Criteria for V1**:
- ✅ Solves core use case (weigh animals, track history)
- ✅ Provides business value immediately
- ✅ Simple enough to ship in 4-6 weeks

**Criteria for V2+**:
- Must be validated by real user pain
- Must have clear ROI
- Must not slow down core workflow

---

## Implementation Priorities

### Week 1-2: Core Weighing
- Entity CRUD
- Batch CRUD
- Transaction creation
- Simple weight loss flag

### Week 3-4: Essential Features
- Search (type-ahead)
- History view
- Duplicate detection
- Basic reports

### Week 5-6: Polish & Launch
- Admin corrections screen
- Settings
- Export to CSV
- Testing & bug fixes

---

## Success Metrics (MVP)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Time to First Weigh** | < 5 min | From signup to first transaction |
| **Weighing Speed** | < 15 sec/animal | Average (manual mode) |
| **Error Rate** | < 5% | Transactions needing correction |
| **User Adoption** | 10 active farms | Within 30 days of launch |
| **NPS** | ≥ 30 | Post-use survey |

---

## What Changed from Original Vision

### Simplified ✂️
- ❌ Complex anomaly detection → ✅ Simple weight loss flag
- ❌ Growth curve analysis → ✅ Manual ADG calculation (future)
- ❌ Multi-level approvals → ✅ Everyone can close batches
- ❌ Advanced search → ✅ Simple type-ahead
- ❌ Offline sync → ✅ Online-first (offline future)

### Kept 🎯
- ✅ RFID optional (can switch off)
- ✅ Searchable dropdowns
- ✅ Quick-add everywhere
- ✅ Images optional
- ✅ Custom fields optional
- ✅ Clean architecture
- ✅ Business professional design

---

## Validation

### Before MVP Launch
- [ ] 3 test farms use app for 1 week
- [ ] Can complete arrival processing in < 10 min
- [ ] Can complete routine weigh in < 20 min
- [ ] No critical bugs
- [ ] CSV export works
- [ ] Weight loss flag catches obvious errors

### Post-MVP (Learn & Iterate)
- [ ] Collect feedback on parked features
- [ ] Measure actual usage patterns
- [ ] Identify real pain points
- [ ] Prioritize V2 features based on data

---

## References

- [Lean Startup - Build-Measure-Learn](http://theleanstartup.com/)
- [Shape Up - Appetite & Scope Hammering](https://basecamp.com/shapeup)
- [Getting Real - Build Less](https://basecamp.com/gettingreal)

---

**Related ADRs**:
- ADR 002: Default Custom Field Lists (ship with defaults)
- ADR 004: Optional Features (simple configuration)

