// Local storage service for face data management

// Base directory name (for naming convention only)
const FACE_DATA_DIR = 'face_data';

/**
 * Saves face descriptor data to localStorage
 * @param {string} userId - The unique user ID
 * @param {Float32Array} descriptor - The face descriptor data
 * @returns {Promise<boolean>} - Whether the save was successful
 */
export const saveFaceDescriptor = async (userId, descriptor) => {
  try {
    console.log(`Saving face descriptor for user ${userId}`);
    
    // Convert descriptor to regular array for JSON serialization
    const descriptorArray = Array.from(descriptor);
    
    // Store in localStorage
    storeLocalCopy(userId, descriptorArray);
    
    console.log(`Face descriptor saved successfully for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error saving face descriptor:', error);
    return false;
  }
};

/**
 * Loads face descriptor data from localStorage
 * @param {string} userId - The unique user ID
 * @returns {Float32Array|null} - The face descriptor or null if not found
 */
export const loadFaceDescriptor = (userId) => {
  try {
    const localCopy = getLocalCopy(userId);
    if (localCopy) {
      return new Float32Array(localCopy);
    }
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
    const faceDescriptors = JSON.parse(localStorage.getItem('face_descriptors') || '[]');
    
    // Check if this user already has a descriptor
    const existingIndex = faceDescriptors.findIndex(item => item.userId === userId);
    
    if (existingIndex >= 0) {
      faceDescriptors[existingIndex].descriptor = descriptorArray;
      faceDescriptors[existingIndex].timestamp = new Date().toISOString();
      console.log(`Updated existing face descriptor for user ${userId}`);
    } else {
      faceDescriptors.push({
        userId,
        descriptor: descriptorArray,
        timestamp: new Date().toISOString()
      });
      console.log(`Added new face descriptor for user ${userId}`);
    }
    
    localStorage.setItem('face_descriptors', JSON.stringify(faceDescriptors));
    
    // Verify data was saved
    const verify = localStorage.getItem('face_descriptors');
    if (verify) {
      const parsed = JSON.parse(verify);
      console.log(`Successfully saved face data. Total entries: ${parsed.length}`);
    }
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
    const faceDescriptors = JSON.parse(localStorage.getItem('face_descriptors') || '[]');
    const userFace = faceDescriptors.find(item => item.userId === userId);
    return userFace ? userFace.descriptor : null;
  } catch (e) {
    console.error('Error getting face data from localStorage:', e);
    return null;
  }
};

/**
 * Removes a face descriptor from localStorage
 * @param {string} userId - The unique user ID
 * @returns {boolean} - Whether the removal was successful
 */
export const removeFaceDescriptor = (userId) => {
  try {
    // Remove from localStorage
    const faceDescriptors = JSON.parse(localStorage.getItem('face_descriptors') || '[]');
    const filteredDescriptors = faceDescriptors.filter(item => item.userId !== userId);
    localStorage.setItem('face_descriptors', JSON.stringify(filteredDescriptors));
    
    console.log(`Face descriptor for user ${userId} removed from local storage`);
    return true;
  } catch (error) {
    console.error('Error removing face descriptor:', error);
    return false;
  }
};

/**
 * Lists all user IDs with stored face descriptors in localStorage
 * @returns {Array<string>} - Array of user IDs
 */
export const listFaceUsers = () => {
  try {
    const faceDescriptors = JSON.parse(localStorage.getItem('face_descriptors') || '[]');
    return faceDescriptors.map(item => item.userId);
  } catch (error) {
    console.error('Error listing face users:', error);
    return [];
  }
};
