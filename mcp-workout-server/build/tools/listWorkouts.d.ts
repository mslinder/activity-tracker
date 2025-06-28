export declare function listWorkouts(startDate?: string, endDate?: string): Promise<{
    success: boolean;
    workouts: {
        id: string;
        name: any;
        date: any;
        exerciseCount: any;
        exercises: any;
    }[];
    count: number;
}>;
