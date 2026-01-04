import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import * as countryGuideService from '../../services/countryGuideService';
import { SearchBar } from '../../components/CountryGuide';
import './CountryGuideList.css';

const CountryGuideList = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [guides, setGuides] = useState([]);
  const [popularGuides, setPopularGuides] = useState([]);
  const [regions, setRegions] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [sortBy, setSortBy] = useState('popularityRank');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGuides();
  }, [selectedRegion, selectedJobType, sortBy, searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load popular destinations, regions, and job types in parallel
      const [popularRes, regionsRes, jobTypesRes] = await Promise.all([
        countryGuideService.getPopularDestinations(5),
        countryGuideService.getRegions(),
        countryGuideService.getJobTypes(),
      ]);

      setPopularGuides(popularRes.data || []);
      setRegions(regionsRes.data?.regions || []);
      setJobTypes(jobTypesRes.data?.jobTypes || []);

      // Load all guides
      await loadGuides();
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Failed to load country guides');
    } finally {
      setLoading(false);
    }
  };

  const loadGuides = async () => {
    try {
      const params = {
        language,
        sort: sortBy,
      };

      if (selectedRegion) params.region = selectedRegion;
      if (selectedJobType) params.jobType = selectedJobType;
      if (searchQuery) params.search = searchQuery;

      const response = await countryGuideService.getAllGuides(params);
      setGuides(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading guides:', err);
      setError(err.message || 'Failed to load guides');
    }
  };

  const handleGuideClick = (country) => {
    navigate(`/country-guides/${encodeURIComponent(country)}`);
  };

  const handleClearFilters = () => {
    setSelectedRegion('');
    setSelectedJobType('');
    setSortBy('popularityRank');
    setSearchQuery('');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const formatJobType = (jobType) => {
    return jobType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatSalary = (min, max, currency, period) => {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / ${period}`;
  };

  if (loading) {
    return (
      <div className="country-guide-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t?.loading || 'Loading country guides...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="country-guide-list-container">
      {/* Header */}
      <div className="page-header">
        <h1>{t?.destinationGuides || 'Destination Country Guides'}</h1>
        <p className="subtitle">
          {t?.destinationGuidesSubtitle ||
            'Comprehensive information about popular migration destinations'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <SearchBar
          onSearch={handleSearch}
          placeholder={t?.searchCountries || 'Search countries by name, region, or job type...'}
          language={language}
        />
      </div>

      {/* Popular Destinations Section */}
      {popularGuides.length > 0 && (
        <section className="popular-section">
          <h2>{t?.popularDestinations || 'Popular Destinations'}</h2>
          <div className="popular-grid">
            {popularGuides.map((guide) => (
              <div
                key={guide._id}
                className="popular-card"
                onClick={() => handleGuideClick(guide.country)}
              >
                <div className="card-flag">{guide.flagEmoji}</div>
                <h3>{guide.country}</h3>
                <p className="region">{guide.region}</p>
                <p className="job-count">
                  {guide.jobTypesCount} {t?.jobTypes || 'job types'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="filters-section">
        <h2>{t?.browseAllCountries || 'Browse All Countries'}</h2>
        
        <div className="filters-bar">
          <div className="filter-group">
            <label htmlFor="region-filter">{t?.region || 'Region'}</label>
            <select
              id="region-filter"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">{t?.allRegions || 'All Regions'}</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="jobtype-filter">{t?.jobType || 'Job Type'}</label>
            <select
              id="jobtype-filter"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="">{t?.allJobTypes || 'All Job Types'}</option>
              {jobTypes.map((jobType) => (
                <option key={jobType} value={jobType}>
                  {formatJobType(jobType)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-filter">{t?.sortBy || 'Sort By'}</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularityRank">{t?.popularity || 'Popularity'}</option>
              <option value="country">{t?.countryName || 'Country Name'}</option>
              <option value="views">{t?.mostViewed || 'Most Viewed'}</option>
              <option value="recent">{t?.recentlyUpdated || 'Recently Updated'}</option>
            </select>
          </div>

          {(selectedRegion || selectedJobType || searchQuery) && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              {t?.clearFilters || 'Clear Filters'}
            </button>
          )}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Country Guides Grid */}
      <section className="guides-grid">
        {guides.length === 0 ? (
          <div className="no-results">
            <p>{t?.noGuidesFound || 'No country guides found matching your criteria.'}</p>
          </div>
        ) : (
          guides.map((guide) => (
            <div
              key={guide._id}
              className="guide-card"
              onClick={() => handleGuideClick(guide.country)}
            >
              <div className="card-header">
                <span className="card-flag">{guide.flagEmoji}</span>
                <div className="card-title">
                  <h3>{guide.country}</h3>
                  <p className="card-region">{guide.region}</p>
                </div>
              </div>

              <div className="card-content">
                <p className="card-overview">
                  {guide.overview?.[language]?.substring(0, 150)}...
                </p>

                {guide.salaryRanges && guide.salaryRanges.length > 0 && (
                  <div className="salary-preview">
                    <strong>{t?.salaryRanges || 'Salary Ranges'}:</strong>
                    <ul>
                      {guide.salaryRanges.slice(0, 2).map((range, idx) => (
                        <li key={idx}>
                          <span className="job-type">{formatJobType(range.jobType)}:</span>{' '}
                          {formatSalary(range.minSalary, range.maxSalary, range.currency, range.period)}
                        </li>
                      ))}
                      {guide.salaryRanges.length > 2 && (
                        <li className="more-jobs">
                          +{guide.salaryRanges.length - 2} {t?.moreJobTypes || 'more job types'}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <span className="view-count">👁️ {guide.viewCount || 0} {t?.views || 'views'}</span>
                <button className="view-details-btn">
                  {t?.viewDetails || 'View Details'} →
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CountryGuideList;
