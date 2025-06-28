import { db } from '../firebase.js';
import { CreateWorkout } from '../schemas/workout.js';
import { validateWorkout } from './validateWorkout.js';

export async function createWorkout(workoutData: CreateWorkout) {
  // Validate the workout first
  const validation = validateWorkout(workoutData);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  try {
    // Convert date string to Date object using explicit local timezone construction
    const [year, month, day] = workoutData.date.split('-').map(Number);
    const workoutDate = new Date(year, month - 1, day);

    // Check if a workout already exists for this date
    const existingWorkouts = await db.collection('workouts')
      .where('date', '==', workoutDate)
      .get();

    if (!existingWorkouts.empty) {
      throw new Error(`A workout already exists for ${workoutData.date}`);
    }

    // Create the workout document
    const workoutRef = await db.collection('workouts').add({
      name: workoutData.name,
      date: workoutDate,
      exercises: [] // We'll add exercises separately with proper IDs
    });

    // Create exercises with proper IDs and workout reference
    const exercises = workoutData.exercises.map((exercise, index) => ({
      id: `${workoutRef.id}_exercise_${index + 1}`,
      workoutId: workoutRef.id,
      name: exercise.name,
      description: exercise.description,
      planned: exercise.planned,
      order: exercise.order
    }));

    // Update the workout with the exercises
    await workoutRef.update({
      exercises: exercises
    });

    // Return the created workout
    const createdWorkout = {
      id: workoutRef.id,
      name: workoutData.name,
      date: workoutDate,
      exercises: exercises
    };

    return {
      success: true,
      workout: createdWorkout,
      validation: validation.warnings ? { warnings: validation.warnings } : undefined
    };

  } catch (error) {
    throw new Error(`Failed to create workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}