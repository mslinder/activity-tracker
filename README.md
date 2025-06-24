# Personal Activity Tracker

A React-based personal activity tracking application built with TypeScript, Firebase, and Vite. The app allows users to track various activities including coffee consumption, anxiety episodes, and exercise workouts with detailed logging capabilities.

## 🏗️ Technical Architecture

### Core Technologies
- **Frontend**: React 19.1.0 + TypeScript 5.8.3
- **Build Tool**: Vite 6.3.5
- **Backend**: Firebase Firestore
- **Styling**: CSS Modules + Inline Styles
- **State Management**: React Context + useReducer
- **Linting**: ESLint with TypeScript rules

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shared UI components (Button, Input, Card)
│   ├── ExerciseDashboard.tsx    # Main exercise tracking interface
│   ├── ExerciseCard.tsx         # Individual exercise form component
│   ├── SetInputRow.tsx          # Set input component
│   ├── DateNavigation.tsx       # Date navigation component
│   ├── WorkoutImporter.tsx      # CSV import functionality
│   └── ErrorBoundary.tsx        # Error handling component
├── context/             # React Context for state management
│   └── ExerciseContext.tsx      # Exercise form state management
├── hooks/               # Custom React hooks
│   ├── useExerciseHooks.ts      # Workout data fetching
│   ├── useExerciseForm.ts       # Exercise form logic (legacy)
│   └── useExerciseFormWithContext.ts  # Context-based form logic
├── services/            # External service integrations
│   └── exerciseService.ts       # Firebase Firestore operations
├── styles/              # CSS modules
│   └── components.module.css    # Component styling
├── utils/               # Utility functions
│   └── validation.ts            # Form validation logic
├── firebase.ts          # Firebase configuration and basic operations
└── App.tsx             # Main application component
```

## 🎯 Core Features

### 1. Activity Tracking
The app tracks three distinct activity types with type-safe interfaces:

#### Coffee Activities
```typescript
interface CoffeeActivity {
  type: 'coffee';
  data: {
    coffeeType: 'Espresso' | 'Cold Brew' | 'Pour Over';
    amount: number;
  };
}
```

#### Anxiety Activities
```typescript
interface AnxietyActivity {
  type: 'anxiety';
  data: {
    intensity: number;  // 1-5 scale
    thought?: string;   // Optional anxious thought
  };
}
```

#### Exercise Activities
```typescript
interface ExerciseActivity {
  type: 'exercise';
  data: {
    name: string;
    completed: boolean;
  };
}
```

### 2. Exercise Tracking System

#### Workout Structure
Workouts are complex entities containing multiple exercises:
```typescript
interface Workout {
  id: string;
  name: string;
  date: Date;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  description: string;
  planned: {
    setsRepsDuration: string;  // e.g., "3 x 10"
    weight: string;
  };
  order: number;
}
```

#### Exercise Logging
The system tracks planned vs. actual performance:
```typescript
interface ExerciseLog {
  id?: string;
  exerciseId: string;
  workoutId: string;
  loggedAt: Date;
  actual: {
    sets: SetEntry[];           // New structured format
    setsRepsDuration?: string;  // Legacy format for compatibility
    weight?: string;
  };
  comments?: string;
}

interface SetEntry {
  reps?: number;
  duration?: string;
  weight?: string;
}
```

## 🔄 State Management Architecture

### Context-Based State Management
The app uses React Context with useReducer for complex exercise form state:

```typescript
interface ExerciseState {
  exerciseFormData: Record<string, ExerciseFormData>;
  savedExerciseIds: string[];
  savingExerciseIds: string[];
}
```

### State Actions
The reducer handles various actions:
- `SET_FORM_DATA`: Initialize form data from Firebase
- `UPDATE_SET`: Update individual set values
- `UPDATE_COMMENTS`: Update exercise comments
- `UPDATE_COMPLETION`: Update completion status
- `ADD_SAVING`/`REMOVE_SAVING`: Track saving states
- `ADD_SAVED`/`REMOVE_SAVED`: Show success feedback

### Local Storage Integration
Form data is persisted to localStorage for:
- **Data Recovery**: Prevent loss during navigation
- **Offline Capability**: Work without constant Firebase connection
- **Performance**: Reduce Firebase reads for frequently accessed data

## 🔥 Firebase Integration

### Database Schema

#### Collections
1. **`activities`**: General activity tracking
   - Documents contain: `type`, `timestamp`, `data`, `createdAt`
   - Real-time queries for today's activities

2. **`workouts`**: Exercise workout plans
   - Documents contain: `name`, `date`, `exercises[]`
   - Date-based queries for workout retrieval

3. **`exerciseLogs`**: Exercise performance tracking
   - Documents contain: `workoutId`, `exerciseId`, `actual`, `comments`, `loggedAt`
   - Linked to workouts via `workoutId`

### Data Flow
```
User Input → Component State → Context/Hook → Service Layer → Firestore
                    ↓
              localStorage (backup)
                    ↓
              Real-time Updates ← Firestore Listeners
