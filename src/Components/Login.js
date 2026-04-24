import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Input, Button, Spin } from 'antd';
import {
  signIn,
  confirmSignIn,
  signOut,
  getCurrentUser,
} from 'aws-amplify/auth';
import {
  LockOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState('super_user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const ROLE_REDIRECT = {
    super_user: '/Order',
    inventory_admin: '/Inventory',
    accounts_admin: '/Accounts',
    machine_maintenance_admin: '/MachineMaintenance',
    delivery_admin: '/Delivery',
    product_admin: '/Product',
    order_admin: '/Order',
  };

  const roleOptions = [
    { value: 'super_user', label: '👑 Super User' },
    // { value: 'inventory_admin', label: '📦 Inventory Admin' },
    // { value: 'accounts_admin', label: '💼 Accounts Admin' },
    // {
    //   value: 'machine_maintenance_admin',
    //   label: '🔧 Machine Maintenance Admin',
    // },
    // { value: 'delivery_admin', label: '🚚 Delivery Admin' },
    // { value: 'product_admin', label: '🏭 Product Admin' },
    // { value: 'order_admin', label: '📋 Order Admin' },
  ];

  const persistRole = () => {
    sessionStorage.setItem('role', role);
    localStorage.removeItem('role');
  };

  const redirectAfterLogin = () => {
    const redirectTo = ROLE_REDIRECT[role];
    if (!redirectTo) throw new Error('Unknown role selected.');
    persistRole();
    navigate(redirectTo, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const u = username.trim();
      const p = password;

      if (!role) throw new Error('Role is required.');
      if (!u) throw new Error('Username is required.');
      if (!p) throw new Error('Password is required.');

      let currentUser = null;
      try {
        currentUser = await getCurrentUser();
      } catch {
        /* no user */
      }
      if (currentUser) {
        await signOut();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      const result = await signIn({ username: u, password: p });
      const step = result?.nextStep?.signInStep;

      if (step === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setRequiresNewPassword(true);
        setNewPassword('');
        return;
      }

      if (step && step !== 'DONE') {
        throw new Error(
          `Additional sign-in step required: ${step}. (MFA/OTP not implemented.)`,
        );
      }

      redirectAfterLogin();
    } catch (err) {
      setError(err?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!newPassword) throw new Error('New password is required.');

      const result = await confirmSignIn({ challengeResponse: newPassword });
      const step = result?.nextStep?.signInStep;

      if (step && step !== 'DONE') {
        throw new Error(
          `Additional sign-in step required: ${step}. (MFA/OTP not implemented.)`,
        );
      }

      setRequiresNewPassword(false);
      setNewPassword('');
      redirectAfterLogin();
    } catch (err) {
      setError(err?.message || 'Failed to set new password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    setRequiresNewPassword(false);
    setNewPassword('');
    setError('');
  };

  return (
    <div className="login-container">
      {/* Animated background */}
      <div className="login-background">
        <div className="gradient-circle gradient-circle-1"></div>
        <div className="gradient-circle gradient-circle-2"></div>
        <div className="gradient-circle gradient-circle-3"></div>
      </div>

      {/* Main content */}
      <div className="login-wrapper">
        <form
          onSubmit={requiresNewPassword ? handleSetNewPassword : handleSubmit}
          className="login-card"
        >
          {/* Header with logo */}
          <div className="login-header">
            <div className="login-logo">
              {requiresNewPassword ? (
                <LockOutlined className="logo-icon" />
              ) : (
                <UserOutlined className="logo-icon" />
              )}
            </div>

            {/* ── Brand name — only shown on the normal login screen ── */}
            {!requiresNewPassword && (
              <div className="login-brand">
                <span className="login-brand-leaf">🌿</span>
                <span className="login-brand-name">Eco Packaging Venture</span>
              </div>
            )}

            <h1 className="login-title">
              {requiresNewPassword ? 'Secure Your Account' : 'Welcome Back'}
            </h1>
            <p className="login-subtitle">
              {requiresNewPassword
                ? 'Set a new password to continue'
                : 'Manage your operations with ease'}
            </p>
          </div>

          {!requiresNewPassword ? (
            <>
              {/* Role selector */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Select Your Role</span>
                </label>
                <Select
                  value={role}
                  onChange={setRole}
                  options={roleOptions}
                  className="role-select"
                  popupMatchSelectWidth={false}
                  disabled={submitting}
                />
              </div>

              {/* Username field */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Username or Email</span>
                </label>
                <div className="input-wrapper">
                  <UserOutlined className="input-icon" />
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    placeholder="Enter your username or email"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Password</span>
                </label>
                <div className="input-wrapper">
                  <LockOutlined className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter your password"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <EyeTwoTone className="icon" />
                    ) : (
                      <EyeInvisibleOutlined className="icon" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* New password field */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">New Password</span>
                </label>
                <div className="input-wrapper">
                  <LockOutlined className="input-icon" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter a strong new password"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={submitting}
                  >
                    {showNewPassword ? (
                      <EyeTwoTone className="icon" />
                    ) : (
                      <EyeInvisibleOutlined className="icon" />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-hint">
                <CheckCircleOutlined className="hint-icon" />
                <p>Your account requires a password change on first login.</p>
              </div>
            </>
          )}

          {/* Error message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Login Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className={`btn-primary ${submitting ? 'loading' : ''}`}
            >
              {submitting ? (
                <>
                  <Spin size="small" />
                  <span>
                    {requiresNewPassword ? 'Updating...' : 'Signing in...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {requiresNewPassword
                      ? 'Set Password & Continue'
                      : 'Sign In'}
                  </span>
                  <ArrowRightOutlined />
                </>
              )}
            </button>

            {requiresNewPassword && (
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={submitting}
                className="btn-secondary"
              >
                ← Back to Login
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>🔒 Your login is secured with enterprise-grade encryption</p>
          </div>
        </form>
      </div>
    </div>
  );
}
