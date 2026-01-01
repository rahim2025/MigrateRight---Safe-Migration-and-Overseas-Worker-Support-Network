/**
 * Agency Model - Extended Version
 * Mongoose schema for recruitment agencies with advanced features
 * 
 * Schema Relationships Explained:
 * ===============================
 * 
 * 1. EMBEDDED SUBDOCUMENTS (Nested Objects):
 *    - complianceHistory: Array of compliance records stored within agency document
 *    - approvalWorkflow: Admin approval tracking stored within agency document
 *    - Benefit: Fast reads, single query, atomicity
 *    - Use case: Data that belongs to agency and doesn't need separate querying
 * 
 * 2. REFERENCED DOCUMENTS (Population):
 *    - reviews: Array of ObjectIds referencing Review collection
 *    - approvalWorkflow.reviewedBy: ObjectId referencing User/Admin collection
 *    - Benefit: Normalized data, can query reviews independently
 *    - Use case: Data that can be queried separately or shared across documents
 * 
 * 3. VIRTUAL POPULATE:
 *    - 'reviews' virtual: Dynamically populates reviews without storing in database
 *    - Benefit: No data duplication, always up-to-date
 *    - Use case: One-to-many relationships
 */

const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Agency name is required'],
      trim: true,
      maxlength: [200, 'Agency name cannot exceed 200 characters'],
    },

    license: {
      number: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        trim: true,
      },
      issueDate: {
        type: Date,
      },
      expiryDate: {
        type: Date,
      },
      isValid: {
        type: Boolean,
        default: true,
      },
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
      index: true, // Create index for faster queries
    },

    verificationDate: {
      type: Date,
    },

    // Location
    location: {
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        default: 'Bangladesh',
      },
      // Geospatial coordinates [longitude, latitude] for MongoDB 2dsphere index
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },

    // Destination Countries
    destinationCountries: [
      {
        type: String,
        trim: true,
      },
    ],

    // Contact Information
    contact: {
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },

    // Rating & Reviews System (Enhanced)
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal place
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      // Detailed rating breakdown
      breakdown: {
        communication: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        transparency: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        support: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        documentation: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        jobQuality: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
      },
      // Distribution of ratings (how many 1-star, 2-star, etc.)
      distribution: {
        fiveStar: { type: Number, default: 0 },
        fourStar: { type: Number, default: 0 },
        threeStar: { type: Number, default: 0 },
        twoStar: { type: Number, default: 0 },
        oneStar: { type: Number, default: 0 },
      },
    },

    // Compliance History (Embedded Subdocuments)
    // Stores all compliance records, inspections, and violations
    complianceHistory: [
      {
        type: {
          type: String,
          enum: [
            'Inspection',
            'Audit',
            'Complaint',
            'Violation',
            'Warning',
            'Suspension',
            'Fine',
            'Compliance',
          ],
          required: true,
        },
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        severity: {
          type: String,
          enum: ['Low', 'Medium', 'High', 'Critical'],
          default: 'Low',
        },
        status: {
          type: String,
          enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
          default: 'Open',
        },
        inspectorName: {
          type: String,
          trim: true,
        },
        documentUrl: {
          type: String, // URL to uploaded compliance document
          trim: true,
        },
        resolutionDate: {
          type: Date,
        },
        resolutionNotes: {
          type: String,
          trim: true,
          maxlength: 1000,
        },
        // Fine or penalty amount (if applicable)
        fineAmount: {
          type: Number,
          min: 0,
        },
        // Whether fine was paid
        finePaid: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Compliance Score (Calculated field)
    complianceScore: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 100, // Start with perfect score
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      // Number of violations in last 12 months
      recentViolations: {
        type: Number,
        default: 0,
      },
      // Compliance status
      status: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
        default: 'Excellent',
      },
    },

    // Admin Approval Workflow
    // Tracks the approval/rejection process by administrators
    approvalWorkflow: {
      status: {
        type: String,
        enum: [
          'Pending',        // Newly submitted
          'Under Review',   // Being reviewed by admin
          'Approved',       // Approved and active
          'Rejected',       // Rejected
          'Suspended',      // Temporarily suspended
          'Revoked',        // Permanently revoked
        ],
        default: 'Pending',
        index: true,
      },
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User who submitted (agency owner)
      },
      reviewedAt: {
        type: Date,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Reference to Admin who reviewed
      },
      reviewerNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      rejectionReason: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      // Documents submitted for approval
      submittedDocuments: [
        {
          name: String,
          url: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      // Approval history (for tracking re-submissions)
      history: [
        {
          action: {
            type: String,
            enum: ['Submitted', 'Approved', 'Rejected', 'Suspended', 'Revoked', 'Resubmitted'],
          },
          date: { type: Date, default: Date.now },
          by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          notes: String,
        },
      ],
    },

    // Specialization
    specialization: [
      {
        type: String,
        enum: [
          'Construction',
          'Manufacturing',
          'Hospitality',
          'Healthcare',
          'Domestic Work',
          'IT & Technology',
          'Agriculture',
          'Other',
        ],
      },
    ],

    // Description
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    // Additional Info
    establishedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },

    totalPlacements: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Compound index for verified and active agencies
