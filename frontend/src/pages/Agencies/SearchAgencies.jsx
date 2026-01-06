import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RatingModal from '../../components/RatingModal';
import './SearchAgencies.css';

/**
 * Search Verified Recruitment Agencies Page
 */

const SearchAgencies = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
 

  // State management
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);

  // Fetch agencies from API
  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/agencies`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch agencies');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAgencies(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load agencies');
      }
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError(err.message);
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter agencies based on search and filters
  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch = searchTerm === '' || 
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agency.license?.number && agency.license.number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !selectedLocation || 
      (agency.destinationCountries && agency.destinationCountries.includes(selectedLocation));
    
    const matchesRating = !selectedRating || 
      (agency.rating?.average && agency.rating.average >= parseFloat(selectedRating));
    
    const matchesVerified = !showVerifiedOnly || agency.isVerified;

    return matchesSearch && matchesLocation && matchesRating && matchesVerified;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedRating('');
    setShowVerifiedOnly(false);
  };

  const handleOpenRatingModal = (agency) => {
    console.log('Auth check:', { isAuthenticated, user, hasToken: !!localStorage.getItem('authToken') });
    
    if (!isAuthenticated || !user) {
      alert('Please login to rate this agency');
      return;
    }
    setSelectedAgency(agency);
    setShowRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedAgency(null);
  };

  const handleViewDetails = (agencyId) => {
    console.log('Navigating to agency details:', agencyId);
    console.log('URL will be:', `/agencies/${agencyId}`);
    navigate(`/agencies/${agencyId}`);
  };


  const handleRatingSubmit = (reviewData) => {
    // Refresh agencies to show updated rating
    fetchAgencies();
  };

  return (
    <div className="search-agencies-page">
      {/* Modern Hero Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-badge">
            <span className="badge-icon">🏢</span>
            <span className="badge-text">Trusted Recruitment Partners</span>
          </div>
          <h1 className="header-title">
            Find Your Perfect <span className="gradient-text">Recruitment Agency</span>
          </h1>
          <p className="header-subtitle">
            Discover verified agencies with transparent fees, excellent track records, and trusted credentials
          </p>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-number">{agencies.length}</div>
              <div className="stat-label">Active Agencies</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{agencies.filter(a => a.isVerified).length}</div>
              <div className="stat-label">Verified</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">4.5+</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="search-filters-container">
        {/* Search Bar */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder={t('agencies.searchPlaceholder') || 'Search by agency name or license number...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search agencies"
            />
            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            {/* Location Filter */}
            <div className="filter-item">
              <label htmlFor="location-filter" className="filter-label">
                <span className="filter-icon">📍</span>
                {t('agencies.filterByCountry') || 'Destination Country'}
              </label>
              <select
                id="location-filter"
                className="filter-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">{t('agencies.allCountries') || 'All Countries'}</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="UAE">UAE</option>
                <option value="Qatar">Qatar</option>
                <option value="Oman">Oman</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="filter-item">
              <label htmlFor="rating-filter" className="filter-label">
                <span className="filter-icon">⭐</span>
                {t('agencies.rating') || 'Minimum Rating'}
              </label>
              <select
                id="rating-filter"
                className="filter-select"
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            {/* Verified Only Filter */}
            <div className="filter-item filter-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                />
                <span className="checkbox-text">
                  <span className="verified-icon">✓</span>
                  {t('agencies.verified') || 'Verified Only'}
                </span>
              </label>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedLocation || selectedRating || showVerifiedOnly) && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading agencies...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Agencies</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchAgencies}>
              Retry
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Results Count */}
            <div className="results-header">
              <p className="results-count">
                {filteredAgencies.length === 0 ? (
                  'No agencies found'
                ) : (
                  <>
                    Showing <strong>{filteredAgencies.length}</strong> {filteredAgencies.length === 1 ? 'agency' : 'agencies'}
                  </>
                )}
              </p>
            </div>

            {/* Empty State */}
            {filteredAgencies.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3 className="empty-state-title">No agencies found</h3>
                <p className="empty-state-message">
                  {searchTerm || selectedLocation || selectedRating || showVerifiedOnly ? (
                    <>
                      Try adjusting your search or filters to find what you're looking for.
                      <br />
                      <button className="btn-link" onClick={handleClearFilters}>
                        Clear all filters
                      </button>
                    </>
                  ) : agencies.length === 0 ? (
                    'No agencies registered yet. Be the first to join our platform!'
                  ) : (
                    'Start by searching for agencies or applying filters above.'
                  )}
                </p>
              </div>
            )}

            {/* Agency Cards Grid */}
            {filteredAgencies.length > 0 && (
              <div className="agencies-grid">
                {filteredAgencies.map((agency) => (
                  <div key={agency._id} className="agency-card">
                    {/* Verification Badge Corner */}
                    {agency.isVerified && (
                      <div className="corner-badge">
                        <svg width="60" height="60" className="corner-svg">
                          <polygon points="0,0 60,0 60,60" className="corner-triangle"/>
                        </svg>
                        <span className="corner-icon">✓</span>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="card-top">
                      <div className="agency-header">
                        <div className="agency-avatar">
                          {agency.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="agency-title">
                          <h3 className="agency-name">{agency.name}</h3>
                          <p className="agency-license">
                            <span className="license-badge">📜</span>
                            {agency.license?.number || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <p className="agency-description">{agency.description || 'Professional recruitment agency providing quality services.'}</p>

                      {/* Quick Info Tags */}
                      <div className="info-tags">
                        <div className="info-tag location-tag">
                          <span className="tag-icon">📍</span>
                          <span>{agency.location?.city || 'N/A'}</span>
                        </div>
                        <div className="info-tag rating-tag">
                          <span className="tag-icon">⭐</span>
                          <span>{agency.rating?.average ? agency.rating.average.toFixed(1) : '0.0'}</span>
                        </div>
                        {agency.rating?.count > 0 && (
                          <div className="info-tag reviews-tag">
                            <span className="tag-icon">💬</span>
                            <span>{agency.rating.count} reviews</span>
                          </div>
                        )}
                      </div>

                      {/* Destination Countries */}
                      {agency.destinationCountries && agency.destinationCountries.length > 0 && (
                        <div className="destinations-section">
                          <h4 className="section-label">Destinations</h4>
                          <div className="destination-pills">
                            {agency.destinationCountries.slice(0, 3).map((country, idx) => (
                              <span key={idx} className="destination-pill">
                                🌍 {country}
                              </span>
                            ))}
                            {agency.destinationCountries.length > 3 && (
                              <span className="destination-pill more-pill">
                                +{agency.destinationCountries.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Specializations */}
                      {agency.specialization && agency.specialization.length > 0 && (
                        <div className="specialization-section">
                          <h4 className="section-label">Specializations</h4>
                          <div className="specialization-tags">
                            {agency.specialization.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="spec-tag">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="card-actions">
                        <button 
                          className="btn-rate-agency"
                          onClick={() => handleOpenRatingModal(agency)}
                        >
                          <span>⭐</span>
                          <span>Rate Agency</span>
                        </button>
                        <button 
                          className="btn-view-details"
                          onClick={() => handleViewDetails(agency._id)}
                        >
                          <span>View Details</span>
                          <span className="btn-arrow">→</span>
                        </button>
                      </div>
                    </div> 
                  </div> 
                ))}
              </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && selectedAgency && (
              <RatingModal
                agencyId={selectedAgency._id}
                agencyName={selectedAgency.name}
                onClose={handleCloseRatingModal}
                onSubmit={handleRatingSubmit}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchAgencies;