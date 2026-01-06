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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAgencyPassword, setShowAgencyPassword] = useState(false);
  const [showAgencyConfirmPassword, setShowAgencyConfirmPassword] = useState(false);

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

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName];
  };

  const getInputClassName = (fieldName) => {
    return fieldErrors[fieldName] ? 'form-input error' : 'form-input';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    setSuccess('');

    try {
      if (registrationType === 'agency') {
        // Validate passwords match for agency
        console.log('Agency Frontend validation - Password:', agencyFormData.password);
        console.log('Agency Frontend validation - Confirm Password:', agencyFormData.confirmPassword);
        console.log('Agency Frontend validation - Passwords match:', agencyFormData.password === agencyFormData.confirmPassword);
        
        if (agencyFormData.password !== agencyFormData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Client-side validation for agency
        const requiredFields = ['email', 'password', 'companyName', 'tradeLicenseNumber', 'tinNumber', 'contactPersonName', 'businessAddress', 'phoneNumber'];
        const missingFields = requiredFields.filter(field => !agencyFormData[field]?.trim());
        
        if (missingFields.length > 0) {
          setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }

        // Prepare agency data for API
        // Keep confirmPassword for backend validation, it will be removed in the controller
        const registrationData = { ...agencyFormData };
        
        console.log('Sending agency registration data:', registrationData);

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
          console.log('API Error Response:', data);
          // Handle validation errors
          if (data.errors && Array.isArray(data.errors)) {
            console.log('Processing validation errors:', data.errors);
            const fieldErrorMap = {};
            const errorMessages = [];
            
            data.errors.forEach(error => {
              console.log('Processing error:', error);
              if (error.field || error.param) {
                const fieldName = error.field || error.param;
                fieldErrorMap[fieldName] = error.message || error.msg;
              }
              errorMessages.push(error.message || error.msg || 'Unknown error');
            });
            
            setFieldErrors(fieldErrorMap);
            setError(`Please correct the following errors: ${errorMessages.join(', ')}`);
          }
          throw new Error(data.message || 'Agency registration failed');
        }

        setSuccess('Agency registration successful! Please check your email to verify your account.');
        
        // Store tokens
        if (data.data?.token) {
          localStorage.setItem('authToken', data.data.token);
        }
        if (data.data?.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        // Redirect to agency dashboard after a short delay
        setTimeout(() => {
          navigate('/agency-dashboard');
        }, 2000);
      } else {
        // Validate passwords match for user
        console.log('Frontend validation - Password:', formData.password);
        console.log('Frontend validation - Confirm Password:', formData.confirmPassword);
        console.log('Frontend validation - Passwords match:', formData.password === formData.confirmPassword);
        
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Client-side validation for user
        const requiredFields = {
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          'fullName.firstName': formData.fullName?.firstName,
          'fullName.lastName': formData.fullName?.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          'location.bangladeshAddress.district': formData.location?.bangladeshAddress?.district,
        };
        
        console.log('Checking required fields:', requiredFields);
        
        const missingFields = Object.entries(requiredFields)
          .filter(([key, value]) => !value?.toString().trim())
          .map(([key]) => key);
        
        console.log('Missing fields:', missingFields);
        
        if (missingFields.length > 0) {
          setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }

        // Prepare user data for API
        // Keep confirmPassword for backend validation, it will be removed in the controller
        const registrationData = { ...formData };
        
        console.log('Sending registration data:', registrationData);

        const response = await register(registrationData);
        setSuccess('Registration successful! Please check your email to verify your account.');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different types of errors
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const fieldErrorMap = {};
        const errorMessages = [];
        
        err.errors.forEach(error => {
          console.log('Processing error:', error);
          if (error.field || error.param) {
            const fieldName = error.field || error.param;
            fieldErrorMap[fieldName] = error.message || error.msg;
          }
          errorMessages.push(error.message || error.msg || 'Unknown error');
        });
        
        setFieldErrors(fieldErrorMap);
        
        if (Object.keys(fieldErrorMap).length > 0) {
          setError(`Please correct the following errors: ${errorMessages.join(', ')}`);
        } else {
          setError(`Validation errors: ${errorMessages.join(', ')}`);
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
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
          {success && <div className="success-message" style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            border: '1px solid #c3e6cb', 
            padding: '0.75rem', 
            marginBottom: '1rem', 
            borderRadius: '4px' 
          }}>{success}</div>}
          
          {/* Debug: Show field errors if any exist */}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="debug-errors" style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <strong>Field Validation Errors:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                {Object.entries(fieldErrors).map(([field, message]) => (
                  <li key={field}><strong>{field}:</strong> {message}</li>
                ))}
              </ul>
            </div>
          )}

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
                    className={getInputClassName('fullName.firstName')}
                  />
                  {getFieldError('fullName.firstName') && <div className="field-error" style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>{getFieldError('fullName.firstName')}</div>}
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
                    className={getInputClassName('fullName.lastName')}
                  />
                  {getFieldError('fullName.lastName') && <div className="field-error" style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>{getFieldError('fullName.lastName')}</div>}
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
                  className={getInputClassName('email')}
                />
                {getFieldError('email') && <div className="field-error" style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>{getFieldError('email')}</div>}
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
                  className={getInputClassName('phoneNumber')}
                />
                {getFieldError('phoneNumber') && <div className="field-error" style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>{getFieldError('phoneNumber')}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className={getInputClassName('password')}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#666'
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {getFieldError('password') && <div className="field-error" style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>{getFieldError('password')}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className={getInputClassName('confirmPassword')}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#666'
                      }}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {getFieldError('confirmPassword') && <div className="field-error" style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem'}}>{getFieldError('confirmPassword')}</div>}
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
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAgencyPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={agencyFormData.password}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAgencyPassword(!showAgencyPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#666'
                      }}
                    >
                      {showAgencyPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAgencyConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={agencyFormData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="8"
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAgencyConfirmPassword(!showAgencyConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#666'
                      }}
                    >
                      {showAgencyConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
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
