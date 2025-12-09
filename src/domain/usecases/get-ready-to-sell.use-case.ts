/**
 * Get Ready to Sell Use Case
 * 
 * Finds animals that have reached their target weight and are ready for sale.
 */

import { Entity } from '../entities/entity';
import { IEntityRepository } from '../repositories/entity.repository';
import { ITransactionRepository } from '../repositories/transaction.repository';
import { TargetWeightService } from '../services/target-weight.service';

export interface ReadyToSellFilters {
  species?: Entity['species'];
  current_group?: string;
  min_progress_percent?: number;
}

export interface ReadyToSellEntity {
  entity: Entity;
  current_weight: number;
  target_weight: number;
  progress_percent: number;
  remaining_kg: number;
  last_weighed: Date;
}

export class GetReadyToSellUseCase {
  constructor(
    private entityRepository: IEntityRepository,
    private transactionRepository: ITransactionRepository,
    private targetWeightService: TargetWeightService
  ) {}

  /**
   * Get all entities ready to sell (at or above target weight)
   */
  async execute(tenantId: string, filters?: ReadyToSellFilters): Promise<ReadyToSellEntity[]> {
    // Get all active entities with target weights
    const entities = await this.entityRepository.findByTargetWeightReached(tenantId);

    // Filter by optional criteria
    let filtered = entities.filter((entity) => {
      if (filters?.species && entity.species !== filters.species) {
        return false;
      }
      if (filters?.current_group && entity.current_group !== filters.current_group) {
        return false;
      }
      return true;
    });

    // Get latest weight for each entity
    const results: ReadyToSellEntity[] = [];

    for (const entity of filtered) {
      if (!entity.target_weight_kg) {
        continue;
      }

      // Get latest transaction
      const latestTransactions = await this.transactionRepository.findLatestByEntityId(
        entity.entity_id,
        1
      );

      if (latestTransactions.length === 0) {
        continue;
      }

      const currentWeight = latestTransactions[0].weight_kg;
      const progress = this.targetWeightService.calculateProgress(entity, currentWeight);

      // Apply min_progress_percent filter if specified
      if (filters?.min_progress_percent) {
        if (progress.progress_percent < filters.min_progress_percent) {
          continue;
        }
      }

      results.push({
        entity,
        current_weight: currentWeight,
        target_weight: entity.target_weight_kg,
        progress_percent: progress.progress_percent,
        remaining_kg: progress.remaining_kg,
        last_weighed: latestTransactions[0].timestamp,
      });
    }

    // Sort by progress (descending) - most ready first
    results.sort((a, b) => b.progress_percent - a.progress_percent);

    return results;
  }
}

