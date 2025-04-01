import * as faceapi from 'face-api.js';

/**
 * Compares a face descriptor with all stored face descriptors to check for matches
 * @param {Float32Array} newDescriptor - The new face descriptor to check
 * @param {Array} existingUsers - Array of stored user data with face descriptors
 * @param {number} threshold - Similarity threshold (lower = stricter matching)
 * @returns {Object|null} Matching user or null if no match found
 */
export const findMatchingFace = (newDescriptor, existingUsers, threshold = 0.4) => {
  if (!newDescriptor || !existingUsers || !existingUsers.length) {
    return null;
  }

  console.log(`Checking new face against ${existingUsers.length} existing faces`);
  
  let bestMatch = { distance: 1, user: null };
  
  for (const user of existingUsers) {
    try {
      // Skip if no descriptor or if it's not a valid array
      if (!user.descriptor || !Array.isArray(user.descriptor) || user.descriptor.length === 0) {
        console.log(`Skipping user ${user.username || user.userId} - invalid descriptor`);
        continue;
      }
      
      // Convert stored descriptor to Float32Array
      const storedDescriptor = new Float32Array(user.descriptor);
      
      if (storedDescriptor.length !== newDescriptor.length) {
        console.log(`Descriptor length mismatch for ${user.username}: ${storedDescriptor.length} vs ${newDescriptor.length}`);
        continue;
      }
      
      // Calculate euclidean distance (lower = more similar)
      const distance = faceapi.euclideanDistance(newDescriptor, storedDescriptor);
      
      // Don't log the username - just the distance and threshold for security
      console.log(`Face match check - distance: ${distance.toFixed(4)}, threshold: ${threshold}`);
      
      // Update best match if this is better
      if (distance < bestMatch.distance) {
        bestMatch = { distance, user };
      }
      
      // If we found a match below threshold, return immediately
      if (distance < threshold) {
        console.log(`👤 MATCH FOUND! Distance: ${distance.toFixed(4)}`);
        return {
          user,
          distance,
          username: user.username,
          confidence: 1 - distance // Convert distance to confidence (0-1)
        };
      }
    } catch (error) {
      console.error(`Error during face comparison:`, error);
    }
  }
  
  // If best match is close but above threshold, still return as potential match
  if (bestMatch.distance < threshold * 1.5) {
    console.log(`Possible match found. Distance: ${bestMatch.distance.toFixed(4)}`);
    return {
      user: bestMatch.user,
      distance: bestMatch.distance,
      username: bestMatch.user?.username,
      confidence: 1 - bestMatch.distance,
      isPotentialMatch: true // Flag that it's a looser match
    };
  }
  
  console.log("No matching face found");
  return null;
};

/**
 * Format face match confidence as a percentage string
 * @param {number} confidence - Match confidence (0-1)
 * @returns {string} Formatted percentage
 */
export const formatMatchConfidence = (confidence) => {
  return `${Math.round(confidence * 100)}%`;
};
