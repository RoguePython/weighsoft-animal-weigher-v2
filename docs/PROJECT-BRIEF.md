# WeighsoftAnimalWeigherV2 - Project Brief

**Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Requirements Definition

---

## Executive Summary

WeighsoftAnimalWeigherV2 is a professional animal weighing and management system designed for feedlots, farms, abattoirs, and auction houses. The app enables fast, accurate batch weighing with comprehensive history tracking and intelligent decision support.

### Core Value Proposition

**Make faster, smarter decisions about animal performance, health, and commercial readiness through real-time data capture and intelligent analytics.**

---

## Strategic Outcomes

### 1. Animal Performance & Health Decisions

**Primary Questions to Answer:**
- Is this animal on the right growth curve?
- Which animals are losing weight or underperforming?
- Are we seeing anomalies in a pen/lot/group?
- Which animals need veterinary attention?

**Business Impact:**
- Reduce mortality through early detection
- Optimize feed conversion ratios
- Improve average daily gain (ADG)

### 2. Operational Efficiency

**Primary Questions to Answer:**
- How do we weigh 200+ animals in under 2 hours?
- How do we minimize data entry errors?
- Can we reduce operator training time?

**Business Impact:**
- 70% reduction in weighing session time
- 90% reduction in data entry errors
- 60% faster operator onboarding

### 3. Traceability & Compliance

**Primary Questions to Answer:**
- Can I prove where this animal has been and what it weighed?
- Which animals are ready for auction/slaughter?
- Can I demonstrate compliance with regulations?

**Business Impact:**
- Full regulatory compliance
- Faster sale/shipment decisions
- Better price realization at auction

---

## Core Use Cases

### Use Case 1: Arrival Processing
**Actor**: Feedlot Manager  
**Goal**: Process incoming truck of cattle quickly and accurately  
**Flow**:
1. Create "Arrival" batch for Truck #3
2. Scan RFID tags as animals come off truck
3. For unknown animals: quick-create with RFID + tag
4. Capture weight + arrival condition + source farm
5. Flag any immediate health concerns
6. Close batch and generate arrival report

**Success Metric**: Process 50 animals in 15 minutes

### Use Case 2: Routine Growth Monitoring
**Actor**: Farm Operator  
**Goal**: Monthly weight check for Pen 7  
**Flow**:
1. Open "Routine Weigh" batch for Pen 7
2. For each animal: scan → see history → weigh → capture phase/health
3. System highlights: weight loss, slow gain, or rapid gain
4. Operator flags problem animals for manager review
5. Close batch and generate performance report

**Success Metric**: Identify underperformers within 30 seconds of weighing

### Use Case 3: Pre-Auction Selection
**Actor**: Sales Manager  
**Goal**: Identify animals ready for auction  
**Flow**:
1. View dashboard: "Animals ready for market"
2. Filter by: weight range, days on feed, growth rate, health status
3. Select animals meeting buyer specs
4. Create "Auction Prep" batch
5. Final weigh with grade assessment
6. Generate sale lot sheets with full history

**Success Metric**: Select optimal animals in < 5 minutes

---

## Core Domain Model

### Entity (Animal)

**Purpose**: Persistent identity across all weighing events

**First-Class Fields** (NOT custom fields):
```typescript
interface Entity {
  // Identity
  entity_id: string;              // Internal GUID
  primary_tag: string;            // Visual ID (unique per customer)
  rfid_tag?: string;              // RFID EPC (unique when present)
  
  // Classification
  species: 'cattle' | 'sheep' | 'pig' | 'goat';
  breed?: string;
  sex: 'M' | 'F' | 'Unknown';
  birth_date?: Date;
  
  // Status
  status: 'Active' | 'Sold' | 'Dead' | 'Culled';
  current_group?: string;         // Pen/Lot/Pallet ID
  
  // Provenance
  source_type?: 'Farm' | 'Auction' | 'Feedlot';
  source_name?: string;
  
  // Metadata
  created_at: Date;
  created_by: string;
  updated_at: Date;
}
```

**Why These Are Core Fields**:
- ✅ Used in 80% of searches and filters
- ✅ Required for all reports and analytics
- ✅ Needed for integrations (auction systems, abattoirs)
- ✅ Regulatory requirements (traceability)

### Batch (Weighing Session)

**Purpose**: Group related weighing events for operational and reporting purposes

