import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

// Replace this with YOUR config from Firebase console
const firebaseConfig = {
    apiKey: "AIzaSyCwdW9W4I8nr0MvSovIFnobjGTg56MY-dw",
    authDomain: "servit-d5f25.firebaseapp.com",
    projectId: "servit-d5f25",
    storageBucket: "servit-d5f25.firebasestorage.app",
    messagingSenderId: "774920639960",
    appId: "1:774920639960:web:b1b0f2eeca3ca25dfd0ead"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Activity types
export interface BaseActivity {
  id?: string;
  type: string;
  timestamp: Date;
  createdAt: Date;
}

export interface CoffeeActivity extends BaseActivity {
  type: 'coffee';
  data: {
    coffeeType: 'Espresso' | 'Cold Brew' | 'Pour Over';
    amount: number;
  };
}

export interface AnxietyActivity extends BaseActivity {
  type: 'anxiety';
  data: {
    level: number;
  };
}

export interface ExerciseActivity extends BaseActivity {
  type: 'exercise';
  data: {
    name: string;
    completed: boolean;
  };
}

export type Activity = CoffeeActivity | AnxietyActivity | ExerciseActivity;

// Add activity to Firestore
export async function addActivity(activity: Omit<Activity, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activity,
      timestamp: Timestamp.fromDate(activity.timestamp),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
}

// Get today's activities
export async function getTodaysActivities(): Promise<Activity[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
      collection(db, 'activities'),
      where('timestamp', '>=', Timestamp.fromDate(today)),
      where('timestamp', '<', Timestamp.fromDate(tomorrow)),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
      createdAt: doc.data().createdAt.toDate()
    } as Activity));
  } catch (error) {
    console.error('Error getting activities:', error);
    throw error;
  }
}