# Permission Model - RBAC (Role-Based Access Control)

**Version**: 1.0 (MVP - Simplified)  
**Last Updated**: December 2024

---

## Philosophy (MVP)

**Keep it simple**: 4 roles with clear boundaries. Trust your team.

**NOT in MVP**:
- ❌ Custom roles
- ❌ Fine-grained permissions per feature
- ❌ Multi-level approval workflows
- ❌ Delegation/impersonation

---

## Four Roles

### Admin
**Purpose**: Full system access, manages users and settings

**Typical Users**: Farm owner, IT administrator, System integrator

**Key Abilities**:
- Configure everything
- Correct any data
- Manage users
- View audit logs

### Manager
**Purpose**: Oversees operations, reviews data, generates reports

**Typical Users**: Farm manager, Operations supervisor, Compliance officer

**Key Abilities**:
- Create and manage entities/batches
- Close and lock batches
- Generate reports
- View all data
- Cannot modify settings or users

### Operator
**Purpose**: Day-to-day weighing operations

**Typical Users**: Scale operator, Farm hand, Contractor

**Key Abilities**:
- Create entities (quick-create during weighing)
- Create and use batches
- Close batches they created
- Record transactions
- View their own data
- Cannot lock batches or modify settings

### ReadOnly
**Purpose**: View-only access for reporting and auditing

**Typical Users**: Accountant, Auditor, External consultant

**Key Abilities**:
- View all data
- Generate reports
- Export data
- Cannot create or modify anything

---

## Permission Matrix

### Entity (Animal) Management

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View Entity List** | ✓ | ✓ | ✓ | ✓ |
| **View Entity Detail** | ✓ | ✓ | ✓ | ✓ |
| **Create Entity (Full Form)** | ✓ | ✓ | ✗ | ✗ |
| **Quick-Create Entity** | ✓ | ✓ | ✓ | ✗ |
| **Edit Entity** | ✓ | ✓ | ✗ | ✗ |
| **Delete Entity** | ✓ | ✗ | ✗ | ✗ |
| **Change Entity Status** | ✓ | ✓ | ✗ | ✗ |

**Notes**:
- Quick-create: Minimal fields (RFID + Tag + Species) during weighing
- Full form: All fields including breed, birth date, source

### Batch Management

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View Batch List** | ✓ | ✓ | ✓ (own) | ✓ |
| **View Batch Detail** | ✓ | ✓ | ✓ (own) | ✓ |
| **Create Batch** | ✓ | ✓ | ✓ | ✗ |
| **Edit Batch (Open)** | ✓ | ✓ | ✓ (own) | ✗ |
| **Close Batch** | ✓ | ✓ | ✓ (any) | ✗ |
| **Reopen Batch** | ✓ | ✓ | ✗ | ✗ |
| **Lock Batch** | ✓ | ✓ | ✗ | ✗ |
| **Delete Batch** | ✓ | ✗ | ✗ | ✗ |

**Notes**:
- "own" = batches created by this operator
- Anyone can close any batch (simplified for MVP)
- Only Admin can delete batches

### Transaction (Weighing) Management

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View Transactions** | ✓ | ✓ | ✓ (own batch) | ✓ |
| **Create Transaction** | ✓ | ✓ | ✓ | ✗ |
| **Edit Transaction (Open Batch)** | ✓ | ✓ | ✓ (own) | ✗ |
| **Delete Transaction (Open Batch)** | ✓ | ✓ | ✗ | ✗ |
| **Edit Locked Transaction** | ✓ | ✗ | ✗ | ✗ |
| **Move Transaction to Different Batch** | ✓ | ✗ | ✗ | ✗ |

**Notes**:
- Open batch: transactions editable by creator
- Locked batch: only Admin can correct (with audit log)

### Custom Field Lists

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View CFLs** | ✓ | ✓ | ✓ | ✓ |
| **Use System Default CFLs** | ✓ | ✓ | ✓ | ✗ |
| **Create Custom CFL** | ✓ | ✓ | ✗ | ✗ |
| **Edit Custom CFL** | ✓ | ✓ | ✗ | ✗ |
| **Delete Custom CFL** | ✓ | ✗ | ✗ | ✗ |

**Notes**:
- System default CFLs cannot be deleted (only cloned)

### Reports & Export

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View Reports** | ✓ | ✓ | ✓ (own) | ✓ |
| **Export to CSV** | ✓ | ✓ | ✓ (own) | ✓ |
| **Batch Summary Report** | ✓ | ✓ | ✓ (own) | ✓ |
| **Animal History Report** | ✓ | ✓ | ✓ | ✓ |
| **Weight Loss Report** | ✓ | ✓ | ✓ | ✓ |
| **Auction Ready Report** | ✓ | ✓ | ✓ | ✓ |

**Notes**:
- "own" = reports for batches they created
- Everyone can export their visible data

### Settings & Configuration

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View Settings** | ✓ | ✓ (read-only) | ✓ (read-only) | ✗ |
| **Modify Settings** | ✓ | ✗ | ✗ | ✗ |
| **Enable/Disable RFID** | ✓ | ✗ | ✗ | ✗ |
| **Configure Image Mode** | ✓ | ✗ | ✗ | ✗ |
| **Manage Locations** | ✓ | ✓ | ✗ | ✗ |

