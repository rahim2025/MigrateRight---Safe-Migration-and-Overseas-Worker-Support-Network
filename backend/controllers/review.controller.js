/**
 * Review Controller
 * Handles agency review and rating operations
 */

const Review = require('../models/Review.model');
const Agency = require('../models/Agency.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * @desc    Create a new review for an agency
 * @route   POST /api/agencies/:agencyId/reviews
 * @access  Private (authenticated users)
 */
const createReview = async (req, res, next) => {
  try {
    const { agencyId } = req.params;
    const userId = req.user._id;
    const { rating, breakdown, title, comment, pros, cons } = req.body;

    console.log('Creating review:', { agencyId, userId, rating, title });

    // Check if agency exists
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return next(new NotFoundError('Agency', agencyId));
    }

    // Check if user already reviewed this agency
    const existingReview = await Review.findOne({ agency: agencyId, user: userId });
    if (existingReview) {
      return next(new BadRequestError('You have already reviewed this agency. You can update your existing review instead.'));
    }

    // Validate required fields
    if (!comment || comment.trim().length < 20) {
      return next(new BadRequestError('Comment must be at least 20 characters long'));
    }

    // Create review
    const review = await Review.create({
      agency: agencyId,
      user: userId,
      rating,
      breakdown: breakdown || {
        communication: rating,
        transparency: rating,
        support: rating,
        documentation: rating,
        jobQuality: rating,
      },
      title,
      comment: comment.trim(),
      pros: pros ? pros.trim() : undefined,
      cons: cons ? cons.trim() : undefined,
    });

    // Update agency rating
    await updateAgencyRating(agencyId);

    // Populate user info
    await review.populate('user', 'fullName email');

    logger.info('Review created', { reviewId: review._id, agencyId, userId });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    console.log('Error in createReview:', error);
    next(error);
  }
};

/**
 * @desc    Get all reviews for an agency
 * @route   GET /api/agencies/:agencyId/reviews
 * @access  Public
 */
const getAgencyReviews = async (req, res, next) => {
  try {
  const { agencyId } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Check if agency exists
  const agency = await Agency.findById(agencyId);
  if (!agency) {
    throw new NotFoundError('Agency', agencyId);
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const sortOrder = order === 'asc' ? 1 : -1;

  // Get reviews
  const reviews = await Review.find({ agency: agencyId, isActive: true })
    .populate('user', 'fullName')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const total = await Review.countDocuments({ agency: agencyId, isActive: true });

  res.status(200).json({
    success: true,
    data: reviews,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      pages: Math.ceil(total / limitNumber),
    },
  });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user's own review
 * @route   PUT /api/agencies/:agencyId/reviews/:reviewId
 * @access  Private
 */
const updateReview = async (req, res, next) => {
  try {
  const { reviewId } = req.params;
  const userId = req.user._id;
  const { rating, breakdown, title, comment, pros, cons } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError('Review', reviewId);
  }

  // Check if user owns the review
  if (review.user.toString() !== userId.toString()) {
    throw new UnauthorizedError('You can only update your own reviews');
  }

  // Update fields
  if (rating) review.rating = rating;
  if (breakdown) review.breakdown = { ...review.breakdown, ...breakdown };
  if (title) review.title = title;
  if (comment) review.comment = comment;
  if (pros !== undefined) review.pros = pros;
  if (cons !== undefined) review.cons = cons;

  await review.save();

  // Update agency rating
  await updateAgencyRating(review.agency);

  logger.info('Review updated', { reviewId, userId });

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: review,
  });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user's own review
 * @route   DELETE /api/agencies/:agencyId/reviews/:reviewId
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
  try {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new NotFoundError('Review', reviewId);
  }

  // Check if user owns the review
  if (review.user.toString() !== userId.toString()) {
    throw new UnauthorizedError('You can only delete your own reviews');
  }

  const agencyId = review.agency;
  await review.deleteOne();

  // Update agency rating
  await updateAgencyRating(agencyId);

  logger.info('Review deleted', { reviewId, userId });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update agency rating
 */
const updateAgencyRating = async (agencyId) => {
  const reviews = await Review.find({ agency: agencyId, isActive: true });

  if (reviews.length === 0) {
    await Agency.findByIdAndUpdate(agencyId, {
      'rating.average': 0,
      'rating.count': 0,
      'rating.breakdown': {
        communication: 0,
        transparency: 0,
        support: 0,
        documentation: 0,
        jobQuality: 0,
      },
      'rating.distribution': {
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0,
      },
    });
    return;
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = totalRating / reviews.length;

  // Calculate breakdown averages
  const breakdown = {
    communication: reviews.reduce((sum, r) => sum + (r.breakdown?.communication || 0), 0) / reviews.length,
    transparency: reviews.reduce((sum, r) => sum + (r.breakdown?.transparency || 0), 0) / reviews.length,
    support: reviews.reduce((sum, r) => sum + (r.breakdown?.support || 0), 0) / reviews.length,
    documentation: reviews.reduce((sum, r) => sum + (r.breakdown?.documentation || 0), 0) / reviews.length,
    jobQuality: reviews.reduce((sum, r) => sum + (r.breakdown?.jobQuality || 0), 0) / reviews.length,
  };

  // Calculate distribution
  const distribution = {
    fiveStar: reviews.filter(r => r.rating === 5).length,
    fourStar: reviews.filter(r => r.rating === 4).length,
    threeStar: reviews.filter(r => r.rating === 3).length,
    twoStar: reviews.filter(r => r.rating === 2).length,
    oneStar: reviews.filter(r => r.rating === 1).length,
  };

  await Agency.findByIdAndUpdate(agencyId, {
    'rating.average': Math.round(average * 10) / 10,
    'rating.count': reviews.length,
    'rating.breakdown': breakdown,
    'rating.distribution': distribution,
  });
};

module.exports = {
  createReview,
  getAgencyReviews,
  updateReview,
  deleteReview,
};
