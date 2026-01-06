const EmergencyEvent = require('../models/EmergencyEvent.model');
const EmergencyContact = require('../models/EmergencyContact.model');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { AppError, NotFoundError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Trigger SOS emergency
 * @route   POST /api/emergency/sos
 * @access  Private
 */
const triggerSOS = asyncHandler(async (req, res) => {
  const {
    location,
    emergencyType,
    description,
    severity,
    locationDetails,
    deviceInfo,
  } = req.body;

  // Validate location
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    throw new BadRequestError('Valid location coordinates required [longitude, latitude]');
  }

  const [longitude, latitude] = location.coordinates;

  // Get worker info
  const worker = await User.findById(req.userId);
  if (!worker) {
    throw new NotFoundError('Worker not found');
  }

  // Find nearest emergency contacts (within 100km)
  const nearestContacts = await EmergencyContact.findNearest(
    longitude,
    latitude,
    100000, // 100km in meters
    5
  );

  // Also find 24/7 contacts
  const emergency24x7 = await EmergencyContact.find24x7Near(longitude, latitude, 50000);

  // Combine and deduplicate
  const allContacts = [...nearestContacts, ...emergency24x7];
  const uniqueContacts = Array.from(new Map(allContacts.map(c => [c._id.toString(), c])).values());

  // Prepare nearest contacts data
  const nearestContactsData = uniqueContacts.slice(0, 5).map((contact) => ({
    contactId: contact._id,
    name: contact.name.en,
    type: contact.type,
    distance: contact.distanceTo(longitude, latitude),
    phone: contact.phone[0],
    emergencyHotline: contact.emergencyHotline,
    notified: false,
  }));

  // Prepare family notifications data (empty for now - can be extended later)
  const familyNotificationsData = [];

  // Create emergency event
  const emergencyEvent = await EmergencyEvent.create({
    userId: req.userId,
    workerName: `${worker.fullName.firstName} ${worker.fullName.lastName}`,
    workerPhone: worker.phoneNumber,
    workerPassport: worker.passportNumber,
    emergencyType: emergencyType || 'other',
    description,
    severity: severity || 'high',
    location,
    locationDetails,
    nearestContacts: nearestContactsData,
    familyNotifications: familyNotificationsData,
    deviceInfo,
    timeline: [
      {
        action: 'sos_triggered',
        description: `SOS triggered by ${worker.fullName.firstName} ${worker.fullName.lastName}`,
      },
    ],
  });

  // Notify family members (simulated - in production, send actual emails/push notifications)
  await notifyFamilyMembers(emergencyEvent, worker);

  // Notify nearest contacts (simulated)
  await notifyEmergencyContacts(emergencyEvent, nearestContactsData);

  // Create notifications for all platform admins
  try {
    const adminNotifications = await Notification.createForAllAdmins({
      type: 'emergency_sos',
      title: `🚨 ${emergencyEvent.severity.toUpperCase()} Emergency SOS`,
      message: `${worker.fullName.firstName} ${worker.fullName.lastName} triggered an emergency SOS alert (${emergencyEvent.emergencyType.replace('_', ' ')})`,
      severity: emergencyEvent.severity,
      relatedId: emergencyEvent._id,
      relatedModel: 'EmergencyEvent',
      actionUrl: `/admin/emergencies`,
      metadata: {
        workerName: `${worker.fullName.firstName} ${worker.fullName.lastName}`,
        emergencyType: emergencyEvent.emergencyType,
        location: emergencyEvent.locationDetails?.city || 'Unknown location',
      },
    });
    
    logger.info(`✅ Created ${adminNotifications.length} admin notification(s) for emergency ${emergencyEvent._id}`);
  } catch (notifError) {
    logger.error(`❌ Failed to create admin notifications for emergency ${emergencyEvent._id}:`, notifError);
  }

  logger.warn(`🆘 EMERGENCY SOS TRIGGERED`, {
    eventId: emergencyEvent._id,
    userId: req.userId,
    location: location.coordinates,
    severity: emergencyEvent.severity,
    nearestContacts: nearestContactsData.length,
  });

  res.status(201).json({
    success: true,
    message: 'Emergency SOS activated. Help is on the way!',
    data: {
      eventId: emergencyEvent._id,
      status: emergencyEvent.status,
      nearestContacts: nearestContactsData,
      familyNotified: familyNotificationsData.length,
      timeline: emergencyEvent.timeline,
    },
  });
});

