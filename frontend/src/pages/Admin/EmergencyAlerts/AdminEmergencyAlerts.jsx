import React, { useState, useEffect, useRef } from 'react';
import { getActiveEmergencies, getEmergenciesBySeverity, updateEmergencyStatus, addSupportNote } from '../../../services/sosService';
import { getNotifications, markAsRead, markAllAsRead } from '../../../services/notificationService';
import './AdminEmergencyAlerts.css';

/**
 * Admin Emergency Alerts Page
 * View and manage all active emergency SOS alerts from workers
 */
const AdminEmergencyAlerts = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [supportNote, setSupportNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlertData, setNewAlertData] = useState(null);
  const previousCountRef = useRef(0);
  const audioRef = useRef(null);

  // Load emergencies and notifications on mount
  useEffect(() => {
    loadEmergencies();
    loadNotifications();
    
    // Auto-refresh every 10 seconds for faster response
    const interval = setInterval(() => {
      loadEmergencies();
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [filterSeverity]);

  // Play alert sound when new emergency arrives
  useEffect(() => {
    if (emergencies.length > previousCountRef.current && previousCountRef.current > 0) {
      // New emergency detected
      const newestEmergency = emergencies[0];
      setNewAlertData(newestEmergency);
      setShowNewAlert(true);
      
      // Play alert sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Auto-hide after 10 seconds
      setTimeout(() => setShowNewAlert(false), 10000);
    }
    previousCountRef.current = emergencies.length;
  }, [emergencies]);

  const loadNotifications = async () => {
    try {
      console.log('[AdminEmergencyAlerts] Fetching emergency SOS notifications...');
      // Service returns response.data which is the notifications array directly
      const notificationsArray = await getNotifications(50, true, 'emergency_sos');
      console.log('[AdminEmergencyAlerts] Full API Response:', notificationsArray);
      console.log('[AdminEmergencyAlerts] Type of response:', typeof notificationsArray);
      console.log('[AdminEmergencyAlerts] Is array?:', Array.isArray(notificationsArray));
      console.log('[AdminEmergencyAlerts] Number of SOS notifications:', notificationsArray?.length || 0);
      
      setNotifications(notificationsArray || []);
    } catch (err) {
      console.error('[AdminEmergencyAlerts] Error loading notifications:', err);
      console.error('[AdminEmergencyAlerts] Error message:', err.message);
      setNotifications([]);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const loadEmergencies = async () => {
    try {
      setLoading(emergencies.length === 0);
      let emergenciesArray;
      
      console.log('[AdminEmergencyAlerts] Fetching emergencies with filter:', filterSeverity);
      
      if (filterSeverity === 'all') {
        // Service returns response.data which is the emergencies array directly
        emergenciesArray = await getActiveEmergencies();
        console.log('[AdminEmergencyAlerts] Active emergencies response:', emergenciesArray);
      } else {
        emergenciesArray = await getEmergenciesBySeverity(filterSeverity);
        console.log('[AdminEmergencyAlerts] Emergencies by severity response:', emergenciesArray);
      }
      
      console.log('[AdminEmergencyAlerts] Type of response:', typeof emergenciesArray);
      console.log('[AdminEmergencyAlerts] Is array?:', Array.isArray(emergenciesArray));
      console.log('[AdminEmergencyAlerts] Number of emergencies:', emergenciesArray?.length || 0);
      setEmergencies(emergenciesArray || []);
      setError(null);
    } catch (err) {
      setError('Failed to load emergencies. Please try again.');
      console.error('[AdminEmergencyAlerts] Error loading emergencies:', err);
      console.error('[AdminEmergencyAlerts] Error message:', err.message);
      setEmergencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (eventId, newStatus) => {
    if (!confirm(`Are you sure you want to mark this emergency as ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      await updateEmergencyStatus(eventId, newStatus);
      await loadEmergencies(); // Reload list
      alert('Emergency status updated successfully');
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    if (!supportNote.trim()) {
      alert('Please enter a support note');
      return;
    }

    try {
      setUpdating(true);
      await addSupportNote(selectedEmergency._id, supportNote);
      setSupportNote('');
      await loadEmergencies();
      alert('Support note added successfully');
    } catch (err) {
      alert('Failed to add note: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#dc2626';
      case 'in_progress':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return 'Unknown';
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeElapsed = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="admin-emergency-container">
      {/* Audio element for alert sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6bkYd7c3F3gIyZpKupoZWIfXRva3F9jpyopqCWjIJ6dXR5g46ao6ahlIt/d3V2e4WSlp6gnpWMgnt3eH2FjZSZm5mUjYeBeX17gYeNk5eZlpKMhoB7e36ChYqPk5aUkY2Ig4F+fX+ChYmNj5CQjouHg4B9fH+ChYeKjY6OjIqHhIGAfn+Bg4WIiouMi4qIhoOBf39/gYOFh4mKi4qJh4WDgYB/f4CCg4WGh4iIiIeGhIKBgIB/gIGCg4SFhoeHhoWEg4KBgICAf4CBgoOEhYWFhYWEg4OCgoGBgYCAgYGCg4OEhISEhIODg4KCgoGBgYGBgYGBgoKDg4ODg4ODg4ODgoKCgoKBgYGBgYGBgoKCgoODg4ODg4ODg4KCgoKCgoGBgQ==" type="audio/wav"/>
      </audio>

      {/* New Alert Popup */}
      {showNewAlert && newAlertData && (
        <div className="new-alert-popup">
          <div className="alert-popup-content">
            <div className="alert-icon">🚨</div>
            <div className="alert-info">
              <h3>NEW EMERGENCY ALERT!</h3>
              <p><strong>{newAlertData.workerName}</strong></p>
              <p>{newAlertData.emergencyType?.replace('_', ' ')} - {newAlertData.severity?.toUpperCase()}</p>
            </div>
            <button className="alert-close" onClick={() => setShowNewAlert(false)}>×</button>
          </div>
        </div>
      )}

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <div className="notifications-banner">
          <div className="banner-content">
            <span className="banner-icon">🔔</span>
            <span className="banner-text">
              You have <strong>{notifications.length}</strong> unread emergency notification{notifications.length > 1 ? 's' : ''}
            </span>
            <button className="banner-btn" onClick={handleMarkAllRead}>
              Mark All Read
            </button>
          </div>
        </div>
      )}

      <div className="emergency-header">
        <div className="header-content">
          <h1>🚨 Emergency SOS Alerts</h1>
          <p className="subtitle">Real-time monitoring of worker emergencies (Updates every 10 seconds)</p>
        </div>
        
        <button 
          onClick={loadEmergencies} 
          className="refresh-btn"
          disabled={loading}
        >
          {loading ? '⟳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <label htmlFor="severity-filter">Filter by Severity:</label>
        <select
          id="severity-filter"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="severity-select"
        >
          <option value="all">All Emergencies</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🔵 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
      </div>

      {/* Statistics Summary */}
      <div className="stats-grid">
        <div className="stat-card critical">
          <div className="stat-value">
            {emergencies.filter(e => e.severity === 'critical').length}
          </div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-card high">
          <div className="stat-value">
            {emergencies.filter(e => e.severity === 'high').length}
          </div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card active">
          <div className="stat-value">
            {emergencies.filter(e => e.status === 'active').length}
          </div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-value">
            {emergencies.filter(e => e.status === 'in_progress').length}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Emergencies List */}
      {loading && emergencies.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading emergency alerts...</p>
        </div>
      ) : emergencies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Active Emergencies</h3>
          <p>There are currently no emergency alerts to display</p>
        </div>
      ) : (
        <div className="emergencies-list">
          {emergencies.map((emergency) => (
            <div 
              key={emergency._id} 
              className={`emergency-card ${emergency.severity}`}
              onClick={() => setSelectedEmergency(emergency)}
            >
              {/* Header */}
              <div className="emergency-card-header">
                <div className="header-left">
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(emergency.severity) }}
                  >
                    {emergency.severity.toUpperCase()}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(emergency.status) }}
                  >
                    {emergency.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="header-right">
                  <span className="time-elapsed">{getTimeElapsed(emergency.createdAt)}</span>
                </div>
              </div>

              {/* Worker Info */}
              <div className="worker-info">
                <h3>{emergency.workerName}</h3>
                {emergency.workerPhone && (
                  <a href={`tel:${emergency.workerPhone}`} className="phone-link">
                    📞 {emergency.workerPhone}
                  </a>
                )}
              </div>

              {/* Emergency Details */}
              <div className="emergency-details">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">
                    {emergency.emergencyType.replace('_', ' ')}
                  </span>
                </div>
                
                {emergency.description && (
                  <div className="detail-row">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{emergency.description}</span>
                  </div>
                )}

                {emergency.locationDetails && (
                  <div className="detail-row location-details-row">
                    <span className="detail-label">
                      Location:
                      {emergency.locationDetails.isManualEntry && (
                        <span className="manual-badge" title="Location entered manually">📝</span>
                      )}
                    </span>
                    <div className="detail-value location-value">
                      {emergency.locationDetails.city && <span>{emergency.locationDetails.city}</span>}
                      {emergency.locationDetails.country && <span>, {emergency.locationDetails.country}</span>}
                      {emergency.locationDetails.address && (
                        <div className="address-line">📍 {emergency.locationDetails.address}</div>
                      )}
                      {emergency.locationDetails.landmark && (
                        <div className="landmark-line">🏢 Near: {emergency.locationDetails.landmark}</div>
                      )}
                    </div>
                  </div>
                )}

                {emergency.location?.coordinates && 
                 emergency.location.coordinates[0] !== 0 && 
                 emergency.location.coordinates[1] !== 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Coordinates:</span>
                    <a
                      href={`https://www.google.com/maps?q=${emergency.location.coordinates[1]},${emergency.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      📍 View on Map
                    </a>
                  </div>
                )}
              </div>

              {/* Nearest Contacts */}
              {emergency.nearestContacts && emergency.nearestContacts.length > 0 && (
                <div className="nearest-contacts">
                  <h4>Nearby Help:</h4>
                  {emergency.nearestContacts.slice(0, 2).map((contact, idx) => (
                    <div key={idx} className="contact-item">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-distance">
                        {formatDistance(contact.distance)}
                      </span>
                      {contact.emergencyHotline && (
                        <a href={`tel:${contact.emergencyHotline}`} className="hotline-link">
                          📞 {contact.emergencyHotline}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                {emergency.status === 'active' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(emergency._id, 'in_progress');
                    }}
                    className="btn-action btn-progress"
                    disabled={updating}
                  >
                    Mark In Progress
                  </button>
                )}
                {(emergency.status === 'active' || emergency.status === 'in_progress') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(emergency._id, 'resolved');
                    }}
                    className="btn-action btn-resolve"
                    disabled={updating}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEmergency && (
        <div className="modal-overlay" onClick={() => setSelectedEmergency(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedEmergency(null)}
            >
              ×
            </button>
            
            <h2>Emergency Details</h2>
            
            <div className="modal-section">
              <h3>Worker Information</h3>
              <p><strong>Name:</strong> {selectedEmergency.workerName}</p>
              {selectedEmergency.workerPhone && (
                <p><strong>Phone:</strong> {selectedEmergency.workerPhone}</p>
              )}
              {selectedEmergency.workerPassport && (
                <p><strong>Passport:</strong> {selectedEmergency.workerPassport}</p>
              )}
            </div>

            <div className="modal-section">
              <h3>Emergency Details</h3>
              <p><strong>Type:</strong> {selectedEmergency.emergencyType.replace('_', ' ')}</p>
              <p><strong>Severity:</strong> <span style={{ color: getSeverityColor(selectedEmergency.severity) }}>{selectedEmergency.severity.toUpperCase()}</span></p>
              <p><strong>Status:</strong> <span style={{ color: getStatusColor(selectedEmergency.status) }}>{selectedEmergency.status.replace('_', ' ').toUpperCase()}</span></p>
              <p><strong>Triggered:</strong> {formatTimestamp(selectedEmergency.createdAt)}</p>
              {selectedEmergency.description && (
                <p><strong>Description:</strong> {selectedEmergency.description}</p>
              )}
            </div>

            {/* Add Support Note */}
            <div className="modal-section">
              <h3>Add Support Note</h3>
              <form onSubmit={handleAddNote}>
                <textarea
                  value={supportNote}
                  onChange={(e) => setSupportNote(e.target.value)}
                  placeholder="Enter support note or action taken..."
                  rows="4"
                  className="note-textarea"
                />
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={updating || !supportNote.trim()}
                >
                  {updating ? 'Adding...' : 'Add Note'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmergencyAlerts;
