const mongoose = require('mongoose');

const WorkerProfileSchema = new mongoose.Schema(
  {
    workerId: { type: String, unique: true, index: true, required: true },
    personalInfo: {
      fullName: { type: String, required: true, trim: true },
      dateOfBirth: { type: Date, required: true },
      gender: { type: String, enum: ['male', 'female', 'other'], required: true },
      nationality: { type: String, required: true, trim: true },
      passportNumberHash: { type: String },
    },
    contactInfo: {
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      emergencyContact: { type: Object },
      address: { type: String, trim: true },
    },
    workExperience: [
      {
        jobTitle: String,
        employer: String,
        duration: String,
        country: String,
      },
    ],
    skills: [{ type: String, trim: true }],
    preferredDestinations: [{ type: String, trim: true }],
    documents: [{ type: String, trim: true }],
    lastModified: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkerProfile', WorkerProfileSchema);
