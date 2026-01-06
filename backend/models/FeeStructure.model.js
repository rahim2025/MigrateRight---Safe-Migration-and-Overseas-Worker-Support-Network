const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  country: {
    type: String,
    required: [true, 'Destination country is required'],
    trim: true
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'BDT',
    trim: true
  },
  isLegal: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
feeStructureSchema.index({ agencyId: 1, country: 1 });
feeStructureSchema.index({ isActive: 1 });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

module.exports = FeeStructure;
