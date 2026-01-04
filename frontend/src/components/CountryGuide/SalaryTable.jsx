import PropTypes from 'prop-types';
import './SalaryTable.css';

/**
 * SalaryTable Component
 * Displays salary ranges in a table format with color-coding by sector
 * 
 * @param {Object} props - Component props
 * @param {Array} props.salaryData - Array of salary range objects
 * @param {string} props.language - Current language (en/bn)
 * @param {string} props.currency - Default currency if not specified in data
 */
const SalaryTable = ({ salaryData = [], language = 'en', currency = 'USD' }) => {
  const formatJobType = (jobType) => {
    if (!jobType) return '';
    return jobType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatSalary = (amount) => {
    if (!amount && amount !== 0) return '-';
    return amount.toLocaleString();
  };

  const getSectorColor = (sector) => {
    const colors = {
      domestic_work: '#e53e3e',      // Red
      construction: '#dd6b20',        // Orange
      healthcare: '#38a169',          // Green
      hospitality: '#3182ce',         // Blue
      manufacturing: '#805ad5',       // Purple
      agriculture: '#d69e2e',         // Yellow
      it_services: '#00b5d8',         // Cyan
      transportation: '#718096',      // Gray
      retail: '#ed64a6',              // Pink
      other: '#4a5568',               // Dark Gray
    };
    return colors[sector?.toLowerCase()] || colors.other;
  };

  if (!salaryData || salaryData.length === 0) {
    return (
      <div className="salary-table-empty">
        <p>No salary information available.</p>
      </div>
    );
  }

  return (
    <div className="salary-table-container">
      <div className="salary-table-wrapper">
        <table className="salary-table">
          <thead>
            <tr>
              <th>Job Type</th>
              <th>Min Salary</th>
              <th>Max Salary</th>
              <th>Period</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {salaryData.map((range, idx) => (
              <tr key={idx}>
                <td>
                  <div className="job-type-cell">
                    <span
                      className="sector-indicator"
                      style={{ backgroundColor: getSectorColor(range.jobType) }}
                    />
                    <span className="job-title">
                      {range.title?.[language] || formatJobType(range.jobType)}
                    </span>
                  </div>
                </td>
                <td className="salary-cell">
                  <span className="salary-amount">
                    {range.currency || currency} {formatSalary(range.minSalary)}
                  </span>
                </td>
                <td className="salary-cell">
                  <span className="salary-amount">
                    {range.currency || currency} {formatSalary(range.maxSalary)}
                  </span>
                </td>
                <td className="period-cell">
                  {range.period || 'monthly'}
                </td>
                <td className="notes-cell">
                  {range.notes?.[language] || range.notes?.en || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="salary-cards-mobile">
        {salaryData.map((range, idx) => (
          <div key={idx} className="salary-card-mobile">
            <div
              className="salary-card-header"
              style={{ borderLeftColor: getSectorColor(range.jobType) }}
            >
              <h4>{range.title?.[language] || formatJobType(range.jobType)}</h4>
            </div>
            <div className="salary-card-body">
              <div className="salary-range">
                <span className="range-label">Salary Range:</span>
                <span className="range-value">
                  {range.currency || currency} {formatSalary(range.minSalary)} -{' '}
                  {formatSalary(range.maxSalary)} / {range.period || 'monthly'}
                </span>
              </div>
              {range.notes?.[language] && (
                <p className="salary-note">{range.notes[language]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="salary-legend">
        <span className="legend-title">Job Sectors:</span>
        <div className="legend-items">
          {['domestic_work', 'construction', 'healthcare', 'hospitality', 'manufacturing'].map(
            (sector) => (
              <div key={sector} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: getSectorColor(sector) }}
                />
                <span className="legend-label">{formatJobType(sector)}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

SalaryTable.propTypes = {
  salaryData: PropTypes.arrayOf(
    PropTypes.shape({
      jobType: PropTypes.string,
      title: PropTypes.object,
      minSalary: PropTypes.number,
      maxSalary: PropTypes.number,
      currency: PropTypes.string,
      period: PropTypes.string,
      notes: PropTypes.object,
    })
  ),
  language: PropTypes.string,
  currency: PropTypes.string,
};

export default SalaryTable;
