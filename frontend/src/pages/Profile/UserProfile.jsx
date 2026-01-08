import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});
  const [familySearch, setFamilySearch] = useState('');
  const [familyResults, setFamilyResults] = useState([]);
  const [searchingFamily, setSearchingFamily] = useState(false);
  const [familySearchError, setFamilySearchError] = useState('');

  const buildUpdatePayload = (data) => {
    const allowed = [
      'fullName',
      'phoneNumber',
      'dateOfBirth',
      'gender',
      'location',
      'profilePicture',
      'language',
      'notifications',
      'migrationStatus',
      'familyMembers',
    ];
    return allowed.reduce((payload, key) => {
      if (data[key] !== undefined) {
        payload[key] = data[key];
      }
      return payload;
    }, {});
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const profileData = await userService.getProfile();
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || { firstName: '', lastName: '' },
        phoneNumber: profileData.phoneNumber || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender || '',
        location: profileData.location || {},
        profilePicture: profileData.profilePicture || '',
        language: profileData.language || 'bn',
        notifications: profileData.notifications || {},
        migrationStatus: profileData.migrationStatus || '',
        familyMembers: profileData.familyMembers || [],
      });
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
      const payload = buildUpdatePayload(formData);
      const updatedProfile = await userService.updateProfile(payload);
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
    setFormData({
      ...profile,
      familyMembers: profile.familyMembers || [],
    });
    setEditing(false);
    setError('');
  };

  const handleAddFamilyMember = (userId) => {
    // Add selected user from search results
    const found = familyResults.find((u) => u._id === (userId || familySearch));
    if (!found) return;

    const exists = (formData.familyMembers || []).some((m) => m.user?.toString() === found._id);
    if (exists) {
      setFamilySearchError('User already added as family contact');
      return;
    }

    const next = formData.familyMembers ? [...formData.familyMembers] : [];
    next.push({
      user: found._id,
      name: found.fullNameString || `${found.fullName?.firstName || ''} ${found.fullName?.lastName || ''}`.trim(),
      relationship: '',
      phone: found.phoneNumber,
      email: found.email,
      notificationMethod: 'both',
    });
    setFormData({ ...formData, familyMembers: next });
    setFamilySearch('');
    setFamilyResults([]);
    setFamilySearchError('');
  };

  const handleFamilyChange = (index, field, value) => {
    const next = (formData.familyMembers || []).map((member, i) =>
      i === index ? { ...member, [field]: value } : member
    );
    setFormData({ ...formData, familyMembers: next });
  };

  const handleRemoveFamilyMember = (index) => {
    const next = (formData.familyMembers || []).filter((_, i) => i !== index);
    setFormData({ ...formData, familyMembers: next });
  };

  const handleSearchFamily = async (e) => {
    e.preventDefault();
    setFamilySearchError('');
    if (!familySearch.trim()) {
      setFamilyResults([]);
      return;
    }

    try {
      setSearchingFamily(true);
      const results = await userService.searchUsers(familySearch.trim());
      setFamilyResults(results || []);
    } catch (err) {
      setFamilySearchError(err.message || 'Failed to search users');
    } finally {
      setSearchingFamily(false);
    }
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
            {/* Agency Management Section - Only for agency users */}
            {user?.role === 'agency' && (
              <section className="agency-management-section">
                <div className="agency-banner">
                  <div className="agency-banner-content">
                    <div className="agency-icon">🏢</div>
                    <div className="agency-text">
                      <h2>Agency Account</h2>
                      <p>Manage your recruitment agency profile, services, and track your performance</p>
                    </div>
                  </div>
                  <button 
                    className="btn-agency-dashboard-large"
                    onClick={() => navigate('/agency-dashboard')}
                  >
                    <span className="btn-icon">⚙️</span>
                    <span className="btn-text">
                      <strong>Manage Agency Dashboard</strong>
                      <small>Company Info • Services • Workers • Analytics</small>
                    </span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
                
                <div className="agency-quick-links">
                  <h3>Quick Actions</h3>
                  <div className="quick-links-grid">
                    <button 
                      className="quick-link-card"
                      onClick={() => navigate('/agency-dashboard')}
                    >
                      <span className="card-icon">📋</span>
                      <span className="card-title">Company Info</span>
                      <span className="card-desc">Update business details</span>
                    </button>
                    <button 
                      className="quick-link-card"
                      onClick={() => navigate('/agency-dashboard')}
                    >
                      <span className="card-icon">⭐</span>
                      <span className="card-title">Success Stories</span>
                      <span className="card-desc">Share your achievements</span>
                    </button>
                    <button 
                      className="quick-link-card"
                      onClick={() => navigate('/agency-dashboard')}
                    >
                      <span className="card-icon">💰</span>
                      <span className="card-title">Fee Structure</span>
                      <span className="card-desc">Manage pricing</span>
                    </button>
                    <button 
                      className="quick-link-card"
                      onClick={() => navigate('/agency-dashboard')}
                    >
                      <span className="card-icon">👥</span>
                      <span className="card-title">Workers</span>
                      <span className="card-desc">View interested candidates</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Family Contacts for SOS */}
            <section className="form-section">
              <h3>Family Contacts (SOS Notifications)</h3>
              <p className="form-hint">Link existing site users so they can receive SOS alerts.</p>

              {editing && (
                <form className="family-search" onSubmit={handleSearchFamily}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Find user (email / phone / name)</label>
                      <input
                        type="text"
                        value={familySearch}
                        onChange={(e) => setFamilySearch(e.target.value)}
                        className="form-input"
                        placeholder="Type to search existing users"
                      />
                    </div>
                    <div className="form-group form-group-inline">
                      <label>&nbsp;</label>
                      <button type="submit" className="btn btn-secondary" disabled={searchingFamily}>
                        {searchingFamily ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>
                  {familySearchError && <div className="error-message">{familySearchError}</div>}
                  {familyResults.length > 0 && (
                    <div className="family-search-results">
                      {familyResults.map((u) => (
                        <div key={u._id} className="family-search-item">
                          <div>
                            <div className="family-name">{u.fullNameString || `${u.fullName?.firstName || ''} ${u.fullName?.lastName || ''}`.trim()}</div>
                            <div className="family-meta">
                              <span>{u.email}</span>
                              {u.phoneNumber && <span>• {u.phoneNumber}</span>}
                              <span>• Role: {u.role}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleAddFamilyMember(u._id)}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              )}

              {editing ? (
                <>
                  {(formData.familyMembers || []).map((member, index) => (
                    <div key={member.user || index} className="family-member-card">
                      <div className="family-name">{member.name}</div>
                      <div className="family-meta">
                        {member.email && <span>{member.email}</span>}
                        {member.phone && <span>• {member.phone}</span>}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Relationship</label>
                          <input
                            type="text"
                            value={member.relationship || ''}
                            onChange={(e) => handleFamilyChange(index, 'relationship', e.target.value)}
                            className="form-input"
                            placeholder="e.g., Mother, Brother"
                          />
                        </div>
                        <div className="form-group">
                          <label>Notification Method</label>
                          <select
                            value={member.notificationMethod || 'both'}
                            onChange={(e) => handleFamilyChange(index, 'notificationMethod', e.target.value)}
                            className="form-input"
                          >
                            <option value="both">Email & App</option>
                            <option value="email">Email</option>
                            <option value="app">App Only</option>
                          </select>
                        </div>
                        <div className="form-group form-group-inline">
                          <label>&nbsp;</label>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleRemoveFamilyMember(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="family-list">
                  {(profile.familyMembers || []).length === 0 && <p>No family contacts added yet.</p>}
                  {(profile.familyMembers || []).map((member, index) => (
                    <div key={index} className="family-member-view">
                      <div className="family-name">{member.name || 'Unnamed contact'}</div>
                      <div className="family-meta">
                        <span>{member.relationship || 'Relationship not set'}</span>
                        {member.phone && <span>• {member.phone}</span>}
                        {member.email && <span>• {member.email}</span>}
                        <span>• Prefers {member.notificationMethod || 'both'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

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
