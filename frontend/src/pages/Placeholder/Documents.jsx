import React from 'react';
import './Placeholder.css';

/**
 * Documents Placeholder Page
 * Future feature: Manage migration documents
 */
const Documents = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <span className="placeholder-icon" role="img" aria-label="Document">📄</span>
        <h1>My Documents</h1>
        <p className="placeholder-description">
          Securely store and manage all your migration documents in one place.
        </p>
        <div className="placeholder-features">
          <h2>Document Types:</h2>
          <ul>
            <li>📇 Passport</li>
            <li>🎓 Educational Certificates</li>
            <li>💼 Work Experience Letters</li>
            <li>💉 Medical Reports</li>
            <li>✈️ Visa Documents</li>
            <li>📝 Employment Contracts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Documents;
