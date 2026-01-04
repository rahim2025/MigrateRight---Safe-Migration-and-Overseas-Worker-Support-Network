import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './FeeComparisonChart.css';

/**
 * Fee Comparison Chart Component
 * Displays a grouped bar chart comparing legal vs actual fees
 */
const FeeComparisonChart = ({
  legalFees = {},
  actualFees = {},
  feeLabels = {},
  currency = 'BDT',
  language = 'en'
}) => {
  const translations = {
    en: {
      legalFee: 'Legal Fee',
      actualFee: 'Actual Fee',
      noData: 'No data available for chart'
    },
    bn: {
      legalFee: 'আইনি ফি',
      actualFee: 'প্রকৃত ফি',
      noData: 'চার্টের জন্য কোন ডেটা নেই'
    }
  };

  const txt = translations[language] || translations.en;

  // Prepare chart data
  const chartData = useMemo(() => {
    const feeKeys = [
      'visaApplicationFee',
      'medicalTestsFee',
      'documentProcessingFee',
      'trainingFee',
      'hiddenCharges'
    ];

    return feeKeys.map(key => ({
      name: getShortLabel(key, feeLabels),
      fullName: feeLabels[key] || key,
      legal: parseFloat(legalFees[key]) || 0,
      actual: parseFloat(actualFees[key]) || 0
    })).filter(item => item.legal > 0 || item.actual > 0);
  }, [legalFees, actualFees, feeLabels]);

  // Get shortened label for x-axis
  function getShortLabel(key, labels) {
    const shortLabels = {
      visaApplicationFee: 'Visa',
      medicalTestsFee: 'Medical',
      documentProcessingFee: 'Docs',
      trainingFee: 'Training',
      hiddenCharges: 'Other'
    };
    return shortLabels[key] || labels[key] || key;
  }

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return `${currency} ${value.toLocaleString()}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-title">{data.fullName}</p>
          <div className="tooltip-row legal">
            <span className="tooltip-label">{txt.legalFee}:</span>
            <span className="tooltip-value">{formatCurrency(data.legal)}</span>
          </div>
          <div className="tooltip-row actual">
            <span className="tooltip-label">{txt.actualFee}:</span>
            <span className="tooltip-value">{formatCurrency(data.actual)}</span>
          </div>
          {data.actual > data.legal && (
            <div className="tooltip-diff">
              +{formatCurrency(data.actual - data.legal)} overcharge
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-empty">
        <p>{txt.noData}</p>
      </div>
    );
  }

  return (
    <div className="fee-comparison-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#4a5568', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fill: '#4a5568', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ color: '#4a5568', fontSize: '14px' }}>
                {value === 'legal' ? txt.legalFee : txt.actualFee}
              </span>
            )}
          />
          <Bar 
            dataKey="legal" 
            name="legal"
            fill="#3182ce" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="actual" 
            name="actual"
            fill="#805ad5" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Color Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color legal"></span>
          <span className="legend-text">{txt.legalFee}</span>
        </div>
        <div className="legend-item">
          <span className="legend-color actual"></span>
          <span className="legend-text">{txt.actualFee}</span>
        </div>
      </div>
    </div>
  );
};

FeeComparisonChart.propTypes = {
  legalFees: PropTypes.object,
  actualFees: PropTypes.object,
  feeLabels: PropTypes.object,
  currency: PropTypes.string,
  language: PropTypes.string
};

export default FeeComparisonChart;
