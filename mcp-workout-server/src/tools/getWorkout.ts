import { db } from '../firebase.js';

export async function getWorkout(identifier: string) {
  try {
    let workout = null;

    // Check if identifier is a date (YYYY-MM-DD format)
    if (identifier.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = identifier.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);
      
      const snapshot = await db.collection('workouts')
        .where('date', '==', targetDate)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        workout = {
          id: doc.id,
          name: data.name,
          date: data.date.toDate().toISOString().split('T')[0],
          exercises: data.exercises || []
        };
      }
    } else {
      // Treat as workout ID
      const doc = await db.collection('workouts').doc(identifier).get();
      
      if (doc.exists) {
        const data = doc.data()!;
        workout = {
          id: doc.id,
          name: data.name,
          date: data.date.toDate().toISOString().split('T')[0],
          exercises: data.exercises || []
        };
      }
    }

    if (!workout) {
      throw new Error(`No workout found for identifier: ${identifier}`);
    }

    return {
      success: true,
      workout
    };

  } catch (error) {
    throw new Error(`Failed to get workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}