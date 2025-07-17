import { CreateWorkout } from '../schemas/workout.js';
export declare function createWorkout(workoutData: CreateWorkout): Promise<{
    success: boolean;
    workout: {
        id: string;
        name: string;
        date: Date;
        exercises: {
            id: string;
            workoutId: string;
            name: string;
            description: string;
            planned: {
                unit: "reps" | "seconds" | "minutes";
                sets: number[];
                weight?: {
                    amount: number;
                    unit: "lb" | "kg" | "bodyweight";
                } | undefined;
                equipment?: string | undefined;
                isUnilateral?: boolean | undefined;
            };
            order: number;
        }[];
    };
    validation: {
        warnings: string[];
    } | undefined;
}>;
