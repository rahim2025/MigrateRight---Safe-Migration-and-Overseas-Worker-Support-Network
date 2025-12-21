import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import agencyService from '@services/agencyService';
import './AgencyDetails.css';

/**
 * AgencyDetails Page Component
 * Detailed view of a single recruitment agency
 */
const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAgencyDetails();
  }, [id]);

  const fetchAgencyDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await agencyService.getAgencyById(id);
      setAgency(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load agency details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-page">Loading agency details...</div>;
  }

  if (error || !agency) {
    return (
      <div className="error-page">
        <h1>Agency Not Found</h1>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/agencies')}>
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="agency-details-page">
      {/* Header Section */}
      <div className="agency-header-section">
        <div className="container">
          <button className="back-btn" onClick={() => navigate('/agencies')}>
            ← Back to Search
          </button>

          <div className="agency-header-content">
            <div className="header-left">
              <h1>{agency.agencyName}</h1>
              {agency.isVerified && (
                <span className="verified-badge-lg">✓ Verified Agency</span>
              )}
              <div className="agency-meta">
                <span className="rating-display">
                  ⭐ {agency.ratings.averageRating.toFixed(1)} ({agency.ratings.totalReviews}{' '}
                  reviews)
                </span>
                <span className="separator">•</span>
                <span>License: {agency.bmtLicense.licenseNumber}</span>
              </div>
            </div>

            <div className="header-right">
              <button className="btn btn-primary btn-lg">Contact Agency</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <div className="container">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'fees' ? 'active' : ''}`}
            onClick={() => setActiveTab('fees')}
          >
            Fees
          </button>
          <button
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button
            className={`tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            Location
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <div className="container">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="info-grid">
                <div className="info-card">
                  <h3>Contact Information</h3>
                  <p>
                    <strong>Email:</strong> {agency.contactInfo.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {agency.contactInfo.phoneNumber}
                  </p>
                  {agency.contactInfo.website && (
                    <p>
                      <strong>Website:</strong>{' '}
                      <a href={agency.contactInfo.website} target="_blank" rel="noopener noreferrer">
                        {agency.contactInfo.website}
                      </a>
                    </p>
                  )}
                </div>

                <div className="info-card">
                  <h3>Destination Countries</h3>
                  <div className="countries-list">
                    {agency.destinationCountries.map((country) => (
                      <span key={country} className="country-badge">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="info-card">
                  <h3>License Information</h3>
                  <p>
                    <strong>License Number:</strong> {agency.bmtLicense.licenseNumber}
                  </p>
                  <p>
                    <strong>Issue Date:</strong>{' '}
                    {new Date(agency.bmtLicense.issueDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Expiry Date:</strong>{' '}
                    {new Date(agency.bmtLicense.expiryDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={`status-badge ${
                        new Date(agency.bmtLicense.expiryDate) > new Date()
                          ? 'valid'
                          : 'expired'
                      }`}
                    >
                      {new Date(agency.bmtLicense.expiryDate) > new Date()
                        ? 'Valid'
                        : 'Expired'}
                    </span>
                  </p>
                </div>

                <div className="info-card">
                  <h3>Trust Score</h3>
                  <div className="trust-score-display">
                    <div className="score-circle">
                      <span className="score-number">{agency.trustScore.toFixed(1)}</span>
                      <span className="score-label">/10</span>
                    </div>
                    <p>Based on ratings, compliance, and verification</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="fees-tab">
              <h2>Fee Structure</h2>
              <p className="fees-description">
                Transparent fee breakdown for different countries and job categories
              </p>

              <div className="fees-grid">
                {agency.feeStructure.map((fee, index) => (
                  <div key={index} className="fee-card">
                    <h4>
                      {fee.country} - {fee.jobCategory}
                    </h4>
                    <div className="fee-amount">
                      {fee.amount.toLocaleString()} {fee.currency}
                    </div>
                    {fee.isNegotiable && (
                      <span className="negotiable-badge">Negotiable</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <h2>User Reviews</h2>
              <div className="reviews-summary">
                <div className="rating-breakdown">
                  <div className="avg-rating">
                    <span className="rating-number">
                      {agency.ratings.averageRating.toFixed(1)}
                    </span>
                    <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                    <span className="rating-count">{agency.ratings.totalReviews} reviews</span>
                  </div>
                </div>
              </div>

              <p className="coming-soon">Detailed reviews coming soon...</p>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="location-tab">
              <h2>Office Locations</h2>

              <div className="location-card">
                <h3>Head Office</h3>
                <p>{agency.headOffice.address}</p>
                <p>
                  {agency.headOffice.city}, {agency.headOffice.district}
                </p>
                {agency.headOffice.coordinates && (
                  <p className="coordinates">
                    Coordinates: {agency.headOffice.coordinates.coordinates[1]},{' '}
                    {agency.headOffice.coordinates.coordinates[0]}
                  </p>
                )}
              </div>

              {agency.branchOffices && agency.branchOffices.length > 0 && (
                <div className="branches-section">
                  <h3>Branch Offices</h3>
                  <div className="branches-grid">
                    {agency.branchOffices.map((branch, index) => (
                      <div key={index} className="branch-card">
                        <h4>{branch.name}</h4>
                        <p>{branch.address}</p>
                        <p>
                          {branch.city}, {branch.district}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencyDetails;
