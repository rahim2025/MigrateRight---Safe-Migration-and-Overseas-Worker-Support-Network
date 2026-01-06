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
  const [activeTab, setActiveTab] = useState('stories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    loadData();
  }, [user, navigate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'stories') {
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
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Success Stories Handlers
  const handleStorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingStoryId) {
        await agencyManagementService.updateSuccessStory(editingStoryId, storyForm);
        setSuccess('Success story updated!');
      } else {
        await agencyManagementService.createSuccessStory(storyForm);
        setSuccess('Success story created!');
      }
      setStoryForm({ title: '', content: '', workerName: '', destinationCountry: '', imageUrl: '' });
      setEditingStoryId(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
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
      loadData();
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
      loadData();
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
      loadData();
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
      loadData();
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
      loadData();
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
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <nav className="dashboard-tabs">
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
                      <th>Status</th>
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
                        <td>
                          <span className={`status-badge status-${worker.status}`}>
                            {worker.status}
                          </span>
                        </td>
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
