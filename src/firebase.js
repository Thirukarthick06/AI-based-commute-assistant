
// Import necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // For Realtime Database

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkhIi__k-yRpZMasTqsAe0XEooE5g91eo",
  authDomain: "ai-commute-assisstant.firebaseapp.com",
  databaseURL: "https://ai-commute-assisstant-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ai-commute-assisstant",
  storageBucket: "ai-commute-assisstant.firebasestorage.app",
  messagingSenderId: "1019922558684",
  appId: "1:1019922558684:web:5b93e8e19b28b1a58ece19",
  measurementId: "G-E05LB0Z497"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    try { getAnalytics(app) } catch {}
  }).catch(() => {})
}

export { db };
