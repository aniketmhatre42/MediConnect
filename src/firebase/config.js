// Simplify Firebase initialization to prevent listener issues

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVMRkS8_vRfgb41wOlxzieECZdgr1IRRk",
  authDomain: "mediconnect-f6040.firebaseapp.com",
  projectId: "mediconnect-f6040",
  storageBucket: "mediconnect-f6040.firebasestorage.app",
  messagingSenderId: "967220854368",
  appId: "1:967220854368:web:6b7a4438b20aba8caccd05",
  measurementId: "G-85XEWLEHXS",
  databaseURL: "https://mediconnect-f6040-default-rtdb.firebaseio.com"
};

// Initialize Firebase services - with safety checks
let app;
let auth;
let db;
let rtdb;
let storage;

try {
  // Only initialize Firebase if not already initialized
  if (!app) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  rtdb = getDatabase(app);
  storage = getStorage(app);
  
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { app, auth, db, rtdb, storage };