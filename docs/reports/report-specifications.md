# Report Specifications

**Version**: 1.0 (MVP)  
**Last Updated**: December 2024

---

## Report Philosophy (MVP)

**Keep it simple**: CSV exports with clear column names. Users can open in Excel and analyze.

**NOT in MVP**: 
- ❌ PDF reports with charts
- ❌ Scheduled reports (email automation)
- ❌ Custom report builder
- ❌ Interactive dashboards

**Future (V2)**: Add based on user feedback.

---

## Report 1: Batch Summary

**Purpose**: Summary of a completed batch

**Trigger**: Export button on Batch Detail screen

**Format**: CSV

**Filename**: `batch-summary-{batch_name}-{date}.csv`

### Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `batch_id` | UUID | Internal ID | `abc-123-def` |
| `batch_name` | Text | User-friendly name | `Pen 7 - Dec 2024` |
| `batch_type` | Text | Arrival/Routine/Shipment | `Routine` |
| `status` | Text | Current status | `Closed` |
| `created_at` | ISO Date | When created | `2024-12-09T10:00:00Z` |
| `closed_at` | ISO Date | When closed | `2024-12-09T15:30:00Z` |
| `total_animals` | Number | Count of animals weighed | `47` |
| `average_weight_kg` | Number | Mean weight | `465.8` |
| `min_weight_kg` | Number | Lightest animal | `420.0` |
| `max_weight_kg` | Number | Heaviest animal | `510.5` |
| `weight_loss_flagged` | Number | Count with weight loss | `3` |
| `duration_minutes` | Number | Time to complete | `42` |

### Sample Output
```csv
batch_id,batch_name,batch_type,status,created_at,closed_at,total_animals,average_weight_kg,min_weight_kg,max_weight_kg,weight_loss_flagged,duration_minutes
abc-123,Pen 7 - Dec 2024,Routine,Closed,2024-12-09T10:00:00Z,2024-12-09T15:30:00Z,47,465.8,420.0,510.5,3,42
```

---

## Report 2: Batch Transactions (Detailed)

**Purpose**: All transactions in a batch with full details

**Trigger**: Export button on Batch Detail screen (secondary option)

**Format**: CSV

**Filename**: `batch-transactions-{batch_name}-{date}.csv`

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `tx_id` | UUID | Transaction ID |
| `timestamp` | ISO DateTime | When weighed |
| `entity_id` | UUID | Animal ID |
| `primary_tag` | Text | Visual tag |
| `rfid_tag` | Text | RFID (if present) |
| `species` | Text | cattle/sheep/pig/goat |
| `weight_kg` | Number | Recorded weight |
| `weight_loss_flag` | Boolean | true/false |
| `previous_weight_kg` | Number | Last weight (if available) |
| `days_since_last_weigh` | Number | Days between weighs |
| `operator` | Text | Who performed weigh |
| `notes` | Text | Transaction notes |
| `custom_field_*` | Various | One column per custom field |

### Sample Output
```csv
tx_id,timestamp,entity_id,primary_tag,rfid_tag,species,weight_kg,weight_loss_flag,previous_weight_kg,days_since_last_weigh,operator,notes,custom_field_feed_phase,custom_field_health_status
tx-001,2024-12-09T10:05:00Z,ent-001,A1234,RFID-001,cattle,455.0,false,450.0,30,john.smith,,Grower,Normal
tx-002,2024-12-09T10:07:00Z,ent-002,A1235,RFID-002,cattle,448.0,true,455.0,30,john.smith,Possible illness,Grower,Suspect
```

---

## Report 3: Animal History

**Purpose**: Complete weight history for a single animal

**Trigger**: Export button on Animal Detail screen

**Format**: CSV

**Filename**: `animal-history-{tag}-{date}.csv`

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `entity_id` | UUID | Animal ID |
| `primary_tag` | Text | Visual tag |
| `rfid_tag` | Text | RFID |
| `species` | Text | Species |
| `breed` | Text | Breed (if set) |
| `sex` | Text | M/F/Unknown |
| `tx_timestamp` | ISO DateTime | When weighed |
| `batch_name` | Text | Batch it was in |
| `weight_kg` | Number | Weight |
| `weight_change_kg` | Number | Change from previous |
| `days_since_last` | Number | Days between weighs |
| `avg_daily_gain_kg` | Number | Simple ADG |
| `operator` | Text | Who weighed |

### Sample Output
```csv
entity_id,primary_tag,rfid_tag,species,breed,sex,tx_timestamp,batch_name,weight_kg,weight_change_kg,days_since_last,avg_daily_gain_kg,operator
ent-001,A1234,RFID-001,cattle,Angus,M,2024-11-09T10:00:00Z,Arrival Nov,380.0,,,
ent-001,A1234,RFID-001,cattle,Angus,M,2024-12-09T10:05:00Z,Routine Dec,455.0,75.0,30,2.5,john.smith
```

