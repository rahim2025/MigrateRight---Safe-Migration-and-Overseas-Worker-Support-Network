/**
 * Migration Cost Calculator Service
 * API calls for fee calculation and comparison
 */

import api from './api';

/**
 * Get all available destination countries
 * @returns {Promise} - List of countries
 */
export const getAvailableCountries = async () => {
  const response = await api.get('/calculator/countries');
  return response.data;
};

/**
 * Get available job types for a specific country
 * @param {string} country - Destination country
 * @returns {Promise} - List of job types
 */
export const getJobTypesByCountry = async (country) => {
  const response = await api.get(`/calculator/countries/${country}/jobs`);
  return response.data;
};

/**
 * Get fee rule for specific country and job type
 * @param {string} country - Destination country
 * @param {string} jobType - Job type
 * @returns {Promise} - Fee rule details
 */
export const getFeeRule = async (country, jobType) => {
  const response = await api.get('/calculator/fee-rules', {
    params: { country, jobType }
  });
  return response.data;
};

/**
 * Calculate migration cost and compare with legal fees
 * @param {Object} calculationData - Calculation input data
 * @param {string} calculationData.destinationCountry - Destination country
 * @param {string} calculationData.jobType - Job type
 * @param {number} calculationData.agencyFee - Agency fee quoted to user
 * @param {Object} calculationData.additionalCosts - Optional additional costs
 * @returns {Promise} - Calculation results with warnings
 */
export const calculateMigrationCost = async (calculationData) => {
  const response = await api.post('/calculator/calculate', calculationData);
  return response.data;
};

/**
 * Get all fee rules (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - List of fee rules
 */
export const getAllFeeRules = async (params = {}) => {
  const response = await api.get('/calculator/fee-rules/all', { params });
  return response.data;
};

/**
 * Create new fee rule (Admin only)
 * @param {Object} feeRuleData - Fee rule data
 * @returns {Promise} - Created fee rule
 */
export const createFeeRule = async (feeRuleData) => {
  const response = await api.post('/calculator/fee-rules', feeRuleData);
  return response.data;
};

/**
 * Update fee rule (Admin only)
 * @param {string} id - Fee rule ID
 * @param {Object} feeRuleData - Updated fee rule data
 * @returns {Promise} - Updated fee rule
 */
export const updateFeeRule = async (id, feeRuleData) => {
  const response = await api.put(`/calculator/fee-rules/${id}`, feeRuleData);
  return response.data;
};

/**
 * Delete fee rule (Admin only)
 * @param {string} id - Fee rule ID
 * @returns {Promise} - Success message
 */
export const deleteFeeRule = async (id) => {
  const response = await api.delete(`/calculator/fee-rules/${id}`);
  return response.data;
};

export default {
  getAvailableCountries,
  getJobTypesByCountry,
  getFeeRule,
  calculateMigrationCost,
  getAllFeeRules,
  createFeeRule,
  updateFeeRule,
  deleteFeeRule
};