```

### Service Layer
`exerciseService.ts` provides:
- **CRUD Operations**: Create, read, update exercise logs
- **Data Transformation**: Convert between Firestore and app formats
- **Error Handling**: Consistent error management
- **CSV Import**: Bulk workout data import

## 🎨 Component Architecture

### Component Hierarchy
```
App
├── ActivityView
│   ├── CoffeeLogger (Modal)
│   ├── AnxietyLogger (Modal)
│   └── ActivityList
└── ExerciseView
    ├── DateNavigation
    ├── WorkoutImporter
    └── ExerciseDashboard
        └── ExerciseCard[]
            └── SetInputRow[]
```

### Shared UI Components
Reusable components with variant support:

#### Button Component
```typescript
<Button variant="primary" size="medium" onClick={handleSave}>
  Save
</Button>
```

#### Input Component
```typescript
<Input 
  variant="success" 
  label="Weight" 
  error={validationError}
  fullWidth 
/>
```

#### Card Component
```typescript
<Card title="Exercise Details" padding="medium">
  {children}
</Card>
```

### Custom Hooks

#### useWorkoutByDate
Fetches workout and exercise logs for a specific date:
```typescript
const { workout, logs, loading, error } = useWorkoutByDate(selectedDate);
```

#### useExerciseFormWithContext
Manages complex exercise form state with validation:
```typescript
const {
  exerciseFormData,
  handleSetChange,
  saveExerciseLog,
  markAsCompleted
} = useExerciseFormWithContext(workout, logs);
```

## ⚡ Performance Optimizations

### State Management
- **Context Separation**: Exercise state isolated from app state
- **Selective Updates**: Only affected components re-render
- **Memoization**: Prevent unnecessary calculations

### Data Fetching
- **Date-based Queries**: Only fetch relevant workout data
- **Local Storage Caching**: Reduce Firebase reads
- **Optimistic Updates**: Immediate UI feedback

### Component Design
- **Component Splitting**: Smaller, focused components
- **Prop Drilling Elimination**: Context for deep state
- **Error Boundaries**: Graceful failure handling

## 🛡️ Error Handling & Validation

### Form Validation
Comprehensive validation for exercise inputs:
```typescript
// Validates reps, weight format, duration format
const errors = validateExerciseForm(sets, comments);
```

### Error Boundaries
React Error Boundaries catch and display errors gracefully:
```typescript
<ErrorBoundary fallback={CustomErrorComponent}>
  <ExerciseDashboard />
</ErrorBoundary>
```

### Service Layer Error Handling
Consistent error propagation with user-friendly messages:
```typescript
try {
  await exerciseService.logExercise(data);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  alert(`Error saving: ${message}`);
}
```

## 🔧 Development Workflow

### Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Linting
npm run lint

# Preview build
npm run preview
```

### Code Quality
- **TypeScript**: Strict type checking throughout
- **ESLint**: Code quality and consistency
- **Error Boundaries**: Graceful error handling
- **Validation**: Input validation at multiple layers

### Testing Strategy
While tests aren't implemented yet, the architecture supports:
- **Unit Tests**: Individual components and hooks
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows

## 📱 PWA Features

### Service Worker
Basic offline functionality through `public/sw.js`

### Web App Manifest
Installable app configuration in `public/manifest.json`

## 🚀 Deployment Considerations

### Environment Variables
Firebase configuration should be environment-specific:
```typescript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  // ... other config
};
```

### Build Optimization
- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Automatic minification

### Security
- **Firebase Rules**: Implement proper Firestore security rules
- **Input Validation**: Client and server-side validation
- **Error Messages**: Don't expose sensitive information

## 🔄 Future Enhancements

### Immediate Improvements
1. **Complete CSS Module Migration**: Replace inline styles
2. **Add Unit Tests**: Jest + React Testing Library
3. **Implement Proper Authentication**: Firebase Auth
4. **Add Data Export**: CSV/JSON export functionality

### Advanced Features
1. **Real-time Collaboration**: Multiple users
2. **Analytics Dashboard**: Progress tracking
3. **Mobile App**: React Native version
4. **Offline-First**: Enhanced PWA capabilities

## 📖 API Reference

### Core Services

#### ActivityService (firebase.ts)
```typescript
addActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<string>
getTodaysActivities(): Promise<Activity[]>
addAnxietyThought(intensity: number, thought?: string): Promise<string>
```

#### ExerciseService
```typescript
getWorkoutByDate(date: Date): Promise<Workout | null>
logExercise(log: Omit<ExerciseLog, 'id'>): Promise<string>
updateExerciseLog(id: string, updates: Partial<ExerciseLog>): Promise<void>
getExerciseLogs(workoutId: string): Promise<ExerciseLog[]>
importWorkoutFromCSV(csvData: CSVRow[]): Promise<void>
```

This architecture provides a solid foundation for a scalable, maintainable personal activity tracking application with room for future enhancements and optimizations.