---

## Report 4: Weight Loss Report

**Purpose**: All animals with weight loss (for manager review)

**Trigger**: Reports menu > "Animals with Weight Loss"

**Format**: CSV

**Filename**: `weight-loss-report-{date}.csv`

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `primary_tag` | Text | Visual tag |
| `rfid_tag` | Text | RFID |
| `species` | Text | Species |
| `current_weight_kg` | Number | Latest weight |
| `previous_weight_kg` | Number | Previous weight |
| `weight_loss_kg` | Number | Absolute loss |
| `weight_loss_percent` | Number | Percentage loss |
| `days_between` | Number | Days between weighs |
| `last_weighed` | ISO Date | When last weighed |
| `batch_name` | Text | Batch of last weigh |
| `current_group` | Text | Pen/Lot |
| `status` | Text | Active/Sold/etc |

### Sample Output
```csv
primary_tag,rfid_tag,species,current_weight_kg,previous_weight_kg,weight_loss_kg,weight_loss_percent,days_between,last_weighed,batch_name,current_group,status
A1235,RFID-002,cattle,448.0,455.0,-7.0,-1.5,30,2024-12-09,Routine Dec,Pen 7,Active
A1456,RFID-045,cattle,422.0,440.0,-18.0,-4.1,30,2024-12-09,Routine Dec,Pen 7,Active
```

---

## Report 5: Auction Readiness

**Purpose**: Animals ready for auction/sale

**Trigger**: Reports menu > "Auction Ready Animals"

**Format**: CSV

**Filename**: `auction-ready-{date}.csv`

### Filter Criteria (MVP - Simple)

```typescript
// Simple auction readiness
function isAuctionReady(entity: Entity, lastWeight: number): boolean {
  // Basic rules - user can customize in settings later
  return (
    entity.status === 'Active' &&
    lastWeight >= 400 &&  // Minimum weight
    lastWeight <= 600     // Maximum weight
  );
}
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `primary_tag` | Text | Visual tag |
| `rfid_tag` | Text | RFID |
| `species` | Text | Species |
| `breed` | Text | Breed |
| `sex` | Text | M/F |
| `current_weight_kg` | Number | Latest weight |
| `last_weighed` | ISO Date | When last weighed |
| `days_on_feed` | Number | Days since arrival |
| `arrival_weight_kg` | Number | Initial weight |
| `total_gain_kg` | Number | Weight gain |
| `avg_daily_gain_kg` | Number | ADG |
| `current_group` | Text | Pen/Lot |

---

## Report Export Implementation

### CSV Generation
```typescript
// src/data/services/report-generator.ts
export class ReportGenerator {
  
  async generateBatchSummary(batchId: string): Promise<string> {
    const batch = await batchRepository.findById(batchId);
    const stats = await this.calculateBatchStats(batchId);
    
    const csv = [
      // Header
      'batch_id,batch_name,batch_type,status,created_at,closed_at,total_animals,average_weight_kg,min_weight_kg,max_weight_kg,weight_loss_flagged,duration_minutes',
      // Data
      [
        batch.batch_id,
        batch.name,
        batch.type,
        batch.status,
        batch.created_at.toISOString(),
        batch.closed_at?.toISOString() || '',
        stats.total_animals,
        stats.average_weight.toFixed(1),
        stats.min_weight.toFixed(1),
        stats.max_weight.toFixed(1),
        stats.weight_loss_count,
        stats.duration_minutes,
      ].join(','),
    ].join('\n');
    
    return csv;
  }
  
  async exportToFile(csv: string, filename: string): Promise<void> {
    // React Native file system
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, csv, 'utf8');
    
    // Share dialog
    await Share.open({
      url: `file://${path}`,
      type: 'text/csv',
    });
  }
}
```

### UI Export Button
```typescript
// On Batch Detail screen
<Button
  title="Export CSV"
  onPress={async () => {
    const csv = await reportGenerator.generateBatchSummary(batch.batch_id);
    await reportGenerator.exportToFile(
      csv, 
      `batch-summary-${batch.name}-${today}.csv`
    );
  }}
/>
```

---

## Future Reports (V2+)

Based on user feedback, consider adding:

1. **Growth Performance Report**
   - Compare ADG by feed phase
   - Identify top/bottom performers
   - Feed efficiency metrics

2. **Pen Comparison Report**
   - Average weight by pen
   - Variance analysis
   - Performance trends

3. **Supplier Analysis**
   - Performance by source farm
   - Arrival weight trends
   - Quality metrics

4. **Compliance Export**
   - Format for regulatory submission
   - Traceability chain
   - Movement records

5. **PDF Reports with Charts**
   - Weight curves
   - Distribution graphs
   - Trend analysis

---

*Start simple with CSV. Let users tell us what reports they need.*

