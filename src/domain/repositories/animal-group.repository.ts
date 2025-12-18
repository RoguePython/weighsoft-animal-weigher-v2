/**
 * Animal Group Repository Interface
 * 
 * Defines the contract for animal group data access operations.
 */

import { AnimalGroup } from '../entities/animal-group';
import { Entity } from '../entities/entity';

export interface IAnimalGroupRepository {
  /**
   * Find animal group by ID
   */
  findById(groupId: string): Promise<AnimalGroup | null>;

  /**
   * Find all animal groups for a tenant
   */
  findAll(tenantId: string): Promise<AnimalGroup[]>;

  /**
   * Create a new animal group
   */
  create(group: AnimalGroup): Promise<AnimalGroup>;

  /**
   * Update an existing animal group
   */
  update(group: AnimalGroup): Promise<AnimalGroup>;

  /**
   * Delete an animal group
   */
  delete(groupId: string): Promise<void>;

  /**
   * Get all animals in a group
   */
  getAnimalsInGroup(groupId: string): Promise<Entity[]>;

  /**
   * Add animals to a group
   */
  addAnimalsToGroup(groupId: string, entityIds: string[]): Promise<void>;

  /**
   * Remove animals from a group
   */
  removeAnimalsFromGroup(groupId: string, entityIds: string[]): Promise<void>;

  /**
   * Get all groups an animal belongs to
   */
  getGroupsForAnimal(entityId: string): Promise<AnimalGroup[]>;
}

