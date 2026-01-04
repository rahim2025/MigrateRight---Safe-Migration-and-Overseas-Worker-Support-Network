import api from './api';

/**
 * Worker Service
 * Handles all worker-related API calls for the dashboard
 */
const workerService = {
  /**
   * Get worker profile
   */
  getWorkerProfile: async () => {
    try {
      const response = await api.get('/workers/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update worker profile
   * @param {object} profileData - Profile data to update
   */
  updateWorkerProfile: async (profileData) => {
    try {
      const response = await api.patch('/workers/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get worker notifications
   * @param {object} params - Query parameters { limit, page, unreadOnly }
   */
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/workers/notifications', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Dismiss a notification
   * @param {string} notificationId - Notification ID
   */
  dismissNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/workers/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.patch(`/workers/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get activity history
   * @param {object} params - Query parameters { limit, page }
   */
  getActivityHistory: async (params = {}) => {
    try {
      const response = await api.get('/workers/activity', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recommended countries based on profile
   * @param {object} params - Query parameters { limit }
   */
  getRecommendedCountries: async (params = {}) => {
    try {
      const response = await api.get('/workers/recommendations/countries', { params });
      return response.data;
    } catch (error) {
      // Fallback to regular countries endpoint
      const fallbackResponse = await api.get('/countries', { 
        params: { limit: params.limit || 4 } 
      });
      return fallbackResponse.data;
    }
  },

  /**
   * Get recommended agencies based on profile
   * @param {object} params - Query parameters { limit }
   */
  getRecommendedAgencies: async (params = {}) => {
    try {
      const response = await api.get('/workers/recommendations/agencies', { params });
      return response.data;
    } catch (error) {
      // Fallback to regular agencies endpoint
      const fallbackResponse = await api.get('/agencies', { 
        params: { limit: params.limit || 3, sort: '-trustScore' } 
      });
      return fallbackResponse.data;
    }
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/workers/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save a country to favorites
   * @param {string} countryId - Country ID
   */
  saveCountry: async (countryId) => {
    try {
      const response = await api.post(`/workers/saved-countries/${countryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove a country from favorites
   * @param {string} countryId - Country ID
   */
  unsaveCountry: async (countryId) => {
    try {
      const response = await api.delete(`/workers/saved-countries/${countryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get saved countries
   */
  getSavedCountries: async () => {
    try {
      const response = await api.get('/workers/saved-countries');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload a document
   * @param {FormData} formData - Form data with document file
   */
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/workers/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get worker documents
   */
  getDocuments: async () => {
    try {
      const response = await api.get('/workers/documents');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   */
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/workers/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user preferences
   * @param {object} preferences - User preferences (theme, layout, etc.)
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await api.patch('/workers/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user preferences
   */
  getPreferences: async () => {
    try {
      const response = await api.get('/workers/preferences');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default workerService;
