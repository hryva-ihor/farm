import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAUi8QeaHCjv5VH4iQFWz1oWY1ka-kA8k",
  authDomain: "farm-db-a2a08.firebaseapp.com",
  projectId: "farm-db-a2a08",
  storageBucket: "farm-db-a2a08.appspot.com",
  messagingSenderId: "948109422881",
  appId: "1:948109422881:web:c6c81cb2c1a5f9c0218e60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance for use in other parts of the application
export const db = getFirestore(app);
