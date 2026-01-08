/**
 * Emergency SOS Service
 * Handles all API calls related to emergency SOS functionality
 */

import api from './api';

const SOS_BASE_URL = '/emergency';

/**
 * Trigger an emergency SOS alert
 * @param {Object} sosData - Emergency data
 * @param {Object} sosData.location - Location object with coordinates
 * @param {Array} sosData.location.coordinates - [longitude, latitude]
 * @param {string} sosData.emergencyType - Type of emergency
 * @param {string} sosData.description - Description of the emergency
 * @param {string} sosData.severity - Severity level (critical, high, medium, low)
 * @param {Object} sosData.locationDetails - Additional location details
 * @param {Object} sosData.deviceInfo - Device information
 * @returns {Promise<Object>} Emergency event with nearest contacts
 */
export const triggerSOS = async (sosData) => {
  try {
    const response = await api.post(`${SOS_BASE_URL}/sos`, sosData);
    return response?.data || response;
  } catch (error) {
    console.error('Error triggering SOS:', error);
    throw error;
  }
};

/**
 * Get nearest emergency contacts by location
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @param {number} maxDistance - Maximum distance in meters (optional, default: 100000)
 * @param {string} type - Type of contact (optional: embassy, consulate, ngo, etc)
 * @returns {Promise<Array>} Array of nearest emergency contacts
 */
export const getNearestContacts = async (longitude, latitude, maxDistance = 100000, type = null) => {
  try {
    const params = {
      lon: longitude,
      lat: latitude,
      maxDistance,
    };
    
    if (type) {
      params.type = type;
    }

    const response = await api.get(`${SOS_BASE_URL}/contacts/nearest`, { params });
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching nearest contacts:', error);
    throw error;
  }
};

/**
 * Get all emergency contacts in a specific country
 * @param {string} country - Country name
 * @param {string} type - Type of contact (optional)
 * @returns {Promise<Array>} Array of emergency contacts
 */
export const getContactsByCountry = async (country, type = null) => {
  try {
    const params = type ? { type } : {};
    const response = await api.get(`${SOS_BASE_URL}/contacts/country/${country}`, { params });
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching contacts by country:', error);
    throw error;
  }
};

/**
 * Get user's SOS history
 * @param {number} limit - Number of records to return (optional)
 * @returns {Promise<Array>} Array of past SOS events
 */
export const getSOSHistory = async (limit = 10) => {
  try {
    const params = limit ? { limit } : {};
    const response = await api.get(`${SOS_BASE_URL}/history`, { params });
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching SOS history:', error);
    throw error;
  }
};

/**
 * Get specific emergency event details
 * @param {string} eventId - Emergency event ID
 * @returns {Promise<Object>} Emergency event details
 */
export const getEmergencyEvent = async (eventId) => {
  try {
    const response = await api.get(`${SOS_BASE_URL}/${eventId}`);
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching emergency event:', error);
    throw error;
  }
};

/**
 * Update emergency event status
 * @param {string} eventId - Emergency event ID
 * @param {string} status - New status (active, in_progress, resolved, cancelled)
 * @param {string} notes - Optional resolution notes
 * @returns {Promise<Object>} Updated emergency event
 */
export const updateEmergencyStatus = async (eventId, status, notes = null) => {
  try {
    const data = { status };
    if (notes) {
      data.notes = notes;
    }

    const response = await api.patch(`${SOS_BASE_URL}/${eventId}/status`, data);
    return response?.data || response;
  } catch (error) {
    console.error('Error updating emergency status:', error);
    throw error;
  }
};

/**
 * Update worker's location during active emergency
 * @param {string} eventId - Emergency event ID
 * @param {Object} location - New location object with coordinates
 * @param {Array} location.coordinates - [longitude, latitude]
 * @param {Object} locationDetails - Additional location details
 * @returns {Promise<Object>} Updated emergency event
 */
export const updateEmergencyLocation = async (eventId, location, locationDetails = {}) => {
  try {
    const data = {
      location,
      locationDetails,
    };

    const response = await api.patch(`${SOS_BASE_URL}/${eventId}/location`, data);
    return response?.data || response;
  } catch (error) {
    console.error('Error updating emergency location:', error);
    throw error;
  }
};

/**
 * Get all active emergencies (Admin only)
 * @returns {Promise<Array>} Array of active emergency events
 */
export const getActiveEmergencies = async () => {
  try {
    const response = await api.get(`${SOS_BASE_URL}/admin/active`);
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching active emergencies:', error);
    throw error;
  }
};

/**
 * Get emergencies filtered by severity (Admin only)
 * @param {string} severity - Severity level (critical, high, medium, low)
 * @returns {Promise<Array>} Array of emergency events
 */
export const getEmergenciesBySeverity = async (severity) => {
  try {
    const response = await api.get(`${SOS_BASE_URL}/admin/severity/${severity}`);
    return response?.data || response;
  } catch (error) {
    console.error('Error fetching emergencies by severity:', error);
    throw error;
  }
};

/**
 * Add support note to emergency event (Admin only)
 * @param {string} eventId - Emergency event ID
 * @param {string} note - Support note to add
 * @returns {Promise<Object>} Updated emergency event
 */
export const addSupportNote = async (eventId, note) => {
  try {
    const response = await api.post(`${SOS_BASE_URL}/${eventId}/note`, { note });
    return response?.data || response;
  } catch (error) {
    console.error('Error adding support note:', error);
    throw error;
  }
};

/**
 * Get current device location using browser's Geolocation API
 * @returns {Promise<Object>} Location object with coordinates
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: [position.coords.longitude, position.coords.latitude],
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Watch device location for continuous updates
 * @param {Function} onSuccess - Callback when location updates
 * @param {Function} onError - Callback when error occurs
 * @returns {number} Watch ID for clearing the watch
 */
export const watchLocation = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by your browser'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        coordinates: [position.coords.longitude, position.coords.latitude],
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      let errorMessage = 'Unable to retrieve your location';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
        default:
          errorMessage = 'An unknown error occurred';
      }
      onError(new Error(errorMessage));
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
};

/**
 * Clear location watch
 * @param {number} watchId - Watch ID returned from watchLocation
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

export default {
  triggerSOS,
  getNearestContacts,
  getContactsByCountry,
  getSOSHistory,
  getEmergencyEvent,
  updateEmergencyStatus,
  updateEmergencyLocation,
  getActiveEmergencies,
  getEmergenciesBySeverity,
  addSupportNote,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
};
