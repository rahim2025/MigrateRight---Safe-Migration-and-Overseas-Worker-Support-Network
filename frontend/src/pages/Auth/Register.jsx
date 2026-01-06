import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useLanguage } from '@context/LanguageContext';
import './Login.css'; // Shared styles

/**
 * Register Page Component
 * User and Agency registration page with type selector
 */
const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [registrationType, setRegistrationType] = useState('user'); // 'user' or 'agency'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'aspiring_migrant',
    fullName: {
      firstName: '',
      lastName: '',
    },
    dateOfBirth: '',
    gender: 'male',
    location: {
      bangladeshAddress: {
        district: '',
      },
    },
  });

  const [agencyFormData, setAgencyFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    tradeLicenseNumber: '',
    tinNumber: '',
    incomeLevel: '',
    businessAddress: '',
    contactPersonName: '',
    phoneNumber: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');

    if (registrationType === 'agency') {
      setAgencyFormData((prev) => ({ ...prev, [name]: value }));
      setError('');
      return;
    }

    setFormData((prev) => {
      if (keys.length === 1) {
        return { ...prev, [name]: value };
      }
      if (keys.length === 2) {
        const [parent, child] = keys;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent] || {}),
            [child]: value,
          },
        };
      }
      if (keys.length === 3) {
        const [parent, child, grandchild] = keys;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent] || {}),
            [child]: {
              ...(prev[parent]?.[child] || {}),
              [grandchild]: value,
            },
          },
        };
      }
      return prev;
    });

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (registrationType === 'agency') {
        // Validate passwords match for agency
        if (agencyFormData.password !== agencyFormData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Prepare agency data for API
        const { confirmPassword, ...registrationData } = agencyFormData;

        // Call agency registration endpoint
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register-agency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Agency registration failed');
        }

        // Store tokens
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
        }
        if (data.data?.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        // Redirect to agency dashboard
        navigate('/agency-dashboard');
      } else {
        // Validate passwords match for user
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Prepare user data for API
        const { confirmPassword, ...registrationData } = formData;

        await register(registrationData);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">{t('register')}</h1>
          <p className="auth-subtitle">Create your MigrateRight account</p>

          {error && <div className="error-message">{error}</div>}

          {/* Registration Type Selector */}
          <div className="registration-type-selector" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="registrationType"
                  value="user"
                  checked={registrationType === 'user'}
                  onChange={() => setRegistrationType('user')}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontWeight: registrationType === 'user' ? 'bold' : 'normal' }}>
                  Register as Worker
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="registrationType"
                  value="agency"
                  checked={registrationType === 'agency'}
                  onChange={() => setRegistrationType('agency')}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontWeight: registrationType === 'agency' ? 'bold' : 'normal' }}>
                  Register as Agency
                </span>
              </label>
            </div>
          </div>

          {/* User Registration Form */}
          {registrationType === 'user' && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName.firstName">First Name *</label>
                  <input
                    type="text"
                    id="fullName.firstName"
                    name="fullName.firstName"
                    value={formData.fullName?.firstName || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fullName.lastName">Last Name *</label>
                  <input
                    type="text"
                    id="fullName.lastName"
                    name="fullName.lastName"
                    value={formData.fullName?.lastName || ''}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="+8801712345678"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="form-input"
                  />
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
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location.bangladeshAddress.district">District (Home in Bangladesh) *</label>
                <input
                  type="text"
                  id="location.bangladeshAddress.district"
                  name="location.bangladeshAddress.district"
                  value={formData.location?.bangladeshAddress?.district || ''}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Dhaka"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="migrationStatus">Current Status *</label>
                <select
                  id="migrationStatus"
                  name="migrationStatus"
                  value={formData.migrationStatus || 'planning'}
                  onChange={(e) => {
                    const status = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      migrationStatus: status,
                      role: status === 'abroad' ? 'worker_abroad' : 'aspiring_migrant'
                    }));
                  }}
                  className="form-input"
                >
                  <option value="planning">I am in Bangladesh (Going to Migrate)</option>
                  <option value="abroad">I am Abroad (Already Migrated)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating account...' : t('register')}
              </button>
            </form>
          )}

          {/* Agency Registration Form */}
          {registrationType === 'agency' && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={agencyFormData.companyName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPersonName">Contact Person Name *</label>
                <input
                  type="text"
                  id="contactPersonName"
                  name="contactPersonName"
                  value={agencyFormData.contactPersonName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={agencyFormData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={agencyFormData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="+8801712345678"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={agencyFormData.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={agencyFormData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tradeLicenseNumber">Trade License Number *</label>
                  <input
                    type="text"
                    id="tradeLicenseNumber"
                    name="tradeLicenseNumber"
                    value={agencyFormData.tradeLicenseNumber}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tinNumber">TIN Number *</label>
                  <input
                    type="text"
                    id="tinNumber"
                    name="tinNumber"
                    value={agencyFormData.tinNumber}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="incomeLevel">Annual Revenue *</label>
                <input
                  type="text"
                  id="incomeLevel"
                  name="incomeLevel"
                  value={agencyFormData.incomeLevel}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 10-50 Lakhs"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessAddress">Business Address *</label>
                <textarea
                  id="businessAddress"
                  name="businessAddress"
                  value={agencyFormData.businessAddress}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating agency account...' : 'Register Agency'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="link-primary">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
