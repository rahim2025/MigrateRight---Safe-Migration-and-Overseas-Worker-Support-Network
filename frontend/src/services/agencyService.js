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
};

export default agencyService;
