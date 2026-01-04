/**
 * Salary Service
 * Handles all API calls related to salary tracking functionality
 */

import api from './api';

const SALARY_BASE_URL = '/salary';

/**
 * Create a new salary record
 * @param {Object} recordData - Salary record data
 * @returns {Promise<Object>} Created salary record
 */
export const createSalaryRecord = async (recordData) => {
  try {
    const response = await api.post(SALARY_BASE_URL, recordData);
    return response.data;
  } catch (error) {
    console.error('Error creating salary record:', error);
    throw error;
  }
};

/**
 * Get all salary records with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of salary records
 */
export const getSalaryRecords = async (filters = {}) => {
  try {
    const response = await api.get(SALARY_BASE_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching salary records:', error);
    throw error;
  }
};

/**
 * Get a single salary record by ID
 * @param {String} id - Salary record ID
 * @returns {Promise<Object>} Salary record
 */
export const getSalaryRecord = async (id) => {
  try {
    const response = await api.get(`${SALARY_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching salary record:', error);
    throw error;
  }
};

/**
 * Update a salary record
 * @param {String} id - Salary record ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated salary record
 */
export const updateSalaryRecord = async (id, updates) => {
  try {
    const response = await api.patch(`${SALARY_BASE_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating salary record:', error);
    throw error;
  }
};

/**
 * Delete a salary record
 * @param {String} id - Salary record ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteSalaryRecord = async (id) => {
  try {
    const response = await api.delete(`${SALARY_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting salary record:', error);
    throw error;
  }
};

/**
 * Upload proof document for salary record
 * @param {String} id - Salary record ID
 * @param {Object} fileData - File information
 * @returns {Promise<Object>} Updated salary record
 */
export const uploadProof = async (id, fileData) => {
  try {
    const response = await api.post(`${SALARY_BASE_URL}/${id}/proof`, fileData);
    return response.data;
  } catch (error) {
    console.error('Error uploading proof:', error);
    throw error;
  }
};

/**
 * Remove proof document from salary record
 * @param {String} id - Salary record ID
 * @param {String} documentId - Document ID to remove
 * @returns {Promise<Object>} Updated salary record
 */
export const removeProof = async (id, documentId) => {
  try {
    const response = await api.delete(`${SALARY_BASE_URL}/${id}/proof/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing proof:', error);
    throw error;
  }
};

/**
 * Get salary statistics for logged-in user
 * @returns {Promise<Object>} Statistics object
 */
export const getStatistics = async () => {
  try {
    const response = await api.get(`${SALARY_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

/**
 * Get records with salary discrepancies
 * @param {Number} minPercentage - Minimum discrepancy percentage (default 5)
 * @returns {Promise<Array>} Records with discrepancies
 */
export const getDiscrepancies = async (minPercentage = 5) => {
  try {
    const response = await api.get(`${SALARY_BASE_URL}/discrepancies`, {
      params: { minPercentage },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching discrepancies:', error);
    throw error;
  }
};

/**
 * Get detailed discrepancy report
 * @returns {Promise<Object>} Discrepancy report with summary and records
 */
export const getDiscrepancyReport = async () => {
  try {
    const response = await api.get(`${SALARY_BASE_URL}/reports/discrepancy`);
    return response.data;
  } catch (error) {
    console.error('Error fetching discrepancy report:', error);
    throw error;
  }
};

/**
 * Get recent salary records
 * @param {Number} limit - Number of records to return (default 10)
 * @returns {Promise<Array>} Recent salary records
 */
export const getRecentRecords = async (limit = 10) => {
  try {
    const response = await api.get(`${SALARY_BASE_URL}/recent`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent records:', error);
    throw error;
  }
};

/**
 * Mark salary record as disputed
 * @param {String} id - Salary record ID
 * @param {String} reason - Reason for dispute
 * @returns {Promise<Object>} Updated salary record
 */
export const markAsDisputed = async (id, reason) => {
  try {
    const response = await api.post(`${SALARY_BASE_URL}/${id}/dispute`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error marking as disputed:', error);
    throw error;
  }
};

/**
 * Resolve dispute (Admin only)
 * @param {String} id - Salary record ID
 * @param {String} resolution - Resolution details
 * @returns {Promise<Object>} Updated salary record
 */
export const resolveDispute = async (id, resolution) => {
  try {
    const response = await api.post(`${SALARY_BASE_URL}/${id}/resolve`, { resolution });
    return response.data;
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw error;
  }
};

/**
 * Get all disputed records (Admin only)
 * @returns {Promise<Array>} All disputed records
 */
export const getAllDisputed = async () => {
  try {
    const response = await api.get(`${SALARY_BASE_URL}/admin/disputed`);
    return response.data;
  } catch (error) {
    console.error('Error fetching disputed records:', error);
    throw error;
  }
};

/**
 * Helper: Convert file to base64 (for file upload)
 * @param {File} file - File object
 * @returns {Promise<String>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Helper: Determine file type from MIME type
 * @param {String} mimeType - MIME type
 * @returns {String} File type (image, pdf, document)
 */
export const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'document';
};

/**
 * Helper: Format currency
 * @param {Number} amount - Amount
 * @param {String} currency - Currency code
 * @returns {String} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Helper: Calculate discrepancy percentage
 * @param {Number} contractSalary - Contract/promised salary
 * @param {Number} receivedSalary - Actual received salary
 * @returns {Number} Discrepancy percentage
 */
export const calculateDiscrepancyPercentage = (contractSalary, receivedSalary) => {
  if (contractSalary === 0) return 0;
  const discrepancy = contractSalary - receivedSalary;
  return (discrepancy / contractSalary) * 100;
};

/**
 * Helper: Get discrepancy severity
 * @param {Number} percentage - Discrepancy percentage
 * @returns {String} Severity level
 */
export const getDiscrepancySeverity = (percentage) => {
  const absPercentage = Math.abs(percentage);
  if (absPercentage >= 50) return 'critical';
  if (absPercentage >= 25) return 'high';
  if (absPercentage >= 10) return 'medium';
  if (absPercentage > 0) return 'low';
  return 'none';
};

/**
 * Helper: Get severity color
 * @param {String} severity - Severity level
 * @returns {String} Color code
 */
export const getSeverityColor = (severity) => {
  const colors = {
    critical: '#d32f2f',
    high: '#f57c00',
    medium: '#fbc02d',
    low: '#388e3c',
    none: '#1976d2',
  };
  return colors[severity] || '#757575';
};

export default {
  createSalaryRecord,
  getSalaryRecords,
  getSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord,
  uploadProof,
  removeProof,
  getStatistics,
  getDiscrepancies,
  getDiscrepancyReport,
  getRecentRecords,
  markAsDisputed,
  resolveDispute,
  getAllDisputed,
  fileToBase64,
  getFileType,
  formatCurrency,
  calculateDiscrepancyPercentage,
  getDiscrepancySeverity,
  getSeverityColor,
};
