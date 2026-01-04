const crypto = require('crypto');
const Agency = require('../../models/Agency.model');
const User = require('../../models/User');
const WorkerAgencyLink = require('../models/WorkerAgencyLink');
const AgencyComplaint = require('../models/AgencyComplaint');

exports.createAgencyComplaint = async (req, res, next) => {
  try {
    const { id: agencyId } = req.params;
    const { workerId, complaintType, description, evidence = [], severity } = req.body || {};

    if (!workerId) return res.status(400).json({ message: 'workerId is required' });
    if (!complaintType || !['fee_exploitation', 'false_promises', 'poor_conditions', 'other'].includes(complaintType)) {
      return res.status(400).json({ message: 'Invalid complaintType' });
    }
    const desc = (description || '').trim();
    if (desc.length < 500 || desc.length > 2000) {
      return res.status(400).json({ message: 'description must be between 500 and 2000 characters' });
    }
    if (severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
      return res.status(400).json({ message: 'Invalid severity' });
    }

    const [agency, user] = await Promise.all([
      Agency.findById(agencyId).select('_id'),
      User.findById(workerId).select('_id'),
    ]);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });
    if (!user) return res.status(404).json({ message: 'User/Worker not found' });

    const relationship = await WorkerAgencyLink.findOne({ agency: agencyId, worker: workerId }).lean();
    if (!relationship) return res.status(403).json({ message: 'Worker has not used this agency' });

    const complaintId = `C-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const complaint = await AgencyComplaint.create({
      complaintId,
      agency: agencyId,
      worker: workerId,
      complaintType,
      description: desc,
      evidence: Array.isArray(evidence) ? evidence : [],
      severity: severity || 'medium',
    });

    return res.status(201).json({ complaintId: complaint.complaintId, status: complaint.status, createdAt: complaint.createdAt });
  } catch (err) {
    return next(err);
  }
};
