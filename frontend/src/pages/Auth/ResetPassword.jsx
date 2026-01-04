import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import authService from '@services/authService';
import './Login.css';

/**
 * Reset Password Page Component
 * Allows users to set a new password using reset token
 */
const ResetPassword = () => {
  const { t } = useLanguage();
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, and number');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, formData.password);
      navigate('/login', { state: { message: 'Password reset successful. Please login.' } });
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
                className="form-input"
                placeholder="At least 8 characters"
              />
              <small className="form-hint">
                Must contain uppercase, lowercase, and number
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="8"
                className="form-input"
                placeholder="Re-enter your password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="auth-switch">
            Remember your password?{' '}
            <Link to="/login" className="link-primary">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;










