import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { SetEntry } from '../services/exerciseService';

interface ExerciseFormData {
  sets: SetEntry[];
  comments: string;
  completed: 'full' | 'partial' | 'none';
}

interface ExerciseState {
  exerciseFormData: Record<string, ExerciseFormData>;
  savedExerciseIds: string[];
  savingExerciseIds: string[];
}

type ExerciseAction =
  | { type: 'SET_FORM_DATA'; payload: Record<string, ExerciseFormData> }
  | { type: 'UPDATE_EXERCISE_FORM'; payload: { exerciseId: string; formData: ExerciseFormData } }
  | { type: 'UPDATE_SET'; payload: { exerciseId: string; setIndex: number; field: keyof SetEntry; value: string | number | undefined } }
  | { type: 'UPDATE_COMMENTS'; payload: { exerciseId: string; comments: string } }
  | { type: 'UPDATE_COMPLETION'; payload: { exerciseId: string; completed: 'full' | 'partial' | 'none' } }
  | { type: 'ADD_SAVING'; payload: string }
  | { type: 'REMOVE_SAVING'; payload: string }
  | { type: 'ADD_SAVED'; payload: string }
  | { type: 'REMOVE_SAVED'; payload: string };

const initialState: ExerciseState = {
  exerciseFormData: {},
  savedExerciseIds: [],
  savingExerciseIds: []
};

function exerciseReducer(state: ExerciseState, action: ExerciseAction): ExerciseState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        exerciseFormData: action.payload
      };

    case 'UPDATE_EXERCISE_FORM':
      return {
        ...state,
        exerciseFormData: {
          ...state.exerciseFormData,
          [action.payload.exerciseId]: action.payload.formData
        }
      };

    case 'UPDATE_SET': {
      const { exerciseId, setIndex, field, value } = action.payload;
      const currentFormData = state.exerciseFormData[exerciseId];
      if (!currentFormData) return state;

      const updatedSets = [...currentFormData.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value
      };

      // Determine completion status based on input
      let completionStatus = currentFormData.completed;
      
      if (updatedSets.some(set => set.reps !== undefined || set.duration !== undefined || set.weight !== undefined)) {
        const allSetsHaveData = updatedSets.every(set => 
          (set.reps !== undefined || set.duration !== undefined)
        );
        completionStatus = allSetsHaveData ? 'full' : 'partial';
      } else {
        completionStatus = 'none';
      }

      return {
        ...state,
        exerciseFormData: {
          ...state.exerciseFormData,
          [exerciseId]: {
            ...currentFormData,
            sets: updatedSets,
            completed: completionStatus
          }
        }
      };
    }

    case 'UPDATE_COMMENTS':
      return {
        ...state,
        exerciseFormData: {
          ...state.exerciseFormData,
          [action.payload.exerciseId]: {
            ...state.exerciseFormData[action.payload.exerciseId],
            comments: action.payload.comments
          }
        }
      };

    case 'UPDATE_COMPLETION':
      return {
        ...state,
        exerciseFormData: {
          ...state.exerciseFormData,
          [action.payload.exerciseId]: {
            ...state.exerciseFormData[action.payload.exerciseId],
            completed: action.payload.completed
          }
        }
      };

    case 'ADD_SAVING':
      return {
        ...state,
        savingExerciseIds: [...state.savingExerciseIds, action.payload]
      };

    case 'REMOVE_SAVING':
      return {
        ...state,
        savingExerciseIds: state.savingExerciseIds.filter(id => id !== action.payload)
      };

    case 'ADD_SAVED':
      return {
        ...state,
        savedExerciseIds: [...state.savedExerciseIds, action.payload]
      };

    case 'REMOVE_SAVED':
      return {
        ...state,
        savedExerciseIds: state.savedExerciseIds.filter(id => id !== action.payload)
      };

    default:
      return state;
  }
}

interface ExerciseContextType {
  state: ExerciseState;
  dispatch: React.Dispatch<ExerciseAction>;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(exerciseReducer, initialState);

  return (
    <ExerciseContext.Provider value={{ state, dispatch }}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExerciseContext() {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider');
  }
  return context;
}