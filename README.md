# WeighsoftAnimalWeigherV2

Professional animal weighing application for feedlots, farms, and auction houses.

---

## 🚀 Quick Start

### New to the Project?

1. **Start here**: Read [START-HERE.md](docs/START-HERE.md)
2. **Quick prep**: Review [FINAL-REVIEW-GUIDE.md](docs/setup/FINAL-REVIEW-GUIDE.md) (15 min)
3. **Set up environment**: Follow [DEVELOPMENT-SETUP.md](docs/setup/DEVELOPMENT-SETUP.md) (30-45 min)

### For AI Assistants

See [AI-ASSISTANT-CONTEXT.md](docs/AI-ASSISTANT-CONTEXT.md) for quick project context.

---

## 📚 Documentation

| Category | Key Documents |
|----------|--------------|
| **Strategic** | [PROJECT-BRIEF.md](docs/PROJECT-BRIEF.md) - Requirements, MVP scope |
| **Architecture** | [architecture/](docs/architecture/) - Data model, ADRs, clean architecture |
| **Setup Guides** | [setup/](docs/setup/) - Development setup, mock data, components |
| **Security** | [security/permissions.md](docs/security/permissions.md) - RBAC matrix |
| **Reports** | [reports/report-specifications.md](docs/reports/report-specifications.md) - CSV specs |
| **Design** | [design/theme-colors.md](docs/design/theme-colors.md) - Theme system |
| **Full Index** | [DOCUMENTATION-INDEX.md](docs/DOCUMENTATION-INDEX.md) - All docs |

---

## 🏗️ Project Structure

```
WeighsoftAnimalWeigherV2/
├── .cursor/rules/      # 33 development rules
├── docs/               # Complete documentation
│   ├── setup/          # Development setup guides
│   ├── architecture/   # System design & ADRs
│   ├── security/       # Permission model
│   ├── reports/        # Report specifications
│   └── design/         # Theme & design system
├── src/                # Application source (clean architecture)
│   ├── domain/         # Business logic, entities, use cases
│   ├── data/           # Data layer, repositories
│   ├── presentation/   # UI components, screens, view models
│   ├── infrastructure/ # External services, SQLite, DI
│   └── shared/         # Shared utilities, types
├── test/               # Test files
│   ├── unit/           # Jest unit tests
│   └── e2e/            # Playwright E2E tests
├── android/            # Android native code
└── todo.md             # Task tracking
```

---

## 🎯 Core Features

- **Entity Management**: Track animals with RFID or manual tags
- **Batch Weighing**: Group weighing sessions with custom metadata
- **Weight History**: Complete transaction history per animal
- **Weight Loss Detection**: Automatic flagging of anomalies
- **Custom Fields**: Flexible metadata capture per batch
- **Reports**: 5 CSV reports for analysis and compliance
- **Permissions**: 4-role RBAC (Admin, Manager, Operator, ReadOnly)
- **Offline-First**: SQLite local database
- **Light/Dark Theme**: Professional business aesthetic

---

## 🛠️ Technology Stack

- **Framework**: React Native (Android + Web)
- **Database**: SQLite (expo-sqlite)
- **Testing**: Jest (unit) + Playwright (E2E)
- **Architecture**: Clean Architecture + Repository Pattern
- **State Management**: MobX
- **Dependency Injection**: Custom DI container
- **Linting**: ESLint + Prettier
- **CI/CD**: Expo EAS

---

## 📋 Development Workflow

### Before Starting
1. Update `todo.md` with your task
2. Read relevant rules in `.cursor/rules/`
3. Check existing patterns in `docs/`

### During Development
1. Follow clean architecture layers
2. Write tests alongside code
3. Document as you go
4. Verify APK builds frequently

### After Changes
```bash
npm test                        # Unit tests
npm run test:e2e                # E2E tests
npm run type-check              # TypeScript
npm run lint                    # ESLint
cd android && ./gradlew assembleDebug  # Verify build
```

### Version, Commit, Build, Test
1. Bump version if significant change
2. Git commit with conventional format
3. Build APK to verify
4. Run all tests
5. Update `todo.md`

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd WeighsoftAnimalWeigherV2

# Follow the setup guide
# See docs/setup/DEVELOPMENT-SETUP.md for complete instructions

# Quick setup
npm install
npm run db:migrate
npm run db:seed
npm start
```

---

## 📖 Golden Rules

1. **ALWAYS start with todo.md** when doing large tasks
2. **Document as you go** to avoid hallucinations
3. **Test everything** - unit tests and E2E tests
4. **Verify APK builds** frequently
5. **Version, commit, build, test** after significant changes

---

## 🤝 Contributing

See development rules in `.cursor/rules/` for:
- Coding standards
- Testing requirements
- Git commit conventions
- Documentation standards

---

## 📊 Project Status

**Phase**: Foundation Complete ✅  
**Next**: Project Initialization  
**MVP Timeline**: 4-6 weeks

See [todo.md](todo.md) for detailed task tracking.

---

## 📞 Support

- **Documentation Issues**: Check [DOCUMENTATION-INDEX.md](docs/DOCUMENTATION-INDEX.md)
- **Setup Problems**: See [DEVELOPMENT-SETUP.md](docs/setup/DEVELOPMENT-SETUP.md#troubleshooting)
- **Architecture Questions**: Read [AI-ASSISTANT-CONTEXT.md](docs/AI-ASSISTANT-CONTEXT.md)

---

**Version**: 0.0.1  
**Last Updated**: December 2024

*Built with clean architecture, tested thoroughly, documented completely.* ✨

