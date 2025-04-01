import { 
  saveFaceToFirebase, 
  getFaceFromFirebase,
  removeFaceFromFirebase,
  hasFaceInFirebase
} from './firebaseFaceService';

// Local storage service for face data management

// Base directory name (for naming convention only)
const FACE_DATA_DIR = 'face_data';
const STORAGE_KEY = 'face_descriptors';

/**
 * Saves face descriptor data to Firebase and localStorage as fallback
 * @param {string} userId - The unique user ID
 * @param {Float32Array} descriptor - The face descriptor data
 * @returns {Promise<boolean>} - Whether the save was successful
 */
export const saveFaceDescriptor = async (userId, descriptor) => {
  try {
    console.log(`Starting face descriptor save process for user ${userId}`);
    
    // First try to save to Firebase with a timeout
    let firebaseSaved = false;
    try {
      const firebasePromise = saveFaceToFirebase(userId, descriptor);
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase save operation timed out')), 5000)
      );
      
      firebaseSaved = await Promise.race([firebasePromise, timeoutPromise]);
      if (firebaseSaved) {
        console.log("Successfully saved to Firebase");
      }
    } catch (fbError) {
      console.warn("Firebase save failed or timed out, continuing with localStorage:", fbError);
    }
    
    // Always save to localStorage as a fallback/backup
    console.log("Saving to localStorage as backup");
    const descriptorArray = Array.from(descriptor);
    storeLocalCopy(userId, descriptorArray);
    
    return true; // Consider overall operation successful if local storage worked
  } catch (error) {
    console.error('Error saving face descriptor:', error);
    return false;
  }
};

/**
 * Loads face descriptor data, trying Firebase first then falling back to localStorage
 * @param {string} userId - The unique user ID
 * @returns {Promise<Float32Array|null>} - The face descriptor or null if not found
 */
export const loadFaceDescriptor = async (userId) => {
  try {
    // Try to load from Firebase first
    let descriptor = null;
    try {
      descriptor = await getFaceFromFirebase(userId);
      if (descriptor) {
        console.log(`Face descriptor for ${userId} loaded from Firebase`);
        return descriptor;
      }
    } catch (fbError) {
      console.warn("Failed to load from Firebase, trying localStorage:", fbError);
    }
    
    // If not found in Firebase or error occurred, try localStorage
    const localCopy = getLocalCopy(userId);
    if (localCopy) {
      console.log(`Face descriptor for ${userId} loaded from localStorage`);
      return new Float32Array(localCopy);
    }
    
    console.log(`No face descriptor found for user ${userId}`);
    return null;
  } catch (error) {
    console.error('Error loading face descriptor:', error);
    return null;
  }
};

/**
 * Stores the face data in localStorage
 * @param {string} userId - The unique user ID
 * @param {Array} descriptorArray - The face descriptor array
 */
const storeLocalCopy = (userId, descriptorArray) => {
  try {
    const faceDescriptors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Check if this user already has a descriptor
    const existingIndex = faceDescriptors.findIndex(item => item.userId === userId);
    
    if (existingIndex >= 0) {
      faceDescriptors[existingIndex].descriptor = descriptorArray;
      faceDescriptors[existingIndex].timestamp = new Date().toISOString();
      console.log(`Updated existing face descriptor for user ${userId} in localStorage`);
    } else {
      faceDescriptors.push({
        userId,
        descriptor: descriptorArray,
        timestamp: new Date().toISOString()
      });
      console.log(`Added new face descriptor for user ${userId} to localStorage`);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faceDescriptors));
  } catch (e) {
    console.error('Error storing face data in localStorage:', e);
    throw e;
  }
};

/**
 * Gets a face descriptor from localStorage
 * @param {string} userId - The unique user ID
 * @returns {Array|null} - The descriptor array or null if not found
 */
const getLocalCopy = (userId) => {
  try {
    const faceDescriptors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const userFace = faceDescriptors.find(item => item.userId === userId);
    return userFace ? userFace.descriptor : null;
  } catch (e) {
    console.error('Error getting face data from localStorage:', e);
    return null;
  }
};

/**
 * Removes a face descriptor from both Firebase and localStorage
 * @param {string} userId - The unique user ID
 * @returns {Promise<boolean>} - Whether the removal was successful
 */
export const removeFaceDescriptor = async (userId) => {
  try {
    // Try to remove from Firebase
    let firebaseRemoved = false;
    try {
      firebaseRemoved = await removeFaceFromFirebase(userId);
    } catch (fbError) {
      console.warn("Failed to remove from Firebase:", fbError);
    }
    
    // Always remove from localStorage
    const faceDescriptors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filteredDescriptors = faceDescriptors.filter(item => item.userId !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDescriptors));
    
    console.log(`Face descriptor for user ${userId} removed from storage`);
    return firebaseRemoved || true; // Return true if either method worked
  } catch (error) {
    console.error('Error removing face descriptor:', error);
    return false;
  }
};

/**
 * Check if a user has stored face data (in either Firebase or localStorage)
 * @param {string} userId - The unique user ID
 * @returns {Promise<boolean>} - Whether the user has face data
 */
export const hasFaceDescriptor = async (userId) => {
  try {
    // Check Firebase first
    try {
      const inFirebase = await hasFaceInFirebase(userId);
      if (inFirebase) return true;
    } catch (fbError) {
      console.warn("Failed to check Firebase for face data:", fbError);
    }
    
    // Check localStorage as fallback
    const faceDescriptors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return faceDescriptors.some(item => item.userId === userId);
  } catch (error) {
    console.error('Error checking for face descriptor:', error);
    return false;
  }
};

/**
 * Lists all user IDs with stored face descriptors (from localStorage)
 * @returns {Array<string>} - Array of user IDs
 */
export const listFaceUsers = () => {
  try {
    const faceDescriptors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return faceDescriptors.map(item => item.userId);
  } catch (error) {
    console.error('Error listing face users:', error);
    return [];
  }
};

/**
 * Gets all stored face descriptors from localStorage
 * @returns {Array} Array of all face descriptors
 */
export const getAllFaceDescriptors = () => {
  try {
    const faceDescriptors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Validate each descriptor
    const validDescriptors = faceDescriptors.filter(item => {
      const hasValidDescriptor = item && 
                              item.descriptor && 
                              Array.isArray(item.descriptor) && 
                              item.descriptor.length > 0;
      
      if (!hasValidDescriptor) {
        console.warn(`Found invalid descriptor for user ${item?.userId || 'unknown'}`);
      }
      
      return hasValidDescriptor;
    });
    
    console.log(`Retrieved ${validDescriptors.length} valid face descriptors from localStorage`);
    return validDescriptors;
  } catch (e) {
    console.error('Error getting face descriptors from localStorage:', e);
    return [];
  }
};
