import React, { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { useLanguage } from '@context/LanguageContext';
import userService from '@services/userService';
import './UserProfile.css';

/**
 * UserProfile Page Component
 * User profile management
 */
const UserProfile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const profileData = await userService.getProfile();
      setProfile(profileData);
      setFormData(profileData);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const keys = name.split('.');
      let updated = { ...formData };
      let current = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      setFormData(updated);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await userService.updateProfile(formData);
      setProfile(updatedProfile);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setError('');
  };

  if (loading && !profile) {
    return <div className="loading-page">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error-page">Failed to load profile</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-content">
          {/* Profile Overview */}
          <div className="profile-sidebar">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="avatar-img" />
                ) : (
                  <>
                    {profile.fullName.firstName[0]}
                    {profile.fullName.lastName[0]}
                  </>
                )}
                {/* Overlay for "Add Option" */}
                <div className="avatar-overlay" onClick={() => alert('Profile picture upload coming soon!')}>
                  <span>📷</span>
                </div>
              </div>
              <h2>
                {profile.fullName.firstName} {profile.fullName.lastName}
              </h2>
              <p className="role-badge">{profile.role.replace('_', ' ')}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value ${profile.role === 'worker_abroad' ? 'verified' : 'pending-status'}`}
                    style={{ color: profile.role === 'worker_abroad' ? '#38a169' : '#dd6b20' }}>
                    {profile.role === 'worker_abroad' ? 'Migrated' : 'Going to migrate'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-main">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <section className="form-section">
                <h3>Personal Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="fullName.firstName"
                        value={formData.fullName?.firstName || ''}
                        onChange={handleChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">{profile.fullName.firstName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="fullName.lastName"
                        value={formData.fullName?.lastName || ''}
                        onChange={handleChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">{profile.fullName.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    {editing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth?.split('T')[0] || ''}
                        onChange={handleChange}
                        className="form-input"
                      />
                    ) : (
                      <p className="form-value">
                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    {editing ? (
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="form-value">{profile.gender}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="form-section">
                <h3>Contact Information</h3>

                <div className="form-group">
                  <label>Email</label>
                  <p className="form-value">{profile.email}</p>
                  <small className="form-hint">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="form-value">{profile.phoneNumber}</p>
                  )}
                </div>
              </section>

              {/* Location */}
              <section className="form-section">
                <h3>Location</h3>

                <div className="form-group">
                  <label>Home Address (Bangladesh)</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location.bangladeshAddress.detailedAddress"
                      value={formData.location?.bangladeshAddress?.detailedAddress || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Village, House No, etc."
                    />
                  ) : (
                    <p className="form-value">
                      {profile.location?.bangladeshAddress?.detailedAddress || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Current Address (Abroad/Local)</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location.currentLocation.address"
                      value={formData.location?.currentLocation?.address || ''}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Current residence address"
                    />
                  ) : (
                    <p className="form-value">
                      {profile.location?.currentLocation?.address || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>District</label>
                  {editing ? (
                    <input
                      type="text"
                      name="location.bangladeshAddress.district"
                      value={
                        formData.location?.bangladeshAddress?.district || ''
                      }
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="form-value">
                      {profile.location?.bangladeshAddress?.district || 'Not specified'}
                    </p>
                  )}
                </div>
              </section>

              {/* Action Buttons */}
              {editing && (
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
