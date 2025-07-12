# Testing Strategy for Activity Tracker

## Overview

This document outlines a comprehensive testing strategy for your React + TypeScript + Firebase activity tracker application. Currently, the app has no testing framework setup, so we'll build from the ground up with a pragmatic approach focused on preventing regressions.

## Testing Pyramid

### 1. Unit Tests (Foundation - 70% of tests)
**What**: Test individual functions, components, and hooks in isolation
**When**: Every utility function, custom hook, and pure component
**Tools**: Vitest + React Testing Library

#### Priority Areas:
- **Firebase service functions** (`firebase.ts`, `exerciseService.ts`)
- **Custom hooks** (`useExerciseHooks.ts`, `useExerciseForm.ts`)
- **Utility functions** (date handling, data transformations)
- **Form validation logic**

#### Example Test Cases:
```typescript
// Date handling (critical due to timezone issues)
describe('Date utilities', () => {
  it('should create PST dates correctly', () => {
    const date = createPSTDate(2024, 1, 15);
    expect(date.getFullYear()).toBe(2024);
  });
});

// Firebase service mocking
describe('Activity service', () => {
  it('should add coffee activity with correct timestamp', async () => {
    const mockAdd = vi.fn();
    const activity = await addActivity({ type: 'coffee', amount: 2 });
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
      type: 'coffee',
      timestamp: expect.any(Object)
    }));
  });
});
```

### 2. Integration Tests (Middle - 20% of tests)
**What**: Test how components work together with real data flow
**When**: Critical user journeys and component interactions
**Tools**: React Testing Library + MSW (Mock Service Worker)

#### Priority Areas:
- **Exercise logging flow** (ExerciseDashboard → Timer → Service)
- **Activity creation** (Modal forms → Firebase → UI update)
- **Date navigation** (DateNavigation → data fetching → display)
- **CSV import workflow** (WorkoutImporter → parsing → Firebase)

### 3. End-to-End Tests (Top - 10% of tests)
**What**: Test complete user workflows in a real browser
**When**: Critical business flows that must never break
**Tools**: Playwright

**Why Playwright is Excellent:**
- **Cross-browser testing**: Chrome, Firefox, Safari, Edge automatically
- **Fast and reliable**: Parallel execution, auto-wait for elements
- **Great debugging**: Screenshots, videos, traces on failure
- **Mobile testing**: Responsive design validation
- **Visual regression**: Built-in screenshot comparison
- **Network mocking**: Intercept API calls for reliable tests

#### Priority Scenarios:
- **New user onboarding**: First activity logging
- **Daily workout completion**: Plan → Execute → Review
- **Data persistence**: Log activity → Refresh → Verify data
- **PWA functionality**: Install → Offline usage → Sync
- **Responsive design**: Mobile vs desktop layouts
- **Cross-browser compatibility**: Ensure Firebase works everywhere

## Testing Setup Implementation

### Phase 1: Foundation Setup
```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Install Playwright (includes browsers)
npm install -D @playwright/test
npx playwright install
```

### Phase 2: Configuration
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

### Phase 3: Test Structure
```
src/
├── __tests__/           # Unit & integration tests
│   ├── utils/           # Utility function tests
│   ├── hooks/           # Custom hook tests
│   ├── services/        # Firebase service tests
│   └── components/      # Component tests
├── __mocks__/
│   ├── firebase.ts      # Firebase mocking
│   └── handlers.ts      # MSW API handlers
├── test-setup.ts        # Global test configuration
└── playwright.config.ts # Playwright configuration

tests/                   # E2E tests (separate from src/)
├── auth.spec.ts
├── activities.spec.ts
├── workouts.spec.ts
└── fixtures/
    ├── test-data.json
    └── screenshots/
```

### Phase 4: Playwright Configuration
Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Firebase Testing Strategy

### Mocking Approach
1. **Mock Firebase SDK** for unit tests
2. **Firebase Emulator** for integration tests
3. **Test database** for E2E tests

### Key Testing Patterns:
```typescript
// Mock Firestore operations
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    callback({ docs: mockDocs });
    return vi.fn(); // unsubscribe
  })
}));
```

## Component Testing Priorities

### High Priority (Must Test)
1. **App.tsx** - Main navigation and state management
2. **ExerciseDashboard.tsx** - Complex workout tracking logic
3. **ActivityManager.tsx** - Core activity CRUD operations
4. **WorkoutImporter.tsx** - CSV parsing and data validation

### Medium Priority
1. **ExerciseTimer.tsx** - Timer functionality and notifications
2. **Modal forms** (AnxietyLogger, CoffeeLogger) - Form validation
3. **DateNavigation.tsx** - Date handling and navigation

### Lower Priority
1. **Styled components** - Visual regression testing
2. **Layout components** - Responsive behavior

## Test Data Management

