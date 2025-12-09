# Data Model - WeighsoftAnimalWeigherV2

**Version**: 1.0  
**Last Updated**: 2024-12-09  
**Database**: SQLite (Mobile), IndexedDB (Web)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         TENANT (Multi-tenancy)                   │
│  tenant_id (PK)                                                  │
│  name                                                            │
│  settings                                                        │
└───────────┬─────────────────────────────────────────────────────┘
            │
            │ 1:N
            │
     ┌──────┴───────┬─────────────┬────────────────┬──────────────┐
     │              │             │                │              │
     ▼              ▼             ▼                ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐   ┌───────────┐  ┌──────────┐
│ ENTITY  │  │  BATCH   │  │   CFL    │   │   USER    │  │ LOCATION │
│(Animal) │  │          │  │ (Custom  │   │           │  │          │
│         │  │          │  │  Field   │   │           │  │          │
│         │  │          │  │  List)   │   │           │  │          │
└────┬────┘  └────┬─────┘  └────┬─────┘   └───────────┘  └──────────┘
     │            │             │
     │ 1:N        │ 1:N         │ 1:1
     │            │             │
     │         ┌──┴─────────────┘
     │         │
     │         ▼
     │    ┌──────────────────┐
     │    │   TRANSACTION    │◄─────┐
     │    │  (Weigh Event)   │      │ 1:N
     └───►│                  │      │
          └────┬─────────────┘      │
               │                    │
               │ 1:N                │
               ▼                    │
          ┌──────────┐              │
          │  IMAGE   │──────────────┘
          └──────────┘
```

---

## Core Tables

### 1. Entity (Animal)

**Purpose**: Persistent animal identity across all weighing events

```sql
CREATE TABLE entities (
  -- Primary Key
  entity_id TEXT PRIMARY KEY,              -- UUID
  tenant_id TEXT NOT NULL,
  
  -- Identity
  primary_tag TEXT NOT NULL,               -- Visual ear tag (e.g., "A1234")
  rfid_tag TEXT,                           -- RFID EPC code (nullable)
  
  -- Classification
  species TEXT NOT NULL CHECK (species IN ('cattle', 'sheep', 'pig', 'goat')),
  breed TEXT,
  sex TEXT CHECK (sex IN ('M', 'F', 'Unknown')),
  birth_date TEXT,                         -- ISO 8601 date
  
  -- Status
  status TEXT NOT NULL DEFAULT 'Active' 
    CHECK (status IN ('Active', 'Sold', 'Dead', 'Culled')),
  current_group TEXT,                      -- Pen/Lot/Pallet ID
  
  -- Provenance
  source_type TEXT CHECK (source_type IN ('Farm', 'Auction', 'Feedlot', 'Other')),
  source_name TEXT,
  
  -- Target Weight (NEW)
  target_weight_kg REAL,                   -- Target weight for ready-to-sell tracking
  
  -- Metadata
  created_at TEXT NOT NULL,                -- ISO 8601 timestamp
  created_by TEXT NOT NULL,                -- User ID
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  
  -- Constraints
  UNIQUE (tenant_id, primary_tag),
  UNIQUE (tenant_id, rfid_tag) WHERE rfid_tag IS NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

-- Indexes for performance
CREATE INDEX idx_entities_tenant_status ON entities(tenant_id, status);
CREATE INDEX idx_entities_rfid ON entities(tenant_id, rfid_tag) WHERE rfid_tag IS NOT NULL;
CREATE INDEX idx_entities_group ON entities(tenant_id, current_group) WHERE current_group IS NOT NULL;
CREATE INDEX idx_entities_species ON entities(tenant_id, species);
CREATE INDEX idx_entities_target_weight ON entities(tenant_id, target_weight_kg) WHERE target_weight_kg IS NOT NULL;
```

**TypeScript Interface**:
```typescript
interface Entity {
  entity_id: string;
  tenant_id: string;
  
  // Identity
  primary_tag: string;
  rfid_tag?: string;
  
  // Classification
  species: 'cattle' | 'sheep' | 'pig' | 'goat';
  breed?: string;
  sex: 'M' | 'F' | 'Unknown';
  birth_date?: Date;
  
  // Status
  status: 'Active' | 'Sold' | 'Dead' | 'Culled';
  current_group?: string;
  
  // Provenance
  source_type?: 'Farm' | 'Auction' | 'Feedlot' | 'Other';
  source_name?: string;
  
  // Target Weight (NEW)
  target_weight_kg?: number;
  
  // Metadata
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by?: string;
}
```

---

### 2. Batch (Weighing Session)

**Purpose**: Group related weighing events

```sql
CREATE TABLE batches (
  -- Primary Key
  batch_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  -- Identity
  name TEXT NOT NULL,                      -- e.g., "Pen 7 - Dec 2024"
  type TEXT NOT NULL CHECK (type IN ('Arrival', 'Routine', 'Shipment', 'Auction', 'Other')),
  
  -- Configuration
  location_id TEXT,                        -- FK to locations
  scale_device_id TEXT,
  cfl_id TEXT NOT NULL,                    -- FK to custom_field_lists
  cfl_version INTEGER NOT NULL DEFAULT 1,
  
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Open', 'Closed', 'Locked')),
  started_at TEXT,
  closed_at TEXT,
  locked_at TEXT,
  locked_by TEXT,
  
  -- Metadata
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  notes TEXT,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (cfl_id) REFERENCES custom_field_lists(cfl_id)
);

CREATE INDEX idx_batches_tenant_status ON batches(tenant_id, status);
CREATE INDEX idx_batches_type ON batches(tenant_id, type);
CREATE INDEX idx_batches_created ON batches(tenant_id, created_at DESC);
```

**TypeScript Interface**:
```typescript
interface Batch {
  batch_id: string;
  tenant_id: string;
  
  // Identity
  name: string;
  type: 'Arrival' | 'Routine' | 'Shipment' | 'Auction' | 'Other';
  
  // Configuration
  location_id?: string;
  scale_device_id?: string;
  cfl_id: string;
  cfl_version: number;
  
  // Lifecycle
  status: 'Draft' | 'Open' | 'Closed' | 'Locked';
  started_at?: Date;
  closed_at?: Date;
  locked_at?: Date;
  locked_by?: string;
  
  // Metadata
  created_at: Date;
  created_by: string;
  updated_at: Date;
  notes?: string;
}
```

**State Machine**:
```
Draft ──[start]──> Open ──[close]──> Closed ──[lock]──> Locked
  ↑                  │                   │                  │
  └──[reset]─────────┘                   │                  │
                                         │                  │
                     ┌──[reopen]─────────┘                  │
                     ↓                                      │
                   Open ──[close]──> Closed ──[lock]──> Locked
                                                            │
                                        [corrections require admin + audit log]
```

---

### 3. Transaction (Weigh Event)

**Purpose**: Single weighing measurement with full context

```sql
CREATE TABLE transactions (
  -- Primary Key
  tx_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  -- Relationships
  entity_id TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  
  -- Core Measurement
  weight_kg REAL NOT NULL,
  timestamp TEXT NOT NULL,                 -- ISO 8601
  
  -- Context
  scale_device_id TEXT,
  operator_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('Arrival', 'Monthly', 'Shipment', 'Reweigh', 'Other')),
  location_id TEXT,
  
  -- Quality
  is_estimated_weight INTEGER NOT NULL DEFAULT 0,  -- Boolean
  confidence_score REAL,                           -- 0.0-1.0 (for future ML)
  
  -- Custom Data (Immutable Snapshot)
  custom_fields_definition_snapshot TEXT NOT NULL, -- JSON
  custom_field_values TEXT NOT NULL,               -- JSON
  
  -- Metadata
  notes TEXT,
  created_at TEXT NOT NULL,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (entity_id) REFERENCES entities(entity_id),
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  FOREIGN KEY (operator_id) REFERENCES users(user_id)
);

