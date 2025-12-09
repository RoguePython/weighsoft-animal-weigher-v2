# ADR 002: Ship with Default Custom Field Lists

**Date**: 2024-12-09  
**Status**: ✅ Accepted  
**Deciders**: Product Team, UX Lead  
**Context Tags**: #ux #onboarding #configuration

---

## Context

Original design required users to:
1. Create custom field lists (CFLs) before their first batch
2. Design data model upfront (field names, types, validation)
3. Understand weighing workflows before using the app

**Problem**: This creates massive friction for new users:
- "What fields do I need?" (cognitive overload)
- "I just want to weigh some animals!" (delayed value)
- "I'll come back later..." (abandonment risk)

Competitor analysis shows:
- ✅ Best-in-class SaaS: Instant value, customize later
- ❌ Traditional software: Complex setup, slow adoption

## Decision

**We will ship 3 pre-configured, system-default Custom Field Lists that cover 90% of use cases. Users can start weighing immediately, customize later.**

### Default CFLs

#### CFL 1: "Standard Arrival Weigh"
Auto-attached to Batch type: `Arrival`

| Field ID | Label | Type | Required | Options |
|----------|-------|------|----------|---------|
| `arrival_source_farm` | Source Farm | text | Yes | - |
| `arrival_truck_reg` | Truck Registration | text | Yes | - |
| `arrival_driver` | Driver Name | text | No | - |
| `arrival_condition` | Arrival Condition Score | select | Yes | 1-9 scale |
| `arrival_withholding` | Withholding Complete | boolean | Yes | - |
| `arrival_group_id` | Arrival Group ID | text | No | - |

**Purpose**: Traceability, supplier analysis, compliance

#### CFL 2: "Standard Routine Weigh"
Auto-attached to Batch type: `Routine`

| Field ID | Label | Type | Required | Options |
|----------|-------|------|----------|---------|
| `routine_feed_phase` | Feed Phase | select | Yes | Starter, Grower, Finisher, Pasture |
| `routine_feed_type` | Feed Type | select | No | Starter, Grower, Finisher, Pasture, Custom |
| `routine_feed_brand` | Feed Brand | text | No | - |
| `routine_days_on_feed` | Days on Feed | number | Auto-calculated | - |
| `routine_health_status` | Health Status | select | Yes | Normal, Suspect, Treated, Recovering |
| `routine_treatment_code` | Treatment Code | text | Conditional | If health ≠ Normal |
| `routine_medication` | Medication | text | No | Medication name |
| `routine_medication_date` | Medication Date | date | No | When medication was given |
| `routine_notes` | Notes | text | No | General notes and medical records |

**Purpose**: Growth tracking, feed efficiency, health monitoring

#### CFL 3: "Shipment / Auction Weigh"
Auto-attached to Batch type: `Shipment` or `Auction`

| Field ID | Label | Type | Required | Options |
|----------|-------|------|----------|---------|
| `ship_sale_type` | Sale Type | select | Yes | Auction, Direct, Abattoir, Private |
| `ship_buyer_name` | Buyer Name | text | Yes | - |
| `ship_contract_id` | Contract ID | text | No | - |
| `ship_grade` | Grade/Classification | select | No | Prime, Choice, Select, etc. |
| `ship_withdrawal_check` | Withdrawal Period Check | boolean | Yes | - |

**Purpose**: Commercial decisions, buyer analysis, compliance

### Behavior

```typescript
// On tenant creation
async function initializeTenant(tenantId: string) {
  // Create system defaults
  await createSystemDefaultCFL(tenantId, 'Standard Arrival Weigh', arrivalFields);
  await createSystemDefaultCFL(tenantId, 'Standard Routine Weigh', routineFields);
  await createSystemDefaultCFL(tenantId, 'Shipment / Auction Weigh', shipmentFields);
  
  // Mark as system (cannot delete, but can clone/extend)
  await markAsSystemDefaults(tenantId);
}

// On batch creation
async function createBatch(batchData: BatchInput) {
  // Auto-select CFL based on type
  if (!batchData.cfl_id) {
    batchData.cfl_id = getDefaultCFLForBatchType(batchData.type);
  }
  
  return await batchRepository.create(batchData);
}
```

## Rationale

### Time to Value

**Before** (Forced CFL creation):
```
Signup → CFL Design (30-60 min) → Batch Setup (5 min) → First Weigh (45 min later)
```

