/**
 * Worker Profile Model
 * Mongoose schema for worker profile data
 * 
 * Relationships:
 * - userId: ObjectId reference to User model (One-to-One)
 * - agencyHistory[].agencyId: ObjectId reference to Agency model (Many-to-Many)
 * 
 * Features:
 * - Extends User model with worker-specific profile data
 * - Encrypted passport and NID numbers for security
 * - Profile completeness calculation
 * - Work experience tracking
 * - Document management
 * - Agency relationship history
 * - Virtual fields for age, total experience, etc.
 * 
 * Note: Authentication fields (email, password) are in User.js
 * This model stores additional worker profile information
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption helper functions for sensitive data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32';
const IV_LENGTH = 16;

/**
 * Encrypt sensitive data (passport, NID)
 * @param {String} text - Plain text to encrypt
 * @returns {String} Encrypted text
 */
const encrypt = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error.message);
    return text;
  }
};

/**
 * Decrypt sensitive data
 * @param {String} text - Encrypted text
 * @returns {String} Decrypted text
 */
const decrypt = (text) => {
  if (!text || !text.includes(':')) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return text;
  }
};

// ==================== SUB-SCHEMAS ====================

// Address sub-schema
const AddressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Postal code cannot exceed 20 characters'],
    },
  },
  { _id: false }
);

// Emergency Contact sub-schema
const EmergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Work Experience sub-schema
const WorkExperienceSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    employer: {
      type: String,
      required: [true, 'Employer name is required'],
      trim: true,
      maxlength: [200, 'Employer name cannot exceed 200 characters'],
    },
    employerCountry: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [3, 'Use ISO country code (e.g., SA, AE)'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    responsibilities: {
      type: String,
      trim: true,
      maxlength: [1000, 'Responsibilities cannot exceed 1000 characters'],
    },
    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    currency: {
      type: String,
      uppercase: true,
      maxlength: [3, 'Use currency code (e.g., USD, SAR)'],
    },
    reasonForLeaving: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
  },
  { _id: true }
);

