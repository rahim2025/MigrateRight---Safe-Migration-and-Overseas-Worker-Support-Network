const mongoose = require('mongoose');

const trainingRecordSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  programName: {
    type: String,
    required: [true, 'Training program name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Training description is required'],
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  certificateUrl: {
    type: String,
    trim: true
  },
  scheduleDate: {
    type: Date
  },
  location: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
trainingRecordSchema.index({ agencyId: 1, createdAt: -1 });
trainingRecordSchema.index({ isActive: 1 });
trainingRecordSchema.index({ scheduleDate: 1 });

const TrainingRecord = mongoose.model('TrainingRecord', trainingRecordSchema);

module.exports = TrainingRecord;
