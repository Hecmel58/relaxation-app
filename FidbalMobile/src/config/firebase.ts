// DOSYANIN TAMAMI AŞAĞIDAKİ GİBİ OLACAK:
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Production'da environment variables kullan, development'ta direkt değerler
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCmJxGmJDfKKl6wKKJuKlwKUrzKs_MSnMI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "fidbal-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "fidbal-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "fidbal-app.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "595518534476",
  appId: process.env.FIREBASE_APP_ID || "1:595518534476:web:33f8b9bb8e5a5d8f8c6a75",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-C8F4SL35R1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);