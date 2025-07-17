export declare function deleteWorkout(identifier: string): Promise<{
    success: boolean;
    deletedWorkout: {
        id: any;
        name: any;
        date: any;
    };
    deletedExerciseLogs: number;
    message: string;
}>;