/**
 * @desc    Get nearest emergency contacts
 * @route   GET /api/emergency/contacts/nearest
 * @access  Private
 */
const getNearestContacts = asyncHandler(async (req, res) => {
  const { longitude, latitude, maxDistance = 100000, type } = req.query;

  if (!longitude || !latitude) {
    throw new BadRequestError('Longitude and latitude are required');
  }

  const lon = parseFloat(longitude);
  const lat = parseFloat(latitude);

  const contacts = await EmergencyContact.findNearest(
    lon,
    lat,
    parseInt(maxDistance),
    10,
    type
  );

  // Calculate distances
  const contactsWithDistance = contacts.map((contact) => ({
    ...contact.toObject(),
    distance: contact.distanceTo(lon, lat),
  }));

  logger.info(`Found ${contacts.length} nearest emergency contacts`, {
    location: [lon, lat],
    type,
  });

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contactsWithDistance,
  });
});

/**
 * @desc    Get user's SOS history
 * @route   GET /api/emergency/history
 * @access  Private
 */
const getSOSHistory = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const history = await EmergencyEvent.getUserHistory(req.userId, parseInt(limit));

  logger.info(`Retrieved SOS history for user ${req.userId}`, {
    count: history.length,
  });

  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});

/**
 * @desc    Get specific emergency event
 * @route   GET /api/emergency/:eventId
 * @access  Private
 */
const getEmergencyEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await EmergencyEvent.findById(eventId)
    .populate('userId', 'firstName lastName phone email')
    .populate('nearestContacts.contactId');

  if (!event) {
    throw new NotFoundError('Emergency event not found');
  }

  // Check if user owns this event or is admin
  if (event.userId._id.toString() !== req.userId && req.user.role !== 'platform_admin') {
    throw new AppError('Access denied', 403);
  }

  res.status(200).json({
    success: true,
    data: event,
  });
});

/**
 * @desc    Update emergency status
 * @route   PATCH /api/emergency/:eventId/status
 * @access  Private
 */
const updateEmergencyStatus = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['active', 'in_progress', 'resolved', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const event = await EmergencyEvent.findById(eventId);
  if (!event) {
    throw new NotFoundError('Emergency event not found');
  }

  // Check permissions
  if (event.userId.toString() !== req.userId && req.user.role !== 'platform_admin') {
    throw new AppError('Access denied', 403);
  }

  await event.updateStatus(status, req.userId, notes);

  logger.info(`Emergency ${eventId} status updated to ${status}`, {
    userId: req.userId,
  });

  res.status(200).json({
    success: true,
    message: 'Emergency status updated',
    data: event,
  });
});

/**
 * @desc    Add location update to emergency
 * @route   PATCH /api/emergency/:eventId/location
 * @access  Private
 */
const updateLocation = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { location, locationDetails } = req.body;

  if (!location || !location.coordinates) {
    throw new BadRequestError('Valid location required');
  }

  const event = await EmergencyEvent.findById(eventId);
  if (!event) {
    throw new NotFoundError('Emergency event not found');
  }

  if (event.userId.toString() !== req.userId) {
    throw new AppError('Access denied', 403);
  }

  event.location = location;
  if (locationDetails) {
    event.locationDetails = { ...event.locationDetails, ...locationDetails };
  }

  await event.addTimelineEntry(
    'location_updated',
    `Location updated to ${location.coordinates.join(', ')}`,
    req.userId
  );

  logger.info(`Emergency ${eventId} location updated`, {
    newLocation: location.coordinates,
  });

  res.status(200).json({
    success: true,
    message: 'Location updated',
    data: event,
  });
});

/**
 * @desc    Get all emergency contacts by country
 * @route   GET /api/emergency/contacts/country/:country
 * @access  Public
 */
