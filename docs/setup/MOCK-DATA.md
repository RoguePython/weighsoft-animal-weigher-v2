# Mock Data Specification

**Purpose**: Realistic test data for development and testing  
**Last Updated**: December 2024

---

## Why Mock Data?

- **Faster Development**: No need to create entities manually
- **Consistent Testing**: Same data across all developers
- **Edge Case Coverage**: Include problem scenarios
- **Demo Ready**: Looks professional for stakeholders

---

## Mock Tenant & Users

```typescript
// src/infrastructure/database/seeds/001_tenant_and_users.ts
export const mockTenant = {
  tenant_id: 'tenant-demo-001',
  name: 'Demo Feedlot',
  settings: JSON.stringify({
    rfidEnabled: true,
    imageMode: 'optional',
    timezone: 'Australia/Sydney',
  }),
  created_at: '2024-01-01T00:00:00Z',
  status: 'Active',
};

export const mockUsers = [
  {
    user_id: 'user-admin-001',
    tenant_id: 'tenant-demo-001',
    email: 'admin@demo.com',
    password_hash: 'hashed_password_admin',
    name: 'Sarah Admin',
    role: 'Admin',
    status: 'Active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    user_id: 'user-manager-001',
    tenant_id: 'tenant-demo-001',
    email: 'manager@demo.com',
    password_hash: 'hashed_password_manager',
    name: 'Mike Manager',
    role: 'Manager',
    status: 'Active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    user_id: 'user-operator-001',
    tenant_id: 'tenant-demo-001',
    email: 'operator@demo.com',
    password_hash: 'hashed_password_operator',
    name: 'John Operator',
    role: 'Operator',
    status: 'Active',
    created_at: '2024-01-01T00:00:00Z',
  },
];
```

---

## Mock Entities (Animals)

### Healthy Animals (Normal Weight Progression)

```typescript
export const mockHealthyEntities = [
  {
    entity_id: 'entity-001',
    tenant_id: 'tenant-demo-001',
    primary_tag: 'A1234',
    rfid_tag: 'RFID-982-000-012-345',
    species: 'cattle',
    breed: 'Angus',
    sex: 'M',
    birth_date: '2023-06-15',
    status: 'Active',
    current_group: 'Pen 7',
    source_type: 'Auction',
    source_name: 'Smithville Livestock Auction',
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'user-admin-001',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    entity_id: 'entity-002',
    tenant_id: 'tenant-demo-001',
    primary_tag: 'A1235',
    rfid_tag: 'RFID-982-000-012-346',
    species: 'cattle',
    breed: 'Hereford',
    sex: 'M',
    birth_date: '2023-07-20',
    status: 'Active',
    current_group: 'Pen 7',
    source_type: 'Farm',
    source_name: 'Johnson Family Farm',
    created_at: '2024-01-15T10:05:00Z',
    created_by: 'user-admin-001',
    updated_at: '2024-01-15T10:05:00Z',
  },
  // Add 48 more for realistic list testing...
];
```

### Problem Animals (Weight Loss, Health Issues)

```typescript
export const mockProblemEntities = [
  {
    entity_id: 'entity-101',
    tenant_id: 'tenant-demo-001',
    primary_tag: 'A2056',
    rfid_tag: 'RFID-982-000-013-101',
    species: 'cattle',
    breed: 'Angus',
    sex: 'F',
    birth_date: '2023-05-10',
    status: 'Active',
    current_group: 'Hospital Pen',
    source_type: 'Auction',
    source_name: 'Central Livestock',
    created_at: '2024-01-10T09:00:00Z',
    created_by: 'user-admin-001',
    updated_at: '2024-12-09T14:30:00Z',
    // Note: This animal will have transactions showing weight loss
  },
];
```

### Sheep (Different Species)

```typescript
export const mockSheep = [
  {
    entity_id: 'entity-201',
    tenant_id: 'tenant-demo-001',
    primary_tag: 'S5001',
    rfid_tag: 'RFID-982-000-050-001',
    species: 'sheep',
    breed: 'Merino',
    sex: 'F',
    birth_date: '2023-08-01',
    status: 'Active',
    current_group: 'Paddock 3',
    source_type: 'Farm',
    source_name: 'Highland Sheep Co',
    created_at: '2024-02-01T08:00:00Z',
    created_by: 'user-admin-001',
    updated_at: '2024-02-01T08:00:00Z',
  },
];
```

