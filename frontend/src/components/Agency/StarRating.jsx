import { useState } from 'react';
import PropTypes from 'prop-types';
import './StarRating.css';

/**
 * Star Rating Component
 * Interactive star rating selector or display
 */
const StarRating = ({
  value = 0,
  onChange,
  editable = false,
  size = 'medium',
  showValue = false,
  language = 'en'
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const translations = {
    en: {
      rateLabel: 'Rate this agency',
      stars: 'stars'
    },
    bn: {
      rateLabel: 'এই এজেন্সি রেট করুন',
      stars: 'তারা'
    }
  };

  const txt = translations[language] || translations.en;

  const handleClick = (rating) => {
    if (editable && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (editable) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverValue(0);
    }
  };

  const handleKeyDown = (e, rating) => {
    if (editable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(rating);
    }
  };

  const displayValue = hoverValue || value;

  const getSizeClass = () => {
    const sizes = {
      small: 'star-rating--small',
      medium: 'star-rating--medium',
      large: 'star-rating--large'
    };
    return sizes[size] || sizes.medium;
  };

  return (
    <div 
      className={`star-rating ${getSizeClass()} ${editable ? 'star-rating--editable' : ''}`}
      role={editable ? 'group' : 'img'}
      aria-label={editable ? txt.rateLabel : `${value} ${txt.stars}`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        const isHalfFilled = !isFilled && star - 0.5 <= displayValue;

        return (
          <span
            key={star}
            className={`star ${isFilled ? 'star--filled' : ''} ${isHalfFilled ? 'star--half' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => handleKeyDown(e, star)}
            role={editable ? 'button' : 'presentation'}
            tabIndex={editable ? 0 : -1}
            aria-label={editable ? `${star} ${txt.stars}` : undefined}
          >
            {isFilled || isHalfFilled ? '★' : '☆'}
          </span>
        );
      })}
      
      {showValue && (
        <span className="star-rating-value">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  editable: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showValue: PropTypes.bool,
  language: PropTypes.string
};

export default StarRating;