### User Management

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View Users** | ✓ | ✓ | ✗ | ✗ |
| **Create User** | ✓ | ✗ | ✗ | ✗ |
| **Edit User** | ✓ | ✗ | ✗ | ✗ |
| **Delete User** | ✓ | ✗ | ✗ | ✗ |
| **Assign Roles** | ✓ | ✗ | ✗ | ✗ |
| **Reset Password** | ✓ | ✗ | ✗ | ✗ |

### Admin Functions

| Action | Admin | Manager | Operator | ReadOnly |
|--------|:-----:|:-------:|:--------:|:--------:|
| **View Audit Logs** | ✓ | ✓ (read-only) | ✗ | ✗ |
| **Correct Locked Batch** | ✓ | ✗ | ✗ | ✗ |
| **Override Duplicate Check** | ✓ | ✗ | ✗ | ✗ |
| **Database Backup** | ✓ | ✗ | ✗ | ✗ |
| **Data Import** | ✓ | ✗ | ✗ | ✗ |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Operator', 'ReadOnly')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL,
  last_login_at TEXT,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant_role ON users(tenant_id, role);
CREATE INDEX idx_users_tenant_status ON users(tenant_id, status);
```

---

## Permission Check Implementation

### Permission Service
```typescript
// src/domain/services/permission.service.ts
export class PermissionService {
  
  canViewEntity(user: User, entity: Entity): boolean {
    // Everyone can view entities in their tenant
    return user.tenant_id === entity.tenant_id;
  }
  
  canEditEntity(user: User, entity: Entity): boolean {
    return (
      user.tenant_id === entity.tenant_id &&
      (user.role === 'Admin' || user.role === 'Manager')
    );
  }
  
  canDeleteEntity(user: User, entity: Entity): boolean {
    return (
      user.tenant_id === entity.tenant_id &&
      user.role === 'Admin'
    );
  }
  
  canCloseBatch(user: User, batch: Batch): boolean {
    return (
      user.tenant_id === batch.tenant_id &&
      user.role !== 'ReadOnly' &&
      batch.status === 'Open'
    );
  }
  
  canLockBatch(user: User, batch: Batch): boolean {
    return (
      user.tenant_id === batch.tenant_id &&
      (user.role === 'Admin' || user.role === 'Manager') &&
      batch.status === 'Closed'
    );
  }
  
  canCorrectLockedBatch(user: User, batch: Batch): boolean {
    return (
      user.tenant_id === batch.tenant_id &&
      user.role === 'Admin'
    );
  }
  
  canModifySettings(user: User): boolean {
    return user.role === 'Admin';
  }
}
```

### Usage in ViewModels
```typescript
// src/presentation/viewmodels/batch-detail.viewmodel.ts
export class BatchDetailViewModel {
  constructor(
    private batch: Batch,
    private currentUser: User,
    private permissions: PermissionService
  ) {}
  
  get canClose(): boolean {
    return this.permissions.canCloseBatch(this.currentUser, this.batch);
  }
  
  get canLock(): boolean {
    return this.permissions.canLockBatch(this.currentUser, this.batch);
  }
  
  async closeBatch(): Promise<void> {
    if (!this.canClose) {
      throw new PermissionDeniedError('Cannot close batch');
    }
    
    await this.batchRepository.update({
      ...this.batch,
      status: 'Closed',
      closed_at: new Date(),
    });
  }
}
```

### UI Conditional Rendering
```typescript
// Hide/disable buttons based on permissions
export const BatchDetailScreen: React.FC = () => {
  const viewModel = useBatchDetailViewModel();
  
  return (
    <View>
      {viewModel.canClose && (
        <Button title="Close Batch" onPress={viewModel.closeBatch} />
      )}
      
      {viewModel.canLock && (
        <Button title="Lock Batch" onPress={viewModel.lockBatch} />
      )}
      
      {!viewModel.canClose && (
        <Text style={styles.info}>
          Only managers can close batches
        </Text>
      )}
    </View>
  );
};
```

---

## Audit Trail

### Audit Log Table
```sql
CREATE TABLE audit_logs (
  log_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  changes TEXT,  -- JSON
  timestamp TEXT NOT NULL,
  ip_address TEXT,
  
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_audit_tenant_user ON audit_logs(tenant_id, user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
```

### Log All Sensitive Actions
```typescript
// What gets logged
const AUDIT_ACTIONS = [
  'entity.create',
  'entity.edit',
  'entity.delete',
  'batch.create',
  'batch.close',
  'batch.lock',
  'batch.reopen',
  'transaction.create',
  'transaction.edit',
  'transaction.delete',
  'transaction.move',  // Move to different batch
  'user.create',
  'user.edit',
  'user.delete',
  'settings.modify',
];
```

---

## Future Enhancements (V2+)

### Custom Roles
- Allow creating custom roles with specific permissions
- Permission builder UI

### Fine-Grained Permissions
- Per-feature toggles
- Data-level permissions (can only see own entities)
- Time-based permissions (operator can close batch within 24 hours)

### Approval Workflows
- Batch close requires manager approval
- Locked batch corrections require dual approval
- Configurable approval chains

### Delegation
- Temporary permission grants
- "Acting as" another user (with audit trail)

---

*Keep permissions simple. Add complexity only when users ask for it.*