**After** (Default CFLs):
```
Signup → Batch Setup (2 min) → First Weigh (2 min later)
```

**Impact**: **95% reduction in time-to-first-value**

### Adoption Curve

```
┌─────────────────────────────────────┐
│ With Forced Setup                   │
│                                     │
│  100%─                              │
│      │                              │
│   80%─            ╱────             │
│      │          ╱                   │
│   60%─        ╱                     │
│      │      ╱                       │
│   40%─    ╱                         │
│      │  ╱                           │
│   20%─╱                             │
│      │                              │
│    0%─────────────────────          │
│      0  1  2  3  4  5  6 days       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ With Default CFLs                   │
│                                     │
│  100%─  ╱────────                   │
│      │ ╱                            │
│   80%─╱                             │
│      │                              │
│   60%─                              │
│      │                              │
│   40%─                              │
│      │                              │
│   20%─                              │
│      │                              │
│    0%─────────────────────          │
│      0  1  2  3  4  5  6 days       │
└─────────────────────────────────────┘
```

### Customer Segmentation

| Segment | % of Users | Behavior | Solution |
|---------|-----------|----------|----------|
| **Quick Start** | 70% | "Just let me weigh!" | Use defaults forever |
| **Tweakers** | 20% | Start with defaults, minor edits | Clone + modify |
| **Power Users** | 10% | Complex workflows | Create custom CFLs |

By shipping defaults, we serve 70% perfectly and 90% adequately **on day one**.

## Consequences

### Positive
- ✅ **Instant value**: Users weighing within 5 minutes of signup
- ✅ **Reduced support**: No "how do I set this up?" tickets
- ✅ **Better data quality**: Professionally designed fields
- ✅ **Consistent reporting**: Standardized field IDs across customers
- ✅ **Upgrade path**: Clone defaults to customize

### Negative
- ⚠️ **One-size-fits-all risk**: Defaults may not fit everyone
- ⚠️ **Field naming**: "Standard" fields may need regional variants
- ⚠️ **Storage overhead**: Every tenant gets 3 CFLs even if unused

### Mitigation
- Monitor which defaults are actually used (analytics)
- Provide "regional packs" (AU, US, EU variants)
- Allow hiding/disabling default fields
- Offer guided customization wizard for power users

## Alternatives Considered

### Alternative 1: Empty CFLs
**Rejected**: User must add every field manually → friction

### Alternative 2: Smart Wizard
**Considered**: Ask 3-5 questions, generate custom CFL
**Rejected**: Still delays first weigh, adds complexity

### Alternative 3: Import from Competitors
**Considered**: "Import your existing fields from [competitor]"
**Deferred**: Good for V2, requires integrations

## Validation

### Pre-Launch Testing
- [x] 5 feedlot managers used defaults successfully
- [x] 3/5 used defaults with zero modifications
- [x] 2/5 cloned and added 1-2 custom fields
- [x] Time-to-first-weigh: **Average 4 minutes**

### Success Metrics (Post-Launch)
- [ ] 80%+ of new users weigh within first day
- [ ] 60%+ of users never create custom CFLs
- [ ] <5% support tickets about field setup
- [ ] Net Promoter Score (NPS) ≥40

## Implementation Notes

### Database Schema
```sql
CREATE TABLE custom_field_lists (
  cfl_id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  version INT DEFAULT 1,
  is_system_default BOOLEAN DEFAULT FALSE,
  fields JSONB NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- System defaults: is_system_default = TRUE
-- Cannot be deleted, but can be cloned
```

### UX Flow
```
New User → Sign Up
  ↓
Dashboard: "Let's weigh your first batch!"
  ↓
Create Batch → Type: [Arrival] → Name: "Truck 3"
  ↓
[System auto-selects "Standard Arrival Weigh" CFL]
  ↓
Weigh Screen → Ready to scan RFID
  ↓
[First animal weighed in 2 minutes]
```

## References

- [Product-Led Growth: Time to Value](https://www.productled.org/foundations/what-is-product-led-growth)
- [SaaS Onboarding Best Practices](https://www.appcues.com/blog/saas-onboarding-best-practices)
- [Jobs to Be Done Framework](https://jtbd.info/)

---

**Related ADRs**:
- ADR 001: Core Fields vs Custom Fields
- ADR 004: Batch Lifecycle States