-- Indexes for history queries
CREATE INDEX idx_transactions_entity ON transactions(entity_id, timestamp DESC);
CREATE INDEX idx_transactions_batch ON transactions(batch_id, timestamp);
CREATE INDEX idx_transactions_tenant_timestamp ON transactions(tenant_id, timestamp DESC);
```

**TypeScript Interface**:
```typescript
interface Transaction {
  tx_id: string;
  tenant_id: string;
  
  // Relationships
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
  confidence_score?: number;
  
  // Custom Data
  custom_fields_definition_snapshot: CustomFieldDefinition[];
  custom_field_values: Record<string, any>;
  
  // Metadata
  notes?: string;
  created_at: Date;
}
```

---

### 4. Custom Field List (CFL)

**Purpose**: Template for flexible metadata capture

```sql
CREATE TABLE custom_field_lists (
  -- Primary Key
  cfl_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  -- Identity
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_system_default INTEGER NOT NULL DEFAULT 0,  -- Boolean
  
  -- Definition
  fields TEXT NOT NULL,                          -- JSON array of field definitions
  
  -- Metadata
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  UNIQUE (tenant_id, name, version)
);

CREATE INDEX idx_cfl_tenant ON custom_field_lists(tenant_id, name);
```

**TypeScript Interface**:
```typescript
interface CustomFieldList {
  cfl_id: string;
  tenant_id: string;
  
  // Identity
  name: string;
  version: number;
  is_system_default: boolean;
  
  // Definition
  fields: CustomFieldDefinition[];
  
  // Metadata
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by?: string;
}

