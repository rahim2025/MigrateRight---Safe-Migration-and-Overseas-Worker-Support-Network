const express = require('express');
const { createAgencyComplaint } = require('../controllers/agencyComplaint.controller');

const router = express.Router();

/**
 * @swagger
 * /api/agencies/{id}/complaints:
 *   post:
 *     summary: File a complaint against an agency
 *     tags: [Agencies]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:id/complaints', createAgencyComplaint);

module.exports = router;