---

## Mock Custom Field Lists

```typescript
export const mockCFLs = [
  {
    cfl_id: 'cfl-system-001',
    tenant_id: 'tenant-demo-001',
    name: 'Standard Arrival Weigh',
    version: 1,
    is_system_default: 1,
    fields: JSON.stringify([
      {
        field_id: 'arrival_source_farm',
        label: 'Source Farm',
        data_type: 'text',
        is_required: true,
      },
      {
        field_id: 'arrival_truck_reg',
        label: 'Truck Registration',
        data_type: 'text',
        is_required: true,
      },
      {
        field_id: 'arrival_driver',
        label: 'Driver Name',
        data_type: 'text',
        is_required: false,
      },
      {
        field_id: 'arrival_condition',
        label: 'Arrival Condition Score',
        data_type: 'select',
        is_required: true,
        options: [
          { value: '1', label: '1 - Poor' },
          { value: '5', label: '5 - Average' },
          { value: '9', label: '9 - Excellent' },
        ],
      },
    ]),
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'system',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    cfl_id: 'cfl-system-002',
    tenant_id: 'tenant-demo-001',
    name: 'Standard Routine Weigh',
    version: 1,
    is_system_default: 1,
    fields: JSON.stringify([
      {
        field_id: 'routine_feed_phase',
        label: 'Feed Phase',
        data_type: 'select',
        is_required: true,
        options: [
          { value: 'starter', label: 'Starter' },
          { value: 'grower', label: 'Grower' },
          { value: 'finisher', label: 'Finisher' },
        ],
      },
      {
        field_id: 'routine_health_status',
        label: 'Health Status',
        data_type: 'select',
        is_required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'suspect', label: 'Suspect' },
          { value: 'treated', label: 'Treated' },
        ],
      },
    ]),
    created_at: '2024-01-01T00:00:00Z',
    created_by: 'system',
    updated_at: '2024-01-01T00:00:00Z',
  },
];
```

---

## Mock Batches

```typescript
export const mockBatches = [
  // Completed batch
  {
    batch_id: 'batch-001',
    tenant_id: 'tenant-demo-001',
    name: 'Pen 7 - November Routine',
    type: 'Routine',
    location_id: null,
    scale_device_id: 'scale-001',
    cfl_id: 'cfl-system-002',
    cfl_version: 1,
    status: 'Locked',
    started_at: '2024-11-09T08:00:00Z',
    closed_at: '2024-11-09T10:45:00Z',
    locked_at: '2024-11-09T11:00:00Z',
    locked_by: 'user-manager-001',
    created_at: '2024-11-09T07:55:00Z',
    created_by: 'user-operator-001',
    updated_at: '2024-11-09T11:00:00Z',
    notes: 'Monthly weight check, all animals processed',
  },
  // Open batch (current work)
  {
    batch_id: 'batch-002',
    tenant_id: 'tenant-demo-001',
    name: 'Pen 7 - December Routine',
    type: 'Routine',
    location_id: null,
    scale_device_id: 'scale-001',
    cfl_id: 'cfl-system-002',
    cfl_version: 1,
    status: 'Open',
    started_at: '2024-12-09T08:00:00Z',
    closed_at: null,
    locked_at: null,
    locked_by: null,
    created_at: '2024-12-09T07:50:00Z',
    created_by: 'user-operator-001',
    updated_at: '2024-12-09T08:00:00Z',
    notes: null,
  },
  // Arrival batch (locked)
  {
    batch_id: 'batch-003',
    tenant_id: 'tenant-demo-001',
    name: 'Truck Arrival - Jan 15',
    type: 'Arrival',
    location_id: null,
    scale_device_id: 'scale-001',
    cfl_id: 'cfl-system-001',
    cfl_version: 1,
    status: 'Locked',
    started_at: '2024-01-15T10:00:00Z',
    closed_at: '2024-01-15T11:30:00Z',
    locked_at: '2024-01-15T12:00:00Z',
    locked_by: 'user-manager-001',
    created_at: '2024-01-15T09:55:00Z',
    created_by: 'user-operator-001',
    updated_at: '2024-01-15T12:00:00Z',
    notes: 'Arrival from Smithville Auction, 50 head',
  },
];
```

