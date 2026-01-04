const mongoose = require('mongoose');

const AgencyComplaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    complaintType: {
      type: String,
      required: true,
      enum: ['fee_exploitation', 'false_promises', 'poor_conditions', 'other'],
    },
    description: { type: String, required: true, minlength: 500, maxlength: 2000, trim: true },
    evidence: [{ type: String, trim: true }],
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in_review', 'resolved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AgencyComplaint', AgencyComplaintSchema);
