# Development Environment Setup

**Time to Complete**: 30-45 minutes  
**Last Updated**: December 2024

---

## Prerequisites

### Required Software

| Tool | Version | Purpose | Install Link |
|------|---------|---------|--------------|
| **Node.js** | 18.x LTS | Runtime | https://nodejs.org/ |
| **npm** | 9.x+ | Package manager | (comes with Node) |
| **Git** | Latest | Version control | https://git-scm.com/ |
| **Android Studio** | Latest | Android development | https://developer.android.com/studio |
| **VS Code** | Latest | IDE | https://code.visualstudio.com/ |
| **Expo CLI** | Latest | React Native tooling | `npm install -g expo-cli` |

### Optional but Recommended

| Tool | Purpose |
|------|---------|
| **React DevTools** | Debugging React components |
| **Flipper** | Mobile debugging |
| **Postman** | API testing (future) |

---

## Step 1: Clone and Install

```bash
# Clone repository
cd C:\Project
git clone <repository-url> WeighsoftAnimalWeigherV2
cd WeighsoftAnimalWeigherV2

# Install dependencies
npm install

# Verify installation
npm run verify-setup
```

---

## Step 2: Initialize Expo Project

```bash
# Initialize Expo app in src directory
npx create-expo-app@latest --template blank-typescript

# Move generated files to src/
# (Structure as per our clean architecture)

# Install core dependencies
npm install expo-sqlite expo-file-system
npm install @react-navigation/native @react-navigation/stack
npm install mobx mobx-react-lite
npm install react-hook-form yup @hookform/resolvers
npm install date-fns
npm install react-native-reanimated react-native-gesture-handler

# Install dev dependencies
npm install -D @types/react @types/react-native
npm install -D typescript@5.x
npm install -D jest @testing-library/react-native
npm install -D eslint prettier
npm install -D husky lint-staged
```

---

## Step 3: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "allowJs": true,
    "jsx": "react-native",
    "noEmit": true,
    "isolatedModules": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    
    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/domain/*": ["src/domain/*"],
      "@/data/*": ["src/data/*"],
      "@/presentation/*": ["src/presentation/*"],
      "@/infrastructure/*": ["src/infrastructure/*"],
      "@/shared/*": ["src/shared/*"]
    }
  },
  "include": [
    "src/**/*",
    "test/**/*"
  ],
  "exclude": [
    "node_modules",
    "android",
    "ios"
  ]
}
```

---

## Step 4: Set Up Linting & Formatting

### ESLint Configuration

`.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  extends: [
    'expo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### Prettier Configuration

`.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Pre-commit Hooks

`.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run format:check
npm run type-check
npm test -- --bail --findRelatedTests
```

`package.json` scripts:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Step 5: Set Up Testing

### Jest Configuration

`jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/domain/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@react-navigation)/)',
  ],
};
```

`test/setup.ts`:

```typescript
import '@testing-library/jest-native/extend-expect';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    readTransaction: jest.fn(),
  })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
```

---

## Step 6: Create Folder Structure

```bash
# Create domain layer
mkdir -p src/domain/entities
mkdir -p src/domain/repositories
mkdir -p src/domain/usecases
mkdir -p src/domain/value-objects
mkdir -p src/domain/exceptions

# Create data layer
mkdir -p src/data/repositories
mkdir -p src/data/datasources
mkdir -p src/data/dtos
mkdir -p src/data/mappers

# Create presentation layer
mkdir -p src/presentation/screens
mkdir -p src/presentation/components
mkdir -p src/presentation/viewmodels
mkdir -p src/presentation/navigation

# Create infrastructure layer
mkdir -p src/infrastructure/di
mkdir -p src/infrastructure/database
mkdir -p src/infrastructure/theme
mkdir -p src/infrastructure/i18n
mkdir -p src/infrastructure/logging

# Create shared utilities
mkdir -p src/shared/constants
mkdir -p src/shared/types
mkdir -p src/shared/utils

# Create test folders
mkdir -p test/unit/domain
mkdir -p test/unit/data
mkdir -p test/integration
mkdir -p test/e2e

