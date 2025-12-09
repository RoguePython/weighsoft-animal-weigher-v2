# WeighsoftAnimalWeigherV2 - Project Todo

## ✅ Phase 1: Foundation & Documentation - COMPLETED

### Rules & Documentation Setup
- [x] Create todo.md for project tracking
- [x] Set up .cursor/rules with comprehensive project rules (32 rule files)
- [x] Create PROJECT-BRIEF with strategic requirements
- [x] Create 5 Architecture Decision Records (ADRs)
- [x] Complete data model with ERD and schema
- [x] Define permission model (RBAC with 4 roles)
- [x] Specify 5 reports with CSV formats
- [x] Create AI-ASSISTANT-CONTEXT for future sessions
- [x] Define theme colors and design system
- [x] Simplify MVP scope (ADR 005)
- [x] Document what's parked for V2

---

## 🔲 Phase 2: Project Initialization - PENDING

### Folder Structure
- [ ] Create `src/` with clean architecture folders
  - [ ] `src/domain/` - Business logic
  - [ ] `src/data/` - Data layer
  - [ ] `src/presentation/` - UI layer
  - [ ] `src/infrastructure/` - External services
  - [ ] `src/shared/` - Utilities
- [ ] Create `test/` folder
  - [ ] `test/unit/` - Unit tests
  - [ ] `test/e2e/` - Playwright E2E tests
- [ ] Create `assets/` folder structure

### React Native Setup
- [ ] Initialize React Native project (Expo or bare)
- [ ] Configure TypeScript (strict mode)
- [ ] Set up path aliases (@/domain, @/data, etc.)
- [ ] Configure ESLint & Prettier
- [ ] Set up Husky pre-commit hooks
- [ ] Configure SQLite (expo-sqlite)
- [ ] Set up testing infrastructure (Jest + Playwright)

### Build Verification
- [ ] Verify initial APK build works
- [ ] Initial git commit
- [ ] Tag version 0.1.0

---

## 🔲 Phase 3: Core Architecture - PENDING

### Domain Layer Setup
- [ ] Create base entities (Animal, WeightRecord)
- [ ] Create repository interfaces
- [ ] Create base use cases
- [ ] Create domain exceptions
- [ ] Create Result type utility

### Data Layer Setup
- [ ] Set up database manager
- [ ] Create initial migration (001_initial_schema)
- [ ] Implement repository implementations
- [ ] Create DTOs and mappers

### Infrastructure Setup
- [ ] Set up DI container
- [ ] Create theme provider (light/dark)
- [ ] Set up logging service
- [ ] Create config service

### Presentation Setup
- [ ] Create base components (Button, Card, Input)
- [ ] Set up navigation structure
- [ ] Create theme hooks
- [ ] Create base ViewModels

---

## 🔲 Phase 4: Features - TBD

*Features to be defined after project discussion*

---

##  Rules Created (32 Total)

| # | Rule | Description |
|---|------|-------------|
| 01 | Project Overview | Structure, golden rules, tech stack |
| 02 | Clean Architecture | Layer separation, dependencies |
| 03 | Coding Standards | TypeScript, naming, components |
| 04 | Testing Standards | Jest, Playwright, coverage |
| 05 | Database SQLite | Migrations, repository patterns |
| 06 | Workflow Rules | Versioning, git, builds |
| 07 | React Native | Components, styling, navigation |
| 08 | Documentation | Structure, ADRs, templates |
| 09 | Error Handling | Exceptions, Result pattern |
| 10 | Dependency Injection | Container, testing mocks |
| 11 | AI Assistant | Code generation guidelines |
| 12 | Security | Validation, secrets, storage |
| 13 | Null Safety | Type guards, defensive coding |
| 14 | Logging Standards | Levels, formatting, production |
| 15 | Data Sharing/Export | CSV, JSON, backup/restore |
| 16 | Linting/Formatting | ESLint, Prettier, hooks |
| 17 | Environment Config | Dev/staging/prod, feature flags |
| 18 | State Management | MobX, ViewModels, patterns |
| 19 | Accessibility | A11y, screen readers, touch |
| 20 | Asset Management | Images, fonts, optimization |
| 21 | Performance | Optimization, profiling |
| 22 | API/Message Standards | Responses, naming, DTOs |
| 23 | Database Rules | Schema, indexes, queries |
| 24 | Race Conditions | Mutex, debounce, transactions |
| 25 | Theming/Design | Colors, typography, dark mode |
| 26 | Platform-Specific Code | Android + Web patterns, detection |
| 27 | Web-Specific Rules | SEO, PWA, routing, responsive |
| 28 | Internationalization | i18n, RTL, multi-language |
| 29 | Form Management | React Hook Form, validation |
| 30 | Animation Guidelines | Reanimated, 60 FPS, gestures |
| 31 | Push Notifications | Expo notifications, deep linking |
| 32 | UI Component Patterns | Searchable dropdowns, quick add |

---

## Documentation Created

```
docs/
├── README.md                              # Documentation index
├── PROJECT-BRIEF.md                       # Strategic requirements & use cases ✅ NEW
├── RULES-REVIEW.md                        # Complete rules review summary
├── RULES-FINAL-SUMMARY.md                 # Final 32 rules summary ✅ NEW
├── architecture/
│   ├── overview.md                        # Clean architecture overview
│   ├── data-model.md                      # Complete ERD & schema ✅ NEW
│   └── decisions/
│       ├── 001-data-model-core-vs-custom-fields.md ✅ NEW
│       ├── 002-default-custom-field-lists.md        ✅ NEW
│       └── 003-rfid-first-class-identity.md         ✅ NEW
└── design/
    └── theme-colors.md                    # Complete color system & theme
```

---

## Development Workflow Reminder

### Before Each Feature:
1. Update this todo.md with feature tasks
2. Read relevant rules in `.cursor/rules/`
3. Document expected behavior

### After Changes:
1. Run unit tests: `npm test`
2. Run E2E tests: `npm run test:e2e`
3. Verify APK builds: `cd android && ./gradlew assembleDebug`
4. Bump version if needed
5. Git commit with meaningful message
6. Update this todo.md

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.0.1 | Dec 2024 | Rules & documentation setup |

---

*Last Updated: December 2024*
