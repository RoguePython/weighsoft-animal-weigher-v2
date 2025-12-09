/**
 * Batch Repository Interface
 * 
 * Defines the contract for batch data access operations.
 */

import { Batch } from '../entities/batch';

export interface IBatchRepository {
  /**
   * Find batch by ID
   */
  findById(batchId: string): Promise<Batch | null>;

  /**
   * Find all batches for a tenant
   */
  findAll(tenantId: string): Promise<Batch[]>;

  /**
   * Find batches by status
   */
  findByStatus(tenantId: string, status: Batch['status']): Promise<Batch[]>;

  /**
   * Find open batches
   */
  findOpen(tenantId: string): Promise<Batch[]>;

  /**
   * Create a new batch
   */
  create(batch: Batch): Promise<Batch>;

  /**
   * Update an existing batch
   */
  update(batch: Batch): Promise<Batch>;

  /**
   * Start a batch (change status from Draft to Open)
   */
  start(batchId: string): Promise<void>;

  /**
   * Close a batch (change status from Open to Closed)
   */
  close(batchId: string): Promise<void>;

  /**
   * Delete a batch (only if Draft status)
   */
  delete(batchId: string): Promise<void>;
}