// Virtual for experience duration
WorkExperienceSchema.virtual('duration').get(function () {
  if (!this.startDate) return 'Not specified';
  const end = this.isCurrent ? new Date() : this.endDate;
  if (!end) return 'Ongoing';

  const months = Math.floor((end - this.startDate) / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return 'Less than a month';
  if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  let result = `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) {
    result += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
  return result;
});

// Language sub-schema
const LanguageSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: [true, 'Language name is required'],
      trim: true,
      maxlength: [50, 'Language name cannot exceed 50 characters'],
    },
    proficiency: {
      type: String,
      enum: {
        values: ['basic', 'intermediate', 'fluent', 'native'],
        message: '{VALUE} is not a valid proficiency level',
      },
      required: [true, 'Proficiency level is required'],
    },
  },
  { _id: false }
);

// Education sub-schema
const EducationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters'],
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
      maxlength: [200, 'Institution cannot exceed 200 characters'],
    },
    year: {
      type: Number,
      min: [1950, 'Year must be after 1950'],
      max: [new Date().getFullYear() + 5, 'Year cannot be too far in the future'],
    },
    field: {
      type: String,
      trim: true,
      maxlength: [100, 'Field cannot exceed 100 characters'],
    },
  },
  { _id: true }
);

// Certification sub-schema
const CertificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
      maxlength: [200, 'Certification name cannot exceed 200 characters'],
    },
    issuedBy: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
      maxlength: [200, 'Issuing organization cannot exceed 200 characters'],
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    certificateUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

// Document sub-schema
const DocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['passport', 'nid', 'certificate', 'contract', 'medical', 'police_clearance', 'other'],
        message: '{VALUE} is not a valid document type',
      },
      required: [true, 'Document type is required'],
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
      maxlength: [200, 'Document name cannot exceed 200 characters'],
    },
    url: {
      type: String,
      required: [true, 'Document URL is required'],
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Agency History sub-schema
const AgencyHistorySchema = new mongoose.Schema(
  {
    agencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: [true, 'Agency ID is required'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    hasReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ==================== MAIN WORKER SCHEMA ====================

const WorkerSchema = new mongoose.Schema(
  {
    // Reference to User model for authentication
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },

    // ==================== Personal Information ====================
    personalInfo: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, 'Full name must be at least 3 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters'],
      },
      dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
      },
      gender: {
        type: String,
        enum: {
          values: ['male', 'female', 'other'],
          message: '{VALUE} is not a valid gender',
        },
      },
      nationality: {
        type: String,
        required: [true, 'Nationality is required'],
        uppercase: true,
        trim: true,
        maxlength: [3, 'Use ISO country code (e.g., BD, PH)'],
      },
      passportNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
      },
      nidNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
      },
      photo: {
        type: String,
        trim: true,
      },
    },

    // ==================== Contact Information ====================
    contactInfo: {
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      alternatePhone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      },
      address: AddressSchema,
      emergencyContact: EmergencyContactSchema,
    },

    // ==================== Employment History ====================
    workExperience: [WorkExperienceSchema],

    // ==================== Skills & Qualifications ====================
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    languages: [LanguageSchema],

    education: [EducationSchema],

    certifications: [CertificationSchema],

    // ==================== Migration Preferences ====================
    preferredDestinations: [
      {
        type: String,
        uppercase: true,
        trim: true,
        maxlength: [3, 'Use ISO country code'],
      },
    ],

    preferredJobSectors: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    minimumSalaryExpectation: {
      type: Number,
      min: [0, 'Salary expectation cannot be negative'],
    },

    salaryCurrency: {
      type: String,
      uppercase: true,
      default: 'USD',
      maxlength: [3, 'Use currency code'],
    },

    willingToRelocate: {
      type: Boolean,
      default: true,
    },

    // ==================== Documents Storage ====================
    documents: [DocumentSchema],

    // ==================== Agency Relationships ====================
    agencyHistory: [AgencyHistorySchema],

    // ==================== Profile Metadata ====================
    profileCompleteness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    profileStatus: {
      type: String,
      enum: {
        values: ['incomplete', 'complete', 'verified'],
        message: '{VALUE} is not a valid profile status',
      },
      default: 'incomplete',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    isProfilePublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================

// Index for passport and NID (unique, sparse)
WorkerSchema.index({ 'personalInfo.passportNumber': 1 }, { unique: true, sparse: true });
WorkerSchema.index({ 'personalInfo.nidNumber': 1 }, { unique: true, sparse: true });

// Index for skills (for job matching)
WorkerSchema.index({ skills: 1 });

// Index for preferred destinations (for recommendations)
WorkerSchema.index({ preferredDestinations: 1 });

// Index for profile status and verification
WorkerSchema.index({ profileStatus: 1, isVerified: 1 });

// Index for agency history
WorkerSchema.index({ 'agencyHistory.agencyId': 1, 'agencyHistory.status': 1 });

// Text index for searching workers
WorkerSchema.index(
  {
    'personalInfo.fullName': 'text',
    skills: 'text',
    preferredJobSectors: 'text',
  },
  {
    weights: {
      'personalInfo.fullName': 10,
      skills: 5,
      preferredJobSectors: 3,
    },
    name: 'WorkerTextIndex',
  }
);

// ==================== VIRTUAL FIELDS ====================

/**
 * Virtual: age
 * Calculate age from dateOfBirth
 */
WorkerSchema.virtual('age').get(function () {
  if (!this.personalInfo || !this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

/**
 * Virtual: totalExperience
 * Calculate total years from workExperience array
 */
WorkerSchema.virtual('totalExperience').get(function () {
  if (!this.workExperience || this.workExperience.length === 0) return 0;

  let totalMonths = 0;

  this.workExperience.forEach((exp) => {
    if (exp.startDate) {
      const end = exp.isCurrent ? new Date() : exp.endDate;
      if (end) {
        const months = Math.floor((end - exp.startDate) / (1000 * 60 * 60 * 24 * 30));
        totalMonths += Math.max(0, months);
      }
    }
  });

  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
});

/**
 * Virtual: hasActiveAgency
 * Check if any agencyHistory has status 'active'
 */
WorkerSchema.virtual('hasActiveAgency').get(function () {
  if (!this.agencyHistory || this.agencyHistory.length === 0) return false;
  return this.agencyHistory.some((agency) => agency.status === 'active');
});

/**
 * Virtual: activeAgency
 * Get the current active agency
 */
WorkerSchema.virtual('activeAgency').get(function () {
  if (!this.agencyHistory || this.agencyHistory.length === 0) return null;
  return this.agencyHistory.find((agency) => agency.status === 'active') || null;
});

/**
 * Virtual: fullProfile
 * Returns complete profile indicator
 */
WorkerSchema.virtual('fullProfile').get(function () {
  return {
    hasPersonalInfo: !!(this.personalInfo && this.personalInfo.fullName),
    hasContactInfo: !!(this.contactInfo && this.contactInfo.phone),
    hasEmergencyContact: !!(this.contactInfo && this.contactInfo.emergencyContact && this.contactInfo.emergencyContact.name),
    hasWorkExperience: this.workExperience && this.workExperience.length > 0,
    hasSkills: this.skills && this.skills.length > 0,
    hasDocuments: this.documents && this.documents.length > 0,
    completeness: this.profileCompleteness,
  };
});

// ==================== INSTANCE METHODS ====================

/**
 * Calculate profile completeness (0-100)
 * @returns {Number} Completeness percentage
 */
WorkerSchema.methods.calculateProfileCompleteness = function () {
  const requiredFields = [
    { field: this.personalInfo?.fullName, weight: 10 },
    { field: this.personalInfo?.dateOfBirth, weight: 5 },
    { field: this.personalInfo?.nationality, weight: 5 },
    { field: this.personalInfo?.gender, weight: 3 },
    { field: this.personalInfo?.photo, weight: 5 },
    { field: this.contactInfo?.phone, weight: 10 },
    { field: this.contactInfo?.email, weight: 10 },
    { field: this.contactInfo?.address?.city, weight: 5 },
    { field: this.contactInfo?.emergencyContact?.name, weight: 10 },
    { field: this.contactInfo?.emergencyContact?.phone, weight: 10 },
    { field: this.workExperience?.length > 0, weight: 10 },
    { field: this.skills?.length > 0, weight: 7 },
    { field: this.documents?.length > 0, weight: 5 },
    { field: this.preferredDestinations?.length > 0, weight: 3 },
    { field: this.languages?.length > 0, weight: 2 },
  ];

  const totalWeight = requiredFields.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = requiredFields.reduce((sum, f) => (f.field ? sum + f.weight : sum), 0);

  return Math.round((completedWeight / totalWeight) * 100);
};

/**
 * Add work experience
 * @param {Object} experienceObj - Work experience object
 * @returns {Promise<Worker>} Updated worker document
 */
WorkerSchema.methods.addWorkExperience = async function (experienceObj) {
  if (!experienceObj.jobTitle || !experienceObj.employer) {
    throw new Error('Job title and employer are required');
  }

  this.workExperience.push(experienceObj);
  return this.save();
};

/**
 * Add document
 * @param {Object} documentObj - Document object
 * @returns {Promise<Worker>} Updated worker document
 */
WorkerSchema.methods.addDocument = async function (documentObj) {
  if (!documentObj.type || !documentObj.url || !documentObj.name) {
    throw new Error('Document type, name, and URL are required');
  }

  this.documents.push({
    type: documentObj.type,
    name: documentObj.name,
    url: documentObj.url,
    uploadedAt: new Date(),
    expiryDate: documentObj.expiryDate || null,
    isVerified: false,
  });

  return this.save();
};

/**
 * Update emergency contact
 * @param {Object} contactObj - Emergency contact object
 * @returns {Promise<Worker>} Updated worker document
 */
WorkerSchema.methods.updateEmergencyContact = async function (contactObj) {
  if (!contactObj.name || !contactObj.relationship || !contactObj.phone) {
    throw new Error('Name, relationship, and phone are required for emergency contact');
  }

  this.contactInfo.emergencyContact = {
    name: contactObj.name,
    relationship: contactObj.relationship,
    phone: contactObj.phone,
    alternatePhone: contactObj.alternatePhone || null,
  };

  return this.save();
};

/**
 * Mark agency as reviewed
 * @param {ObjectId} agencyId - Agency ID
 * @returns {Promise<Worker>} Updated worker document
 */
WorkerSchema.methods.markAgencyAsReviewed = async function (agencyId) {
  const agencyRecord = this.agencyHistory.find(
    (ah) => ah.agencyId.toString() === agencyId.toString()
  );

  if (agencyRecord) {
    agencyRecord.hasReviewed = true;
    return this.save();
  }

  throw new Error('Agency not found in worker history');
};

/**
 * Add agency to history
 * @param {ObjectId} agencyId - Agency ID
 * @returns {Promise<Worker>} Updated worker document
 */
WorkerSchema.methods.addAgencyToHistory = async function (agencyId) {
  // Check if already exists
  const existing = this.agencyHistory.find(
    (ah) => ah.agencyId.toString() === agencyId.toString() && ah.status === 'active'
  );

  if (existing) {
    throw new Error('Already associated with this agency');
  }

  this.agencyHistory.push({
    agencyId,
    startDate: new Date(),
    status: 'active',
    hasReviewed: false,
  });

  return this.save();
};

/**
 * Get masked passport number (for API responses)
 * @returns {String} Masked passport number
 */
WorkerSchema.methods.getMaskedPassport = function () {
  if (!this.personalInfo?.passportNumber) return null;
  const decrypted = decrypt(this.personalInfo.passportNumber);
  if (decrypted.length <= 4) return '****';
  return '****' + decrypted.slice(-4);
};

/**
 * Get masked NID number (for API responses)
 * @returns {String} Masked NID number
 */
WorkerSchema.methods.getMaskedNID = function () {
  if (!this.personalInfo?.nidNumber) return null;
  const decrypted = decrypt(this.personalInfo.nidNumber);
  if (decrypted.length <= 4) return '****';
  return '****' + decrypted.slice(-4);
};

// ==================== STATIC METHODS ====================

/**
 * Find workers by skills
 * @param {Array} skillsArray - Array of skill strings
 * @param {Object} options - Query options
 * @returns {Query} Mongoose query
 */
WorkerSchema.statics.findBySkills = function (skillsArray, options = {}) {
  const normalizedSkills = skillsArray.map((s) => s.toLowerCase().trim());
  return this.find({
    skills: { $in: normalizedSkills },
    profileStatus: { $ne: 'incomplete' },
  })
    .populate('userId', 'email fullName phoneNumber')
    .sort(options.sort || { profileCompleteness: -1 })
    .limit(options.limit || 20);
};

/**
 * Find workers by destination
 * @param {String} countryCode - ISO country code
 * @param {Object} options - Query options
 * @returns {Query} Mongoose query
 */
WorkerSchema.statics.findByDestination = function (countryCode, options = {}) {
  return this.find({
    preferredDestinations: countryCode.toUpperCase(),
    profileStatus: { $ne: 'incomplete' },
  })
    .populate('userId', 'email fullName phoneNumber')
    .sort(options.sort || { profileCompleteness: -1 })
    .limit(options.limit || 20);
};

/**
 * Get verified workers
 * @param {Object} options - Query options
 * @returns {Query} Mongoose query
 */
WorkerSchema.statics.getVerifiedWorkers = function (options = {}) {
  return this.find({
    isVerified: true,
    profileStatus: 'verified',
  })
    .populate('userId', 'email fullName phoneNumber')
    .sort(options.sort || { updatedAt: -1 })
    .limit(options.limit || 50);
};

/**
 * Get workers by job sector
 * @param {String} sector - Job sector
 * @param {Object} options - Query options
 * @returns {Query} Mongoose query
 */
WorkerSchema.statics.findByJobSector = function (sector, options = {}) {
  return this.find({
    preferredJobSectors: sector.toLowerCase().trim(),
    profileStatus: { $ne: 'incomplete' },
  })
    .populate('userId', 'email fullName phoneNumber')
    .sort(options.sort || { profileCompleteness: -1 })
    .limit(options.limit || 20);
};

/**
 * Get worker statistics
 * @returns {Promise<Object>} Statistics object
 */
WorkerSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalWorkers: { $sum: 1 },
        verifiedCount: {
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] },
        },
        completeProfiles: {
          $sum: { $cond: [{ $eq: ['$profileStatus', 'complete'] }, 1, 0] },
        },
        incompleteProfiles: {
          $sum: { $cond: [{ $eq: ['$profileStatus', 'incomplete'] }, 1, 0] },
        },
        avgCompleteness: { $avg: '$profileCompleteness' },
      },
    },
  ]);

  // Get top destinations
  const topDestinations = await this.aggregate([
    { $unwind: '$preferredDestinations' },
    {
      $group: {
        _id: '$preferredDestinations',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Get top skills
  const topSkills = await this.aggregate([
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return {
    ...(stats[0] || {
      totalWorkers: 0,
      verifiedCount: 0,
      completeProfiles: 0,
      incompleteProfiles: 0,
      avgCompleteness: 0,
    }),
    topDestinations: topDestinations.map((d) => ({ country: d._id, count: d.count })),
    topSkills: topSkills.map((s) => ({ skill: s._id, count: s.count })),
  };
};

// ==================== MIDDLEWARE ====================

/**
 * Pre-save middleware
 * - Encrypt passport and NID numbers
 * - Calculate profile completeness
 * - Update profile status
 * - Validate phone numbers
 * - Validate emergency contact for complete profiles
 * - Normalize skills to lowercase
 */
WorkerSchema.pre('save', async function (next) {
  try {
    // Encrypt passport number if modified
    if (this.isModified('personalInfo.passportNumber') && this.personalInfo?.passportNumber) {
      // Only encrypt if not already encrypted (doesn't contain ':')
      if (!this.personalInfo.passportNumber.includes(':')) {
        this.personalInfo.passportNumber = encrypt(this.personalInfo.passportNumber);
      }
    }

    // Encrypt NID number if modified
    if (this.isModified('personalInfo.nidNumber') && this.personalInfo?.nidNumber) {
      if (!this.personalInfo.nidNumber.includes(':')) {
        this.personalInfo.nidNumber = encrypt(this.personalInfo.nidNumber);
      }
    }

    // Normalize skills to lowercase
    if (this.isModified('skills') && this.skills) {
      this.skills = this.skills.map((skill) => skill.toLowerCase().trim());
    }

    // Normalize preferred destinations to uppercase
    if (this.isModified('preferredDestinations') && this.preferredDestinations) {
      this.preferredDestinations = this.preferredDestinations.map((dest) =>
        dest.toUpperCase().trim()
      );
    }

    // Calculate profile completeness
    this.profileCompleteness = this.calculateProfileCompleteness();

    // Update profile status based on completeness
    if (this.profileCompleteness >= 80 && this.contactInfo?.emergencyContact?.name) {
      if (this.isVerified) {
        this.profileStatus = 'verified';
      } else {
        this.profileStatus = 'complete';
      }
    } else {
      this.profileStatus = 'incomplete';
    }

    // Validate emergency contact if profile is marked as complete
    if (this.profileStatus === 'complete' || this.profileStatus === 'verified') {
      if (
        !this.contactInfo?.emergencyContact?.name ||
        !this.contactInfo?.emergencyContact?.phone ||
        !this.contactInfo?.emergencyContact?.relationship
      ) {
        const error = new Error('Emergency contact is required for complete profiles');
        error.name = 'ValidationError';
        return next(error);
      }
    }

    // Update lastActive
    this.lastActive = new Date();

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-find middleware
 * Exclude sensitive fields by default in public queries
 */
WorkerSchema.pre(/^find/, function (next) {
  // Don't modify if explicitly selecting fields
  if (this.getQuery()._includeSecure) {
    delete this.getQuery()._includeSecure;
    return next();
  }
  next();
});

/**
 * Transform output to hide sensitive data
 */
WorkerSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();

  // Mask sensitive data
  if (obj.personalInfo?.passportNumber) {
    obj.personalInfo.passportNumber = this.getMaskedPassport();
  }
  if (obj.personalInfo?.nidNumber) {
    obj.personalInfo.nidNumber = this.getMaskedNID();
  }

  return obj;
};

module.exports = mongoose.model('Worker', WorkerSchema);
