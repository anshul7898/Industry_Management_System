import React from 'react';
import { Menu, Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Current route
  const path = (location.pathname || '').toLowerCase();

  // ✅ Use sessionStorage first; fallback to localStorage to avoid lockouts during migration
  const role =
    sessionStorage.getItem('role') || localStorage.getItem('role') || '';

  // If role only exists in localStorage, migrate it
  if (!sessionStorage.getItem('role') && role) {
    sessionStorage.setItem('role', role);
    localStorage.removeItem('role');
  }

  // Hide navbar only on login routes
  const isLoginRoute = path === '/' || path === '/login';
  if (isLoginRoute) return null;

  const selectedKey = (() => {
    if (path === '/home') return 'home';
    if (path === '/order') return 'order';
    if (path === '/inventory') return 'inventory';
    if (path === '/delivery') return 'delivery';
    if (path === '/accounts') return 'accounts';
    if (path === '/machinemaintenance') return 'machineMaintenance';
    if (path === '/product') return 'product';
    if (path === '/agent') return 'agent';
    return '';
  })();

  const ALL_ITEMS = [
    { key: 'home', label: <Link to="/Home">Home</Link> },
    { key: 'order', label: <Link to="/Order">Order</Link> },
    { key: 'inventory', label: <Link to="/Inventory">Inventory</Link> },
    { key: 'delivery', label: <Link to="/Delivery">Delivery</Link> },
    { key: 'accounts', label: <Link to="/Accounts">Accounts</Link> },
    {
      key: 'machineMaintenance',
      label: <Link to="/MachineMaintenance">Machine Maintenance</Link>,
    },
    { key: 'product', label: <Link to="/Product">Product</Link> },
    { key: 'agent', label: <Link to="/Agent">Agent</Link> },
  ];

  const ROLE_ALLOWED_KEYS = {
    super_user: [
      'home',
      'order',
      'inventory',
      'delivery',
      'accounts',
      'machineMaintenance',
      'product',
      'agent',
    ],
    inventory_admin: ['inventory'],
    accounts_admin: ['accounts'],
    machine_maintenance_admin: ['machineMaintenance'],
    delivery_admin: ['delivery'],
    product_admin: ['product'],
    order_admin: ['order'],
  };

  // If role is missing, show all menu items (so navbar never looks empty),
  // but ProtectedRoute will still protect pages.
  const allowedKeys = ROLE_ALLOWED_KEYS[role] || ALL_ITEMS.map((x) => x.key);

  const items =
    role === 'super_user'
      ? ALL_ITEMS
      : ALL_ITEMS.filter((i) => allowedKeys.includes(i.key));

  const safeSelectedKeys =
    selectedKey && allowedKeys.includes(selectedKey) ? [selectedKey] : [];

  const handleLogout = async () => {
    sessionStorage.removeItem('role');
    localStorage.removeItem('role');

    try {
      await signOut();
    } catch {
      // ignore
    }

    navigate('/', { replace: true });
  };

  return (
    <div
      style={{
        width: '100%',
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 8px',
        }}
      >
        <Menu
          mode="horizontal"
          items={items}
          selectedKeys={safeSelectedKeys}
          style={{
            borderBottom: 'none',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        />

        <div style={{ flex: '0 0 auto' }}>
          <Button danger onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