agencySchema.index({ isVerified: 1, isActive: 1 });

// Text index for search functionality
agencySchema.index({ name: 'text', description: 'text' });

// Index for location-based queries
agencySchema.index({ 'location.city': 1 });

// Note: Geospatial index for 'location.coordinates' is already defined inline in the schema
// Note: Index for 'approvalWorkflow.status' is already defined inline in the schema

// Compound index for compliance score
agencySchema.index({ 'complianceScore.score': -1, 'rating.average': -1 });

// Index for compliance history type and date
agencySchema.index({ 'complianceHistory.type': 1, 'complianceHistory.date': -1 });

// ==================== VIRTUALS ====================

// Virtual for formatted rating
agencySchema.virtual('formattedRating').get(function () {
  return `${this.rating.average.toFixed(1)} / 5.0`;
});

// Virtual for license status
agencySchema.virtual('licenseStatus').get(function () {
  if (!this.license.expiryDate) return 'Unknown';
  return this.license.expiryDate > new Date() ? 'Valid' : 'Expired';
});

// Virtual populate for reviews
// This creates a virtual field 'reviews' that populates from Review collection
// Relationship: One Agency has many Reviews (One-to-Many)
agencySchema.virtual('reviews', {
  ref: 'Review', // Model to use for population
  localField: '_id', // Field in Agency model
  foreignField: 'agency', // Field in Review model that references Agency
  justOne: false, // Returns array of reviews
  options: { sort: { createdAt: -1 }, limit: 10 }, // Most recent 10 reviews
});

// Virtual for approval status badge
agencySchema.virtual('approvalStatusBadge').get(function () {
  const statusMap = {
    Pending: '🟡 Pending',
    'Under Review': '🔵 Under Review',
    Approved: '✅ Approved',
    Rejected: '❌ Rejected',
    Suspended: '⚠️ Suspended',
    Revoked: '🔴 Revoked',
  };
  return statusMap[this.approvalWorkflow?.status] || this.approvalWorkflow?.status || 'Unknown';
});

// ==================== INSTANCE METHODS ====================

/**
 * Add compliance record
 * @param {Object} record - Compliance record data
 * @returns {Promise<Agency>}
 */
agencySchema.methods.addComplianceRecord = async function (record) {
  this.complianceHistory.push(record);
  
  // Recalculate compliance score
  await this.calculateComplianceScore();
  
  return this.save();
};

/**
 * Calculate compliance score based on history
 * Scoring algorithm:
 * - Start with 100 points
 * - Subtract points for violations based on severity
 * - Add points for resolved issues
 * @returns {Promise<Number>} - Compliance score
 */
