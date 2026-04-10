import { Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = (location.pathname || '').toLowerCase();

  const role =
    sessionStorage.getItem('role') || localStorage.getItem('role') || '';

  if (!sessionStorage.getItem('role') && role) {
    sessionStorage.setItem('role', role);
    localStorage.removeItem('role');
  }

  const isLoginRoute = path === '/' || path === '/login';
  if (isLoginRoute) return null;

  const selectedKey = (() => {
    if (path === '/home') return 'home';
    if (path === '/order') return 'order';
    if (path === '/product') return 'product';
    if (path === '/agent') return 'agent';
    if (path === '/party') return 'party';
    return '';
  })();

  const ALL_ITEMS = [
    {
      key: 'order',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/Order">Order</Link>,
    },
    {
      key: 'product',
      icon: <AppstoreOutlined />,
      label: <Link to="/Product">Product</Link>,
    },
    {
      key: 'agent',
      icon: <UserOutlined />,
      label: <Link to="/Agent">Agent</Link>,
    },
    {
      key: 'party',
      icon: <TeamOutlined />,
      label: <Link to="/Party">Party</Link>,
    },
  ];

  const ROLE_ALLOWED_KEYS = {
    super_user: ['home', 'order', 'product', 'agent', 'party'],
    inventory_admin: ['inventory'],
    accounts_admin: ['accounts'],
    machine_maintenance_admin: ['machineMaintenance'],
    delivery_admin: ['delivery'],
    product_admin: ['product'],
    order_admin: ['order'],
  };

  const allowedKeys = ROLE_ALLOWED_KEYS[role] || ALL_ITEMS.map((x) => x.key);

  const items =
    role === 'super_user'
      ? ALL_ITEMS
      : ALL_ITEMS.filter((i) => allowedKeys.includes(i.key));

  const safeSelectedKeys =
    selectedKey && allowedKeys.includes(selectedKey) ? [selectedKey] : [];

  const getBrandLink = () => {
    switch (role) {
      case 'super_user':
      case 'order_admin':
        return '/Order';
      case 'inventory_admin':
        return '/Inventory';
      case 'accounts_admin':
        return '/Accounts';
      case 'machine_maintenance_admin':
        return '/MachineMaintenance';
      case 'delivery_admin':
        return '/Delivery';
      case 'product_admin':
        return '/Product';
      default:
        return '/Order';
    }
  };

  const brandLink = getBrandLink();

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
    <>
      <style>{`
        .navbar-root {
          width: 100%;
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
          box-shadow: 0 2px 12px rgba(0,0,0,0.22);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .navbar-inner {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 60px;
          gap: 0;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 28px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .navbar-brand-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          box-shadow: 0 2px 8px rgba(22,163,74,0.40);
          flex-shrink: 0;
        }
        .navbar-brand-text {
          font-size: 17px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .navbar-brand-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.45);
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          line-height: 1;
          margin-top: 1px;
        }
        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1 1 auto;
          min-width: 0;
        }
        .navbar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 16px;
          height: 60px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.18s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .navbar-nav-item .nav-icon {
          font-size: 15px;
          transition: transform 0.18s ease;
        }
        .navbar-nav-item:hover {
          color: #ffffff;
        }
        .navbar-nav-item:hover .nav-icon {
          transform: translateY(-1px);
        }
        .navbar-nav-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: linear-gradient(90deg, #16a34a, #4ade80);
          border-radius: 3px 3px 0 0;
          transition: width 0.22s ease;
        }
        .navbar-nav-item:hover::after {
          width: 60%;
        }
        .navbar-nav-item.active {
          color: #ffffff;
          font-weight: 600;
        }
        .navbar-nav-item.active::after {
          width: 70%;
          background: linear-gradient(90deg, #16a34a, #4ade80);
          box-shadow: 0 0 8px rgba(22,163,74,0.6);
        }
        .navbar-nav-item.active .nav-icon {
          color: #4ade80;
        }
        .navbar-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.1);
          margin: 0 12px;
          flex-shrink: 0;
        }
        .navbar-role-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex-shrink: 0;
          margin-right: 10px;
        }
        .navbar-role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #52c41a;
          box-shadow: 0 0 6px #52c41a;
          flex-shrink: 0;
        }
        .navbar-logout-btn {
          display: flex !important;
          align-items: center;
          gap: 6px;
          height: 34px !important;
          padding: 0 14px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
          background: rgba(239,68,68,0.12) !important;
          border: 1px solid rgba(239,68,68,0.35) !important;
          color: #ff7875 !important;
          transition: all 0.18s ease !important;
          flex-shrink: 0;
        }
        .navbar-logout-btn:hover {
          background: rgba(239,68,68,0.25) !important;
          border-color: #ff4d4f !important;
          color: #fff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239,68,68,0.25) !important;
        }
      `}</style>

      <div className="navbar-root">
        <div className="navbar-inner">
          {/* ── Brand ── */}
          <Link to={brandLink} className="navbar-brand">
            <div className="navbar-brand-icon">E</div>
            <div>
              <span className="navbar-brand-text">Eco Packaging</span>
              <span className="navbar-brand-sub">Management</span>
            </div>
          </Link>

          {/* ── Divider ── */}
          <div className="navbar-divider" />

          {/* ── Nav links ── */}
          <nav className="navbar-nav">
            {items.map((item) => {
              const isActive = safeSelectedKeys.includes(item.key);
              return (
                <Link
                  key={item.key}
                  to={item.label.props.to}
                  className={`navbar-nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label.props.children}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Role badge ── */}
          {role && (
            <div className="navbar-role-badge">
              <div className="navbar-role-dot" />
              {role.replace(/_/g, ' ')}
            </div>
          )}

          {/* ── Logout ── */}
          <Button
            className="navbar-logout-btn"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
