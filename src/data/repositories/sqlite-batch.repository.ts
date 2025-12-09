/**
 * SQLite Batch Repository Implementation
 * 
 * Implements IBatchRepository using SQLite database.
 */

import { Batch } from '@/domain/entities/batch';
import { IBatchRepository } from '@/domain/repositories/batch.repository';
import * as SQLite from 'expo-sqlite';

export class SqliteBatchRepository implements IBatchRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async findById(batchId: string): Promise<Batch | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM batches WHERE batch_id = ?',
      [batchId]
    );
    return result ? this.mapToBatch(result) : null;
  }

  async findAll(tenantId: string): Promise<Batch[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM batches WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );
    return results.map((r) => this.mapToBatch(r));
  }

  async findByStatus(tenantId: string, status: Batch['status']): Promise<Batch[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM batches WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC',
      [tenantId, status]
    );
    return results.map((r) => this.mapToBatch(r));
  }

  async findOpen(tenantId: string): Promise<Batch[]> {
    return this.findByStatus(tenantId, 'Open');
  }

  async create(batch: Batch): Promise<Batch> {
    await this.db.runAsync(
      `INSERT INTO batches (
        batch_id, tenant_id, name, type, location_id, scale_device_id,
        cfl_id, cfl_version, status, started_at, closed_at, locked_at, locked_by,
        created_at, created_by, updated_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        batch.batch_id,
        batch.tenant_id,
        batch.name,
        batch.type,
        batch.location_id || null,
        batch.scale_device_id || null,
        batch.cfl_id,
        batch.cfl_version,
        batch.status,
        batch.started_at ? batch.started_at.toISOString() : null,
        batch.closed_at ? batch.closed_at.toISOString() : null,
        batch.locked_at ? batch.locked_at.toISOString() : null,
        batch.locked_by || null,
        batch.created_at.toISOString(),
        batch.created_by,
        batch.updated_at.toISOString(),
        batch.notes || null,
      ]
    );
    return batch;
  }

  async update(batch: Batch): Promise<Batch> {
    await this.db.runAsync(
      `UPDATE batches SET
        name = ?, type = ?, location_id = ?, scale_device_id = ?,
        cfl_id = ?, cfl_version = ?, status = ?,
        started_at = ?, closed_at = ?, locked_at = ?, locked_by = ?,
        updated_at = ?, notes = ?
      WHERE batch_id = ?`,
      [
        batch.name,
        batch.type,
        batch.location_id || null,
        batch.scale_device_id || null,
        batch.cfl_id,
        batch.cfl_version,
        batch.status,
        batch.started_at ? batch.started_at.toISOString() : null,
        batch.closed_at ? batch.closed_at.toISOString() : null,
        batch.locked_at ? batch.locked_at.toISOString() : null,
        batch.locked_by || null,
        new Date().toISOString(),
        batch.notes || null,
        batch.batch_id,
      ]
    );
    return batch;
  }

  async start(batchId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE batches SET
        status = 'Open',
        started_at = ?,
        updated_at = ?
      WHERE batch_id = ?`,
      [new Date().toISOString(), new Date().toISOString(), batchId]
    );
  }

  async close(batchId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE batches SET
        status = 'Closed',
        closed_at = ?,
        updated_at = ?
      WHERE batch_id = ?`,
      [new Date().toISOString(), new Date().toISOString(), batchId]
    );
  }

  async delete(batchId: string): Promise<void> {
    // Only allow deletion of Draft batches
    await this.db.runAsync(
      "DELETE FROM batches WHERE batch_id = ? AND status = 'Draft'",
      [batchId]
    );
  }

  private mapToBatch(row: any): Batch {
    return {
      batch_id: row.batch_id,
      tenant_id: row.tenant_id,
      name: row.name,
      type: row.type,
      location_id: row.location_id || undefined,
      scale_device_id: row.scale_device_id || undefined,
      cfl_id: row.cfl_id,
      cfl_version: row.cfl_version,
      status: row.status,
      started_at: row.started_at ? new Date(row.started_at) : undefined,
      closed_at: row.closed_at ? new Date(row.closed_at) : undefined,
      locked_at: row.locked_at ? new Date(row.locked_at) : undefined,
      locked_by: row.locked_by || undefined,
      created_at: new Date(row.created_at),
      created_by: row.created_by,
      updated_at: new Date(row.updated_at),
      notes: row.notes || undefined,
    };
  }
}

