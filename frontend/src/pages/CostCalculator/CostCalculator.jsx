import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import CalculatorForm from './components/CalculatorForm';
import ComparisonResults from './components/ComparisonResults';
import * as calculatorService from '../../services/calculatorService';
import './CostCalculator.css';

/**
 * Cost Calculator Page
 * Two-step calculator for comparing agency fees with legal limits
 */
const CostCalculator = () => {
  const { t, language } = useLanguage();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    destinationCountry: '',
    serviceType: '',
    workerCategory: '',
    fees: {
      visaApplicationFee: '',
      medicalTestsFee: '',
      documentProcessingFee: '',
      trainingFee: '',
      hiddenCharges: ''
    },
    paymentTerms: {
      upfrontPercentage: 0,
      requiresDebtBondage: false
    }
  });

  // Data states
  const [countries, setCountries] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculation history (localStorage)
  const [calculationHistory, setCalculationHistory] = useState([]);

  // Load countries and history on mount
  useEffect(() => {
    loadCountries();
    loadCalculationHistory();
  }, []);

  const loadCountries = async () => {
    try {
      setCountriesLoading(true);
      const response = await calculatorService.getAvailableCountries();
      setCountries(response?.countries || response?.data?.countries || []);
    } catch (err) {
      console.error('Error loading countries:', err);
      // Fallback countries for demo
      setCountries([
        { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR' },
        { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
        { code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR' },
        { code: 'KW', name: 'Kuwait', flag: '🇰🇼', currency: 'KWD' },
        { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD' }
      ]);
    } finally {
      setCountriesLoading(false);
    }
  };

  const loadCalculationHistory = () => {
    try {
      const history = localStorage.getItem('calculationHistory');
      if (history) {
        setCalculationHistory(JSON.parse(history).slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const saveToHistory = (formData, results) => {
    try {
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        formData,
        results: {
          totalLegalFee: results.totalLegalFee,
          totalActualFee: results.totalActualFee,
          status: results.status
        }
      };

      const newHistory = [historyItem, ...calculationHistory].slice(0, 3);
      setCalculationHistory(newHistory);
      localStorage.setItem('calculationHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Error saving history:', err);
    }
  };

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
    setError(null);
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare actual fees object
      const actualFees = {
        visaApplicationFee: parseFloat(formData.fees.visaApplicationFee) || 0,
        medicalTestsFee: parseFloat(formData.fees.medicalTestsFee) || 0,
        documentProcessingFee: parseFloat(formData.fees.documentProcessingFee) || 0,
        trainingFee: parseFloat(formData.fees.trainingFee) || 0,
        hiddenCharges: parseFloat(formData.fees.hiddenCharges) || 0
      };

      // First, get legal fees
      const legalFeesResponse = await calculatorService.getLegalFees({
        destinationCountry: formData.destinationCountry,
        serviceType: formData.serviceType,
        workerCategory: formData.workerCategory
      });

      // Then compare with actual fees
      const comparisonResponse = await calculatorService.compareFees({
        destinationCountry: formData.destinationCountry,
        serviceType: formData.serviceType,
        workerCategory: formData.workerCategory,
        actualFees,
        paymentTerms: {
          upfrontPercentage: formData.paymentTerms.upfrontPercentage,
          requiresDebtBondage: formData.paymentTerms.requiresDebtBondage
        }
      });

      const resultsData = comparisonResponse?.data || comparisonResponse;
      setResults(resultsData);
      saveToHistory(formData, resultsData);
      setCurrentStep(2);

    } catch (err) {
      console.error('Calculation error:', err);
      setError(err.message || 'Failed to calculate fees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      destinationCountry: '',
      serviceType: '',
      workerCategory: '',
      fees: {
        visaApplicationFee: '',
        medicalTestsFee: '',
        documentProcessingFee: '',
        trainingFee: '',
        hiddenCharges: ''
      },
      paymentTerms: {
        upfrontPercentage: 0,
        requiresDebtBondage: false
      }
    });
    setResults(null);
    setError(null);
    setCurrentStep(1);
  };

  const handleLoadHistory = (historyItem) => {
    setFormData(historyItem.formData);
  };

  const handleLoadExample = () => {
    setFormData({
      destinationCountry: 'SA',
      serviceType: 'full_package',
      workerCategory: 'domestic',
      fees: {
        visaApplicationFee: '25000',
        medicalTestsFee: '8000',
        documentProcessingFee: '15000',
        trainingFee: '12000',
        hiddenCharges: '5000'
      },
      paymentTerms: {
        upfrontPercentage: 50,
        requiresDebtBondage: false
      }
    });
  };

  const translations = {
    en: {
      pageTitle: 'Migration Cost Calculator',
      pageSubtitle: 'Compare agency fees with legal limits',
      step1Title: 'Enter Your Information',
      step2Title: 'View Comparison Results',
      loading: 'Calculating fees...',
      loadExample: 'Load Example',
      previousCalculations: 'Previous Calculations',
      noHistory: 'No previous calculations',
      whatAreLegalFees: 'What are legal fees?',
      legalFeesInfo: 'Legal fees are the maximum amounts set by the government that recruitment agencies can charge. These limits protect workers from exploitation.',
      redFlags: 'Red flags to watch for',
      redFlagsInfo: 'Hidden charges, debt bondage requirements, withholding passport, unusually high fees.',
      yourRights: 'Your Rights',
      yourRightsInfo: 'You have the right to know all fees upfront, keep your passport, and report agencies that overcharge.'
    },
    bn: {
      pageTitle: 'মাইগ্রেশন খরচ ক্যালকুলেটর',
      pageSubtitle: 'আইনি সীমার সাথে এজেন্সি ফি তুলনা করুন',
      step1Title: 'আপনার তথ্য দিন',
      step2Title: 'তুলনা ফলাফল দেখুন',
      loading: 'ফি গণনা করা হচ্ছে...',
      loadExample: 'উদাহরণ লোড করুন',
      previousCalculations: 'পূর্ববর্তী গণনা',
      noHistory: 'কোন পূর্ববর্তী গণনা নেই',
      whatAreLegalFees: 'আইনি ফি কি?',
      legalFeesInfo: 'আইনি ফি হল সরকার কর্তৃক নির্ধারিত সর্বোচ্চ পরিমাণ যা নিয়োগ সংস্থাগুলি চার্জ করতে পারে।',
      redFlags: 'সতর্কতা চিহ্ন',
      redFlagsInfo: 'লুকানো চার্জ, ঋণ বন্ধন, পাসপোর্ট আটকে রাখা, অস্বাভাবিক উচ্চ ফি।',
      yourRights: 'আপনার অধিকার',
      yourRightsInfo: 'আপনার সমস্ত ফি আগে জানার অধিকার আছে এবং অতিরিক্ত চার্জ করা এজেন্সি রিপোর্ট করার অধিকার আছে।'
    }
  };

  const txt = translations[language] || translations.en;

  return (
    <div className="cost-calculator-page">
      {/* Page Header */}
      <header className="calculator-header">
        <h1>{txt.pageTitle}</h1>
        <p className="subtitle">{txt.pageSubtitle}</p>
      </header>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
          <span className="step-label">{txt.step1Title}</span>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <span className="step-label">{txt.step2Title}</span>
        </div>
      </div>

      <div className="calculator-content">
        {/* Main Content Area */}
        <div className="calculator-main">
          {/* Loading Overlay */}
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>{txt.loading}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button onClick={() => setError(null)} className="btn-close">×</button>
            </div>
          )}

          {/* Step 1: Calculator Form */}
          {currentStep === 1 && (
            <CalculatorForm
              formData={formData}
              countries={countries}
              countriesLoading={countriesLoading}
              onFormChange={handleFormChange}
              onSubmit={handleCalculate}
              onLoadExample={handleLoadExample}
              onReset={handleReset}
              language={language}
            />
          )}

          {/* Step 2: Comparison Results */}
          {currentStep === 2 && results && (
            <ComparisonResults
              results={results}
              formData={formData}
              countries={countries}
              onReset={handleReset}
              onBack={() => setCurrentStep(1)}
              language={language}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="calculator-sidebar">
          {/* Previous Calculations */}
          {calculationHistory.length > 0 && (
            <div className="sidebar-card history-card">
              <h3>{txt.previousCalculations}</h3>
              <ul className="history-list">
                {calculationHistory.map((item) => (
                  <li key={item.id} onClick={() => handleLoadHistory(item)}>
                    <span className="history-country">
                      {countries.find(c => c.code === item.formData.destinationCountry)?.flag || '🌍'}{' '}
                      {countries.find(c => c.code === item.formData.destinationCountry)?.name || item.formData.destinationCountry}
                    </span>
                    <span className={`history-status status-${item.results.status?.toLowerCase().replace(' ', '-')}`}>
                      {item.results.status}
                    </span>
                    <span className="history-date">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Educational Content */}
          <div className="sidebar-card info-card">
            <h4>
              <span className="info-icon">ℹ️</span>
              {txt.whatAreLegalFees}
            </h4>
            <p>{txt.legalFeesInfo}</p>
          </div>

          <div className="sidebar-card warning-info-card">
            <h4>
              <span className="info-icon">🚩</span>
              {txt.redFlags}
            </h4>
            <p>{txt.redFlagsInfo}</p>
          </div>

          <div className="sidebar-card rights-card">
            <h4>
              <span className="info-icon">⚖️</span>
              {txt.yourRights}
            </h4>
            <p>{txt.yourRightsInfo}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CostCalculator;
