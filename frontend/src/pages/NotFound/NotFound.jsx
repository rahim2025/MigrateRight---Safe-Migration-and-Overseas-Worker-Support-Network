import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

/**
 * NotFound Page Component
 * 404 error page
 */
const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p className="error-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link to="/agencies" className="btn btn-secondary">
            Search Agencies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
