const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergency.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/emergency/contacts/nearest
 * @desc    Get nearest emergency contacts (embassies, NGOs) by location
 * @access  Public
 * @query   lon, lat, maxDistance (optional), type (optional)
 */
router.get('/contacts/nearest', emergencyController.getNearestContacts);

/**
 * @route   GET /api/emergency/contacts/country/:country
 * @desc    Get all emergency contacts in a specific country
 * @access  Public
 * @params  country - Country name
 * @query   type (optional) - Filter by type (embassy, ngo, etc)
 */
router.get('/contacts/country/:country', emergencyController.getContactsByCountry);

/**
 * @route   POST /api/emergency/sos
 * @desc    Trigger SOS emergency alert
 * @access  Private (authenticated users only)
 * @body    { location: { coordinates: [lon, lat] }, emergencyType, description, severity, locationDetails, deviceInfo }
 */
router.post('/sos', authenticate, emergencyController.triggerSOS);

/**
 * @route   GET /api/emergency/history
 * @desc    Get user's SOS history
 * @access  Private (authenticated users only)
 * @query   limit (optional) - Number of records to return
 */
router.get('/history', authenticate, emergencyController.getSOSHistory);

/**
 * @route   GET /api/emergency/:eventId
 * @desc    Get specific emergency event details
 * @access  Private (owner or admin)
 * @params  eventId - Emergency event ID
 */
router.get('/:eventId', authenticate, emergencyController.getEmergencyEvent);

/**
 * @route   PATCH /api/emergency/:eventId/status
 * @desc    Update emergency event status
 * @access  Private (owner or admin)
 * @params  eventId - Emergency event ID
 * @body    { status, notes }
 */
router.patch('/:eventId/status', authenticate, emergencyController.updateEmergencyStatus);

/**
 * @route   PATCH /api/emergency/:eventId/location
 * @desc    Update worker's location during active emergency
 * @access  Private (owner or admin)
 * @params  eventId - Emergency event ID
 * @body    { location: { coordinates: [lon, lat] }, locationDetails }
 */
router.patch('/:eventId/location', authenticate, emergencyController.updateLocation);

/**
 * @route   GET /api/emergency/admin/active
 * @desc    Get all active emergencies (for admin dashboard)
 * @access  Admin only
 */
router.get('/admin/active', authenticate, emergencyController.getActiveEmergencies);

/**
 * @route   GET /api/emergency/admin/severity/:severity
 * @desc    Get emergencies filtered by severity level
 * @access  Admin only
 * @params  severity - critical, high, medium, low
 */
router.get('/admin/severity/:severity', authenticate, emergencyController.getEmergenciesBySeverity);

/**
 * @route   POST /api/emergency/:eventId/note
 * @desc    Add support note to emergency event
 * @access  Admin only
 * @params  eventId - Emergency event ID
 * @body    { note }
 */
router.post('/:eventId/note', authenticate, emergencyController.addSupportNote);

module.exports = router;
