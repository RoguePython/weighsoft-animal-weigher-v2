/**
 * Calculate Growth Metrics Use Case
 * 
 * Calculates comprehensive growth metrics for an entity including:
 * - Average Daily Gain (ADG)
 * - Total gain
 * - Weekly gains
 */

import { Entity } from '../entities/entity';
import { Transaction } from '../entities/transaction';
import { GrowthCalculationService, GrowthMetrics } from '../services/growth-calculation.service';

export interface ITransactionRepository {
  findByEntityId(entityId: string): Promise<Transaction[]>;
}

export class CalculateGrowthMetricsUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private growthCalculationService: GrowthCalculationService
  ) {}

  async execute(entityId: string): Promise<GrowthMetrics> {
    // Get all transactions for this entity
    const transactions = await this.transactionRepository.findByEntityId(entityId);

    if (transactions.length === 0) {
      throw new Error(`No transactions found for entity ${entityId}`);
    }

    // Get entity (we'll need to inject entity repository later)
    // For now, we'll use a placeholder entity
    const entity: Entity = {
      entity_id: entityId,
      tenant_id: transactions[0].tenant_id,
      primary_tag: '',
      species: 'cattle',
      status: 'Active',
      created_at: new Date(),
      created_by: '',
      updated_at: new Date(),
    };

    // Calculate metrics
    return this.growthCalculationService.calculateGrowthMetrics(entity, transactions);
  }
}