# Create assets
mkdir -p assets/fonts
mkdir -p assets/images
mkdir -p assets/animations
```

---

## Step 7: Database Setup

Create initial migration:

`src/infrastructure/database/migrations/001_initial_schema.ts`:

```typescript
export const migration_001_initial_schema = `
-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  settings TEXT,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active'
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Manager', 'Operator', 'ReadOnly')),
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TEXT NOT NULL,
  last_login_at TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  UNIQUE (tenant_id, email)
);

-- Entities (Animals)
CREATE TABLE IF NOT EXISTS entities (
  entity_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  primary_tag TEXT NOT NULL,
  rfid_tag TEXT,
  species TEXT NOT NULL CHECK (species IN ('cattle', 'sheep', 'pig', 'goat')),
  breed TEXT,
  sex TEXT CHECK (sex IN ('M', 'F', 'Unknown')),
  birth_date TEXT,
  status TEXT NOT NULL DEFAULT 'Active' 
    CHECK (status IN ('Active', 'Sold', 'Dead', 'Culled')),
  current_group TEXT,
  source_type TEXT CHECK (source_type IN ('Farm', 'Auction', 'Feedlot', 'Other')),
  source_name TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  UNIQUE (tenant_id, primary_tag),
  UNIQUE (tenant_id, rfid_tag) WHERE rfid_tag IS NOT NULL
);

-- Create indexes
CREATE INDEX idx_entities_tenant_status ON entities(tenant_id, status);
CREATE INDEX idx_entities_rfid ON entities(tenant_id, rfid_tag) WHERE rfid_tag IS NOT NULL;
CREATE INDEX idx_entities_group ON entities(tenant_id, current_group) WHERE current_group IS NOT NULL;
CREATE INDEX idx_entities_species ON entities(tenant_id, species);

-- Custom Field Lists
CREATE TABLE IF NOT EXISTS custom_field_lists (
  cfl_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_system_default INTEGER NOT NULL DEFAULT 0,
  fields TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  UNIQUE (tenant_id, name, version)
);

-- Batches
CREATE TABLE IF NOT EXISTS batches (
  batch_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Arrival', 'Routine', 'Shipment', 'Auction', 'Other')),
  location_id TEXT,
  scale_device_id TEXT,
  cfl_id TEXT NOT NULL,
  cfl_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Open', 'Closed', 'Locked')),
  started_at TEXT,
  closed_at TEXT,
  locked_at TEXT,
  locked_by TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (cfl_id) REFERENCES custom_field_lists(cfl_id)
);

CREATE INDEX idx_batches_tenant_status ON batches(tenant_id, status);
CREATE INDEX idx_batches_type ON batches(tenant_id, type);
CREATE INDEX idx_batches_created ON batches(tenant_id, created_at DESC);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  tx_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  batch_id TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  timestamp TEXT NOT NULL,
  scale_device_id TEXT,
  operator_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('Arrival', 'Monthly', 'Shipment', 'Reweigh', 'Other')),
  location_id TEXT,
  is_estimated_weight INTEGER NOT NULL DEFAULT 0,
  confidence_score REAL,
  custom_fields_definition_snapshot TEXT NOT NULL,
  custom_field_values TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (entity_id) REFERENCES entities(entity_id),
  FOREIGN KEY (batch_id) REFERENCES batches(batch_id),
  FOREIGN KEY (operator_id) REFERENCES users(user_id)
);

CREATE INDEX idx_transactions_entity ON transactions(entity_id, timestamp DESC);
CREATE INDEX idx_transactions_batch ON transactions(batch_id, timestamp);
CREATE INDEX idx_transactions_tenant_timestamp ON transactions(tenant_id, timestamp DESC);

-- Images
CREATE TABLE IF NOT EXISTS images (
  image_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  tx_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  tags TEXT,
  timestamp TEXT NOT NULL,
  captured_by TEXT NOT NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (tx_id) REFERENCES transactions(tx_id),
  FOREIGN KEY (entity_id) REFERENCES entities(entity_id)
);

CREATE INDEX idx_images_entity ON images(entity_id, timestamp DESC);
CREATE INDEX idx_images_tx ON images(tx_id);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  changes TEXT,
  timestamp TEXT NOT NULL,
  ip_address TEXT,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_audit_tenant_user ON audit_logs(tenant_id, user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

INSERT INTO schema_version (version, applied_at) VALUES ('001', datetime('now'));
`;
```

---

## Step 8: Environment Configuration

`.env.development`:

```env
# App
APP_NAME=Weighsoft Animal Weigher
APP_ENV=development

# Database
DB_NAME=weighsoft_dev.db

# Feature Flags
ENABLE_DEBUG_LOGGING=true
ENABLE_DEV_MENU=true

# API (future)
API_BASE_URL=http://localhost:3000
```

`.env.production`:

```env
APP_NAME=Weighsoft Animal Weigher
APP_ENV=production
DB_NAME=weighsoft_prod.db
ENABLE_DEBUG_LOGGING=false
ENABLE_DEV_MENU=false
```

---

## Step 9: Verify Setup

Create verification script:

`scripts/verify-setup.js`:

```javascript
const fs = require('fs');
const path = require('path');

const requiredFolders = [
  'src/domain',
  'src/data',
  'src/presentation',
  'src/infrastructure',
  'test/unit',
];

const requiredFiles = [
  'tsconfig.json',
  '.eslintrc.js',
  '.prettierrc',
  'jest.config.js',
];

console.log('🔍 Verifying setup...\n');

let allGood = true;

// Check folders
requiredFolders.forEach((folder) => {
  if (fs.existsSync(folder)) {
    console.log(`✅ ${folder}`);
  } else {
    console.log(`❌ ${folder} MISSING`);
    allGood = false;
  }
});

// Check files
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} MISSING`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n✅ Setup verified! You\'re ready to code.');
} else {
  console.log('\n❌ Setup incomplete. Please review missing items.');
  process.exit(1);
}
```

Run: `node scripts/verify-setup.js`

---

## Step 10: First Run

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm test

# Start development server
npm start

# In another terminal, run on Android
npm run android
```

---

## Troubleshooting

### Issue: TypeScript path aliases not working

**Solution**: Install `babel-plugin-module-resolver`:

```bash
npm install -D babel-plugin-module-resolver
```

`babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/domain': './src/domain',
            '@/data': './src/data',
            '@/presentation': './src/presentation',
            '@/infrastructure': './src/infrastructure',
            '@/shared': './src/shared',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

### Issue: Android build fails

**Solution**:
1. Open Android Studio
2. File > Project Structure > SDK Location
3. Set Android SDK location
4. Install SDK Platform 33
5. Rebuild

### Issue: Tests fail with module not found

**Solution**: Check `jest.config.js` `moduleNameMapper` matches tsconfig paths

---

## VS Code Extensions (Recommended)

Install these in VS Code:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "expo.vscode-expo-tools",
    "orta.vscode-jest"
  ]
}
```

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/android/.gradle": true,
    "**/android/build": true
  }
}
```

---

**Estimated Setup Time**: 30-45 minutes

**Next**: See `PROJECT-INITIALIZATION-CHECKLIST.md` for step-by-step first commits.

