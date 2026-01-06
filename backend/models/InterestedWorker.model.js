const mongoose = require('mongoose');

const interestedWorkerSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'rejected', 'hired'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure a user can only express interest in an agency once
interestedWorkerSchema.index({ agencyId: 1, userId: 1 }, { unique: true });
interestedWorkerSchema.index({ agencyId: 1, createdAt: -1 });

const InterestedWorker = mongoose.model('InterestedWorker', interestedWorkerSchema);

module.exports = InterestedWorker;
