/**
 * Growth Calculation Service
 * 
 * Provides business logic for calculating growth metrics including:
 * - Average Daily Gain (ADG)
 * - Weekly gain
 * - Total gain
 */

import { Entity } from '../entities/entity';
import { Transaction } from '../entities/transaction';

export interface WeeklyGain {
  week_start: Date;
  week_end: Date;
  weight_start: number;
  weight_end: number;
  gain: number;
  adg: number;
}

export interface GrowthMetrics {
  total_gain: number;
  total_days: number;
  avg_daily_gain: number;
  first_weight: number;
  first_date: Date;
  latest_weight: number;
  latest_date: Date;
  weekly_gains: WeeklyGain[];
}

export class GrowthCalculationService {
  /**
   * Calculate Average Daily Gain (ADG)
   * @param weight1 Starting weight in kg
   * @param weight2 Ending weight in kg
   * @param days Number of days between weights
   * @returns ADG in kg/day
   */
  calculateADG(weight1: number, weight2: number, days: number): number {
    if (days <= 0) {
      return 0;
    }
    return (weight2 - weight1) / days;
  }

  /**
   * Calculate weekly gains from transaction history
   * Groups transactions by week and calculates gain per week
   */
  calculateWeeklyGain(transactions: Transaction[]): WeeklyGain[] {
    if (transactions.length < 2) {
      return [];
    }

    // Sort by timestamp
    const sorted = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const weeklyGains: WeeklyGain[] = [];
    let currentWeekStart = sorted[0].timestamp;
    let weekStartWeight = sorted[0].weight_kg;

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const daysSinceWeekStart = Math.floor(
        (current.timestamp.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If 7+ days have passed, finalize this week and start a new one
      if (daysSinceWeekStart >= 7) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekEndWeight = sorted[i - 1].weight_kg;
        const gain = weekEndWeight - weekStartWeight;
        const adg = this.calculateADG(weekStartWeight, weekEndWeight, 7);

        weeklyGains.push({
          week_start: currentWeekStart,
          week_end: weekEnd,
          weight_start: weekStartWeight,
          weight_end: weekEndWeight,
          gain,
          adg,
        });

        // Start new week
        currentWeekStart = current.timestamp;
        weekStartWeight = current.weight_kg;
      }
    }

    // Add final week if there's remaining data
    if (sorted.length > 0) {
      const last = sorted[sorted.length - 1];
      const daysSinceWeekStart = Math.floor(
        (last.timestamp.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceWeekStart > 0) {
        const weekEnd = last.timestamp;
        const gain = last.weight_kg - weekStartWeight;
        const adg = this.calculateADG(weekStartWeight, last.weight_kg, daysSinceWeekStart);

        weeklyGains.push({
          week_start: currentWeekStart,
          week_end: weekEnd,
          weight_start: weekStartWeight,
          weight_end: last.weight_kg,
          gain,
          adg,
        });
      }
    }

    return weeklyGains;
  }

  /**
   * Calculate total gain from first to last transaction
   */
  calculateTotalGain(entity: Entity, transactions: Transaction[]): number {
    if (transactions.length < 2) {
      return 0;
    }

    const sorted = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    return last.weight_kg - first.weight_kg;
  }

  /**
   * Calculate comprehensive growth metrics
   */
  calculateGrowthMetrics(entity: Entity, transactions: Transaction[]): GrowthMetrics {
    if (transactions.length === 0) {
      throw new Error('Cannot calculate growth metrics without transactions');
    }

    const sorted = [...transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const totalGain = last.weight_kg - first.weight_kg;
    const totalDays = Math.floor(
      (last.timestamp.getTime() - first.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgDailyGain = this.calculateADG(first.weight_kg, last.weight_kg, totalDays);
    const weeklyGains = this.calculateWeeklyGain(sorted);

    return {
      total_gain: totalGain,
      total_days: totalDays,
      avg_daily_gain: avgDailyGain,
      first_weight: first.weight_kg,
      first_date: first.timestamp,
      latest_weight: last.weight_kg,
      latest_date: last.timestamp,
      weekly_gains: weeklyGains,
    };
  }
}

