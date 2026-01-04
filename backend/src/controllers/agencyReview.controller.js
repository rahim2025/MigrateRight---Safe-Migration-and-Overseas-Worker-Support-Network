const AgencyReview = require('../models/AgencyReview');
const WorkerAgencyLink = require('../models/WorkerAgencyLink');

exports.createAgencyReview = async (req, res, next) => {
  try {
    const { id: agencyId } = req.params;
    const { rating, comment, workerId, anonymize = false } = req.body || {};

    if (!workerId) return res.status(400).json({ message: 'workerId is required' });
    if (!rating || Number.isNaN(Number(rating))) return res.status(400).json({ message: 'rating is required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: 'rating must be between 1 and 5' });

    const relationship = await WorkerAgencyLink.exists({ agency: agencyId, worker: workerId });
    if (!relationship) return res.status(403).json({ message: 'Worker has no verified relationship with this agency' });

    const alreadyReviewed = await AgencyReview.exists({ agency: agencyId, worker: workerId });
    if (alreadyReviewed) return res.status(409).json({ message: 'Worker already reviewed this agency' });

    const review = await AgencyReview.create({
      agency: agencyId,
      worker: workerId,
      rating,
      comment,
      anonymize,
    });

    return res.status(201).json(review);
  } catch (err) {
    return next(err);
  }
};

exports.getAgencyReviews = async (req, res, next) => {
  try {
    const { id: agencyId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [reviews, total, averageAgg] = await Promise.all([
      AgencyReview.find({ agency: agencyId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: 'worker', select: 'name' }),
      AgencyReview.countDocuments({ agency: agencyId }),
      AgencyReview.aggregate([
        { $match: { agency: new AgencyReview.db.Types.ObjectId(agencyId) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    const averageRating = averageAgg[0]?.avgRating || 0;

    const data = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      worker: review.anonymize
        ? { name: 'Anonymous Worker' }
        : review.worker
          ? { _id: review.worker._id, name: review.worker.name }
          : { name: 'Anonymous Worker' },
    }));

    return res.json({
      data,
      meta: {
        page,
        limit,
        total,
        averageRating: Number(averageRating.toFixed(2)),
      },
    });
  } catch (err) {
    return next(err);
  }
};
