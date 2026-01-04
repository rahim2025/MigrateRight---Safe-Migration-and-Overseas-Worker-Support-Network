/**
 * Complaint Model
 * Mongoose schema for complaints filed by workers against agencies
 * 
 * Relationships:
 * - agencyId: ObjectId reference to Agency model (Many-to-One)
 * - workerId: ObjectId reference to User/Worker model (Many-to-One)
 * - assignedTo: ObjectId reference to Admin/User model (optional)
 * 
 * Features:
 * - Auto-generated tracking number (MR-COMP-YYYY-XXXX format)
 * - Pre-save middleware sanitizes description (removes HTML/script tags)
 * - Pre-save middleware auto-updates lastStatusUpdate on status change
 * - Instance methods for status updates, admin assignment, evidence management
 * - Static methods for analytics and dashboard queries
 * - Virtual fields for days open, pending/resolved status checks
 */

const mongoose = require('mongoose');

// Evidence subdocument schema
const EvidenceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['document', 'image', 'video'],
        message: '{VALUE} is not a valid evidence type',
      },
      required: [true, 'Evidence type is required'],
    },
    url: {
      type: String,
      required: [true, 'Evidence URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          // Basic URL validation
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v) ||
                 /^\/uploads\//.test(v); // Allow relative upload paths
        },
        message: 'Please provide a valid URL',
      },
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Evidence description cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

const ComplaintSchema = new mongoose.Schema(
  {
    // Reference to the agency being complained about (REQUIRED)
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: [true, 'Agency ID is required'],
      index: true,
    },

    // Reference to the worker filing the complaint (REQUIRED)
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker ID is required'],
      index: true,
    },

    // Type of complaint (REQUIRED)
    complaintType: {
      type: String,
      enum: {
        values: ['fee_exploitation', 'false_promises', 'poor_conditions', 'contract_violation', 'abuse', 'other'],
        message: '{VALUE} is not a valid complaint type',
      },
      required: [true, 'Complaint type is required'],
    },

    // Detailed description of the complaint (REQUIRED)
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [50, 'Description must be at least 50 characters for proper investigation'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // Severity level (REQUIRED)
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid severity level',
      },
      default: 'medium',
      required: [true, 'Severity level is required'],
    },

    // Current status of the complaint (REQUIRED)
    status: {
      type: String,
      enum: {
        values: ['pending', 'under_review', 'investigating', 'resolved', 'dismissed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      required: [true, 'Status is required'],
    },

    // Unique tracking number (auto-generated)
    trackingNumber: {
      type: String,
      unique: true,
      index: true,
    },

    // Evidence documents/images/videos
    evidence: [EvidenceSchema],

    // Admin assigned to handle the complaint
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Resolution details
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Resolution notes cannot exceed 2000 characters'],
    },

    resolutionDate: {
      type: Date,
    },

    actionTaken: {
      type: String,
      trim: true,
      maxlength: [1000, 'Action taken cannot exceed 1000 characters'],
    },

    // Privacy settings
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    // Last status update timestamp
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },

    // Status history for audit trail
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'under_review', 'investigating', 'resolved', 'dismissed'],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Index for admin dashboard queries (agency complaints by status)
ComplaintSchema.index({ agencyId: 1, status: 1, createdAt: -1 });

// Index for worker's complaint history
ComplaintSchema.index({ workerId: 1, createdAt: -1 });

// Index for priority filtering
ComplaintSchema.index({ status: 1, severity: 1 });

// Index for analytics by complaint type
ComplaintSchema.index({ complaintType: 1 });

// Index for assigned admin queries
ComplaintSchema.index({ assignedTo: 1, status: 1 });

// ==================== VIRTUAL FIELDS ====================

/**
 * Virtual: daysOpen
 * Calculates the number of days since the complaint was filed
 */
