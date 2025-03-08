import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// 🔥 Replace with your own Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCI0l-zVYCcfKHsnKl1UHYPdb3u50HJJ2c",
  authDomain: "bremen-the-devil.firebaseapp.com",
  databaseURL:
    "https://bremen-the-devil-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bremen-the-devil",
  storageBucket: "bremen-the-devil.firebasestorage.app",
  messagingSenderId: "485914111212",
  appId: "1:485914111212:web:0e6f5c67a1a682806e49c9",
  measurementId: "G-Y0SQ5E1K2P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database
export const database = getDatabase(app);
