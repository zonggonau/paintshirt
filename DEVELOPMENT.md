# Development Best Practices Guide

## 🎯 Overview

This guide documents the development best practices setup for the Printful dropshipping application.

---

## ✅ TypeScript Configuration

**Status**: ✅ Already enabled

### Strict Mode
TypeScript strict mode is enabled in `tsconfig.json`:
```json
{
  "strict": true
}
```

This enables:
- `noImplicitAny`: Errors on expressions with implied `any` type
- `strictNullChecks`: Strict null and undefined checking  
- `strictFunctionTypes`: Stricter function type checking
- `strictPropertyInitialization`: Ensures class properties are initialized

---

## 🎨 Code Formatting (Prettier)

**Status**: ✅ Configured

### Configuration
File: [`.prettierrc`](file:///d:/projek/nextjs/dropshiping/.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Commands
```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

---

## 🔍 ESLint Configuration

**Status**: ✅ Enhanced

### Custom Rules
File: [`eslint.config.mjs`](file:///d:/projek/nextjs/dropshiping/eslint.config.mjs)

**Key Rules**:
- ⚠️ `no-console`: Warn on console.log (allow warn/error)
- ⚠️ `@typescript-eslint/no-unused-vars`: Warn on unused variables (except prefixed with `_`)
- ⚠️ `@typescript-eslint/no-explicit-any`: Discourage `any` type
- ❌ `prefer-const`: Error if `let` can be `const`
- ❌ `eqeqeq`: Always use `===` and `!==`

### Commands
```bash
# Lint all files
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Type check only
npm run type-check

# Run all validations
npm run validate
```

---

## 🪝 Git Hooks (Husky + lint-staged)

**Status**: ⏳ To be enabled

### What It Does
- Runs linting and formatting on staged files before commit
- Prevents commits with errors
- Ensures code quality consistency

### Configuration
File: [`.lintstagedrc.js`](file:///d:/projek/nextjs/dropshiping/.lintstagedrc.js)

```javascript
module.exports = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
};
```

### Setup Instructions
After installing dependencies:

```bash
# Initialize Husky
npx husky init

# Add pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
```

---

## 📊 API Logging & Performance Tracking

**Status**: ✅ Created

### API Logger
File: [`src/lib/api-logger.ts`](file:///d:/projek/nextjs/dropshiping/src/lib/api-logger.ts)

**Features**:
- Request/response logging (development only)
- Performance tracking
- Error logging with details
- Response size monitoring

### Enable Logging
Add to `.env.local`:
```bash
ENABLE_API_LOGGING=true
```

### Usage Example
```typescript
import { PerformanceTracker } from '@/lib/api-logger';

// View performance report
PerformanceTracker.logReport();
```

**Sample Output**:
```
📊 API Performance Report:
┌─────────┬───────────────────────┬───────┬─────────────┬──────────┐
│ (index) │ endpoint              │ calls │ avgDuration │ errorRate│
├─────────┼───────────────────────┼───────┼─────────────┼──────────┤
│ 0       │ 'sync/products'       │ 45    │ 234ms       │ '0.00%'  │
│ 1       │ 'categories'          │ 12    │ 156ms       │ '0.00%'  │
└─────────┴───────────────────────┴───────┴─────────────┴──────────┘
```

---

## 🚀 Workflow Commands

### Daily Development
```bash
# Start development server
npm run dev

# Check if code passes all checks
npm run validate
```

### Before Committing
```bash
# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Verify everything passes
npm run validate
```

### Before Deploying
```bash
# Type check
npm run type-check

# Lint check
npm run lint

# Build for production
npm run build
```

---

## 📋 Checklist

Mark as done when completed:

- [x] **TypeScript Strict Mode** - Already enabled
- [x] **Prettier Configuration** - Created `.prettierrc`
- [x] **Enhanced ESLint Rules** - Updated `eslint.config.mjs`
- [x] **NPM Scripts** - Added lint, format, validate commands
- [x] **API Logging** - Created `api-logger.ts`
- [ ] **Husky Pre-commit Hooks** - Waiting for dependency installation
- [ ] **Testing Setup** - Optional (Jest + React Testing Library)

---

## 🔧 Troubleshooting

### ESLint Not Working
```bash
# Reinstall dependencies
pnpm install

# Clear ESLint cache
pnpm run lint -- --cache-delete
```

### Prettier Conflicts with ESLint
The configuration is designed to work together. If issues arise:
```bash
# Run in sequence
npm run lint:fix
npm run format
```

### Type Errors After Strict Mode
Strict mode catches more errors. Fix progressively:
1. Start with most impactful files
2. Use `// @ts-expect-error` for temporary workarounds
3. Add proper types incrementally

---

## 📚 Resources

- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)

---

**Last Updated**: 2026-01-17  
**Maintained By**: Development Team
