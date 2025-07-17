import { db } from '../firebase.js';
import { CreateWorkout } from '../schemas/workout.js';
import { validateWorkout } from './validateWorkout.js';

// Helper function to detect unilateral exercises
function detectUnilateralExercise(exerciseName: string, description: string): boolean {
  const text = `${exerciseName} ${description}`.toLowerCase();
  
  // Keywords that indicate unilateral exercises
  const unilateralKeywords = [
    'single-arm',
    'single arm',
    'single-leg',
    'single leg',
    'one-arm',
    'one arm',
    'one-leg', 
    'one leg',
    'unilateral',
    'alternating',
    'each arm',
    'each leg',
    'per arm',
    'per leg',
    'each side',
    'per side'
  ];
  
  return unilateralKeywords.some(keyword => text.includes(keyword));
}

export interface UpdateWorkoutInput {
  identifier: string; // workout ID or date (YYYY-MM-DD)
  updates: Partial<CreateWorkout>; // partial updates to the workout
  replaceExercises?: boolean; // if true, completely replace exercises array; if false, merge/update
}

export async function updateWorkout(input: UpdateWorkoutInput) {
  const { identifier, updates, replaceExercises = false } = input;

  try {
    // Find the workout to update
    let workoutRef;
    let existingWorkout;

    // Check if identifier is a date (YYYY-MM-DD format) or workout ID
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(identifier)) {
      // Identifier is a date, find workout by date
      const [year, month, day] = identifier.split('-').map(Number);
      const workoutDate = new Date(year, month - 1, day);
      
      const workoutsQuery = await db.collection('workouts')
        .where('date', '==', workoutDate)
        .get();

      if (workoutsQuery.empty) {
        throw new Error(`No workout found for date ${identifier}`);
      }
      
      if (workoutsQuery.size > 1) {
        throw new Error(`Multiple workouts found for date ${identifier}. Use workout ID instead.`);
      }

      const doc = workoutsQuery.docs[0];
      workoutRef = doc.ref;
      existingWorkout = { id: doc.id, ...doc.data() } as any;
    } else {
      // Identifier is a workout ID
      workoutRef = db.collection('workouts').doc(identifier);
      const doc = await workoutRef.get();
      
      if (!doc.exists) {
        throw new Error(`Workout with ID ${identifier} not found`);
      }
      
      existingWorkout = { id: doc.id, ...doc.data() } as any;
    }

    // Prepare the updated workout data
    const updatedData: any = {};

    // Handle name update
    if (updates.name !== undefined) {
      updatedData.name = updates.name;
    }

    // Handle date update
    if (updates.date !== undefined) {
      const [year, month, day] = updates.date.split('-').map(Number);
      updatedData.date = new Date(year, month - 1, day);
      
      // Check if another workout already exists on the new date
      const existingOnNewDate = await db.collection('workouts')
        .where('date', '==', updatedData.date)
        .get();
      
      // Allow update if it's the same workout or no other workout exists on that date
      if (!existingOnNewDate.empty && existingOnNewDate.docs[0].id !== existingWorkout.id) {
        throw new Error(`A workout already exists for ${updates.date}`);
      }
    }

    // Handle exercises update
    if (updates.exercises !== undefined) {
      if (replaceExercises) {
        // Completely replace exercises
        const exercises = updates.exercises.map((exercise, index) => {
          // Auto-detect unilateral exercises if not explicitly set
          const planned = { ...exercise.planned };
          if (planned.isUnilateral === undefined) {
            const isUnilateral = detectUnilateralExercise(exercise.name, exercise.description);
            if (isUnilateral) {
              planned.isUnilateral = true;
            }
          }

          return {
            id: `${existingWorkout.id}_exercise_${index + 1}`,
            workoutId: existingWorkout.id,
            name: exercise.name,
            description: exercise.description,
            planned: planned,
            order: exercise.order
          };
        });
        updatedData.exercises = exercises;
      } else {
        // Merge/update exercises
        const existingExercises = existingWorkout.exercises || [];
        const updatedExercises = [...existingExercises];
        
        updates.exercises.forEach((updateExercise, index) => {
          // Auto-detect unilateral exercises if not explicitly set
          const planned = { ...updateExercise.planned };
          if (planned.isUnilateral === undefined) {
            const isUnilateral = detectUnilateralExercise(updateExercise.name, updateExercise.description);
            if (isUnilateral) {
              planned.isUnilateral = true;
            }
          }

          if (index < existingExercises.length) {
            // Update existing exercise
            updatedExercises[index] = {
              ...existingExercises[index],
              name: updateExercise.name,
              description: updateExercise.description,
              planned: planned,
              order: updateExercise.order
            };
          } else {
            // Add new exercise
            updatedExercises.push({
              id: `${existingWorkout.id}_exercise_${index + 1}`,
              workoutId: existingWorkout.id,
              name: updateExercise.name,
              description: updateExercise.description,
              planned: planned,
              order: updateExercise.order
            });
          }
        });
        
        updatedData.exercises = updatedExercises;
      }
    }

    // Validate the updated workout data if we have a complete workout
    if (Object.keys(updatedData).length > 0) {
      // Create a complete workout object for validation
      const completeWorkout = {
        name: updatedData.name || existingWorkout.name,
        date: updatedData.date ? 
          `${updatedData.date.getFullYear()}-${String(updatedData.date.getMonth() + 1).padStart(2, '0')}-${String(updatedData.date.getDate()).padStart(2, '0')}` :
          `${existingWorkout.date.getFullYear()}-${String(existingWorkout.date.getMonth() + 1).padStart(2, '0')}-${String(existingWorkout.date.getDate()).padStart(2, '0')}`,
        exercises: (updatedData.exercises || existingWorkout.exercises || []).map((ex: any) => ({
          name: ex.name,
          description: ex.description,
          planned: ex.planned,
          order: ex.order
        }))
      };

      const validation = validateWorkout(completeWorkout);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Update the workout in Firestore
    await workoutRef.update(updatedData);

    // Get the updated workout
    const updatedDoc = await workoutRef.get();
    const updatedWorkout = { id: updatedDoc.id, ...updatedDoc.data() };

    return {
      success: true,
      workout: updatedWorkout,
      message: 'Workout updated successfully'
    };

  } catch (error) {
    throw new Error(`Failed to update workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}