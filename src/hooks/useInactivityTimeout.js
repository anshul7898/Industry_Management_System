import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

/**
 * Hook to handle user inactivity timeout
 * Logs user out and redirects to login after specified idle time
 */
export const useInactivityTimeout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      // Clear session storage
      sessionStorage.removeItem('role');
      localStorage.removeItem('role');
      
      // Redirect to login
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Only reset timer if more than 1 second has passed since last activity
    // This prevents excessive timer resets from rapid events
    if (timeSinceLastActivity > 1000) {
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    // Only start timeout if user is logged in
    const role = sessionStorage.getItem('role') || localStorage.getItem('role');
    if (!role) {
      return;
    }

    // Set initial timeout
    resetTimer();

    // Add event listeners for user activity
    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleUserActivity, resetTimer]);

  return { handleLogout };
};
