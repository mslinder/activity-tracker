import { useEffect } from 'react';
import type { Workout, ExerciseLog, SetEntry } from '../services/exerciseService';
import { exerciseService } from '../services/exerciseService';
import { useExerciseContext } from '../context/ExerciseContext';

export function useExerciseFormWithContext(workout: Workout | null, logs: ExerciseLog[]) {
  const { state, dispatch } = useExerciseContext();

  // Initialize form data when workout or logs change
  useEffect(() => {
    if (workout && logs) {
      if (!workout.exercises || workout.exercises.length === 0) {
        return;
      }
      
      const newFormData: Record<string, { sets: SetEntry[]; comments: string; completed: 'full' | 'partial' | 'none' }> = {};
      
      workout.exercises.forEach(exercise => {
        if (!exercise.id || !exercise.planned) {
          return;
        }
        
        // Check localStorage first for any saved data
        const storageKey = `exercise_${workout.id}_${exercise.id}`;
        let localStorageData = null;
        
        try {
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData && parsedData.sets && Array.isArray(parsedData.sets)) {
              localStorageData = parsedData;
            }
          }
        } catch (error) {
          // Silently handle localStorage errors
        }
        
        // If we have valid localStorage data, use it instead of logs
        if (localStorageData) {
          newFormData[exercise.id] = {
            sets: localStorageData.sets,
            comments: localStorageData.comments || '',
            completed: localStorageData.completed || 'none'
          };
          return;
        }
        
        // If no localStorage data, proceed with logs
        const log = logs.find(log => log.exerciseId === exercise.id);
        
        // Parse planned sets from the string (e.g., "3 x 10" becomes 3 sets)
        const plannedSetsMatch = exercise.planned.setsRepsDuration?.match(/^(\d+)\s*x/i);
        const numSets = plannedSetsMatch ? parseInt(plannedSetsMatch[1]) : 1;
        
        if (log && log.actual) {
          // Use existing logged sets
          let sets = [];
          if (Array.isArray(log.actual.sets) && log.actual.sets.length > 0) {
            sets = [...log.actual.sets];
          } else {
            // If sets are missing but we have legacy format data, try to parse it
            if (log.actual.setsRepsDuration) {
              sets = Array(numSets).fill(null).map((_, i) => {
                const setPattern = new RegExp(`Set ${i+1}: (\\d+)`);
                const match = log.actual.setsRepsDuration?.match(setPattern);
                return {
                  reps: match ? parseInt(match[1]) : undefined,
                  duration: undefined,
                  weight: log.actual.weight ? log.actual.weight : undefined
                };
              });
            } else {
              sets = Array(numSets).fill(null).map(() => ({
                reps: undefined,
                duration: undefined,
                weight: undefined
              }));
            }
          }
          
          // Determine completion status based on existing data
          let completionStatus: 'full' | 'partial' | 'none' = 'none';
          
          const allSetsHaveData = sets.every(set => 
            (set.reps !== undefined || set.duration !== undefined)
          );
          
          if (allSetsHaveData) {
            completionStatus = 'full';
          } else if (sets.some(set => 
            (set.reps !== undefined || set.duration !== undefined)
          )) {
            completionStatus = 'partial';
          }
          
          newFormData[exercise.id] = {
            sets: sets,
            comments: log.comments || '',
            completed: completionStatus
          };
        } else {
          // Create empty sets based on planned sets count
          newFormData[exercise.id] = {
            sets: Array(numSets).fill(null).map(() => ({
              reps: undefined,
              duration: undefined,
              weight: undefined
            })),
            comments: log?.comments || '',
            completed: 'none'
          };
        }
      });
      
      dispatch({ type: 'SET_FORM_DATA', payload: newFormData });
    }
  }, [workout, logs, dispatch]);

  const handleSetChange = (exerciseId: string, setIndex: number, field: keyof SetEntry, value: string | number | undefined) => {
    dispatch({
      type: 'UPDATE_SET',
      payload: { exerciseId, setIndex, field, value }
    });
  };

  const handleCommentsChange = (exerciseId: string, comments: string) => {
    dispatch({
      type: 'UPDATE_COMMENTS',
      payload: { exerciseId, comments }
    });
  };

  const handleCompletionChange = (exerciseId: string, status: 'full' | 'partial' | 'none') => {
    dispatch({
      type: 'UPDATE_COMPLETION',
      payload: { exerciseId, completed: status }
    });
  };

  const showSuccessFeedback = (exerciseId: string) => {
    dispatch({ type: 'ADD_SAVED', payload: exerciseId });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_SAVED', payload: exerciseId });
    }, 3000);
  };

  const saveExerciseLog = async (exerciseId: string, onRefresh: () => void) => {
    if (!workout) {
      return;
    }
    
    const formData = state.exerciseFormData[exerciseId];
    if (!formData) {
      return;
    }
    
    const existingLog = logs.find(log => log.exerciseId === exerciseId);
    
    try {
      dispatch({ type: 'ADD_SAVING', payload: exerciseId });
      
      // Prepare the data to save
      const actualData = {
        sets: formData.sets,
        setsRepsDuration: formData.sets.map((set, i) => 
          `Set ${i+1}: ${set.reps || ''}${set.duration ? ` ${set.duration}` : ''}`
        ).join(', '),
        weight: formData.sets.map(set => set.weight).filter(Boolean).join(', ')
      };
      
      if (existingLog) {
        await exerciseService.updateExerciseLog(existingLog.id!, {
          actual: actualData,
          comments: formData.comments
        });
      } else {
        const logData = {
          workoutId: workout.id,
          exerciseId,
          loggedAt: new Date(),
          actual: actualData,
          comments: formData.comments
        };
        
        await exerciseService.logExercise(logData);
      }
      
      // Store in localStorage
      try {
        const storageKey = `exercise_${workout.id}_${exerciseId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          sets: formData.sets,
          comments: formData.comments,
          completed: formData.completed,
          timestamp: new Date().toISOString()
        }));
      } catch (storageError) {
        // Silently handle localStorage errors
      }
      
      onRefresh();
      showSuccessFeedback(exerciseId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error saving exercise log: ${errorMessage}`); 
    } finally {
      dispatch({ type: 'REMOVE_SAVING', payload: exerciseId });
    }
  };

  const markAsCompleted = async (exerciseId: string, onRefresh: () => void, status: 'full' | 'partial' | 'none' = 'full') => {
    if (!workout) return;
    
    const exerciseItem = workout.exercises.find(ex => ex.id === exerciseId);
    if (!exerciseItem) return;
    
    // Parse planned sets and reps
    const plannedSetsReps = exerciseItem.planned?.setsRepsDuration?.split('x').map(s => s.trim()) || [];
    const plannedSets = parseInt(plannedSetsReps[0]) || 0;
    const plannedReps = parseInt(plannedSetsReps[1]) || 0;
    
    // Create sets array with planned values
    const setsArray: SetEntry[] = Array(plannedSets).fill(0).map(() => ({
      reps: plannedReps,
      weight: exerciseItem.planned?.weight,
      duration: undefined
    }));
    
    // Update form data with planned values
    dispatch({
      type: 'UPDATE_EXERCISE_FORM',
      payload: {
        exerciseId,
        formData: {
          sets: setsArray,
          comments: 'Completed as planned',
          completed: status
        }
      }
    });
    
    // Save the exercise log immediately
    await saveExerciseLog(exerciseId, onRefresh);
  };

  return {
    exerciseFormData: state.exerciseFormData,
    savedExerciseIds: state.savedExerciseIds,
    savingExerciseIds: state.savingExerciseIds,
    handleSetChange,
    handleCommentsChange,
    handleCompletionChange,
    saveExerciseLog,
    markAsCompleted
  };
}