import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import agencyManagementService from '@services/agencyManagementService';
import './AgencyProfile.css';

/**
 * Agency Profile Component
 * Public profile page showing agency information to users
 */
const AgencyProfile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [agency, setAgency] = useState(null);
  const [successStories, setSuccessStories] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('stories');

  useEffect(() => {
    loadAgencyProfile();
  }, [id]);

  const loadAgencyProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await agencyManagementService.getAgencyProfile(id);
      setAgency(response.data.agencyDetails);
      setSuccessStories(response.data.successStories || []);
      setFeeStructures(response.data.feeStructures || []);
      setTrainingRecords(response.data.trainingRecords || []);
    } catch (err) {
      setError(err.message || 'Failed to load agency profile');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!isAuthenticated) {
      alert('Please login to express interest');
      navigate('/login');
      return;
    }

    if (user?.role === 'agency') {
      alert('Agencies cannot express interest in other agencies');
      return;
    }

    try {
      await agencyManagementService.expressInterest(id);
      setSuccess('Interest expressed successfully! The agency will contact you soon.');
    } catch (err) {
      setError(err.message || 'Failed to express interest');
    }
  };

  if (loading) {
    return <div className="loading">Loading agency profile...</div>;
  }

  if (error && !agency) {
    return <div className="error-page">{error}</div>;
  }

  return (
    <div className="agency-profile-page">
      {/* Agency Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <h1>{agency?.companyName}</h1>
          {agency?.isVerified && <span className="verified-badge">✓ Verified Agency</span>}
          <div className="profile-info">
            <p><strong>Contact Person:</strong> {agency?.contactPersonName}</p>
            <p><strong>Phone:</strong> {agency?.phoneNumber}</p>
            <p><strong>Email:</strong> {agency?.userId?.email}</p>
            <p><strong>Address:</strong> {agency?.businessAddress}</p>
            <p><strong>License:</strong> {agency?.tradeLicenseNumber}</p>
          </div>
          <button onClick={handleExpressInterest} className="btn btn-primary btn-large">
            I'm Interested
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button
          className={activeTab === 'stories' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('stories')}
        >
          Success Stories ({successStories.length})
        </button>
        <button
          className={activeTab === 'fees' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('fees')}
        >
          Fee Structure ({feeStructures.length})
        </button>
        <button
          className={activeTab === 'training' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('training')}
        >
          Training Programs ({trainingRecords.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="profile-content">
        {/* Success Stories Tab */}
        {activeTab === 'stories' && (
          <div className="stories-section">
            <h2>Success Stories</h2>
            {successStories.length > 0 ? (
              <div className="stories-grid">
                {successStories.map((story) => (
                  <div key={story._id} className="story-card">
                    {story.imageUrl && (
                      <img src={story.imageUrl} alt={story.title} className="story-image" />
                    )}
                    <h3>{story.title}</h3>
                    <p className="story-content">{story.content}</p>
                    {story.workerName && (
                      <p className="story-meta"><strong>Worker:</strong> {story.workerName}</p>
                    )}
                    {story.destinationCountry && (
                      <p className="story-meta"><strong>Country:</strong> {story.destinationCountry}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No success stories available yet.</p>
            )}
          </div>
        )}

        {/* Fee Structure Tab */}
        {activeTab === 'fees' && (
          <div className="fees-section">
            <h2>Fee Structure</h2>
            {feeStructures.length > 0 ? (
              <div className="fees-table">
                <table>
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Service Type</th>
                      <th>Amount</th>
                      <th>Legal Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.map((fee) => (
                      <tr key={fee._id}>
                        <td>{fee.country}</td>
                        <td>{fee.serviceType}</td>
                        <td>{fee.amount} {fee.currency || 'BDT'}</td>
                        <td>
                          {fee.isLegal ? (
                            <span className="legal-badge">✅ Within Legal Limits</span>
                          ) : (
                            <span className="illegal-badge">⚠️ Review Required</span>
                          )}
                        </td>
                        <td>{fee.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No fee structure information available yet.</p>
            )}
          </div>
        )}

        {/* Training Programs Tab */}
        {activeTab === 'training' && (
          <div className="training-section">
            <h2>Training Programs</h2>
            {trainingRecords.length > 0 ? (
              <div className="training-grid">
                {trainingRecords.map((training) => (
                  <div key={training._id} className="training-card">
                    <h3>{training.programName}</h3>
                    <p className="training-description">{training.description}</p>
                    <div className="training-details">
                      {training.duration && (
                        <p><strong>Duration:</strong> {training.duration}</p>
                      )}
                      {training.scheduleDate && (
                        <p><strong>Date:</strong> {new Date(training.scheduleDate).toLocaleDateString()}</p>
                      )}
                      {training.location && (
                        <p><strong>Location:</strong> {training.location}</p>
                      )}
                      {training.capacity && (
                        <p><strong>Capacity:</strong> {training.capacity} participants</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No training programs available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyProfile;
