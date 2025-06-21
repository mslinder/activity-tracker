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
    setsRepsDuration: string;
    weight: string;
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
  duration?: string;
  weight?: string;
}

export interface ExerciseLog {
  id?: string;
  exerciseId: string;
  workoutId: string;
  loggedAt: Date;
  actual: {
    sets: SetEntry[];
    // Keep legacy field for backward compatibility
    setsRepsDuration?: string;
    weight?: string;
  };
  comments?: string;
}

export interface CSVRow {
  workoutName: string;
  date: string;
  exerciseName: string;
  description: string;
  plannedSetsRepsDuration: string;
  plannedWeight: string;
  order: number;
}

// Service class
export class ExerciseService {
  // Get workout for specific date
  async getWorkoutByDate(date: Date): Promise<Workout | null> {
    try {
      // Format the date as YYYY-MM-DD for string comparison
      const dateString = date.toISOString().split('T')[0];
      console.log('Looking for workout on date:', dateString);
      
      // Get all workouts
      const workoutsSnapshot = await getDocs(collection(db, 'workouts'));
      
      console.log(`Found ${workoutsSnapshot.size} total workouts in database`);
      
      if (workoutsSnapshot.empty) {
        console.log('No workouts found in database');
        return null;
      }
      
      // Find workout with matching date
      let matchingWorkout = null;
      
      workoutsSnapshot.forEach(doc => {
        const workoutData = doc.data();
        console.log('Workout data:', workoutData);
        
        // Check if date field exists and is a valid Timestamp
        if (!workoutData.date || !workoutData.date.toDate) {
          console.error('Invalid date format in workout:', doc.id, workoutData.date);
          return;
        }
        
        const workoutDate = workoutData.date.toDate();
        const workoutDateString = workoutDate.toISOString().split('T')[0];
        
        console.log(`Comparing workout ${doc.id}: ${workoutData.name} on ${workoutDateString} with requested date ${dateString}`);
        
        if (workoutDateString === dateString) {
          console.log('Found matching workout:', doc.id);
          
          // Check if exercises array exists
          if (!workoutData.exercises || !Array.isArray(workoutData.exercises)) {
            console.error('No exercises array in workout:', doc.id);
            matchingWorkout = {
              id: doc.id,
              name: workoutData.name,
              date: workoutDate,
              exercises: []
            };
            return;
          }
          
          console.log(`Workout has ${workoutData.exercises.length} exercises`);
          
          matchingWorkout = {
            id: doc.id,
            name: workoutData.name,
            date: workoutDate,
            exercises: workoutData.exercises.map((exercise: any, index: number) => {
              console.log('Processing exercise:', exercise);
              return {
                ...exercise,
                id: exercise.id || `${doc.id}-${exercise.order || index}`
              };
            })
          };
        }
      });
      
      console.log('Final matching workout:', matchingWorkout);
      return matchingWorkout;
    } catch (error) {
      console.error('Error getting workout by date:', error);
      throw error;
    }
  }
  
  // Log what was actually done
  async logExercise(log: Omit<ExerciseLog, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'exerciseLogs'), {
        ...log,
        loggedAt: Timestamp.fromDate(log.loggedAt || new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging exercise:', error);
      throw error;
    }
  }
  
  async updateExerciseLog(id: string, updates: Partial<ExerciseLog>): Promise<void> {
    try {
      const logRef = doc(db, 'exerciseLogs', id);
      await updateDoc(logRef, {
        ...updates,
        loggedAt: updates.loggedAt ? Timestamp.fromDate(updates.loggedAt) : undefined
      });
    } catch (error) {
      console.error('Error updating exercise log:', error);
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
      console.error('Error getting exercise logs:', error);
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
      console.error('Error getting workout dates:', error);
      throw error;
    }
  }
  
  // Import workouts from CSV
  async importWorkoutFromCSV(csvData: CSVRow[]): Promise<void> {
    try {
      console.log(`Starting import of ${csvData.length} CSV rows`);
      
      // Group by date and workout name
      const workoutsByDateAndName: Record<string, {
        workoutName: string;
        date: Date;
        exercises: Array<Omit<Exercise, 'workoutId'>>;
      }> = {};
      
      csvData.forEach(row => {
        const dateStr = row.date;
        const key = `${dateStr}-${row.workoutName}`;
        
        console.log(`Processing row for workout: ${row.workoutName}, date: ${dateStr}, exercise: ${row.exerciseName}`);
        
        if (!workoutsByDateAndName[key]) {
          console.log(`Creating new workout group for ${key}`);
          workoutsByDateAndName[key] = {
            workoutName: row.workoutName,
            date: new Date(dateStr),
            exercises: []
          };
        }
        
        // Ensure the planned data is properly structured
        const planned = {
          setsRepsDuration: row.plannedSetsRepsDuration || '',
          weight: row.plannedWeight || ''
        };
        
        console.log(`Adding exercise: ${row.exerciseName} with planned data:`, planned);
        
        // Generate a temporary ID for the exercise
        const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        workoutsByDateAndName[key].exercises.push({
          name: row.exerciseName,
          description: row.description || '',
          planned: planned,
          order: row.order,
          id: tempId // Add a temporary ID that will be replaced when saved
        });
      });
      
      console.log(`Grouped into ${Object.keys(workoutsByDateAndName).length} workouts`);
      
      // Create workouts in Firestore
      for (const key in workoutsByDateAndName) {
        const workout = workoutsByDateAndName[key];
        
        console.log(`Saving workout: ${workout.workoutName} with ${workout.exercises.length} exercises`);
        
        // Ensure exercises are sorted by order
        workout.exercises.sort((a, b) => a.order - b.order);
        
        // Add IDs to exercises if they don't have them
        const exercisesWithIds = workout.exercises.map((exercise, index) => ({
          ...exercise,
          id: exercise.id || `exercise-${index}`
        }));
        
        console.log('First exercise in workout:', exercisesWithIds[0]);
        
        try {
          const docRef = await addDoc(collection(db, 'workouts'), {
            name: workout.workoutName,
            date: Timestamp.fromDate(workout.date),
            exercises: exercisesWithIds
          });
          console.log(`Successfully added workout with ID: ${docRef.id}`);
        } catch (e) {
          console.error('Error adding workout document:', e);
          throw e;
        }
      }
      
      console.log('CSV import completed successfully');
    } catch (error) {
      console.error('Error importing workouts from CSV:', error);
      throw error;
    }
  }
}

// Service instance
export const exerciseService = new ExerciseService();
