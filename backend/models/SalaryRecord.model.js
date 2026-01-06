const mongoose = require('mongoose');

const SalaryRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: String, // e.g., "January", "01"
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  promisedAmount: {
    type: Number,
    required: true,
  },
  promisedCurrency: {
    type: String,
    default: 'USD',
  },
  receivedAmount: {
    type: Number,
    required: true,
  },
  receivedCurrency: {
    type: String,
    default: 'USD',
  },
  receivedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'disputed'],
    default: 'pending',
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to prevent duplicate records for same month/year
SalaryRecordSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('SalaryRecord', SalaryRecordSchema);
