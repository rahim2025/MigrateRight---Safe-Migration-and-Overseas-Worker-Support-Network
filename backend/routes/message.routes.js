const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * All message routes require authentication
 */
router.use(authenticate);

/**
 * @route POST /api/messages/conversations/:agencyId
 * @desc Start or get conversation with an agency
 * @access Private
 */
router.post('/conversations/:agencyId', messageController.startConversation);

/**
 * @route GET /api/messages/conversations
 * @desc Get all conversations for the logged-in user
 * @access Private
 */
router.get('/conversations', messageController.getConversations);

/**
 * @route GET /api/messages/conversations/:conversationId/messages
 * @desc Get all messages in a conversation
 * @access Private
 */
router.get('/conversations/:conversationId/messages', messageController.getMessages);

/**
 * @route POST /api/messages/send
 * @desc Send a message in a conversation
 * @access Private
 */
router.post('/send', messageController.sendMessage);

/**
 * @route PATCH /api/messages/mark-read
 * @desc Mark multiple messages as read
 * @access Private
 */
router.patch('/mark-read', messageController.markAsRead);

/**
 * @route GET /api/messages/unread-count
 * @desc Get total unread message count for user
 * @access Private
 */
router.get('/unread-count', messageController.getUnreadCount);

/**
 * @route PATCH /api/messages/conversations/:conversationId/archive
 * @desc Archive a conversation
 * @access Private
 */
router.patch('/conversations/:conversationId/archive', messageController.archiveConversation);

/**
 * @route DELETE /api/messages/:messageId
 * @desc Delete a message (soft delete)
 * @access Private
 */
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
