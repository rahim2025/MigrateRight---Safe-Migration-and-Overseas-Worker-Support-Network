/**
 * SalaryTracker Model
 * Tracks promised vs received salary for overseas workers with proof documents
 * Includes discrepancy detection and wage mismatch logic
 */

const mongoose = require('mongoose');

const salaryTrackerSchema = new mongoose.Schema(
  {
    // ==================== User Information ====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // ==================== Employment Details ====================
    employmentId: {
      type: String,
      required: [true, 'Employment ID is required'],
      maxlength: [100, 'Employment ID cannot exceed 100 characters'],
    },

    employerName: {
      type: String,
      required: [true, 'Employer name is required'],
      trim: true,
      maxlength: [200, 'Employer name cannot exceed 200 characters'],
    },

    employerCountry: {
      type: String,
      required: [true, 'Employer country is required'],
      trim: true,
    },

    position: {
      type: String,
      trim: true,
      maxlength: [150, 'Position cannot exceed 150 characters'],
    },

    // ==================== Salary Information ====================
    // Promised salary (from contract)
    promisedSalary: {
      type: Number,
      required: [true, 'Promised salary is required'],
      min: [0, 'Promised salary must be positive'],
    },

    // Actual received salary
    receivedSalary: {
      type: Number,
      required: [true, 'Received salary is required'],
      min: [0, 'Received salary must be positive'],
    },

    // Currency code (ISO 4217)
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      default: 'USD',
      maxlength: [3, 'Currency code must be 3 characters'],
    },

    paymentPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual'],
      default: 'monthly',
    },

    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      index: true,
    },

    // ==================== Deductions & Details ====================
    deductions: {
      housing: {
        type: Number,
        default: 0,
        min: [0, 'Housing deduction must be positive'],
      },
      meals: {
        type: Number,
        default: 0,
        min: [0, 'Meals deduction must be positive'],
      },
      taxes: {
        type: Number,
        default: 0,
        min: [0, 'Tax deduction must be positive'],
      },
      insurance: {
        type: Number,
        default: 0,
        min: [0, 'Insurance deduction must be positive'],
      },
      other: {
        type: Number,
        default: 0,
        min: [0, 'Other deduction must be positive'],
      },
      description: {
        type: String,
        maxlength: [500, 'Deduction description cannot exceed 500 characters'],
      },
    },

    // ==================== Discrepancy Analysis ====================
    // Auto-calculated wage mismatch
    discrepancy: {
      amount: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0, // Percentage of promised salary
      },
      status: {
        type: String,
        enum: ['match', 'minor_mismatch', 'significant_mismatch', 'critical_underpayment'],
        default: 'match',
        index: true,
      },
      hasDeductions: {
        type: Boolean,
        default: false,
      },
      totalDeductions: {
        type: Number,
        default: 0,
      },
    },

    // ==================== Proof Documents ====================
    proofDocuments: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        fileName: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          enum: ['image', 'pdf', 'document'],
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
          match: [/^(image\/|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument)/, 'Invalid MIME type'],
        },
        filePath: {
          type: String,
          required: true,
          unique: true, // Ensure no duplicate uploads
        },
        fileSize: {
          type: Number,
          required: true,
          max: [5242880, 'File size cannot exceed 5MB'],
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        documentType: {
          type: String,
          enum: ['payslip', 'bank_statement', 'contract', 'receipt', 'photo_evidence', 'other'],
          default: 'payslip',
        },
        description: {
          type: String,
          maxlength: [300, 'Description cannot exceed 300 characters'],
        },
      },
    ],

    // ==================== Status & Resolution ====================
    status: {
      type: String,
      enum: ['pending_review', 'verified', 'disputed', 'resolved', 'escalated'],
      default: 'pending_review',
      index: true,
    },

    // Resolution details if disputed
    resolution: {
      resolvedDate: Date,
      resolution: String,
      resolvedBy: mongoose.Schema.Types.ObjectId,
      notes: String,
    },

    // ==================== Metadata ====================
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    flaggedForReview: {
      type: Boolean,
      default: false,
      index: true,
    },

    reviewNotes: {
      type: String,
      maxlength: [500, 'Review notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'salaryTrackers',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== Indexes ====================
salaryTrackerSchema.index({ userId: 1, paymentDate: -1 });
salaryTrackerSchema.index({ userId: 1, status: 1 });
salaryTrackerSchema.index({ userId: 1, 'discrepancy.status': 1 });
salaryTrackerSchema.index({ 'discrepancy.status': 1 });
salaryTrackerSchema.index({ paymentDate: -1 });

// ==================== Virtual Fields ====================
salaryTrackerSchema.virtual('wageNetAmount').get(function () {
  return this.receivedSalary - (this.deductions.housing + this.deductions.meals + this.deductions.taxes + this.deductions.insurance + this.deductions.other);
});

salaryTrackerSchema.virtual('totalDeductionsAmount').get(function () {
  return this.deductions.housing + this.deductions.meals + this.deductions.taxes + this.deductions.insurance + this.deductions.other;
});

// ==================== Pre-save Middleware ====================
salaryTrackerSchema.pre('save', function (next) {
  // Calculate total deductions
  const totalDeductions = (this.deductions.housing || 0) + (this.deductions.meals || 0) + (this.deductions.taxes || 0) + (this.deductions.insurance || 0) + (this.deductions.other || 0);
  this.discrepancy.totalDeductions = totalDeductions;
  this.discrepancy.hasDeductions = totalDeductions > 0;

  // Calculate discrepancy
  const amount = this.promisedSalary - this.receivedSalary;
  this.discrepancy.amount = amount;

  // Calculate percentage (relative to promised salary)
  const percentage = (amount / this.promisedSalary) * 100;
  this.discrepancy.percentage = Math.round(percentage * 100) / 100; // Round to 2 decimals

  // Determine discrepancy status
  if (Math.abs(percentage) < 1) {
    this.discrepancy.status = 'match'; // Less than 1% difference
  } else if (percentage >= 1 && percentage < 10) {
    this.discrepancy.status = 'minor_mismatch'; // 1-10% difference
  } else if (percentage >= 10 && percentage < 30) {
    this.discrepancy.status = 'significant_mismatch'; // 10-30% difference
  } else if (percentage >= 30) {
    this.discrepancy.status = 'critical_underpayment'; // 30%+ difference
  }

  // Auto-flag for review if significant discrepancy
  if (this.discrepancy.status === 'significant_mismatch' || this.discrepancy.status === 'critical_underpayment') {
    this.flaggedForReview = true;
  }

  next();
});

// ==================== Methods ====================
/**
 * Calculate wage mismatch details
 */
salaryTrackerSchema.methods.calculateMismatch = function () {
  return {
    promisedSalary: this.promisedSalary,
    receivedSalary: this.receivedSalary,
    shortfallAmount: Math.max(0, this.promisedSalary - this.receivedSalary),
    shortfallPercentage: Math.max(0, this.discrepancy.percentage),
    totalDeductions: this.discrepancy.totalDeductions,
    netAmount: this.wageNetAmount,
    status: this.discrepancy.status,
    needsEscalation: this.discrepancy.status === 'critical_underpayment',
  };
};

/**
 * Add proof document
 */
salaryTrackerSchema.methods.addProofDocument = function (document) {
  document._id = new mongoose.Types.ObjectId();
  this.proofDocuments.push(document);
  return document;
};

/**
 * Remove proof document
 */
salaryTrackerSchema.methods.removeProofDocument = function (documentId) {
  this.proofDocuments = this.proofDocuments.filter(doc => doc._id.toString() !== documentId.toString());
};

/**
 * Mark as resolved
 */
salaryTrackerSchema.methods.markResolved = function (resolutionText, resolvedBy) {
  this.status = 'resolved';
  this.resolution = {
    resolvedDate: new Date(),
    resolution: resolutionText,
    resolvedBy,
  };
};

/**
 * Mark as disputed
 */
salaryTrackerSchema.methods.markDisputed = function (reason) {
  this.status = 'disputed';
  this.reviewNotes = reason;
  this.flaggedForReview = true;
};

// ==================== Statics ====================
/**
 * Get salary summary for user
 */
salaryTrackerSchema.statics.getUserSalarySummary = async function (userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        paymentDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: '$userId',
        totalPromised: { $sum: '$promisedSalary' },
        totalReceived: { $sum: '$receivedSalary' },
        totalShortfall: { $sum: { $max: [0, { $subtract: ['$promisedSalary', '$receivedSalary'] }] } },
        recordCount: { $sum: 1 },
        mismatchCount: {
          $sum: {
            $cond: [{ $gt: [{ $subtract: ['$promisedSalary', '$receivedSalary'] }, 0] }, 1, 0],
          },
        },
      },
    },
  ]);
};

/**
 * Find records by discrepancy status
 */
salaryTrackerSchema.statics.findByMismatchStatus = function (status, limit = 50) {
  return this.find({ 'discrepancy.status': status })
    .sort({ paymentDate: -1 })
    .limit(limit)
    .populate('userId', 'fullName email');
};

module.exports = mongoose.model('SalaryTracker', salaryTrackerSchema);
