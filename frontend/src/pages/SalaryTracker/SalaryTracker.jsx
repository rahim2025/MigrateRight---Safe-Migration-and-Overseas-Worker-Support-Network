import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import {
  createSalaryRecord,
  getSalaryRecords,
  updateSalaryRecord,
  deleteSalaryRecord,
  uploadProofDocument,
  deleteProofDocument,
  getSalarySummary,
  getSalaryMismatches,
  markAsDisputed,
  formatCurrency,
  calculateDiscrepancyPercentage,
  getDiscrepancySeverity,
  getSeverityColor,
  formatDate,
  calculateStatistics,
  isValidUploadFile,
  getDocumentTypeLabel,
} from '../../services/salaryTrackerService';
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
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    employmentId: '',
    employerName: '',
    employerCountry: '',
    position: '',
    promisedSalary: '',
    receivedSalary: '',
    currency: 'USD',
    paymentDate: '',
    paymentPeriod: 'monthly',
    notes: '',
    deductions: {
      housing: '',
      meals: '',
      taxes: '',
      insurance: '',
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
        filters.status = selectedFilter;
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
      const response = await getSalaryRecords();
      const stats = calculateStatistics(response.data);
      setStatistics(stats);
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
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate required fields
      if (!formData.employmentId || !formData.employerName || !formData.promisedSalary || !formData.receivedSalary || !formData.paymentDate) {
        throw new Error('Please fill in all required fields');
      }

      // Validate salary amounts
      const promised = parseFloat(formData.promisedSalary);
      const received = parseFloat(formData.receivedSalary);
      
      if (promised <= 0 || received < 0) {
        throw new Error('Please enter valid salary amounts');
      }

      // Prepare data
      const recordData = {
        employmentId: formData.employmentId.trim(),
        employerName: formData.employerName.trim(),
        employerCountry: formData.employerCountry.trim() || 'Not Specified',
        position: formData.position ? formData.position.trim() : undefined,
        promisedSalary: promised,
        receivedSalary: received,
        currency: formData.currency,
        paymentDate: formData.paymentDate,
        paymentPeriod: formData.paymentPeriod,
        notes: formData.notes ? formData.notes.trim() : undefined,
        deductions: {
          housing: parseFloat(formData.deductions.housing) || 0,
          meals: parseFloat(formData.deductions.meals) || 0,
          taxes: parseFloat(formData.deductions.taxes) || 0,
          insurance: parseFloat(formData.deductions.insurance) || 0,
          other: parseFloat(formData.deductions.other) || 0,
          description: formData.deductions.description || undefined,
        },
      };

      if (editingRecord) {
        await updateSalaryRecord(editingRecord._id, recordData);
        setSuccessMessage('Salary record updated successfully!');
      } else {
        await createSalaryRecord(recordData);
        setSuccessMessage('Salary record created successfully!');
      }

      // Reset form and reload
      resetForm();
      setShowForm(false);
      setEditingRecord(null);
      await loadRecords();
      await loadStatistics();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving record:', error);
      const errorMsg = error.message || error.response?.data?.message || 'Failed to save salary record';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employmentId: '',
      employerName: '',
      employerCountry: '',
      position: '',
      promisedSalary: '',
      receivedSalary: '',
      currency: 'USD',
      paymentDate: '',
      paymentPeriod: 'monthly',
      notes: '',
      deductions: {
        housing: '',
        meals: '',
        taxes: '',
        insurance: '',
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
      employmentId: record.employmentId,
      employerName: record.employerName,
      employerCountry: record.employerCountry || '',
      position: record.position || '',
      promisedSalary: record.promisedSalary.toString(),
      receivedSalary: record.receivedSalary.toString(),
      currency: record.currency,
      paymentDate: new Date(record.paymentDate).toISOString().split('T')[0],
      paymentPeriod: record.paymentPeriod,
      notes: record.notes || '',
      deductions: {
        housing: record.deductions?.housing?.toString() || '',
        meals: record.deductions?.meals?.toString() || '',
        taxes: record.deductions?.taxes?.toString() || '',
        insurance: record.deductions?.insurance?.toString() || '',
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
    setError(null);
    try {
      await deleteSalaryRecord(id);
      await loadRecords();
      await loadStatistics();
      setSuccessMessage('Record deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting record:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete record';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e, recordId) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    try {
      isValidUploadFile(file);
      
      setUploadingFile(true);
      await uploadProofDocument(recordId, file, 'payslip', 'Salary proof document');
      await loadRecords();
      setSuccessMessage('Proof document uploaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMsg = error.message || 'Failed to upload proof document';
      setError(errorMsg);
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Handle remove proof
  const handleRemoveProof = async (recordId, documentId) => {
    if (!window.confirm('Remove this proof document?')) return;

    setError(null);
    try {
      await deleteProofDocument(recordId, documentId);
      await loadRecords();
      setSuccessMessage('Document removed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error removing proof:', error);
      const errorMsg = error.response?.data?.message || 'Failed to remove proof';
      setError(errorMsg);
    }
  };

  // Handle mark as disputed
  const handleDispute = async (recordId) => {
    const reason = prompt('Please enter the reason for dispute:');
    if (!reason) return;

    setError(null);
    try {
      await markAsDisputed(recordId, reason);
      await loadRecords();
      await loadStatistics();
      setSuccessMessage('Record marked as disputed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error marking as disputed:', error);
      const errorMsg = error.response?.data?.message || 'Failed to mark as disputed';
      setError(errorMsg);
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
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{
            background: '#ffebee',
            border: '1px solid #ef5350',
            color: '#c62828',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}>✕</button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="alert alert-success" style={{
            background: '#e8f5e9',
            border: '1px solid #66bb6a',
            color: '#2e7d32',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}>✕</button>
          </div>
        )}

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
              <h3>{t?.salaryTracker?.totalExpected || 'Total Promised'}</h3>
              <p className="stat-value">{formatCurrency(statistics.totalPromised)}</p>
            </div>
            <div className="stat-card">
              <h3>{t?.salaryTracker?.totalReceived || 'Total Received'}</h3>
              <p className="stat-value success">{formatCurrency(statistics.totalReceived)}</p>
            </div>
            <div className="stat-card">
              <h3>{t?.salaryTracker?.totalDiscrepancy || 'Total Shortfall'}</h3>
              <p className={`stat-value ${statistics.totalShortfall > 0 ? 'danger' : 'success'}`}>
                {formatCurrency(statistics.totalShortfall)}
              </p>
            </div>
            <div className="stat-card">
              <h3>{t?.salaryTracker?.recordsWithIssues || 'Records with Mismatches'}</h3>
              <p className="stat-value warning">{statistics.recordsWithMismatch}</p>
            </div>
            {statistics.criticalCount > 0 && (
              <div className="stat-card critical">
                <h3>Critical Issues</h3>
                <p className="stat-value danger">{statistics.criticalCount}</p>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="salary-form-container">
            <h2>{editingRecord ? 'Edit Salary Record' : 'Add New Salary Record'}</h2>
            <form onSubmit={handleSubmit} className="salary-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="employmentId">Employment ID *</label>
                  <input
                    type="text"
                    id="employmentId"
                    name="employmentId"
                    value={formData.employmentId}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter employment ID"
                  />
                </div>
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
                  <label htmlFor="employerCountry">Country *</label>
                  <input
                    type="text"
                    id="employerCountry"
                    name="employerCountry"
                    value={formData.employerCountry}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Saudi Arabia"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., Construction Worker"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="promisedSalary">Promised Salary *</label>
                  <input
                    type="number"
                    id="promisedSalary"
                    name="promisedSalary"
                    value={formData.promisedSalary}
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
                    <option value="PHP">PHP</option>
                    <option value="THB">THB</option>
                    <option value="SGD">SGD</option>
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
                  </select>
                </div>
              </div>

              {/* Deductions */}
              <div className="form-section">
                <h3>Deductions (Optional)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="deductions.housing">Housing</label>
                    <input
                      type="number"
                      id="deductions.housing"
                      name="deductions.housing"
                      value={formData.deductions.housing}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deductions.meals">Meals</label>
                    <input
                      type="number"
                      id="deductions.meals"
                      name="deductions.meals"
                      value={formData.deductions.meals}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deductions.taxes">Taxes</label>
                    <input
                      type="number"
                      id="deductions.taxes"
                      name="deductions.taxes"
                      value={formData.deductions.taxes}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="deductions.insurance">Insurance</label>
                    <input
                      type="number"
                      id="deductions.insurance"
                      name="deductions.insurance"
                      value={formData.deductions.insurance}
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
            onClick={() => setSelectedFilter('minor_mismatch')}
            className={selectedFilter === 'minor_mismatch' ? 'filter-active' : ''}
          >
            Minor Issues
          </button>
          <button
            onClick={() => setSelectedFilter('significant_mismatch')}
            className={selectedFilter === 'significant_mismatch' ? 'filter-active' : ''}
          >
            Significant Issues
          </button>
          <button
            onClick={() => setSelectedFilter('critical_underpayment')}
            className={selectedFilter === 'critical_underpayment' ? 'filter-active' : ''}
          >
            Critical Issues
          </button>
          <button
            onClick={() => setSelectedFilter('disputed')}
            className={selectedFilter === 'disputed' ? 'filter-active' : ''}
          >
            Disputed
          </button>
          <button
            onClick={() => setSelectedFilter('resolved')}
            className={selectedFilter === 'resolved' ? 'filter-active' : ''}
          >
            Resolved
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
                const discrepancyPercentage = record.discrepancy?.percentage || 0;
                const severity = getDiscrepancySeverity(discrepancyPercentage);
                const hasMismatch = record.discrepancy?.status !== 'match';

                return (
                  <div
                    key={record._id}
                    className={`record-card ${hasMismatch ? 'has-discrepancy' : ''}`}
                    style={{
                      borderLeftColor: hasMismatch ? getSeverityColor(severity) : '#e0e0e0',
                    }}
                  >
                    <div className="record-header">
                      <h3>{record.employerName}</h3>
                      <span className={`status-badge status-${record.discrepancy?.status}`}>
                        {record.discrepancy?.status?.replace(/_/g, ' ').toUpperCase() || 'MATCH'}
                      </span>
                    </div>

                    <div className="record-details">
                      <div className="detail-row">
                        <span className="detail-label">Employment ID:</span>
                        <span>{record.employmentId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Country:</span>
                        <span>{record.employerCountry}</span>
                      </div>
                      {record.position && (
                        <div className="detail-row">
                          <span className="detail-label">Position:</span>
                          <span>{record.position}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Payment Date:</span>
                        <span>{formatDate(record.paymentDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Promised Salary:</span>
                        <span>{formatCurrency(record.promisedSalary, record.currency)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Received Salary:</span>
                        <span>{formatCurrency(record.receivedSalary, record.currency)}</span>
                      </div>

                      {hasMismatch && (
                        <>
                          <div className="detail-row discrepancy-highlight">
                            <span className="detail-label">Shortfall:</span>
                            <span className="discrepancy-amount">
                              {formatCurrency(record.discrepancy.amount, record.currency)}
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
                              {severity.toUpperCase()}
                            </span>
                          </div>
                        </>
                      )}

                      {record.discrepancy?.totalDeductions > 0 && (
                        <div className="detail-row">
                          <span className="detail-label">Total Deductions:</span>
                          <span>{formatCurrency(record.discrepancy.totalDeductions, record.currency)}</span>
                        </div>
                      )}

                      {record.notes && (
                        <div className="record-notes">
                          <p><strong>Notes:</strong> {record.notes}</p>
                        </div>
                      )}

                      {/* Proof Documents */}
                      {record.proofDocuments && record.proofDocuments.length > 0 && (
                        <div className="proof-documents">
                          <h4>Proof Documents ({record.proofDocuments.length}):</h4>
                          <ul>
                            {record.proofDocuments.map((doc) => (
                              <li key={doc._id}>
                                <span className="doc-name">{doc.fileName}</span>
                                <span className="doc-type">{getDocumentTypeLabel(doc.documentType)}</span>
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
                      {hasMismatch && record.status !== 'disputed' && (
                        <button onClick={() => handleDispute(record._id)} className="btn-action warning">
                          Dispute
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
