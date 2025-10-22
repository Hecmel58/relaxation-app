import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCmJxGmJDfKKl6wKKJuKlwKUrzKs_MSnMI",
  authDomain: "fidbal-app.firebaseapp.com",
  projectId: "fidbal-app",
  storageBucket: "fidbal-app.firebasestorage.app",
  messagingSenderId: "595518534476",
  appId: "1:595518534476:web:33f8b9bb8e5a5d8f8c6a75",
  measurementId: "G-C8F4SL35R1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);