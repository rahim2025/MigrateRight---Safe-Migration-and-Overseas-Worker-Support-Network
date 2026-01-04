const mongoose = require('mongoose');

const AgencyReviewSchema = new mongoose.Schema(
  {
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: { type: String, trim: true, maxlength: 2000 },
    anonymize: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AgencyReviewSchema.index({ agency: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model('AgencyReview', AgencyReviewSchema);
