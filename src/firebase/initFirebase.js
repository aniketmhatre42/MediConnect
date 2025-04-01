import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getAuth, connectAuthEmulator } from "firebase/auth";

let app = null;
let database = null;
let auth = null;

/**
 * Safely initializes Firebase with better error handling
 * @param {Object} config - Firebase config object
 * @returns {Object} Firebase instances
 */
export const initializeFirebase = (config) => {
  console.log("🔄 Initializing Firebase...");
  
  try {
    // Validate config has required fields
    if (!config || !config.apiKey || !config.projectId || !config.databaseURL) {
      console.error("❌ Invalid Firebase config:", {
        hasConfig: !!config,
        hasApiKey: !!config?.apiKey,
        hasProjectId: !!config?.projectId,
        hasDatabaseURL: !!config?.databaseURL
      });
      throw new Error("Invalid Firebase configuration");
    }
    
    console.log("Firebase config validated:", {
      projectId: config.projectId,
      databaseURL: config.databaseURL
    });
    
    // Initialize app if not already done
    if (!app) {
      app = initializeApp(config);
      console.log("✅ Firebase app initialized");
    }
    
    // Initialize Realtime Database
    if (!database) {
      database = getDatabase(app);
      console.log("✅ Firebase Realtime Database initialized");
      console.log(`Database URL: ${config.databaseURL}`);
      
      // Check if we're in local development mode
      if (window.location.hostname === "localhost") {
        try {
          // Optionally connect to emulator
          // connectDatabaseEmulator(database, "localhost", 9000);
          // console.log("✅ Connected to Firebase Database emulator");
        } catch (emulatorErr) {
          console.warn("⚠️ Emulator connection failed:", emulatorErr.message);
        }
      }
    }
    
    // Initialize Auth
    if (!auth) {
      auth = getAuth(app);
      console.log("✅ Firebase Auth initialized");
      
      // Check if we're in local development mode
      if (window.location.hostname === "localhost") {
        try {
          // Optionally connect to emulator
          // connectAuthEmulator(auth, "http://localhost:9099");
          // console.log("✅ Connected to Firebase Auth emulator");
        } catch (emulatorErr) {
          console.warn("⚠️ Auth emulator connection failed:", emulatorErr.message);
        }
      }
    }
    
    console.log("🚀 Firebase initialization complete");
    
    return { app, database, auth };
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    throw error;
  }
};

/**
 * Checks if Firebase is properly initialized
 */
export const checkFirebaseStatus = () => {
  return {
    appInitialized: !!app,
    databaseInitialized: !!database,
    authInitialized: !!auth
  };
};
