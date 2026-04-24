import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

/**
 * SessionProvider wraps the app and manages session timeout
 * Must wrap all routes that require session management
 */
export const SessionProvider = ({ children }) => {
  // This hook automatically handles inactivity timeout
  useInactivityTimeout();

  return <>{children}</>;
};