ComplaintSchema.virtual('daysOpen').get(function () {
  if (!this.createdAt) return 0;
  
  // If resolved, calculate days until resolution
  if (this.status === 'resolved' && this.resolutionDate) {
    const resolved = new Date(this.resolutionDate);
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(resolved - created);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Otherwise, calculate days until now
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Virtual: isPending
 * Returns true if status is 'pending'
 */
ComplaintSchema.virtual('isPending').get(function () {
  return this.status === 'pending';
});

/**
 * Virtual: isResolved
 * Returns true if status is 'resolved'
 */
ComplaintSchema.virtual('isResolved').get(function () {
  return this.status === 'resolved';
});

/**
 * Virtual: isHighPriority
 * Returns true if severity is 'high' or 'critical'
 */
ComplaintSchema.virtual('isHighPriority').get(function () {
  return this.severity === 'high' || this.severity === 'critical';
});

// ==================== INSTANCE METHODS ====================

/**
 * Update the complaint status
 * @param {String} newStatus - The new status to set
 * @param {String} notes - Optional notes about the status change
 * @param {ObjectId} changedBy - Optional user ID who made the change
 * @returns {Promise<Complaint>} The saved complaint document
 */
ComplaintSchema.methods.updateStatus = async function (newStatus, notes = '', changedBy = null) {
  const validStatuses = ['pending', 'under_review', 'investigating', 'resolved', 'dismissed'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: changedBy,
    notes: notes,
  });
  
  this.status = newStatus;
  this.lastStatusUpdate = new Date();
  
  // If resolved, set resolution date
  if (newStatus === 'resolved') {
    this.resolutionDate = new Date();
  }
  
  return this.save();
};

/**
 * Assign the complaint to an admin
 * @param {ObjectId} adminId - The admin user ID to assign to
 * @returns {Promise<Complaint>} The saved complaint document
 */
ComplaintSchema.methods.assignToAdmin = async function (adminId) {
  this.assignedTo = adminId;
  
  // If still pending, move to under_review
  if (this.status === 'pending') {
    this.status = 'under_review';
    this.lastStatusUpdate = new Date();
    this.statusHistory.push({
      status: 'under_review',
      changedAt: new Date(),
      changedBy: adminId,
      notes: 'Complaint assigned for review',
    });
  }
  
  return this.save();
};

/**
 * Add evidence to the complaint
 * @param {Object} evidenceObject - Evidence object with type, url, description
 * @returns {Promise<Complaint>} The saved complaint document
 */
ComplaintSchema.methods.addEvidence = async function (evidenceObject) {
  if (!evidenceObject.type || !evidenceObject.url) {
    throw new Error('Evidence must have type and url');
  }
  
  this.evidence.push({
    type: evidenceObject.type,
    url: evidenceObject.url,
    uploadedAt: new Date(),
    description: evidenceObject.description || '',
  });
  
  return this.save();
};

/**
 * Resolve the complaint
 * @param {String} resolutionNotes - Notes about the resolution
 * @param {String} actionTaken - Action taken to resolve the complaint
 * @param {ObjectId} resolvedBy - User ID who resolved the complaint
 * @returns {Promise<Complaint>} The saved complaint document
 */
ComplaintSchema.methods.resolve = async function (resolutionNotes, actionTaken = '', resolvedBy = null) {
  this.status = 'resolved';
  this.resolutionNotes = resolutionNotes;
  this.resolutionDate = new Date();
  this.lastStatusUpdate = new Date();
  
  if (actionTaken) {
    this.actionTaken = actionTaken;
  }
  
  this.statusHistory.push({
    status: 'resolved',
    changedAt: new Date(),
    changedBy: resolvedBy,
    notes: resolutionNotes,
  });
  
  return this.save();
};

/**
 * Dismiss the complaint
 * @param {String} reason - Reason for dismissal
 * @param {ObjectId} dismissedBy - User ID who dismissed the complaint
 * @returns {Promise<Complaint>} The saved complaint document
 */
ComplaintSchema.methods.dismiss = async function (reason, dismissedBy = null) {
  this.status = 'dismissed';
  this.resolutionNotes = reason;
  this.resolutionDate = new Date();
  this.lastStatusUpdate = new Date();
  
  this.statusHistory.push({
    status: 'dismissed',
    changedAt: new Date(),
    changedBy: dismissedBy,
    notes: reason,
  });
  
  return this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Get complaint statistics for an agency
 * @param {ObjectId} agencyId - Agency ID
 * @returns {Promise<Object>} Statistics object
 */
ComplaintSchema.statics.getStatsByAgency = async function (agencyId) {
  const stats = await this.aggregate([
    {
      $match: {
        agencyId: new mongoose.Types.ObjectId(agencyId),
      },
    },
    {
      $group: {
        _id: null,
        totalComplaints: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        underReviewCount: {
          $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] },
        },
        investigatingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'investigating'] }, 1, 0] },
        },
        resolvedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
        },
        dismissedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] },
        },
        criticalCount: {
          $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] },
        },
        highCount: {
          $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] },
        },
        byType: {
          $push: '$complaintType',
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalComplaints: 1,
        pendingCount: 1,
        underReviewCount: 1,
        investigatingCount: 1,
        resolvedCount: 1,
        dismissedCount: 1,
        criticalCount: 1,
        highCount: 1,
        activeComplaints: {
          $add: ['$pendingCount', '$underReviewCount', '$investigatingCount'],
        },
      },
    },
  ]);

  // Get complaint type breakdown
  const typeBreakdown = await this.aggregate([
    {
      $match: {
        agencyId: new mongoose.Types.ObjectId(agencyId),
      },
    },
    {
      $group: {
        _id: '$complaintType',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = stats[0] || {
    totalComplaints: 0,
    pendingCount: 0,
    underReviewCount: 0,
    investigatingCount: 0,
    resolvedCount: 0,
    dismissedCount: 0,
    criticalCount: 0,
    highCount: 0,
    activeComplaints: 0,
  };

  result.byType = {};
  typeBreakdown.forEach((item) => {
    result.byType[item._id] = item.count;
  });

  return result;
};

/**
 * Get count of pending complaints
 * @returns {Promise<Number>} Count of pending complaints
 */
ComplaintSchema.statics.getPendingCount = async function () {
  return this.countDocuments({ status: 'pending' });
};

/**
 * Get complaints by severity level
 * @param {String} severity - Severity level
 * @param {Object} options - Query options (limit, skip, etc.)
 * @returns {Query} Mongoose query
 */
ComplaintSchema.statics.getBySeverity = function (severity, options = {}) {
  return this.find({ severity })
    .populate('workerId', 'fullName email phoneNumber')
    .populate('agencyId', 'name location.city contact')
    .populate('assignedTo', 'fullName email')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

/**
 * Get high priority complaints (critical and high severity, not resolved)
 * @returns {Query} Mongoose query
 */
ComplaintSchema.statics.getHighPriority = function () {
  return this.find({
    severity: { $in: ['critical', 'high'] },
    status: { $nin: ['resolved', 'dismissed'] },
  })
    .populate('workerId', 'fullName email phoneNumber')
    .populate('agencyId', 'name location.city')
    .sort({ severity: -1, createdAt: 1 }); // Critical first, oldest first
};

/**
 * Get complaints for dashboard
 * @param {Object} filters - Optional filters
 * @returns {Query} Mongoose query
 */
ComplaintSchema.statics.getForDashboard = function (filters = {}) {
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.severity) query.severity = filters.severity;
  if (filters.complaintType) query.complaintType = filters.complaintType;
  if (filters.agencyId) query.agencyId = filters.agencyId;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  
  return this.find(query)
    .populate('workerId', 'fullName email')
    .populate('agencyId', 'name')
    .populate('assignedTo', 'fullName')
    .sort({ createdAt: -1 });
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware
 * - Auto-generate trackingNumber if not exists
 * - Sanitize description (remove HTML/script tags)
 * - Update lastStatusUpdate when status changes
 */
ComplaintSchema.pre('save', async function (next) {
  try {
    // Generate tracking number for new complaints
    if (this.isNew && !this.trackingNumber) {
      const year = new Date().getFullYear();
      
      // Get the count of complaints this year
      const count = await mongoose.model('Complaint').countDocuments({
        trackingNumber: { $regex: `^MR-COMP-${year}-` },
      });
      
      // Generate padded sequential number (4 digits)
      const sequentialNumber = String(count + 1).padStart(4, '0');
      this.trackingNumber = `MR-COMP-${year}-${sequentialNumber}`;
    }
    
    // Sanitize description: Remove HTML tags and script tags
    if (this.isModified('description') && this.description) {
      // Remove script tags and their content
      this.description = this.description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      // Remove all HTML tags
      this.description = this.description.replace(/<[^>]*>/g, '');
      // Trim whitespace
      this.description = this.description.trim();
    }
    
    // Sanitize resolution notes if modified
    if (this.isModified('resolutionNotes') && this.resolutionNotes) {
      this.resolutionNotes = this.resolutionNotes.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      this.resolutionNotes = this.resolutionNotes.replace(/<[^>]*>/g, '');
      this.resolutionNotes = this.resolutionNotes.trim();
    }
    
    // Update lastStatusUpdate when status changes
    if (this.isModified('status')) {
      this.lastStatusUpdate = new Date();
    }
    
    // Initialize status history for new complaints
    if (this.isNew) {
      this.statusHistory = [
        {
          status: this.status,
          changedAt: new Date(),
          notes: 'Complaint filed',
        },
      ];
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Post-save middleware
 * Log complaint creation/updates for auditing
 */
ComplaintSchema.post('save', function (doc) {
  // Could add logging, notifications, or other side effects here
  if (doc.isNew) {
    console.log(`New complaint filed: ${doc.trackingNumber}`);
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
