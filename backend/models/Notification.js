const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores in-app notifications for users (especially admins)
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['emergency_sos', 'complaint', 'review', 'system', 'message', 'other'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      default: 'info',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['EmergencyEvent', 'Complaint', 'Review', 'User', 'Agency', 'Conversation', 'Message'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    actionUrl: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, severity: 1 });

// Static Methods
notificationSchema.statics.createForAllAdmins = async function (notificationData) {
  const User = mongoose.model('User');
  // Find both platform_admin and admin roles
  const admins = await User.find({ 
    role: { $in: ['platform_admin', 'admin', 'recruitment_admin'] }
  }).select('_id role email fullName');
  
  console.log(`[Notification] Found ${admins.length} admin(s) to notify`);
  console.log(`[Notification] Admin details:`, admins.map(a => ({ 
    id: a._id, 
    role: a.role, 
    email: a.email,
    name: a.fullName 
  })));
  
  if (admins.length === 0) {
    console.warn('[Notification] ⚠️ WARNING: No admins found to notify!');
    console.warn('[Notification] Emergency SOS notifications will NOT be sent to any admin.');
    return [];
  }
  
  const notifications = admins.map(admin => ({
    userId: admin._id,
    ...notificationData,
  }));

  const createdNotifications = await this.insertMany(notifications);
  console.log(`[Notification] ✅ Successfully created ${createdNotifications.length} notification(s)`);
  
  return createdNotifications;
};

notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ userId, read: false });
};

notificationSchema.statics.markAsRead = async function (notificationId, userId) {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true, readAt: new Date() },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
