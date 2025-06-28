import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

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
export const auth = getAuth(app);

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
    intensity: number;  // 1-5 scale
    thought?: string;   // Optional anxious thought
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

// Add anxiety thought
export async function addAnxietyThought(
  intensity: number,
  thought?: string,
  timestamp: Date = new Date()
): Promise<string> {
  return addActivity({
    type: 'anxiety',
    timestamp,
    data: {
      intensity,
      thought
    }
  });
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

// Delete an activity
export async function deleteActivity(activityId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'activities', activityId));
    console.log('Activity deleted successfully');
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
}

// Update an activity
export async function updateActivity(activityId: string, updates: Partial<Activity>): Promise<void> {
  try {
    const activityRef = doc(db, 'activities', activityId);
    
    // Convert Date objects to Timestamps for Firebase
    const firebaseUpdates: any = { ...updates };
    if (firebaseUpdates.timestamp) {
      firebaseUpdates.timestamp = Timestamp.fromDate(firebaseUpdates.timestamp);
    }
    if (firebaseUpdates.createdAt) {
      firebaseUpdates.createdAt = Timestamp.fromDate(firebaseUpdates.createdAt);
    }
    
    await updateDoc(activityRef, firebaseUpdates);
    console.log('Activity updated successfully');
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
}

// Get all activities (not just today's) for admin management
export async function getAllActivities(): Promise<Activity[]> {
  try {
    const q = query(
      collection(db, 'activities'),
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
    console.error('Error getting all activities:', error);
    throw error;
  }
}

// Authentication functions
export async function signInUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}