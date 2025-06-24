# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run linting (eslint)
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

This is a React + TypeScript + Vite personal activity tracker with Firebase backend integration. The app tracks multiple activity types (coffee, anxiety, exercise) with different data structures.

### Core Application Structure
- **Single Page App**: Main navigation between Activities and Exercises views via tabs in `App.tsx`
- **Activity Types**: Three distinct activity types with type-safe interfaces defined in `firebase.ts`
- **Firebase Integration**: Uses Firestore for data persistence with real-time queries

### Key Data Models
- **Activities**: Base activity type with specialized interfaces for coffee, anxiety, and exercise
- **Workouts**: Exercise sessions with planned vs actual tracking
- **Exercise Logs**: Separate collection for recording actual exercise performance

### Component Architecture
- `App.tsx`: Main application shell with tab navigation and activity management
- `components/ExerciseDashboard.tsx`: Complex workout tracking with date navigation and exercise logging
- `components/WorkoutImporter.tsx`: CSV import functionality for bulk workout data
- `AnxietyLogger.tsx` & `CoffeeLogger.tsx`: Modal forms for specific activity types

### State Management
- Local React state with hooks
- Firebase real-time data fetching
- Custom hooks in `hooks/useExerciseHooks.ts` for exercise-related operations

### Service Layer
- `firebase.ts`: Core Firebase setup and activity CRUD operations
- `services/exerciseService.ts`: Complex exercise/workout data operations with extensive logging

### Key Technical Details
- **TypeScript**: Strict typing throughout with discriminated unions for activity types
- **Date Handling**: PST timezone-specific date formatting and querying. IMPORTANT: Always use explicit local timezone date construction to avoid timezone offset issues
- **Firebase Collections**: `activities`, `workouts`, `exerciseLogs` with proper Timestamp handling
- **CSV Import**: Structured workout import with exercise grouping and ordering

### Date Handling Best Practices
To avoid timezone issues throughout the application:
- **Creating dates from strings**: Use `new Date(year, month - 1, day)` instead of `new Date(dateString)`
- **Date-only operations**: Use `getFullYear()`, `getMonth()`, `getDate()` instead of `toISOString().split('T')[0]`
- **Date arithmetic**: Use explicit constructor `new Date(year, month, day + 1)` instead of `setDate()`
- **DateTime inputs**: Parse datetime-local format explicitly with component extraction

### PWA Features
- Service worker (`public/sw.js`) for offline functionality
- Web manifest (`public/manifest.json`) for app installation