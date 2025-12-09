/**
 * Compare Feed Performance Use Case
 * 
 * Analyzes and compares performance metrics by feed type:
 * - Average Daily Gain (ADG) by feed type
 * - Total gain by feed type
 * - Animal count per feed type
 */

import { Transaction } from '../entities/transaction';
import { GrowthCalculationService } from '../services/growth-calculation.service';

export interface ITransactionRepository {
  findByFeedType(
    tenantId: string,
    feedType: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<Transaction[]>;
  findAllByDateRange(
    tenantId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<Transaction[]>;
}

export interface FeedPerformanceMetrics {
  feed_type: string;
  feed_brand?: string;
  animal_count: number;
  total_transactions: number;
  avg_adg: number;
  avg_total_gain: number;
  avg_days_on_feed: number;
  performance_rank?: number;
}

export interface FeedComparisonResult {
  metrics: FeedPerformanceMetrics[];
  date_range: { start: Date; end: Date };
  total_animals: number;
}

export class CompareFeedPerformanceUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private growthCalculationService: GrowthCalculationService
  ) {}

  /**
   * Compare feed performance across all feed types
   */
  async execute(
    tenantId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<FeedComparisonResult> {
    // Get all transactions in date range
    const allTransactions = await this.transactionRepository.findAllByDateRange(
      tenantId,
      dateRange
    );

    // Group by feed type
    const feedGroups = new Map<string, Transaction[]>();

    for (const tx of allTransactions) {
      const feedType = tx.custom_field_values['routine_feed_type'] as string | undefined;
      if (feedType) {
        if (!feedGroups.has(feedType)) {
          feedGroups.set(feedType, []);
        }
        feedGroups.get(feedType)!.push(tx);
      }
    }

    // Calculate metrics for each feed type
    const metrics: FeedPerformanceMetrics[] = [];

    for (const [feedType, transactions] of feedGroups.entries()) {
      const entityGroups = new Map<string, Transaction[]>();

      // Group by entity
      for (const tx of transactions) {
        if (!entityGroups.has(tx.entity_id)) {
          entityGroups.set(tx.entity_id, []);
        }
        entityGroups.get(tx.entity_id)!.push(tx);
      }

      // Calculate ADG for each entity
      const adgValues: number[] = [];
      const totalGains: number[] = [];
      const daysOnFeed: number[] = [];

      for (const [entityId, entityTransactions] of entityGroups.entries()) {
        if (entityTransactions.length < 2) {
          continue;
        }

        const sorted = [...entityTransactions].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const days = Math.floor(
          (last.timestamp.getTime() - first.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (days > 0) {
          const adg = this.growthCalculationService.calculateADG(
            first.weight_kg,
            last.weight_kg,
            days
          );
          const totalGain = last.weight_kg - first.weight_kg;

          adgValues.push(adg);
          totalGains.push(totalGain);
          daysOnFeed.push(days);
        }
      }

      // Calculate averages
      const avgAdg =
        adgValues.length > 0
          ? adgValues.reduce((sum, val) => sum + val, 0) / adgValues.length
          : 0;
      const avgTotalGain =
        totalGains.length > 0
          ? totalGains.reduce((sum, val) => sum + val, 0) / totalGains.length
          : 0;
      const avgDaysOnFeed =
        daysOnFeed.length > 0
          ? daysOnFeed.reduce((sum, val) => sum + val, 0) / daysOnFeed.length
          : 0;

      // Get feed brand (from first transaction)
      const feedBrand = transactions[0].custom_field_values['routine_feed_brand'] as
        | string
        | undefined;

      metrics.push({
        feed_type: feedType,
        feed_brand: feedBrand,
        animal_count: entityGroups.size,
        total_transactions: transactions.length,
        avg_adg: avgAdg,
        avg_total_gain: avgTotalGain,
        avg_days_on_feed: avgDaysOnFeed,
      });
    }

    // Sort by ADG (descending) and assign ranks
    metrics.sort((a, b) => b.avg_adg - a.avg_adg);
    metrics.forEach((metric, index) => {
      metric.performance_rank = index + 1;
    });

    // Get unique entity count
    const uniqueEntities = new Set(allTransactions.map((tx) => tx.entity_id));

    return {
      metrics,
      date_range: dateRange,
      total_animals: uniqueEntities.size,
    };
  }
}

