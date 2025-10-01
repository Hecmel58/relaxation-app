import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMb-VLm0D4x7LJvLx1d0IvEbD4ZtcdCwY",
  authDomain: "fidbal-app.firebaseapp.com",
  projectId: "fidbal-app",
  storageBucket: "fidbal-app.firebasestorage.app",
  messagingSenderId: "141201052661",
  appId: "1:141201052661:web:c6999966c1cbf3a62546bc",
  measurementId: "G-9YS6QMLMSS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;