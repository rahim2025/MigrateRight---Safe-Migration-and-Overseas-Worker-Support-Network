const mongoose = require('mongoose');

const WorkerAgencyLinkSchema = new mongoose.Schema(
  {
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    status: { type: String, enum: ['active', 'completed', 'terminated'], default: 'completed' },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WorkerAgencyLinkSchema.index({ agency: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model('WorkerAgencyLink', WorkerAgencyLinkSchema);
