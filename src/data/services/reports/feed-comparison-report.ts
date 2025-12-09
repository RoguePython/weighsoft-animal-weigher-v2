/**
 * Feed Comparison Report Generator
 * 
 * Generates CSV export with feed performance metrics.
 */

import { FeedComparisonResult, FeedPerformanceMetrics } from '@/domain/usecases/compare-feed-performance.use-case';

export class FeedComparisonReportGenerator {
  /**
   * Generate CSV content for feed comparison report
   */
  generateCSV(result: FeedComparisonResult): string {
    const headers = [
      'feed_type',
      'feed_brand',
      'animal_count',
      'avg_adg',
      'avg_total_gain',
      'avg_days_on_feed',
      'performance_rank',
    ];

    const csvRows = result.metrics.map((metric) => [
      metric.feed_type,
      metric.feed_brand || '',
      metric.animal_count.toString(),
      metric.avg_adg.toFixed(2),
      metric.avg_total_gain.toFixed(1),
      metric.avg_days_on_feed.toFixed(0),
      metric.performance_rank?.toString() || '',
    ]);

    return [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Generate filename for feed comparison report
   */
  generateFilename(dateRange: { start: Date; end: Date }): string {
    const startStr = dateRange.start.toISOString().split('T')[0];
    const endStr = dateRange.end.toISOString().split('T')[0];
    return `feed-comparison-${startStr}-to-${endStr}.csv`;
  }
}

