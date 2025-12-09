/**
 * SQLite Transaction Repository Implementation
 * 
 * Implements ITransactionRepository using SQLite database.
 */

import { Transaction } from '@/domain/entities/transaction';
import {
  ITransactionRepository,
  GrowthMetric,
  FeedPerformanceMetric,
} from '@/domain/repositories/transaction.repository';
import * as SQLite from 'expo-sqlite';

export class SqliteTransactionRepository implements ITransactionRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async findById(txId: string): Promise<Transaction | null> {
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM transactions WHERE tx_id = ?',
      [txId]
    );
    return result ? this.mapToTransaction(result) : null;
  }

  async findByEntityId(entityId: string): Promise<Transaction[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE entity_id = ? ORDER BY timestamp ASC',
      [entityId]
    );
    return results.map((r) => this.mapToTransaction(r));
  }

  async findLatestByEntityId(entityId: string, limit: number = 10): Promise<Transaction[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE entity_id = ? ORDER BY timestamp DESC LIMIT ?',
      [entityId, limit]
    );
    return results.map((r) => this.mapToTransaction(r));
  }

  async findByBatchId(batchId: string): Promise<Transaction[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE batch_id = ? ORDER BY timestamp ASC',
      [batchId]
    );
    return results.map((r) => this.mapToTransaction(r));
  }

  async getGrowthMetrics(entityId: string, limit?: number): Promise<GrowthMetric[]> {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const results = await this.db.getAllAsync<any>(
      `SELECT 
        tx_id, entity_id, timestamp, weight_kg,
        previous_weight, previous_timestamp, weight_change, days_between
      FROM growth_metrics
      WHERE entity_id = ?
      ORDER BY timestamp DESC
      ${limitClause}`,
      [entityId]
    );
    return results.map((r) => ({
      tx_id: r.tx_id,
      entity_id: r.entity_id,
      timestamp: new Date(r.timestamp),
      weight_kg: parseFloat(r.weight_kg),
      previous_weight: r.previous_weight ? parseFloat(r.previous_weight) : null,
      previous_timestamp: r.previous_timestamp ? new Date(r.previous_timestamp) : null,
      weight_change: r.weight_change ? parseFloat(r.weight_change) : null,
      days_between: r.days_between ? parseFloat(r.days_between) : null,
    }));
  }

  async getFeedPerformanceMetrics(
    tenantId: string,
    feedType: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<FeedPerformanceMetric[]> {
    let query = `
      SELECT 
        t.entity_id,
        t.custom_field_values,
        MIN(t.timestamp) as first_timestamp,
        MAX(t.timestamp) as latest_timestamp,
        (SELECT weight_kg FROM transactions WHERE entity_id = t.entity_id AND timestamp = MIN(t.timestamp)) as first_weight,
        (SELECT weight_kg FROM transactions WHERE entity_id = t.entity_id AND timestamp = MAX(t.timestamp)) as latest_weight
      FROM transactions t
      WHERE t.tenant_id = ?
        AND json_extract(t.custom_field_values, '$.routine_feed_type') = ?
    `;
    const params: any[] = [tenantId, feedType];

    if (dateRange) {
      query += ' AND t.timestamp >= ? AND t.timestamp <= ?';
      params.push(dateRange.start.toISOString(), dateRange.end.toISOString());
    }

    query += ' GROUP BY t.entity_id';

    const results = await this.db.getAllAsync<any>(query, params);

    return results.map((r) => {
      const firstWeight = parseFloat(r.first_weight);
      const latestWeight = parseFloat(r.latest_weight);
      const daysOnFeed = Math.floor(
        (new Date(r.latest_timestamp).getTime() - new Date(r.first_timestamp).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const totalGain = latestWeight - firstWeight;
      const adg = daysOnFeed > 0 ? totalGain / daysOnFeed : 0;

      const customFields = JSON.parse(r.custom_field_values || '{}');

      return {
        feed_type: feedType,
        feed_brand: customFields.routine_feed_brand,
        entity_id: r.entity_id,
        first_weight: firstWeight,
        latest_weight: latestWeight,
        total_gain: totalGain,
        days_on_feed: daysOnFeed,
        adg: adg,
      };
    });
  }

  async findByFeedType(
    tenantId: string,
    feedType: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<Transaction[]> {
    let query = `
      SELECT * FROM transactions
      WHERE tenant_id = ?
        AND json_extract(custom_field_values, '$.routine_feed_type') = ?
    `;
    const params: any[] = [tenantId, feedType];

    if (dateRange) {
      query += ' AND timestamp >= ? AND timestamp <= ?';
      params.push(dateRange.start.toISOString(), dateRange.end.toISOString());
    }

    query += ' ORDER BY timestamp ASC';

    const results = await this.db.getAllAsync<any>(query, params);
    return results.map((r) => this.mapToTransaction(r));
  }

  async findAllByDateRange(
    tenantId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<Transaction[]> {
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE tenant_id = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC',
      [tenantId, dateRange.start.toISOString(), dateRange.end.toISOString()]
    );
    return results.map((r) => this.mapToTransaction(r));
  }

  async getHealthFlags(entityId: string): Promise<Transaction[]> {
    // Get transactions where weight decreased from previous
    const results = await this.db.getAllAsync<any>(
      `SELECT t.*
      FROM transactions t
      INNER JOIN growth_metrics gm ON t.tx_id = gm.tx_id
      WHERE t.entity_id = ?
        AND gm.weight_change < 0
      ORDER BY t.timestamp DESC`,
      [entityId]
    );
    return results.map((r) => this.mapToTransaction(r));
  }

  async create(transaction: Transaction): Promise<Transaction> {
    await this.db.runAsync(
      `INSERT INTO transactions (
        tx_id, tenant_id, entity_id, batch_id, weight_kg, timestamp,
        scale_device_id, operator_id, reason, location_id,
        is_estimated_weight, confidence_score,
        custom_fields_definition_snapshot, custom_field_values,
        notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.tx_id,
        transaction.tenant_id,
        transaction.entity_id,
        transaction.batch_id,
        transaction.weight_kg,
        transaction.timestamp.toISOString(),
        transaction.scale_device_id || null,
        transaction.operator_id,
        transaction.reason,
        transaction.location_id || null,
        transaction.is_estimated_weight ? 1 : 0,
        transaction.confidence_score || null,
        JSON.stringify(transaction.custom_fields_definition_snapshot),
        JSON.stringify(transaction.custom_field_values),
        transaction.notes || null,
        transaction.created_at.toISOString(),
      ]
    );
    return transaction;
  }

  async update(transaction: Transaction): Promise<Transaction> {
    await this.db.runAsync(
      `UPDATE transactions SET
        weight_kg = ?, timestamp = ?, notes = ?
      WHERE tx_id = ?`,
      [
        transaction.weight_kg,
        transaction.timestamp.toISOString(),
        transaction.notes || null,
        transaction.tx_id,
      ]
    );
    return transaction;
  }

  async delete(txId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM transactions WHERE tx_id = ?', [txId]);
  }

  private mapToTransaction(row: any): Transaction {
    return {
      tx_id: row.tx_id,
      tenant_id: row.tenant_id,
      entity_id: row.entity_id,
      batch_id: row.batch_id,
      weight_kg: parseFloat(row.weight_kg),
      timestamp: new Date(row.timestamp),
      scale_device_id: row.scale_device_id || undefined,
      operator_id: row.operator_id,
      reason: row.reason,
      location_id: row.location_id || undefined,
      is_estimated_weight: row.is_estimated_weight === 1,
      confidence_score: row.confidence_score ? parseFloat(row.confidence_score) : undefined,
      custom_fields_definition_snapshot: JSON.parse(
        row.custom_fields_definition_snapshot || '[]'
      ),
      custom_field_values: JSON.parse(row.custom_field_values || '{}'),
      notes: row.notes || undefined,
      created_at: new Date(row.created_at),
    };
  }
}

