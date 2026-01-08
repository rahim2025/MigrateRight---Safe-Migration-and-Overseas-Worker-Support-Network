const mongoose = require('mongoose');

/**
 * Conversation Schema
 * Stores conversation threads between users and agencies
 */
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userType: {
          type: String,
          enum: ['user', 'agency', 'recruitment_admin', 'platform_admin', 'aspiring_migrant', 'worker', 'admin'],
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastMessage: {
      message: String,
      senderId: mongoose.Schema.Types.ObjectId,
      senderName: String,
      createdAt: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    metadata: {
      agencyName: String,
      userName: String,
      agencyEmail: String,
      userEmail: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ userId: 1, agencyId: 1 }, { unique: true });
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ 'lastMessage.createdAt': -1 });
conversationSchema.index({ isActive: 1, 'lastMessage.createdAt': -1 });

// Instance Methods
conversationSchema.methods.updateLastMessage = async function (messageData) {
  this.lastMessage = {
    message: messageData.message,
    senderId: messageData.senderId,
    senderName: messageData.senderName,
    createdAt: new Date(),
  };
  return this.save();
};

conversationSchema.methods.incrementUnreadCount = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

conversationSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Static Methods
conversationSchema.statics.findOrCreate = async function (userId, agencyId, userInfo, agencyInfo) {
  let conversation = await this.findOne({ userId, agencyId });

  if (!conversation) {
    conversation = await this.create({
      participants: [
        { 
          userId, 
          userType: userInfo.role || 'user',
        },
        { 
          userId: agencyId, 
          userType: agencyInfo.role || 'agency',
        },
      ],
      agencyId,
      userId,
      metadata: {
        agencyName: agencyInfo.fullName || agencyInfo.email,
        userName: userInfo.fullName || userInfo.email,
        agencyEmail: agencyInfo.email,
        userEmail: userInfo.email,
      },
      unreadCount: new Map([
        [userId.toString(), 0],
        [agencyId.toString(), 0],
      ]),
    });
  }

  return conversation;
};

conversationSchema.statics.getUserConversations = async function (userId, options = {}) {
  const { page = 1, limit = 20, includeArchived = false } = options;

  const query = {
    'participants.userId': userId,
    isActive: true,
  };

  if (!includeArchived) {
    query.isArchived = false;
  }

  console.log('[Conversation] getUserConversations query:', JSON.stringify(query));
  console.log('[Conversation] Searching for userId:', userId);

  const conversations = await this.find(query)
    .sort({ 'lastMessage.createdAt': -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();

  console.log('[Conversation] Found conversations:', conversations.length);

  const total = await this.countDocuments(query);

  // Enrich conversations with participant data from metadata
  const enrichedConversations = conversations.map(conv => ({
    ...conv,
    participants: conv.participants.map(p => ({
      userId: {
        _id: p.userId,
        fullName: p.userId.toString() === userId.toString() 
          ? conv.metadata?.userName 
          : conv.metadata?.agencyName,
        email: p.userId.toString() === userId.toString() 
          ? conv.metadata?.userEmail 
          : conv.metadata?.agencyEmail,
        role: p.userType,
      },
      userType: p.userType,
      joinedAt: p.joinedAt,
    })),
  }));

  return {
    conversations: enrichedConversations,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
