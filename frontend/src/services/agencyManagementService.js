import api from './api';

/**
 * Agency Management Service
 * Handles all agency-related API calls
 */
const agencyManagementService = {
  // ==================== Agency Details ====================
  createAgencyDetails: async (detailsData) => {
    try {
      const response = await api.post('/agency-management/details', detailsData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAgencyDetails: async () => {
    try {
      const response = await api.get('/agency-management/details');
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateAgencyDetails: async (detailsData) => {
    try {
      const response = await api.put('/agency-management/details', detailsData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== Success Stories ====================
  createSuccessStory: async (storyData) => {
    try {
      const response = await api.post('/agency-management/success-stories', storyData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSuccessStories: async (agencyId = null) => {
    try {
      const url = agencyId 
        ? `/agency-management/success-stories/${agencyId}` 
        : '/agency-management/success-stories';
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSuccessStoryById: async (id) => {
    try {
      const response = await api.get(`/agency-management/success-story/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSuccessStory: async (id, storyData) => {
    try {
      const response = await api.put(`/agency-management/success-stories/${id}`, storyData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteSuccessStory: async (id) => {
    try {
      const response = await api.delete(`/agency-management/success-stories/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== Fee Structure ====================
  createFeeStructure: async (feeData) => {
    try {
      const response = await api.post('/agency-management/fee-structures', feeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getFeeStructures: async (agencyId = null) => {
    try {
      const url = agencyId 
        ? `/agency-management/fee-structures/${agencyId}` 
        : '/agency-management/fee-structures';
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getFeeStructureById: async (id) => {
    try {
      const response = await api.get(`/agency-management/fee-structure/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateFeeStructure: async (id, feeData) => {
    try {
      const response = await api.put(`/agency-management/fee-structures/${id}`, feeData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteFeeStructure: async (id) => {
    try {
      const response = await api.delete(`/agency-management/fee-structures/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== Training Records ====================
  createTrainingRecord: async (trainingData) => {
    try {
      const response = await api.post('/agency-management/training-records', trainingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getTrainingRecords: async (agencyId = null) => {
    try {
      const url = agencyId 
        ? `/agency-management/training-records/${agencyId}` 
        : '/agency-management/training-records';
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getTrainingRecordById: async (id) => {
    try {
      const response = await api.get(`/agency-management/training-record/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateTrainingRecord: async (id, trainingData) => {
    try {
      const response = await api.put(`/agency-management/training-records/${id}`, trainingData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteTrainingRecord: async (id) => {
    try {
      const response = await api.delete(`/agency-management/training-records/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== Interested Workers ====================
  expressInterest: async (agencyId) => {
    try {
      const response = await api.post('/agency-management/interested', { agencyId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getInterestedWorkers: async () => {
    try {
      const response = await api.get('/agency-management/interested-workers');
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateInterestedWorkerStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/agency-management/interested-workers/${id}`, statusData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // ==================== Public Agency Listing ====================
  getAllAgencies: async (params = {}) => {
    try {
      const { search, page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const response = await api.get(`/agency-management/list?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getAgencyProfile: async (id) => {
    try {
      const response = await api.get(`/agency-management/profile/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default agencyManagementService;