agencySchema.methods.calculateComplianceScore = async function () {
  let score = 100;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Filter recent compliance records (last 12 months)
  

/**
 * Find agencies pending approval
 * @returns {Query}
 */
agencySchema.statics.findPendingApproval = function () {
  return this.find({
    'approvalWorkflow.status': { $in: ['Pending', 'Under Review'] },
  }).populate('approvalWorkflow.submittedBy', 'name email');
};

// Pre-save middleware to add submission to approval history
agencySchema.pre('save', function (next) {
  // If this is a new agency, add initial submission to history
  if (this.isNew && !this.approvalWorkflow.history.length) {
    this.approvalWorkflow.history.push({
      action: 'Submitted',
      date: this.approvalWorkflow.submittedAt,
      by: this.approvalWorkflow.submittedBy,
      notes: 'Initial submission',
    });
  }
  next();
});

// Post-save middleware to log compliance score changes
agencySchema.post('save', function (doc) {
  if (this.wasNew) return; // Skip for new documents
  
  // Log if compliance score changed significantly
  if (this.isModified('complianceScore.score')) {
    const logger = require('../utils/logger');
    logger.info(`Compliance score updated for agency: ${doc.name}`, {
      agencyId: doc._id,
      newScore: doc.complianceScore.score,
      status: doc.complianceScore.status,
    });
  }
});

/**
 * Find agencies with compliance issues
 * @param {Number} minScore - Minimum compliance score (default: 60)
 * @returns {Query}
 */
agencySchema.statics.findComplianceIssues = function (minScore = 60) {
  return this.find({
    'complianceScore.score': { $lt: minScore },
    isActive: true,
  }).sort({ 'complianceScore.score': 1 });
};

/**
 * Get agencies by approval status
 * @param {String} status - Approval status
 * @returns {Query}
 */
agencySchema.statics.findByApprovalStatus = function (status) {
  return this.find({ 'approvalWorkflow.status': status });
};const recentRecords = this.complianceHistory.filter(
    (record) => record.date >= oneYearAgo
  );

  let violationsCount = 0;

  recentRecords.forEach((record) => {
    if (record.type === 'Violation' || record.type === 'Complaint') {
      violationsCount++;
      
      // Deduct points based on severity
      const penaltyMap = {
        Low: 2,
        Medium: 5,
        High: 10,
        Critical: 20,
      };
      score -= penaltyMap[record.severity] || 5;

      // Add back some points if resolved
      if (record.status === 'Resolved' || record.status === 'Closed') {
        score += penaltyMap[record.severity] * 0.5;
      }
    } else if (record.type === 'Compliance' || record.type === 'Audit') {
      // Bonus points for good compliance
      score += 2;
    }
  });

  // Ensure score stays within 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine status based on score
  let status;
  if (score >= 90) status = 'Excellent';
  else if (score >= 75) status = 'Good';
  else if (score >= 60) status = 'Fair';
  else if (score >= 40) status = 'Poor';
  else status = 'Critical';

  this.complianceScore = {
    score,
    lastUpdated: new Date(),
    recentViolations: violationsCount,
    status,
  };

  return score;
};

/**
 * Update rating after new review
 * Called after a new review is submitted
 * @param {Number} newRating - New rating value (1-5)
 * @param {Object} breakdown - Rating breakdown
 * @returns {Promise<Agency>}
 */
agencySchema.methods.updateRating = async function (newRating, breakdown = {}) {
  const currentAvg = this.rating.average;
  const currentCount = this.rating.count;

  // Calculate new average
  const newAvg = ((currentAvg * currentCount) + newRating) / (currentCount + 1);

  // Update rating distribution
  const starKey = `${Math.round(newRating)}Star`;
  const distributionKey = {
    '1': 'oneStar',
    '2': 'twoStar',
    '3': 'threeStar',
    '4': 'fourStar',
    '5': 'fiveStar',
  }[Math.round(newRating)];

  if (distributionKey) {
    this.rating.distribution[distributionKey] += 1;
  }

  // Update breakdown averages
  if (breakdown.communication) {
    this.rating.breakdown.communication = 
      ((this.rating.breakdown.communication * currentCount) + breakdown.communication) / (currentCount + 1);
  }
  if (breakdown.transparency) {
    this.rating.breakdown.transparency = 
      ((this.rating.breakdown.transparency * currentCount) + breakdown.transparency) / (currentCount + 1);
  }
  if (breakdown.support) {
    this.rating.breakdown.support = 
      ((this.rating.breakdown.support * currentCount) + breakdown.support) / (currentCount + 1);
  }
  if (breakdown.documentation) {
    this.rating.breakdown.documentation = 
      ((this.rating.breakdown.documentation * currentCount) + breakdown.documentation) / (currentCount + 1);
  }
  if (breakdown.jobQuality) {
    this.rating.breakdown.jobQuality = 
      ((this.rating.breakdown.jobQuality * currentCount) + breakdown.jobQuality) / (currentCount + 1);
  }

  // Update rating
  this.rating.average = newAvg;
  this.rating.count = currentCount + 1;

  return this.save();
};

