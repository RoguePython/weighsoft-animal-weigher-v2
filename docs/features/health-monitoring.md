# Health Monitoring Feature

**Status**: MVP  
**Last Updated**: December 2024

## Overview

Health monitoring automatically detects health issues based on weight patterns, with severity levels and early warning indicators.

## Features

### Weight Loss Detection
- Automatic detection when weight decreases
- Severity levels: minor, moderate, severe
- Percentage-based severity calculation

### Consecutive Loss Detection
- Flags animals with 2+ consecutive weight losses
- Indicates potential serious health issues
- Requires immediate attention

### Health Flags
- Visual indicators with color coding
- Severity-based badges (green/yellow/red)
- Quick actions for review

## Severity Levels

### Minor
- Weight loss < 2% of previous weight
- Yellow indicator
- Monitor closely

### Moderate
- Weight loss 2-5% of previous weight
- Orange indicator
- Requires attention

### Severe
- Weight loss > 5% of previous weight
- Red indicator
- Immediate action required

## Implementation

### Domain Layer
- **Service**: `HealthDetectionService` - Detection algorithms
- **Use Case**: `DetectHealthIssuesUseCase` - Orchestrates detection

### Presentation Layer
- **Component**: `HealthFlagBadge` - Visual health indicator
- **Screen**: `HealthMonitoringScreen` - Health monitoring dashboard

## Usage

```typescript
const useCase = new DetectHealthIssuesUseCase(transactionRepository, healthService);
const flags = await useCase.execute(entityId, newWeight);

// Flags include:
// - type (weight_loss, consecutive_loss)
// - severity (minor, moderate, severe)
// - message
// - weight_change
```

## Response Workflows

1. **Minor**: Monitor and note in records
2. **Moderate**: Review animal condition, consider treatment
3. **Severe**: Immediate veterinary attention recommended

