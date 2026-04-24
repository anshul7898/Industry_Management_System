import { Navigate } from 'react-router-dom';
import { isSessionValid } from '../utils/sessionManager';

/**
 * allowedRoles: array of roles allowed to view this route
 * Example: allowedRoles={["super_user", "inventory_admin"]}
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  // ✅ Check if session is still valid
  if (!isSessionValid()) {
    // Clear any stale session data
    sessionStorage.removeItem('role');
    localStorage.removeItem('role');
    return <Navigate to="/" replace />;
  }

  // ✅ Read from sessionStorage first, fallback to localStorage (for migration)
  const role =
    sessionStorage.getItem('role') || localStorage.getItem('role') || '';

  // If role was only in localStorage, migrate it into sessionStorage
  if (!sessionStorage.getItem('role') && role) {
    sessionStorage.setItem('role', role);
    localStorage.removeItem('role');
  }

  // not logged in
  if (!role) return <Navigate to="/" replace />;

  // logged in but not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectMap = {
      super_user: '/Order',
      inventory_admin: '/Inventory',
      accounts_admin: '/Accounts',
      machine_maintenance_admin: '/MachineMaintenance',
      delivery_admin: '/Delivery',
      product_admin: '/Product',
      order_admin: '/Order',
    };
    return <Navigate to={redirectMap[role] || '/'} replace />;
  }

  return children;
}
