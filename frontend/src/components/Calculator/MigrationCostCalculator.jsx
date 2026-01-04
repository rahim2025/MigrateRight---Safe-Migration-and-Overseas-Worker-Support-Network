import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import calculatorService from '../../services/calculatorService';
import './MigrationCostCalculator.css';

const MigrationCostCalculator = () => {
  const { t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    destinationCountry: '',
    jobType: '',
    agencyFee: '',
    additionalCosts: {
      airfare: '',
      documentation: '',
      insurance: '',
      other: ''
    }
  });

  // Data state
  const [countries, setCountries] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load job types when country changes
  useEffect(() => {
    if (formData.destinationCountry) {
      loadJobTypes(formData.destinationCountry);
    } else {
      setJobTypes([]);
      setFormData(prev => ({ ...prev, jobType: '' }));
    }
  }, [formData.destinationCountry]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const response = await calculatorService.getAvailableCountries();
      setCountries(response.data.countries || []);
    } catch (err) {
      setError('Failed to load countries. Please try again.');
      console.error('Error loading countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobTypes = async (country) => {
    try {
      setLoading(true);
      const response = await calculatorService.getJobTypesByCountry(country);
      setJobTypes(response.data.jobTypes || []);
    } catch (err) {
      setError(`No fee rules available for ${country}`);
      setJobTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('additionalCosts.')) {
      const costField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        additionalCosts: {
          ...prev.additionalCosts,
          [costField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear result when form changes
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.destinationCountry || !formData.jobType || !formData.agencyFee) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setCalculating(true);
      setError(null);

      // Prepare data for API
      const calculationData = {
        destinationCountry: formData.destinationCountry,
        jobType: formData.jobType,
        agencyFee: parseFloat(formData.agencyFee),
        additionalCosts: {
          airfare: formData.additionalCosts.airfare ? parseFloat(formData.additionalCosts.airfare) : 0,
          documentation: formData.additionalCosts.documentation ? parseFloat(formData.additionalCosts.documentation) : 0,
          insurance: formData.additionalCosts.insurance ? parseFloat(formData.additionalCosts.insurance) : 0,
          other: formData.additionalCosts.other ? parseFloat(formData.additionalCosts.other) : 0
        }
      };

      const response = await calculatorService.calculateMigrationCost(calculationData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate. Please try again.');
      console.error('Calculation error:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      destinationCountry: '',
      jobType: '',
      agencyFee: '',
      additionalCosts: {
        airfare: '',
        documentation: '',
        insurance: '',
        other: ''
      }
    });
    setResult(null);
    setError(null);
  };

  const getWarningClass = (level) => {
    const classes = {
      'severe': 'warning-severe',
      'warning': 'warning-high',
      'caution': 'warning-moderate',
      'moderate': 'warning-moderate',
      'safe': 'warning-safe'
    };
    return classes[level] || 'warning-info';
  };

  const formatCurrency = (amount, currency = 'BDT') => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatJobType = (jobType) => {
    return jobType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h1>Migration Cost Calculator</h1>
        <p className="calculator-subtitle">
          Check if your agency fee is within legal limits
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="calculator-form">
        {/* Destination Country */}
        <div className="form-group">
          <label htmlFor="destinationCountry">
            Destination Country <span className="required">*</span>
          </label>
          <select
            id="destinationCountry"
            name="destinationCountry"
            value={formData.destinationCountry}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="">Select destination country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* Job Type */}
        <div className="form-group">
          <label htmlFor="jobType">
            Job Type <span className="required">*</span>
          </label>
          <select
            id="jobType"
            name="jobType"
            value={formData.jobType}
            onChange={handleInputChange}
            required
            disabled={loading || !formData.destinationCountry}
          >
            <option value="">Select job type</option>
            {jobTypes.map(jobType => (
              <option key={jobType} value={jobType}>
                {formatJobType(jobType)}
              </option>
            ))}
          </select>
        </div>

        {/* Agency Fee */}
        <div className="form-group">
          <label htmlFor="agencyFee">
            Agency Fee (BDT) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="agencyFee"
            name="agencyFee"
            value={formData.agencyFee}
            onChange={handleInputChange}
            placeholder="Enter agency fee in BDT"
            min="0"
            step="1000"
            required
          />
          <small className="form-help">
            The recruitment fee quoted by your agency
          </small>
        </div>

        {/* Additional Costs (Optional) */}
        <div className="form-section">
          <h3>Additional Costs (Optional)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="airfare">Airfare (BDT)</label>
              <input
                type="number"
                id="airfare"
                name="additionalCosts.airfare"
                value={formData.additionalCosts.airfare}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="documentation">Documentation (BDT)</label>
              <input
                type="number"
                id="documentation"
                name="additionalCosts.documentation"
                value={formData.additionalCosts.documentation}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="insurance">Insurance (BDT)</label>
              <input
                type="number"
                id="insurance"
                name="additionalCosts.insurance"
                value={formData.additionalCosts.insurance}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="other">Other Costs (BDT)</label>
              <input
                type="number"
                id="other"
                name="additionalCosts.other"
                value={formData.additionalCosts.other}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={calculating || loading}
          >
            {calculating ? 'Calculating...' : 'Calculate Cost'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={calculating}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="calculator-results">
          {/* Main Warning */}
          {result.warnings && result.warnings.length > 0 && (
            <div className={`result-card ${getWarningClass(result.warnings[0].level)}`}>
              <div className="warning-header">
                <span className="warning-icon">
                  {result.warnings[0].level === 'severe' && '🚨'}
                  {result.warnings[0].level === 'warning' && '⚠️'}
                  {result.warnings[0].level === 'caution' && '⚡'}
                  {result.warnings[0].level === 'safe' && '✅'}
                </span>
                <h3>{result.warnings[0].message}</h3>
              </div>
              <p className="warning-recommendation">
                <strong>Recommendation:</strong> {result.warnings[0].recommendation}
              </p>
              {result.warnings[0].reportUrl && (
                <a 
                  href={result.warnings[0].reportUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="report-link"
                >
                  Report to BMET →
                </a>
              )}
            </div>
          )}

          {/* Fee Comparison */}
          <div className="result-card">
            <h3>Fee Comparison</h3>
            <div className="comparison-grid">
              <div className="comparison-item">
                <span className="label">Your Agency Fee:</span>
                <span className="value">{formatCurrency(result.comparison.userFee)}</span>
              </div>
              <div className="comparison-item">
                <span className="label">Legal Range:</span>
                <span className="value">
                  {formatCurrency(result.legalFeeRange.agencyFee.min)} - {formatCurrency(result.legalFeeRange.agencyFee.max)}
                </span>
              </div>
              {result.comparison.difference > 0 && (
                <div className="comparison-item highlight">
                  <span className="label">Amount Over Legal Max:</span>
                  <span className="value danger">{formatCurrency(result.comparison.difference)}</span>
                </div>
              )}
              {result.comparison.percentAboveMax > 0 && (
                <div className="comparison-item highlight">
                  <span className="label">Percentage Over:</span>
                  <span className="value danger">{result.comparison.percentAboveMax.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          {result.breakdown && (
            <div className="result-card">
              <h3>Complete Cost Breakdown</h3>
              <div className="breakdown-section">
                <h4>Recruitment Fee (Legal Range)</h4>
                <p>
                  {formatCurrency(result.breakdown.recruitmentFee.min)} - {formatCurrency(result.breakdown.recruitmentFee.max)}
                </p>
              </div>
              <div className="breakdown-section">
                <h4>Government Fees</h4>
                <ul>
                  <li>Visa: {formatCurrency(result.breakdown.governmentFees.visa)}</li>
                  <li>Passport: {formatCurrency(result.breakdown.governmentFees.passport)}</li>
                  <li>Medical Test: {formatCurrency(result.breakdown.governmentFees.medicalTest)}</li>
                  <li>Training: {formatCurrency(result.breakdown.governmentFees.trainingFee)}</li>
                  <li>Emigration Clearance: {formatCurrency(result.breakdown.governmentFees.emigrationClearance)}</li>
                </ul>
                <p className="total">
                  <strong>Total Government Fees: {formatCurrency(result.breakdown.governmentFees.total)}</strong>
                </p>
              </div>
              <div className="breakdown-section highlight">
                <h4>Total Estimated Cost</h4>
                <p className="total-range">
                  {formatCurrency(result.breakdown.totalCost.minimum)} - {formatCurrency(result.breakdown.totalCost.maximum)}
                </p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.additionalAdvice && (
            <div className="result-card">
              <h3>Important Recommendations</h3>
              <ul className="recommendations-list">
                {result.recommendations.additionalAdvice.map((advice, index) => (
                  <li key={index}>{advice}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {result.resources && (
            <div className="result-card resources">
              <h3>Helpful Resources</h3>
              <div className="resources-grid">
                <a href={result.resources.bmetWebsite} target="_blank" rel="noopener noreferrer" className="resource-link">
                  🌐 BMET Official Website
                </a>
                <a href={result.resources.verifyAgency} target="_blank" rel="noopener noreferrer" className="resource-link">
                  ✅ Verify Agency License
                </a>
                <a href={result.resources.complaintPortal} target="_blank" rel="noopener noreferrer" className="resource-link">
                  📝 File Complaint
                </a>
                <div className="resource-link">
                  📞 BMET Hotline: {result.resources.helpline}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="calculator-footer">
        <p>
          <strong>Note:</strong> This calculator uses official BMET-approved fee ranges. 
          Always verify agency credentials and get all agreements in writing before making any payments.
        </p>
      </div>
    </div>
  );
};

export default MigrationCostCalculator;
