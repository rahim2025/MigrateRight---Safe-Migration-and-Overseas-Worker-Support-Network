import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './RecommendationsPanel.css';

/**
 * Recommendations Panel Component
 * Shows recommended countries and agencies based on profile
 */
const RecommendationsPanel = ({
  countries = [],
  agencies = [],
  loading = false,
  error = null,
  onRetry,
  language = 'en'
}) => {
  const translations = {
    en: {
      title: 'Recommended for You',
      subtitle: 'Based on your profile, we suggest these destinations and agencies.',
      countriesTitle: 'Recommended Countries',
      agenciesTitle: 'Trusted Agencies',
      learnMore: 'Learn More',
      viewDetails: 'View Details',
      highDemand: 'High Demand',
      mediumDemand: 'Medium Demand',
      lowDemand: 'Low Demand',
      avgSalary: 'Avg. Salary',
      viewAll: 'View All',
      errorMessage: 'Unable to load recommendations',
      retry: 'Retry',
      noRecommendations: 'Complete your profile to get personalized recommendations'
    },
    bn: {
      title: 'আপনার জন্য সুপারিশ',
      subtitle: 'আপনার প্রোফাইলের উপর ভিত্তি করে, আমরা এই গন্তব্য এবং এজেন্সি সুপারিশ করছি।',
      countriesTitle: 'সুপারিশকৃত দেশ',
      agenciesTitle: 'বিশ্বস্ত এজেন্সি',
      learnMore: 'আরও জানুন',
      viewDetails: 'বিস্তারিত দেখুন',
      highDemand: 'উচ্চ চাহিদা',
      mediumDemand: 'মাঝারি চাহিদা',
      lowDemand: 'কম চাহিদা',
      avgSalary: 'গড় বেতন',
      viewAll: 'সব দেখুন',
      errorMessage: 'সুপারিশ লোড করতে অক্ষম',
      retry: 'আবার চেষ্টা করুন',
      noRecommendations: 'ব্যক্তিগতকৃত সুপারিশ পেতে আপনার প্রোফাইল সম্পূর্ণ করুন'
    }
  };

  const txt = translations[language] || translations.en;

  const getDemandLabel = (demand) => {
    if (demand === 'high') return txt.highDemand;
    if (demand === 'medium') return txt.mediumDemand;
    return txt.lowDemand;
  };

  const getDemandClass = (demand) => {
    if (demand === 'high') return 'demand-high';
    if (demand === 'medium') return 'demand-medium';
    return 'demand-low';
  };

  if (loading) {
    return (
      <div className="recommendations-panel dashboard-section">
        <div className="section-header">
          <h2 className="section-title">{txt.title}</h2>
        </div>
        <div className="recommendations-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="recommendation-card skeleton-card">
              <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
              <div className="skeleton skeleton-text" style={{ marginTop: '0.75rem' }}></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-panel dashboard-section">
        <div className="section-header">
          <h2 className="section-title">{txt.title}</h2>
        </div>
        <div className="section-error">
          <p>❌ {txt.errorMessage}</p>
          <button className="retry-btn" onClick={onRetry}>{txt.retry}</button>
        </div>
      </div>
    );
  }

  const hasRecommendations = countries.length > 0 || agencies.length > 0;

  return (
    <div className="recommendations-panel dashboard-section">
      <div className="section-header">
        <h2 className="section-title">{txt.title}</h2>
      </div>
      <p className="section-subtitle">{txt.subtitle}</p>

      {!hasRecommendations ? (
        <div className="no-recommendations">
          <span className="no-rec-icon">💡</span>
          <p>{txt.noRecommendations}</p>
          <Link to="/profile" className="complete-profile-btn">
            {language === 'bn' ? 'প্রোফাইল সম্পূর্ণ করুন' : 'Complete Profile'} →
          </Link>
        </div>
      ) : (
        <>
          {/* Recommended Countries */}
          {countries.length > 0 && (
            <div className="recommendation-section">
              <div className="rec-section-header">
                <h3 className="rec-section-title">{txt.countriesTitle}</h3>
                <Link to="/countries" className="section-link">{txt.viewAll} →</Link>
              </div>
              <div className="countries-grid">
                {countries.slice(0, 4).map(country => (
                  <Link 
                    key={country.id || country._id}
                    to={`/countries/${country.slug || country.id || country._id}`}
                    className="country-card"
                  >
                    <span className="country-flag">{country.flag || '🌍'}</span>
                    <div className="country-info">
                      <h4 className="country-name">{country.name}</h4>
                      <span className={`demand-badge ${getDemandClass(country.demand)}`}>
                        {getDemandLabel(country.demand)}
                      </span>
                      {country.avgSalary && (
                        <span className="country-salary">
                          {txt.avgSalary}: {country.avgSalary}
                        </span>
                      )}
                    </div>
                    <span className="card-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Agencies */}
          {agencies.length > 0 && (
            <div className="recommendation-section">
              <div className="rec-section-header">
                <h3 className="rec-section-title">{txt.agenciesTitle}</h3>
                <Link to="/agencies" className="section-link">{txt.viewAll} →</Link>
              </div>
              <div className="agencies-grid">
                {agencies.slice(0, 3).map(agency => (
                  <Link 
                    key={agency.id || agency._id}
                    to={`/agencies/${agency.id || agency._id}`}
                    className="agency-card-sm"
                  >
                    <div className="agency-info">
                      <h4 className="agency-name">{agency.name}</h4>
                      <div className="agency-meta">
                        <span className="agency-rating">⭐ {agency.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="agency-location">📍 {agency.location}</span>
                      </div>
                    </div>
                    <span className="card-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

RecommendationsPanel.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string,
    flag: PropTypes.string,
    demand: PropTypes.string,
    avgSalary: PropTypes.string
  })),
  agencies: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string,
    rating: PropTypes.number,
    location: PropTypes.string
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  language: PropTypes.string
};

export default RecommendationsPanel;
