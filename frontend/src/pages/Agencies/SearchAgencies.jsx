import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SearchAgencies.css';

/**
 * Search Verified Recruitment Agencies Page
 * 
 * UI-only placeholder component with:
 * - Search input
 * - Location and rating filters
 * - Dummy agency cards
 * - Empty state handling
 * 
 * NOTE: Backend integration pending - currently uses dummy data
 */

// Dummy data for demonstration
const DUMMY_AGENCIES = [
  {
    id: 1,
    name: 'Global Workforce Solutions',
    license: 'BMT-2024-001',
    location: 'Dhaka',
    country: 'Saudi Arabia',
    rating: 4.5,
    reviews: 127,
    isVerified: true,
    specialization: ['Construction', 'Manufacturing'],
    description: 'Leading recruitment agency specializing in Middle East placements with 15+ years experience.',
  },
  {
    id: 2,
    name: 'United Migration Services',
    license: 'BMT-2024-002',
    location: 'Chittagong',
    country: 'UAE',
    rating: 4.8,
    reviews: 203,
    isVerified: true,
    specialization: ['Hospitality', 'Healthcare'],
    description: 'Trusted partner for UAE job placements with excellent track record.',
  },
  {
    id: 3,
    name: 'Eastern Manpower Agency',
    license: 'BMT-2024-003',
    location: 'Sylhet',
    country: 'Qatar',
    rating: 4.2,
    reviews: 89,
    isVerified: true,
    specialization: ['Engineering', 'Oil & Gas'],
    description: 'Specialized in technical placements for Qatar market.',
  },
  {
    id: 4,
    name: 'Pacific Employment Bureau',
    license: 'BMT-2024-004',
    location: 'Dhaka',
    country: 'Malaysia',
    rating: 4.0,
    reviews: 156,
    isVerified: false,
    specialization: ['Manufacturing', 'Agriculture'],
    description: 'Southeast Asia specialist with competitive rates.',
  },
  {
    id: 5,
    name: 'Reliable Overseas Services',
    license: 'BMT-2024-005',
    location: 'Dhaka',
    country: 'Oman',
    rating: 4.6,
    reviews: 142,
    isVerified: true,
    specialization: ['Construction', 'Security'],
    description: 'Well-established agency with transparent fee structure.',
  },
  {
    id: 6,
    name: 'Prime Recruitment International',
    license: 'BMT-2024-006',
    location: 'Khulna',
    country: 'UAE',
    rating: 4.3,
    reviews: 98,
    isVerified: true,
    specialization: ['Retail', 'Logistics'],
    description: 'Fast processing and reliable service for UAE opportunities.',
  },
];

const SearchAgencies = () => {
  const { t } = useTranslation();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Filter agencies based on search and filters
  const filteredAgencies = DUMMY_AGENCIES.filter((agency) => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.license.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !selectedLocation || agency.country === selectedLocation;
    
    const matchesRating = !selectedRating || agency.rating >= parseFloat(selectedRating);
    
    const matchesVerified = !showVerifiedOnly || agency.isVerified;

    return matchesSearch && matchesLocation && matchesRating && matchesVerified;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedRating('');
    setShowVerifiedOnly(false);
  };

  return (
    <div className="search-agencies-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>{t('agencies.title') || 'Search Verified Recruitment Agencies'}</h1>
        <p className="page-subtitle">
          Find trusted agencies with transparent fees and verified credentials
        </p>
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
              <div key={agency.id} className="agency-card">
                {/* Card Header */}
                <div className="agency-card-header">
                  <div className="agency-name-row">
                    <h3 className="agency-name">{agency.name}</h3>
                    {agency.isVerified && (
                      <span className="verified-badge" title="Verified Agency">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="agency-license">License: {agency.license}</p>
                </div>

                {/* Card Body */}
                <div className="agency-card-body">
                  <p className="agency-description">{agency.description}</p>

                  {/* Agency Details */}
                  <div className="agency-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">
                        <strong>Location:</strong> {agency.location}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">🌍</span>
                      <span className="detail-text">
                        <strong>Country:</strong> {agency.country}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">⭐</span>
                      <span className="detail-text">
                        <strong>Rating:</strong> {agency.rating.toFixed(1)} / 5.0
                        <span className="review-count">({agency.reviews} reviews)</span>
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">💼</span>
                      <span className="detail-text">
                        <strong>Specialization:</strong> {agency.specialization.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars Visualization */}
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${star <= agency.rating ? 'star-filled' : 'star-empty'}`}
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="agency-card-footer">
                  <button className="btn btn-primary btn-full-width">
                    View Details
                  </button>
                  <button className="btn btn-secondary btn-full-width">
                    <span className="bookmark-icon">⭐</span>
                    Save Agency
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placeholder Notice */}
      <div className="placeholder-notice">
        <p className="notice-icon">ℹ️</p>
        <p className="notice-text">
          <strong>Note:</strong> This is a UI placeholder with dummy data. 
          Backend integration is pending.
        </p>
      </div>
    </div>
  );
};

export default SearchAgencies;
