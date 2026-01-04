import api from './api';

/**
 * Agency Service
 * Handles all recruitment agency-related API calls
 */
const agencyService = {
  /**
   * Get all agencies with filters
   */
  getAgencies: async (params = {}) => {
    try {
      const response = await api.get('/agencies', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get agency by ID
   */
  getAgencyById: async (id) => {
    try {
      const response = await api.get(`/agencies/${id}`);
      return response.data.agency;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search nearby agencies
   */
  getNearbyAgencies: async (lat, lng, radius = 50000) => {
    try {
      const response = await api.get('/agencies/nearby', {
        params: { lat, lng, radius },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get agency reviews
   */
  getAgencyReviews: async (agencyId, params = {}) => {
    try {
      const response = await api.get(`/agencies/${agencyId}/reviews`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create agency (admin only)
   */
  createAgency: async (agencyData) => {
    try {
      const response = await api.post('/agencies', agencyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update agency
   */
  updateAgency: async (id, agencyData) => {
    try {
      const response = await api.patch(`/agencies/${id}`, agencyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit a review for an agency (requires authentication)
   * @param {string} agencyId - Agency ID
   * @param {object} reviewData - Review data { rating, comment, isAnonymous }
   */
  submitReview: async (agencyId, reviewData) => {
    try {
      const response = await api.post(`/agencies/${agencyId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark a review as helpful
   * @param {string} agencyId - Agency ID
   * @param {string} reviewId - Review ID
   */
  markReviewHelpful: async (agencyId, reviewId) => {
    try {
      const response = await api.post(`/agencies/${agencyId}/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Report a review
   * @param {string} agencyId - Agency ID
   * @param {string} reviewId - Review ID
   * @param {object} reportData - Report data { reason, description }
   */
  reportReview: async (agencyId, reviewId, reportData) => {
    try {
      const response = await api.post(`/agencies/${agencyId}/reviews/${reviewId}/report`, reportData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get review statistics for an agency
   * @param {string} agencyId - Agency ID
   */
  getReviewStats: async (agencyId) => {
    try {
      const response = await api.get(`/agencies/${agencyId}/reviews/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default agencyService;
