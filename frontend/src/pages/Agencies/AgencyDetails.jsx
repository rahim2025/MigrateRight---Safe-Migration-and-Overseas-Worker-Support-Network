import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RatingModal from '../../components/RatingModal';
import './AgencyDetails.css';

/**
 * AgencyDetails Page Component
 * Modern UI detailed view of a single recruitment agency
 */
const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [successStories, setSuccessStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);

  // Fetch agency details
  useEffect(() => {
    fetchAgencyDetails();
  }, [id]);

  const fetchAgencyDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/agencies/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch agency details');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAgency(result.data);
        // Fetch success stories using the agency ID from the URL
        fetchSuccessStories(id);
        fetchFeeStructures(id);
        fetchTrainingRecords(id);
      } else {
        throw new Error(result.message || 'Failed to load agency details');
      }
    } catch (err) {
      console.error('Error fetching agency details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuccessStories = async (agencyId) => {
    try {
      setStoriesLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('Fetching success stories for agencyId:', agencyId);
      const url = `${API_URL}/agency-management/success-stories-by-agency/${agencyId}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success stories result:', result);
        if (result.success) {
          setSuccessStories(result.data || []);
        }
      } else {
        console.error('Failed to fetch success stories:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error fetching success stories:', err);
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchFeeStructures = async (agencyId) => {
    try {
      setFeesLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${API_URL}/agency-management/fee-structures-by-agency/${agencyId}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFeeStructures(result.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching fee structures:', err);
    } finally {
      setFeesLoading(false);
    }
  };

  const fetchTrainingRecords = async (agencyId) => {
    try {
      setTrainingsLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${API_URL}/agency-management/training-records-by-agency/${agencyId}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTrainingRecords(result.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching training records:', err);
    } finally {
      setTrainingsLoading(false);
    }
  };

  const handleRateAgency = () => {
    if (!isAuthenticated) {
      alert('Please login to rate this agency');
      return;
    }
    setShowRatingModal(true);
  };

  const handleRatingSubmit = () => {
    setShowRatingModal(false);
    fetchAgencyDetails(); // Refresh data
  };

  const handleExpressInterest = async () => {
    if (!isAuthenticated) {
      alert('Please login to express interest in this agency');
      navigate('/login');
      return;
    }

    // Check if user is an agency
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    
    if (user?.role === 'agency') {
      alert('Agencies cannot express interest in other agencies. Please login as a regular user.');
      return;
    }

    try {
      setInterestLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('authToken');
      
      console.log('Sending request with agencyId:', id, 'agencyName:', agency?.name);
      
      const response = await fetch(`${API_URL}/agency-management/interested`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agencyId: id,
          agencyName: agency.name
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsInterested(true);
        alert('✓ Interest expressed successfully! The agency will be notified.');
      } else {
        alert(result.message || 'Failed to express interest');
      }
    } catch (err) {
      console.error('Error expressing interest:', err);
      alert('Failed to express interest. Please try again.');
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="agency-details-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading agency details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agency-details-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/agencies')} className="btn-primary">
            <span>←</span> Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="agency-details-error">
        <div className="error-container">
          <div className="error-icon">🔍</div>
          <h2>Agency Not Found</h2>
          <p>The agency you're looking for doesn't exist or may have been removed.</p>
          <button onClick={() => navigate('/agencies')} className="btn-primary">
            <span>←</span> Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  const formatLocation = (location) => {
    if (typeof location === 'object') {
      return `${location.city || ''}, ${location.country || ''}`.replace(/^,\s*/, '') || 'Location not specified';
    }
    return location || 'Location not specified';
  };

  const formatAddress = (location) => {
    if (typeof location === 'object' && location) {
      const parts = [];
      if (location.address) parts.push(location.address);
      if (location.city) parts.push(location.city);
      if (location.district) parts.push(location.district);
      if (location.country) parts.push(location.country);
      return parts.join(', ') || 'Not provided';
    }
    return location || 'Not provided';
  };

  return (
    <div className="agency-details-page">
      {/* Hero Section */}
      <div className="agency-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <button onClick={() => navigate('/agencies')} className="back-button">
            <span>←</span> Back to Agencies
          </button>
          
          <div className="agency-hero-info">
            <div className="agency-avatar">
              {agency.logo ? (
                <img src={agency.logo} alt={agency.name} />
              ) : (
                <div className="avatar-placeholder">
                  {agency.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="agency-title-section">
              <h1 className="agency-name">{agency.name}</h1>
              <div className="agency-meta">
                <span className="location">
                  <span className="icon">📍</span>
                  {formatLocation(agency.location)}
                </span>
                <span className={`verification-badge ${agency.isVerified ? 'verified' : 'unverified'}`}>
                  <span className="badge-icon">
                    {agency.isVerified ? '✓' : '⚠'}
                  </span>
                  {agency.isVerified ? 'Verified Agency' : 'Unverified'}
                </span>
              </div>
              
              <div className="agency-rating-section">
                <div className="rating-display">
                  <div className="stars-large">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`star ${star <= (agency.rating?.average || 0) ? 'active' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="rating-text">
                    <span className="rating-score">
                      {agency.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                    <span className="rating-count">
                      ({agency.rating?.count || 0} reviews)
                    </span>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button 
                    onClick={handleExpressInterest} 
                    className={`interested-button ${isInterested ? 'interested-active' : ''}`}
                    disabled={interestLoading || isInterested}
                  >
                    {interestLoading ? (
                      <>
                        <span>⏳</span>
                        Processing...
                      </>
                    ) : isInterested ? (
                      <>
                        <span>✓</span>
                        Interest Sent
                      </>
                    ) : (
                      <>
                        <span>👍</span>
                        I'm Interested
                      </>
                    )}
                  </button>
                  
                  <button onClick={handleRateAgency} className="rate-button">
                    <span>⭐</span>
                    Rate This Agency
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
          <button 
            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
          <button 
            className={`tab ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => setActiveTab('stories')}
          >
            Success Stories
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="agency-content">
        <div className="content-container">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="content-grid">
                <div className="main-content">
                  <div className="info-card">
                    <h2>About This Agency</h2>
                    <p className="description">
                      {agency.description || 'No description provided for this agency.'}
                    </p>
                    {agency.establishedYear && (
                      <p><strong>Established:</strong> {agency.establishedYear}</p>
                    )}
                    {agency.totalPlacements > 0 && (
                      <p><strong>Total Placements:</strong> {agency.totalPlacements}</p>
                    )}
                  </div>
                  
                  <div className="info-card">
                    <h2>License Information</h2>
                    <p><strong>License Number:</strong> {agency.license?.number || 'Not available'}</p>
                    {agency.license?.issueDate && (
                      <p><strong>Issue Date:</strong> {new Date(agency.license.issueDate).toLocaleDateString()}</p>
                    )}
                    {agency.license?.expiryDate && (
                      <p><strong>Expiry Date:</strong> {new Date(agency.license.expiryDate).toLocaleDateString()}</p>
                    )}
                    <p><strong>Status:</strong> 
                      <span className={`status-badge ${agency.license?.isValid ? 'valid' : 'invalid'}`}>
                        {agency.license?.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="info-card">
                    <h2>Destination Countries</h2>
                    {agency.destinationCountries && agency.destinationCountries.length > 0 ? (
                      <div className="tags-container">
                        {agency.destinationCountries.map((country, index) => (
                          <span key={index} className="tag country-tag">
                            🌍 {country}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No destination countries specified.</p>
                    )}
                  </div>
                </div>
                
                <div className="sidebar-content">
                  <div className="stats-card">
                    <h3>Quick Stats</h3>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-value">{agency.rating?.count || 0}</div>
                        <div className="stat-label">Total Reviews</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{agency.rating?.average?.toFixed(1) || '0.0'}</div>
                        <div className="stat-label">Average Rating</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{agency.destinationCountries?.length || 0}</div>
                        <div className="stat-label">Countries</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{agency.specialization?.length || 0}</div>
                        <div className="stat-label">Specializations</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="tab-content">
              <div className="info-card">
                <h2>Contact Information</h2>
                <div className="contact-grid">
                  <div className="contact-item">
                    <div className="contact-icon">📧</div>
                    <div className="contact-info">
                      <div className="contact-label">Email</div>
                      <div className="contact-value">
                        <a href={`mailto:${agency.contact?.email}`}>{agency.contact?.email || 'Not provided'}</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">📞</div>
                    <div className="contact-info">
                      <div className="contact-label">Phone</div>
                      <div className="contact-value">
                        <a href={`tel:${agency.contact?.phone}`}>{agency.contact?.phone || 'Not provided'}</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <div className="contact-info">
                      <div className="contact-label">Address</div>
                      <div className="contact-value">{formatAddress(agency.location)}</div>
                    </div>
                  </div>
                  
                  {agency.contact?.website && (
                    <div className="contact-item">
                      <div className="contact-icon">🌐</div>
                      <div className="contact-info">
                        <div className="contact-label">Website</div>
                        <div className="contact-value">
                          <a href={agency.contact.website} target="_blank" rel="noopener noreferrer">
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="tab-content">
              {/* Fee Structures */}
              <div className="info-card">
                <h2>Fee Structure</h2>
                <p className="section-description">Transparent pricing for recruitment services</p>
                
                {feesLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading fee structures...</p>
                  </div>
                ) : feeStructures.length > 0 ? (
                  <div className="fee-list">
                    {feeStructures.map((fee) => (
                      <div key={fee._id} className="fee-item">
                        <div className="fee-header">
                          <h4>{fee.country} - {fee.serviceType}</h4>
                          <span className={`fee-badge ${fee.isLegal ? 'legal' : 'warning'}`}>
                            {fee.isLegal ? '✓ Within Legal Limits' : '⚠ Check Carefully'}
                          </span>
                        </div>
                        <div className="fee-amount">{fee.amount} BDT</div>
                        {fee.description && <p className="fee-description">{fee.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No fee structure information available.</p>
                )}
              </div>

              {/* Training Records */}
              <div className="info-card">
                <h2>Training Programs</h2>
                <p className="section-description">Pre-departure training programs offered by this agency</p>
                
                {trainingsLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading training records...</p>
                  </div>
                ) : trainingRecords.length > 0 ? (
                  <div className="training-list">
                    {trainingRecords.map((training) => (
                      <div key={training._id} className="training-item">
                        <h4 className="training-name">{training.programName}</h4>
                        <p className="training-description">{training.description}</p>
                        <div className="training-details">
                          {training.duration && (
                            <div className="training-detail">
                              <span className="detail-icon">⏱️</span>
                              <span>{training.duration}</span>
                            </div>
                          )}
                          {training.location && (
                            <div className="training-detail">
                              <span className="detail-icon">📍</span>
                              <span>{training.location}</span>
                            </div>
                          )}
                          {training.scheduleDate && (
                            <div className="training-detail">
                              <span className="detail-icon">📅</span>
                              <span>{new Date(training.scheduleDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {training.capacity && (
                            <div className="training-detail">
                              <span className="detail-icon">👥</span>
                              <span>{training.capacity} participants</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No training programs available.</p>
                )}
              </div>
            </div>
          )}

          {/* Success Stories Tab */}
          {activeTab === 'stories' && (
            <div className="tab-content">
              <div className="info-card">
                <h2>Success Stories</h2>
                <p className="section-description">Real experiences from workers placed by this agency</p>
                
                {storiesLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading success stories...</p>
                  </div>
                ) : successStories.length > 0 ? (
                  <div className="stories-grid">
                    {successStories.map((story) => (
                      <div key={story._id} className="story-card">
                        {story.imageUrl && (
                          <div className="story-image">
                            <img src={story.imageUrl} alt={story.title} />
                          </div>
                        )}
                        <div className="story-content">
                          <h3 className="story-title">{story.title}</h3>
                          <p className="story-text">{story.content}</p>
                          <div className="story-meta">
                            {story.workerName && (
                              <div className="story-meta-item">
                                <span className="meta-icon">👤</span>
                                <span className="meta-text">{story.workerName}</span>
                              </div>
                            )}
                            {story.destinationCountry && (
                              <div className="story-meta-item">
                                <span className="meta-icon">🌍</span>
                                <span className="meta-text">{story.destinationCountry}</span>
                              </div>
                            )}
                            <div className="story-meta-item">
                              <span className="meta-icon">📅</span>
                              <span className="meta-text">
                                {new Date(story.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📖</div>
                    <h3>No Success Stories Yet</h3>
                    <p>This agency hasn't shared any success stories yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="tab-content">
              <div className="reviews-section">
                <div className="reviews-header">
                  <h2>Reviews & Ratings</h2>
                  <button onClick={handleRateAgency} className="btn-secondary">
                    Write a Review
                  </button>
                </div>
                
                {agency.rating && agency.rating.count > 0 ? (
                  <div className="reviews-overview">
                    <div className="rating-breakdown">
                      <div className="overall-rating">
                        <div className="rating-score-large">
                          {agency.rating.average?.toFixed(1) || '0.0'}
                        </div>
                        <div className="stars-container">
                          <div className="stars-large">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star} 
                                className={`star ${star <= (agency.rating?.average || 0) ? 'active' : ''}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <div className="total-reviews">
                            Based on {agency.rating.count} reviews
                          </div>
                        </div>
                      </div>
                      
                      {agency.rating.breakdown && (
                        <div className="breakdown-details">
                          {Object.entries(agency.rating.breakdown).map(([category, value]) => (
                            <div key={category} className="breakdown-row">
                              <div className="category-name">
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </div>
                              <div className="category-rating">
                                <div className="stars-small">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span 
                                      key={star} 
                                      className={`star ${star <= value ? 'active' : ''}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="category-score">{value?.toFixed(1)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-reviews">
                    <div className="no-reviews-icon">💭</div>
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to share your experience with this agency!</p>
                    <button onClick={handleRateAgency} className="btn-primary">
                      Write First Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          agencyId={id}
          agencyName={agency.name}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default AgencyDetails;
