/**
 * Review Routes
 * API endpoints for agency reviews and ratings
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :agencyId from parent router
const {
  createReview,
  getAgencyReviews,
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/agencies/:agencyId/reviews
 * @desc    Get all reviews for an agency
 * @access  Public
 */
router.get('/', getAgencyReviews);

/**
 * @route   POST /api/agencies/:agencyId/reviews
 * @desc    Create a new review for an agency
 * @access  Private (authenticated users)
 */
router.post('/', authenticate, createReview);

/**
 * @route   PUT /api/agencies/:agencyId/reviews/:reviewId
 * @desc    Update user's own review
 * @access  Private
 */
router.put('/:reviewId', authenticate, updateReview);

/**
 * @route   DELETE /api/agencies/:agencyId/reviews/:reviewId
 * @desc    Delete user's own review
 * @access  Private
 */
router.delete('/:reviewId', authenticate, deleteReview);

module.exports = router;
