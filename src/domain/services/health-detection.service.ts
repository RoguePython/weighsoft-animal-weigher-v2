/**
 * Health Detection Service
 * 
 * Detects health issues based on weight patterns:
 * - Weight loss detection with severity levels
 * - Consecutive loss detection
 */

import { Transaction } from '../entities/transaction';

export type HealthSeverity = 'minor' | 'moderate' | 'severe';

export interface HealthFlag {
  type: 'weight_loss' | 'consecutive_loss' | 'stagnant_growth';
  severity: HealthSeverity;
  message: string;
  previous_weight: number;
  current_weight: number;
  weight_change: number;
  weight_change_percent: number;
  days_between: number;
  timestamp: Date;
}

export class HealthDetectionService {
  /**
   * Detect weight loss and calculate severity
   * @param current Current weight in kg
   * @param previous Previous weight in kg
   * @param daysBetween Number of days between weighs
   * @returns HealthFlag if weight loss detected, null otherwise
   */
  detectWeightLoss(
    current: number,
    previous: number,
    daysBetween: number
  ): HealthFlag | null {
    const loss = previous - current;

    // No loss detected
    if (loss <= 0) {
      return null;
    }

    const lossPercent = (loss / previous) * 100;

    // Determine severity
    let severity: HealthSeverity;
    if (lossPercent > 5) {
      severity = 'severe';
    } else if (lossPercent > 2) {
      severity = 'moderate';
    } else {
      severity = 'minor';
    }

    // Generate message
    const message = `Weight decreased from ${previous.toFixed(1)}kg to ${current.toFixed(1)}kg (${lossPercent.toFixed(1)}% loss)`;

    return {
      type: 'weight_loss',
      severity,
      message,
      previous_weight: previous,
      current_weight: current,
      weight_change: -loss,
      weight_change_percent: -lossPercent,
      days_between: daysBetween,
      timestamp: new Date(),
    };
  }

  /**
   * Check for consecutive weight losses
   * @param transactions Sorted transactions (oldest to newest)
   * @returns true if 2+ consecutive losses detected
   */
  checkConsecutiveLosses(transactions: Transaction[]): boolean {
    if (transactions.length < 3) {
      return false;
    }

    // Sort by timestamp (oldest first)
    const sorted = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    let consecutiveLosses = 0;

    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];

      if (current.weight_kg < previous.weight_kg) {
        consecutiveLosses++;
        if (consecutiveLosses >= 2) {
          return true;
        }
      } else {
        consecutiveLosses = 0;
      }
    }

    return false;
  }

  /**
   * Detect all health issues from transaction history
   * @param transactions Sorted transactions (oldest to newest)
   * @returns Array of health flags
   */
  detectHealthIssues(transactions: Transaction[]): HealthFlag[] {
    if (transactions.length < 2) {
      return [];
    }

    const flags: HealthFlag[] = [];

    // Sort by timestamp (oldest first)
    const sorted = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Check for weight losses
    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];

      const daysBetween = Math.floor(
        (current.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      );

      const lossFlag = this.detectWeightLoss(
        current.weight_kg,
        previous.weight_kg,
        daysBetween
      );

      if (lossFlag) {
        flags.push({
          ...lossFlag,
          timestamp: current.timestamp,
        });
      }
    }

    // Check for consecutive losses
    if (this.checkConsecutiveLosses(sorted)) {
      const last = sorted[sorted.length - 1];
      flags.push({
        type: 'consecutive_loss',
        severity: 'severe',
        message: 'Multiple consecutive weight losses detected - immediate attention required',
        previous_weight: sorted[sorted.length - 2].weight_kg,
        current_weight: last.weight_kg,
        weight_change: last.weight_kg - sorted[sorted.length - 2].weight_kg,
        weight_change_percent:
          ((last.weight_kg - sorted[sorted.length - 2].weight_kg) / sorted[sorted.length - 2].weight_kg) * 100,
        days_between: Math.floor(
          (last.timestamp.getTime() - sorted[sorted.length - 2].timestamp.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        timestamp: last.timestamp,
      });
    }

    return flags;
  }
}

