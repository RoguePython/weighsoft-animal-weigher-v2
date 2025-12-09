/**
 * Seed Default Data
 * 
 * Creates default tenant, user, and CFLs for initial setup.
 */

import * as SQLite from 'expo-sqlite';
import { generateUUID } from '@/shared/utils/uuid';
import { seedDefaultCFLs } from './seed-default-cfls';

const DEFAULT_TENANT_ID = 'default-tenant';
const DEFAULT_USER_ID = 'default-user';

export async function seedDefaultData(db: SQLite.SQLiteDatabase): Promise<void> {
  // Check if tenant already exists
  const existingTenant = await db.getFirstAsync<{ tenant_id: string }>(
    'SELECT tenant_id FROM tenants WHERE tenant_id = ?',
    [DEFAULT_TENANT_ID]
  );

  if (!existingTenant) {
    // Create default tenant
    await db.runAsync(
      `INSERT INTO tenants (tenant_id, name, settings, created_at, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        DEFAULT_TENANT_ID,
        'Default Farm',
        JSON.stringify({}),
        new Date().toISOString(),
        'Active',
      ]
    );

    // Create default user
    await db.runAsync(
      `INSERT INTO users (user_id, tenant_id, email, name, role, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_USER_ID,
        DEFAULT_TENANT_ID,
        'admin@farm.com',
        'Admin User',
        'Admin',
        new Date().toISOString(),
        'Active',
      ]
    );

    // Seed default CFLs
    await seedDefaultCFLs(db, DEFAULT_TENANT_ID, DEFAULT_USER_ID);
  } else {
    // Tenant exists, but check if CFLs need seeding
    await seedDefaultCFLs(db, DEFAULT_TENANT_ID, DEFAULT_USER_ID);
  }
}

