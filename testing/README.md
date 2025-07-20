# Testing Suite

This directory contains the complete testing infrastructure for the portfolio project, including unit tests for both frontend and backend, as well as end-to-end tests.

## Directory Structure

```
testing/
├── unit/
│   ├── frontend/          # Frontend unit tests
│   │   ├── basic.test.ts
│   │   ├── crud.test.ts
│   │   └── YakShaverSpinner.test.tsx
│   └── backend/           # Backend unit tests
│       ├── basic.test.ts
│       └── public.test.ts
├── e2e/                   # End-to-end tests
│   └── navigation.spec.ts
├── setup/                 # Shared test setup and mocks
│   ├── setup.ts
│   └── basic.test.ts
├── jest.config.js         # Frontend Jest configuration
├── jest.config.backend.js # Backend Jest configuration
├── playwright.config.ts   # Playwright E2E configuration
├── package.json           # Test dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## Quick Start

### Install Dependencies

```bash
cd testing
npm install
```

### Run Tests

```bash
# Frontend unit tests
npm run test:frontend

# Backend unit tests
npm run test:backend

# All unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# All tests (unit + E2E)
npm run test:all
```

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

## Configuration

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

## Writing Tests

### Frontend Unit Tests

```typescript
import { describe, it, expect } from "@jest/globals";
import { YourComponent } from "@frontend/components/YourComponent";

describe("YourComponent", () => {
	it("should render correctly", () => {
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
	it("should handle request correctly", async () => {
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

The testing setup includes path mapping for easy imports:

- `@frontend/*` - References `../frontend/src/*`
- `@backend/*` - References `../backend/src/*`
- `@testing/*` - References the current testing directory

## Coverage Reports

After running tests with coverage, you can find reports in:

- **Frontend**: `coverage/frontend/`
- **Backend**: `coverage/backend/`

Open `coverage/*/lcov-report/index.html` in your browser to view detailed coverage information.

## Test Artifacts

- **Test Results**: `test-results/` (screenshots, videos, traces)
- **Playwright Reports**: `playwright-report/` (HTML reports)
- **Coverage**: `coverage/` (coverage reports)

## Continuous Integration

The test suite is designed to run in CI environments:

- Jest runs in parallel for faster execution
- Playwright uses multiple browser projects
- Coverage reports are generated for monitoring
- Tests fail fast on CI to catch issues early

## Debugging

### Jest Debugging

```bash
# Run tests in watch mode
npm run test:frontend:watch

# Run specific test file
npm run test:frontend -- basic.test.ts

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

## Best Practices

1. **Test Organization**: Group related tests using `describe` blocks
2. **Test Names**: Use descriptive test names that explain the behavior
3. **Mocking**: Mock external dependencies and APIs
4. **Coverage**: Aim for high test coverage, especially for critical paths
5. **E2E Tests**: Focus on user workflows and critical user journeys
6. **Performance**: Keep tests fast and focused

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure to use the correct import paths (`@frontend/*`, `@backend/*`)
2. **Environment Issues**: Check that the setup file is properly configured for your test environment
3. **E2E Failures**: Verify that the frontend dev server is accessible at http://localhost:5173

### Getting Help

- Check the test output for detailed error messages
- Review the test artifacts (screenshots, videos) for visual debugging
- Use the Playwright UI for interactive debugging
- Consult the Jest and Playwright documentation for advanced features 