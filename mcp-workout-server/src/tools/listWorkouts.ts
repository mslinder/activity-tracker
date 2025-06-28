import { db } from '../firebase.js';

export async function listWorkouts(startDate?: string, endDate?: string) {
  try {
    let queryRef = db.collection('workouts');

    // Add date filters if provided
    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      queryRef = queryRef.where('date', '>=', start) as any;
    }

    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      const end = new Date(year, month - 1, day + 1); // Include the end date
      queryRef = queryRef.where('date', '<', end) as any;
    }

    // Order by date (most recent first)
    queryRef = queryRef.orderBy('date', 'desc') as any;

    const snapshot = await queryRef.get();
    
    const workouts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        date: data.date.toDate().toISOString().split('T')[0], // Convert to YYYY-MM-DD
        exerciseCount: data.exercises ? data.exercises.length : 0,
        exercises: data.exercises ? data.exercises.map((ex: any) => ({
          name: ex.name,
          description: ex.description,
          order: ex.order
        })) : []
      };
    });

    return {
      success: true,
      workouts,
      count: workouts.length
    };

  } catch (error) {
    throw new Error(`Failed to list workouts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}