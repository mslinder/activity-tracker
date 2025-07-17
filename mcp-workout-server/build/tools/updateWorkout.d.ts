import { CreateWorkout } from '../schemas/workout.js';
export interface UpdateWorkoutInput {
    identifier: string;
    updates: Partial<CreateWorkout>;
    replaceExercises?: boolean;
}
export declare function updateWorkout(input: UpdateWorkoutInput): Promise<{
    success: boolean;
    workout: {
        id: string;
    };
    message: string;
}>;
