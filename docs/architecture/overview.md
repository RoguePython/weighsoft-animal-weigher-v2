# Architecture Overview

## Clean Architecture

This project follows Clean Architecture principles, organizing code into distinct layers with clear responsibilities and dependencies.

## Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│    Screens, Components, ViewModels, Navigation               │
│         (React Native, UI Logic, State Management)           │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                            │
│         Entities, Use Cases, Repository Interfaces           │
│            (Pure Business Logic, No Dependencies)            │
├─────────────────────────────────────────────────────────────┤
│                       DATA LAYER                             │
│    Repository Implementations, Data Sources, Mappers         │
│              (SQLite, API Clients, DTOs)                     │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                       │
│      Database Setup, DI Container, External Services         │
│           (Framework-specific implementations)               │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Rule

**Dependencies point inward only.**

```
Presentation → Domain ← Data
                 ↑
           Infrastructure
```

- **Domain** has no dependencies on other layers
- **Data** depends on Domain (implements interfaces)
- **Presentation** depends on Domain (uses use cases)
- **Infrastructure** provides implementations to all layers via DI

## Directory Structure

```
src/
├── domain/                 # Business Logic (Innermost)
│   ├── entities/           # Business objects
│   │   ├── animal.ts
│   │   └── weight-record.ts
│   ├── repositories/       # Repository interfaces
│   │   ├── animal.repository.ts
│   │   └── weight.repository.ts
│   ├── usecases/           # Business operations
│   │   ├── get-animal.usecase.ts
│   │   ├── save-weight.usecase.ts
│   │   └── ...
│   └── exceptions/         # Domain exceptions
│       └── animal.exceptions.ts
│
├── data/                   # Data Access
│   ├── repositories/       # Repository implementations
│   │   ├── sqlite-animal.repository.ts
│   │   └── sqlite-weight.repository.ts
│   ├── datasources/        # Data sources
│   │   └── sqlite/
│   ├── models/             # DTOs
│   │   ├── animal.dto.ts
│   │   └── weight.dto.ts
│   └── mappers/            # Entity ↔ DTO mappers
│       └── animal.mapper.ts
│
├── presentation/           # UI Layer
│   ├── screens/            # Screen components
│   │   ├── home/
│   │   ├── animal-detail/
│   │   └── weighing/
│   ├── components/         # Reusable components
│   │   ├── animal-card/
│   │   └── weight-input/
│   ├── viewmodels/         # State & UI logic
│   │   ├── animal-list.viewmodel.ts
│   │   └── weighing.viewmodel.ts
│   ├── navigation/         # Navigation config
│   │   ├── types.ts
│   │   └── root-navigator.tsx
│   └── hooks/              # Custom hooks
│
├── infrastructure/         # External Services
│   ├── database/           # SQLite setup
│   │   ├── database-manager.ts
│   │   └── migrations/
│   ├── di/                 # Dependency injection
│   │   ├── container.ts
│   │   └── di-context.tsx
│   └── services/           # External integrations
│
└── shared/                 # Shared Utilities
    ├── constants/          # App constants
    ├── types/              # Shared types
    └── utils/              # Utility functions
```

## Layer Details

### Domain Layer
The core of the application. Contains:
- **Entities**: Business objects with their validation rules
- **Use Cases**: Single-purpose business operations
- **Repository Interfaces**: Contracts for data access
- **Exceptions**: Domain-specific error types

Key rule: **No imports from other layers or React Native.**

### Data Layer
Handles data persistence and retrieval:
- **Repository Implementations**: Fulfill domain contracts
- **DTOs**: Data Transfer Objects matching database schema
- **Mappers**: Convert between DTOs and domain entities
- **Data Sources**: SQLite database operations

### Presentation Layer
User interface and user interaction:
- **Screens**: Full-page components
- **Components**: Reusable UI elements
- **ViewModels**: Manage screen state and call use cases
- **Navigation**: Screen routing configuration

### Infrastructure Layer
Framework and external service setup:
- **Database**: SQLite initialization and migrations
- **DI Container**: Dependency injection setup
- **Services**: Third-party integrations

## Data Flow Example

```
User taps "Save Weight" button
         │
         ▼
┌─────────────────────────────────────┐
│ WeighingScreen (Presentation)       │
│ Calls viewModel.saveWeight(150)     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ WeighingViewModel (Presentation)    │
│ Calls saveWeightUseCase.execute()   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ SaveWeightUseCase (Domain)          │
│ Validates, creates WeightRecord     │
│ Calls repository.save(record)       │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ SQLiteWeightRepository (Data)       │
│ Maps entity → DTO                   │
│ Executes SQL INSERT                 │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ SQLite Database (Infrastructure)    │
│ Persists data                       │
└─────────────────────────────────────┘
```

## Benefits

1. **Testability**: Each layer can be tested in isolation
2. **Maintainability**: Changes in one layer don't affect others
3. **Flexibility**: Easy to swap implementations (e.g., different database)
4. **Scalability**: Easy to add new features following the pattern

