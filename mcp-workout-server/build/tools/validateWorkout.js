import { CreateWorkoutSchema } from '../schemas/workout.js';
export function validateWorkout(workoutData) {
    const errors = [];
    const warnings = [];
    try {
        // Basic schema validation
        const result = CreateWorkoutSchema.safeParse(workoutData);
        if (!result.success) {
            result.error.errors.forEach(err => {
                errors.push(`${err.path.join('.')}: ${err.message}`);
            });
            return { valid: false, errors, warnings };
        }
        const workout = result.data;
        // Business logic validations
        // Check for duplicate exercise names
        const exerciseNames = workout.exercises.map(e => e.name.toLowerCase());
        const duplicates = exerciseNames.filter((name, index) => exerciseNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            warnings.push(`Duplicate exercise names found: ${[...new Set(duplicates)].join(', ')}`);
        }
        // Check exercise order sequence
        const orders = workout.exercises.map(e => e.order).sort((a, b) => a - b);
        for (let i = 0; i < orders.length - 1; i++) {
            if (orders[i] === orders[i + 1]) {
                errors.push(`Duplicate exercise order found: ${orders[i]}`);
            }
        }
        // Check for reasonable set counts
        workout.exercises.forEach((exercise, index) => {
            if (exercise.planned.sets.length === 0) {
                errors.push(`Exercise ${index + 1} (${exercise.name}) has no sets planned`);
            }
            if (exercise.planned.sets.length > 10) {
                warnings.push(`Exercise ${index + 1} (${exercise.name}) has unusually high number of sets (${exercise.planned.sets.length})`);
            }
            // Check for reasonable rep/time counts
            exercise.planned.sets.forEach((count, setIndex) => {
                if (exercise.planned.unit === 'reps' && count > 100) {
                    warnings.push(`Exercise ${index + 1} (${exercise.name}) set ${setIndex + 1} has unusually high reps (${count})`);
                }
                if (exercise.planned.unit === 'seconds' && count > 600) {
                    warnings.push(`Exercise ${index + 1} (${exercise.name}) set ${setIndex + 1} has unusually long duration (${count} seconds)`);
                }
            });
        });
        // Check date validity
        const workoutDate = new Date(workout.date);
        const today = new Date();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const oneWeekAgo = new Date(todayMidnight.getTime() - (7 * 24 * 60 * 60 * 1000));
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(today.getFullYear() + 1);
        if (workoutDate < oneWeekAgo) {
            warnings.push('Workout date is more than a week in the past');
        }
        if (workoutDate > oneYearFromNow) {
            warnings.push('Workout date is more than a year in the future');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    catch (error) {
        return {
            valid: false,
            errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
            warnings
        };
    }
}
