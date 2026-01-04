import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import {
  triggerSOS,
  getNearestContacts,
  getSOSHistory,
  updateEmergencyStatus,
  updateEmergencyLocation,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
} from '../../services/sosService';
import './EmergencySOS.css';

const EmergencySOS = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  // State management
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [emergencyType, setEmergencyType] = useState('other');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('high');
  const [sosTriggered, setSosTriggered] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [nearestContacts, setNearestContacts] = useState([]);
  const [sosHistory, setSosHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Emergency type options
  const emergencyTypes = [
    { value: 'medical', label: t?.emergencySOS?.types?.medical || 'Medical Emergency' },
    { value: 'accident', label: t?.emergencySOS?.types?.accident || 'Accident' },
    { value: 'abuse', label: t?.emergencySOS?.types?.abuse || 'Abuse/Violence' },
    { value: 'detention', label: t?.emergencySOS?.types?.detention || 'Detention' },
    { value: 'lost_documents', label: t?.emergencySOS?.types?.lostDocuments || 'Lost Documents' },
    { value: 'threat', label: t?.emergencySOS?.types?.threat || 'Threat/Danger' },
    { value: 'harassment', label: t?.emergencySOS?.types?.harassment || 'Harassment' },
    { value: 'unpaid_wages', label: t?.emergencySOS?.types?.unpaidWages || 'Unpaid Wages' },
    { value: 'unsafe_conditions', label: t?.emergencySOS?.types?.unsafeConditions || 'Unsafe Conditions' },
    { value: 'other', label: t?.emergencySOS?.types?.other || 'Other' },
  ];

  // Get current location on component mount
  useEffect(() => {
    handleGetLocation();
    
    // Load SOS history
    loadSOSHistory();

    // Cleanup location watch on unmount
    return () => {
      if (locationWatchId) {
        clearLocationWatch(locationWatchId);
      }
    };
  }, []);

  // Handle getting current location
  const handleGetLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      setLocationError(error.message);
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Load SOS history
  const loadSOSHistory = async () => {
    try {
      const history = await getSOSHistory(5);
      setSosHistory(history.data || []);
    } catch (error) {
      console.error('Error loading SOS history:', error);
    }
  };

  // Handle SOS trigger
  const handleTriggerSOS = async (e) => {
    e.preventDefault();

    if (!currentLocation) {
      alert(t?.emergencySOS?.errors?.noLocation || 'Please enable location access first');
      return;
    }

    if (!description.trim()) {
      alert(t?.emergencySOS?.errors?.noDescription || 'Please describe your emergency');
      return;
    }

    setLoading(true);

    try {
      const sosData = {
        location: {
          type: 'Point',
          coordinates: currentLocation.coordinates,
        },
        emergencyType,
        description,
        severity,
        locationDetails: {
          accuracy: currentLocation.accuracy,
        },
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      };

      const response = await triggerSOS(sosData);
      
      setSosTriggered(true);
      setActiveEmergency(response.data);
      setNearestContacts(response.data.nearestContacts || []);

      // Start watching location for continuous updates
      startLocationWatch(response.data._id);

      // Reload history
      loadSOSHistory();
    } catch (error) {
      console.error('Error triggering SOS:', error);
      alert(error.response?.data?.message || t?.emergencySOS?.errors?.triggerFailed || 'Failed to trigger SOS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start watching location
  const startLocationWatch = (eventId) => {
    const watchId = watchLocation(
      async (location) => {
        setCurrentLocation(location);
        
        // Update emergency location every 30 seconds
        if (!isUpdatingLocation && activeEmergency) {
          setIsUpdatingLocation(true);
          try {
            await updateEmergencyLocation(eventId, {
              type: 'Point',
              coordinates: location.coordinates,
            }, {
              accuracy: location.accuracy,
            });
          } catch (error) {
            console.error('Error updating location:', error);
          } finally {
            setTimeout(() => setIsUpdatingLocation(false), 30000); // Wait 30 seconds before next update
          }
        }
      },
      (error) => {
        console.error('Location watch error:', error);
      }
    );

    setLocationWatchId(watchId);
  };

  // Handle resolving emergency
  const handleResolveEmergency = async () => {
    if (!activeEmergency) return;

    const confirmResolve = window.confirm(
      t?.emergencySOS?.confirmResolve || 'Are you safe now? This will mark the emergency as resolved.'
    );

    if (!confirmResolve) return;

    setLoading(true);

    try {
      await updateEmergencyStatus(activeEmergency._id, 'resolved', 'Resolved by user');
      
      // Stop location watch
      if (locationWatchId) {
        clearLocationWatch(locationWatchId);
        setLocationWatchId(null);
      }

      setSosTriggered(false);
      setActiveEmergency(null);
      setNearestContacts([]);
      setDescription('');
      
      // Reload history
      loadSOSHistory();
    } catch (error) {
      console.error('Error resolving emergency:', error);
      alert(error.response?.data?.message || t?.emergencySOS?.errors?.resolveFailed || 'Failed to resolve emergency');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancelling emergency
  const handleCancelEmergency = async () => {
    if (!activeEmergency) return;

    const confirmCancel = window.confirm(
      t?.emergencySOS?.confirmCancel || 'Cancel this emergency alert?'
    );

    if (!confirmCancel) return;

    setLoading(true);

    try {
      await updateEmergencyStatus(activeEmergency._id, 'cancelled', 'Cancelled by user');
      
      // Stop location watch
      if (locationWatchId) {
        clearLocationWatch(locationWatchId);
        setLocationWatchId(null);
      }

      setSosTriggered(false);
      setActiveEmergency(null);
      setNearestContacts([]);
      setDescription('');
      
      // Reload history
      loadSOSHistory();
    } catch (error) {
      console.error('Error cancelling emergency:', error);
      alert(error.response?.data?.message || t?.emergencySOS?.errors?.cancelFailed || 'Failed to cancel emergency');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format distance
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="emergency-sos-container">
      <div className="emergency-sos-content">
        <h1 className="emergency-sos-title">
          {t?.emergencySOS?.title || 'Emergency SOS'}
        </h1>

        {!sosTriggered ? (
          <>
            {/* Location Status */}
            <div className="location-status">
              <h2>{t?.emergencySOS?.locationTitle || 'Your Location'}</h2>
              {locationLoading ? (
                <p className="loading-text">{t?.emergencySOS?.gettingLocation || 'Getting your location...'}</p>
              ) : currentLocation ? (
                <div className="location-info">
                  <p className="location-success">
                    ✓ {t?.emergencySOS?.locationFound || 'Location found'}
                  </p>
                  <p className="location-coords">
                    {currentLocation.coordinates[1].toFixed(6)}, {currentLocation.coordinates[0].toFixed(6)}
                  </p>
                  <p className="location-accuracy">
                    {t?.emergencySOS?.accuracy || 'Accuracy'}: ±{currentLocation.accuracy.toFixed(0)}m
                  </p>
                  <button onClick={handleGetLocation} className="btn-secondary" disabled={locationLoading}>
                    {t?.emergencySOS?.refreshLocation || 'Refresh Location'}
                  </button>
                </div>
              ) : (
                <div className="location-error">
                  <p className="error-text">{locationError || t?.emergencySOS?.noLocation || 'Location not available'}</p>
                  <button onClick={handleGetLocation} className="btn-primary" disabled={locationLoading}>
                    {t?.emergencySOS?.getLocation || 'Get My Location'}
                  </button>
                </div>
              )}
            </div>

            {/* SOS Form */}
            <form onSubmit={handleTriggerSOS} className="sos-form">
              <div className="form-group">
                <label htmlFor="emergencyType">
                  {t?.emergencySOS?.emergencyType || 'Emergency Type'} *
                </label>
                <select
                  id="emergencyType"
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  required
                  className="form-select"
                >
                  {emergencyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="severity">
                  {t?.emergencySOS?.severity || 'Severity'} *
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="critical">{t?.emergencySOS?.severityLevels?.critical || 'Critical (Life Threatening)'}</option>
                  <option value="high">{t?.emergencySOS?.severityLevels?.high || 'High (Urgent)'}</option>
                  <option value="medium">{t?.emergencySOS?.severityLevels?.medium || 'Medium'}</option>
                  <option value="low">{t?.emergencySOS?.severityLevels?.low || 'Low'}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  {t?.emergencySOS?.description || 'Describe Your Emergency'} *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder={t?.emergencySOS?.descriptionPlaceholder || 'Please describe what happened and what help you need...'}
                  className="form-textarea"
                />
                <small className="char-count">{description.length}/1000</small>
              </div>

              <button
                type="submit"
                className="btn-sos"
                disabled={loading || !currentLocation || locationLoading}
              >
                {loading ? (
                  t?.emergencySOS?.sendingSOS || 'Sending SOS...'
                ) : (
                  <>
                    🚨 {t?.emergencySOS?.triggerSOS || 'TRIGGER SOS ALERT'}
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Active Emergency */}
            <div className="active-emergency">
              <div className="emergency-alert">
                <h2>🚨 {t?.emergencySOS?.activeAlert || 'SOS ALERT ACTIVE'}</h2>
                <p className="alert-time">
                  {t?.emergencySOS?.triggered || 'Triggered'}: {formatDate(activeEmergency?.createdAt)}
                </p>
                <p className="alert-type">
                  {emergencyTypes.find(type => type.value === activeEmergency?.emergencyType)?.label}
                </p>
                <p className="alert-severity">
                  {t?.emergencySOS?.severity || 'Severity'}: <span className={`severity-${activeEmergency?.severity}`}>
                    {activeEmergency?.severity?.toUpperCase()}
                  </span>
                </p>
              </div>

              {/* Notification Status */}
              <div className="notification-status">
                <h3>{t?.emergencySOS?.notificationStatus || 'Notifications Sent'}</h3>
                <p>✓ {activeEmergency?.familyNotifications?.length || 0} {t?.emergencySOS?.familyMembers || 'family members notified'}</p>
                <p>✓ {activeEmergency?.nearestContacts?.length || 0} {t?.emergencySOS?.emergencyContacts || 'emergency contacts notified'}</p>
              </div>

              {/* Nearest Emergency Contacts */}
              {nearestContacts.length > 0 && (
                <div className="nearest-contacts">
                  <h3>{t?.emergencySOS?.nearestHelp || 'Nearest Emergency Help'}</h3>
                  <div className="contacts-list">
                    {nearestContacts.map((contact, index) => (
                      <div key={index} className="contact-card">
                        <div className="contact-header">
                          <h4>{contact.name}</h4>
                          <span className="contact-distance">{formatDistance(contact.distance)}</span>
                        </div>
                        <p className="contact-type">{contact.type}</p>
                        {contact.emergencyHotline && (
                          <a href={`tel:${contact.emergencyHotline}`} className="contact-phone">
                            📞 {contact.emergencyHotline}
                          </a>
                        )}
                        {contact.phone && contact.phone.length > 0 && (
                          <a href={`tel:${contact.phone[0]}`} className="contact-phone">
                            📞 {contact.phone[0]}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Tracking */}
              <div className="location-tracking">
                <h3>{t?.emergencySOS?.locationTracking || 'Location Tracking'}</h3>
                <p className="tracking-status">
                  {locationWatchId ? (
                    <>✓ {t?.emergencySOS?.trackingActive || 'Location tracking active'}</>
                  ) : (
                    <>{t?.emergencySOS?.trackingInactive || 'Location tracking inactive'}</>
                  )}
                </p>
                {currentLocation && (
                  <p className="current-location">
                    {currentLocation.coordinates[1].toFixed(6)}, {currentLocation.coordinates[0].toFixed(6)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="emergency-actions">
                <button
                  onClick={handleResolveEmergency}
                  className="btn-resolve"
                  disabled={loading}
                >
                  {t?.emergencySOS?.markSafe || "I'm Safe Now"}
                </button>
                <button
                  onClick={handleCancelEmergency}
                  className="btn-cancel"
                  disabled={loading}
                >
                  {t?.emergencySOS?.cancelAlert || 'Cancel Alert'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* SOS History */}
        <div className="sos-history">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary history-toggle"
          >
            {showHistory ? '▼' : '▶'} {t?.emergencySOS?.history || 'SOS History'}
          </button>

          {showHistory && (
            <div className="history-list">
              {sosHistory.length === 0 ? (
                <p className="no-history">{t?.emergencySOS?.noHistory || 'No previous SOS alerts'}</p>
              ) : (
                sosHistory.map((event) => (
                  <div key={event._id} className="history-item">
                    <div className="history-header">
                      <span className={`status-badge status-${event.status}`}>
                        {event.status}
                      </span>
                      <span className="history-date">{formatDate(event.createdAt)}</span>
                    </div>
                    <p className="history-type">
                      {emergencyTypes.find(type => type.value === event.emergencyType)?.label}
                    </p>
                    <p className="history-description">{event.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencySOS;
