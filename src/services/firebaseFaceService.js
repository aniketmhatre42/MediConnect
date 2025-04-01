import { ref, set, get, remove, serverTimestamp } from "firebase/database";
import { rtdb } from "../firebase/config";

// Reference to faces in Firebase Realtime Database
const FACES_REF = "faces";
const DEBUG_REF = "debug";

/**
 * Save face descriptor to Firebase Realtime Database using username as key
 * @param {string} userId - User ID (will be stored as additional data)
 * @param {string} username - Username to use as primary identifier 
 * @param {Float32Array} descriptor - Face descriptor data
 * @returns {Promise<boolean>} Success status
 */
export const saveFaceToFirebase = async (userId, username, descriptor) => {
  console.log(`Starting Firebase save process for user ${username} (ID: ${userId})...`);
  
  // Validate inputs
  if (!username || !descriptor) {
    console.error("Missing required parameters for saving face data");
    return false;
  }
  
  // Sanitize username to create a valid Firebase key
  const safeUsername = username.replace(/[.#$/[\]]/g, '_');
  
  // Validate Firebase connection
  if (!rtdb) {
    console.error("Firebase Realtime Database not initialized");
    return false;
  }
  
  try {
    console.log(`RTDB URL: ${rtdb.app.options.databaseURL}`);
    
    // First run a basic write test
    console.log("Running connectivity test...");
    const testRef = ref(rtdb, `${DEBUG_REF}/connectivity_test`);
    await set(testRef, {
      timestamp: new Date().toISOString(),
      client: navigator.userAgent,
      success: true
    });
    console.log("✅ Test write successful");
    
    // Convert descriptor to array
    console.log("Preparing descriptor data...");
    const descriptorArray = Array.from(descriptor);
    
    // Define path and create ref - using username as the key
    const path = `${FACES_REF}/${safeUsername}`;
    console.log(`Writing to path: ${path}`);
    
    // Write metadata first
    await set(ref(rtdb, `${path}/metadata`), {
      userId: userId, // Store userId as a reference
      username: username,
      descriptorLength: descriptorArray.length,
      browser: navigator.userAgent.split(' ')[0],
      userAgent: navigator.userAgent,
      descriptorSample: descriptorArray.slice(0, 3) // Store sample of first 3 values
    });
    console.log("✅ Metadata written");
    
    // Then write descriptor in batches of 20
    const BATCH_SIZE = 20;
    for (let i = 0; i < descriptorArray.length; i += BATCH_SIZE) {
      const batch = descriptorArray.slice(i, i + BATCH_SIZE);
      await set(ref(rtdb, `${path}/descriptor_part_${i/BATCH_SIZE}`), batch);
    }
    
    // Finally write the basic info
    await set(ref(rtdb, `${path}/info`), {
      userId,
      username,
      timestamp: new Date().toISOString(),
      parts: Math.ceil(descriptorArray.length / BATCH_SIZE)
    });
    
    console.log("✅ All data written successfully");
    
    // Verify data was written
    const snapshot = await get(ref(rtdb, `${path}/info`));
    if (snapshot.exists()) {
      console.log("✅ Verification successful");
      return true;
    } else {
      console.error("❌ Verification failed - data not found after write");
      return false;
    }
  } catch (error) {
    console.error("❌ Error saving face data to Firebase:", error);
    return false;
  }
};

/**
 * Get face descriptor from Firebase by username
 * @param {string} username - Username
 * @returns {Promise<Float32Array|null>} Face descriptor or null if not found
 */
export const getFaceFromFirebase = async (username) => {
  try {
    if (!username) {
      console.error("Username is required to get face data");
      return null;
    }
    
    // Sanitize username for Firebase
    const safeUsername = username.replace(/[.#$/[\]]/g, '_');
    
    // Check if we have the full descriptor in one piece
    const fullPath = `${FACES_REF}/${safeUsername}`;
    const fullSnapshot = await get(ref(rtdb, fullPath));
    
    if (!fullSnapshot.exists()) {
      console.log(`No data found for username ${username}`);
      return null;
    }
    
    const data = fullSnapshot.val();
    
    // Check if we have a simple descriptor array
    if (data && data.descriptor) {
      console.log(`Single-part descriptor found for ${username}`);
      return new Float32Array(data.descriptor);
    }
    
    // Check if we have multi-part descriptor
    if (data && data.info && data.info.parts) {
      console.log(`Multi-part descriptor found for ${username} (${data.info.parts} parts)`);
      
      // Assemble descriptor from parts
      const descriptorParts = [];
      for (let i = 0; i < data.info.parts; i++) {
        const partKey = `descriptor_part_${i}`;
        if (data[partKey]) {
          descriptorParts.push(...data[partKey]);
        }
      }
      
      if (descriptorParts.length > 0) {
        return new Float32Array(descriptorParts);
      }
    }
    
    console.log(`Data found for ${username} but no valid descriptor`);
    return null;
  } catch (error) {
    console.error("Error getting face from Firebase:", error);
    return null;
  }
};

/**
 * Remove face descriptor from Firebase by username
 * @param {string} username - Username
 * @returns {Promise<boolean>} Success status
 */
export const removeFaceFromFirebase = async (username) => {
  try {
    if (!username) {
      console.error("Username is required to remove face data");
      return false;
    }
    
    // Sanitize username for Firebase
    const safeUsername = username.replace(/[.#$/[\]]/g, '_');
    const faceRef = ref(rtdb, `${FACES_REF}/${safeUsername}`);
    await remove(faceRef);
    
    console.log(`Face descriptor for ${username} removed from Firebase`);
    return true;
  } catch (error) {
    console.error("Error removing face from Firebase:", error);
    return false;
  }
};

/**
 * Check if username has face data in Firebase
 * @param {string} username - Username
 * @returns {Promise<boolean>} Whether face data exists
 */
export const hasFaceInFirebase = async (username) => {
  try {
    if (!username) return false;
    
    // Sanitize username for Firebase
    const safeUsername = username.replace(/[.#$/[\]]/g, '_');
    const faceRef = ref(rtdb, `${FACES_REF}/${safeUsername}`);
    const snapshot = await get(faceRef);
    
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking face in Firebase:", error);
    return false;
  }
};

// Keep the old user ID based methods for backward compatibility
// But mark them as deprecated

/**
 * @deprecated Use username-based methods instead
 */
export const saveFaceToFirebaseById = async (userId, descriptor) => {
  console.warn("This method is deprecated. Use username-based methods instead.");
  // ...existing code...
};

/**
 * @deprecated Use username-based methods instead
 */
export const getFaceFromFirebaseById = async (userId) => {
  console.warn("This method is deprecated. Use username-based methods instead.");
  // ...existing code...
};
