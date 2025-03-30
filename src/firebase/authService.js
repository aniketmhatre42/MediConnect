import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - Username for display
 * @param {boolean} hasFaceAuth - Whether user has set up face authentication
 * @returns {Promise<Object>} - User data including firebase UID
 */
export const registerUser = async (email, password, username, hasFaceAuth = false) => {
  try {
    console.log("Attempting to register user with Firebase:", email);
    
    // Create the user in localStorage first as fallback
    const userId = `local_${Date.now()}`;
    const localUserData = {
      userId,
      email,
      username,
      hasFaceAuth,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isLocalOnly: true // Flag to indicate this is a local user
    };
    
    try {
      // Try Firebase first
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user profile to include the username
      await updateProfile(user, { displayName: username });
      
      // Create user document in Firestore
      const userData = {
        userId: user.uid,
        email: user.email,
        username,
        hasFaceAuth,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isLocalOnly: false
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('User registered successfully with Firebase:', user.uid);
      
      return {
        ...userData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
    } catch (firebaseError) {
      console.warn('Firebase registration failed, falling back to local storage:', firebaseError.message);
      
      // Save to localStorage as fallback
      const existingUsers = JSON.parse(localStorage.getItem('user_data') || '[]');
      existingUsers.push(localUserData);
      localStorage.setItem('user_data', JSON.stringify(existingUsers));
      
      console.log('User registered with local storage:', userId);
      return localUserData;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Sign in a user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login timestamp in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
    
    // Get full user data
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User signed in successfully:', user.uid);
      return userData;
    } else {
      throw new Error('User document not found in database');
    }
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Update user's face authentication status
 * @param {string} userId - User ID
 * @param {boolean} hasFaceAuth - Whether user has face auth enabled
 */
export const updateFaceAuthStatus = async (userId, hasFaceAuth) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hasFaceAuth,
      lastUpdated: serverTimestamp()
    });
    console.log(`Face auth status updated for user ${userId}: ${hasFaceAuth}`);
    return true;
  } catch (error) {
    console.error('Error updating face auth status:', error);
    return false;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

/**
 * Get the current signed-in user
 * @returns {Object|null} - The current user or null if not signed in
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};
