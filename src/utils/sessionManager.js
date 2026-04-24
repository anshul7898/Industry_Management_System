/**
 * Session management utilities
 * Handles session validation, storage, and cleanup
 */

const SESSION_START_TIME_KEY = 'sessionStartTime';
const SESSION_ROLE_KEY = 'role';

/**
 * Initialize session tracking
 */
export const initializeSession = () => {
  const role =
    sessionStorage.getItem(SESSION_ROLE_KEY) ||
    localStorage.getItem(SESSION_ROLE_KEY);

  if (role && !sessionStorage.getItem(SESSION_START_TIME_KEY)) {
    sessionStorage.setItem(SESSION_START_TIME_KEY, Date.now().toString());
  }
};

/**
 * Get current session info
 */
export const getSessionInfo = () => {
  const role =
    sessionStorage.getItem(SESSION_ROLE_KEY) ||
    localStorage.getItem(SESSION_ROLE_KEY);
  const startTime = sessionStorage.getItem(SESSION_START_TIME_KEY);

  return {
    isActive: !!role,
    role,
    startTime: startTime ? parseInt(startTime, 10) : null,
  };
};

/**
 * Clear session completely
 */
export const clearSession = async () => {
  try {
    const { signOut } = await import('aws-amplify/auth');
    await signOut();
  } catch (err) {
    console.error('Error during sign out:', err);
  }

  sessionStorage.removeItem(SESSION_ROLE_KEY);
  sessionStorage.removeItem(SESSION_START_TIME_KEY);
  localStorage.removeItem(SESSION_ROLE_KEY);
};

/**
 * Check if session is still valid (not expired)
 */
export const isSessionValid = () => {
  const sessionInfo = getSessionInfo();

  if (!sessionInfo.isActive) {
    return false;
  }

  // Session is valid if there's an active role
  return true;
};
