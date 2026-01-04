const crypto = require('crypto');
const WorkerProfile = require('../models/WorkerProfile');
const mongoose = require('mongoose');
const WorkerAgencyLink = require('../models/WorkerAgencyLink');
const AgencyReview = require('../models/AgencyReview');

const generateWorkerId = () => `W-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
const hashPassport = (value) => (value ? crypto.createHash('sha256').update(value.trim()).digest('hex') : undefined);

exports.createWorkerProfile = async (req, res, next) => {
  try {
    const { personalInfo = {}, contactInfo = {}, workExperience = [], skills = [], preferredDestinations = [] } = req.body || {};
    const { fullName, dateOfBirth, gender, nationality, passportNumber } = personalInfo;
    const { phone, email, emergencyContact } = contactInfo;

    if (!fullName || !dateOfBirth || !gender || !nationality) {
      return res.status(400).json({ message: 'fullName, dateOfBirth, gender, nationality are required' });
    }
    if (!phone || !email) {
      return res.status(400).json({ message: 'phone and email are required' });
    }
    if (!['male', 'female', 'other'].includes(String(gender).toLowerCase())) {
      return res.status(400).json({ message: 'Invalid gender' });
    }

    const workerId = generateWorkerId();
    const passportNumberHash = hashPassport(passportNumber);

    const created = await WorkerProfile.create({
      workerId,
      personalInfo: { fullName, dateOfBirth, gender: String(gender).toLowerCase(), nationality, passportNumberHash },
      contactInfo: { phone, email, emergencyContact },
      workExperience,
      skills,
      preferredDestinations,
    });

    const profile = created.toObject();
    delete profile.personalInfo.passportNumberHash;

    return res.status(201).json(profile);
  } catch (err) {
    return next(err);
  }
};

exports.updateWorkerProfile = async (req, res, next) => {
  try {
    const workerIdentifier = req.user?.workerId || req.user?.id || req.user?._id;
    if (!workerIdentifier) return res.status(401).json({ message: 'Authentication required' });

    const allowedFields = ['contactInfo', 'workExperience', 'skills', 'preferredDestinations', 'documents'];
    const payloadKeys = Object.keys(req.body || {});
    if (!payloadKeys.length) return res.status(400).json({ message: 'No fields to update' });

    const invalid = payloadKeys.filter((k) => !allowedFields.includes(k));
    if (invalid.length) return res.status(400).json({ message: `Invalid fields: ${invalid.join(', ')}` });

    let profile = await WorkerProfile.findOne({ workerId: workerIdentifier });
    if (!profile && mongoose.Types.ObjectId.isValid(workerIdentifier)) {
      profile = await WorkerProfile.findById(workerIdentifier);
    }
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (req.body.contactInfo) {
      const { phone, email, address, emergencyContact } = req.body.contactInfo;
      profile.contactInfo = {
        ...profile.contactInfo.toObject?.() || profile.contactInfo,
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(address ? { address } : {}),
        ...(emergencyContact ? { emergencyContact } : {}),
      };
    }

    if (Array.isArray(req.body.workExperience)) profile.workExperience = req.body.workExperience;
    if (Array.isArray(req.body.skills)) {
      profile.skills = Array.from(new Set(req.body.skills.map((s) => String(s).trim()).filter(Boolean)));
    }
    if (Array.isArray(req.body.preferredDestinations)) {
      profile.preferredDestinations = req.body.preferredDestinations.filter(Boolean);
    }
    if (Array.isArray(req.body.documents) && req.body.documents.length) {
      const existingDocs = profile.documents || [];
      const incoming = req.body.documents.map((d) => String(d).trim()).filter(Boolean);
      profile.documents = Array.from(new Set([...existingDocs, ...incoming]));
    }

    profile.lastModified = new Date();
    await profile.save();

    const clean = profile.toObject();
    if (clean.personalInfo) delete clean.personalInfo.passportNumberHash;

    console.info('Worker profile updated', { workerId: workerIdentifier, updatedFields: payloadKeys, at: profile.lastModified });

    return res.json(clean);
  } catch (err) {
    return next(err);
  }
};

exports.getWorkerProfile = async (req, res, next) => {
  try {
    const workerIdentifier = req.user?.workerId || req.user?.id || req.user?._id;
    if (!workerIdentifier) return res.status(401).json({ message: 'Authentication required' });

    const includePrivate = String(req.query.includePrivate).toLowerCase() === 'true';

    let profile = await WorkerProfile.findOne({ workerId: workerIdentifier });
    if (!profile && mongoose.Types.ObjectId.isValid(workerIdentifier)) {
      profile = await WorkerProfile.findById(workerIdentifier);
    }
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const workerObjectId = mongoose.Types.ObjectId.isValid(workerIdentifier)
      ? new mongoose.Types.ObjectId(workerIdentifier)
      : null;

    const [agencyLinks, reviewsGiven] = await Promise.all([
      workerObjectId
        ? WorkerAgencyLink.find({ worker: workerObjectId })
            .populate('agency', 'name')
            .lean()
        : [],
      workerObjectId ? AgencyReview.countDocuments({ worker: workerObjectId }) : 0,
    ]);

    const clean = profile.toObject();
    if (clean.personalInfo) delete clean.personalInfo.passportNumberHash;
    if (!includePrivate && clean.personalInfo) {
      // no additional sensitive fields to strip beyond passport hash
    }

    clean.agencyHistory = (agencyLinks || []).map((link) => ({
      agencyId: link.agency?._id || link.agency,
      agencyName: link.agency?.name,
      status: link.status,
      usedAt: link.usedAt,
    }));
    clean.reviewsGiven = reviewsGiven;
    clean.accountCreatedDate = profile.createdAt;

    const completenessFields = [
      clean.personalInfo?.fullName,
      clean.personalInfo?.dateOfBirth,
      clean.personalInfo?.gender,
      clean.personalInfo?.nationality,
      clean.contactInfo?.phone,
      clean.contactInfo?.email,
      (clean.skills || []).length > 0,
      (clean.preferredDestinations || []).length > 0,
      (clean.workExperience || []).length > 0,
    ];
    const filledCount = completenessFields.filter(Boolean).length;
    clean.profileCompleteness = Math.round((filledCount / completenessFields.length) * 100);

    return res.json(clean);
  } catch (err) {
    return next(err);
  }
};
