/**
 * Notification Service
 * Handles all API calls related to notifications
 */

import api from './api';

const NOTIFICATION_BASE_URL = '/notifications';

/**
 * Get user's notifications
 * @param {number} limit - Number of notifications to fetch
 * @param {boolean} unreadOnly - Fetch only unread notifications
 * @param {string} type - Filter by notification type (e.g., 'emergency_sos')
 * @returns {Promise<Object>} Notifications data
 */
export const getNotifications = async (limit = 20, unreadOnly = false, type = null) => {
  try {
    const params = { limit };
    if (unreadOnly) {
      params.unreadOnly = 'true';
    }
    if (type) {
      params.type = type;
    }
    const response = await api.get(NOTIFICATION_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get count of unread notifications
 * @returns {Promise<number>} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get(`${NOTIFICATION_BASE_URL}/unread-count`);
    // Handle different response structures
    return response.data?.data?.count ?? response.data?.count ?? 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    // Return 0 instead of throwing to prevent UI errors
    return 0;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`${NOTIFICATION_BASE_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Update result
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.patch(`${NOTIFICATION_BASE_URL}/mark-all-read`);
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`${NOTIFICATION_BASE_URL}/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
