/**
 * Transaction (Weigh Event) Domain Entity
 * 
 * Represents a single weighing measurement with full context.
 */

import { CustomFieldDefinition } from './custom-field-list';

export type TransactionReason = 'Arrival' | 'Monthly' | 'Shipment' | 'Reweigh' | 'Other';

export interface Transaction {
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
  reason: TransactionReason;
  location_id?: string;

  // Quality
  is_estimated_weight: boolean;
  confidence_score?: number; // 0.0-1.0 (for future ML)

  // Custom Data (Immutable Snapshot)
  custom_fields_definition_snapshot: CustomFieldDefinition[];
  custom_field_values: Record<string, any>;

  // Metadata
  notes?: string;
  created_at: Date;
}

