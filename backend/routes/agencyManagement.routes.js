const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyManagement.controller');
const { authenticate } = require('../middleware/auth.middleware');

// ==================== Agency Details ====================
router.post('/details', authenticate, agencyController.registerAgencyDetails);
router.get('/details', authenticate, agencyController.getAgencyDetails);
router.put('/details', authenticate, agencyController.updateAgencyDetails);

// ==================== Success Stories ====================
router.post('/success-stories', authenticate, agencyController.createSuccessStory);
router.get('/success-stories', authenticate, agencyController.getSuccessStories);
router.get('/success-stories/:agencyId', agencyController.getSuccessStories);
router.get('/success-stories-by-agency/:agencyModelId', agencyController.getSuccessStoriesByAgencyModelId);
router.get('/success-story/:id', agencyController.getSuccessStoryById);
router.put('/success-stories/:id', authenticate, agencyController.updateSuccessStory);
router.delete('/success-stories/:id', authenticate, agencyController.deleteSuccessStory);

// ==================== Fee Structure ====================
router.post('/fee-structures', authenticate, agencyController.createFeeStructure);
router.get('/fee-structures', authenticate, agencyController.getFeeStructures);
router.get('/fee-structures/:agencyId', agencyController.getFeeStructures);
router.get('/fee-structures-by-agency/:agencyModelId', agencyController.getFeeStructuresByAgencyModelId);
router.get('/fee-structure/:id', agencyController.getFeeStructureById);
router.put('/fee-structures/:id', authenticate, agencyController.updateFeeStructure);
router.delete('/fee-structures/:id', authenticate, agencyController.deleteFeeStructure);

// ==================== Training Records ====================
router.post('/training-records', authenticate, agencyController.createTrainingRecord);
router.get('/training-records', authenticate, agencyController.getTrainingRecords);
router.get('/training-records/:agencyId', agencyController.getTrainingRecords);
router.get('/training-records-by-agency/:agencyModelId', agencyController.getTrainingRecordsByAgencyModelId);
router.get('/training-record/:id', agencyController.getTrainingRecordById);
router.put('/training-records/:id', authenticate, agencyController.updateTrainingRecord);
router.delete('/training-records/:id', authenticate, agencyController.deleteTrainingRecord);

// ==================== Interested Workers ====================
router.post('/interested', authenticate, agencyController.expressInterest);
router.get('/interested-workers', authenticate, agencyController.getInterestedWorkers);
router.put('/interested-workers/:id', authenticate, agencyController.updateInterestedWorkerStatus);

// ==================== Public Agency Listing ====================
router.get('/list', agencyController.getAllAgencies);
router.get('/profile/:id', agencyController.getAgencyProfile);

module.exports = router;
