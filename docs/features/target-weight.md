# Target Weight Feature

**Status**: MVP  
**Last Updated**: December 2024

## Overview

Target weight tracking allows setting per-animal target weights and identifying when animals are ready for sale.

## Features

### Target Weight Setting
- Set target weight per animal (optional)
- Can be set at entity creation or later
- Editable at any time

### Progress Tracking
- Visual progress bar showing % toward target
- Current weight vs target weight
- Remaining weight calculation

### Ready to Sell Detection
- Automatic identification when target reached
- Filter animals by progress percentage
- Quick batch creation for ready animals

## Implementation

### Domain Layer
- **Service**: `TargetWeightService` - Progress calculations
- **Use Case**: `GetReadyToSellUseCase` - Finds ready animals

### Data Layer
- **Field**: `target_weight_kg` on entities table
- **Repository**: `IEntityRepository.findByTargetWeightReached()` - Queries ready animals

### Presentation Layer
- **Component**: `TargetWeightProgress` - Progress indicator
- **Screen**: `ReadyToSellScreen` - Ready animals list

## Usage

```typescript
const useCase = new GetReadyToSellUseCase(entityRepository, transactionRepository, targetService);
const ready = await useCase.execute(tenantId, filters);

// Returns entities where current_weight >= target_weight
```

## Setting Target Weights

1. During entity creation (optional field)
2. Edit entity screen (update target weight)
3. Batch operations (set for multiple animals)

## Ready to Sell Workflow

1. View "Ready to Sell" screen
2. Filter by species, group, or progress %
3. Select animals for batch
4. Create shipment/auction batch
5. Export report for buyers

## Progress Tracking

- **0-50%**: Early stage
- **50-90%**: Approaching target
- **90-100%**: Nearly ready
- **100%+**: Ready to sell

