/**
 * Authentication utilities for session management
 */

/**
 * Checks if user is authenticated by looking at session storage
 * @returns {boolean} Whether user is authenticated
 */
export const isAuthenticated = () => {
  const sessionAuth = sessionStorage.getItem('authenticated') === 'true';
  const hasLocalUser = !!localStorage.getItem('user');
  
  return sessionAuth || hasLocalUser;
};

/**
 * Gets the current username from session
 * @returns {string} Username or empty string if not found
 */
export const getUsername = () => {
  const sessionUsername = sessionStorage.getItem('username');
  
  if (sessionUsername) {
    return sessionUsername;
  }
  
  try {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return localUser.username || '';
  } catch (e) {
    return '';
  }
};

/**
 * Logs out the current user by clearing session data
 */
export const logout = () => {
  // Clear session storage
  sessionStorage.removeItem('authenticated');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('userId');
  
  // Clear local storage
  localStorage.removeItem('user');
  
  // Dispatch event to notify components
  window.dispatchEvent(new Event('authChange'));
};

/**
 * Sets authentication data for a user
 * @param {Object} userData - User data to store
 */
export const setAuthData = (userData) => {
  if (!userData) return;
  
  // Set in session storage
  sessionStorage.setItem('username', userData.username || 'User');
  sessionStorage.setItem('authenticated', 'true');
  sessionStorage.setItem('userId', userData.userId || 'user_temp');
  
  // Set in local storage for persistence
  localStorage.setItem('user', JSON.stringify({
    username: userData.username || 'User',
    userId: userData.userId || 'user_temp',
    authenticated: true,
    timestamp: new Date().toISOString()
  }));
  
  // Dispatch event
  window.dispatchEvent(new Event('authChange'));
};
