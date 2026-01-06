import api from './api';

/**
 * Country Guide Service
 * API calls for destination country guides
 */

/**
 * Get all country guides with optional filters
 * @param {Object} params - Filter parameters
 * @param {string} params.region - Filter by region
 * @param {string} params.jobType - Filter by job type
 * @param {boolean} params.popular - Get popular destinations only
 * @param {string} params.language - Language preference (en/bn)
 * @param {string} params.sort - Sort order (popularityRank, views, country, recent)
 * @param {number} params.limit - Maximum results
 * @returns {Promise} API response
 */
export const getAllGuides = async (params = {}) => {
  try {
    // API interceptor already returns response.data, so response is the data object
    const response = await api.get('/country-guides', { params });
    return response;
  } catch (error) {
    console.error('Error fetching guides:', error);
    throw error;
  }
};

/**
 * Get country guide by country name
 * @param {string} country - Country name
 * @param {string} language - Language preference (en/bn)
 * @returns {Promise} API response
 */
export const getGuideByCountry = async (country, language = 'en') => {
  try {
    // API interceptor already returns response.data, so response is the data object
    const response = await api.get(`/country-guides/${encodeURIComponent(country)}`, {
      params: { language },
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get available regions
 * @returns {Promise} API response with regions list
 */
export const getRegions = async () => {
  try {
    // API interceptor already returns response.data, so response is the data object
    const response = await api.get('/country-guides/meta/regions');
    return response;
  } catch (error) {
    console.error('Error fetching regions:', error);
    throw error;
  }
};

/**
 * Get available job types
 * @returns {Promise} API response with job types list
 */
export const getJobTypes = async () => {
  try {
    // API interceptor already returns response.data, so response is the data object
    const response = await api.get('/country-guides/meta/job-types');
    return response;
  } catch (error) {
    console.error('Error fetching job types:', error);
    throw error;
  }
};

/**
 * Search country guides by job type
 * @param {string} jobType - Job type to search for
 * @returns {Promise} API response with matching countries
 */
export const searchByJobType = async (jobType) => {
  try {
    const response = await api.get(`/country-guides/search/job/${jobType}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get country guides by region
 * @param {string} region - Region name
 * @returns {Promise} API response with guides in region
 */
export const getGuidesByRegion = async (region) => {
  try {
    const response = await api.get(`/country-guides/region/${encodeURIComponent(region)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Compare salaries across countries for a job type
 * @param {string} jobType - Job type to compare
 * @param {Array<string>} countries - Optional list of countries to compare
 * @returns {Promise} API response with salary comparison
 */
export const compareSalaries = async (jobType, countries = []) => {
  try {
    const params = {};
    if (countries.length > 0) {
      params.countries = countries.join(',');
    }
    const response = await api.get(`/country-guides/compare/${jobType}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get popular destinations
 * @param {number} limit - Number of popular destinations to fetch
 * @returns {Promise} API response with popular guides
 */
export const getPopularDestinations = async (limit = 5) => {
  try {
    // API interceptor already returns response.data, so response is the data object
    const response = await api.get('/country-guides', {
      params: { popular: true, limit },
    });
    return response;
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    throw error;
  }
};

// ==================== ADMIN FUNCTIONS ====================

/**
 * Create new country guide (Admin only)
 * @param {Object} guideData - Country guide data
 * @returns {Promise} API response
 */
export const createGuide = async (guideData) => {
  try {
    const response = await api.post('/country-guides', guideData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update country guide (Admin only)
 * @param {string} id - Guide ID
 * @param {Object} updateData - Updated guide data
 * @returns {Promise} API response
 */
export const updateGuide = async (id, updateData) => {
  try {
    const response = await api.put(`/country-guides/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete country guide (Admin only)
 * @param {string} id - Guide ID
 * @returns {Promise} API response
 */
export const deleteGuide = async (id) => {
  try {
    const response = await api.delete(`/country-guides/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Restore deleted country guide (Admin only)
 * @param {string} id - Guide ID
 * @returns {Promise} API response
 */
export const restoreGuide = async (id) => {
  try {
    const response = await api.patch(`/country-guides/${id}/restore`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update popularity rank (Admin only)
 * @param {string} id - Guide ID
 * @param {number} rank - New popularity rank
 * @returns {Promise} API response
 */
export const updatePopularityRank = async (id, rank) => {
  try {
    const response = await api.patch(`/country-guides/${id}/rank`, { rank });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAllGuides,
  getGuideByCountry,
  getRegions,
  getJobTypes,
  searchByJobType,
  getGuidesByRegion,
  compareSalaries,
  getPopularDestinations,
  createGuide,
  updateGuide,
  deleteGuide,
  restoreGuide,
  updatePopularityRank,
};
