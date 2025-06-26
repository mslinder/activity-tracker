import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Exported interfaces
export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  description: string;
  planned: {
    sets: number[];
    unit: 'reps' | 'seconds' | 'minutes';
    weight?: {
      amount: number;
      unit: 'lb' | 'kg' | 'bodyweight';
    };
    equipment?: string;
  };
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  exercises: Exercise[];
}

export interface SetEntry {
  reps?: number;
  duration?: number;
  weight?: {
    amount: number;
    unit: 'lb' | 'kg';
  };
  notes?: string;
}

export interface ExerciseLog {
  id?: string;
  exerciseId: string;
  workoutId: string;
  loggedAt: Date;
  actual: {
    sets: SetEntry[];
  };
}

export interface CSVRow {
  workoutName: string;
  date: string;
  exerciseName: string;
  description: string;
  order: number;
  Weight?: string;
  'Weight Unit'?: string;
  Equipment?: string;
  'Exercise Measure': string;
  'Set 1 Count'?: string;
  'Set 2 Count'?: string;
  'Set 3 Count'?: string;
  'Set 4 Count'?: string;
  'Set 5 Count'?: string;
}

// Service class
export class ExerciseService {
  // Get workout for specific date
  async getWorkoutByDate(date: Date): Promise<Workout | null> {
    try {
      // Format the date as YYYY-MM-DD in local timezone for string comparison
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Get all workouts
      const workoutsSnapshot = await getDocs(collection(db, 'workouts'));
      
      if (workoutsSnapshot.empty) {
        return null;
      }
      
      // Find workout with matching date
      let matchingWorkout = null;
      
      workoutsSnapshot.forEach(doc => {
        const workoutData = doc.data();
        
        // Check if date field exists and is a valid Timestamp
        if (!workoutData.date || !workoutData.date.toDate) {
          return;
        }
        
        const workoutDate = workoutData.date.toDate();
        // Format workout date in local timezone for comparison
        const workoutYear = workoutDate.getFullYear();
        const workoutMonth = String(workoutDate.getMonth() + 1).padStart(2, '0');
        const workoutDay = String(workoutDate.getDate()).padStart(2, '0');
        const workoutDateString = `${workoutYear}-${workoutMonth}-${workoutDay}`;
        
        if (workoutDateString === dateString) {
          // Check if exercises array exists
          if (!workoutData.exercises || !Array.isArray(workoutData.exercises)) {
            matchingWorkout = {
              id: doc.id,
              name: workoutData.name,
              date: workoutDate,
              exercises: []
            };
            return;
          }
          
          matchingWorkout = {
            id: doc.id,
            name: workoutData.name,
            date: workoutDate,
            exercises: workoutData.exercises.map((exercise: Record<string, unknown>, index: number) => {
              return {
                ...exercise,
                id: exercise.id || `${doc.id}-${exercise.order || index}`
              };
            }) as Exercise[]
          };
        }
      });
      
      return matchingWorkout;
    } catch (error) {
      console.error('Error getting workout by date:', error);
      throw error;
    }
  }
  
