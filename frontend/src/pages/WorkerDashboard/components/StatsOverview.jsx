import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './StatsOverview.css';

/**
 * Stats Overview Component
 * Displays 4 key statistics cards
 */
const StatsOverview = ({
  stats,
  loading = false,
  error = null,
  onRetry,
  language = 'en'
}) => {
  const translations = {
    en: {
      profileCompleteness: 'Profile Completeness',
      completeProfile: 'Complete Profile',
      agenciesReviewed: 'Agencies Reviewed',
      writeMore: 'Write More Reviews',
      savedCountries: 'Saved Countries',
      exploreMore: 'Explore More',
      applications: 'Agency Interactions',
      viewActivity: 'View Activity',
      errorMessage: 'Unable to load statistics',
      retry: 'Retry'
    },
    bn: {
      profileCompleteness: 'প্রোফাইল সম্পূর্ণতা',
      completeProfile: 'প্রোফাইল সম্পূর্ণ করুন',
      agenciesReviewed: 'এজেন্সি রিভিউ',
      writeMore: 'আরও রিভিউ লিখুন',
      savedCountries: 'সংরক্ষিত দেশ',
      exploreMore: 'আরও অন্বেষণ করুন',
      applications: 'এজেন্সি ইন্টারঅ্যাকশন',
      viewActivity: 'কার্যকলাপ দেখুন',
      errorMessage: 'পরিসংখ্যান লোড করতে অক্ষম',
      retry: 'আবার চেষ্টা করুন'
    }
  };

  const txt = translations[language] || translations.en;

  const statCards = [
    {
      id: 'profile',
      icon: '📊',
      value: `${stats.profileCompleteness}%`,
      label: txt.profileCompleteness,
      link: stats.profileCompleteness < 100 ? '/profile' : null,
      linkText: txt.completeProfile,
      color: 'green',
      isProgress: true,
      progress: stats.profileCompleteness
    },
    {
      id: 'reviews',
      icon: '⭐',
      value: stats.reviewsGiven,
      label: txt.agenciesReviewed,
      link: '/agencies',
      linkText: txt.writeMore,
      color: 'yellow'
    },
    {
      id: 'countries',
      icon: '🌍',
      value: stats.savedCountries,
      label: txt.savedCountries,
      link: '/countries',
      linkText: txt.exploreMore,
      color: 'blue'
    },
    {
      id: 'applications',
      icon: '💼',
      value: stats.applications,
      label: txt.applications,
      link: '/profile#activity',
      linkText: txt.viewActivity,
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="stats-overview">
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card skeleton-card">
              <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
              <div className="skeleton skeleton-text short" style={{ width: '80%' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-overview">
        <div className="section-error">
          <p>❌ {txt.errorMessage}</p>
          <button className="retry-btn" onClick={onRetry}>{txt.retry}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-overview">
      <div className="stats-grid">
        {statCards.map(card => (
          <div key={card.id} className={`stat-card stat-card--${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            
            <div className="stat-content">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
              
              {card.isProgress && (
                <div className="stat-progress">
                  <div 
                    className="stat-progress-fill"
                    style={{ width: `${card.progress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {card.link && (
              <Link to={card.link} className="stat-link">
                {card.linkText} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

StatsOverview.propTypes = {
  stats: PropTypes.shape({
    profileCompleteness: PropTypes.number,
    reviewsGiven: PropTypes.number,
    savedCountries: PropTypes.number,
    applications: PropTypes.number
  }).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
  language: PropTypes.string
};

export default StatsOverview;
