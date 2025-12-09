# ADR 001: Core Fields vs Custom Fields in Data Model

**Date**: 2024-12-09  
**Status**: ✅ Accepted  
**Deciders**: Product Team, Technical Lead  
**Context Tags**: #data-model #architecture #scalability

---

## Context

The WeighsoftAnimalWeigherV2 app needs to capture animal data that serves multiple purposes:
1. Core identification and classification (used in 80%+ of operations)
2. Business-specific metadata (varies by customer)
3. Regulatory/compliance data (varies by region)

Initial design heavily favored "custom fields" for flexibility, but this creates risks:
- Performance degradation (JSON blob queries)
- Integration challenges (unstable schema)
- Report complexity (no fixed columns)
- Data quality issues (no enforced types)

## Decision

**We will use FIRST-CLASS (structured) fields for core animal attributes, and reserve custom fields for truly variable, client-specific data.**

### First-Class Fields (Core Model)

**Entity (Animal)**:
- `entity_id` (GUID, primary key)
- `primary_tag` (string, unique per customer)
- `rfid_tag` (string, nullable, unique when present)
- `species` (enum: cattle, sheep, pig, goat)
- `breed` (string, nullable)
- `sex` (enum: M, F, Unknown)
- `birth_date` (date, nullable)
- `status` (enum: Active, Sold, Dead, Culled)
- `current_group` (string, nullable - pen/lot ID)
- `source_type` (enum, nullable)
- `source_name` (string, nullable)

**Transaction (Weigh Event)**:
- `tx_id` (GUID, primary key)
- `entity_id` (FK)
- `batch_id` (FK)
- `weight_kg` (decimal)
- `timestamp` (datetime)
- `operator_id` (FK)
- `reason` (enum)
- `location_id` (string, nullable)
- `is_estimated_weight` (boolean)

### Custom Fields (Flexible Metadata)

Reserved for:
- ✅ Client-specific commercial data (contract IDs, buyer codes)
- ✅ Regional regulatory fields (NVD numbers, EU permits)
- ✅ Pilot/experimental data
- ❌ NOT for identity, classification, or status

## Rationale

### Performance
```sql
-- ✅ FAST: First-class field query
SELECT * FROM entities WHERE species = 'cattle' AND sex = 'M';
-- Uses index, <10ms

-- ❌ SLOW: Custom field query
SELECT * FROM entities WHERE custom_fields->>'species' = 'cattle';
-- No index, table scan, 500ms+
```

### Reporting
```typescript
// ✅ EASY: Type-safe reporting
const report = entities.groupBy(e => e.species);

// ❌ HARD: Custom field reporting
const report = entities.groupBy(e => e.custom_fields['species'] as string);
// No type safety, runtime errors
```

### Integrations
```typescript
// ✅ STABLE: API contract
interface AnimalDTO {
  id: string;
  tag: string;
  species: 'cattle' | 'sheep' | 'pig' | 'goat';
  // Clear, versioned schema
}

// ❌ UNSTABLE: Custom fields
interface AnimalDTO {
  id: string;
  custom_fields: Record<string, unknown>;
  // Breaking changes, no validation
}
```

### Data Quality
```typescript
// ✅ ENFORCED: Database constraints
species ENUM('cattle', 'sheep', 'pig', 'goat') NOT NULL

// ❌ UNVALIDATED: JSON blob
custom_fields JSON
-- Can contain anything, including garbage
```

## Consequences

### Positive
- ✅ **10x faster queries** on core fields (indexed)
- ✅ **Type-safe** throughout the application
- ✅ **Stable API contracts** for integrations
- ✅ **Easy reporting** without JSON parsing
- ✅ **Data quality** enforced at database level

### Negative
- ⚠️ **Schema migrations** required for new core fields
- ⚠️ **Less flexibility** for one-off customer requests
- ⚠️ **More upfront design** needed

### Mitigation
- Use semantic versioning for schema changes
- Provide 3-6 month notice for breaking changes
- Use custom fields for true edge cases
- Pre-configure sensible defaults (see ADR 002)

## Alternatives Considered

### Alternative 1: Everything in Custom Fields
**Rejected**: Too slow, no data quality, integration nightmare

### Alternative 2: Hybrid with "Promoted Fields"
**Considered**: Start with custom fields, promote frequently-used ones to core
**Rejected**: Migration pain, inconsistent historical data

### Alternative 3: EAV (Entity-Attribute-Value) Pattern
**Rejected**: Querying complexity, poor performance at scale

## Validation

### Before Implementation
- [x] Review with 3 target customers
- [x] Benchmark query performance (see perf tests)
- [x] Validate against top 10 reports

### After Implementation
- [ ] Monitor query times (<50ms for core field queries)
- [ ] Track custom field usage (should be <20% of fields)
- [ ] Customer feedback (ease of reporting)

## References

- [Database Normalization Best Practices](https://en.wikipedia.org/wiki/Database_normalization)
- [When to Use JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)
- [Clean Architecture - Entity Design](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Related ADRs**:
- ADR 002: Default Custom Field Lists
- ADR 003: RFID as First-Class Identity Mechanism

