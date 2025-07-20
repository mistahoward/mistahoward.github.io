# Testing Setup for Portfolio Project

This project uses a comprehensive testing strategy with both unit tests (Jest) and end-to-end tests (Playwright), all centralized in the `testing/` directory.

## Testing Stack

- **Unit Testing**: Jest with jsdom for frontend, Node.js environment for backend
- **E2E Testing**: Playwright for cross-browser testing
- **Test Utilities**: @testing-library/react for component testing
- **Coverage**: Built-in Jest coverage reporting

## Quick Start

### Install Dependencies

```bash
# Navigate to the testing directory
cd testing
npm install
```

### Run Tests

```bash
# Frontend unit tests
npm run test:frontend

# Frontend unit tests with coverage
npm run test:frontend:coverage

# Backend unit tests
npm run test:backend

# All unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# Run all tests
npm run test:all
```

## Test Structure

```
mistahoward.github.io/
├── frontend/              # Frontend application
├── backend/               # Backend application
└── testing/               # All testing infrastructure
    ├── unit/
    │   ├── frontend/      # Frontend unit tests
    │   └── backend/       # Backend unit tests
    ├── e2e/               # E2E test specs
    ├── setup/             # Shared test setup
    ├── jest.config.js     # Frontend Jest config
    ├── jest.config.backend.js # Backend Jest config
    ├── playwright.config.ts   # Playwright config
    └── package.json       # Test dependencies
```

## Writing Tests

### Frontend Unit Tests

```typescript
import { describe, it, expect } from "@jest/globals";
import { YourComponent } from "@frontend/components/YourComponent";

describe("YourComponent", () => {
	it("renders correctly", () => {
		// Test implementation
		expect(true).toBe(true);
	});
});
```

### Backend Unit Tests

```typescript
import { describe, it, expect } from "@jest/globals";
import { yourHandler } from "@backend/routes/yourHandler";

describe("yourHandler", () => {
	it("handles request correctly", async () => {
		// Test implementation
		expect(true).toBe(true);
	});
});
```

### E2E Tests

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature", () => {
	test("should work end-to-end", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("h1")).toBeVisible();
	});
});
```

## Import Paths

The testing setup includes convenient path mapping:

- `@frontend/*` - References `../frontend/src/*`
- `@backend/*` - References `../backend/src/*`
- `@testing/*` - References the current testing directory

## Test Configuration

### Jest Configuration

- **Frontend**: Uses jsdom environment for DOM testing
- **Backend**: Uses Node.js environment
- **Coverage**: Generates HTML, text, and lcov reports
- **Transform**: Handles TypeScript and SCSS files

### Playwright Configuration

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:5173 (Vite dev server)
- **Screenshots**: On failure
- **Videos**: Retained on failure
- **Traces**: On first retry

## Available Scripts

### Unit Testing

- `npm run test:frontend` - Run frontend unit tests
- `npm run test:frontend:watch` - Run frontend tests in watch mode
- `npm run test:frontend:coverage` - Run frontend tests with coverage
- `npm run test:backend` - Run backend unit tests
- `npm run test:backend:watch` - Run backend tests in watch mode
- `npm run test:backend:coverage` - Run backend tests with coverage
- `npm run test:unit` - Run all unit tests

### E2E Testing

- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:e2e:debug` - Run E2E tests in debug mode

### Utilities

- `npm run install:browsers` - Install Playwright browsers
- `npm run test:all` - Run all tests (unit + E2E)

## Best Practices

1. **Test Organization**: Group related tests using `describe` blocks
2. **Test Names**: Use descriptive test names that explain the behavior
3. **Mocking**: Mock external dependencies and APIs
4. **Coverage**: Aim for high test coverage, especially for critical paths
5. **E2E Tests**: Focus on user workflows and critical user journeys
6. **Performance**: Keep tests fast and focused

## Continuous Integration

The test suite is designed to run in CI environments:

- Jest runs in parallel for faster execution
- Playwright uses multiple browser projects
- Coverage reports are generated for monitoring
- Tests fail fast on CI to catch issues early

## Debugging Tests

### Jest Debugging

```bash
# Run tests in watch mode
npm run test:frontend:watch

# Run specific test file
npm run test:frontend -- YourComponent.test.tsx

# Run tests with verbose output
npm run test:frontend -- --verbose
```

### Playwright Debugging

```bash
# Run tests in headed mode
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Open Playwright UI
npm run test:e2e:ui
```

## Coverage Reports

After running tests with coverage, you can find reports in:

- **Frontend**: `testing/coverage/frontend/`
- **Backend**: `testing/coverage/backend/`

Open `coverage/*/lcov-report/index.html` in your browser to view detailed coverage information.

## Test Artifacts

- **Test Results**: `testing/test-results/` (screenshots, videos, traces)
- **Playwright Reports**: `testing/playwright-report/` (HTML reports)
- **Coverage**: `testing/coverage/` (coverage reports)

## Migration from Previous Structure

The testing infrastructure has been moved from individual `frontend/` and `backend/` directories to a centralized `testing/` directory. This provides:

- **Better organization**: All test-related files in one place
- **Easier maintenance**: Single location for test dependencies and configs
- **Cleaner project structure**: Application code is separate from test code
- **Simplified CI/CD**: Single testing directory to configure

For detailed information about the testing setup, see `testing/README.md`. 