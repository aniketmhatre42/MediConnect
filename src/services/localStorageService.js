const LOCAL_STORAGE_KEYS = {
  FACE_DESCRIPTORS: 'face_descriptors',
  USER_DATA: 'user_data'
};

export const saveFaceDescriptor = (userId, descriptor) => {
  try {
    console.log(`Saving face descriptor for user ${userId}`);
    
    // Ensure descriptor is properly converted to Array
    const descriptorArray = Array.from(descriptor);
    
    const faceData = {
      userId,
      descriptor: descriptorArray,
      timestamp: new Date().toISOString()
    };
    
    // Get existing descriptors
    let existingData;
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FACE_DESCRIPTORS);
      console.log(`Retrieved stored face data: ${storedData ? 'Found' : 'Not found'}`);
      
      existingData = storedData ? JSON.parse(storedData) : [];
      if (!Array.isArray(existingData)) {
        console.warn('Stored face descriptors is not an array, resetting');
        existingData = [];
      }
    } catch (e) {
      console.warn('Error parsing stored face descriptors, resetting', e);
      existingData = [];
    }
    
    // Check if user already has a descriptor and update it
    const existingIndex = existingData.findIndex(item => item.userId === userId);
    if (existingIndex >= 0) {
      console.log(`Updating existing face descriptor for user ${userId}`);
      existingData[existingIndex] = faceData;
    } else {
      console.log(`Adding new face descriptor for user ${userId}`);
      existingData.push(faceData);
    }
    
    // Save the updated data
    const dataToSave = JSON.stringify(existingData);
    localStorage.setItem(LOCAL_STORAGE_KEYS.FACE_DESCRIPTORS, dataToSave);
    
    // Verify data was saved correctly
    const verifyData = localStorage.getItem(LOCAL_STORAGE_KEYS.FACE_DESCRIPTORS);
    console.log(`Face data saved successfully. Data size: ${verifyData?.length || 0} characters`);
    console.log(`Total face descriptors stored: ${existingData.length}`);
    
    return true;
  } catch (error) {
    console.error('Error saving face descriptor:', error);
    return false;
  }
};

export const getFaceDescriptor = (userId) => {
  try {
    const allDescriptors = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FACE_DESCRIPTORS) || '[]');
    const userDescriptor = allDescriptors.find(data => data.userId === userId);
    return userDescriptor ? new Float32Array(userDescriptor.descriptor) : null;
  } catch (error) {
    console.error('Error getting face descriptor:', error);
    return null;
  }
};

export const saveUserData = (userData) => {
  try {
    const existingUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA) || '[]');
    existingUsers.push(userData);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(existingUsers));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};
