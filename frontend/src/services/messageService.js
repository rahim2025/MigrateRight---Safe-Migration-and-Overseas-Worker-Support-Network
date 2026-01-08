import api from './api';

/**
 * Message Service
 * Handles all message-related API calls
 */

const messageService = {
  /**
   * Start or get conversation with an agency
   * @param {string} agencyId - ID of the agency to message
   * @returns {Promise} Conversation data
   */
  startConversation: async (agencyId) => {
    try {
      const response = await api.post(`/messages/conversations/${agencyId}`);
      console.log('Start conversation response:', response);
      // api interceptor already returns response.data, so response is the unwrapped data
      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },

  /**
   * Get all conversations for the current user
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of conversations per page
   * @param {boolean} includeArchived - Include archived conversations
   * @returns {Promise} List of conversations
   */
  getConversations: async (page = 1, limit = 20, includeArchived = false) => {
    try {
      const response = await api.get('/messages/conversations', {
        params: { page, limit, includeArchived },
      });
      return response;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  /**
   * Get messages in a specific conversation
   * @param {string} conversationId - ID of the conversation
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of messages per page
   * @returns {Promise} List of messages
   */
  getMessages: async (conversationId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Send a message in a conversation
   * @param {object} messageData - Message data (conversationId, message, receiverId)
   * @returns {Promise} Sent message data
   */
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/messages/send', messageData);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   * @param {string[]} messageIds - Array of message IDs to mark as read
   * @returns {Promise} Success status
   */
  markAsRead: async (messageIds) => {
    try {
      const response = await api.patch('/messages/mark-read', { messageIds });
      return response;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  /**
   * Get total unread message count
   * @returns {Promise} Unread count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/messages/unread-count');
      return response;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  /**
   * Archive a conversation
   * @param {string} conversationId - ID of the conversation to archive
   * @returns {Promise} Success status
   */
  archiveConversation: async (conversationId) => {
    try {
      const response = await api.patch(`/messages/conversations/${conversationId}/archive`);
      return response;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  },

  /**
   * Delete a message (soft delete)
   * @param {string} messageId - ID of the message to delete
   * @returns {Promise} Success status
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },
};

export default messageService;
