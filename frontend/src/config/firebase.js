import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmJxGmJDfKKl6wKKJuKlwKUrzKs_MSnMI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fidbal-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fidbal-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fidbal-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "595518534476",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:595518534476:web:33f8b9bb8e5a5d8f8c6a75",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C8F4SL35R1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;