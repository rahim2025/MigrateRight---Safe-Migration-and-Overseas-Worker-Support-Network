import PropTypes from 'prop-types';
import './WarningCard.css';

/**
 * Warning Card Component
 * Displays severity-based warnings with icon and recommendations
 */
const WarningCard = ({ warning, language = 'en' }) => {
  const translations = {
    en: {
      recommendation: 'Recommendation',
      affectedFee: 'Affected Fee',
      severityLabels: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      }
    },
    bn: {
      recommendation: 'সুপারিশ',
      affectedFee: 'প্রভাবিত ফি',
      severityLabels: {
        low: 'কম',
        medium: 'মাঝারি',
        high: 'উচ্চ',
        critical: 'জটিল'
      }
    }
  };

  const txt = translations[language] || translations.en;

  // Handle both object and string warnings
  const warningData = typeof warning === 'string'
    ? { message: warning, severity: 'medium' }
    : warning;

  const {
    severity = 'medium',
    message = '',
    recommendation = '',
    affectedFee = '',
    type = ''
  } = warningData;

  // Get icon based on severity
  const getIcon = () => {
    const icons = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔶',
      critical: '🚨'
    };
    return icons[severity] || '⚠️';
  };

  // Get severity class
  const getSeverityClass = () => {
    return `severity-${severity}`;
  };

  return (
    <div className={`warning-card ${getSeverityClass()}`}>
      <div className="warning-header">
        <span className="warning-icon">{getIcon()}</span>
        <span className={`severity-badge ${getSeverityClass()}`}>
          {txt.severityLabels[severity] || severity}
        </span>
      </div>

      <div className="warning-content">
        <p className="warning-message">{message}</p>

        {affectedFee && (
          <div className="affected-fee">
            <span className="label">{txt.affectedFee}:</span>
            <span className="value">{affectedFee}</span>
          </div>
        )}

        {recommendation && (
          <div className="warning-recommendation">
            <span className="rec-label">💡 {txt.recommendation}:</span>
            <p className="rec-text">{recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

WarningCard.propTypes = {
  warning: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      severity: PropTypes.oneOf(['low', 'medium', 'high', 'critical']),
      message: PropTypes.string,
      recommendation: PropTypes.string,
      affectedFee: PropTypes.string,
      type: PropTypes.string
    })
  ]).isRequired,
  language: PropTypes.string
};

export default WarningCard;