---

## Mock Transactions (Weight History)

### Healthy Weight Progression

```typescript
export const mockHealthyTransactions = [
  // Entity A1234 - Healthy growth
  {
    tx_id: 'tx-001',
    tenant_id: 'tenant-demo-001',
    entity_id: 'entity-001',
    batch_id: 'batch-003',
    weight_kg: 380.0,
    timestamp: '2024-01-15T10:05:00Z',
    operator_id: 'user-operator-001',
    reason: 'Arrival',
    is_estimated_weight: 0,
    custom_fields_definition_snapshot: JSON.stringify([
      /* CFL fields */
    ]),
    custom_field_values: JSON.stringify({
      arrival_source_farm: 'Smithville Auction',
      arrival_truck_reg: 'ABC-123',
      arrival_condition: '7',
    }),
    created_at: '2024-01-15T10:05:00Z',
  },
  {
    tx_id: 'tx-002',
    tenant_id: 'tenant-demo-001',
    entity_id: 'entity-001',
    batch_id: 'batch-001',
    weight_kg: 455.0, // +75kg in 30 days = 2.5kg/day
    timestamp: '2024-11-09T08:15:00Z',
    operator_id: 'user-operator-001',
    reason: 'Monthly',
    is_estimated_weight: 0,
    custom_fields_definition_snapshot: JSON.stringify([
      /* CFL fields */
    ]),
    custom_field_values: JSON.stringify({
      routine_feed_phase: 'grower',
      routine_health_status: 'normal',
    }),
    created_at: '2024-11-09T08:15:00Z',
  },
  {
    tx_id: 'tx-003',
    tenant_id: 'tenant-demo-001',
    entity_id: 'entity-001',
    batch_id: 'batch-002',
    weight_kg: 520.0, // +65kg in 30 days = 2.17kg/day
    timestamp: '2024-12-09T08:10:00Z',
    operator_id: 'user-operator-001',
    reason: 'Monthly',
    is_estimated_weight: 0,
    custom_fields_definition_snapshot: JSON.stringify([
      /* CFL fields */
    ]),
    custom_field_values: JSON.stringify({
      routine_feed_phase: 'finisher',
      routine_health_status: 'normal',
    }),
    created_at: '2024-12-09T08:10:00Z',
  },
];
```

### Weight Loss Example (Problem Animal)

```typescript
export const mockWeightLossTransactions = [
  {
    tx_id: 'tx-101',
    tenant_id: 'tenant-demo-001',
    entity_id: 'entity-101', // Problem animal
    batch_id: 'batch-001',
    weight_kg: 440.0,
    timestamp: '2024-11-09T09:30:00Z',
    operator_id: 'user-operator-001',
    reason: 'Monthly',
    is_estimated_weight: 0,
    custom_fields_definition_snapshot: JSON.stringify([
      /* CFL fields */
    ]),
    custom_field_values: JSON.stringify({
      routine_feed_phase: 'grower',
      routine_health_status: 'normal',
    }),
    created_at: '2024-11-09T09:30:00Z',
  },
  {
    tx_id: 'tx-102',
    tenant_id: 'tenant-demo-001',
    entity_id: 'entity-101',
    batch_id: 'batch-002',
    weight_kg: 422.0, // WEIGHT LOSS: -18kg
    timestamp: '2024-12-09T09:15:00Z',
    operator_id: 'user-operator-001',
    reason: 'Monthly',
    is_estimated_weight: 0,
    custom_fields_definition_snapshot: JSON.stringify([
      /* CFL fields */
    ]),
    custom_field_values: JSON.stringify({
      routine_feed_phase: 'grower',
      routine_health_status: 'suspect', // Operator noticed issue
    }),
    notes: 'Animal appears lethargic, flagged for vet check',
    created_at: '2024-12-09T09:15:00Z',
  },
];
```

