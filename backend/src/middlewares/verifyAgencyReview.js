const mongoose = require('mongoose');
const Agency = require('../../models/Agency.model');
const User = require('../../models/User');
const AgencyReview = require('../models/AgencyReview');
const WorkerAgencyLink = require('../models/WorkerAgencyLink');

module.exports = async function verifyAgencyReview(req, res, next) {
  try {
    const { id: agencyId } = req.params;
    const { rating, comment, workerId: workerIdFromBody } = req.body || {};

    const authWorkerId = req.user?.id || req.user?._id;
    if (!authWorkerId) return res.status(401).json({ message: 'Authentication required' });

    const workerId = authWorkerId.toString();
    if (workerIdFromBody && workerIdFromBody.toString() !== workerId) {
      return res.status(403).json({ message: 'Worker mismatch with authenticated user' });
    }

    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: 'Invalid agency id' });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const trimmedComment = (comment || '').trim();
    if (trimmedComment.length < 10 || trimmedComment.length > 500) {
      return res.status(400).json({ message: 'Comment must be between 10 and 500 characters' });
    }

    const agency = await Agency.findById(agencyId).select('_id');
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    const user = await User.findById(workerId).select('_id');
    if (!user) return res.status(404).json({ message: 'User/Worker not found' });

    const relationship = await WorkerAgencyLink.findOne({ agency: agencyId, worker: workerId }).lean();
    if (!relationship) return res.status(403).json({ message: 'No verified relationship with this agency' });
    if (relationship.status !== 'completed') {
      return res.status(403).json({ message: 'Service must be completed before reviewing' });
    }

    const alreadyReviewed = await AgencyReview.exists({ agency: agencyId, worker: workerId });
    if (alreadyReviewed) return res.status(409).json({ message: 'Worker already reviewed this agency' });

    req.body.workerId = workerId;
    req.body.rating = parsedRating;
    req.body.comment = trimmedComment;

    return next();
  } catch (err) {
    return next(err);
  }
};