  // Log what was actually done
  async logExercise(log: Omit<ExerciseLog, 'id'>): Promise<string> {
    try {
      // Ensure we have all required fields
      if (!log.workoutId) {
        throw new Error('Missing workoutId in log exercise data');
      }
      if (!log.exerciseId) {
        throw new Error('Missing exerciseId in log exercise data');
      }
      if (!log.actual || !log.actual.sets) {
        throw new Error('Missing actual data in log exercise data');
      }

      // Clean the sets data to remove any undefined values that Firestore doesn't support
      const cleanSets = log.actual.sets.map(set => {
        const cleanSet: Record<string, string | number> = {};
        // Only include properties with defined values
        if (set.reps !== undefined) cleanSet.reps = set.reps;
        if (set.duration !== undefined) cleanSet.duration = set.duration;
        if (set.weight !== undefined) cleanSet.weight = set.weight;
        return cleanSet;
      });

      // Prepare the data for Firestore with cleaned values
      const firestoreData = {
        workoutId: log.workoutId,
        exerciseId: log.exerciseId,
        loggedAt: Timestamp.fromDate(log.loggedAt || new Date()),
        actual: {
          sets: cleanSets,
          setsRepsDuration: log.actual.setsRepsDuration || '',
          weight: log.actual.weight || ''
        },
        comments: log.comments || ''
      };
      
      const docRef = await addDoc(collection(db, 'exerciseLogs'), firestoreData);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }
  
  async updateExerciseLog(id: string, updates: Partial<ExerciseLog>): Promise<void> {
    try {
      if (!id) {
        throw new Error('Missing log ID for update');
      }

      // Create a clean update object without undefined values
      const cleanUpdates: Record<string, unknown> = {};
      
      // Handle loggedAt timestamp if present
      if (updates.loggedAt) {
        cleanUpdates.loggedAt = Timestamp.fromDate(updates.loggedAt);
      }
      
      // Handle comments if present
      if (updates.comments !== undefined) {
        cleanUpdates.comments = updates.comments || '';
      }
      
      // Handle actual data if present
      if (updates.actual) {
        cleanUpdates.actual = {};
        
        // Handle sets if present
        if (updates.actual.sets) {
          // Clean the sets data to remove any undefined values
          const cleanSets = updates.actual.sets.map(set => {
            const cleanSet: Record<string, string | number> = {};
            if (set.reps !== undefined) cleanSet.reps = set.reps;
            if (set.duration !== undefined) cleanSet.duration = set.duration;
            if (set.weight !== undefined) cleanSet.weight = set.weight;
            return cleanSet;
          });
          cleanUpdates.actual.sets = cleanSets;
        }
        
        // Handle legacy format fields
        if (updates.actual.setsRepsDuration !== undefined) {
          cleanUpdates.actual.setsRepsDuration = updates.actual.setsRepsDuration || '';
        }
        
        if (updates.actual.weight !== undefined) {
          cleanUpdates.actual.weight = updates.actual.weight || '';
        }
      }
      
      // Only proceed if we have updates to make
      if (Object.keys(cleanUpdates).length === 0) {
        return;
      }
      
      const logRef = doc(db, 'exerciseLogs', id);
      await updateDoc(logRef, cleanUpdates);
    } catch (error) {
      throw error;
    }
  }
  
  // Get existing logs for a workout (to show "Actual:" data)
  async getExerciseLogs(workoutId: string): Promise<ExerciseLog[]> {
    try {
      const q = query(
        collection(db, 'exerciseLogs'),
        where('workoutId', '==', workoutId)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          exerciseId: data.exerciseId,
          workoutId: data.workoutId,
          loggedAt: data.loggedAt.toDate(),
          actual: data.actual || {},
          comments: data.comments
        };
      });
    } catch (error) {
      throw error;
    }
  }
  
  // Get available workout dates for navigation
  async getWorkoutDates(): Promise<Date[]> {
    try {
      const q = query(collection(db, 'workouts'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs
        .map(doc => doc.data().date.toDate())
        .sort((a, b) => a.getTime() - b.getTime());
    } catch (error) {
      throw error;
    }
  }
  
  // Import workouts from CSV
  async importWorkoutFromCSV(csvData: CSVRow[]): Promise<void> {
    try {
      // Group by date and workout name
      const workoutsByDateAndName: Record<string, {
        workoutName: string;
        date: Date;
        exercises: Array<Omit<Exercise, 'workoutId'>>;
      }> = {};
      
      csvData.forEach(row => {
        const dateStr = row.date;
        const key = `${dateStr}-${row.workoutName}`;
        
        if (!workoutsByDateAndName[key]) {
          // Parse date string and create Date at local midnight to avoid timezone issues
          let date: Date;
          if (dateStr.includes('/')) {
            // Handle MM/DD/YYYY format
            const [month, day, year] = dateStr.split('/').map(Number);
            date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
          } else {
            // Handle YYYY-MM-DD format
            const [year, month, day] = dateStr.split('-').map(Number);
            date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
          }
          
          workoutsByDateAndName[key] = {
            workoutName: row.workoutName,
            date: date,
            exercises: []
          };
        }
        
        // Parse and structure the planned data from the new CSV format
        const setColumns = [
          row['Set 1 Count'],
          row['Set 2 Count'], 
          row['Set 3 Count'],
          row['Set 4 Count'],
          row['Set 5 Count']
        ];
        
        // Filter out empty sets and convert to numbers
        const sets = setColumns
          .filter(count => count && count.trim() !== '')
          .map(count => Number(count!.trim()));
        
        // Determine unit from Exercise Measure column
        const measureLower = row['Exercise Measure'].toLowerCase();
        let unit: 'reps' | 'seconds' | 'minutes';
        if (measureLower.includes('second')) {
          unit = 'seconds';
        } else if (measureLower.includes('minute')) {
          unit = 'minutes';
        } else {
          unit = 'reps';
        }
        
        // Parse weight information
        let weight: { amount: number; unit: 'lb' | 'kg' | 'bodyweight' } | undefined = undefined;
        if (row.Weight && row.Weight.trim() !== '') {
          const weightAmount = Number(row.Weight);
          const weightUnit = row['Weight Unit']?.toLowerCase() || 'lb';
          
          if (weightUnit.includes('lb')) {
            weight = { amount: weightAmount, unit: 'lb' };
          } else if (weightUnit.includes('kg')) {
            weight = { amount: weightAmount, unit: 'kg' };
          }
        } else if (row.Equipment && row.Equipment.toLowerCase().includes('bodyweight')) {
          weight = { amount: 0, unit: 'bodyweight' };
        } else if (!row.Weight || row.Weight.trim() === '') {
          weight = { amount: 0, unit: 'bodyweight' };
        }
        
        const planned: {
          sets: number[];
          unit: 'reps' | 'seconds' | 'minutes';
          weight?: { amount: number; unit: 'lb' | 'kg' | 'bodyweight' };
          equipment?: string;
        } = {
          sets,
          unit
        };
        
        // Only add weight if it exists
        if (weight) {
          planned.weight = weight;
        }
        
        // Only add equipment if it exists and is not empty
        if (row.Equipment && row.Equipment.trim() !== '') {
          planned.equipment = row.Equipment.trim();
        }
        
        // Generate a temporary ID for the exercise
        const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        workoutsByDateAndName[key].exercises.push({
          name: row.exerciseName,
          description: row.description || '',
          planned: planned,
          order: row.order,
          id: tempId
        });
      });
      
      // Create workouts in Firestore
      for (const key in workoutsByDateAndName) {
        const workout = workoutsByDateAndName[key];
        
        // Ensure exercises are sorted by order
        workout.exercises.sort((a, b) => a.order - b.order);
        
        // Add IDs to exercises if they don't have them
        const exercisesWithIds = workout.exercises.map((exercise, index) => ({
          ...exercise,
          id: exercise.id || `exercise-${index}`
        }));
        
        await addDoc(collection(db, 'workouts'), {
          name: workout.workoutName,
          date: Timestamp.fromDate(workout.date),
          exercises: exercisesWithIds
        });
      }
    } catch (error) {
      throw error;
    }
  }
}

// Service instance
export const exerciseService = new ExerciseService();