interface CustomFieldDefinition {
  field_id: string;                                // Stable identifier
  label: string;                                   // Display name
  data_type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select';
  is_required: boolean;
  default_value?: any;
  options?: SelectOption[];                        // For select types
  validation_rules?: ValidationRule[];
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

---

### 5. Image

**Purpose**: Store images linked to transactions

```sql
CREATE TABLE images (
  -- Primary Key
  image_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  
  -- Relationships
  tx_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,                       -- Denormalized for quick queries
  
  -- Storage
  file_path TEXT NOT NULL,                       -- Local or cloud storage path
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Metadata
  tags TEXT,                                     -- JSON array (e.g., ["condition", "injury"])
  timestamp TEXT NOT NULL,
  captured_by TEXT NOT NULL,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (tx_id) REFERENCES transactions(tx_id),
  FOREIGN KEY (entity_id) REFERENCES entities(entity_id)
);

CREATE INDEX idx_images_entity ON images(entity_id, timestamp DESC);
CREATE INDEX idx_images_tx ON images(tx_id);
```

---

## Supporting Tables

### 6. Tenant

```sql
CREATE TABLE tenants (
  tenant_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  settings TEXT,                                 -- JSON
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active'
);
```

### 7. User

```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Operator', 'ReadOnly')),
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  UNIQUE (tenant_id, email)
);
```

### 8. Location

```sql
CREATE TABLE locations (
  location_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Yard', 'Pen', 'Paddock', 'Barn', 'Other')),
  capacity INTEGER,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);
```

---

## Query Patterns

### Get Entity with History
```sql
-- Fetch entity + last 10 transactions
SELECT 
  e.*,
  json_group_array(
    json_object(
      'tx_id', t.tx_id,
      'weight_kg', t.weight_kg,
      'timestamp', t.timestamp,
      'batch_name', b.name
    )
  ) AS history
FROM entities e
LEFT JOIN transactions t ON e.entity_id = t.entity_id
LEFT JOIN batches b ON t.batch_id = b.batch_id
WHERE e.tenant_id = ? AND e.entity_id = ?
GROUP BY e.entity_id
ORDER BY t.timestamp DESC
LIMIT 10;
```

### Get Batch Summary
```sql
-- Batch stats
SELECT 
  b.*,
  COUNT(t.tx_id) AS total_transactions,
  AVG(t.weight_kg) AS average_weight,
  MIN(t.weight_kg) AS min_weight,
  MAX(t.weight_kg) AS max_weight
FROM batches b
LEFT JOIN transactions t ON b.batch_id = t.batch_id
WHERE b.tenant_id = ? AND b.batch_id = ?
GROUP BY b.batch_id;
```

### Identify Weight Anomalies
```sql
-- Animals losing weight or underperforming
WITH latest_weights AS (
  SELECT 
    entity_id,
    weight_kg AS latest_weight,
    timestamp AS latest_timestamp,
    ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY timestamp DESC) AS rn
  FROM transactions
  WHERE tenant_id = ?
),
previous_weights AS (
  SELECT 
    entity_id,
    weight_kg AS previous_weight,
    timestamp AS previous_timestamp,
    ROW_NUMBER() OVER (PARTITION BY entity_id ORDER BY timestamp DESC) AS rn
  FROM transactions
  WHERE tenant_id = ?
)
SELECT 
  e.entity_id,
  e.primary_tag,
  lw.latest_weight,
  pw.previous_weight,
  (lw.latest_weight - pw.previous_weight) AS weight_change,
  CAST((julianday(lw.latest_timestamp) - julianday(pw.previous_timestamp)) AS REAL) AS days_between
FROM entities e
JOIN latest_weights lw ON e.entity_id = lw.entity_id AND lw.rn = 1
JOIN previous_weights pw ON e.entity_id = pw.entity_id AND pw.rn = 2
WHERE e.tenant_id = ?
  AND e.status = 'Active'
  AND (lw.latest_weight - pw.previous_weight) < 0  -- Weight loss
ORDER BY weight_change ASC;
```

---

## Data Integrity Rules

### 1. Immutable Transactions
Once a batch is **Locked**, transactions cannot be modified or deleted without admin override + audit log.

### 2. Custom Field Snapshots
`custom_fields_definition_snapshot` must be stored at transaction creation time. Never reference live CFL definitions for historical data.

### 3. RFID Uniqueness
Within a tenant, `rfid_tag` must be unique (when not null).

### 4. Primary Tag Uniqueness
Within a tenant, `primary_tag` must be unique for active animals.

### 5. Batch State Transitions
Enforce state machine: Draft → Open → Closed → Locked (see Batch section).

---

## Performance Considerations

### Indexes
All foreign keys have indexes for join performance.

### Denormalization
`entity_id` is denormalized in `images` table for faster entity → images queries.

### Pagination
All list queries should use `LIMIT` + `OFFSET` or cursor-based pagination for large datasets.

### Archival
Consider archiving transactions older than 2 years to `transactions_archive` table.

---

## Migration Strategy

### V1.0 → V1.1 Example
```sql
-- Add new field to entities
ALTER TABLE entities ADD COLUMN tattoo_id TEXT;
CREATE INDEX idx_entities_tattoo ON entities(tenant_id, tattoo_id) WHERE tattoo_id IS NOT NULL;

-- Update version
UPDATE schema_version SET version = '1.1', updated_at = CURRENT_TIMESTAMP;
```

---

*This data model supports the core outcomes: Performance, Efficiency, Traceability.*

