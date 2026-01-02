const mongoose = require('mongoose');

/**
 * Emergency Event Schema
 * Stores SOS emergency incidents triggered by workers abroad
 * Tracks status, location, notifications, and responses
 */
const emergencyEventSchema = new mongoose.Schema(
  {
    // Worker Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    workerPhone: String,
    workerPassport: String,

    // Emergency Details
    emergencyType: {
      type: String,
      enum: [
        'medical',
        'accident',
        'abuse',
        'detention',
        'lost_documents',
        'threat',
        'harassment',
        'unpaid_wages',
        'unsafe_conditions',
        'other',
      ],
      default: 'other',
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'high',
      index: true,
    },

    // Location Data - GeoJSON format
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    locationDetails: {
      country: String,
      city: String,
      address: String,
      landmark: String,
    },
    locationAccuracy: Number, // in meters

    // Status Tracking
    status: {
      type: String,
      enum: ['active', 'in_progress', 'resolved', 'cancelled'],
      default: 'active',
      index: true,
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: String,

    // Nearest Help Assigned
    nearestContacts: [
      {
        contactId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'EmergencyContact',
        },
        name: String,
        type: String,
        distance: Number, // in kilometers
        phone: String,
        emergencyHotline: String,
        notified: {
          type: Boolean,
          default: false,
        },
        notifiedAt: Date,
      },
    ],

    // Family Notifications
    familyNotifications: [
      {
        familyMemberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        relationship: String,
        phone: String,
        email: String,
        notified: {
          type: Boolean,
          default: false,
        },
        notifiedAt: Date,
        notificationMethod: {
          type: String,
          enum: ['email', 'app', 'both'],
          default: 'both',
        },
        acknowledged: {
          type: Boolean,
          default: false,
        },
        acknowledgedAt: Date,
      },
    ],

    // Response Timeline
    timeline: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        action: {
          type: String,
          enum: [
            'sos_triggered',
            'location_updated',
            'contacts_notified',
            'family_notified',
            'help_dispatched',
            'worker_contacted',
            'status_updated',
            'resolved',
            'cancelled',
          ],
        },
        description: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // Additional Data
    deviceInfo: {
      userAgent: String,
      platform: String,
      ipAddress: String,
    },
    attachments: [
      {
        type: String, // URL to image/document
        uploadedAt: Date,
      },
    ],

    // Admin/Support Notes
    supportNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Auto-cancellation
    autoCancelledAt: Date,
    autoCancellationReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
emergencyEventSchema.index({ location: '2dsphere' });
emergencyEventSchema.index({ userId: 1, status: 1 });
emergencyEventSchema.index({ status: 1, severity: 1, createdAt: -1 });
emergencyEventSchema.index({ createdAt: -1 });

// Virtual: Duration since SOS triggered
emergencyEventSchema.virtual('durationMinutes').get(function () {
  if (this.resolvedAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60));
  }
  return Math.floor((new Date() - this.createdAt) / (1000 * 60));
});

// Virtual: Is currently active
emergencyEventSchema.virtual('isActive').get(function () {
  return this.status === 'active' || this.status === 'in_progress';
});

// Virtual: Notification summary
emergencyEventSchema.virtual('notificationSummary').get(function () {
  const familyNotified = this.familyNotifications.filter((n) => n.notified).length;
  const contactsNotified = this.nearestContacts.filter((c) => c.notified).length;
  
  return {
    familyNotified,
    totalFamily: this.familyNotifications.length,
    contactsNotified,
    totalContacts: this.nearestContacts.length,
    allNotified: familyNotified === this.familyNotifications.length && contactsNotified === this.nearestContacts.length,
  };
});

// Instance Methods

/**
 * Add timeline entry
 */
emergencyEventSchema.methods.addTimelineEntry = function (action, description, userId = null) {
  this.timeline.push({
    action,
    description,
    performedBy: userId,
  });
  return this.save();
};

/**
 * Mark family member as notified
 */
emergencyEventSchema.methods.markFamilyNotified = function (familyMemberId) {
  const notification = this.familyNotifications.find(
    (n) => n.familyMemberId.toString() === familyMemberId.toString()
  );
  if (notification) {
    notification.notified = true;
    notification.notifiedAt = new Date();
  }
  return this.save();
};

/**
 * Mark contact as notified
 */
emergencyEventSchema.methods.markContactNotified = function (contactId) {
  const contact = this.nearestContacts.find(
    (c) => c.contactId.toString() === contactId.toString()
  );
  if (contact) {
    contact.notified = true;
    contact.notifiedAt = new Date();
  }
  return this.save();
};

/**
 * Update status
 */
emergencyEventSchema.methods.updateStatus = function (newStatus, userId = null, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
    this.resolvedBy = userId;
    this.resolutionNotes = notes;
  }

  this.addTimelineEntry('status_updated', `Status changed to ${newStatus}`, userId);
  
  return this.save();
};

/**
 * Add support note
 */
emergencyEventSchema.methods.addSupportNote = function (note, userId) {
  this.supportNotes.push({
    note,
    addedBy: userId,
  });
  return this.save();
};

/**
 * Check if event is stale (active for more than 24 hours)
 */
emergencyEventSchema.methods.isStale = function () {
  if (this.status !== 'active' && this.status !== 'in_progress') return false;
  const hoursSinceCreated = (new Date() - this.createdAt) / (1000 * 60 * 60);
  return hoursSinceCreated > 24;
};

// Static Methods

/**
 * Get active emergencies
 */
emergencyEventSchema.statics.getActive = function () {
  return this.find({
    status: { $in: ['active', 'in_progress'] },
  })
    .sort({ severity: -1, createdAt: -1 })
    .populate('userId', 'firstName lastName phone email')
    .populate('nearestContacts.contactId');
};

/**
 * Get user's emergency history
 */
emergencyEventSchema.statics.getUserHistory = function (userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('nearestContacts.contactId', 'name type phone');
};

/**
 * Get recent emergencies (last 7 days)
 */
emergencyEventSchema.statics.getRecent = function (days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    createdAt: { $gte: startDate },
  })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName');
};

/**
 * Get emergencies by severity
 */
emergencyEventSchema.statics.getBySeverity = function (severity) {
  return this.find({
    severity,
    status: { $in: ['active', 'in_progress'] },
  })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName phone');
};

/**
 * Find emergencies near location
 */
emergencyEventSchema.statics.findNearLocation = function (longitude, latitude, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    status: { $in: ['active', 'in_progress'] },
  }).limit(10);
};

/**
 * Auto-cancel stale emergencies
 */
emergencyEventSchema.statics.autoCancelStale = async function (hoursThreshold = 48) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold);

  const result = await this.updateMany(
    {
      status: { $in: ['active', 'in_progress'] },
      createdAt: { $lt: cutoffDate },
      autoCancelledAt: null,
    },
    {
      $set: {
        status: 'cancelled',
        autoCancelledAt: new Date(),
        autoCancellationReason: `Auto-cancelled after ${hoursThreshold} hours of no resolution`,
      },
    }
  );

  return result.modifiedCount;
};

// Pre-save middleware
emergencyEventSchema.pre('save', function (next) {
  // Ensure timeline has initial entry
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      action: 'sos_triggered',
      description: 'Emergency SOS activated',
    });
  }
  next();
});

const EmergencyEvent = mongoose.model('EmergencyEvent', emergencyEventSchema);

module.exports = EmergencyEvent;
