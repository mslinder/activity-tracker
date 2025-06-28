export declare function getWorkout(identifier: string): Promise<{
    success: boolean;
    workout: {
        id: string;
        name: any;
        date: any;
        exercises: any;
    };
}>;
