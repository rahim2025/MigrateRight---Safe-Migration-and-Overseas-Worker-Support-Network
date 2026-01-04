const express = require('express');
const {
  createAgencyReview,
  getAgencyReviews,
} = require('../controllers/agencyReview.controller');
const verifyAgencyReview = require('../middlewares/verifyAgencyReview');

const router = express.Router();

/**
 * @swagger
 * /api/agencies/{id}/reviews:
 *   post:
 *     summary: Submit review for an agency
 *     tags: [Agencies]
 *     security: [{ bearerAuth: [] }]
 *   get:
 *     summary: List reviews for an agency
 *     tags: [Agencies]
 */
router.post('/:id/reviews', verifyAgencyReview, createAgencyReview);
router.get('/:id/reviews', getAgencyReviews);

module.exports = router;
