import PropTypes from 'prop-types';
import './RatingDistribution.css';

/**
 * Rating Distribution Component
 * Displays horizontal bar chart of rating breakdown
 */
const RatingDistribution = ({
  distribution = {},
  totalReviews = 0,
  language = 'en'
}) => {
  const translations = {
    en: {
      reviews: 'reviews',
      review: 'review',
      noReviews: 'No reviews yet'
    },
    bn: {
      reviews: 'রিভিউ',
      review: 'রিভিউ',
      noReviews: 'এখনও কোন রিভিউ নেই'
    }
  };

  const txt = translations[language] || translations.en;

  // Build distribution data
  const ratingLevels = [5, 4, 3, 2, 1];
  
  const getCount = (level) => {
    return distribution[level] || distribution[`${level}`] || 0;
  };

  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  if (totalReviews === 0) {
    return (
      <div className="rating-distribution empty">
        <p>{txt.noReviews}</p>
      </div>
    );
  }

  return (
    <div className="rating-distribution">
      {ratingLevels.map((level) => {
        const count = getCount(level);
        const percentage = getPercentage(count);

        return (
          <div key={level} className="distribution-row">
            <div className="star-label">
              <span className="star-count">{level}</span>
              <span className="star-icon">★</span>
            </div>
            
            <div className="bar-container">
              <div 
                className="bar-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="count-label">
              <span className="count">{count}</span>
              <span className="text">{count === 1 ? txt.review : txt.reviews}</span>
              <span className="percentage">({percentage.toFixed(0)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

RatingDistribution.propTypes = {
  distribution: PropTypes.object,
  totalReviews: PropTypes.number,
  language: PropTypes.string
};

export default RatingDistribution;
