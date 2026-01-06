/**
 * Review Model
 * Mongoose schema for agency reviews by workers/users
 * 
 * Relationship with Agency:
 * - Many Reviews belong to One Agency (Many-to-One)
 * - Stored as references (ObjectId) to Agency model
 * - Agency has virtual populate for 'reviews' field
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Reference to the agency being reviewed (REQUIRED)
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: [true, 'Review must belong to an agency'],
      index: true,
    },

    // Reference to the user who wrote the review (REQUIRED)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author'],
      index: true,
    },

    // Overall rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number',
      },
    },

    // Detailed rating breakdown
    breakdown: {
      communication: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Communication rating is required'],
      },
      transparency: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Transparency rating is required'],
      },
      support: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Support rating is required'],
      },
      documentation: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Documentation rating is required'],
      },
      jobQuality: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Job quality rating is required'],
      },
    },

    // Review text
    title: {
      type: String,
      required: [true, 'Review must have a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    comment: {
      type: String,
      required: [true, 'Review must have a comment'],
      trim: true,
      minlength: [20, 'Comment must be at least 20 characters'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },

    // Pros and Cons (optional)
    pros: {
      type: String,
      trim: true,
      maxlength: [500, 'Pros cannot exceed 500 characters'],
    },

    cons: {
      type: String,
      trim: true,
      maxlength: [500, 'Cons cannot exceed 500 characters'],
    },

    // Job position/role the reviewer worked in
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },

    // Employment period
    employmentPeriod: {
      from: {
        type: Date,
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
    },

    // Destination country
    destinationCountry: {
      type: String,
      trim: true,
    },

    // Review status (for moderation)
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Flagged'],
      default: 'Pending',
      index: true,
    },

    // Moderation
    moderationNotes: {
      type: String,
      trim: true,
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },

    moderatedAt: {
      type: Date,
    },

    // Helpfulness tracking
    helpful: {
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },

    notHelpful: {
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },

    // Flag/Report system
    flagged: {
      isFlagged: {
        type: Boolean,
        default: false,
        index: true,
      },
      reason: {
        type: String,
        trim: true,
      },
      flaggedBy: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          reason: String,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Response from agency
    agencyResponse: {
      text: {
        type: String,
        trim: true,
        maxlength: [1000, 'Response cannot exceed 1000 characters'],
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Agency representative
      },
      respondedAt: {
        type: Date,
      },
    },

    // Verification status
    verified: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationMethod: {
        type: String,
        enum: ['Email', 'Document', 'Manual', 'None'],
        default: 'None',
      },
      verifiedAt: {
        type: Date,
      },
    },

    // Soft delete
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Compound index for finding reviews by agency and status
reviewSchema.index({ agency: 1, status: 1, createdAt: -1 });

// Compound index for finding user's reviews
reviewSchema.index({ user: 1, isActive: 1 });

// Compound index for finding approved reviews by rating
reviewSchema.index({ status: 1, rating: -1 });

// Text index for searching review content
reviewSchema.index({ title: 'text', comment: 'text' });

// Prevent duplicate reviews from same user for same agency
reviewSchema.index({ agency: 1, user: 1 }, { unique: true });

// ==================== VIRTUALS ====================

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function () {
  const total = this.helpful.count + this.notHelpful.count;
  if (total === 0) return 0;
  return ((this.helpful.count / total) * 100).toFixed(1);
});

// Virtual for employment duration
reviewSchema.virtual('employmentDuration').get(function () {
  if (!this.employmentPeriod.from) return 'Not specified';
  
  const to = this.employmentPeriod.current ? new Date() : this.employmentPeriod.to;
  if (!to) return 'Ongoing';

  const months = Math.floor(
    (to - this.employmentPeriod.from) / (1000 * 60 * 60 * 24 * 30)
  );
  
  if (months < 1) return 'Less than a month';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) return years === 1 ? '1 year' : `${years} years`;
  return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
});

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function () {
  const now = new Date();
  const created = this.createdAt;
  const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
});

// ==================== INSTANCE METHODS ====================

/**
 * Mark review as helpful
 * @param {String} userId - User who found review helpful
 * @returns {Promise<Review>}
 */
reviewSchema.methods.markHelpful = async function (userId) {
  // Check if user already marked as helpful
  if (this.helpful.users.includes(userId)) {
    return this;
  }

  // Remove from notHelpful if present
  if (this.notHelpful.users.includes(userId)) {
    this.notHelpful.users = this.notHelpful.users.filter(
      (id) => id.toString() !== userId.toString()
    );
    this.notHelpful.count = Math.max(0, this.notHelpful.count - 1);
  }

  // Add to helpful
  this.helpful.users.push(userId);
  this.helpful.count += 1;

  return this.save();
};

/**
 * Mark review as not helpful
 * @param {String} userId - User who found review not helpful
 * @returns {Promise<Review>}
 */
reviewSchema.methods.markNotHelpful = async function (userId) {
  // Check if user already marked as not helpful
  if (this.notHelpful.users.includes(userId)) {
    return this;
  }

  // Remove from helpful if present
  if (this.helpful.users.includes(userId)) {
    this.helpful.users = this.helpful.users.filter(
      (id) => id.toString() !== userId.toString()
    );
    this.helpful.count = Math.max(0, this.helpful.count - 1);
  }

  // Add to not helpful
  this.notHelpful.users.push(userId);
  this.notHelpful.count += 1;

  return this.save();
};

