import { useState, useEffect, useCallback } from 'react';
import type { Workout, ExerciseLog, SetEntry } from '../services/exerciseService';
import { exerciseService } from '../services/exerciseService';

interface ExerciseFormData {
  sets: SetEntry[];
}

export function useExerciseForm(workout: Workout | null, logs: ExerciseLog[]) {
  console.log('useExerciseForm: Hook starting with workout:', workout, 'logs:', logs);
  const [exerciseFormData, setExerciseFormData] = useState<Record<string, ExerciseFormData>>({});
  const [savedExerciseIds, setSavedExerciseIds] = useState<string[]>([]);
  const [savingExerciseIds, setSavingExerciseIds] = useState<string[]>([]);

  // Initialize form data when workout or logs change
  useEffect(() => {
    if (workout && workout.exercises) {
      const newFormData: Record<string, ExerciseFormData> = {};
      
      workout.exercises.forEach(exercise => {
        if (!exercise.id) return;
        
        // Find existing log for this exercise
        const existingLog = logs.find(log => log.exerciseId === exercise.id);
        
        if (existingLog && existingLog.actual.sets) {
          // Use existing log data
          newFormData[exercise.id] = {
            sets: existingLog.actual.sets
          };
        } else {
          // Initialize empty sets based on planned sets length
          const emptySetData: SetEntry[] = exercise.planned.sets.map(() => ({}));
          newFormData[exercise.id] = {
            sets: emptySetData
          };
        }
      });
      
      setExerciseFormData(newFormData);
    }
  }, [workout, logs]);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (exerciseId: string, setIndex: number, field: keyof SetEntry, value: string | number | undefined) => {
    if (!workout) return;
    
    try {
      setSavingExerciseIds(prev => [...prev, exerciseId]);
      
      const currentFormData = exerciseFormData[exerciseId];
      if (!currentFormData) return;
      
      // Update the specific field
      const updatedSets = [...currentFormData.sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value
      };
      
      // Save to database
      const existingLog = logs.find(log => log.exerciseId === exerciseId);
      
      if (existingLog && existingLog.id) {
        // Update existing log
        await exerciseService.updateExerciseLog(existingLog.id, {
          actual: { sets: updatedSets }
        });
      } else {
        // Create new log
        await exerciseService.logExercise({
          exerciseId,
          workoutId: workout.id,
          loggedAt: new Date(),
          actual: { sets: updatedSets }
        });
      }
      
      setSavedExerciseIds(prev => [...prev, exerciseId]);
      setTimeout(() => {
        setSavedExerciseIds(prev => prev.filter(id => id !== exerciseId));
      }, 2000);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSavingExerciseIds(prev => prev.filter(id => id !== exerciseId));
    }
  }, [workout, exerciseFormData, logs]);

  const handleSetChange = (exerciseId: string, setIndex: number, field: keyof SetEntry, value: string | number | undefined) => {
    setExerciseFormData(prev => {
      const currentData = prev[exerciseId] || { sets: [] };
      const updatedSets = [...currentData.sets];
      
      // Ensure the array is long enough
      while (updatedSets.length <= setIndex) {
        updatedSets.push({});
      }
      
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value
      };
      
      return {
        ...prev,
        [exerciseId]: {
          ...currentData,
          sets: updatedSets
        }
      };
    });
  };

  const markAsCompleted = async (exerciseId: string) => {
    if (!workout) return;
    
    const exercise = workout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    try {
      setSavingExerciseIds(prev => [...prev, exerciseId]);
      
      // Auto-fill all sets with planned values
      const completedSets: SetEntry[] = exercise.planned.sets.map((plannedValue) => {
        const setData: SetEntry = {};
        
        if (exercise.planned.isUnilateral) {
          // For unilateral exercises, fill both left and right with planned values
          if (exercise.planned.unit === 'reps') {
            setData.leftReps = plannedValue;
            setData.rightReps = plannedValue;
          } else {
            setData.leftDuration = plannedValue;
            setData.rightDuration = plannedValue;
          }
          
          if (exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight') {
            setData.leftWeight = {
              amount: exercise.planned.weight.amount,
              unit: exercise.planned.weight.unit
            };
            setData.rightWeight = {
              amount: exercise.planned.weight.amount,
              unit: exercise.planned.weight.unit
            };
          }
        } else {
          // For bilateral exercises, use the original logic
          if (exercise.planned.unit === 'reps') {
            setData.reps = plannedValue;
          } else {
            setData.duration = plannedValue;
          }
          
          if (exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight') {
            setData.weight = {
              amount: exercise.planned.weight.amount,
              unit: exercise.planned.weight.unit
            };
          }
        }
        
        return setData;
      });
      
      // Update form data
      setExerciseFormData(prev => ({
        ...prev,
        [exerciseId]: { sets: completedSets }
      }));
      
      // Save to database
      const existingLog = logs.find(log => log.exerciseId === exerciseId);
      
      if (existingLog && existingLog.id) {
        await exerciseService.updateExerciseLog(existingLog.id, {
          actual: { sets: completedSets }
        });
      } else {
        await exerciseService.logExercise({
          exerciseId,
          workoutId: workout.id,
          loggedAt: new Date(),
          actual: { sets: completedSets }
        });
      }
      
      setSavedExerciseIds(prev => [...prev, exerciseId]);
      setTimeout(() => {
        setSavedExerciseIds(prev => prev.filter(id => id !== exerciseId));
      }, 2000);
      
    } catch (error) {
      console.error('Mark as completed failed:', error);
    } finally {
      setSavingExerciseIds(prev => prev.filter(id => id !== exerciseId));
    }
  };

  return {
    exerciseFormData,
    savedExerciseIds,
    savingExerciseIds,
    handleSetChange,
    markAsCompleted,
    autoSave
  };
}