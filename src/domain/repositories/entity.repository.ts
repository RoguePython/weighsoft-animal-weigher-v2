/**
 * Entity Repository Interface
 * 
 * Defines the contract for entity data access operations.
 */

import { Entity } from '../entities/entity';

export interface IEntityRepository {
  /**
   * Find entity by ID
   */
  findById(entityId: string): Promise<Entity | null>;

  /**
   * Find all entities for a tenant
   */
  findAll(tenantId: string): Promise<Entity[]>;

  /**
   * Find entities by status
   */
  findByStatus(tenantId: string, status: Entity['status']): Promise<Entity[]>;

  /**
   * Find entities by species
   */
  findBySpecies(tenantId: string, species: Entity['species']): Promise<Entity[]>;

  /**
   * Find entities that have reached their target weight
   */
  findByTargetWeightReached(tenantId: string): Promise<Entity[]>;

  /**
   * Create a new entity
   */
  create(entity: Entity): Promise<Entity>;

  /**
   * Update an existing entity
   */
  update(entity: Entity): Promise<Entity>;

  /**
   * Update target weight for an entity
   */
  updateTargetWeight(entityId: string, targetWeight: number): Promise<void>;

  /**
   * Find entities by current group (batch)
   */
  findByGroup(tenantId: string, groupId: string): Promise<Entity[]>;

  /**
   * Delete an entity (soft delete by updating status)
   */
  delete(entityId: string): Promise<void>;
}

