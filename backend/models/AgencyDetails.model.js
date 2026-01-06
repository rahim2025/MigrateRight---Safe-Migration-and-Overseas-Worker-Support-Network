const mongoose = require('mongoose');

const agencyDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  tradeLicenseNumber: {
    type: String,
    required: [true, 'Trade license number is required'],
    unique: true,
    trim: true
  },
  tinNumber: {
    type: String,
    required: [true, 'TIN number is required'],
    unique: true,
    trim: true
  },
  incomeLevel: {
    type: String,
    required: [true, 'Income level is required'],
    trim: true
  },
  businessAddress: {
    type: String,
    required: [true, 'Business address is required'],
    trim: true
  },
  contactPersonName: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster lookups
agencyDetailsSchema.index({ userId: 1 });
agencyDetailsSchema.index({ companyName: 1 });

const AgencyDetails = mongoose.model('AgencyDetails', agencyDetailsSchema);

module.exports = AgencyDetails;
