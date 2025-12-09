/**
 * Entity (Animal) Domain Entity
 * 
 * Represents a persistent animal identity across all weighing events.
 * This is the core domain entity for the animal weigher application.
 */

export type Species = 'cattle' | 'sheep' | 'pig' | 'goat';
export type Sex = 'M' | 'F' | 'Unknown';
export type EntityStatus = 'Active' | 'Sold' | 'Dead' | 'Culled';
export type SourceType = 'Farm' | 'Auction' | 'Feedlot' | 'Other';

export interface Entity {
  // Primary Key
  entity_id: string;
  tenant_id: string;

  // Identity
  primary_tag: string;
  rfid_tag?: string;

  // Classification
  species: Species;
  breed?: string;
  name?: string; // Manual name entry (alternative to species selection)
  sex: Sex;
  birth_date?: Date;

  // Status
  status: EntityStatus;
  current_group?: string;

  // Provenance
  source_type?: SourceType;
  source_name?: string;

  // Target Weight (NEW)
  target_weight_kg?: number;

  // Metadata
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by?: string;
}

/**
 * Helper methods for Entity
 */
export class EntityHelper {
  /**
   * Check if target weight has been reached
   * @param entity The entity to check
   * @param currentWeight The current weight of the entity
   * @returns true if currentWeight >= target_weight_kg
   */
  static isTargetWeightReached(entity: Entity, currentWeight: number): boolean {
    if (!entity.target_weight_kg) {
      return false;
    }
    return currentWeight >= entity.target_weight_kg;
  }

  /**
   * Calculate progress percentage toward target weight
   * @param entity The entity to check
   * @param currentWeight The current weight of the entity
   * @returns Progress percentage (0-100), or 0 if no target set
   */
  static getTargetWeightProgress(entity: Entity, currentWeight: number): number {
    if (!entity.target_weight_kg || entity.target_weight_kg <= 0) {
      return 0;
    }
    const progress = (currentWeight / entity.target_weight_kg) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  /**
   * Check if entity is active
   */
  static isActive(entity: Entity): boolean {
    return entity.status === 'Active';
  }
}

