import { db } from '../firebase.js';
export async function deleteWorkout(identifier) {
    try {
        let workoutRef;
        let workoutData;
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
            workoutData = { id: doc.id, ...doc.data() };
        }
        else {
            // Identifier is a workout ID
            workoutRef = db.collection('workouts').doc(identifier);
            const doc = await workoutRef.get();
            if (!doc.exists) {
                throw new Error(`Workout with ID ${identifier} not found`);
            }
            workoutData = { id: doc.id, ...doc.data() };
        }
        // Also delete any associated exercise logs
        const exerciseLogs = await db.collection('exerciseLogs')
            .where('workoutId', '==', workoutData.id)
            .get();
        // Delete exercise logs in batch
        const batch = db.batch();
        exerciseLogs.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        // Delete the workout
        batch.delete(workoutRef);
        // Commit the batch
        await batch.commit();
        return {
            success: true,
            deletedWorkout: {
                id: workoutData.id,
                name: workoutData.name,
                date: workoutData.date
            },
            deletedExerciseLogs: exerciseLogs.size,
            message: `Workout deleted successfully. Also removed ${exerciseLogs.size} associated exercise logs.`
        };
    }
    catch (error) {
        throw new Error(`Failed to delete workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
