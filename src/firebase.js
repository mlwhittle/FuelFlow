// Firebase Configuration for FuelFlow
// This is a brand new Firebase project — NOT reusing any existing projects
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAcj0bJpjCw9R9vXHxlOSVZP4205NvhIaU",
    authDomain: "fuelflow-app-579b9.firebaseapp.com",
    projectId: "fuelflow-app-579b9",
    storageBucket: "fuelflow-app-579b9.firebasestorage.app",
    messagingSenderId: "504272818390",
    appId: "1:504272818390:web:b574e44987db6cc6163977",
    measurementId: "G-8L8M08NNBK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
