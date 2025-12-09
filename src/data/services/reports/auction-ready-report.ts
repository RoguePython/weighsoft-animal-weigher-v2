/**
 * Auction Ready Report Generator (Enhanced)
 * 
 * Generates CSV export with target weight and progress columns.
 */

import { ReadyToSellEntity } from '@/domain/usecases/get-ready-to-sell.use-case';

export interface AuctionReadyReportRow {
  primary_tag: string;
  rfid_tag?: string;
  species: string;
  breed?: string;
  sex: string;
  current_weight_kg: number;
  last_weighed: Date;
  days_on_feed: number;
  arrival_weight_kg: number;
  total_gain_kg: number;
  avg_daily_gain_kg: number;
  current_group?: string;
  target_weight_kg?: number;
  target_progress_percent: number;
  days_to_target?: number;
}

export class AuctionReadyReportGenerator {
  /**
   * Generate CSV content for auction ready report
   */
  generateCSV(rows: AuctionReadyReportRow[]): string {
    const headers = [
      'primary_tag',
      'rfid_tag',
      'species',
      'breed',
      'sex',
      'current_weight_kg',
      'last_weighed',
      'days_on_feed',
      'arrival_weight_kg',
      'total_gain_kg',
      'avg_daily_gain_kg',
      'current_group',
      'target_weight_kg',
      'target_progress_percent',
      'days_to_target',
    ];

    const csvRows = rows.map((row) => [
      row.primary_tag,
      row.rfid_tag || '',
      row.species,
      row.breed || '',
      row.sex,
      row.current_weight_kg.toFixed(1),
      row.last_weighed.toISOString(),
      row.days_on_feed.toString(),
      row.arrival_weight_kg.toFixed(1),
      row.total_gain_kg.toFixed(1),
      row.avg_daily_gain_kg.toFixed(2),
      row.current_group || '',
      row.target_weight_kg?.toFixed(1) || '',
      row.target_progress_percent.toFixed(1),
      row.days_to_target?.toFixed(0) || '',
    ]);

    return [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Generate report rows from ready to sell entities
   */
  generateRows(entities: ReadyToSellEntity[]): AuctionReadyReportRow[] {
    return entities.map((item) => {
      const entity = item.entity;
      const daysToTarget =
        item.progress_percent < 100 && item.remaining_kg > 0
          ? Math.ceil(item.remaining_kg / (item.current_weight / 30)) // Rough estimate
          : undefined;

      return {
        primary_tag: entity.primary_tag,
        rfid_tag: entity.rfid_tag,
        species: entity.species,
        breed: entity.breed,
        sex: entity.sex,
        current_weight_kg: item.current_weight,
        last_weighed: item.last_weighed,
        days_on_feed: 0, // Would be calculated from transactions
        arrival_weight_kg: 0, // Would be from first transaction
        total_gain_kg: 0, // Would be calculated
        avg_daily_gain_kg: 0, // Would be calculated
        current_group: entity.current_group,
        target_weight_kg: entity.target_weight_kg,
        target_progress_percent: item.progress_percent,
        days_to_target: daysToTarget,
      };
    });
  }

  /**
   * Generate filename for auction ready report
   */
  generateFilename(): string {
    const date = new Date().toISOString().split('T')[0];
    return `auction-ready-${date}.csv`;
  }
}

