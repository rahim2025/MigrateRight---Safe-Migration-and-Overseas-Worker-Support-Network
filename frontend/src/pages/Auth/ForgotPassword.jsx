import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import authService from '@services/authService';
import './Login.css';

/**
 * Forgot Password Page Component
 * Allows users to request password reset
 */
const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to receive a password reset link</p>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              If that email exists, a reset link has been sent. Please check your email.
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="your.email@example.com"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

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

export default ForgotPassword;










