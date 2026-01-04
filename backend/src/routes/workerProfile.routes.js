const express = require('express');
const { createWorkerProfile, updateWorkerProfile, getWorkerProfile } = require('../controllers/workerProfile.controller');
const authWorker = require('../middlewares/authWorker');

const router = express.Router();

/**
 * @swagger
 * /api/workers/profile:
 *   post:
 *     summary: Create worker profile
 *     tags: [Workers]
 *   patch:
 *     summary: Update worker profile
 *     security: [{ bearerAuth: [] }]
 *     tags: [Workers]
 *   get:
 *     summary: Get authenticated worker profile
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: includePrivate
 *         schema: { type: boolean }
 *     tags: [Workers]
 */

router.post('/profile', createWorkerProfile);
router.patch('/profile', authWorker, updateWorkerProfile);
router.get('/profile', authWorker, getWorkerProfile);

module.exports = router;