```typescript
interface Batch {
  batch_id: string;
  name: string;                   // e.g., "Pen 7 - Dec 2024"
  type: 'Arrival' | 'Routine' | 'Shipment' | 'Auction' | 'Other';
  
  // Configuration
  location_id?: string;           // Yard/Pen
  scale_device_id?: string;
  cfl_id: string;                 // Custom Field List
  cfl_version: number;
  
  // Lifecycle
  status: 'Draft' | 'Open' | 'Closed' | 'Locked';
  started_at?: Date;
  closed_at?: Date;
  locked_at?: Date;
  
  // Metadata
  created_by: string;
  created_at: Date;
  notes?: string;
}
```

**Lifecycle States**:
- **Draft**: Created, configuration editable, no transactions
- **Open**: Weighing in progress, transactions being added
- **Closed**: Weighing complete, limited edits allowed
- **Locked**: Immutable, audit trail for any corrections

### Transaction (Weigh Event)

**Purpose**: Single weighing measurement with full context

```typescript
interface Transaction {
  tx_id: string;
  entity_id: string;
  batch_id: string;
  
  // Core Measurement
  weight_kg: number;
  timestamp: Date;
  
  // Context
  scale_device_id?: string;
  operator_id: string;
  reason: 'Arrival' | 'Monthly' | 'Shipment' | 'Reweigh' | 'Other';
  location_id?: string;
  
  // Quality
  is_estimated_weight: boolean;
  confidence_score?: number;      // For future ML integration
  
  // Custom Data (Immutable Snapshot)
  custom_fields_definition_snapshot: CustomFieldDefinition[];
  custom_field_values: Record<string, any>;
  
  // Media
  image_ids: string[];
  
  // Metadata
  notes?: string;
  created_at: Date;
}
```

### Custom Field List (CFL)

**Purpose**: Flexible metadata template for batch-specific data capture

```typescript
interface CustomFieldList {
  cfl_id: string;
  name: string;
  version: number;
  is_system_default: boolean;
  
  fields: CustomFieldDefinition[];
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

interface CustomFieldDefinition {
  field_id: string;               // Stable ID
  label: string;                  // Display name (can change)
  data_type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select';
  is_required: boolean;
  default_value?: any;
  options?: SelectOption[];       // For select/multi-select
  validation_rules?: ValidationRule[];
}
```

---

## Default Custom Field Lists

### CFL 1: "Standard Arrival Weigh"

**Purpose**: Capture arrival context for traceability and source analysis

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| source_farm | text | Yes | Trace underperformance to source |
| truck_reg | text | Yes | Transport traceability |
| driver_name | text | No | Accountability |
| arrival_condition_score | select (1-9) | Yes | Health baseline |
| withholding_complete | boolean | Yes | Compliance |
| arrival_group_id | text | No | Link related animals |

**Business Question**: "Which suppliers consistently deliver quality animals?"

### CFL 2: "Standard Routine Weigh"

**Purpose**: Track growth and health during feed phase

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| feed_phase | select | Yes | Performance by phase analysis |
| days_on_feed | number | Auto | Growth rate calculation |
| health_status | select | Yes | Flag problem animals |
| treatment_code | text | Conditional | Track treatment impact |

**Business Question**: "Is this feed program delivering target ADG?"

### CFL 3: "Shipment / Auction Weigh"

**Purpose**: Final weight for commercial decisions

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| sale_type | select | Yes | Channel analysis |
| buyer_name | text | Yes | Buyer performance tracking |
| contract_id | text | No | Contract fulfillment |
| grade | select | No | Price optimization |
| withdrawal_period_check | boolean | Yes | Compliance |

**Business Question**: "Which animals meet buyer specifications?"

---

## Strategic Pushback & Decisions

### ✅ AGREED: Core Fields vs Custom Fields

**Decision**: RFID, tag, species, breed, sex, status, source are FIRST-CLASS fields, not custom.

**Rationale**:
- Used in 80%+ of queries
- Required for reports
- Needed for integrations
- Performance (indexed queries vs JSON blob searches)

### ✅ AGREED: RFID is OPTIONAL (Can Be Switched Off)

**Decision**: RFID can be completely disabled. Both modes are first-class:

**RFID Enabled** (optimal):
- Auto-scan on approach (2 sec/animal)
- 85% faster than manual
- Instant history load

