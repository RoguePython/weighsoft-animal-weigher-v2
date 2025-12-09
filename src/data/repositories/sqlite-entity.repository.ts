/**
 * SQLite Entity Repository Implementation
 * 
 * Implements IEntityRepository using SQLite database.
 */

import { Entity } from '@/domain/entities/entity';
import { IEntityRepository } from '@/domain/repositories/entity.repository';
import * as SQLite from 'expo-sqlite';

export class SqliteEntityRepository implements IEntityRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async findById(entityId: string): Promise<Entity | null> {
    const result = await this.db.getFirstAsync<Entity>(
      'SELECT * FROM entities WHERE entity_id = ?',
      [entityId]
    );
    return result ? this.mapToEntity(result) : null;
  }

  async findAll(tenantId: string): Promise<Entity[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM entities WHERE tenant_id = ? ORDER BY primary_tag',
      [tenantId]
    );
    return results.map((r) => this.mapToEntity(r));
  }

  async findByStatus(tenantId: string, status: Entity['status']): Promise<Entity[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM entities WHERE tenant_id = ? AND status = ? ORDER BY primary_tag',
      [tenantId, status]
    );
    return results.map((r) => this.mapToEntity(r));
  }

  async findBySpecies(tenantId: string, species: Entity['species']): Promise<Entity[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM entities WHERE tenant_id = ? AND species = ? ORDER BY primary_tag',
      [tenantId, species]
    );
    return results.map((r) => this.mapToEntity(r));
  }

  async findByTargetWeightReached(tenantId: string): Promise<Entity[]> {
    // Find entities with target weight set and where current weight >= target
    // This requires joining with transactions to get latest weight
    const results = await this.db.getAllAsync<any>(
      `SELECT DISTINCT e.*
       FROM entities e
       INNER JOIN transactions t ON e.entity_id = t.entity_id
       INNER JOIN (
         SELECT entity_id, MAX(timestamp) as max_timestamp
         FROM transactions
         WHERE tenant_id = ?
         GROUP BY entity_id
       ) latest ON t.entity_id = latest.entity_id AND t.timestamp = latest.max_timestamp
       WHERE e.tenant_id = ?
         AND e.target_weight_kg IS NOT NULL
         AND e.status = 'Active'
         AND t.weight_kg >= e.target_weight_kg
       ORDER BY e.primary_tag`,
      [tenantId, tenantId]
    );
    return results.map((r) => this.mapToEntity(r));
  }

  /**
   * Find entities by current group (batch)
   */
  async findByGroup(tenantId: string, groupId: string): Promise<Entity[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM entities WHERE tenant_id = ? AND current_group = ? ORDER BY primary_tag',
      [tenantId, groupId]
    );
    return results.map((r) => this.mapToEntity(r));
  }

  async create(entity: Entity): Promise<Entity> {
    // Store name in breed field for now (or we could add a name column)
    // For simplicity, using breed field to store manual name
    await this.db.runAsync(
      `INSERT INTO entities (
        entity_id, tenant_id, primary_tag, rfid_tag, species, breed, sex, birth_date,
        status, current_group, source_type, source_name, target_weight_kg,
        created_at, created_by, updated_at, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.entity_id,
        entity.tenant_id,
        entity.primary_tag,
        entity.rfid_tag || null,
        entity.species,
        entity.name || entity.breed || null, // Use name if provided, otherwise breed
        entity.sex,
        entity.birth_date ? entity.birth_date.toISOString() : null,
        entity.status,
        entity.current_group || null,
        entity.source_type || null,
        entity.source_name || null,
        entity.target_weight_kg || null,
        entity.created_at.toISOString(),
        entity.created_by,
        entity.updated_at.toISOString(),
        entity.updated_by || null,
      ]
    );
    return entity;
  }

  async update(entity: Entity): Promise<Entity> {
    await this.db.runAsync(
      `UPDATE entities SET
        primary_tag = ?, rfid_tag = ?, species = ?, breed = ?, sex = ?, birth_date = ?,
        status = ?, current_group = ?, source_type = ?, source_name = ?, target_weight_kg = ?,
        updated_at = ?, updated_by = ?
      WHERE entity_id = ?`,
      [
        entity.primary_tag,
        entity.rfid_tag || null,
        entity.species,
        entity.name || entity.breed || null, // Use name if provided, otherwise breed
        entity.sex,
        entity.birth_date ? entity.birth_date.toISOString() : null,
        entity.status,
        entity.current_group || null,
        entity.source_type || null,
        entity.source_name || null,
        entity.target_weight_kg || null,
        new Date().toISOString(),
        entity.updated_by || null,
        entity.entity_id,
      ]
    );
    return entity;
  }

  async updateTargetWeight(entityId: string, targetWeight: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE entities SET target_weight_kg = ?, updated_at = ? WHERE entity_id = ?',
      [targetWeight, new Date().toISOString(), entityId]
    );
  }

  async delete(entityId: string): Promise<void> {
    // Soft delete by updating status
    await this.db.runAsync(
      "UPDATE entities SET status = 'Culled', updated_at = ? WHERE entity_id = ?",
      [new Date().toISOString(), entityId]
    );
  }

  private mapToEntity(row: any): Entity {
    // Name is stored in breed field for now (since we don't have a separate name column)
    // If breed contains a name (not a breed), treat it as name
    const breedOrName = row.breed || undefined;
    return {
      entity_id: row.entity_id,
      tenant_id: row.tenant_id,
      primary_tag: row.primary_tag,
      rfid_tag: row.rfid_tag || undefined,
      species: row.species,
      breed: breedOrName, // This may contain name or breed
      name: breedOrName, // Treat breed as name for now
      sex: row.sex,
      birth_date: row.birth_date ? new Date(row.birth_date) : undefined,
      status: row.status,
      current_group: row.current_group || undefined,
      source_type: row.source_type || undefined,
      source_name: row.source_name || undefined,
      target_weight_kg: row.target_weight_kg ? parseFloat(row.target_weight_kg) : undefined,
      created_at: new Date(row.created_at),
      created_by: row.created_by,
      updated_at: new Date(row.updated_at),
      updated_by: row.updated_by || undefined,
    };
  }
}

