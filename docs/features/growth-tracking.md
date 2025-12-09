# Growth Tracking Feature

**Status**: MVP  
**Last Updated**: December 2024

## Overview

Growth tracking provides comprehensive monitoring of animal weight progression over time, including Average Daily Gain (ADG) calculations, weekly gain tracking, and visual progress charts.

## Features

### Weekly Growth Tracking
- Track weight changes week-over-week
- Calculate weekly gains and ADG
- Visual progress charts showing weight over time

### ADG Calculations
- Average Daily Gain (ADG) = (Weight2 - Weight1) / Days
- Calculated between consecutive weighs
- Aggregated for total period

### Growth Metrics
- Total gain from first to latest weight
- Days on feed calculation
- Weekly gain breakdowns

## Implementation

### Domain Layer
- **Service**: `GrowthCalculationService` - Business logic for calculations
- **Use Case**: `CalculateGrowthMetricsUseCase` - Orchestrates metric calculation

### Data Layer
- **View**: `growth_metrics` - SQL view for efficient weight change queries
- **Repository**: `ITransactionRepository.getGrowthMetrics()` - Retrieves growth data

### Presentation Layer
- **Component**: `WeightProgressChart` - Visual chart component
- **Screen**: `GrowthTrackingScreen` - Full growth tracking interface

## Usage

```typescript
const useCase = new CalculateGrowthMetricsUseCase(transactionRepository, growthService);
const metrics = await useCase.execute(entityId);

// Metrics include:
// - total_gain
// - total_days
// - avg_daily_gain
// - weekly_gains[]
```

## Chart Interpretation

- **Line Chart**: Shows weight progression over time
- **Target Line**: Horizontal line indicating target weight (if set)
- **Health Issues**: Highlighted points where weight loss occurred

## Reports

Growth Performance Report exports:
- Entity details
- First/latest weights
- Total gain and ADG
- Feed type (from custom fields)
- Target weight and progress

