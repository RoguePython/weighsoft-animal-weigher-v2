/**
 * Seed Default Custom Field Lists
 * 
 * Creates default CFLs for a tenant on initialization.
 */

import * as SQLite from 'expo-sqlite';
import { generateUUID } from '@/shared/utils/uuid';
import { defaultCFLs } from './seed/default-cfls';
import { CustomFieldList } from '@/domain/entities/custom-field-list';

export async function seedDefaultCFLs(
  db: SQLite.SQLiteDatabase,
  tenantId: string,
  userId: string
): Promise<void> {
  // Check if CFLs already exist
  const existing = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM custom_field_lists WHERE tenant_id = ? AND is_system_default = 1',
    [tenantId]
  );

  if (existing && existing.count > 0) {
    return; // Already seeded
  }

  const now = new Date();

  for (const cflConfig of defaultCFLs) {
    const cfl: CustomFieldList = {
      cfl_id: generateUUID(),
      tenant_id: tenantId,
      name: cflConfig.name,
      version: 1,
      is_system_default: true,
      fields: cflConfig.fields,
      created_at: now,
      created_by: userId,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO custom_field_lists (
        cfl_id, tenant_id, name, version, is_system_default, fields,
        created_at, created_by, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );
  }
}

