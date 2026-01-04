import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { useAuth } from '@context/AuthContext';
import agencyService from '@services/agencyService';
import { 
  StarRating, 
  ReviewCard, 
  RatingDistribution, 
  ReviewSubmissionForm 
} from '@components/Agency';
import './AgencyDetails.css';

/**
 * AgencyDetails Page Component
 * Detailed view of a single recruitment agency
 */
const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);

  useEffect(() => {
    fetchAgencyDetails();
  }, [id]);

  // Fetch reviews when tab changes to reviews or sort/page changes
  useEffect(() => {
    if (activeTab === 'reviews' && agency) {
      fetchReviews();
    }
  }, [activeTab, sortBy, reviewPage]);

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

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError('');

    try {
      const response = await agencyService.getAgencyReviews(id, {
        page: reviewPage,
        limit: 10,
        sort: sortBy === 'newest' ? '-createdAt' : sortBy === 'oldest' ? 'createdAt' : '-helpful'
      });
      setReviews(response.data?.reviews || response.reviews || []);
      setTotalReviewPages(response.data?.totalPages || response.totalPages || 1);
    } catch (err) {
      setReviewsError(err.message || 'Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    setSubmittingReview(true);
    setReviewSubmitError('');

    try {
      await agencyService.submitReview(id, reviewData);
      setShowReviewForm(false);
      // Refresh reviews and agency to update rating
      fetchReviews();
      fetchAgencyDetails();
    } catch (err) {
      setReviewSubmitError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await agencyService.markReviewHelpful(id, reviewId);
      fetchReviews();
    } catch (err) {
      console.error('Failed to mark review as helpful:', err);
    }
  };

  const handleReportReview = async (reviewId, reason, description) => {
    try {
      await agencyService.reportReview(id, reviewId, { reason, description });
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to report review:', err);
    }
  };

  // Calculate rating distribution from reviews or agency data
  const getRatingDistribution = () => {
    if (agency?.ratings?.distribution) {
      return agency.ratings.distribution;
    }
    // Fallback: calculate from reviews
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating]++;
      }
    });
    return dist;
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
              {/* Reviews Header */}
              <div className="reviews-header">
                <h2>{language === 'bn' ? 'ব্যবহারকারীর রিভিউ' : 'User Reviews'}</h2>
                {isAuthenticated ? (
                  <button 
                    className="btn btn-primary write-review-btn"
                    onClick={() => setShowReviewForm(true)}
                  >
                    {language === 'bn' ? '✍️ রিভিউ লিখুন' : '✍️ Write a Review'}
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary login-to-review-btn"
                    onClick={() => navigate('/login', { state: { from: `/agencies/${id}` } })}
                  >
                    {language === 'bn' ? '🔒 রিভিউ লিখতে লগইন করুন' : '🔒 Login to Write Review'}
                  </button>
                )}
              </div>

              {/* Reviews Summary with Distribution */}
              <div className="reviews-summary">
                <div className="rating-overview">
                  <div className="avg-rating-large">
                    <span className="rating-number">
                      {agency.ratings?.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <StarRating 
                      value={agency.ratings?.averageRating || 0} 
                      size="large" 
                      language={language}
                    />
                    <span className="rating-count">
                      {language === 'bn' 
                        ? `${agency.ratings?.totalReviews || 0} টি রিভিউ` 
                        : `${agency.ratings?.totalReviews || 0} reviews`
                      }
                    </span>
                  </div>
                </div>
                <div className="rating-distribution-wrapper">
                  <RatingDistribution 
                    distribution={getRatingDistribution()} 
                    totalReviews={agency.ratings?.totalReviews || 0}
                    language={language}
                  />
                </div>
              </div>

              {/* Sort Controls */}
              <div className="reviews-controls">
                <label htmlFor="review-sort">
                  {language === 'bn' ? 'সাজান:' : 'Sort by:'}
                </label>
                <select 
                  id="review-sort"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setReviewPage(1);
                  }}
                >
                  <option value="newest">{language === 'bn' ? 'নতুন প্রথমে' : 'Newest First'}</option>
                  <option value="oldest">{language === 'bn' ? 'পুরাতন প্রথমে' : 'Oldest First'}</option>
                  <option value="helpful">{language === 'bn' ? 'সবচেয়ে সহায়ক' : 'Most Helpful'}</option>
                </select>
              </div>

              {/* Reviews List */}
              <div className="reviews-list">
                {reviewsLoading ? (
                  <div className="reviews-loading">
                    <div className="spinner"></div>
                    <p>{language === 'bn' ? 'রিভিউ লোড হচ্ছে...' : 'Loading reviews...'}</p>
                  </div>
                ) : reviewsError ? (
                  <div className="reviews-error">
                    <p>{reviewsError}</p>
                    <button onClick={fetchReviews} className="btn btn-secondary">
                      {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                    </button>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="no-reviews">
                    <span className="no-reviews-icon">📝</span>
                    <h3>{language === 'bn' ? 'এখনো কোনো রিভিউ নেই' : 'No Reviews Yet'}</h3>
                    <p>
                      {language === 'bn' 
                        ? 'এই এজেন্সির প্রথম রিভিউ লিখুন!'
                        : 'Be the first to review this agency!'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review._id || review.id}
                        review={review}
                        onHelpful={() => handleMarkHelpful(review._id || review.id)}
                        onReport={(reason, desc) => handleReportReview(review._id || review.id, reason, desc)}
                        isAuthenticated={isAuthenticated}
                        language={language}
                      />
                    ))}

                    {/* Pagination */}
                    {totalReviewPages > 1 && (
                      <div className="reviews-pagination">
                        <button
                          className="btn btn-secondary"
                          disabled={reviewPage <= 1}
                          onClick={() => setReviewPage(p => p - 1)}
                        >
                          {language === 'bn' ? '← পূর্ববর্তী' : '← Previous'}
                        </button>
                        <span className="page-info">
                          {language === 'bn' 
                            ? `পৃষ্ঠা ${reviewPage} / ${totalReviewPages}`
                            : `Page ${reviewPage} of ${totalReviewPages}`
                          }
                        </span>
                        <button
                          className="btn btn-secondary"
                          disabled={reviewPage >= totalReviewPages}
                          onClick={() => setReviewPage(p => p + 1)}
                        >
                          {language === 'bn' ? 'পরবর্তী →' : 'Next →'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Review Submission Form Modal */}
              {showReviewForm && (
                <ReviewSubmissionForm
                  agencyId={id}
                  agencyName={agency.agencyName}
                  onSubmit={handleSubmitReview}
                  onClose={() => {
                    setShowReviewForm(false);
                    setReviewSubmitError('');
                  }}
                  isSubmitting={submittingReview}
                  error={reviewSubmitError}
                  language={language}
                />
              )}
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
