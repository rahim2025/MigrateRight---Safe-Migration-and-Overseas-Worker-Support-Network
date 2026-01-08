const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores individual messages between users and agencies
 */
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'agency', 'recruitment_admin', 'platform_admin', 'aspiring_migrant', 'worker', 'admin'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: [
      {
        url: String,
        type: String,
        filename: String,
        size: Number,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ conversationId: 1, isDeleted: 1, createdAt: -1 });

// Instance Methods
messageSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Static Methods
messageSchema.statics.getUnreadCount = async function (userId, conversationId = null) {
  const query = { receiverId: userId, isRead: false, isDeleted: false };
  if (conversationId) {
    query.conversationId = conversationId;
  }
  return this.countDocuments(query);
};

messageSchema.statics.markConversationAsRead = async function (conversationId, userId) {
  return this.updateMany(
    {
      conversationId,
      receiverId: userId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
