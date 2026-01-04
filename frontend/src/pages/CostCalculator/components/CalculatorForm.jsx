import { useState } from 'react';
import PropTypes from 'prop-types';
import './CalculatorForm.css';

/**
 * Calculator Form Component (Step 1)
 * Form for entering migration fee information
 */
const CalculatorForm = ({
  formData,
  countries,
  countriesLoading,
  onFormChange,
  onSubmit,
  onLoadExample,
  onReset,
  language
}) => {
  const [showPaymentTerms, setShowPaymentTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const translations = {
    en: {
      destinationCountry: 'Destination Country',
      selectCountry: 'Select a country',
      serviceType: 'Service Type',
      visaOnly: 'Visa Only',
      workPermit: 'Work Permit',
      fullPackage: 'Full Package',
      workerCategory: 'Worker Category',
      selectCategory: 'Select category',
      domestic: 'Domestic Worker',
      construction: 'Construction',
      healthcare: 'Healthcare',
      hospitality: 'Hospitality',
      other: 'Other',
      agencyFeeDetails: 'Agency Fee Details',
      visaApplicationFee: 'Visa Application Fee',
      medicalTestsFee: 'Medical Tests Fee',
      documentProcessingFee: 'Document Processing Fee',
      trainingFee: 'Training Fee',
      hiddenCharges: 'Other/Hidden Charges',
      optional: '(Optional)',
      paymentTerms: 'Payment Terms',
      showPaymentTerms: 'Show Payment Terms',
      hidePaymentTerms: 'Hide Payment Terms',
      upfrontPercentage: 'Upfront Payment Percentage',
      requiresDebtBondage: 'Requires Debt Bondage',
      yes: 'Yes',
      no: 'No',
      calculateBtn: 'Calculate & Compare Fees',
      loadExample: 'Load Example',
      clearAll: 'Clear All',
      required: 'This field is required',
      invalidAmount: 'Please enter a valid amount',
      tooltips: {
        visaApplicationFee: 'Cost to apply for work visa at embassy',
        medicalTestsFee: 'Cost for required medical examinations',
        documentProcessingFee: 'Cost for document preparation and processing',
        trainingFee: 'Cost for pre-departure training',
        hiddenCharges: 'Any additional or undisclosed charges'
      }
    },
    bn: {
      destinationCountry: 'গন্তব্য দেশ',
      selectCountry: 'একটি দেশ নির্বাচন করুন',
      serviceType: 'সেবার ধরন',
      visaOnly: 'শুধু ভিসা',
      workPermit: 'ওয়ার্ক পারমিট',
      fullPackage: 'সম্পূর্ণ প্যাকেজ',
      workerCategory: 'শ্রমিক বিভাগ',
      selectCategory: 'বিভাগ নির্বাচন করুন',
      domestic: 'গৃহকর্মী',
      construction: 'নির্মাণ',
      healthcare: 'স্বাস্থ্যসেবা',
      hospitality: 'আতিথেয়তা',
      other: 'অন্যান্য',
      agencyFeeDetails: 'এজেন্সি ফি বিবরণ',
      visaApplicationFee: 'ভিসা আবেদন ফি',
      medicalTestsFee: 'মেডিকেল পরীক্ষা ফি',
      documentProcessingFee: 'ডকুমেন্ট প্রসেসিং ফি',
      trainingFee: 'প্রশিক্ষণ ফি',
      hiddenCharges: 'অন্যান্য/লুকানো চার্জ',
      optional: '(ঐচ্ছিক)',
      paymentTerms: 'পেমেন্ট শর্তাবলী',
      showPaymentTerms: 'পেমেন্ট শর্তাবলী দেখান',
      hidePaymentTerms: 'পেমেন্ট শর্তাবলী লুকান',
      upfrontPercentage: 'অগ্রিম পেমেন্ট শতাংশ',
      requiresDebtBondage: 'ঋণ বন্ধন প্রয়োজন',
      yes: 'হ্যাঁ',
      no: 'না',
      calculateBtn: 'গণনা এবং ফি তুলনা করুন',
      loadExample: 'উদাহরণ লোড করুন',
      clearAll: 'সব মুছুন',
      required: 'এই ক্ষেত্রটি প্রয়োজন',
      invalidAmount: 'একটি বৈধ পরিমাণ লিখুন',
      tooltips: {
        visaApplicationFee: 'দূতাবাসে ওয়ার্ক ভিসা আবেদনের খরচ',
        medicalTestsFee: 'প্রয়োজনীয় মেডিকেল পরীক্ষার খরচ',
        documentProcessingFee: 'ডকুমেন্ট প্রস্তুতি এবং প্রসেসিং খরচ',
        trainingFee: 'প্রাক-প্রস্থান প্রশিক্ষণের খরচ',
        hiddenCharges: 'যেকোনো অতিরিক্ত বা অপ্রকাশিত চার্জ'
      }
    }
  };

  const txt = translations[language] || translations.en;

  const serviceTypes = [
    { value: 'visa', label: txt.visaOnly },
    { value: 'work_permit', label: txt.workPermit },
    { value: 'full_package', label: txt.fullPackage }
  ];

  const workerCategories = [
    { value: 'domestic', label: txt.domestic },
    { value: 'construction', label: txt.construction },
    { value: 'healthcare', label: txt.healthcare },
    { value: 'hospitality', label: txt.hospitality },
    { value: 'other', label: txt.other }
  ];

  const getCurrencySymbol = () => {
    const country = countries.find(c => c.code === formData.destinationCountry);
    if (country?.currency) {
      const symbols = {
        SAR: '﷼',
        AED: 'د.إ',
        QAR: 'ر.ق',
        KWD: 'د.ك',
        MYR: 'RM',
        SGD: 'S$',
        BDT: '৳'
      };
      return symbols[country.currency] || country.currency;
    }
    return '৳'; // Default to BDT
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newFormData = { ...formData };

    if (name.startsWith('fees.')) {
      const feeField = name.split('.')[1];
      newFormData = {
        ...formData,
        fees: {
          ...formData.fees,
          [feeField]: value
        }
      };
    } else if (name.startsWith('paymentTerms.')) {
      const termField = name.split('.')[1];
      newFormData = {
        ...formData,
        paymentTerms: {
          ...formData.paymentTerms,
          [termField]: type === 'checkbox' ? checked : value
        }
      };
    } else {
      newFormData = {
        ...formData,
        [name]: value
      };
    }

    onFormChange(newFormData);

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.destinationCountry) {
      errors.destinationCountry = txt.required;
    }
    if (!formData.serviceType) {
      errors.serviceType = txt.required;
    }
    if (!formData.workerCategory) {
      errors.workerCategory = txt.required;
    }

    // Validate at least one fee is entered
    const hasFees = Object.values(formData.fees).some(fee => fee && parseFloat(fee) > 0);
    if (!hasFees) {
      errors['fees.visaApplicationFee'] = txt.required;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  const formatNumber = (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  return (
    <form className="calculator-form" onSubmit={handleSubmit}>
      {/* Section 1: Basic Information */}
      <section className="form-section">
        <h3 className="section-title">1. {txt.destinationCountry} & {txt.serviceType}</h3>

        <div className="form-row">
          {/* Destination Country */}
          <div className="form-group">
            <label htmlFor="destinationCountry">{txt.destinationCountry} *</label>
            <select
              id="destinationCountry"
              name="destinationCountry"
              value={formData.destinationCountry}
              onChange={handleInputChange}
              disabled={countriesLoading}
              className={validationErrors.destinationCountry ? 'error' : ''}
            >
              <option value="">{txt.selectCountry}</option>
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <option key={country.code || country} value={country.code || country}>
                    {country.flag || ''} {country.name || country}
                  </option>
                ))
              ) : (
                // Fallback if countries array is empty
                <>
                  <option value="SA">🇸🇦 Saudi Arabia</option>
                  <option value="AE">🇦🇪 United Arab Emirates</option>
                  <option value="QA">🇶🇦 Qatar</option>
                  <option value="KW">🇰🇼 Kuwait</option>
                  <option value="MY">🇲🇾 Malaysia</option>
                  <option value="SG">🇸🇬 Singapore</option>
                </>
              )}
            </select>
            {validationErrors.destinationCountry && (
              <span className="error-text">{validationErrors.destinationCountry}</span>
            )}
          </div>

          {/* Worker Category */}
          <div className="form-group">
            <label htmlFor="workerCategory">{txt.workerCategory} *</label>
            <select
              id="workerCategory"
              name="workerCategory"
              value={formData.workerCategory}
              onChange={handleInputChange}
              className={validationErrors.workerCategory ? 'error' : ''}
            >
              <option value="">{txt.selectCategory}</option>
              {workerCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {validationErrors.workerCategory && (
              <span className="error-text">{validationErrors.workerCategory}</span>
            )}
          </div>
        </div>

        {/* Service Type - Radio Buttons */}
        <div className="form-group">
          <label>{txt.serviceType} *</label>
          <div className={`radio-group ${validationErrors.serviceType ? 'error' : ''}`}>
            {serviceTypes.map((type) => (
              <label key={type.value} className="radio-label">
                <input
                  type="radio"
                  name="serviceType"
                  value={type.value}
                  checked={formData.serviceType === type.value}
                  onChange={handleInputChange}
                />
                <span className="radio-text">{type.label}</span>
              </label>
            ))}
          </div>
          {validationErrors.serviceType && (
            <span className="error-text">{validationErrors.serviceType}</span>
          )}
        </div>
      </section>

      {/* Section 2: Fee Details */}
      <section className="form-section">
        <h3 className="section-title">2. {txt.agencyFeeDetails}</h3>

        <div className="fee-inputs">
          {/* Visa Application Fee */}
          <div className="form-group fee-input">
            <label htmlFor="visaApplicationFee">
              {txt.visaApplicationFee}
              <span className="tooltip-icon" title={txt.tooltips.visaApplicationFee}>ℹ️</span>
            </label>
            <div className="input-with-currency">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input
                type="number"
                id="visaApplicationFee"
                name="fees.visaApplicationFee"
                value={formData.fees.visaApplicationFee}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className={validationErrors['fees.visaApplicationFee'] ? 'error' : ''}
              />
            </div>
            {validationErrors['fees.visaApplicationFee'] && (
              <span className="error-text">{validationErrors['fees.visaApplicationFee']}</span>
            )}
          </div>

          {/* Medical Tests Fee */}
          <div className="form-group fee-input">
            <label htmlFor="medicalTestsFee">
              {txt.medicalTestsFee}
              <span className="tooltip-icon" title={txt.tooltips.medicalTestsFee}>ℹ️</span>
            </label>
            <div className="input-with-currency">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input
                type="number"
                id="medicalTestsFee"
                name="fees.medicalTestsFee"
                value={formData.fees.medicalTestsFee}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Document Processing Fee */}
          <div className="form-group fee-input">
            <label htmlFor="documentProcessingFee">
              {txt.documentProcessingFee}
              <span className="tooltip-icon" title={txt.tooltips.documentProcessingFee}>ℹ️</span>
            </label>
            <div className="input-with-currency">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input
                type="number"
                id="documentProcessingFee"
                name="fees.documentProcessingFee"
                value={formData.fees.documentProcessingFee}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Training Fee */}
          <div className="form-group fee-input">
            <label htmlFor="trainingFee">
              {txt.trainingFee}
              <span className="tooltip-icon" title={txt.tooltips.trainingFee}>ℹ️</span>
            </label>
            <div className="input-with-currency">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input
                type="number"
                id="trainingFee"
                name="fees.trainingFee"
                value={formData.fees.trainingFee}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Hidden Charges */}
          <div className="form-group fee-input">
            <label htmlFor="hiddenCharges">
              {txt.hiddenCharges} {txt.optional}
              <span className="tooltip-icon" title={txt.tooltips.hiddenCharges}>ℹ️</span>
            </label>
            <div className="input-with-currency">
              <span className="currency-symbol">{getCurrencySymbol()}</span>
              <input
                type="number"
                id="hiddenCharges"
                name="fees.hiddenCharges"
                value={formData.fees.hiddenCharges}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Payment Terms (Expandable) */}
      <section className="form-section collapsible">
        <button
          type="button"
          className="section-toggle"
          onClick={() => setShowPaymentTerms(!showPaymentTerms)}
        >
          <h3 className="section-title">3. {txt.paymentTerms} {txt.optional}</h3>
          <span className="toggle-icon">{showPaymentTerms ? '▼' : '▶'}</span>
        </button>

        {showPaymentTerms && (
          <div className="collapsible-content">
            <div className="form-row">
              {/* Upfront Percentage */}
              <div className="form-group">
                <label htmlFor="upfrontPercentage">
                  {txt.upfrontPercentage}: {formData.paymentTerms.upfrontPercentage}%
                </label>
                <input
                  type="range"
                  id="upfrontPercentage"
                  name="paymentTerms.upfrontPercentage"
                  value={formData.paymentTerms.upfrontPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                  className="slider"
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Debt Bondage Toggle */}
              <div className="form-group">
                <label>{txt.requiresDebtBondage}</label>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <input
                      type="radio"
                      name="paymentTerms.requiresDebtBondage"
                      value="false"
                      checked={!formData.paymentTerms.requiresDebtBondage}
                      onChange={() => onFormChange({
                        ...formData,
                        paymentTerms: { ...formData.paymentTerms, requiresDebtBondage: false }
                      })}
                    />
                    <span className="toggle-text">{txt.no}</span>
                  </label>
                  <label className="toggle-label warning-toggle">
                    <input
                      type="radio"
                      name="paymentTerms.requiresDebtBondage"
                      value="true"
                      checked={formData.paymentTerms.requiresDebtBondage}
                      onChange={() => onFormChange({
                        ...formData,
                        paymentTerms: { ...formData.paymentTerms, requiresDebtBondage: true }
                      })}
                    />
                    <span className="toggle-text">{txt.yes}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onLoadExample}>
          📝 {txt.loadExample}
        </button>
        <button type="button" className="btn btn-outline" onClick={onReset}>
          🗑️ {txt.clearAll}
        </button>
        <button type="submit" className="btn btn-primary btn-lg">
          🔍 {txt.calculateBtn}
        </button>
      </div>
    </form>
  );
};

CalculatorForm.propTypes = {
  formData: PropTypes.shape({
    destinationCountry: PropTypes.string,
    serviceType: PropTypes.string,
    workerCategory: PropTypes.string,
    fees: PropTypes.shape({
      visaApplicationFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      medicalTestsFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      documentProcessingFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      trainingFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      hiddenCharges: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    paymentTerms: PropTypes.shape({
      upfrontPercentage: PropTypes.number,
      requiresDebtBondage: PropTypes.bool
    })
  }).isRequired,
  countries: PropTypes.array.isRequired,
  countriesLoading: PropTypes.bool,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onLoadExample: PropTypes.func,
  onReset: PropTypes.func,
  language: PropTypes.string
};

export default CalculatorForm;
