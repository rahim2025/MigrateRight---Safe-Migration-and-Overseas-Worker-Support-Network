const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Socket.IO Event Handlers
 * Handles real-time messaging events
 */

/**
 * Authenticate socket connection using JWT token
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
};

/**
 * Initialize Socket.IO handlers
 */
const initializeSocketHandlers = (io) => {
  // Middleware for authentication
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`User connected: ${socket.user.email} (${userId})`);

    // Join user to their personal room for direct messaging
    socket.join(userId);

    // Handle user joining a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      logger.info(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle user leaving a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      logger.info(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing', ({ conversationId, receiverId }) => {
      io.to(receiverId).emit('user_typing', {
        conversationId,
        userId,
        userName: socket.user.fullName || socket.user.email,
      });
    });

    // Handle stop typing indicator
    socket.on('stop_typing', ({ conversationId, receiverId }) => {
      io.to(receiverId).emit('user_stop_typing', {
        conversationId,
        userId,
      });
    });

    // Handle message read notification
    socket.on('message_read', ({ messageId, senderId }) => {
      io.to(senderId).emit('message_read_update', {
        messageId,
        readBy: userId,
        readAt: new Date(),
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.user.email} (${userId}), Reason: ${reason}`);
    });
  });

  return io;
};

/**
 * Emit a new message event to recipient
 */
const emitNewMessage = (io, receiverId, messageData) => {
  io.to(receiverId.toString()).emit('new_message', messageData);
};

/**
 * Emit a new notification event to user
 */
const emitNotification = (io, userId, notificationData) => {
  io.to(userId.toString()).emit('new_notification', notificationData);
};

/**
 * Emit conversation update (e.g., last message changed)
 */
const emitConversationUpdate = (io, userId, conversationData) => {
  io.to(userId.toString()).emit('conversation_update', conversationData);
};

module.exports = {
  initializeSocketHandlers,
  emitNewMessage,
  emitNotification,
  emitConversationUpdate,
};
