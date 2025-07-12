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

#### Priority Scenarios:
- **New user onboarding**: First activity logging
- **Daily workout completion**: Plan → Execute → Review
- **Data persistence**: Log activity → Refresh → Verify data
- **PWA functionality**: Install → Offline usage → Sync

## Testing Setup Implementation

### Phase 1: Foundation Setup
```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
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
├── __tests__/
│   ├── utils/           # Utility function tests
│   ├── hooks/           # Custom hook tests
│   ├── services/        # Firebase service tests
│   └── components/      # Component tests
├── __mocks__/
│   ├── firebase.ts      # Firebase mocking
│   └── handlers.ts      # MSW API handlers
└── test-setup.ts        # Global test configuration
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
      - run: npm run test
      - run: npm run test:e2e
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

### Week 3: Component Coverage
- [ ] Test critical components
- [ ] Add visual regression tests
- [ ] Implement E2E tests for key scenarios

### Week 4: Polish
- [ ] Achieve 80% code coverage
- [ ] Document testing patterns
- [ ] Create developer testing guidelines

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