import { z } from 'zod';
// Weight schema
export const WeightSchema = z.object({
    amount: z.number().positive(),
    unit: z.enum(['lb', 'kg', 'bodyweight'])
});
// Exercise planned data schema
export const PlannedExerciseSchema = z.object({
    sets: z.array(z.number().positive()),
    unit: z.enum(['reps', 'seconds', 'minutes']),
    weight: WeightSchema.optional(),
    equipment: z.string().optional(),
    isUnilateral: z.boolean().optional() // Flag for exercises that need left/right tracking
});
// Exercise schema
export const ExerciseSchema = z.object({
    name: z.string().min(1, 'Exercise name is required'),
    description: z.string().min(1, 'Exercise description is required'),
    planned: PlannedExerciseSchema,
    order: z.number().int().positive()
});
// Workout creation schema (for input)
export const CreateWorkoutSchema = z.object({
    name: z.string().min(1, 'Workout name is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    exercises: z.array(ExerciseSchema).min(1, 'At least one exercise is required')
});
// Workout response schema (with IDs)
export const WorkoutSchema = z.object({
    id: z.string(),
    name: z.string(),
    date: z.date(),
    exercises: z.array(ExerciseSchema.extend({
        id: z.string(),
        workoutId: z.string()
    }))
});
// Validation result schema
export const ValidationResultSchema = z.object({
    valid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()).optional()
});
