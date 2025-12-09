/**
 * Target Weight Service
 * 
 * Provides business logic for target weight management:
 * - Ready to sell checks
 * - Progress calculations
 */

import { Entity } from '../entities/entity';
import { EntityHelper } from '../entities/entity';

export interface TargetWeightProgress {
  current_weight: number;
  target_weight: number;
  progress_percent: number;
  remaining_kg: number;
  is_ready: boolean;
}

export class TargetWeightService {
  /**
   * Check if entity is ready to sell (current weight >= target weight)
   */
  isReadyToSell(entity: Entity, currentWeight: number): boolean {
    return EntityHelper.isTargetWeightReached(entity, currentWeight);
  }

  /**
   * Get progress percentage toward target weight
   * @returns Progress percentage (0-100), or 0 if no target set
   */
  getProgressPercentage(entity: Entity, currentWeight: number): number {
    return EntityHelper.getTargetWeightProgress(entity, currentWeight);
  }

  /**
   * Calculate comprehensive target weight progress
   */
  calculateProgress(entity: Entity, currentWeight: number): TargetWeightProgress {
    if (!entity.target_weight_kg || entity.target_weight_kg <= 0) {
      return {
        current_weight: currentWeight,
        target_weight: 0,
        progress_percent: 0,
        remaining_kg: 0,
        is_ready: false,
      };
    }

    const progressPercent = EntityHelper.getTargetWeightProgress(entity, currentWeight);
    const remainingKg = Math.max(0, entity.target_weight_kg - currentWeight);
    const isReady = EntityHelper.isTargetWeightReached(entity, currentWeight);

    return {
      current_weight: currentWeight,
      target_weight: entity.target_weight_kg,
      progress_percent: progressPercent,
      remaining_kg: remainingKg,
      is_ready: isReady,
    };
  }
}