/**
 * Flag review
 * @param {String} userId - User flagging the review
 * @param {String} reason - Reason for flagging
 * @returns {Promise<Review>}
 */
reviewSchema.methods.flag = async function (userId, reason) {
  // Check if already flagged by this user
  const alreadyFlagged = this.flagged.flaggedBy.some(
    (flag) => flag.user.toString() === userId.toString()
  );

  if (!alreadyFlagged) {
    this.flagged.flaggedBy.push({
      user: userId,
      reason,
      date: new Date(),
    });

    this.flagged.isFlagged = true;
    this.flagged.reason = reason;
    
    // Auto-reject if flagged by 3+ users
    if (this.flagged.flaggedBy.length >= 3) {
      this.status = 'Flagged';
    }
  }

  return this.save();
};

/**
 * Approve review (Admin/Moderator action)
 * @param {String} moderatorId - Admin/moderator who approved
 * @returns {Promise<Review>}
 */
reviewSchema.methods.approve = async function (moderatorId) {
  this.status = 'Approved';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();

  return this.save();
};

/**
 * Reject review (Admin/Moderator action)
 * @param {String} moderatorId - Admin/moderator who rejected
 * @param {String} notes - Rejection notes
 * @returns {Promise<Review>}
 */
reviewSchema.methods.reject = async function (moderatorId, notes) {
  this.status = 'Rejected';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationNotes = notes;

  return this.save();
};

/**
 * Add agency response
 * @param {String} userId - Agency representative
 * @param {String} text - Response text
 * @returns {Promise<Review>}
 */
reviewSchema.methods.addAgencyResponse = async function (userId, text) {
  this.agencyResponse = {
    text,
    respondedBy: userId,
    respondedAt: new Date(),
  };

  return this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Find approved reviews for an agency
 * @param {String} agencyId - Agency ID
 * @param {Object} options - Query options
 * @returns {Query}
 */
reviewSchema.statics.findByAgency = function (agencyId, options = {}) {
  const query = {
    agency: agencyId,
    status: 'Approved',
    isActive: true,
  };

  if (options.minRating) {
    query.rating = { $gte: options.minRating };
  }

  return this.find(query)
    .populate('user', 'name avatar')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10);
};

/**
 * Calculate average rating for agency
 * @param {String} agencyId - Agency ID
 * @returns {Promise<Object>} - Rating statistics
 */
reviewSchema.statics.getAgencyRatingStats = async function (agencyId) {
  const stats = await this.aggregate([
    {
      $match: {
        agency: new mongoose.Types.ObjectId(agencyId),
        status: 'Approved',
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgCommunication: { $avg: '$breakdown.communication' },
        avgTransparency: { $avg: '$breakdown.transparency' },
        avgSupport: { $avg: '$breakdown.support' },
        avgDocumentation: { $avg: '$breakdown.documentation' },
        avgJobQuality: { $avg: '$breakdown.jobQuality' },
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
        oneStars: {
          $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || null;
};

/**
 * Find reviews pending moderation
 * @returns {Query}
 */
reviewSchema.statics.findPendingModeration = function () {
  return this.find({ status: 'Pending' })
    .populate('user', 'name email')
    .populate('agency', 'name')
    .sort({ createdAt: 1 }); // Oldest first
};

/**
 * Find flagged reviews
 * @returns {Query}
 */
reviewSchema.statics.findFlagged = function () {
  return this.find({ 'flagged.isFlagged': true })
    .populate('user', 'name email')
    .populate('agency', 'name')
    .populate('flagged.flaggedBy.user', 'name')
    .sort({ 'flagged.flaggedBy': -1 }); // Most flagged first
};

// ==================== MIDDLEWARE ====================

// Pre-save: Calculate overall rating from breakdown
reviewSchema.pre('save', function () {
  if (this.isModified('breakdown')) {
    const { communication, transparency, support, documentation, jobQuality } = this.breakdown;
    this.rating = Math.round(
      (communication + transparency + support + documentation + jobQuality) / 5
    );
  }
});

// Post-save: Update agency rating
reviewSchema.post('save', async function (doc) {
  try {
    if (doc.status === 'Approved' && doc.isActive) {
      const Agency = mongoose.model('Agency');
      const agency = await Agency.findById(doc.agency);
      
      if (agency) {
        await agency.updateRating(doc.rating, doc.breakdown);
      }
    }
  } catch (error) {
    console.error('Error in post-save middleware:', error);
  }
});

// Post-delete: Update agency rating
reviewSchema.post('remove', async function (doc) {
  try {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(doc.agency);
    
    if (agency && doc.status === 'Approved') {
      // Recalculate rating without this review
      const stats = await this.constructor.getAgencyRatingStats(doc.agency);
      
      if (stats) {
        agency.rating.average = stats.averageRating;
        agency.rating.count = stats.totalReviews;
        agency.rating.breakdown.communication = stats.avgCommunication;
        agency.rating.breakdown.transparency = stats.avgTransparency;
        agency.rating.breakdown.support = stats.avgSupport;
        agency.rating.breakdown.documentation = stats.avgDocumentation;
        agency.rating.breakdown.jobQuality = stats.avgJobQuality;
        
        await agency.save();
      }
    }
  } catch (error) {
    console.error('Error in post-remove middleware:', error);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
