import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import {
  createSalaryRecord,
  getSalaryRecords,
  updateSalaryRecord,
  deleteSalaryRecord,
  uploadProof,
  removeProof,
  getStatistics,
  getDiscrepancyReport,
  markAsDisputed,
  formatCurrency,
  calculateDiscrepancyPercentage,
  getDiscrepancySeverity,
  getSeverityColor,
  fileToBase64,
  getFileType,
} from '../../services/salaryService';
import './SalaryTracker.css';

const SalaryTracker = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  // State management
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    employerName: '',
    employerCountry: '',
    contractSalary: '',
    receivedSalary: '',
    currency: 'USD',
    paymentDate: '',
    paymentPeriod: 'monthly',
    workType: '',
    notes: '',
    deductions: {
      accommodation: '',
      food: '',
      transport: '',
      other: '',
      description: '',
    },
  });

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedRecordForUpload, setSelectedRecordForUpload] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadRecords();
    loadStatistics();
  }, [selectedFilter]);

  // Load salary records
  const loadRecords = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'discrepancy') {
          filters.hasDiscrepancy = 'true';
        } else {
          filters.status = selectedFilter;
        }
      }

      const response = await getSalaryRecords(filters);
      setRecords(response.data || []);
    } catch (error) {
      console.error('Error loading records:', error);
      alert(error.response?.data?.message || 'Failed to load salary records');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('deductions.')) {
      const deductionField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        deductions: {
          ...prev.deductions,
          [deductionField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data
      const recordData = {
        ...formData,
        contractSalary: parseFloat(formData.contractSalary),
        receivedSalary: parseFloat(formData.receivedSalary),
        deductions: {
          accommodation: parseFloat(formData.deductions.accommodation) || 0,
          food: parseFloat(formData.deductions.food) || 0,
          transport: parseFloat(formData.deductions.transport) || 0,
          other: parseFloat(formData.deductions.other) || 0,
          description: formData.deductions.description,
        },
      };

      if (editingRecord) {
        await updateSalaryRecord(editingRecord._id, recordData);
      } else {
        await createSalaryRecord(recordData);
      }

      // Reset form and reload
      resetForm();
      await loadRecords();
      await loadStatistics();
    } catch (error) {
      console.error('Error saving record:', error);
      alert(error.response?.data?.message || 'Failed to save salary record');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employerName: '',
      employerCountry: '',
      contractSalary: '',
      receivedSalary: '',
      currency: 'USD',
      paymentDate: '',
      paymentPeriod: 'monthly',
      workType: '',
      notes: '',
      deductions: {
        accommodation: '',
        food: '',
        transport: '',
        other: '',
        description: '',
      },
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (record) => {
    setFormData({
      employerName: record.employerName,
      employerCountry: record.employerCountry || '',
      contractSalary: record.contractSalary.toString(),
      receivedSalary: record.receivedSalary.toString(),
      currency: record.currency,
      paymentDate: new Date(record.paymentDate).toISOString().split('T')[0],
      paymentPeriod: record.paymentPeriod,
      workType: record.workType || '',
      notes: record.notes || '',
      deductions: {
        accommodation: record.deductions?.accommodation?.toString() || '',
        food: record.deductions?.food?.toString() || '',
        transport: record.deductions?.transport?.toString() || '',
        other: record.deductions?.other?.toString() || '',
        description: record.deductions?.description || '',
      },
    });
    setEditingRecord(record);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    setLoading(true);
    try {
      await deleteSalaryRecord(id);
      await loadRecords();
      await loadStatistics();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(error.response?.data?.message || 'Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e, recordId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingFile(true);
    try {
      const base64 = await fileToBase64(file);
      const fileData = {
        fileName: file.name,
        fileUrl: base64, // In production, upload to cloud storage and use URL
        fileType: getFileType(file.type),
        fileSize: file.size,
      };

      await uploadProof(recordId, fileData);
      await loadRecords();
      alert('Proof uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.message || 'Failed to upload proof');
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Handle remove proof
  const handleRemoveProof = async (recordId, documentId) => {
    if (!window.confirm('Remove this proof document?')) return;

    try {
      await removeProof(recordId, documentId);
      await loadRecords();
    } catch (error) {
      console.error('Error removing proof:', error);
      alert(error.response?.data?.message || 'Failed to remove proof');
    }
  };

  // Handle mark as disputed
  const handleDispute = async (recordId) => {
    const reason = prompt('Please enter the reason for dispute:');
    if (!reason) return;

    try {
      await markAsDisputed(recordId, reason);
      await loadRecords();
      await loadStatistics();
      alert('Record marked as disputed');
    } catch (error) {
      console.error('Error marking as disputed:', error);
      alert(error.response?.data?.message || 'Failed to mark as disputed');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const classes = {
      paid_full: 'status-success',
      partial: 'status-warning',
      unpaid: 'status-danger',
      disputed: 'status-info',
      resolved: 'status-success',
    };
    return classes[status] || 'status-default';
  };

  return (
    <div className="salary-tracker-container">
      <div className="salary-tracker-content">
        <div className="tracker-header">
          <h1>{t?.salaryTracker?.title || 'Salary Tracker'}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            disabled={loading}
          >
            {showForm ? '✕ Cancel' : '+ Add Salary Record'}
          </button>
        </div>

        {/* Statistics Summary */}
        {statistics && (
          <div className="statistics-summary">
            <div className="stat-card">
              <h3>{t?.salaryTracker?.totalRecords || 'Total Records'}</h3>
              <p className="stat-value">{statistics.totalRecords}</p>
            </div>
            <div className="stat-card">
              <h3>{t?.salaryTracker?.totalExpected || 'Total Expected'}</h3>
              <p className="stat-value">{formatCurrency(statistics.totalExpected, 'USD')}</p>
            </div>
            <div className="stat-card">
              <h3>{t?.salaryTracker?.totalReceived || 'Total Received'}</h3>
              <p className="stat-value success">{formatCurrency(statistics.totalReceived, 'USD')}</p>
            </div>
            <div className="stat-card">
              <h3>{t?.salaryTracker?.totalDiscrepancy || 'Total Discrepancy'}</h3>
              <p className={`stat-value ${statistics.totalDiscrepancy > 0 ? 'danger' : 'success'}`}>
                {formatCurrency(statistics.totalDiscrepancy, 'USD')}
              </p>
            </div>
            <div className="stat-card">
              <h3>{t?.salaryTracker?.recordsWithIssues || 'Records with Issues'}</h3>
              <p className="stat-value warning">{statistics.recordsWithDiscrepancy}</p>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="salary-form-container">
            <h2>{editingRecord ? 'Edit Salary Record' : 'Add New Salary Record'}</h2>
            <form onSubmit={handleSubmit} className="salary-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="employerName">Employer Name *</label>
                  <input
                    type="text"
                    id="employerName"
                    name="employerName"
                    value={formData.employerName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter employer name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="employerCountry">Country</label>
                  <input
                    type="text"
                    id="employerCountry"
                    name="employerCountry"
                    value={formData.employerCountry}
                    onChange={handleInputChange}
                    placeholder="e.g., Saudi Arabia"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contractSalary">Contract/Promised Salary *</label>
                  <input
                    type="number"
                    id="contractSalary"
                    name="contractSalary"
                    value={formData.contractSalary}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="receivedSalary">Received Salary *</label>
                  <input
                    type="number"
                    id="receivedSalary"
                    name="receivedSalary"
                    value={formData.receivedSalary}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                    <option value="MYR">MYR</option>
                    <option value="QAR">QAR</option>
                    <option value="KWD">KWD</option>
                    <option value="OMR">OMR</option>
                    <option value="BDT">BDT</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="paymentDate">Payment Date *</label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentPeriod">Payment Period</label>
                  <select
                    id="paymentPeriod"
                    name="paymentPeriod"
                    value={formData.paymentPeriod}
                    onChange={handleInputChange}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="one_time">One-time</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="workType">Work Type</label>
                  <input
                    type="text"
                    id="workType"
                    name="workType"
                    value={formData.workType}
                    onChange={handleInputChange}
                    placeholder="e.g., Construction, Domestic"
                  />
                </div>
              </div>

              {/* Deductions */}
              <div className="form-section">
                <h3>Deductions (Optional)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="deductions.accommodation">Accommodation</label>
                    <input
                      type="number"
                      id="deductions.accommodation"
                      name="deductions.accommodation"
                      value={formData.deductions.accommodation}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deductions.food">Food</label>
                    <input
                      type="number"
                      id="deductions.food"
                      name="deductions.food"
                      value={formData.deductions.food}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deductions.transport">Transport</label>
                    <input
                      type="number"
                      id="deductions.transport"
                      name="deductions.transport"
                      value={formData.deductions.transport}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deductions.other">Other</label>
                    <input
                      type="number"
                      id="deductions.other"
                      name="deductions.other"
                      value={formData.deductions.other}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="deductions.description">Deduction Description</label>
                  <input
                    type="text"
                    id="deductions.description"
                    name="deductions.description"
                    value={formData.deductions.description}
                    onChange={handleInputChange}
                    placeholder="Describe deductions..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={1000}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Add Record'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Options */}
        <div className="filter-options">
          <button
            onClick={() => setSelectedFilter('all')}
            className={selectedFilter === 'all' ? 'filter-active' : ''}
          >
            All Records
          </button>
          <button
            onClick={() => setSelectedFilter('discrepancy')}
            className={selectedFilter === 'discrepancy' ? 'filter-active' : ''}
          >
            With Discrepancies
          </button>
          <button
            onClick={() => setSelectedFilter('unpaid')}
            className={selectedFilter === 'unpaid' ? 'filter-active' : ''}
          >
            Unpaid
          </button>
          <button
            onClick={() => setSelectedFilter('partial')}
            className={selectedFilter === 'partial' ? 'filter-active' : ''}
          >
            Partial
          </button>
          <button
            onClick={() => setSelectedFilter('disputed')}
            className={selectedFilter === 'disputed' ? 'filter-active' : ''}
          >
            Disputed
          </button>
        </div>

        {/* Records List */}
        <div className="records-list">
          {loading && <p className="loading-text">Loading...</p>}
          
          {!loading && records.length === 0 && (
            <p className="no-records">No salary records found. Add your first record above!</p>
          )}

          {!loading && records.length > 0 && (
            <div className="records-grid">
              {records.map((record) => {
                const discrepancyPercentage = calculateDiscrepancyPercentage(
                  record.contractSalary,
                  record.receivedSalary
                );
                const severity = getDiscrepancySeverity(discrepancyPercentage);
                const hasDiscrepancy = Math.abs(record.discrepancyAmount) > 0.01;

                return (
                  <div
                    key={record._id}
                    className={`record-card ${hasDiscrepancy ? 'has-discrepancy' : ''}`}
                    style={{
                      borderLeftColor: hasDiscrepancy ? getSeverityColor(severity) : '#e0e0e0',
                    }}
                  >
                    <div className="record-header">
                      <h3>{record.employerName}</h3>
                      <span className={`status-badge ${getStatusClass(record.status)}`}>
                        {record.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="record-details">
                      <div className="detail-row">
                        <span className="detail-label">Payment Date:</span>
                        <span>{formatDate(record.paymentDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Contract Salary:</span>
                        <span>{formatCurrency(record.contractSalary, record.currency)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Received Salary:</span>
                        <span>{formatCurrency(record.receivedSalary, record.currency)}</span>
                      </div>

                      {hasDiscrepancy && (
                        <>
                          <div className="detail-row discrepancy-highlight">
                            <span className="detail-label">Discrepancy:</span>
                            <span className="discrepancy-amount">
                              {formatCurrency(record.discrepancyAmount, record.currency)}
                              <span className="discrepancy-percent">
                                ({discrepancyPercentage.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                          <div className="severity-indicator">
                            <span
                              className={`severity-badge severity-${severity}`}
                              style={{ backgroundColor: getSeverityColor(severity) }}
                            >
                              {severity.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </>
                      )}

                      {record.workType && (
                        <div className="detail-row">
                          <span className="detail-label">Work Type:</span>
                          <span>{record.workType}</span>
                        </div>
                      )}

                      {record.notes && (
                        <div className="record-notes">
                          <p>{record.notes}</p>
                        </div>
                      )}

                      {/* Proof Documents */}
                      {record.proofDocuments && record.proofDocuments.length > 0 && (
                        <div className="proof-documents">
                          <h4>Proof Documents:</h4>
                          <ul>
                            {record.proofDocuments.map((doc) => (
                              <li key={doc._id}>
                                <span>{doc.fileName}</span>
                                <button
                                  onClick={() => handleRemoveProof(record._id, doc._id)}
                                  className="btn-remove-proof"
                                  title="Remove"
                                >
                                  ✕
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="record-actions">
                      <button onClick={() => handleEdit(record)} className="btn-action">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(record._id)} className="btn-action danger">
                        Delete
                      </button>
                      {hasDiscrepancy && !record.isDisputed && (
                        <button onClick={() => handleDispute(record._id)} className="btn-action warning">
                          Mark Disputed
                        </button>
                      )}
                      <label className="btn-action upload">
                        Upload Proof
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, record._id)}
                          style={{ display: 'none' }}
                          disabled={uploadingFile}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryTracker;
