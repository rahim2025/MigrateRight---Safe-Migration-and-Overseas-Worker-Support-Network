import { useState } from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import './ReviewSubmissionForm.css';

/**
 * Review Submission Form Component
 * Modal form for authenticated users to submit reviews
 */
const ReviewSubmissionForm = ({
  agencyId,
  agencyName,
  onSubmit,
  onClose,
  isSubmitting = false,
  error = null,
  language = 'en'
}) => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    isAnonymous: false,
    agreedToTerms: false
  });

  const [validationErrors, setValidationErrors] = useState({});

  const translations = {
    en: {
      title: 'Write a Review',
      subtitle: 'Share your experience with',
      ratingLabel: 'Rate this agency *',
      ratingPlaceholder: 'Click to rate',
      commentLabel: 'Your review *',
      commentPlaceholder: 'Share your experience with this agency...',
      characterCount: 'characters',
      characterLimit: '10-500 characters required',
      anonymousLabel: 'Post this review anonymously',
      anonymousTooltip: 'Your name will be hidden but review will be marked as verified',
      termsLabel: 'I confirm this review is based on my actual experience',
      submitBtn: 'Submit Review',
      cancelBtn: 'Cancel',
      submitting: 'Submitting...',
      errors: {
        ratingRequired: 'Please select a rating',
        commentRequired: 'Please write a review',
        commentTooShort: 'Review must be at least 10 characters',
        commentTooLong: 'Review cannot exceed 500 characters',
        termsRequired: 'You must confirm this is based on actual experience'
      }
    },
    bn: {
      title: 'একটি রিভিউ লিখুন',
      subtitle: 'আপনার অভিজ্ঞতা শেয়ার করুন',
      ratingLabel: 'এই এজেন্সি রেট করুন *',
      ratingPlaceholder: 'রেট করতে ক্লিক করুন',
      commentLabel: 'আপনার রিভিউ *',
      commentPlaceholder: 'এই এজেন্সির সাথে আপনার অভিজ্ঞতা শেয়ার করুন...',
      characterCount: 'অক্ষর',
      characterLimit: '১০-৫০০ অক্ষর প্রয়োজন',
      anonymousLabel: 'এই রিভিউ বেনামে পোস্ট করুন',
      anonymousTooltip: 'আপনার নাম লুকানো থাকবে কিন্তু রিভিউ যাচাইকৃত হিসাবে চিহ্নিত হবে',
      termsLabel: 'আমি নিশ্চিত করছি এই রিভিউ আমার প্রকৃত অভিজ্ঞতার উপর ভিত্তি করে',
      submitBtn: 'রিভিউ জমা দিন',
      cancelBtn: 'বাতিল',
      submitting: 'জমা দেওয়া হচ্ছে...',
      errors: {
        ratingRequired: 'অনুগ্রহ করে একটি রেটিং নির্বাচন করুন',
        commentRequired: 'অনুগ্রহ করে একটি রিভিউ লিখুন',
        commentTooShort: 'রিভিউ কমপক্ষে ১০ অক্ষর হতে হবে',
        commentTooLong: 'রিভিউ ৫০০ অক্ষরের বেশি হতে পারবে না',
        termsRequired: 'আপনাকে নিশ্চিত করতে হবে এটি প্রকৃত অভিজ্ঞতার উপর ভিত্তি করে'
      }
    }
  };

  const txt = translations[language] || translations.en;

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (validationErrors.rating) {
      setValidationErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleCommentChange = (e) => {
    const comment = e.target.value;
    setFormData(prev => ({ ...prev, comment }));
    if (validationErrors.comment) {
      setValidationErrors(prev => ({ ...prev, comment: null }));
    }
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.rating || formData.rating < 1) {
      errors.rating = txt.errors.ratingRequired;
    }

    if (!formData.comment || formData.comment.trim().length === 0) {
      errors.comment = txt.errors.commentRequired;
    } else if (formData.comment.trim().length < 10) {
      errors.comment = txt.errors.commentTooShort;
    } else if (formData.comment.length > 500) {
      errors.comment = txt.errors.commentTooLong;
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = txt.errors.termsRequired;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        rating: formData.rating,
        comment: formData.comment.trim(),
        isAnonymous: formData.isAnonymous
      });
    }
  };

  const characterCount = formData.comment.length;
  const isValidLength = characterCount >= 10 && characterCount <= 500;

  return (
    <div className="review-form-overlay" onClick={onClose}>
      <div className="review-form-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="form-header">
          <h2>{txt.title}</h2>
          <p className="form-subtitle">
            {txt.subtitle} <strong>{agencyName}</strong>
          </p>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="review-form">
          {/* Rating */}
          <div className="form-group">
            <label className="form-label">{txt.ratingLabel}</label>
            <div className="rating-input-wrapper">
              <StarRating
                value={formData.rating}
                onChange={handleRatingChange}
                editable={true}
                size="large"
                language={language}
              />
              {formData.rating > 0 && (
                <span className="rating-text">{formData.rating}/5</span>
              )}
            </div>
            {validationErrors.rating && (
              <span className="error-text">{validationErrors.rating}</span>
            )}
          </div>

          {/* Comment */}
          <div className="form-group">
            <label htmlFor="review-comment" className="form-label">
              {txt.commentLabel}
            </label>
            <textarea
              id="review-comment"
              className={`comment-textarea ${validationErrors.comment ? 'error' : ''}`}
              placeholder={txt.commentPlaceholder}
              value={formData.comment}
              onChange={handleCommentChange}
              rows={5}
              maxLength={500}
            />
            <div className="character-counter">
              <span className={`count ${!isValidLength && characterCount > 0 ? 'invalid' : ''}`}>
                {characterCount}/500 {txt.characterCount}
              </span>
              <span className="hint">{txt.characterLimit}</span>
            </div>
            {validationErrors.comment && (
              <span className="error-text">{validationErrors.comment}</span>
            )}
          </div>

          {/* Anonymous Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={() => handleCheckboxChange('isAnonymous')}
              />
              <span className="checkbox-text">{txt.anonymousLabel}</span>
              <span className="tooltip-icon" title={txt.anonymousTooltip}>ℹ️</span>
            </label>
          </div>

          {/* Terms Checkbox */}
          <div className="form-group checkbox-group">
            <label className={`checkbox-label ${validationErrors.agreedToTerms ? 'error' : ''}`}>
              <input
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={() => handleCheckboxChange('agreedToTerms')}
              />
              <span className="checkbox-text">{txt.termsLabel}</span>
            </label>
            {validationErrors.agreedToTerms && (
              <span className="error-text">{validationErrors.agreedToTerms}</span>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {txt.cancelBtn}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? txt.submitting : txt.submitBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReviewSubmissionForm.propTypes = {
  agencyId: PropTypes.string.isRequired,
  agencyName: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string,
  language: PropTypes.string
};

export default ReviewSubmissionForm;
