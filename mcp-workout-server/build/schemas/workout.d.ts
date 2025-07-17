import { z } from 'zod';
export declare const WeightSchema: z.ZodObject<{
    amount: z.ZodNumber;
    unit: z.ZodEnum<["lb", "kg", "bodyweight"]>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    unit: "lb" | "kg" | "bodyweight";
}, {
    amount: number;
    unit: "lb" | "kg" | "bodyweight";
}>;
export declare const PlannedExerciseSchema: z.ZodObject<{
    sets: z.ZodArray<z.ZodNumber, "many">;
    unit: z.ZodEnum<["reps", "seconds", "minutes"]>;
    weight: z.ZodOptional<z.ZodObject<{
        amount: z.ZodNumber;
        unit: z.ZodEnum<["lb", "kg", "bodyweight"]>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        unit: "lb" | "kg" | "bodyweight";
    }, {
        amount: number;
        unit: "lb" | "kg" | "bodyweight";
    }>>;
    equipment: z.ZodOptional<z.ZodString>;
    isUnilateral: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    unit: "reps" | "seconds" | "minutes";
    sets: number[];
    weight?: {
        amount: number;
        unit: "lb" | "kg" | "bodyweight";
    } | undefined;
    equipment?: string | undefined;
    isUnilateral?: boolean | undefined;
}, {
    unit: "reps" | "seconds" | "minutes";
    sets: number[];
    weight?: {
        amount: number;
        unit: "lb" | "kg" | "bodyweight";
    } | undefined;
    equipment?: string | undefined;
    isUnilateral?: boolean | undefined;
}>;
export declare const ExerciseSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    planned: z.ZodObject<{
        sets: z.ZodArray<z.ZodNumber, "many">;
        unit: z.ZodEnum<["reps", "seconds", "minutes"]>;
        weight: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            unit: z.ZodEnum<["lb", "kg", "bodyweight"]>;
        }, "strip", z.ZodTypeAny, {
            amount: number;
            unit: "lb" | "kg" | "bodyweight";
        }, {
            amount: number;
            unit: "lb" | "kg" | "bodyweight";
        }>>;
        equipment: z.ZodOptional<z.ZodString>;
        isUnilateral: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        unit: "reps" | "seconds" | "minutes";
        sets: number[];
        weight?: {
            amount: number;
            unit: "lb" | "kg" | "bodyweight";
        } | undefined;
        equipment?: string | undefined;
        isUnilateral?: boolean | undefined;
    }, {
        unit: "reps" | "seconds" | "minutes";
        sets: number[];
        weight?: {
            amount: number;
            unit: "lb" | "kg" | "bodyweight";
        } | undefined;
        equipment?: string | undefined;
        isUnilateral?: boolean | undefined;
    }>;
    order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export declare const CreateWorkoutSchema: z.ZodObject<{
    name: z.ZodString;
    date: z.ZodString;
    exercises: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        planned: z.ZodObject<{
            sets: z.ZodArray<z.ZodNumber, "many">;
            unit: z.ZodEnum<["reps", "seconds", "minutes"]>;
            weight: z.ZodOptional<z.ZodObject<{
                amount: z.ZodNumber;
                unit: z.ZodEnum<["lb", "kg", "bodyweight"]>;
            }, "strip", z.ZodTypeAny, {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            }, {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            }>>;
            equipment: z.ZodOptional<z.ZodString>;
            isUnilateral: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            unit: "reps" | "seconds" | "minutes";
            sets: number[];
            weight?: {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            } | undefined;
            equipment?: string | undefined;
            isUnilateral?: boolean | undefined;
        }, {
            unit: "reps" | "seconds" | "minutes";
            sets: number[];
            weight?: {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            } | undefined;
            equipment?: string | undefined;
            isUnilateral?: boolean | undefined;
        }>;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
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
    }, {
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
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date: string;
    name: string;
    exercises: {
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
}, {
    date: string;
    name: string;
    exercises: {
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
}>;
export declare const WorkoutSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    date: z.ZodDate;
    exercises: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        planned: z.ZodObject<{
            sets: z.ZodArray<z.ZodNumber, "many">;
            unit: z.ZodEnum<["reps", "seconds", "minutes"]>;
            weight: z.ZodOptional<z.ZodObject<{
                amount: z.ZodNumber;
                unit: z.ZodEnum<["lb", "kg", "bodyweight"]>;
            }, "strip", z.ZodTypeAny, {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            }, {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            }>>;
            equipment: z.ZodOptional<z.ZodString>;
            isUnilateral: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            unit: "reps" | "seconds" | "minutes";
            sets: number[];
            weight?: {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            } | undefined;
            equipment?: string | undefined;
            isUnilateral?: boolean | undefined;
        }, {
            unit: "reps" | "seconds" | "minutes";
            sets: number[];
            weight?: {
                amount: number;
                unit: "lb" | "kg" | "bodyweight";
            } | undefined;
            equipment?: string | undefined;
            isUnilateral?: boolean | undefined;
        }>;
        order: z.ZodNumber;
    } & {
        id: z.ZodString;
        workoutId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
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
        id: string;
        workoutId: string;
    }, {
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
        id: string;
        workoutId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date: Date;
    name: string;
    exercises: {
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
        id: string;
        workoutId: string;
    }[];
    id: string;
}, {
    date: Date;
    name: string;
    exercises: {
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
        id: string;
        workoutId: string;
    }[];
    id: string;
}>;
export declare const ValidationResultSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    errors: z.ZodArray<z.ZodString, "many">;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    errors: string[];
    warnings?: string[] | undefined;
}, {
    valid: boolean;
    errors: string[];
    warnings?: string[] | undefined;
}>;
export type Weight = z.infer<typeof WeightSchema>;
export type PlannedExercise = z.infer<typeof PlannedExerciseSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
