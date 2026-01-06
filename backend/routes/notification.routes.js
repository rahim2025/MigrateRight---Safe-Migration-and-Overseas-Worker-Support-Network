const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { limit = 20, unreadOnly = false, type } = req.query;
  
  const query = { userId: req.userId };
  if (unreadOnly === 'true') {
    query.read = false;
  }
  if (type) {
    query.type = type;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  const unreadCount = await Notification.getUnreadCount(req.userId);

  logger.info(`Fetching notifications for user ${req.userId}`, {
    total: notifications.length,
    unreadCount,
    type: type || 'all',
    unreadOnly: unreadOnly === 'true'
  });

  res.json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications,
  });
}));

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/unread-count', authenticate, asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.userId);

  res.json({
    success: true,
    data: { count },
  });
}));

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const notification = await Notification.markAsRead(req.params.id, req.userId);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
}));

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/mark-all-read', authenticate, asyncHandler(async (req, res) => {
  const result = await Notification.markAllAsRead(req.userId);

  res.json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
    data: { modifiedCount: result.modifiedCount },
  });
}));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted',
  });
}));

module.exports = router;
