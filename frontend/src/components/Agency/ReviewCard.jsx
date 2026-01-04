import { useState } from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import './ReviewCard.css';

/**
 * Review Card Component
 * Displays an individual review with rating, user info, and actions
 */
const ReviewCard = ({
  review,
  onHelpful,
  onReport,
  currentUserId,
  language = 'en'
}) => {
  const [showFullComment, setShowFullComment] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const translations = {
    en: {
      anonymous: 'Anonymous',
      verified: 'Verified Review',
      verifiedTooltip: 'This person used this agency',
      helpful: 'Helpful',
      wasHelpful: 'Was this helpful?',
      report: 'Report',
      readMore: 'Read more',
      readLess: 'Show less',
      thanks: 'Thanks for your feedback!',
      reportReasons: {
        spam: 'Spam',
        inappropriate: 'Inappropriate content',
        fake: 'Fake review',
        other: 'Other'
      },
      reportTitle: 'Report Review',
      reportSubmit: 'Submit Report',
      reportCancel: 'Cancel',
      daysAgo: 'days ago',
      weeksAgo: 'weeks ago',
      monthsAgo: 'months ago',
      yearsAgo: 'years ago',
      today: 'Today',
      yesterday: 'Yesterday'
    },
    bn: {
      anonymous: 'বেনামী',
      verified: 'যাচাইকৃত রিভিউ',
      verifiedTooltip: 'এই ব্যক্তি এই এজেন্সি ব্যবহার করেছেন',
      helpful: 'সহায়ক',
      wasHelpful: 'এটি কি সহায়ক ছিল?',
      report: 'রিপোর্ট',
      readMore: 'আরও পড়ুন',
      readLess: 'কম দেখান',
      thanks: 'আপনার মতামতের জন্য ধন্যবাদ!',
      reportReasons: {
        spam: 'স্প্যাম',
        inappropriate: 'অনুপযুক্ত বিষয়বস্তু',
        fake: 'ভুয়া রিভিউ',
        other: 'অন্যান্য'
      },
      reportTitle: 'রিভিউ রিপোর্ট করুন',
      reportSubmit: 'রিপোর্ট জমা দিন',
      reportCancel: 'বাতিল',
      daysAgo: 'দিন আগে',
      weeksAgo: 'সপ্তাহ আগে',
      monthsAgo: 'মাস আগে',
      yearsAgo: 'বছর আগে',
      today: 'আজ',
      yesterday: 'গতকাল'
    }
  };

  const txt = translations[language] || translations.en;

  const {
    _id,
    rating,
    comment,
    workerId,
    workerName,
    isAnonymous,
    verificationStatus,
    helpfulCount = 0,
    createdAt,
    hasMarkedHelpful = false
  } = review;

  // Format reviewer name
  const getDisplayName = () => {
    if (isAnonymous) return txt.anonymous;
    if (workerName) {
      const parts = workerName.split(' ');
      if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
      }
      return workerName;
    }
    return txt.anonymous;
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return txt.today;
    if (diffDays === 1) return txt.yesterday;
    if (diffDays < 7) return `${diffDays} ${txt.daysAgo}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${txt.weeksAgo}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${txt.monthsAgo}`;
    return `${Math.floor(diffDays / 365)} ${txt.yearsAgo}`;
  };

  // Get initial for avatar
  const getInitial = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleHelpful = () => {
    if (onHelpful && !hasMarkedHelpful) {
      onHelpful(_id);
    }
  };

  const handleReportSubmit = (reason) => {
    if (onReport) {
      onReport(_id, reason);
    }
    setIsReporting(false);
  };

  const isVerified = verificationStatus === 'verified';
  const commentTruncated = comment && comment.length > 250;
  const displayComment = showFullComment 
    ? comment 
    : comment?.substring(0, 250);

  return (
    <div className="review-card">
      {/* Reviewer Info */}
      <div className="review-header">
        <div className="reviewer-avatar">
          {getInitial()}
        </div>
        
        <div className="reviewer-info">
          <div className="reviewer-name-row">
            <span className="reviewer-name">{getDisplayName()}</span>
            {isVerified && (
              <span 
                className="verified-badge" 
                title={txt.verifiedTooltip}
              >
                ✓ {txt.verified}
              </span>
            )}
          </div>
          <span className="review-date">{getRelativeTime(createdAt)}</span>
        </div>

        <div className="review-rating">
          <StarRating value={rating} size="small" editable={false} />
        </div>
      </div>

      {/* Review Comment */}
      <div className="review-content">
        <p className="review-comment">
          {displayComment}
          {commentTruncated && !showFullComment && '...'}
        </p>
        
        {commentTruncated && (
          <button 
            className="read-more-btn"
            onClick={() => setShowFullComment(!showFullComment)}
          >
            {showFullComment ? txt.readLess : txt.readMore}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="review-actions">
        <button 
          className={`action-btn helpful-btn ${hasMarkedHelpful ? 'marked' : ''}`}
          onClick={handleHelpful}
          disabled={hasMarkedHelpful}
        >
          <span className="action-icon">👍</span>
          <span className="action-text">
            {hasMarkedHelpful ? txt.thanks : txt.helpful}
          </span>
          {helpfulCount > 0 && (
            <span className="action-count">({helpfulCount})</span>
          )}
        </button>

        <button 
          className="action-btn report-btn"
          onClick={() => setIsReporting(true)}
        >
          <span className="action-icon">🚩</span>
          <span className="action-text">{txt.report}</span>
        </button>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="report-modal-overlay" onClick={() => setIsReporting(false)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <h4>{txt.reportTitle}</h4>
            <div className="report-options">
              {Object.entries(txt.reportReasons).map(([key, label]) => (
                <button
                  key={key}
                  className="report-option"
                  onClick={() => handleReportSubmit(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button 
              className="cancel-btn"
              onClick={() => setIsReporting(false)}
            >
              {txt.reportCancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    workerId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    workerName: PropTypes.string,
    isAnonymous: PropTypes.bool,
    verificationStatus: PropTypes.string,
    helpfulCount: PropTypes.number,
    createdAt: PropTypes.string,
    hasMarkedHelpful: PropTypes.bool
  }).isRequired,
  onHelpful: PropTypes.func,
  onReport: PropTypes.func,
  currentUserId: PropTypes.string,
  language: PropTypes.string
};

export default ReviewCard;
