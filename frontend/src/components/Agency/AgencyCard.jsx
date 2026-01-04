import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import './AgencyCard.css';

/**
 * Agency Card Component
 * Displays agency information in a card format for search results
 */
const AgencyCard = ({ agency, language = 'en' }) => {
  const navigate = useNavigate();

  const translations = {
    en: {
      verified: 'Verified',
      licensed: 'Licensed',
      reviews: 'reviews',
      basedOn: 'Based on',
      viewDetails: 'View Details',
      readReviews: 'Read Reviews',
      goodStanding: 'Good Standing',
      warnings: 'Warnings',
      location: 'Location',
      license: 'License',
      specialization: 'Specialization'
    },
    bn: {
      verified: 'যাচাইকৃত',
      licensed: 'লাইসেন্সপ্রাপ্ত',
      reviews: 'রিভিউ',
      basedOn: 'ভিত্তিতে',
      viewDetails: 'বিস্তারিত দেখুন',
      readReviews: 'রিভিউ পড়ুন',
      goodStanding: 'ভাল অবস্থান',
      warnings: 'সতর্কতা',
      location: 'অবস্থান',
      license: 'লাইসেন্স',
      specialization: 'বিশেষত্ব'
    }
  };

  const txt = translations[language] || translations.en;

  const {
    _id,
    id,
    agencyName,
    name,
    location,
    headOffice,
    ratings = {},
    averageRating,
    totalReviews,
    isVerified = false,
    bmtLicense = {},
    license,
    complianceStatus = 'good',
    description,
    specialization = [],
    destinationCountries = []
  } = agency;

  const agencyId = _id || id;
  const displayName = agencyName || name;
  const displayLocation = headOffice?.city || location || 'N/A';
  const displayRating = ratings?.averageRating || averageRating || 0;
  const displayReviews = ratings?.totalReviews || totalReviews || 0;
  const displayLicense = bmtLicense?.licenseNumber || license || 'N/A';
  const displaySpecializations = specialization.length > 0 
    ? specialization 
    : destinationCountries;

  const handleViewDetails = () => {
    navigate(`/agencies/${agencyId}`);
  };

  const handleReadReviews = (e) => {
    e.stopPropagation();
    navigate(`/agencies/${agencyId}?tab=reviews`);
  };

  return (
    <div className="agency-card" onClick={handleViewDetails}>
      {/* Card Header */}
      <div className="agency-card-header">
        <div className="agency-name-row">
          <h3 className="agency-name">{displayName}</h3>
          <div className="badges-row">
            {isVerified && (
              <span className="badge badge-verified" title={txt.verified}>
                ✓ {txt.verified}
              </span>
            )}
            {displayLicense !== 'N/A' && (
              <span className="badge badge-licensed" title={txt.licensed}>
                📋 {txt.licensed}
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <p className="agency-location">
          <span className="location-icon">📍</span>
          {displayLocation}
        </p>
      </div>

      {/* Rating Section */}
      <div className="agency-rating-section">
        <StarRating value={displayRating} size="medium" editable={false} />
        <span className="rating-number">{displayRating.toFixed(1)}</span>
        <span className="review-count">
          ({txt.basedOn} {displayReviews} {txt.reviews})
        </span>
      </div>

      {/* Compliance Status */}
      <div className={`compliance-status status-${complianceStatus}`}>
        {complianceStatus === 'good' || complianceStatus === 'Good Standing' ? (
          <>
            <span className="status-icon">✓</span>
            <span className="status-text">{txt.goodStanding}</span>
          </>
        ) : (
          <>
            <span className="status-icon">⚠️</span>
            <span className="status-text">{txt.warnings}</span>
          </>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="agency-description">
          {description.length > 120 ? `${description.substring(0, 120)}...` : description}
        </p>
      )}

      {/* License Info */}
      <div className="agency-license">
        <span className="label">{txt.license}:</span>
        <span className="value">{displayLicense}</span>
      </div>

      {/* Specializations */}
      {displaySpecializations.length > 0 && (
        <div className="agency-specializations">
          {displaySpecializations.slice(0, 3).map((spec, idx) => (
            <span key={idx} className="spec-tag">{spec}</span>
          ))}
          {displaySpecializations.length > 3 && (
            <span className="spec-more">+{displaySpecializations.length - 3}</span>
          )}
        </div>
      )}

      {/* Card Actions */}
      <div className="agency-card-actions">
        <button 
          className="btn btn-primary"
          onClick={handleViewDetails}
        >
          {txt.viewDetails}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleReadReviews}
        >
          {txt.readReviews}
        </button>
      </div>
    </div>
  );
};

AgencyCard.propTypes = {
  agency: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    agencyName: PropTypes.string,
    name: PropTypes.string,
    location: PropTypes.string,
    headOffice: PropTypes.object,
    ratings: PropTypes.object,
    averageRating: PropTypes.number,
    totalReviews: PropTypes.number,
    isVerified: PropTypes.bool,
    bmtLicense: PropTypes.object,
    license: PropTypes.string,
    complianceStatus: PropTypes.string,
    description: PropTypes.string,
    specialization: PropTypes.array,
    destinationCountries: PropTypes.array
  }).isRequired,
  language: PropTypes.string
};

export default AgencyCard;
