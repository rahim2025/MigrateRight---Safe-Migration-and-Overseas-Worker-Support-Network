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

  const formatAddress = (address) => {
    if (typeof address === 'object') {
      return `${address.address || ''}, ${address.city || ''}, ${address.district || ''}, ${address.country || ''}`
        .replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '') || 'Not provided';
    }
    return address || 'Not provided';
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
                <span className={`verification-badge ${agency.verificationStatus?.toLowerCase() || 'unverified'}`}>
                  <span className="badge-icon">
                    {agency.verificationStatus === 'verified' ? '✓' : '⚠'}
                  </span>
                  {agency.verificationStatus === 'verified' ? 'Verified Agency' : 'Unverified'}
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
                
                <button onClick={handleRateAgency} className="rate-button">
                  <span>⭐</span>
                  Rate This Agency
                </button>
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
                  </div>
                  
                  <div className="info-card">
                    <h2>Destination Countries</h2>
                    {agency.countries && agency.countries.length > 0 ? (
                      <div className="tags-container">
                        {agency.countries.map((country, index) => (
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
                        <div className="stat-value">{agency.countries?.length || 0}</div>
                        <div className="stat-label">Countries</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{agency.services?.length || 0}</div>
                        <div className="stat-label">Services</div>
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
                        <a href={`mailto:${agency.email}`}>{agency.email || 'Not provided'}</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">📞</div>
                    <div className="contact-info">
                      <div className="contact-label">Phone</div>
                      <div className="contact-value">
                        <a href={`tel:${agency.phone}`}>{agency.phone || 'Not provided'}</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <div className="contact-info">
                      <div className="contact-label">Address</div>
                      <div className="contact-value">{formatAddress(agency.address)}</div>
                    </div>
                  </div>
                  
                  {agency.website && (
                    <div className="contact-item">
                      <div className="contact-icon">🌐</div>
                      <div className="contact-info">
                        <div className="contact-label">Website</div>
                        <div className="contact-value">
                          <a href={agency.website} target="_blank" rel="noopener noreferrer">
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
              <div className="info-card">
                <h2>Services Offered</h2>
                {agency.services && agency.services.length > 0 ? (
                  <div className="services-grid">
                    {agency.services.map((service, index) => (
                      <div key={index} className="service-item">
                        <div className="service-icon">🔧</div>
                        <div className="service-name">{service}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No services information available.</p>
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
