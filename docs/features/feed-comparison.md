# Feed Comparison Feature

**Status**: MVP  
**Last Updated**: December 2024

## Overview

Feed comparison analyzes and compares performance metrics by feed type to help optimize feed programs and improve Average Daily Gain (ADG).

## Features

### Feed Type Tracking
- Track feed type per transaction (via custom fields)
- Support for feed brand tracking
- Historical feed performance analysis

### Performance Comparison
- Compare ADG across different feed types
- Average total gain by feed type
- Animal count per feed type
- Performance ranking

### Date Range Analysis
- Filter comparisons by date range
- Compare performance over specific periods
- Track feed program changes

## Implementation

### Domain Layer
- **Use Case**: `CompareFeedPerformanceUseCase` - Analyzes feed performance

### Data Layer
- **Repository**: `ITransactionRepository.getFeedPerformanceMetrics()` - Retrieves feed data

### Presentation Layer
- **Component**: `FeedPerformanceCard` - Visual feed comparison card
- **Screen**: `FeedComparisonScreen` - Feed comparison dashboard

## Usage

```typescript
const useCase = new CompareFeedPerformanceUseCase(transactionRepository, growthService);
const result = await useCase.execute(tenantId, dateRange);

// Result includes:
// - metrics[] (by feed type)
// - avg_adg per feed type
// - performance_rank
```

## Comparison Methodology

1. Group transactions by feed type
2. Calculate ADG for each animal on each feed type
3. Average ADG across all animals per feed type
4. Rank feeds by performance

## Best Practices

- Track feed type consistently in Routine Weigh batches
- Use consistent date ranges for fair comparisons
- Consider seasonal factors when comparing
- Track feed brand for more granular analysis

## Reports

Feed Comparison Report exports:
- Feed type and brand
- Animal count
- Average ADG
- Average total gain
- Performance rank

