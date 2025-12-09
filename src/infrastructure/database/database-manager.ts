/**
 * Database Manager
 * 
 * Manages SQLite database connection, migrations, and initialization.
 */

import * as SQLite from 'expo-sqlite';
import { seedDefaultData } from './seed-default-data';

const DATABASE_NAME = 'weighsoft_animal_weigher.db';
const DATABASE_VERSION = 1;

export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static async create(): Promise<DatabaseManager> {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
      await DatabaseManager.instance.initialize();
    }
    return DatabaseManager.instance;
  }

  private async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await this.runMigrations();
    if (this.db) {
      await seedDefaultData(this.db);
    }
  }

  get database(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call create() first.');
    }
    return this.db;
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    // Create migrations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    // Get current version
    const result = await this.db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM schema_migrations'
    );
    const currentVersion = result?.version || 0;

    // Run migrations
    if (currentVersion < 1) {
      await this.runMigration001();
      await this.db.runAsync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        [1, new Date().toISOString()]
      );
    }

    if (currentVersion < 2) {
      await this.runMigration002();
      await this.db.runAsync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        [2, new Date().toISOString()]
      );
    }
  }

  private async runMigration001(): Promise<void> {
    if (!this.db) return;

    // Create all tables
    await this.db.execAsync(`
      -- Tenants
      CREATE TABLE IF NOT EXISTS tenants (
        tenant_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        settings TEXT,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active'
      );

      -- Users
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Operator', 'ReadOnly')),
        created_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
        UNIQUE (tenant_id, email)
      );

      -- Custom Field Lists
      CREATE TABLE IF NOT EXISTS custom_field_lists (
        cfl_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        is_system_default INTEGER NOT NULL DEFAULT 0,
        fields TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
        UNIQUE (tenant_id, name, version)
      );

      -- Entities (Animals)
      CREATE TABLE IF NOT EXISTS entities (
        entity_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        primary_tag TEXT NOT NULL,
        rfid_tag TEXT,
        species TEXT NOT NULL CHECK (species IN ('cattle', 'sheep', 'pig', 'goat')),
        breed TEXT,
        sex TEXT CHECK (sex IN ('M', 'F', 'Unknown')),
        birth_date TEXT,
        status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Sold', 'Dead', 'Culled')),
        current_group TEXT,
        source_type TEXT CHECK (source_type IN ('Farm', 'Auction', 'Feedlot', 'Other')),
        source_name TEXT,
        target_weight_kg REAL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT,
        UNIQUE (tenant_id, primary_tag),
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
      );

      -- Batches (Weighing Sessions)
      CREATE TABLE IF NOT EXISTS batches (
        batch_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('Arrival', 'Routine', 'Shipment', 'Auction', 'Other')),
        location_id TEXT,
        scale_device_id TEXT,
        cfl_id TEXT NOT NULL,
        cfl_version INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Open', 'Closed', 'Locked')),
        started_at TEXT,
        closed_at TEXT,
        locked_at TEXT,
        locked_by TEXT,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
        FOREIGN KEY (cfl_id) REFERENCES custom_field_lists(cfl_id)
      );

      -- Transactions (Weigh Events)
      CREATE TABLE IF NOT EXISTS transactions (
        tx_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        batch_id TEXT NOT NULL,
        weight_kg REAL NOT NULL,
        timestamp TEXT NOT NULL,
        scale_device_id TEXT,
        operator_id TEXT NOT NULL,
        reason TEXT NOT NULL CHECK (reason IN ('Arrival', 'Monthly', 'Shipment', 'Reweigh', 'Other')),
        location_id TEXT,
        is_estimated_weight INTEGER NOT NULL DEFAULT 0,
        confidence_score REAL,
        custom_fields_definition_snapshot TEXT NOT NULL,
        custom_field_values TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
        FOREIGN KEY (entity_id) REFERENCES entities(entity_id),
        FOREIGN KEY (batch_id) REFERENCES batches(batch_id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_entities_tenant_status ON entities(tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_entities_rfid ON entities(tenant_id, rfid_tag) WHERE rfid_tag IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_entities_group ON entities(tenant_id, current_group) WHERE current_group IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_entities_species ON entities(tenant_id, species);
      CREATE INDEX IF NOT EXISTS idx_entities_target_weight ON entities(tenant_id, target_weight_kg) WHERE target_weight_kg IS NOT NULL;
      
      CREATE INDEX IF NOT EXISTS idx_batches_tenant_status ON batches(tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_batches_type ON batches(tenant_id, type);
      CREATE INDEX IF NOT EXISTS idx_batches_created ON batches(tenant_id, created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_transactions_entity ON transactions(entity_id, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_transactions_batch ON transactions(batch_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_transactions_tenant_timestamp ON transactions(tenant_id, timestamp DESC);
      
      CREATE INDEX IF NOT EXISTS idx_cfl_tenant ON custom_field_lists(tenant_id, name);
    `);
  }

  private async runMigration002(): Promise<void> {
    if (!this.db) return;

    // Create growth_metrics view
    await this.db.execAsync(`
      CREATE VIEW IF NOT EXISTS growth_metrics AS
      SELECT
        t.tx_id,
        t.entity_id,
        t.timestamp,
        t.weight_kg,
        LAG(t.weight_kg) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp) AS previous_weight,
        LAG(t.timestamp) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp) AS previous_timestamp,
        t.weight_kg - LAG(t.weight_kg) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp) AS weight_change,
        CAST((julianday(t.timestamp) - julianday(LAG(t.timestamp) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp))) AS REAL) AS days_between
      FROM transactions t;
    `);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

