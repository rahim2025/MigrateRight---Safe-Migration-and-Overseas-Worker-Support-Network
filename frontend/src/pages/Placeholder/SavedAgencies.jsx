import React from 'react';
import './Placeholder.css';

/**
 * Saved Agencies Placeholder Page
 * Future feature: Display user's saved/bookmarked agencies
 */
const SavedAgencies = () => {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <span className="placeholder-icon" role="img" aria-label="Star">⭐</span>
        <h1>Saved Agencies</h1>
        <p className="placeholder-description">
          Save your favorite agencies for quick access. This feature is coming soon!
        </p>
        <div className="placeholder-features">
          <h2>What you'll be able to do:</h2>
          <ul>
            <li>✓ Bookmark agencies you're interested in</li>
            <li>✓ Quick access to saved profiles</li>
            <li>✓ Compare saved agencies side-by-side</li>
            <li>✓ Get notifications about saved agencies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SavedAgencies;
