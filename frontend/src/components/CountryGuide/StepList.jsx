import PropTypes from 'prop-types';
import './StepList.css';

/**
 * StepList Component
 * Displays numbered steps in a progress indicator style (for visa process, etc.)
 * 
 * @param {Object} props - Component props
 * @param {Array} props.steps - Array of step objects { title, description }
 * @param {string} props.language - Current language (en/bn)
 * @param {number} props.currentStep - Optional current step index (for progress)
 */
const StepList = ({ steps = [], language = 'en', currentStep = -1 }) => {
  const getLocalizedText = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[language] || value.en || Object.values(value)[0];
  };

  if (!steps || steps.length === 0) {
    return (
      <div className="step-list-empty">
        <p>No steps available.</p>
      </div>
    );
  }

  return (
    <div className="step-list">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > idx;
        const isCurrent = currentStep === idx;
        
        return (
          <div
            key={idx}
            className={`step-item ${isCompleted ? 'step-item--completed' : ''} ${
              isCurrent ? 'step-item--current' : ''
            }`}
          >
            <div className="step-indicator">
              <div className="step-number">
                {isCompleted ? '✓' : idx + 1}
              </div>
              {idx < steps.length - 1 && <div className="step-connector" />}
            </div>
            
            <div className="step-content">
              <h4 className="step-title">
                {getLocalizedText(step.title) || `Step ${idx + 1}`}
              </h4>
              {step.description && (
                <p className="step-description">
                  {getLocalizedText(step.description)}
                </p>
              )}
              {step.duration && (
                <span className="step-duration">
                  ⏱️ {getLocalizedText(step.duration)}
                </span>
              )}
              {step.tips && (
                <div className="step-tips">
                  <span className="tips-label">💡 Tips:</span>
                  <p>{getLocalizedText(step.tips)}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

StepList.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      description: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      duration: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      tips: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    })
  ),
  language: PropTypes.string,
  currentStep: PropTypes.number,
};

export default StepList;