/**
 * Approve agency (Admin action)
 * @param {String} adminId - Admin who approved
 * @param {String} notes - Optional approval notes
 * @returns {Promise<Agency>}
 */
agencySchema.methods.approve = async function (adminId, notes = '') {
  this.approvalWorkflow.status = 'Approved';
  this.approvalWorkflow.reviewedAt = new Date();
  this.approvalWorkflow.reviewedBy = adminId;
  this.approvalWorkflow.reviewerNotes = notes;
  this.isVerified = true;
  this.verificationDate = new Date();

  // Add to history
  this.approvalWorkflow.history.push({
    action: 'Approved',
    date: new Date(),
    by: adminId,
    notes,
  });

  return this.save();
};

/**
 * Reject agency (Admin action)
 * @param {String} adminId - Admin who rejected
 * @param {String} reason - Rejection reason
 * @returns {Promise<Agency>}
 */
agencySchema.methods.reject = async function (adminId, reason) {
  this.approvalWorkflow.status = 'Rejected';
  this.approvalWorkflow.reviewedAt = new Date();
  this.approvalWorkflow.reviewedBy = adminId;
  this.approvalWorkflow.rejectionReason = reason;
  this.isVerified = false;

  // Add to history
  this.approvalWorkflow.history.push({
    action: 'Rejected',
    date: new Date(),
    by: adminId,
    notes: reason,
  });

  return this.save();
};

/**
 * Suspend agency (Admin action)
 * @param {String} adminId - Admin who suspended
 * @param {String} reason - Suspension reason
 * @returns {Promise<Agency>}
 */
agencySchema.methods.suspend = async function (adminId, reason) {
  this.approvalWorkflow.status = 'Suspended';
  this.isActive = false;

  // Add to history
  this.approvalWorkflow.history.push({
    action: 'Suspended',
    date: new Date(),
    by: adminId,
    notes: reason,
  });

  return this.save();
};

// Virtual for compliance status badge
agencySchema.virtual('complianceStatusBadge').get(function () {
  const statusMap = {
    Excellent: '🟢 Excellent',
    Good: '🟡 Good',
    Fair: '🟠 Fair',
    Poor: '🔴 Poor',
    Critical: '⛔ Critical',
  };
  return statusMap[this.complianceScore.status] || this.complianceScore.status;
});

// Virtual for open violations count
agencySchema.virtual('openViolationsCount').get(function () {
  if (!this.complianceHistory) return 0;
  return this.complianceHistory.filter(
    (record) =>
      (record.type === 'Violation' || record.type === 'Complaint') &&
      (record.status === 'Open' || record.status === 'In Progress')
  ).length;
});

// ==================== METHODS ====================

/**
 * Check if agency license is valid
 * @returns {Boolean}
 */
agencySchema.methods.hasValidLicense = function () {
  if (!this.license.expiryDate) return this.license.isValid;
  return this.license.expiryDate > new Date() && this.license.isValid;
};

/**
 * Get agency's full address
 * @returns {String}
 */
agencySchema.methods.getFullAddress = function () {
  const parts = [
    this.location.address,
    this.location.city,
    this.location.district,
    this.location.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

// ==================== STATIC METHODS ====================

/**
 * Find verified agencies
 * @returns {Query}
 */
agencySchema.statics.findVerified = function () {
  return this.find({ isVerified: true, isActive: true });
};

/**
 * Find agencies by city
 * @param {String} city - City name
 * @returns {Query}
 */
agencySchema.statics.findByCity = function (city) {
  return this.find({ 'location.city': city, isActive: true });
};

/**
 * Find top-rated agencies
 * @param {Number} limit - Number of agencies to return
 * @returns {Query}
 */
agencySchema.statics.findTopRated = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'rating.average': -1 })
    .limit(limit);
};

// ==================== MIDDLEWARE ====================

// Pre-save middleware to update verification date
agencySchema.pre('save', function (next) {
  if (this.isModified('isVerified') && this.isVerified) {
    this.verificationDate = new Date();
  }
  next();
});

// ==================== EXPORT ====================

module.exports = mongoose.model('Agency', agencySchema);