**RFID Disabled** (still excellent):
- Searchable dropdown with type-ahead
- Select from recent animals
- Barcode scanning supported
- Manual entry available
- Quick-create for new animals
- Time: 10-15 sec/animal (still faster than competitors)

**No degraded experience** - both modes are fully supported!

**See**: ADR 003 - RFID as Optional First-Class Identity, ADR 004 - Optional Features

### ✅ AGREED: Images are OPTIONAL

**Decision**: Images are NOT required by default. Users configure preference:

**Options**:
- **Never**: No image capture
- **Optional** (default): Operator decides per transaction
- **Required**: Every transaction needs image
- **Rule-based**: Smart prompts (weight loss, poor condition, first/final weigh)

**Benefits**:
- No storage bloat for users who don't need images
- Fast weighing (no mandatory photo delay)
- Flexibility for visual record keeping
- Future-ready for AI body condition scoring (V2)

**See**: ADR 004 - Optional Features Configuration

### ✅ AGREED: Custom Fields are OPTIONAL

**Decision**: Ship with 3 system-default Custom Field Lists. Users can:
- **Use as-is** (70% of users): No configuration needed
- **Clone and tweak** (20% of users): Minor customization
- **Create from scratch** (10% power users): Full flexibility

**Use custom fields ONLY for**:
- ✅ Client-specific commercial data (contract IDs, exporter codes)
- ✅ Regional/regulatory requirements (NVD numbers, EU movement permits)
- ✅ Temporary pilot programs
- ❌ NOT for core identity, classification, or status

**See**: ADR 002 - Default Custom Field Lists

---

## Success Metrics

### Operational Efficiency
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Weighing speed | 2 min/animal | 30 sec/animal | Time per transaction |
| Data entry errors | 15% | < 2% | QA audits |
| Operator training | 2 days | 4 hours | Time to proficiency |

### Animal Performance
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Problem animal detection time | 2 weeks | 24 hours | Time from issue to flag |
| Feed conversion optimization | N/A | 10% improvement | FCR tracking |
| Mortality reduction | N/A | 20% reduction | Health flag response time |

### Commercial Outcomes
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Auction price premium | N/A | +5% | Price per kg vs market |
| Contract fulfillment | 85% | 98% | Animals meeting spec |
| Traceability compliance | Manual | 100% automated | Audit pass rate |

---

## MVP Scope (Phase 1) - SIMPLIFIED

### ✅ IN SCOPE (Ship in 4-6 Weeks)
**Core Weighing**:
- Entity (Animal) CRUD with RFID optional
- Batch CRUD with default CFLs (Arrival, Routine, Shipment)
- Transaction recording with simple weight loss flag
- Duplicate RFID detection (block second weigh in same batch)
- Quick-create entity during weighing

**User Experience**:
- Searchable dropdowns (type-ahead filtering)
- Quick-add for all datasets
- Simple weight loss indicator (if last > current)
- Anyone can close batches (simplified permissions)
- Admin correction screen for mistakes

**Data & Reports**:
- Entity history view
- CSV export (5 reports: Batch Summary, Transactions, Animal History, Weight Loss, Auction Ready)
- Basic search (tag/RFID/breed)

**Infrastructure**:
- Clean architecture
- SQLite (mobile), IndexedDB (web)
- 4 roles: Admin, Manager, Operator, ReadOnly
- Settings (RFID on/off, image mode, etc.)

### ⚠️ PHASE 2 (Based on User Feedback)
- Advanced validation rules (species-specific)
- Growth curve analysis & expected ADG
- Offline-first with sync
- Hardware integration specs (RFID/scale protocols)
- Advanced search (fuzzy matching, filters)
- PDF reports with charts
- Multi-level approval workflows

### ❌ OUT OF SCOPE (V1+)
- Financial/accounting features
- Feed inventory management
- Veterinary records system
- Breeding/genetics tracking
- Automated auction recommendations
- AI body condition scoring

**See**: ADR 005 - MVP Simplifications

---

## Next Steps

1. **Architecture Decision Records** (see `docs/architecture/decisions/`)
2. **Data Model Design** (complete ERD)
3. **User Flow Diagrams** (3 core flows)
4. **API Specification** (if backend needed)
5. **UI/UX Mockups** (key screens)

---

*This document is a living specification. All decisions should be validated against the core outcomes: Performance, Efficiency, Traceability.*

