import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './CountryCard.css';

/**
 * CountryCard Component
 * Displays a country card with flag, name, region, and demand badge
 * 
 * @param {Object} props - Component props
 * @param {Object} props.country - Country data object
 * @param {string} props.language - Current language (en/bn)
 * @param {function} props.onClick - Optional custom click handler
 */
const CountryCard = ({ country, language = 'en', onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(country);
    } else {
      navigate(`/country-guides/${encodeURIComponent(country.country)}`);
    }
  };

  const formatJobType = (jobType) => {
    return jobType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDemandBadge = () => {
    const jobCount = country.salaryRanges?.length || 0;
    if (jobCount >= 5) return { level: 'high', label: 'High Demand', color: 'green' };
    if (jobCount >= 3) return { level: 'medium', label: 'Medium Demand', color: 'yellow' };
    return { level: 'low', label: 'Low Demand', color: 'gray' };
  };

  const demand = getDemandBadge();

  return (
    <div className="country-card" onClick={handleClick} role="button" tabIndex={0}>
      <div className="country-card-header">
        <span className="country-flag">{country.flagEmoji || '🏳️'}</span>
        <div className="country-info">
          <h3 className="country-name">{country.country}</h3>
          <p className="country-region">{country.region}</p>
        </div>
        <span className={`demand-badge demand-${demand.color}`}>
          {demand.label}
        </span>
      </div>

      <div className="country-card-content">
        {country.overview?.[language] && (
          <p className="country-overview">
            {country.overview[language].substring(0, 120)}...
          </p>
        )}

        {country.salaryRanges && country.salaryRanges.length > 0 && (
          <div className="job-types-preview">
            <span className="job-count">
              💼 {country.salaryRanges.length} job types
            </span>
            <div className="job-tags">
              {country.salaryRanges.slice(0, 3).map((range, idx) => (
                <span key={idx} className="job-tag">
                  {range.title?.[language] || formatJobType(range.jobType)}
                </span>
              ))}
              {country.salaryRanges.length > 3 && (
                <span className="job-tag more">+{country.salaryRanges.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="country-card-footer">
        <span className="view-count">
          👁️ {country.viewCount?.toLocaleString() || 0} views
        </span>
        <span className="view-link">View Details →</span>
      </div>
    </div>
  );
};

CountryCard.propTypes = {
  country: PropTypes.shape({
    _id: PropTypes.string,
    country: PropTypes.string.isRequired,
    countryCode: PropTypes.string,
    flagEmoji: PropTypes.string,
    region: PropTypes.string,
    overview: PropTypes.object,
    salaryRanges: PropTypes.array,
    viewCount: PropTypes.number,
  }).isRequired,
  language: PropTypes.string,
  onClick: PropTypes.func,
};

export default CountryCard;
