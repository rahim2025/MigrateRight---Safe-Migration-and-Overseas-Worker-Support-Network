import React from 'react';
import './Placeholder.css';

/**
 * Help Center Placeholder Page
 * Future feature: FAQ and support resources
 */
const Help = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <span className="placeholder-icon" role="img" aria-label="Help">❓</span>
        <h1>Help Center</h1>
        <p className="placeholder-description">
          Get answers to common questions and find support resources.
        </p>
        <div className="placeholder-features">
          <h2>Help Topics:</h2>
          <ul>
            <li>❓ Frequently Asked Questions</li>
            <li>📞 Contact Support Hotline</li>
            <li>📚 Migration Guide for Workers</li>
            <li>⚠️ Report Fraud or Scams</li>
            <li>🌍 Country-Specific Information</li>
            <li>💬 Live Chat Support</li>
          </ul>
        </div>
        <div className="placeholder-cta">
          <p>
            <strong>Emergency Support:</strong><br />
            Call: +880-XXXX-XXXXX<br />
            Available 24/7 in Bengali and English
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
