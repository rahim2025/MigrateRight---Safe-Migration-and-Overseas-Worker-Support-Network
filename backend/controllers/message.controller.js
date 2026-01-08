const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Agency = require('../models/Agency.model');
const logger = require('../utils/logger');

/**
 * Start a new conversation or get existing one
 * @route POST /api/messages/conversations/:agencyId
 * @access Private
 */
exports.startConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { agencyId } = req.params;
    // Resolve the actual agency user account (owner) so agency logins can see the thread
    let agencyUser = await User.findById(agencyId);
    let agencyDisplay = null;

    if (agencyUser && ['agency', 'recruitment_admin'].includes(agencyUser.role)) {
      agencyDisplay = {
        id: agencyUser._id,
        name: agencyUser.fullName || agencyUser.email,
        email: agencyUser.email,
        role: agencyUser.role,
      };
    } else {
      const agencyDoc = await Agency.findById(agencyId);

      if (!agencyDoc) {
        return res.status(404).json({
          success: false,
          message: 'Agency not found',
        });
      }

      if (!agencyDoc.owner) {
        return res.status(400).json({
          success: false,
          message: 'Agency does not have an associated owner account',
        });
      }

      agencyUser = await User.findById(agencyDoc.owner);

      if (!agencyUser) {
        return res.status(404).json({
          success: false,
          message: 'Agency owner account not found',
        });
      }

      agencyDisplay = {
        id: agencyUser._id,
        name: agencyDoc.name || agencyUser.fullName || agencyUser.email,
        email: agencyDoc.contact?.email || agencyUser.email,
        role: agencyUser.role || 'agency',
      };
    }

    // Get user info
    const user = await User.findById(userId);

    // Prefer conversation keyed by the actual agency user account; migrate legacy threads that used Agency model IDs
    let conversation = await Conversation.findOne({ userId, agencyId: agencyDisplay.id });

    if (!conversation) {
      const legacyConversation = await Conversation.findOne({ userId, agencyId });

      if (legacyConversation) {
        const userUnread = legacyConversation.unreadCount.get(userId.toString()) || 0;
        const agencyUnread = legacyConversation.unreadCount.get(agencyId.toString()) || 0;

        legacyConversation.agencyId = agencyDisplay.id;
        legacyConversation.participants = [
          { userId, userType: user.role },
          { userId: agencyDisplay.id, userType: agencyDisplay.role },
        ];
        legacyConversation.metadata = {
          agencyName: agencyDisplay.name,
          userName: user.fullName || user.email,
          agencyEmail: agencyDisplay.email,
          userEmail: user.email,
        };
        legacyConversation.unreadCount = new Map([
          [userId.toString(), userUnread],
          [agencyDisplay.id.toString(), agencyUnread],
        ]);

        await legacyConversation.save();
        conversation = legacyConversation;
      }
    }

    if (!conversation) {
      conversation = await Conversation.findOrCreate(
        userId,
        agencyDisplay.id,
        { fullName: user.fullName, email: user.email, role: user.role },
        { fullName: agencyDisplay.name, email: agencyDisplay.email, role: agencyDisplay.role }
      );
    }

    logger.info(`Conversation ${conversation._id} started/retrieved between user ${userId} and agency ${agencyDisplay.id}`);

    // Return conversation with enriched participant data
    const enrichedConversation = conversation.toObject();
    enrichedConversation.participants = [
      {
        userId: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        userType: user.role,
        joinedAt: conversation.participants[0]?.joinedAt,
      },
      {
        userId: {
          _id: agencyDisplay.id,
          fullName: agencyDisplay.name,
          email: agencyDisplay.email,
          role: agencyDisplay.role,
        },
        userType: agencyDisplay.role,
        joinedAt: conversation.participants[1]?.joinedAt,
      },
    ];

    res.status(200).json({
      success: true,
      conversation: enrichedConversation,
    });
  } catch (error) {
    logger.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting conversation',
      error: error.message,
    });
  }
};

