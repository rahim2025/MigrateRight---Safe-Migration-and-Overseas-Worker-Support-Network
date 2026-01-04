import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import FeeComparisonChart from './FeeComparisonChart';
import WarningCard from './WarningCard';
import './ComparisonResults.css';

/**
 * Comparison Results Component (Step 2)
 * Displays fee comparison results with chart, warnings, and recommendations
 */
const ComparisonResults = ({
  results,
  formData,
  countries,
  onReset,
  onBack,
  language
}) => {
  const translations = {
    en: {
      summaryTitle: 'Fee Comparison Summary',
      totalLegalFee: 'Total Legal Fee',
      totalActualFee: 'Total Actual Fee',
      difference: 'Difference',
      overcharge: 'Overcharge',
      undercharge: 'Undercharge',
      fairPricing: 'Fair Pricing',
      moderateOvercharge: 'Moderate Overcharge',
      overcharged: 'Overcharged',
      itemizedComparison: 'Itemized Comparison',
      feeType: 'Fee Type',
      legalAmount: 'Legal Amount',
      yourAmount: 'Your Amount',
      diffColumn: 'Difference',
      status: 'Status',
      visualComparison: 'Visual Comparison',
      warnings: 'Warnings',
      recommendations: 'Recommendations',
      fairMessage: "This agency's fees are within acceptable limits.",
      fairSubMessage: 'You may proceed with caution.',
      moderateMessage: 'This agency is charging above legal limits.',
      moderateSubMessage: 'Request detailed fee breakdown and consider negotiating.',
      overchargedMessage: 'WARNING: Significant overcharging detected.',
      overchargedSubMessage: 'DO NOT proceed with this agency. Report to authorities.',
      calculateAgain: 'Calculate Again',
      saveResults: 'Save Results',
      reportAgency: 'Report Agency',
      findBetterAgencies: 'Find Better Agencies',
      fair: 'Fair',
      moderate: 'Moderate',
      high: 'High',
      feeLabels: {
        visaApplicationFee: 'Visa Application Fee',
        medicalTestsFee: 'Medical Tests Fee',
        documentProcessingFee: 'Document Processing Fee',
        trainingFee: 'Training Fee',
        hiddenCharges: 'Other/Hidden Charges'
      }
    },
    bn: {
      summaryTitle: 'ফি তুলনা সারাংশ',
      totalLegalFee: 'মোট আইনি ফি',
      totalActualFee: 'মোট প্রকৃত ফি',
      difference: 'পার্থক্য',
      overcharge: 'অতিরিক্ত চার্জ',
      undercharge: 'কম চার্জ',
      fairPricing: 'ন্যায্য মূল্য',
      moderateOvercharge: 'মাঝারি অতিরিক্ত চার্জ',
      overcharged: 'অতিরিক্ত চার্জ করা হয়েছে',
      itemizedComparison: 'আইটেম অনুযায়ী তুলনা',
      feeType: 'ফি ধরন',
      legalAmount: 'আইনি পরিমাণ',
      yourAmount: 'আপনার পরিমাণ',
      diffColumn: 'পার্থক্য',
      status: 'অবস্থা',
      visualComparison: 'দৃশ্য তুলনা',
      warnings: 'সতর্কতা',
      recommendations: 'সুপারিশ',
      fairMessage: 'এই এজেন্সির ফি গ্রহণযোগ্য সীমার মধ্যে।',
      fairSubMessage: 'আপনি সতর্কতার সাথে এগিয়ে যেতে পারেন।',
      moderateMessage: 'এই এজেন্সি আইনি সীমার উপরে চার্জ করছে।',
      moderateSubMessage: 'বিস্তারিত ফি বিবরণ চাইতে এবং আলোচনা করুন।',
      overchargedMessage: 'সতর্কতা: উল্লেখযোগ্য অতিরিক্ত চার্জ সনাক্ত।',
      overchargedSubMessage: 'এই এজেন্সির সাথে এগিয়ে যাবেন না। কর্তৃপক্ষকে রিপোর্ট করুন।',
      calculateAgain: 'আবার গণনা করুন',
      saveResults: 'ফলাফল সংরক্ষণ করুন',
      reportAgency: 'এজেন্সি রিপোর্ট করুন',
      findBetterAgencies: 'ভালো এজেন্সি খুঁজুন',
      fair: 'ন্যায্য',
      moderate: 'মাঝারি',
      high: 'উচ্চ',
      feeLabels: {
        visaApplicationFee: 'ভিসা আবেদন ফি',
        medicalTestsFee: 'মেডিকেল পরীক্ষা ফি',
        documentProcessingFee: 'ডকুমেন্ট প্রসেসিং ফি',
        trainingFee: 'প্রশিক্ষণ ফি',
        hiddenCharges: 'অন্যান্য/লুকানো চার্জ'
      }
    }
  };

  const txt = translations[language] || translations.en;

  // Calculate totals and comparisons
  const legalFees = results?.legalFees || {};
  const actualFees = results?.actualFees || {};
  const comparison = results?.comparison || {};

  const totalLegalFee = results?.totalLegalFee ||
    Object.values(legalFees).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  
  const totalActualFee = results?.totalActualFee ||
    Object.values(actualFees).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  const difference = totalActualFee - totalLegalFee;
  const differencePercent = totalLegalFee > 0 ? (difference / totalLegalFee) * 100 : 0;

  // Determine status
  const getStatus = () => {
    if (results?.status) return results.status;
    if (differencePercent < 15) return 'Fair Pricing';
    if (differencePercent < 20) return 'Moderate Overcharge';
    return 'Overcharged';
  };

  const status = getStatus();
  const statusClass = status.toLowerCase().replace(' ', '-');

  const getCountryInfo = () => {
    return countries.find(c => c.code === formData.destinationCountry) || {};
  };

  const countryInfo = getCountryInfo();
  const currency = countryInfo.currency || 'BDT';

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `${currency} ${num.toLocaleString()}`;
  };

  const formatPercent = (value) => {
    const num = parseFloat(value) || 0;
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  // Get fee status based on percentage difference
  const getFeeStatus = (legal, actual) => {
    const legalVal = parseFloat(legal) || 0;
    const actualVal = parseFloat(actual) || 0;
    
    if (legalVal === 0) return { status: 'unknown', icon: '❓' };
    
    const diff = ((actualVal - legalVal) / legalVal) * 100;
    
    if (diff < 15) return { status: 'fair', icon: '✓', class: 'status-fair' };
    if (diff < 20) return { status: 'moderate', icon: '⚠️', class: 'status-moderate' };
    return { status: 'high', icon: '❌', class: 'status-high' };
  };

  // Build itemized comparison data
  const feeItems = [
    { key: 'visaApplicationFee', label: txt.feeLabels.visaApplicationFee },
    { key: 'medicalTestsFee', label: txt.feeLabels.medicalTestsFee },
    { key: 'documentProcessingFee', label: txt.feeLabels.documentProcessingFee },
    { key: 'trainingFee', label: txt.feeLabels.trainingFee },
    { key: 'hiddenCharges', label: txt.feeLabels.hiddenCharges }
  ];

  // Get warnings from results or generate them
  const warnings = results?.warnings || [];

  // Generate PDF/save functionality
  const handleSaveResults = () => {
    const content = `
Migration Cost Comparison Report
================================
Date: ${new Date().toLocaleString()}

Destination: ${countryInfo.flag || ''} ${countryInfo.name || formData.destinationCountry}
Service Type: ${formData.serviceType}
Worker Category: ${formData.workerCategory}

Summary
-------
Total Legal Fee: ${formatCurrency(totalLegalFee)}
Total Actual Fee: ${formatCurrency(totalActualFee)}
Difference: ${formatCurrency(Math.abs(difference))} (${formatPercent(differencePercent)})
Status: ${status}

Disclaimer: This is an estimated comparison based on general guidelines.
Actual legal limits may vary. Please consult official sources.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-comparison-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="comparison-results">
      {/* Summary Card */}
      <section className="summary-section">
        <h2>{txt.summaryTitle}</h2>
        
        <div className="summary-cards">
          <div className="summary-card legal">
            <span className="card-label">{txt.totalLegalFee}</span>
            <span className="card-value">{formatCurrency(totalLegalFee)}</span>
          </div>

          <div className="summary-card actual">
            <span className="card-label">{txt.totalActualFee}</span>
            <span className="card-value">{formatCurrency(totalActualFee)}</span>
          </div>

          <div className={`summary-card difference ${difference > 0 ? 'negative' : 'positive'}`}>
            <span className="card-label">{txt.difference}</span>
            <span className="card-value">
              {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
              <span className="percent">({formatPercent(differencePercent)})</span>
            </span>
          </div>
        </div>

        <div className={`status-badge status-${statusClass}`}>
          {status === 'Fair Pricing' && '✓ '}
          {status === 'Moderate Overcharge' && '⚠️ '}
          {status === 'Overcharged' && '❌ '}
          {status === 'Fair Pricing' ? txt.fairPricing :
           status === 'Moderate Overcharge' ? txt.moderateOvercharge :
           txt.overcharged}
        </div>
      </section>

      {/* Itemized Comparison Table */}
      <section className="itemized-section">
        <h3>{txt.itemizedComparison}</h3>
        
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>{txt.feeType}</th>
                <th>{txt.legalAmount}</th>
                <th>{txt.yourAmount}</th>
                <th>{txt.diffColumn}</th>
                <th>{txt.status}</th>
              </tr>
            </thead>
            <tbody>
              {feeItems.map((item) => {
                const legal = legalFees[item.key] || 0;
                const actual = actualFees[item.key] || parseFloat(formData.fees[item.key]) || 0;
                const diff = actual - legal;
                const diffPercent = legal > 0 ? (diff / legal) * 100 : 0;
                const feeStatus = getFeeStatus(legal, actual);

                return (
                  <tr key={item.key}>
                    <td className="fee-type">{item.label}</td>
                    <td className="amount legal">{formatCurrency(legal)}</td>
                    <td className="amount actual">{formatCurrency(actual)}</td>
                    <td className={`amount diff ${diff > 0 ? 'negative' : 'positive'}`}>
                      {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                      <span className="percent">({formatPercent(diffPercent)})</span>
                    </td>
                    <td className={`status-cell ${feeStatus.class}`}>
                      <span className="status-icon">{feeStatus.icon}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="comparison-cards-mobile">
          {feeItems.map((item) => {
            const legal = legalFees[item.key] || 0;
            const actual = actualFees[item.key] || parseFloat(formData.fees[item.key]) || 0;
            const diff = actual - legal;
            const feeStatus = getFeeStatus(legal, actual);

            return (
              <div key={item.key} className={`comparison-card-mobile ${feeStatus.class}`}>
                <div className="card-header">
                  <span className="fee-name">{item.label}</span>
                  <span className="status-icon">{feeStatus.icon}</span>
                </div>
                <div className="card-body">
                  <div className="amount-row">
                    <span className="label">{txt.legalAmount}:</span>
                    <span className="value">{formatCurrency(legal)}</span>
                  </div>
                  <div className="amount-row">
                    <span className="label">{txt.yourAmount}:</span>
                    <span className="value">{formatCurrency(actual)}</span>
                  </div>
                  <div className={`amount-row diff ${diff > 0 ? 'negative' : 'positive'}`}>
                    <span className="label">{txt.diffColumn}:</span>
                    <span className="value">{diff >= 0 ? '+' : ''}{formatCurrency(diff)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Comparison Chart */}
      <section className="chart-section">
        <h3>{txt.visualComparison}</h3>
        <FeeComparisonChart
          legalFees={legalFees}
          actualFees={actualFees}
          feeLabels={txt.feeLabels}
          currency={currency}
          language={language}
        />
      </section>

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <section className="warnings-section">
          <h3>{txt.warnings}</h3>
          <div className="warnings-list">
            {warnings.map((warning, idx) => (
              <WarningCard
                key={idx}
                warning={warning}
                language={language}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations Section */}
      <section className={`recommendations-section status-${statusClass}`}>
        <h3>{txt.recommendations}</h3>
        
        {status === 'Fair Pricing' && (
          <div className="recommendation-content fair">
            <span className="rec-icon">✓</span>
            <div className="rec-text">
              <p className="rec-main">{txt.fairMessage}</p>
              <p className="rec-sub">{txt.fairSubMessage}</p>
            </div>
          </div>
        )}

        {status === 'Moderate Overcharge' && (
          <div className="recommendation-content moderate">
            <span className="rec-icon">⚠️</span>
            <div className="rec-text">
              <p className="rec-main">{txt.moderateMessage}</p>
              <p className="rec-sub">{txt.moderateSubMessage}</p>
            </div>
          </div>
        )}

        {status === 'Overcharged' && (
          <div className="recommendation-content high">
            <span className="rec-icon">❌</span>
            <div className="rec-text">
              <p className="rec-main">{txt.overchargedMessage}</p>
              <p className="rec-sub">{txt.overchargedSubMessage}</p>
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <section className="actions-section">
        <button onClick={onReset} className="btn btn-secondary">
          🔄 {txt.calculateAgain}
        </button>
        <button onClick={handleSaveResults} className="btn btn-outline">
          💾 {txt.saveResults}
        </button>
        {status !== 'Fair Pricing' && (
          <Link to="/complaints/new" className="btn btn-danger">
            🚨 {txt.reportAgency}
          </Link>
        )}
        <Link to="/agencies" className="btn btn-primary">
          🔍 {txt.findBetterAgencies}
        </Link>
      </section>
    </div>
  );
};

ComparisonResults.propTypes = {
  results: PropTypes.shape({
    legalFees: PropTypes.object,
    actualFees: PropTypes.object,
    comparison: PropTypes.object,
    totalLegalFee: PropTypes.number,
    totalActualFee: PropTypes.number,
    status: PropTypes.string,
    warnings: PropTypes.array
  }),
  formData: PropTypes.object.isRequired,
  countries: PropTypes.array.isRequired,
  onReset: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  language: PropTypes.string
};

export default ComparisonResults;