const getContactsByCountry = asyncHandler(async (req, res) => {
  const { country } = req.params;
  const { type } = req.query;

  let contacts;
  if (type) {
    contacts = await EmergencyContact.findByTypeAndCountry(type, country);
  } else {
    contacts = await EmergencyContact.findEmbassiesInCountry(country);
  }

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts,
  });
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * @desc    Get all active emergencies (Admin)
 * @route   GET /api/emergency/admin/active
 * @access  Private/Admin
 */
const getActiveEmergencies = asyncHandler(async (req, res) => {
  logger.info('Fetching active emergencies', { 
    userId: req.userId, 
    userRole: req.user?.role 
  });
  
  const activeEmergencies = await EmergencyEvent.getActive();
  
  logger.info('Active emergencies found', { 
    count: activeEmergencies.length,
    emergencies: activeEmergencies.map(e => ({
      id: e._id,
      worker: e.workerName,
      type: e.emergencyType,
      status: e.status,
      severity: e.severity
    }))
  });

  res.status(200).json({
    success: true,
    count: activeEmergencies.length,
    data: activeEmergencies,
  });
});

/**
 * @desc    Get emergencies by severity (Admin)
 * @route   GET /api/emergency/admin/severity/:severity
 * @access  Private/Admin
 */
const getEmergenciesBySeverity = asyncHandler(async (req, res) => {
  const { severity } = req.params;
  
  const emergencies = await EmergencyEvent.getBySeverity(severity);

  res.status(200).json({
    success: true,
    count: emergencies.length,
    data: emergencies,
  });
});

/**
 * @desc    Add support note to emergency (Admin)
 * @route   POST /api/emergency/:eventId/note
 * @access  Private/Admin
 */
const addSupportNote = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { note } = req.body;

  if (!note) {
    throw new BadRequestError('Note is required');
  }

  const event = await EmergencyEvent.findById(eventId);
  if (!event) {
    throw new NotFoundError('Emergency event not found');
  }

  await event.addSupportNote(note, req.userId);

  res.status(200).json({
    success: true,
    message: 'Support note added',
    data: event,
  });
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Notify family members (simulated - replace with actual notification service)
 */
async function notifyFamilyMembers(emergencyEvent, worker) {
  for (const familyNotification of emergencyEvent.familyNotifications) {
    try {
      // Simulated notification - in production, integrate with:
      // - Email service (SendGrid, AWS SES)
      // - Push notification service (Firebase, OneSignal)
      // - SMS service (Twilio)
      
      logger.info(`📧 [SIMULATED] Notifying family member: ${familyNotification.email}`, {
        eventId: emergencyEvent._id,
        workerName: worker.fullName.firstName,
        emergencyType: emergencyEvent.emergencyType,
      });

      // Mark as notified
      await emergencyEvent.markFamilyNotified(familyNotification.familyMemberId);
      
      // Add timeline entry
      await emergencyEvent.addTimelineEntry(
        'family_notified',
        `Family member ${familyNotification.name} notified via email`
      );
    } catch (error) {
      logger.error(`Failed to notify family member ${familyNotification.email}`, error);
    }
  }
}

/**
 * Notify emergency contacts (simulated)
 */
async function notifyEmergencyContacts(emergencyEvent, contacts) {
  for (const contact of contacts) {
    try {
      logger.info(`📞 [SIMULATED] Notifying emergency contact: ${contact.name}`, {
        eventId: emergencyEvent._id,
        contactType: contact.type,
        phone: contact.emergencyHotline,
      });

      // Mark as notified
      await emergencyEvent.markContactNotified(contact.contactId);

      // Add timeline entry
      await emergencyEvent.addTimelineEntry(
        'contacts_notified',
        `Emergency contact ${contact.name} notified`
      );
    } catch (error) {
      logger.error(`Failed to notify emergency contact ${contact.name}`, error);
    }
  }
}

module.exports = {
  triggerSOS,
  getNearestContacts,
  getSOSHistory,
  getEmergencyEvent,
  updateEmergencyStatus,
  updateLocation,
  getContactsByCountry,
  getActiveEmergencies,
  getEmergenciesBySeverity,
  addSupportNote,
};
