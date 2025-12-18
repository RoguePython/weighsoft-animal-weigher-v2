/**
 * SQLite Animal Group Repository Implementation
 * 
 * Implements IAnimalGroupRepository using SQLite database.
 */

import { SQLiteDatabase } from 'expo-sqlite';
import { AnimalGroup } from '@/domain/entities/animal-group';
import { Entity } from '@/domain/entities/entity';
import { IAnimalGroupRepository } from '@/domain/repositories/animal-group.repository';

export class SqliteAnimalGroupRepository implements IAnimalGroupRepository {
  constructor(private db: SQLiteDatabase) {}

  async findById(groupId: string): Promise<AnimalGroup | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM animal_groups WHERE group_id = ?',
      [groupId]
    );

    if (!result) return null;

    return this.mapToAnimalGroup(result);
  }

  async findAll(tenantId: string): Promise<AnimalGroup[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM animal_groups WHERE tenant_id = ? ORDER BY name ASC',
      [tenantId]
    );

    return results.map((r) => this.mapToAnimalGroup(r));
  }

  async create(group: AnimalGroup): Promise<AnimalGroup> {
    await this.db.runAsync(
      `INSERT INTO animal_groups (
        group_id, tenant_id, name, description,
        created_at, created_by, updated_at, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        group.group_id,
        group.tenant_id,
        group.name,
        group.description || null,
        group.created_at.toISOString(),
        group.created_by,
        group.updated_at.toISOString(),
        group.updated_by || null,
      ]
    );

    return group;
  }

  async update(group: AnimalGroup): Promise<AnimalGroup> {
    await this.db.runAsync(
      `UPDATE animal_groups SET
        name = ?, description = ?, updated_at = ?, updated_by = ?
      WHERE group_id = ?`,
      [
        group.name,
        group.description || null,
        group.updated_at.toISOString(),
        group.updated_by || null,
        group.group_id,
      ]
    );

    return group;
  }

  async delete(groupId: string): Promise<void> {
    // Cascade delete will handle animal_group_members
    await this.db.runAsync('DELETE FROM animal_groups WHERE group_id = ?', [groupId]);
  }

  async getAnimalsInGroup(groupId: string): Promise<Entity[]> {
    const results = await this.db.getAllAsync<any>(
      `SELECT e.* FROM entities e
       INNER JOIN animal_group_members agm ON e.entity_id = agm.entity_id
       WHERE agm.group_id = ?
       ORDER BY e.primary_tag ASC`,
      [groupId]
    );

    // Map to Entity - we'll need to import the mapping function or duplicate it
    return results.map((row) => ({
      entity_id: row.entity_id,
      tenant_id: row.tenant_id,
      primary_tag: row.primary_tag,
      rfid_tag: row.rfid_tag || undefined,
      species: row.species,
      breed: row.breed || undefined,
      name: row.name || undefined,
      sex: row.sex,
      birth_date: row.birth_date ? new Date(row.birth_date) : undefined,
      status: row.status,
      current_group: row.current_group || undefined,
      source_type: row.source_type || undefined,
      source_name: row.source_name || undefined,
      target_weight_kg: row.target_weight_kg || undefined,
      created_at: new Date(row.created_at),
      created_by: row.created_by,
      updated_at: new Date(row.updated_at),
      updated_by: row.updated_by || undefined,
    }));
  }

  async addAnimalsToGroup(groupId: string, entityIds: string[]): Promise<void> {
    if (entityIds.length === 0) return;

    const now = new Date().toISOString();
    const DEFAULT_USER_ID = 'default-user';

    // Use transaction for batch insert
    await this.db.withTransactionAsync(async () => {
      for (const entityId of entityIds) {
        // Check if already in group
        const existing = await this.db.getFirstAsync<{ count: number }>(
          'SELECT COUNT(*) as count FROM animal_group_members WHERE group_id = ? AND entity_id = ?',
          [groupId, entityId]
        );

        if (existing && existing.count === 0) {
          await this.db.runAsync(
            'INSERT INTO animal_group_members (group_id, entity_id, added_at, added_by) VALUES (?, ?, ?, ?)',
            [groupId, entityId, now, DEFAULT_USER_ID]
          );
        }
      }
    });
  }

  async removeAnimalsFromGroup(groupId: string, entityIds: string[]): Promise<void> {
    if (entityIds.length === 0) return;

    await this.db.withTransactionAsync(async () => {
      for (const entityId of entityIds) {
        await this.db.runAsync(
          'DELETE FROM animal_group_members WHERE group_id = ? AND entity_id = ?',
          [groupId, entityId]
        );
      }
    });
  }

  async getGroupsForAnimal(entityId: string): Promise<AnimalGroup[]> {
    const results = await this.db.getAllAsync<any>(
      `SELECT ag.* FROM animal_groups ag
       INNER JOIN animal_group_members agm ON ag.group_id = agm.group_id
       WHERE agm.entity_id = ?
       ORDER BY ag.name ASC`,
      [entityId]
    );

    return results.map((r) => this.mapToAnimalGroup(r));
  }

  private mapToAnimalGroup(row: any): AnimalGroup {
    return {
      group_id: row.group_id,
      tenant_id: row.tenant_id,
      name: row.name,
      description: row.description || undefined,
      created_at: new Date(row.created_at),
      created_by: row.created_by,
      updated_at: new Date(row.updated_at),
      updated_by: row.updated_by || undefined,
    };
  }
}

