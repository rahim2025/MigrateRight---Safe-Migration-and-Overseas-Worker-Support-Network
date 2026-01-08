import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import agencyManagementService from '@services/agencyManagementService';
import './AgencyDashboard.css';

/**
 * Agency Dashboard Component
 * Main dashboard for agency users with 4 sections
 */
const AgencyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Company-specific loading and success states
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySuccess, setCompanySuccess] = useState('');
  const [companyError, setCompanyError] = useState('');
  
  // Section-specific states for modular updates
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    license: true,
    contact: true,
    location: true,
    business: true
  });
  const [sectionLoading, setSectionLoading] = useState({});
  const [sectionSuccess, setSectionSuccess] = useState({});
  const [sectionError, setSectionError] = useState({});

  // Company Info State
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    description: '',
    license: {
      number: '',
      issueDate: '',
      expiryDate: '',
      isValid: true
    },
    location: {
      address: '',
      city: '',
      district: '',
      country: 'Bangladesh'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    destinationCountries: [],
    specialization: [],
    establishedYear: '',
    totalPlacements: 0
  });

  // Success Stories State
  const [successStories, setSuccessStories] = useState([]);
  const [storyForm, setStoryForm] = useState({
    title: '',
    content: '',
    workerName: '',
    destinationCountry: '',
    imageUrl: '',
  });
  const [editingStoryId, setEditingStoryId] = useState(null);

  // Fee Structure State
  const [feeStructures, setFeeStructures] = useState([]);
  const [feeForm, setFeeForm] = useState({
    country: '',
    serviceType: '',
    amount: '',
    isLegal: true,
    description: '',
  });
  const [editingFeeId, setEditingFeeId] = useState(null);

  // Training Records State
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [trainingForm, setTrainingForm] = useState({
    programName: '',
    description: '',
    duration: '',
    scheduleDate: '',
    location: '',
    capacity: '',
  });
  const [editingTrainingId, setEditingTrainingId] = useState(null);

  // Interested Workers State
  const [interestedWorkers, setInterestedWorkers] = useState([]);

  useEffect(() => {
    if (user?.role !== 'agency') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'company') {
        console.log('Fetching agency details...');
        const response = await agencyManagementService.getAgencyDetails();
        console.log('Agency details response:', response);
        
        if (response.data) {
          console.log('Setting company info with data:', response.data);
          setCompanyInfo({
            name: response.data.name || '',
            description: response.data.description || '',
            license: {
              number: response.data.license?.number || '',
              issueDate: response.data.license?.issueDate ? response.data.license.issueDate.split('T')[0] : '',
              expiryDate: response.data.license?.expiryDate ? response.data.license.expiryDate.split('T')[0] : '',
              isValid: response.data.license?.isValid !== false
            },
            location: {
              address: response.data.location?.address || '',
              city: response.data.location?.city || '',
              district: response.data.location?.district || '',
              country: response.data.location?.country || 'Bangladesh'
            },
            contact: {
              phone: response.data.contact?.phone || '',
              email: response.data.contact?.email || '',
              website: response.data.contact?.website || ''
            },
            destinationCountries: response.data.destinationCountries || [],
            specialization: response.data.specialization || [],
            establishedYear: response.data.establishedYear || '',
            totalPlacements: response.data.totalPlacements || 0
          });
        } else {
          console.warn('No data in response');
        }
      } else if (activeTab === 'stories') {
        const response = await agencyManagementService.getSuccessStories();
        setSuccessStories(response.data || []);
      } else if (activeTab === 'fees') {
        const response = await agencyManagementService.getFeeStructures();
        setFeeStructures(response.data || []);
      } else if (activeTab === 'training') {
        const response = await agencyManagementService.getTrainingRecords();
        setTrainingRecords(response.data || []);
      } else if (activeTab === 'workers') {
        const response = await agencyManagementService.getInterestedWorkers();
        setInterestedWorkers(response.data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      // If agency details don't exist (404), it's not necessarily an error - they just need to create them
      if (err.response?.status === 404 && activeTab === 'company') {
        console.log('No agency details found - user needs to create them');
        setError('No agency details found. Please fill in your company information below.');
      } else {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Company Info Handlers
  const handleCompanyInfoSubmit = async (e) => {
    e.preventDefault();
    setCompanyLoading(true);
    setCompanyError('');
    setCompanySuccess('');
    
    try {
      // Clear any general messages
      setError('');
      setSuccess('');
      
      let response;
      
      // Try to update first
      try {
        response = await agencyManagementService.updateAgencyDetails(companyInfo);
      } catch (updateError) {
        // If update fails with 404, try to create
        if (updateError.response?.status === 404) {
          console.log('Agency details not found, creating new...');
          response = await agencyManagementService.createAgencyDetails(companyInfo);
        } else {
          throw updateError;
        }
      }
      
      setCompanySuccess('Company information updated successfully!');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setCompanySuccess('');
      }, 5000);
      
      // Refresh data
      await fetchData();
      
    } catch (err) {
      console.error('Error updating company info:', err);
      setCompanyError(err.message || 'Failed to update company information');
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCompanyInfoChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCompanyInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCompanyInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear messages on input change
    if (companyError) setCompanyError('');
    if (companySuccess) setCompanySuccess('');
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Update individual section
  const handleSectionUpdate = async (section, data) => {
    setSectionLoading(prev => ({ ...prev, [section]: true }));
    setSectionError(prev => ({ ...prev, [section]: '' }));
    setSectionSuccess(prev => ({ ...prev, [section]: '' }));
    
    try {
      let response;
      
      // Try to update first
      try {
        response = await agencyManagementService.updateAgencyDetails(data);
        console.log('Section update response:', response);
      } catch (updateError) {
        // If update fails with 404, try to create
        if (updateError.response?.status === 404) {
          console.log('Agency details not found, creating new...');
          response = await agencyManagementService.createAgencyDetails(data);
          console.log('Section create response:', response);
        } else {
          throw updateError;
        }
      }
      
      setSectionSuccess(prev => ({ 
        ...prev, 
        [section]: 'Section updated successfully!' 
      }));
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSectionSuccess(prev => ({ ...prev, [section]: '' }));
      }, 3000);
      
      // Refresh data to get latest from server
      await fetchData();
      
    } catch (err) {
      setSectionError(prev => ({ 
        ...prev, 
        [section]: err.message || 'Failed to update section' 
      }));
    } finally {
      setSectionLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  // Success Stories Handlers
  const handleStorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editingStoryId) {
        await agencyManagementService.updateSuccessStory(editingStoryId, storyForm);
        setSuccess('Success story updated!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        await agencyManagementService.createSuccessStory(storyForm);
        setSuccess('Success story created!');
        setTimeout(() => setSuccess(''), 3000);
      }
      setStoryForm({ title: '', content: '', workerName: '', destinationCountry: '', imageUrl: '' });
      setEditingStoryId(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryEdit = (story) => {
    setStoryForm({
      title: story.title,
      content: story.content,
      workerName: story.workerName || '',
      destinationCountry: story.destinationCountry || '',
      imageUrl: story.imageUrl || '',
    });
    setEditingStoryId(story._id);
  };

  const handleStoryDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await agencyManagementService.deleteSuccessStory(id);
      setSuccess('Story deleted!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  // Fee Structure Handlers
  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingFeeId) {
        await agencyManagementService.updateFeeStructure(editingFeeId, feeForm);
        setSuccess('Fee structure updated!');
      } else {
        await agencyManagementService.createFeeStructure(feeForm);
        setSuccess('Fee structure created!');
      }
      setFeeForm({ country: '', serviceType: '', amount: '', isLegal: true, description: '' });
      setEditingFeeId(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFeeEdit = (fee) => {
    setFeeForm({
      country: fee.country,
      serviceType: fee.serviceType,
      amount: fee.amount,
      isLegal: fee.isLegal,
      description: fee.description || '',
    });
    setEditingFeeId(fee._id);
  };

  const handleFeeDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this fee structure?')) return;
    try {
      await agencyManagementService.deleteFeeStructure(id);
      setSuccess('Fee structure deleted!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  // Training Records Handlers
  const handleTrainingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingTrainingId) {
        await agencyManagementService.updateTrainingRecord(editingTrainingId, trainingForm);
        setSuccess('Training record updated!');
      } else {
        await agencyManagementService.createTrainingRecord(trainingForm);
        setSuccess('Training record created!');
      }
      setTrainingForm({ programName: '', description: '', duration: '', scheduleDate: '', location: '', capacity: '' });
      setEditingTrainingId(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingEdit = (training) => {
    setTrainingForm({
      programName: training.programName,
      description: training.description,
      duration: training.duration || '',
      scheduleDate: training.scheduleDate ? new Date(training.scheduleDate).toISOString().split('T')[0] : '',
      location: training.location || '',
      capacity: training.capacity || '',
    });
    setEditingTrainingId(training._id);
  };

  const handleTrainingDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this training record?')) return;
    try {
      await agencyManagementService.deleteTrainingRecord(id);
      setSuccess('Training record deleted!');
      fetchData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div className="agency-dashboard">
      <header className="dashboard-header">
        <h1>Agency Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user?.email}</span>
          <button onClick={() => navigate('/messages')} className="btn btn-primary" style={{ marginRight: '10px' }}>
            💬 Messages
          </button>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <nav className="dashboard-tabs">
        <button
          className={activeTab === 'company' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('company')}
        >
          Company Info
        </button>
        <button
          className={activeTab === 'stories' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('stories')}
        >
          Success Stories
        </button>
        <button
          className={activeTab === 'fees' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('fees')}
        >
          Fee Structure
        </button>
        <button
          className={activeTab === 'training' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('training')}
        >
          Training Records
        </button>
        <button
          className={activeTab === 'workers' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('workers')}
        >
          Interested Workers
        </button>
      </nav>

      <div className="dashboard-content">
        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <div className="section">
            <h2>Company Information Management</h2>
            <p className="section-description">Update your agency details section by section. Each section can be updated independently.</p>
            
            {/* Loading State */}
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your company information...</p>
              </div>
            )}
            
            {/* Global messages */}
            {companyError && <div className="alert alert-error">{companyError}</div>}
            {companySuccess && <div className="form-success">{companySuccess}</div>}
            
            {!loading && (
            <div className="company-sections">
              {/* Basic Information Section */}
              <div className={`info-section ${expandedSections.basic ? 'expanded' : 'collapsed'}`}>
                <div className="section-header" onClick={() => toggleSection('basic')}>
                  <div className="section-title-group">
                    <span className="section-icon">📋</span>
                    <h3>Basic Information</h3>
                  </div>
                  <div className="section-controls">
                    {sectionSuccess.basic && <span className="success-badge">✓ Saved</span>}
                    <button type="button" className="toggle-btn">
                      {expandedSections.basic ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {expandedSections.basic && (
                  <div className="section-content">
                    {sectionError.basic && <div className="alert alert-error">{sectionError.basic}</div>}
                    {sectionSuccess.basic && <div className="form-success">{sectionSuccess.basic}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Company Name *</label>
                        <input
                          type="text"
                          value={companyInfo.name}
                          onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Established Year</label>
                        <input
                          type="number"
                          value={companyInfo.establishedYear}
                          onChange={(e) => handleCompanyInfoChange('establishedYear', parseInt(e.target.value) || '')}
                          placeholder="e.g., 2010"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={companyInfo.description}
                        onChange={(e) => handleCompanyInfoChange('description', e.target.value)}
                        placeholder="Describe your agency and services"
                        rows="4"
                        maxLength="1000"
                      />
                      <small className="multi-select-info">
                        {companyInfo.description.length}/1000 characters
                      </small>
                    </div>

                    <div className="section-actions">
                      <button 
                        type="button"
                        className="btn btn-primary"
                        disabled={sectionLoading.basic}
                        onClick={() => handleSectionUpdate('basic', {
                          name: companyInfo.name,
                          description: companyInfo.description,
                          establishedYear: companyInfo.establishedYear
                        })}
                      >
                        {sectionLoading.basic ? 'Saving...' : 'Save Basic Info'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* License Information Section */}
              <div className={`info-section ${expandedSections.license ? 'expanded' : 'collapsed'}`}>
                <div className="section-header" onClick={() => toggleSection('license')}>
                  <div className="section-title-group">
                    <span className="section-icon">📜</span>
                    <h3>License Information</h3>
                  </div>
                  <div className="section-controls">
                    {sectionSuccess.license && <span className="success-badge">✓ Saved</span>}
                    <button type="button" className="toggle-btn">
                      {expandedSections.license ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {expandedSections.license && (
                  <div className="section-content">
                    {sectionError.license && <div className="alert alert-error">{sectionError.license}</div>}
                    {sectionSuccess.license && <div className="form-success">{sectionSuccess.license}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>License Number *</label>
                        <input
                          type="text"
                          value={companyInfo.license.number}
                          onChange={(e) => handleCompanyInfoChange('license.number', e.target.value)}
                          placeholder="Enter license number"
                        />
                      </div>
                      <div className="form-group">
                        <label>Issue Date</label>
                        <input
                          type="date"
                          value={companyInfo.license.issueDate}
                          onChange={(e) => handleCompanyInfoChange('license.issueDate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="date"
                          value={companyInfo.license.expiryDate}
                          onChange={(e) => handleCompanyInfoChange('license.expiryDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="section-actions">
                      <button 
                        type="button"
                        className="btn btn-primary"
                        disabled={sectionLoading.license}
                        onClick={() => handleSectionUpdate('license', {
                          license: companyInfo.license
                        })}
                      >
                        {sectionLoading.license ? 'Saving...' : 'Save License Info'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information Section */}
              <div className={`info-section ${expandedSections.contact ? 'expanded' : 'collapsed'}`}>
                <div className="section-header" onClick={() => toggleSection('contact')}>
                  <div className="section-title-group">
                    <span className="section-icon">📞</span>
                    <h3>Contact Information</h3>
                  </div>
                  <div className="section-controls">
                    {sectionSuccess.contact && <span className="success-badge">✓ Saved</span>}
                    <button type="button" className="toggle-btn">
                      {expandedSections.contact ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {expandedSections.contact && (
                  <div className="section-content">
                    {sectionError.contact && <div className="alert alert-error">{sectionError.contact}</div>}
                    {sectionSuccess.contact && <div className="form-success">{sectionSuccess.contact}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={companyInfo.contact.email}
                          onChange={(e) => handleCompanyInfoChange('contact.email', e.target.value)}
                          placeholder="contact@agency.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={companyInfo.contact.phone}
                          onChange={(e) => handleCompanyInfoChange('contact.phone', e.target.value)}
                          placeholder="+880 1XXX XXXXXX"
                        />
                      </div>
                      <div className="form-group">
                        <label>Website</label>
                        <input
                          type="url"
                          value={companyInfo.contact.website}
                          onChange={(e) => handleCompanyInfoChange('contact.website', e.target.value)}
                          placeholder="https://www.agency.com"
                        />
                      </div>
                    </div>

                    <div className="section-actions">
                      <button 
                        type="button"
                        className="btn btn-primary"
                        disabled={sectionLoading.contact}
                        onClick={() => handleSectionUpdate('contact', {
                          contact: companyInfo.contact
                        })}
                      >
                        {sectionLoading.contact ? 'Saving...' : 'Save Contact Info'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className={`info-section ${expandedSections.location ? 'expanded' : 'collapsed'}`}>
                <div className="section-header" onClick={() => toggleSection('location')}>
                  <div className="section-title-group">
                    <span className="section-icon">📍</span>
                    <h3>Location</h3>
                  </div>
                  <div className="section-controls">
                    {sectionSuccess.location && <span className="success-badge">✓ Saved</span>}
                    <button type="button" className="toggle-btn">
                      {expandedSections.location ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {expandedSections.location && (
                  <div className="section-content">
                    {sectionError.location && <div className="alert alert-error">{sectionError.location}</div>}
                    {sectionSuccess.location && <div className="form-success">{sectionSuccess.location}</div>}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          value={companyInfo.location.address}
                          onChange={(e) => handleCompanyInfoChange('location.address', e.target.value)}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          value={companyInfo.location.city}
                          onChange={(e) => handleCompanyInfoChange('location.city', e.target.value)}
                          placeholder="City name"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>District</label>
                        <input
                          type="text"
                          value={companyInfo.location.district}
                          onChange={(e) => handleCompanyInfoChange('location.district', e.target.value)}
                          placeholder="District name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          value={companyInfo.location.country}
                          onChange={(e) => handleCompanyInfoChange('location.country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="section-actions">
                      <button 
                        type="button"
                        className="btn btn-primary"
                        disabled={sectionLoading.location}
                        onClick={() => handleSectionUpdate('location', {
                          location: companyInfo.location
                        })}
                      >
                        {sectionLoading.location ? 'Saving...' : 'Save Location'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Details Section */}
              <div className={`info-section ${expandedSections.business ? 'expanded' : 'collapsed'}`}>
                <div className="section-header" onClick={() => toggleSection('business')}>
                  <div className="section-title-group">
                    <span className="section-icon">💼</span>
                    <h3>Business Details</h3>
                  </div>
                  <div className="section-controls">
                    {sectionSuccess.business && <span className="success-badge">✓ Saved</span>}
                    <button type="button" className="toggle-btn">
                      {expandedSections.business ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
                
                {expandedSections.business && (
                  <div className="section-content">
                    {sectionError.business && <div className="alert alert-error">{sectionError.business}</div>}
                    {sectionSuccess.business && <div className="form-success">{sectionSuccess.business}</div>}
                    
                    <div className="form-group">
                      <label>Destination Countries</label>
                      <input
                        type="text"
                        value={companyInfo.destinationCountries.join(', ')}
                        onChange={(e) => handleCompanyInfoChange('destinationCountries', e.target.value.split(',').map(c => c.trim()).filter(c => c))}
                        placeholder="Saudi Arabia, UAE, Qatar, Kuwait"
                      />
                      <small className="multi-select-info">
                        Separate countries with commas
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Specializations</label>
                      <select 
                        multiple
                        value={companyInfo.specialization}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          handleCompanyInfoChange('specialization', values);
                        }}
                        className="multi-select"
                      >
                        <option value="Construction">Construction</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Domestic Work">Domestic Work</option>
                        <option value="IT & Technology">IT & Technology</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Other">Other</option>
                      </select>
                      <small className="multi-select-info">
                        Hold Ctrl/Cmd to select multiple options
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Total Placements</label>
                      <input
                        type="number"
                        value={companyInfo.totalPlacements}
                        onChange={(e) => handleCompanyInfoChange('totalPlacements', parseInt(e.target.value) || 0)}
                        placeholder="Number of workers placed"
                        min="0"
                      />
                    </div>

                    <div className="section-actions">
                      <button 
                        type="button"
                        className="btn btn-primary"
                        disabled={sectionLoading.business}
                        onClick={() => handleSectionUpdate('business', {
                          destinationCountries: companyInfo.destinationCountries,
                          specialization: companyInfo.specialization,
                          totalPlacements: companyInfo.totalPlacements
                        })}
                      >
                        {sectionLoading.business ? 'Saving...' : 'Save Business Details'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Save All Button */}
              <div className="save-all-section">
                <button 
                  type="button"
                  className="btn btn-primary btn-lg"
                  disabled={companyLoading}
                  onClick={() => handleCompanyInfoSubmit({ preventDefault: () => {} })}
                >
                  {companyLoading ? 'Saving All...' : '💾 Save All Sections'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-lg" 
                  onClick={() => fetchData()}
                >
                  🔄 Reset All Changes
                </button>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Success Stories Tab */}
        {activeTab === 'stories' && (
          <div className="section">
            <h2>{editingStoryId ? 'Edit Success Story' : 'Add Success Story'}</h2>
            <form onSubmit={handleStorySubmit} className="form">
              <input
                type="text"
                placeholder="Title *"
                value={storyForm.title}
                onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Content *"
                value={storyForm.content}
                onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                rows="4"
                required
              />
              <input
                type="text"
                placeholder="Worker Name"
                value={storyForm.workerName}
                onChange={(e) => setStoryForm({ ...storyForm, workerName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Destination Country"
                value={storyForm.destinationCountry}
                onChange={(e) => setStoryForm({ ...storyForm, destinationCountry: e.target.value })}
              />
              <input
                type="url"
                placeholder="Image URL"
                value={storyForm.imageUrl}
                onChange={(e) => setStoryForm({ ...storyForm, imageUrl: e.target.value })}
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingStoryId ? 'Update' : 'Create'}
                </button>
                {editingStoryId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingStoryId(null);
                      setStoryForm({ title: '', content: '', workerName: '', destinationCountry: '', imageUrl: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3>Your Success Stories</h3>
            <div className="items-list">
              {successStories.map((story) => (
                <div key={story._id} className="item-card">
                  <h4>{story.title}</h4>
                  <p>{story.content}</p>
                  {story.workerName && <p><strong>Worker:</strong> {story.workerName}</p>}
                  {story.destinationCountry && <p><strong>Country:</strong> {story.destinationCountry}</p>}
                  {story.imageUrl && <img src={story.imageUrl} alt={story.title} style={{ maxWidth: '200px' }} />}
                  <div className="item-actions">
                    <button onClick={() => handleStoryEdit(story)} className="btn btn-sm btn-primary">Edit</button>
                    <button onClick={() => handleStoryDelete(story._id)} className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </div>
              ))}
              {successStories.length === 0 && <p>No success stories yet.</p>}
            </div>
          </div>
        )}

        {/* Fee Structure Tab */}
        {activeTab === 'fees' && (
          <div className="section">
            <h2>{editingFeeId ? 'Edit Fee Structure' : 'Add Fee Structure'}</h2>
            <form onSubmit={handleFeeSubmit} className="form">
              <input
                type="text"
                placeholder="Country *"
                value={feeForm.country}
                onChange={(e) => setFeeForm({ ...feeForm, country: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Service Type *"
                value={feeForm.serviceType}
                onChange={(e) => setFeeForm({ ...feeForm, serviceType: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Amount (BDT) *"
                value={feeForm.amount}
                onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                required
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={feeForm.isLegal}
                  onChange={(e) => setFeeForm({ ...feeForm, isLegal: e.target.checked })}
                />
                Within Legal Limits
              </label>
              <textarea
                placeholder="Description"
                value={feeForm.description}
                onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                rows="3"
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingFeeId ? 'Update' : 'Create'}
                </button>
                {editingFeeId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingFeeId(null);
                      setFeeForm({ country: '', serviceType: '', amount: '', isLegal: true, description: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3>Your Fee Structures</h3>
            <div className="items-list">
              {feeStructures.map((fee) => (
                <div key={fee._id} className="item-card">
                  <h4>{fee.country} - {fee.serviceType}</h4>
                  <p><strong>Amount:</strong> {fee.amount} BDT</p>
                  <p><strong>Legal Status:</strong> {fee.isLegal ? '✅ Within Legal Limits' : '⚠️ Review Required'}</p>
                  {fee.description && <p>{fee.description}</p>}
                  <div className="item-actions">
                    <button onClick={() => handleFeeEdit(fee)} className="btn btn-sm btn-primary">Edit</button>
                    <button onClick={() => handleFeeDelete(fee._id)} className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </div>
              ))}
              {feeStructures.length === 0 && <p>No fee structures yet.</p>}
            </div>
          </div>
        )}

        {/* Training Records Tab */}
        {activeTab === 'training' && (
          <div className="section">
            <h2>{editingTrainingId ? 'Edit Training Record' : 'Add Training Record'}</h2>
            <form onSubmit={handleTrainingSubmit} className="form">
              <input
                type="text"
                placeholder="Program Name *"
                value={trainingForm.programName}
                onChange={(e) => setTrainingForm({ ...trainingForm, programName: e.target.value })}
                required
              />
              <textarea
                placeholder="Description *"
                value={trainingForm.description}
                onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                rows="3"
                required
              />
              <input
                type="text"
                placeholder="Duration (e.g., 2 weeks)"
                value={trainingForm.duration}
                onChange={(e) => setTrainingForm({ ...trainingForm, duration: e.target.value })}
              />
              <input
                type="date"
                placeholder="Schedule Date"
                value={trainingForm.scheduleDate}
                onChange={(e) => setTrainingForm({ ...trainingForm, scheduleDate: e.target.value })}
              />
              <input
                type="text"
                placeholder="Location"
                value={trainingForm.location}
                onChange={(e) => setTrainingForm({ ...trainingForm, location: e.target.value })}
              />
              <input
                type="number"
                placeholder="Capacity"
                value={trainingForm.capacity}
                onChange={(e) => setTrainingForm({ ...trainingForm, capacity: e.target.value })}
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingTrainingId ? 'Update' : 'Create'}
                </button>
                {editingTrainingId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingTrainingId(null);
                      setTrainingForm({ programName: '', description: '', duration: '', scheduleDate: '', location: '', capacity: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3>Your Training Programs</h3>
            <div className="items-list">
              {trainingRecords.map((training) => (
                <div key={training._id} className="item-card">
                  <h4>{training.programName}</h4>
                  <p>{training.description}</p>
                  {training.duration && <p><strong>Duration:</strong> {training.duration}</p>}
                  {training.scheduleDate && <p><strong>Date:</strong> {new Date(training.scheduleDate).toLocaleDateString()}</p>}
                  {training.location && <p><strong>Location:</strong> {training.location}</p>}
                  {training.capacity && <p><strong>Capacity:</strong> {training.capacity} participants</p>}
                  <div className="item-actions">
                    <button onClick={() => handleTrainingEdit(training)} className="btn btn-sm btn-primary">Edit</button>
                    <button onClick={() => handleTrainingDelete(training._id)} className="btn btn-sm btn-danger">Delete</button>
                  </div>
                </div>
              ))}
              {trainingRecords.length === 0 && <p>No training records yet.</p>}
            </div>
          </div>
        )}

        {/* Interested Workers Tab */}
        {activeTab === 'workers' && (
          <div className="section">
            <h2>Interested Workers</h2>
            <div className="workers-table">
              {interestedWorkers.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interestedWorkers.map((worker) => (
                      <tr key={worker._id}>
                        <td>{worker.userId?.fullName?.firstName} {worker.userId?.fullName?.lastName}</td>
                        <td>{worker.userId?.phoneNumber}</td>
                        <td>{worker.userId?.email}</td>
                        <td>{worker.userId?.location?.bangladeshAddress?.district}</td>
                        <td>{new Date(worker.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No interested workers yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;