---

## Seed Database Script

```typescript
// src/infrastructure/database/seeds/seed-database.ts
import { mockTenant, mockUsers } from './001_tenant_and_users';
import { mockHealthyEntities, mockProblemEntities } from './002_entities';
import { mockCFLs } from './003_custom_field_lists';
import { mockBatches } from './004_batches';
import { mockHealthyTransactions, mockWeightLossTransactions } from './005_transactions';

export async function seedDatabase(db: SQLiteDatabase) {
  console.log('🌱 Seeding database...');

  // 1. Tenant
  await db.runAsync(
    `INSERT INTO tenants VALUES (?, ?, ?, ?, ?)`,
    [
      mockTenant.tenant_id,
      mockTenant.name,
      mockTenant.settings,
      mockTenant.created_at,
      mockTenant.status,
    ]
  );

  // 2. Users
  for (const user of mockUsers) {
    await db.runAsync(
      `INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.user_id,
        user.tenant_id,
        user.email,
        user.password_hash,
        user.name,
        user.role,
        user.status,
        user.created_at,
        null,
      ]
    );
  }

  // 3. CFLs
  for (const cfl of mockCFLs) {
    await db.runAsync(
      `INSERT INTO custom_field_lists VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cfl.cfl_id,
        cfl.tenant_id,
        cfl.name,
        cfl.version,
        cfl.is_system_default,
        cfl.fields,
        cfl.created_at,
        cfl.created_by,
        cfl.updated_at,
        null,
      ]
    );
  }

  // 4. Entities
  const allEntities = [...mockHealthyEntities, ...mockProblemEntities];
  for (const entity of allEntities) {
    await db.runAsync(
      `INSERT INTO entities VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.entity_id,
        entity.tenant_id,
        entity.primary_tag,
        entity.rfid_tag,
        entity.species,
        entity.breed,
        entity.sex,
        entity.birth_date,
        entity.status,
        entity.current_group,
        entity.source_type,
        entity.source_name,
        entity.created_at,
        entity.created_by,
        entity.updated_at,
        null,
      ]
    );
  }

  // 5. Batches
  for (const batch of mockBatches) {
    await db.runAsync(
      `INSERT INTO batches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batch.batch_id,
        batch.tenant_id,
        batch.name,
        batch.type,
        batch.location_id,
        batch.scale_device_id,
        batch.cfl_id,
        batch.cfl_version,
        batch.status,
        batch.started_at,
        batch.closed_at,
        batch.locked_at,
        batch.locked_by,
        batch.created_at,
        batch.created_by,
        batch.updated_at,
        batch.notes,
      ]
    );
  }

  // 6. Transactions
  const allTransactions = [...mockHealthyTransactions, ...mockWeightLossTransactions];
  for (const tx of allTransactions) {
    await db.runAsync(
      `INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.tx_id,
        tx.tenant_id,
        tx.entity_id,
        tx.batch_id,
        tx.weight_kg,
        tx.timestamp,
        tx.scale_device_id || null,
        tx.operator_id,
        tx.reason,
        tx.location_id || null,
        tx.is_estimated_weight,
        null, // confidence_score
        tx.custom_fields_definition_snapshot,
        tx.custom_field_values,
        tx.notes || null,
        tx.created_at,
      ]
    );
  }

  console.log('✅ Database seeded successfully!');
  console.log('  - 1 tenant');
  console.log(`  - ${mockUsers.length} users`);
  console.log(`  - ${allEntities.length} entities`);
  console.log(`  - ${mockBatches.length} batches`);
  console.log(`  - ${allTransactions.length} transactions`);
}
```

---

## Usage in Development

```typescript
// src/infrastructure/database/database-manager.ts
export class DatabaseManager {
  async initialize() {
    const db = await openDatabase('weighsoft_dev.db');

    // Run migrations
    await this.runMigrations(db);

    // Seed data if empty
    const count = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM entities'
    );

    if (count.count === 0) {
      await seedDatabase(db);
    }

    return db;
  }
}
```

---

**Now developers have realistic data from the start!** 🎉

