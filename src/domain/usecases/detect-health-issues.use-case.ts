/**
 * Detect Health Issues Use Case
 * 
 * Detects health issues based on weight patterns:
 * - Weight loss with severity levels
 * - Consecutive losses
 */

import { Transaction } from '../entities/transaction';
import { HealthDetectionService, HealthFlag } from '../services/health-detection.service';

export interface ITransactionRepository {
  findByEntityId(entityId: string): Promise<Transaction[]>;
  findLatestByEntityId(entityId: string, limit?: number): Promise<Transaction[]>;
}

export class DetectHealthIssuesUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private healthDetectionService: HealthDetectionService
  ) {}

  /**
   * Detect health issues for an entity
   * @param entityId The entity ID
   * @param newWeight Optional new weight to check against latest
   * @returns Array of health flags
   */
  async execute(entityId: string, newWeight?: number): Promise<HealthFlag[]> {
    // Get transaction history
    const transactions = await this.transactionRepository.findByEntityId(entityId);

    if (transactions.length < 2) {
      return [];
    }

    // If new weight provided, create a temporary transaction for comparison
    if (newWeight !== undefined) {
      const latest = transactions[transactions.length - 1];
      const tempTransaction: Transaction = {
        ...latest,
        tx_id: 'temp',
        weight_kg: newWeight,
        timestamp: new Date(),
      };

      const daysBetween = Math.floor(
        (tempTransaction.timestamp.getTime() - latest.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      );

      const lossFlag = this.healthDetectionService.detectWeightLoss(
        newWeight,
        latest.weight_kg,
        daysBetween
      );

      if (lossFlag) {
        return [lossFlag];
      }
    }

    // Detect all health issues from history
    return this.healthDetectionService.detectHealthIssues(transactions);
  }
}

