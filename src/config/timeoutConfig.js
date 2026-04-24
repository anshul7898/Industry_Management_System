/**
 * Timeout Configuration
 * 
 * This file contains all timeout-related settings for the application
 */

// Session inactivity timeout (in milliseconds)
// Default: 2 hours
// Activities that reset the timer: mouse, keyboard, scroll, touch, click
export const SESSION_TIMEOUT = {
  INACTIVITY_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
  ACTIVITY_DEBOUNCE: 1000, // 1 second - prevents excessive timer resets
};

/**
 * How to modify the timeout:
 * 
 * 1. Change INACTIVITY_TIMEOUT to desired value in milliseconds:
 *    - 5 minutes: 5 * 60 * 1000
 *    - 10 minutes: 10 * 60 * 1000
 *    - 30 minutes: 30 * 60 * 1000
 * 
 * 2. Update the useInactivityTimeout hook if needed:
 *    - File: src/hooks/useInactivityTimeout.js
 *    - Change the INACTIVITY_TIMEOUT constant
 * 
 * 3. Restart the application for changes to take effect
 */
