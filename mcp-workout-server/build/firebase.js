import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
    // In production, use service account key
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        app = initializeApp({
            credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
            projectId: 'servit-d5f25'
        });
    }
    else {
        // For development, use the same config as the client app
        app = initializeApp({
            projectId: 'servit-d5f25'
        });
    }
}
else {
    app = getApps()[0];
}
export const db = getFirestore(app);
export { app };
