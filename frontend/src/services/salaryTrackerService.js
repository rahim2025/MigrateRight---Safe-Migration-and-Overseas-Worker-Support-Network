/**
 * Salary Tracker Service
 * API calls and utility functions for salary tracking
 */

import api from './api';

// ==================== API Calls ====================

/**
 * Create a new salary record
 */
export const createSalaryRecord = async (data) => {
  return api.post('/salary-tracker', data);
};

/**
 * Get all salary records
 */
export const getSalaryRecords = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  return api.get(`/salary-tracker?${params.toString()}`);
};

/**
 * Get single salary record
 */
export const getSalaryRecordById = async (id) => {
  return api.get(`/salary-tracker/${id}`);
};

/**
 * Update salary record
 */
export const updateSalaryRecord = async (id, data) => {
  return api.patch(`/salary-tracker/${id}`, data);
};

/**
 * Delete salary record
 */
export const deleteSalaryRecord = async (id) => {
  return api.delete(`/salary-tracker/${id}`);
};

/**
 * Get salary summary for date range
 */
export const getSalarySummary = async (startDate, endDate) => {
  return api.get('/salary-tracker/summary', {
    params: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    },
  });
};

/**
 * Get salary records with mismatches
 */
export const getSalaryMismatches = async (severity = 'all', limit = 50) => {
  return api.get('/salary-tracker/mismatches', {
    params: { severity, limit },
  });
};

/**
 * Upload proof document
 */
export const uploadProofDocument = async (salaryRecordId, file, documentType = 'payslip', description = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  formData.append('description', description);

  return api.post(`/salary-tracker/${salaryRecordId}/upload-proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Get proof documents for a record
 */
export const getProofDocuments = async (salaryRecordId) => {
  return api.get(`/salary-tracker/${salaryRecordId}/proofs`);
};

/**
 * Delete proof document
 */
export const deleteProofDocument = async (salaryRecordId, documentId) => {
  return api.delete(`/salary-tracker/${salaryRecordId}/proof/${documentId}`);
};

/**
 * Mark salary record as disputed
 */
export const markAsDisputed = async (salaryRecordId, reason) => {
  return api.patch(`/salary-tracker/${salaryRecordId}/dispute`, { reason });
};

/**
 * Archive salary record
 */
export const archiveRecord = async (salaryRecordId) => {
  return api.patch(`/salary-tracker/${salaryRecordId}/archive`);
};

/**
 * Get flagged records for review (Admin)
 */
export const getFlaggedRecords = async (limit = 50) => {
  return api.get('/salary-tracker/admin/flagged', {
    params: { limit },
  });
};

// ==================== Utility Functions ====================

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') amount = parseFloat(amount) || 0;
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

/**
 * Calculate discrepancy percentage
 */
export const calculateDiscrepancyPercentage = (promised, received) => {
  if (!promised || promised === 0) return 0;
  const difference = promised - received;
  return (difference / promised) * 100;
};

/**
 * Get discrepancy severity level
 */
export const getDiscrepancySeverity = (percentage) => {
  const absPercentage = Math.abs(percentage);
  
  if (absPercentage < 1) return 'none';
  if (absPercentage < 10) return 'minor';
  if (absPercentage < 30) return 'significant';
  return 'critical';
};

/**
 * Get color for severity level
 */
export const getSeverityColor = (severity) => {
  const colors = {
    none: '#4CAF50',
    minor: '#FFC107',
    significant: '#FF9800',
    critical: '#F44336',
  };
  return colors[severity] || '#999';
};

/**
 * Get file type category
 */
export const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'document';
};

/**
 * Convert file to base64 (deprecated - use FormData instead)
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Get wage mismatch details
 */
export const calculateWageMismatch = (record) => {
  return {
    promisedSalary: record.promisedSalary,
    receivedSalary: record.receivedSalary,
    shortfallAmount: Math.max(0, record.promisedSalary - record.receivedSalary),
    shortfallPercentage: Math.max(0, record.discrepancy?.percentage || 0),
    totalDeductions: record.discrepancy?.totalDeductions || 0,
    netAmount: record.receivedSalary - (record.discrepancy?.totalDeductions || 0),
    status: record.discrepancy?.status || 'match',
    needsEscalation: record.discrepancy?.status === 'critical_underpayment',
  };
};

/**
 * Check if file is valid for upload
 */
export const isValidUploadFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported. Use JPG, PNG, or PDF');
  }
  
  return true;
};

/**
 * Get document type label
 */
export const getDocumentTypeLabel = (documentType) => {
  const labels = {
    payslip: 'Payslip',
    bank_statement: 'Bank Statement',
    contract: 'Contract',
    receipt: 'Receipt',
    photo_evidence: 'Photo Evidence',
    other: 'Other Document',
  };
  return labels[documentType] || 'Document';
};

/**
 * Group records by status
 */
export const groupRecordsByStatus = (records) => {
  return records.reduce((acc, record) => {
    const status = record.discrepancy?.status || 'match';
    if (!acc[status]) acc[status] = [];
    acc[status].push(record);
    return acc;
  }, {});
};

/**
 * Calculate total statistics
 */
export const calculateStatistics = (records) => {
  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      totalPromised: 0,
      totalReceived: 0,
      totalShortfall: 0,
      totalDeductions: 0,
      recordsWithMismatch: 0,
      averageMismatchPercentage: 0,
      criticalCount: 0,
    };
  }

  let totalPromised = 0;
  let totalReceived = 0;
  let totalDeductions = 0;
  let recordsWithMismatch = 0;
  let criticalCount = 0;
  let mismatchPercentages = [];

  records.forEach(record => {
    totalPromised += record.promisedSalary || 0;
    totalReceived += record.receivedSalary || 0;
    totalDeductions += record.discrepancy?.totalDeductions || 0;

    const discrepancyPercentage = record.discrepancy?.percentage || 0;
    if (discrepancyPercentage > 0) {
      recordsWithMismatch++;
      mismatchPercentages.push(discrepancyPercentage);
    }

    if (record.discrepancy?.status === 'critical_underpayment') {
      criticalCount++;
    }
  });

  const averageMismatchPercentage =
    mismatchPercentages.length > 0
      ? mismatchPercentages.reduce((a, b) => a + b, 0) / mismatchPercentages.length
      : 0;

  return {
    totalRecords: records.length,
    totalPromised,
    totalReceived,
    totalShortfall: totalPromised - totalReceived,
    totalDeductions,
    recordsWithMismatch,
    averageMismatchPercentage: Math.round(averageMismatchPercentage * 100) / 100,
    criticalCount,
  };
};

export default {
  createSalaryRecord,
  getSalaryRecords,
  getSalaryRecordById,
  updateSalaryRecord,
  deleteSalaryRecord,
  getSalarySummary,
  getSalaryMismatches,
  uploadProofDocument,
  getProofDocuments,
  deleteProofDocument,
  markAsDisputed,
  archiveRecord,
  getFlaggedRecords,
  formatCurrency,
  calculateDiscrepancyPercentage,
  getDiscrepancySeverity,
  getSeverityColor,
  getFileType,
  fileToBase64,
  formatDate,
  calculateWageMismatch,
  isValidUploadFile,
  getDocumentTypeLabel,
  groupRecordsByStatus,
  calculateStatistics,
};
