import { useState, useEffect } from 'react';
import type { Workout, ExerciseLog } from '../services/exerciseService';
import { exerciseService } from '../services/exerciseService';

// Get workout for date
export function useWorkoutByDate(date: Date) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      setLoading(true);
      try {
        const workoutData = await exerciseService.getWorkoutByDate(date);
        setWorkout(workoutData);
        
        if (workoutData) {
          const logsData = await exerciseService.getExerciseLogs(workoutData.id);
          setLogs(logsData);
        } else {
          setLogs([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching workout:', err);
        setError('Failed to load workout data');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [date]);

  const refresh = () => {
    setError(null);
    fetchWorkout();
  };

  return { workout, logs, loading, error, refresh };
}

// Get available workout dates for navigation
export function useWorkoutDates() {
  const [dates, setDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDates = async () => {
      setLoading(true);
      try {
        const workoutDates = await exerciseService.getWorkoutDates();
        setDates(workoutDates);
        setError(null);
      } catch (err) {
        console.error('Error fetching workout dates:', err);
        setError('Failed to load workout dates');
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, []);

  const refresh = () => {
    setError(null);
    fetchDates();
  };

  return { dates, loading, error, refresh };
}
