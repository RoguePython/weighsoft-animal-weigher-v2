/**
 * Growth Performance Report Generator
 * 
 * Generates CSV export with ADG and feed data.
 */

import { Entity } from '@/domain/entities/entity';
import { GrowthMetrics } from '@/domain/services/growth-calculation.service';
import { Transaction } from '@/domain/entities/transaction';

export interface GrowthPerformanceReportRow {
  entity_id: string;
  primary_tag: string;
  species: string;
  first_weight: number;
  latest_weight: number;
  total_gain: number;
  days_on_feed: number;
  avg_daily_gain: number;
  feed_type?: string;
  target_weight?: number;
  target_progress: number;
}

export class GrowthPerformanceReportGenerator {
  /**
   * Generate CSV content for growth performance report
   */
  generateCSV(rows: GrowthPerformanceReportRow[]): string {
    const headers = [
      'entity_id',
      'primary_tag',
      'species',
      'first_weight',
      'latest_weight',
      'total_gain',
      'days_on_feed',
      'avg_daily_gain',
      'feed_type',
      'target_weight',
      'target_progress',
    ];

    const csvRows = rows.map((row) => [
      row.entity_id,
      row.primary_tag,
      row.species,
      row.first_weight.toFixed(1),
      row.latest_weight.toFixed(1),
      row.total_gain.toFixed(1),
      row.days_on_feed,
      row.avg_daily_gain.toFixed(2),
      row.feed_type || '',
      row.target_weight?.toFixed(1) || '',
      row.target_progress.toFixed(1),
    ]);

    return [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Generate report rows from entities and their metrics
   */
  generateRows(
    entities: Entity[],
    metricsMap: Map<string, GrowthMetrics>,
    transactionsMap: Map<string, Transaction[]>
  ): GrowthPerformanceReportRow[] {
    return entities.map((entity) => {
      const metrics = metricsMap.get(entity.entity_id);
      const transactions = transactionsMap.get(entity.entity_id) || [];

      // Get feed type from latest transaction
      const latestTransaction = transactions[transactions.length - 1];
      const feedType =
        latestTransaction?.custom_field_values['routine_feed_type'] || undefined;

      return {
        entity_id: entity.entity_id,
        primary_tag: entity.primary_tag,
        species: entity.species,
        first_weight: metrics?.first_weight || 0,
        latest_weight: metrics?.latest_weight || 0,
        total_gain: metrics?.total_gain || 0,
        days_on_feed: metrics?.total_days || 0,
        avg_daily_gain: metrics?.avg_daily_gain || 0,
        feed_type: feedType,
        target_weight: entity.target_weight_kg,
        target_progress: entity.target_weight_kg
          ? ((metrics?.latest_weight || 0) / entity.target_weight_kg) * 100
          : 0,
      };
    });
  }
}

