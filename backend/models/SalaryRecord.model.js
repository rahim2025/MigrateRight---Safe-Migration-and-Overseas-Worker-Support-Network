/**
 * SalaryRecord Model
 * Tracks promised vs received salary for overseas workers
 */

const mongoose = require('mongoose');

const salaryRecordSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Employer information
    employerName: {
      type: String,
      required: [true, 'Employer name is required'],
      trim: true,
      maxlength: [200, 'Employer name cannot exceed 200 characters'],
    },

    employerCountry: {
      type: String,
      trim: true,
      maxlength: [100, 'Country name cannot exceed 100 characters'],
    },

    // Contract/Promised salary
    contractSalary: {
      type: Number,
      required: [true, 'Contract salary is required'],
      min: [0, 'Contract salary must be positive'],
    },

    // Actual received salary
    receivedSalary: {
      type: Number,
      required: [true, 'Received salary is required'],
      min: [0, 'Received salary must be positive'],
    },

    // Currency
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      uppercase: true,
      default: 'USD',
      maxlength: [3, 'Currency code must be 3 characters'],
    },

    // Payment details
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      index: true,
    },

    paymentPeriod: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual', 'one_time'],
      default: 'monthly',
    },

    // Discrepancy calculations (auto-calculated)
    discrepancyAmount: {
      type: Number,
      default: 0,
    },

    discrepancyPercentage: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['paid_full', 'partial', 'unpaid', 'disputed', 'resolved'],
      default: 'partial',
      index: true,
    },

    // Proof documents
    proofDocuments: [
      {
        fileName: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          enum: ['image', 'pdf', 'document'],
          required: true,
        },
        fileSize: {
          type: Number, // in bytes
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Additional details
    workType: {
      type: String,
      trim: true,
      maxlength: [100, 'Work type cannot exceed 100 characters'],
    },

    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    // Deductions (if any)
    deductions: {
      accommodation: {
        type: Number,
        default: 0,
      },
      food: {
        type: Number,
        default: 0,
      },
      transport: {
        type: Number,
        default: 0,
      },
      other: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
        maxlength: [500, 'Deduction description cannot exceed 500 characters'],
      },
    },

    // Dispute information
    isDisputed: {
      type: Boolean,
      default: false,
      index: true,
    },

    disputeDetails: {
      reason: String,
      filedDate: Date,
      resolvedDate: Date,
      resolution: String,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================

// Compound index for user's salary records sorted by date
salaryRecordSchema.index({ userId: 1, paymentDate: -1 });

// Index for discrepancy queries
salaryRecordSchema.index({ discrepancyPercentage: -1 });

// Index for status filtering
salaryRecordSchema.index({ userId: 1, status: 1 });

// ==================== VIRTUALS ====================

// Virtual for total deductions
salaryRecordSchema.virtual('totalDeductions').get(function () {
  return (
    (this.deductions?.accommodation || 0) +
    (this.deductions?.food || 0) +
    (this.deductions?.transport || 0) +
    (this.deductions?.other || 0)
  );
});

// Virtual for expected net salary (contract - deductions)
salaryRecordSchema.virtual('expectedNetSalary').get(function () {
  return this.contractSalary - this.totalDeductions;
});

// Virtual for has discrepancy flag
salaryRecordSchema.virtual('hasDiscrepancy').get(function () {
  return Math.abs(this.discrepancyAmount) > 0.01; // Tolerance for floating point
});

// Virtual for discrepancy severity
salaryRecordSchema.virtual('discrepancySeverity').get(function () {
  const absPercentage = Math.abs(this.discrepancyPercentage);
  if (absPercentage >= 50) return 'critical';
  if (absPercentage >= 25) return 'high';
  if (absPercentage >= 10) return 'medium';
  if (absPercentage > 0) return 'low';
  return 'none';
});

// ==================== MIDDLEWARE ====================

// Pre-save: Calculate discrepancies
salaryRecordSchema.pre('save', function (next) {
  // Calculate discrepancy amount
  this.discrepancyAmount = this.contractSalary - this.receivedSalary;

  // Calculate discrepancy percentage
  if (this.contractSalary > 0) {
    this.discrepancyPercentage = (this.discrepancyAmount / this.contractSalary) * 100;
  } else {
    this.discrepancyPercentage = 0;
  }

  // Auto-determine status based on payment
  if (!this.isModified('status')) {
    if (this.receivedSalary === 0) {
      this.status = 'unpaid';
    } else if (Math.abs(this.discrepancyAmount) < 0.01) {
      this.status = 'paid_full';
    } else if (this.receivedSalary < this.contractSalary) {
      this.status = 'partial';
    } else {
      this.status = 'paid_full'; // Received more than expected
    }
  }

  // If disputed, override status
  if (this.isDisputed && this.status !== 'resolved') {
    this.status = 'disputed';
  }

  next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Add proof document
 * @param {Object} fileData - File information
 */
salaryRecordSchema.methods.addProofDocument = function (fileData) {
  this.proofDocuments.push({
    fileName: fileData.fileName,
    fileUrl: fileData.fileUrl,
    fileType: fileData.fileType,
    fileSize: fileData.fileSize,
    uploadedAt: new Date(),
  });
  return this.save();
};

/**
 * Remove proof document
 * @param {String} documentId - Document ID to remove
 */
salaryRecordSchema.methods.removeProofDocument = function (documentId) {
  this.proofDocuments = this.proofDocuments.filter(
    (doc) => doc._id.toString() !== documentId.toString()
  );
  return this.save();
};

/**
 * Mark as disputed
 * @param {String} reason - Reason for dispute
 */
salaryRecordSchema.methods.markAsDisputed = function (reason) {
  this.isDisputed = true;
  this.status = 'disputed';
  this.disputeDetails = {
    reason,
    filedDate: new Date(),
  };
  return this.save();
};

/**
 * Resolve dispute
 * @param {String} resolution - Resolution details
 */
salaryRecordSchema.methods.resolveDispute = function (resolution) {
  this.status = 'resolved';
  if (!this.disputeDetails) {
    this.disputeDetails = {};
  }
  this.disputeDetails.resolvedDate = new Date();
  this.disputeDetails.resolution = resolution;
  return this.save();
};

/**
 * Calculate total received over period
 * @param {Array} records - Array of salary records
 * @returns {Number} Total received
 */
salaryRecordSchema.statics.calculateTotalReceived = function (records) {
  return records.reduce((total, record) => total + (record.receivedSalary || 0), 0);
};

/**
 * Calculate total expected over period
 * @param {Array} records - Array of salary records
 * @returns {Number} Total expected
 */
salaryRecordSchema.statics.calculateTotalExpected = function (records) {
  return records.reduce((total, record) => total + (record.contractSalary || 0), 0);
};

// ==================== STATIC METHODS ====================

/**
 * Get user's salary records with filtering
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Salary records
 */
salaryRecordSchema.statics.getUserRecords = async function (userId, filters = {}) {
  const query = { userId };

  // Filter by status
  if (filters.status) {
    query.status = filters.status;
  }

  // Filter by date range
  if (filters.startDate || filters.endDate) {
    query.paymentDate = {};
    if (filters.startDate) {
      query.paymentDate.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.paymentDate.$lte = new Date(filters.endDate);
    }
  }

  // Filter by discrepancy
  if (filters.hasDiscrepancy === true) {
    query.discrepancyAmount = { $ne: 0 };
  }

  // Filter by employer
  if (filters.employerName) {
    query.employerName = new RegExp(filters.employerName, 'i');
  }

  return this.find(query)
    .sort({ paymentDate: -1 })
    .limit(filters.limit || 50)
    .exec();
};

/**
 * Get records with significant discrepancies
 * @param {String} userId - User ID
 * @param {Number} minPercentage - Minimum discrepancy percentage
 * @returns {Promise<Array>} Records with discrepancies
 */
salaryRecordSchema.statics.getDiscrepancyRecords = async function (userId, minPercentage = 5) {
  return this.find({
    userId,
    discrepancyPercentage: { $gte: minPercentage },
  })
    .sort({ discrepancyPercentage: -1 })
    .exec();
};

/**
 * Get salary statistics for user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
salaryRecordSchema.statics.getUserStatistics = async function (userId) {
  const records = await this.find({ userId }).exec();

  if (records.length === 0) {
    return {
      totalRecords: 0,
      totalExpected: 0,
      totalReceived: 0,
      totalDiscrepancy: 0,
      averageDiscrepancyPercentage: 0,
      recordsWithDiscrepancy: 0,
      unpaidCount: 0,
      partialCount: 0,
      paidFullCount: 0,
      disputedCount: 0,
    };
  }

  const totalExpected = records.reduce((sum, r) => sum + r.contractSalary, 0);
  const totalReceived = records.reduce((sum, r) => sum + r.receivedSalary, 0);
  const totalDiscrepancy = totalExpected - totalReceived;

  const recordsWithDiscrepancy = records.filter((r) => Math.abs(r.discrepancyAmount) > 0.01).length;

  const avgDiscrepancy =
    records.reduce((sum, r) => sum + Math.abs(r.discrepancyPercentage), 0) / records.length;

  return {
    totalRecords: records.length,
    totalExpected,
    totalReceived,
    totalDiscrepancy,
    averageDiscrepancyPercentage: avgDiscrepancy,
    recordsWithDiscrepancy,
    unpaidCount: records.filter((r) => r.status === 'unpaid').length,
    partialCount: records.filter((r) => r.status === 'partial').length,
    paidFullCount: records.filter((r) => r.status === 'paid_full').length,
    disputedCount: records.filter((r) => r.status === 'disputed').length,
  };
};

/**
 * Get disputed records
 * @param {String} userId - User ID (optional, for admin get all)
 * @returns {Promise<Array>} Disputed records
 */
salaryRecordSchema.statics.getDisputedRecords = async function (userId = null) {
  const query = { isDisputed: true };
  if (userId) {
    query.userId = userId;
  }

  return this.find(query)
    .populate('userId', 'name email phone')
    .sort({ 'disputeDetails.filedDate': -1 })
    .exec();
};

/**
 * Get recent records
 * @param {String} userId - User ID
 * @param {Number} limit - Number of records to return
 * @returns {Promise<Array>} Recent salary records
 */
salaryRecordSchema.statics.getRecentRecords = async function (userId, limit = 10) {
  return this.find({ userId })
    .sort({ paymentDate: -1 })
    .limit(limit)
    .exec();
};

// ==================== OPTIONS ====================

// Include virtuals in JSON and Object outputs
salaryRecordSchema.set('toJSON', { virtuals: true });
salaryRecordSchema.set('toObject', { virtuals: true });

const SalaryRecord = mongoose.model('SalaryRecord', salaryRecordSchema);

module.exports = SalaryRecord;
