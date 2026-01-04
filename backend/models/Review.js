/**
 * Review Model
 * Mongoose schema for agency reviews submitted by workers
 * 
 * Relationships:
 * - agencyId: ObjectId reference to Agency model (Many-to-One)
 * - workerId: ObjectId reference to User/Worker model (Many-to-One)
 * 
 * Features:
 * - Compound unique index prevents duplicate reviews from same worker for same agency
 * - Pre-save middleware validates worker is not agency owner
 * - Pre-save middleware sanitizes comment text (removes HTML/script tags)
 * - Post-save middleware triggers agency average rating update
 * - Virtual fields for verification status and review age
 * - Instance methods for moderation actions
 */

const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    // Reference to the agency being reviewed (REQUIRED)
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: [true, 'Agency ID is required'],
      index: true,
    },

    // Reference to the worker who wrote the review (REQUIRED)
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker ID is required'],
      index: true,
    },

    // Overall rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },

    // Review comment text
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },

    // Verification status of the review
    verificationStatus: {
      type: String,
      enum: {
        values: ['verified', 'pending', 'unverified'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'pending',
    },

    // Whether the review should be displayed anonymously
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // Metadata: Helpful votes count
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
    },

    // Metadata: Abuse reports count
    reportCount: {
      type: Number,
      default: 0,
      min: [0, 'Report count cannot be negative'],
    },

    // Review status (for soft deletion and moderation)
    status: {
      type: String,
      enum: {
        values: ['active', 'hidden', 'deleted'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Index for fetching reviews by agency, newest first
ReviewSchema.index({ agencyId: 1, createdAt: -1 });

// Unique compound index to prevent duplicate reviews from same worker for same agency
ReviewSchema.index({ workerId: 1, agencyId: 1 }, { unique: true });

// Index for admin queries (filtering by verification and status)
ReviewSchema.index({ verificationStatus: 1, status: 1 });

// Index for statistics queries
ReviewSchema.index({ rating: 1 });

// ==================== VIRTUAL FIELDS ====================

/**
 * Virtual: isVerified
 * Returns true if verificationStatus is 'verified'
 */
ReviewSchema.virtual('isVerified').get(function () {
  return this.verificationStatus === 'verified';
});

/**
 * Virtual: reviewAge
 * Calculates the number of days since the review was posted
 */
ReviewSchema.virtual('reviewAge').get(function () {
  if (!this.createdAt) return 0;
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ==================== INSTANCE METHODS ====================

/**
 * Mark the review as verified
 * Sets verificationStatus to 'verified'
 * @returns {Promise<Review>} The saved review document
 */
ReviewSchema.methods.markAsVerified = async function () {
  this.verificationStatus = 'verified';
  return this.save();
};

/**
 * Increment the helpful count
 * @returns {Promise<Review>} The saved review document
 */
ReviewSchema.methods.markAsHelpful = async function () {
  this.helpfulCount += 1;
  return this.save();
};

/**
 * Hide the review (soft delete)
 * Sets status to 'hidden'
 * @returns {Promise<Review>} The saved review document
 */
ReviewSchema.methods.hide = async function () {
  this.status = 'hidden';
  return this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Find active reviews for an agency
 * @param {String} agencyId - Agency ID
 * @param {Object} options - Query options (limit, sort, etc.)
 * @returns {Query}
 */
ReviewSchema.statics.findByAgency = function (agencyId, options = {}) {
  return this.find({
    agencyId,
    status: 'active',
  })
    .populate('workerId', 'fullName email')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10);
};

/**
 * Calculate average rating for an agency
 * @param {String} agencyId - Agency ID
 * @returns {Promise<Object>} Rating statistics
 */
ReviewSchema.statics.getAverageRating = async function (agencyId) {
  const stats = await this.aggregate([
    {
      $match: {
        agencyId: new mongoose.Types.ObjectId(agencyId),
        status: 'active',
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        fiveStars: {
          $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
        },
        fourStars: {
          $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
        },
        threeStars: {
          $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
        },
        twoStars: {
          $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
        },
        oneStar: {
          $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || {
    averageRating: 0,
    totalReviews: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  };
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware
 * - Validates that workerId is different from agency owner
 * - Trims and sanitizes comment text (removes HTML and script tags)
 */
ReviewSchema.pre('save', async function (next) {
  try {
    // Sanitize comment: Remove HTML tags and script tags
    if (this.isModified('comment') && this.comment) {
      // Remove script tags and their content
      this.comment = this.comment.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      // Remove all HTML tags
      this.comment = this.comment.replace(/<[^>]*>/g, '');
      // Trim whitespace
      this.comment = this.comment.trim();
    }

    // Validate that workerId is different from agency owner
    if (this.isNew || this.isModified('workerId') || this.isModified('agencyId')) {
      const Agency = mongoose.model('Agency');
      const agency = await Agency.findById(this.agencyId);

      if (agency) {
        // Check if agency has an owner field and compare with workerId
        const agencyOwnerId = agency.owner || agency.userId || agency.createdBy;
        
        if (agencyOwnerId && agencyOwnerId.toString() === this.workerId.toString()) {
          const error = new Error('Worker cannot review their own agency');
          error.name = 'ValidationError';
          return next(error);
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Post-save middleware
 * After saving a review, trigger update of agency average rating
 * Calls Agency.updateAverageRating(agencyId)
 */
ReviewSchema.post('save', async function (doc) {
  try {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(doc.agencyId);

    if (agency) {
      // Check if agency has updateAverageRating method
      if (typeof agency.updateAverageRating === 'function') {
        await agency.updateAverageRating(doc.agencyId);
      } else {
        // Fallback: Calculate and update rating manually
        const stats = await this.constructor.getAverageRating(doc.agencyId);
        
        if (agency.rating !== undefined) {
          agency.rating = {
            average: Math.round(stats.averageRating * 10) / 10,
            count: stats.totalReviews,
          };
          await agency.save();
        }
      }
    }
  } catch (error) {
    // Log error but don't fail the save operation
    console.error('Error updating agency rating after review save:', error.message);
  }
});

/**
 * Post-remove middleware
 * After removing a review, recalculate agency average rating
 */
ReviewSchema.post('remove', async function (doc) {
  try {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(doc.agencyId);

    if (agency) {
      if (typeof agency.updateAverageRating === 'function') {
        await agency.updateAverageRating(doc.agencyId);
      } else {
        const stats = await this.constructor.getAverageRating(doc.agencyId);
        
        if (agency.rating !== undefined) {
          agency.rating = {
            average: Math.round(stats.averageRating * 10) / 10,
            count: stats.totalReviews,
          };
          await agency.save();
        }
      }
    }
  } catch (error) {
    console.error('Error updating agency rating after review remove:', error.message);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
