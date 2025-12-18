/**
 * Transaction Repository Interface
 * 
 * Defines the contract for transaction data access operations.
 */

import { Transaction } from '../entities/transaction';

export interface GrowthMetric {
  tx_id: string;
  entity_id: string;
  timestamp: Date;
  weight_kg: number;
  previous_weight: number | null;
  previous_timestamp: Date | null;
  weight_change: number | null;
  days_between: number | null;
}

export interface FeedPerformanceMetric {
  feed_type: string;
  feed_brand?: string;
  entity_id: string;
  first_weight: number;
  latest_weight: number;
  total_gain: number;
  days_on_feed: number;
  adg: number;
}

export interface ITransactionRepository {
  /**
   * Find transaction by ID
   */
  findById(txId: string): Promise<Transaction | null>;

  /**
   * Find all transactions for an entity
   */
  findByEntityId(entityId: string): Promise<Transaction[]>;

  /**
   * Find latest transactions for an entity
   */
  findLatestByEntityId(entityId: string, limit?: number): Promise<Transaction[]>;

  /**
   * Find transactions by batch ID
   */
  findByBatchId(batchId: string): Promise<Transaction[]>;

  /**
   * Get growth metrics for an entity using the growth_metrics view
   */
  getGrowthMetrics(entityId: string, limit?: number): Promise<GrowthMetric[]>;

  /**
   * Get feed performance metrics for a specific feed type
   */
  getFeedPerformanceMetrics(
    tenantId: string,
    feedType: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<FeedPerformanceMetric[]>;

  /**
   * Find transactions by feed type
   */
  findByFeedType(
    tenantId: string,
    feedType: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<Transaction[]>;

  /**
   * Find all transactions in a date range
   */
  findAllByDateRange(
    tenantId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<Transaction[]>;

  /**
   * Find all transactions for a tenant (for history view)
   */
  findAll(tenantId: string, limit?: number): Promise<Transaction[]>;

  /**
   * Get health flags for an entity (transactions with weight loss)
   */
  getHealthFlags(entityId: string): Promise<Transaction[]>;

  /**
   * Create a new transaction
   */
  create(transaction: Transaction): Promise<Transaction>;

  /**
   * Update an existing transaction
   */
  update(transaction: Transaction): Promise<Transaction>;

  /**
   * Delete a transaction
   */
  delete(txId: string): Promise<void>;
}