/**
 * Send a message
 * @route POST /api/messages/send
 * @access Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, message, receiverId } = req.body;

    // Validate input
    if (!conversationId || !message || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID, message, and receiver ID are required',
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === senderId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    // Get sender info
    const sender = await User.findById(senderId);

    // Create message
    const newMessage = await Message.create({
      conversationId,
      senderId,
      receiverId,
      senderType: req.user.role,
      message: message.trim(),
    });

    // Enrich message with sender/receiver info
    const enrichedMessage = {
      ...newMessage.toObject(),
      senderId: {
        _id: sender._id,
        fullName: sender.fullName,
        email: sender.email,
        role: sender.role,
      },
      receiverId: {
        _id: receiverId,
        fullName: conversation.metadata?.agencyName || conversation.metadata?.userName,
        email: conversation.metadata?.agencyEmail || conversation.metadata?.userEmail,
      },
    };

    // Update conversation
    await conversation.updateLastMessage({
      message: message.trim(),
      senderId,
      senderName: sender.fullName || sender.email,
    });

    await conversation.incrementUnreadCount(receiverId);

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      type: 'message',
      title: 'New Message',
      message: `${sender.fullName || sender.email} sent you a message`,
      severity: 'info',
      relatedId: conversationId,
      relatedModel: 'Conversation',
      actionUrl: `/messages/${conversationId}`,
      metadata: {
        senderId,
        senderName: sender.fullName,
        conversationId,
      },
    });

    logger.info(`Message sent from ${senderId} to ${receiverId} in conversation ${conversationId}`);

    // Emit socket event for real-time update (handled by socket.io)
    if (req.io) {
      const messageData = {
        message: enrichedMessage,
        conversation: {
          _id: conversation._id,
          lastMessage: conversation.lastMessage,
          unreadCount: conversation.unreadCount.get(receiverId.toString()),
        },
      };
      
      // Emit to receiver's personal room
      req.io.to(receiverId.toString()).emit('new_message', messageData);
      
      // Also emit to conversation room for anyone currently viewing the conversation
      req.io.to(conversationId).emit('new_message', messageData);
    }

    res.status(201).json({
      success: true,
      message: enrichedMessage,
    });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

/**
 * Get all conversations for a user
 * @route GET /api/messages/conversations
 * @access Private
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, includeArchived = false } = req.query;

    logger.info(`[getConversations] Fetching conversations for user: ${userId}`);
    logger.info(`[getConversations] User info:`, { id: req.user.id, email: req.user.email, role: req.user.role });

    const result = await Conversation.getUserConversations(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      includeArchived: includeArchived === 'true',
    });

    logger.info(`[getConversations] Result: ${result.conversations.length} conversations found`);

    // Add unread count for each conversation
    const conversationsWithUnread = result.conversations.map((conv) => ({
      ...conv,
      myUnreadCount: conv.unreadCount?.[userId.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      conversations: conversationsWithUnread,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

/**
 * Get messages in a conversation
 * @route GET /api/messages/conversations/:conversationId/messages
 * @access Private
 */
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    // Get messages
    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Create a map of participant IDs to their info from conversation metadata and participants
    const participantMap = new Map();
    conversation.participants.forEach(p => {
      const participantId = p.userId.toString();
      participantMap.set(participantId, {
        _id: p.userId,
        userType: p.userType,
      });
    });

    // Get user and agency info from metadata
    const userParticipant = conversation.participants.find(p => p.userId.toString() === conversation.userId.toString());
    const agencyParticipant = conversation.participants.find(p => p.userId.toString() === conversation.agencyId.toString());

    // Enrich messages with sender/receiver info
    const enrichedMessages = messages.map(msg => {
      const senderId = msg.senderId.toString();
      const receiverId = msg.receiverId.toString();
      
      const isUserSender = senderId === conversation.userId.toString();
      
      return {
        ...msg,
        senderId: {
          _id: msg.senderId,
          fullName: isUserSender ? conversation.metadata?.userName : conversation.metadata?.agencyName,
          email: isUserSender ? conversation.metadata?.userEmail : conversation.metadata?.agencyEmail,
          role: participantMap.get(senderId)?.userType || 'user',
        },
        receiverId: {
          _id: msg.receiverId,
          fullName: isUserSender ? conversation.metadata?.agencyName : conversation.metadata?.userName,
          email: isUserSender ? conversation.metadata?.agencyEmail : conversation.metadata?.userEmail,
          role: participantMap.get(receiverId)?.userType || 'user',
        },
      };
    });

    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false,
    });

    // Mark messages as read
    await Message.markConversationAsRead(conversationId, userId);

    // Reset unread count in conversation
    await conversation.resetUnreadCount(userId);

    logger.info(`Retrieved ${messages.length} messages for conversation ${conversationId}`);

    res.status(200).json({
      success: true,
      messages: enrichedMessages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

/**
 * Mark messages as read
 * @route PATCH /api/messages/mark-read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Message IDs array is required',
      });
    }

    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    logger.info(`Marked ${result.modifiedCount} messages as read for user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message,
    });
  }
};

/**
 * Get unread message count
 * @route GET /api/messages/unread-count
 * @access Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    logger.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count',
      error: error.message,
    });
  }
};

/**
 * Archive a conversation
 * @route PATCH /api/messages/conversations/:conversationId/archive
 * @access Private
 */
exports.archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    conversation.isArchived = true;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation archived successfully',
    });
  } catch (error) {
    logger.error('Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving conversation',
      error: error.message,
    });
  }
};

/**
 * Delete a message (soft delete)
 * @route DELETE /api/messages/:messageId
 * @access Private
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not the sender',
      });
    }

    message.isDeleted = true;
    await message.save();

    logger.info(`Message ${messageId} deleted by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message,
    });
  }
};

module.exports = exports;
