import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import agencyManagementService from '@services/agencyManagementService';
import './AgenciesList.css';

/**
 * Agencies List Component
 * Public page for users to browse recruitment agencies
 */
const AgenciesList = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAgencies();
  }, [page, search]);

  const loadAgencies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await agencyManagementService.getAllAgencies({ search, page, limit: 12 });
      setAgencies(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load agencies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="agencies-list-page">
      <div className="agencies-header">
        <h1>Browse Recruitment Agencies</h1>
        <p>Find verified and reliable recruitment agencies for your migration journey</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search agencies by name..."
          value={search}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading agencies...</div>
      ) : (
        <>
          <div className="agencies-grid">
            {agencies.map((agency) => (
              <div key={agency._id} className="agency-card">
                <div className="agency-card-header">
                  <h3>{agency.companyName}</h3>
                  {agency.isVerified && <span className="verified-badge">✓ Verified</span>}
                </div>
                <div className="agency-card-body">
                  <p><strong>Contact Person:</strong> {agency.contactPersonName}</p>
                  <p><strong>Phone:</strong> {agency.phoneNumber}</p>
                  <p><strong>Location:</strong> {agency.businessAddress}</p>
                  <p><strong>License:</strong> {agency.tradeLicenseNumber}</p>
                </div>
                <div className="agency-card-footer">
                  <Link to={`/agencies/${agency.userId}`} className="btn btn-primary">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {agencies.length === 0 && !loading && (
            <div className="no-results">
              <p>No agencies found. Try a different search term.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgenciesList;
