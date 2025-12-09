/**
 * Batch (Weighing Session) Domain Entity
 * 
 * Represents a group of related weighing events.
 */

export type BatchType = 'Arrival' | 'Routine' | 'Shipment' | 'Auction' | 'Other';
export type BatchStatus = 'Draft' | 'Open' | 'Closed' | 'Locked';

export interface Batch {
  batch_id: string;
  tenant_id: string;

  // Identity
  name: string;
  type: BatchType;

  // Configuration
  location_id?: string;
  scale_device_id?: string;
  cfl_id: string;
  cfl_version: number;

  // Lifecycle
  status: BatchStatus;
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

