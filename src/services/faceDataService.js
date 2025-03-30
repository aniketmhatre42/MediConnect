/**
 * Service for handling face data storage
 */
// Remove the import for file-saver
import { saveFaceDescriptor as saveLocalFaceDescriptor } from './localFaceStorage';

// Base directory for face data files
const FACE_DATA_DIR = 'faceData';

/**
 * Saves face descriptor data to localStorage and creates a downloadable file
 * 
 * @param {string} userId - User ID
 * @param {string} username - Username for the file name
 * @param {Float32Array} descriptor - Face descriptor data
 * @returns {Promise<boolean>} Whether the save was successful
 */
export const saveFaceData = async (userId, username, descriptor) => {
  try {
    console.log(`Saving face data for user: ${username} (${userId})`);
    
    // 1. Save to localStorage first for immediate use
    const localSaved = await saveLocalFaceDescriptor(userId, descriptor);
    if (!localSaved) {
      console.error("Failed to save face data to localStorage");
    }
    
    // 2. Convert descriptor to regular array for JSON
    const descriptorArray = Array.from(descriptor);
    
    // 3. Create data object with metadata
    const faceData = {
      userId,
      username,
      timestamp: new Date().toISOString(),
      descriptor: descriptorArray
    };
    
    // 4. Create a Blob with the face data
    const jsonBlob = new Blob(
      [JSON.stringify(faceData, null, 2)], 
      {type: 'application/json'}
    );
    
    // 5. Save file using native browser download instead of file-saver
    createDownloadLink(jsonBlob, `${FACE_DATA_DIR}_${username}_${userId}.json`);
    
    console.log(`Face data prepared for download: ${FACE_DATA_DIR}_${username}_${userId}.json`);
    return true;
  } catch (error) {
    console.error("Error saving face data:", error);
    return false;
  }
};

/**
 * Captures a face image from video and saves it as a downloadable file
 * 
 * @param {string} userId - User ID
 * @param {string} username - Username for the file name
 * @param {HTMLVideoElement} videoElement - Video element with the face
 * @param {Object} detection - Face detection result from face-api.js
 * @returns {Promise<string|null>} URL of the saved image or null if failed
 */
export const captureFaceImage = async (userId, username, videoElement, detection) => {
  try {
    if (!videoElement || !detection) {
      throw new Error("Missing required parameters");
    }
    
    // Create canvas to capture the face
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Draw a box around the detected face
    if (detection.detection) {
      const box = detection.detection.box;
      context.strokeStyle = '#00ff00'; // Green box
      context.lineWidth = 3;
      context.strokeRect(box.x, box.y, box.width, box.height);
      
      // Add user information text
      context.fillStyle = 'rgba(0, 0, 0, 0.5)';
      context.fillRect(box.x, box.y - 30, box.width, 30);
      context.fillStyle = '#ffffff';
      context.font = '16px Arial';
      context.fillText(username, box.x + 5, box.y - 10);
    }
    
    // Convert canvas to blob
    const imageBlob = await new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
    });
    
    // Create a URL for the blob (for preview or immediate use)
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // Save the image file using native browser download
    const filename = `${FACE_DATA_DIR}_photo_${username}_${userId}.jpg`;
    createDownloadLink(imageBlob, filename);
    
    console.log(`Face image prepared for download: ${filename}`);
    return imageUrl;
  } catch (error) {
    console.error("Error capturing face image:", error);
    return null;
  }
};

/**
 * Creates a download link and triggers download
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Name for the downloaded file
 */
function createDownloadLink(blob, filename) {
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  // Clean up after download starts
  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
  }, 100);
}