### Test Fixtures
```typescript
// src/__tests__/fixtures/activities.ts
export const mockCoffeeActivity = {
  id: 'test-1',
  type: 'coffee',
  amount: 2,
  timestamp: new Date('2024-01-15T10:00:00'),
  notes: 'Morning coffee'
};

export const mockWorkout = {
  id: 'workout-1',
  date: '2024-01-15',
  exercises: [
    { name: 'Push-ups', sets: [{ reps: 10, weight: 0 }] }
  ]
};
```

### Database Seeding
- Create seed scripts for consistent test data
- Reset database state between test suites
- Use factory functions for generating test data

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test              # Vitest unit/integration tests
      - run: npx playwright install   # Install browsers
      - run: npm run test:e2e         # Playwright E2E tests
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Package.json Scripts
Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### Quality Gates
- **Unit tests**: 80% code coverage minimum
- **Integration tests**: All critical paths covered
- **E2E tests**: Core user journeys pass
- **No failing tests** in main branch

## Implementation Roadmap

### Week 1: Foundation
- [ ] Install and configure Vitest
- [ ] Set up React Testing Library
- [ ] Create test utilities and mocks
- [ ] Write first 5 unit tests for core utilities

### Week 2: Core Testing
- [ ] Test Firebase service layer
- [ ] Test custom hooks
- [ ] Add integration tests for main flows
- [ ] Set up CI pipeline

### Week 3: Playwright E2E Tests
- [ ] Set up Playwright configuration
- [ ] Write core user journey tests
- [ ] Add visual regression tests with screenshots
- [ ] Test PWA functionality and offline behavior
- [ ] Cross-browser validation

### Week 4: Advanced Testing
- [ ] Component visual regression testing
- [ ] Performance testing with Playwright
- [ ] Accessibility testing
- [ ] Mobile responsiveness validation
- [ ] Achieve 80% code coverage overall

## Best Practices

### Test Writing Guidelines
1. **Arrange-Act-Assert** pattern for clear test structure
2. **Test behavior, not implementation** - focus on user interactions
3. **Descriptive test names** - explain what should happen when
4. **Mock external dependencies** - Firebase, timers, network calls
5. **Test error scenarios** - network failures, invalid data

### Maintenance
- **Run tests on every commit** via pre-commit hooks
- **Update tests when features change** - tests are living documentation
- **Review test coverage regularly** - identify gaps and redundancies
- **Refactor tests** as codebase evolves

## Playwright Power Features

### Auto-Waiting & Reliability
```typescript
// Playwright automatically waits for elements - no more flaky tests!
await page.click('button:has-text("Add Activity")');
await page.fill('[data-testid="coffee-amount"]', '2');
await page.click('button:has-text("Save")');

// Wait for network requests to complete
await page.waitForResponse('**/activities');
```

### Visual Testing
```typescript
// Screenshot comparison - catch visual regressions
await page.screenshot({ path: 'activity-dashboard.png' });
await expect(page).toHaveScreenshot('dashboard-mobile.png');
```

### Network Interception
```typescript
// Mock Firebase API responses for reliable tests
await page.route('**/firestore/**', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ documents: mockActivities })
  });
});
```

### Cross-Browser Testing
```typescript
// Same test runs on Chrome, Firefox, Safari automatically
test('activity logging works across browsers', async ({ page }) => {
  // This test runs on all configured browsers
  await page.goto('/');
  await page.click('[data-testid="add-coffee"]');
  await expect(page.locator('.activity-item')).toBeVisible();
});
```

### Mobile Testing
```typescript
// Test responsive design with real mobile viewports
test('mobile workout timer', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/exercise');
  await page.click('[data-testid="start-timer"]');
  
  // Test mobile-specific interactions
  await page.tap('[data-testid="pause-button"]');
});
```

### Debugging Features
```typescript
// Pause test for debugging
await page.pause();

// Step-by-step debugging with trace viewer
// Run: npx playwright test --trace on
```

## Specific Firebase Considerations

### Authentication Testing
```typescript
// Mock authenticated user
const mockUser = { uid: 'test-user', email: 'test@example.com' };
vi.mocked(useAuthState).mockReturnValue([mockUser, false, undefined]);
```

### Timestamp Handling
```typescript
// Test Firestore Timestamp conversion
expect(activity.timestamp).toEqual(
  expect.objectContaining({
    toDate: expect.any(Function)
  })
);
```

### Real-time Updates
```typescript
// Test Firestore listeners
const mockCallback = vi.fn();
const unsubscribe = onSnapshot(query, mockCallback);
expect(mockCallback).toHaveBeenCalledWith(mockSnapshot);
```

This strategy provides a solid foundation for preventing regressions while maintaining development velocity. Start with unit tests for your most critical business logic, then gradually expand coverage as the testing infrastructure matures.