import { ref, set, get } from "firebase/database";
import { rtdb } from "../firebase/config";

/**
 * Direct test to validate Firebase Realtime Database connection
 * Without using any listeners that could cause TDZ errors
 */
export const testDatabaseConnection = async () => {
  console.group("🔍 Firebase Connection Test");
  console.log("Starting Firebase connection test...");
  
  // Step 1: Verify rtdb is initialized
  if (!rtdb) {
    console.error("❌ Firebase Realtime Database is not initialized!");
    console.groupEnd();
    return { success: false, error: "Database not initialized" };
  }
  
  console.log("✓ Database reference exists");
  
  // REMOVED: Connection status check that used listeners and unsubscribe
  // Instead use a simple write and read test
  
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      message: "Firebase connection test",
      random: Math.random()
    };
    
    const testPath = "debug/connection_test";
    console.log(`Writing test data to ${testPath}...`);
    
    // Write data
    await set(ref(rtdb, testPath), testData);
    console.log("✅ Test write successful!");
    
    // Read data back
    console.log("Reading test data...");
    const snapshot = await get(ref(rtdb, testPath));
    
    if (!snapshot.exists()) {
      console.error("❌ Test data not found after writing!");
      console.groupEnd();
      return { success: false, error: "Data not found after writing" };
    }
    
    const readData = snapshot.val();
    console.log("✅ Read successful:", readData);
    
    // Validate that what we wrote matches what we read
    const isValid = readData.timestamp === testData.timestamp && 
                    readData.random === testData.random;
    
    if (!isValid) {
      console.error("❌ Read data doesn't match written data!");
      console.groupEnd();
      return { success: false, error: "Data mismatch" };
    }
    
    console.log("🎉 Firebase connection test passed successfully!");
    console.groupEnd();
    return { success: true, data: readData };
    
  } catch (error) {
    console.error("❌ Firebase test failed:", error);
    console.groupEnd();
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      stack: error.stack
    };
  }
};

// Make function available in global window for console debugging
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testDatabaseConnection;
  console.log("🔍 Firebase test utility loaded! Run window.testFirebaseConnection() in console");
}

export default testDatabaseConnection;
