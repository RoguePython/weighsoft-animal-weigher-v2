/**
 * SQLite Custom Field List Repository Implementation
 * 
 * Implements ICustomFieldListRepository using SQLite database.
 */

import { CustomFieldList } from '@/domain/entities/custom-field-list';
import { ICustomFieldListRepository } from '@/domain/repositories/custom-field-list.repository';
import * as SQLite from 'expo-sqlite';

export class SqliteCustomFieldListRepository implements ICustomFieldListRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async findById(cflId: string): Promise<CustomFieldList | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM custom_field_lists WHERE cfl_id = ?',
      [cflId]
    );
    return result ? this.mapToCFL(result) : null;
  }

  async findAll(tenantId: string): Promise<CustomFieldList[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM custom_field_lists WHERE tenant_id = ? ORDER BY name, version DESC',
      [tenantId]
    );
    return results.map((r) => this.mapToCFL(r));
  }

  async findSystemDefaults(tenantId: string): Promise<CustomFieldList[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM custom_field_lists WHERE tenant_id = ? AND is_system_default = 1 ORDER BY name',
      [tenantId]
    );
    return results.map((r) => this.mapToCFL(r));
  }

  async create(cfl: CustomFieldList): Promise<CustomFieldList> {
    await this.db.runAsync(
      `INSERT INTO custom_field_lists (
        cfl_id, tenant_id, name, version, is_system_default, fields,
        created_at, created_by, updated_at, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cfl.cfl_id,
        cfl.tenant_id,
        cfl.name,
        cfl.version,
        cfl.is_system_default ? 1 : 0,
        JSON.stringify(cfl.fields),
        cfl.created_at.toISOString(),
        cfl.created_by,
        cfl.updated_at.toISOString(),
        cfl.updated_by || null,
      ]
    );
    return cfl;
  }

  async update(cfl: CustomFieldList): Promise<CustomFieldList> {
    await this.db.runAsync(
      `UPDATE custom_field_lists SET
        name = ?, version = ?, fields = ?, updated_at = ?, updated_by = ?
      WHERE cfl_id = ?`,
      [
        cfl.name,
        cfl.version,
        JSON.stringify(cfl.fields),
        new Date().toISOString(),
        cfl.updated_by || null,
        cfl.cfl_id,
      ]
    );
    return cfl;
  }

  async delete(cflId: string): Promise<void> {
    // Only allow deletion of non-system defaults
    await this.db.runAsync(
      'DELETE FROM custom_field_lists WHERE cfl_id = ? AND is_system_default = 0',
      [cflId]
    );
  }

  private mapToCFL(row: any): CustomFieldList {
    return {
      cfl_id: row.cfl_id,
      tenant_id: row.tenant_id,
      name: row.name,
      version: row.version,
      is_system_default: row.is_system_default === 1,
      fields: JSON.parse(row.fields || '[]'),
      created_at: new Date(row.created_at),
      created_by: row.created_by,
      updated_at: new Date(row.updated_at),
      updated_by: row.updated_by || undefined,
    };
  }
}

