import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './RatingModal.css';

const RatingModal = ({ agencyId, agencyName, onClose, onSubmit }) => {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [breakdown, setBreakdown] = useState({
    communication: 0,
    transparency: 0,
    support: 0,
    documentation: 0,
    jobQuality: 0
  });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleBreakdownChange = (category, value) => {
    setBreakdown({ ...breakdown, [category]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select an overall rating');
      return;
    }

    // Check if all breakdown ratings are set
    const requiredBreakdownFields = ['communication', 'transparency', 'support', 'documentation', 'jobQuality'];
    const missingBreakdownFields = requiredBreakdownFields.filter(field => breakdown[field] === 0);
    
    if (missingBreakdownFields.length > 0) {
      setError(`Please rate all categories: ${missingBreakdownFields.join(', ')}`);
      return;
    }

    if (!title.trim()) {
      setError('Please provide a review title');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    if (comment.trim().length < 20) {
      setError('Comment must be at least 20 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token || !isAuthenticated) {
        throw new Error('Please login to submit a review');
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const reviewData = {
        rating,
        breakdown,
        title,
        comment,
        pros: pros.trim() ? pros : undefined,
        cons: cons.trim() ? cons : undefined
      };
      
      console.log('Submitting review data:', reviewData);
      
      const response = await fetch(`${API_URL}/agencies/${agencyId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();

      console.log('Review submission response:', { status: response.status, data });

      if (!response.ok) {
        console.error('Review submission failed:', data);
        throw new Error(data.message || 'Failed to submit review');
      }

      onSubmit(data.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h2>Rate {agencyName}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="rating-form">
          {error && <div className="error-message">{error}</div>}

          {/* Overall Rating */}
          <div className="form-group">
            <label>Overall Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* Breakdown Ratings */}
          <div className="breakdown-ratings">
            <label>Detailed Ratings</label>
            {Object.entries({
              communication: 'Communication',
              transparency: 'Transparency',
              support: 'Support Services',
              documentation: 'Documentation',
              jobQuality: 'Job Quality'
            }).map(([key, label]) => (
              <div key={key} className="breakdown-item">
                <span className="breakdown-label">{label}</span>
                <div className="star-rating small">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= breakdown[key] ? 'active' : ''}`}
                      onClick={() => handleBreakdownChange(key, star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Review Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
              required
            />
          </div>

          {/* Comment */}
          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed experience with this agency..."
              rows={5}
              maxLength={2000}
              required
            />
          </div>

          {/* Pros */}
          <div className="form-group">
            <label>Pros</label>
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="What did you like about this agency?"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Cons */}
          <div className="form-group">
            <label>Cons</label>
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="What could be improved?"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
