const mongoose = require('mongoose');

const recruitmentAgencySchema = new mongoose.Schema({
  // ==================== Basic Information ====================
  agencyName: {
    type: String,
    required: [true, 'Agency name is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Agency name must be at least 3 characters']
  },
  
  agencyNameBengali: {
    type: String,
    trim: true
  },
  
  tagline: {
    type: String,
    maxlength: [200, 'Tagline cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Agency description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  logo: {
    type: String,
    default: null
  },
  
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid URL']
  },
  
  // ==================== Registration & Licensing ====================
  registration: {
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true
    },
    issuingAuthority: {
      type: String,
      default: 'Bureau of Manpower, Employment and Training (BMET)',
      required: true
    },
    issueDate: {
      type: Date,
      required: [true, 'License issue date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'License expiry date is required']
    },
    licenseDocument: {
      type: String // URL to document storage
    },
    registrationType: {
      type: String,
      enum: ['government_registered', 'private_registered', 'international_partner'],
      required: true
    }
  },
  
  // ==================== Compliance & Verification ====================
  compliance: {
    status: {
      type: String,
      enum: ['fully_compliant', 'partially_compliant', 'non_compliant', 'under_review'],
      default: 'under_review'
    },
    lastAuditDate: Date,
    nextAuditDate: Date,
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    violations: [{
      violationType: {
        type: String,
        enum: ['illegal_fee', 'document_fraud', 'worker_abuse', 'contract_violation', 'other']
      },
      description: String,
      reportedDate: {
        type: Date,
        default: Date.now
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      status: {
        type: String,
        enum: ['reported', 'investigating', 'resolved', 'dismissed'],
        default: 'reported'
      },
      resolvedDate: Date
    }],
    certifications: [{
      certificationType: String,
      issuingBody: String,
      issueDate: Date,
      expiryDate: Date,
      certificateUrl: String
    }]
  },
  
  // ==================== Contact Information ====================
  contactInfo: {
    primaryEmail: {
      type: String,
      required: [true, 'Primary email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    secondaryEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    phoneNumbers: [{
      type: {
        type: String,
        enum: ['office', 'mobile', 'hotline', 'fax'],
        default: 'office'
      },
      number: {
        type: String,
        required: true
      },
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    emergencyContact: {
      name: String,
      designation: String,
      phone: String,
      email: String
    }
  },
  
  // ==================== Location & Address ====================
  addresses: {
    headOffice: {
      division: {
        type: String,
        enum: ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'],
        required: [true, 'Division is required']
      },
      district: {
        type: String,
        required: [true, 'District is required']
      },
      area: String,
      street: String,
      building: String,
      postalCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: [true, 'Coordinates are required for head office']
        }
      }
    },
    branches: [{
      branchName: String,
      division: String,
      district: String,
      area: String,
      street: String,
      postalCode: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number] // [longitude, latitude]
      },
      contactNumber: String,
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // ==================== Fee Structure & Transparency ====================
  feeStructure: {
    baseFees: [{
      destinationCountry: {
        type: String,
        required: true
      },
      jobCategory: {
        type: String,
        enum: ['skilled', 'semi_skilled', 'unskilled'],
        required: true
      },
      processingFee: {
        amount: {
          type: Number,
          required: true,
          min: 0
        },
        currency: {
          type: String,
          default: 'BDT'
        }
      },
      medicalTestFee: {
        amount: Number,
        currency: {
          type: String,
          default: 'BDT'
        }
      },
      trainingFee: {
        amount: Number,
        currency: {
          type: String,
          default: 'BDT'
        }
      },
      visaFee: {
        amount: Number,
        currency: {
          type: String,
          default: 'BDT'
        }
      },
      ticketCost: {
        amount: Number,
        currency: {
          type: String,
          default: 'BDT'
        },
        note: String
      },
      otherCharges: [{
        chargeName: String,
        amount: Number,
        description: String
      }],
      totalEstimatedCost: {
        amount: Number,
        currency: {
          type: String,
          default: 'BDT'
        }
      },
      paymentTerms: String,
      refundPolicy: String
    }],
    feeTransparencyScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // ==================== Services Offered ====================
  services: {
    countriesServed: [{
      type: String,
      required: true
    }],
    jobSectorsSpecialized: [{
      type: String,
      enum: ['construction', 'hospitality', 'healthcare', 'domestic_work', 'manufacturing', 'agriculture', 'it_services', 'other']
    }],
    additionalServices: [{
      serviceName: String,
      description: String,
      isFree: {
        type: Boolean,
        default: false
      },
      cost: Number
    }],
    languageTraining: {
      type: Boolean,
      default: false
    },
    skillTraining: {
      type: Boolean,
      default: false
    },
    postArrivalSupport: {
      type: Boolean,
      default: false
    }
  },
  
  // ==================== Ratings & Reviews ====================
  ratings: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    ratingBreakdown: {
      fiveStar: { type: Number, default: 0 },
      fourStar: { type: Number, default: 0 },
      threeStar: { type: Number, default: 0 },
      twoStar: { type: Number, default: 0 },
      oneStar: { type: Number, default: 0 }
    },
    aspectRatings: {
      transparency: { type: Number, min: 0, max: 5, default: 0 },
      customerService: { type: Number, min: 0, max: 5, default: 0 },
      processEfficiency: { type: Number, min: 0, max: 5, default: 0 },
      postPlacementSupport: { type: Number, min: 0, max: 5, default: 0 },
      valueForMoney: { type: Number, min: 0, max: 5, default: 0 }
    }
  },
  
  // ==================== Statistics ====================
  statistics: {
    totalWorkersPlacements: {
      type: Number,
      default: 0
    },
    activeWorkers: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    yearEstablished: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    },
    placementsByCountry: [{
      country: String,
      count: Number
    }]
  },
  
  // ==================== Admin & Status ====================
  adminApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    rejectionReason: String,
    notes: String
  },
  
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'under_investigation', 'closed'],
    default: 'inactive'
  },
  
  // ==================== Agency Admins ====================
  administrators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'manager', 'staff'],
      default: 'staff'
    },
    permissions: [{
      type: String,
      enum: ['manage_listings', 'view_analytics', 'manage_fees', 'respond_reviews', 'manage_staff']
    }],
    addedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // ==================== Verification Documents ====================
  documents: [{
    documentType: {
      type: String,
      enum: ['trade_license', 'bmet_license', 'tax_certificate', 'bank_guarantee', 'insurance', 'other'],
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String
  }],
  
  // ==================== Metadata ====================
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isVerifiedByPlatform: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== Indexes ====================
// Geospatial index for location-based search (find nearby agencies)
recruitmentAgencySchema.index({ 'addresses.headOffice.coordinates': '2dsphere' });
recruitmentAgencySchema.index({ 'addresses.branches.coordinates': '2dsphere' });

// Compound indexes for filtering and search
recruitmentAgencySchema.index({ accountStatus: 1, 'adminApproval.status': 1 });
recruitmentAgencySchema.index({ 'addresses.headOffice.division': 1, 'addresses.headOffice.district': 1 });
recruitmentAgencySchema.index({ 'services.countriesServed': 1 });
recruitmentAgencySchema.index({ 'ratings.averageRating': -1, 'ratings.totalReviews': -1 });
recruitmentAgencySchema.index({ 'compliance.status': 1 });
recruitmentAgencySchema.index({ 'registration.licenseNumber': 1 });
recruitmentAgencySchema.index({ isFeatured: 1, 'ratings.averageRating': -1 });

// Text index for search functionality
recruitmentAgencySchema.index({
  agencyName: 'text',
  agencyNameBengali: 'text',
  description: 'text',
  'services.countriesServed': 'text'
}, {
  weights: {
    agencyName: 10,
    agencyNameBengali: 8,
    'services.countriesServed': 5,
    description: 2
  }
});

// Index for expiry date checks
recruitmentAgencySchema.index({ 'registration.expiryDate': 1 });

// ==================== Virtual Properties ====================
recruitmentAgencySchema.virtual('isLicenseValid').get(function() {
  if (!this.registration.expiryDate) return false;
  return new Date(this.registration.expiryDate) > new Date();
});

recruitmentAgencySchema.virtual('daysUntilLicenseExpiry').get(function() {
  if (!this.registration.expiryDate) return null;
  const today = new Date();
  const expiryDate = new Date(this.registration.expiryDate);
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

recruitmentAgencySchema.virtual('isFullyVerified').get(function() {
  return this.isVerifiedByPlatform && 
         this.adminApproval.status === 'approved' && 
         this.compliance.status === 'fully_compliant' &&
         this.isLicenseValid;
});

recruitmentAgencySchema.virtual('trustScore').get(function() {
  // Calculate overall trust score (0-100)
  const weights = {
    rating: 0.3,
    compliance: 0.25,
    verification: 0.2,
    transparency: 0.15,
    reviews: 0.1
  };
  
  const ratingScore = (this.ratings.averageRating / 5) * 100;
  const complianceScore = this.compliance.complianceScore || 0;
  const verificationScore = this.isVerifiedByPlatform ? 100 : 0;
  const transparencyScore = (this.feeStructure.feeTransparencyScore / 10) * 100;
  const reviewScore = Math.min((this.ratings.totalReviews / 100) * 100, 100);
  
  const totalScore = 
    (ratingScore * weights.rating) +
    (complianceScore * weights.compliance) +
    (verificationScore * weights.verification) +
    (transparencyScore * weights.transparency) +
    (reviewScore * weights.reviews);
  
  return Math.round(totalScore);
});

// ==================== Pre-save Middleware ====================
// Update fee structure last updated timestamp
recruitmentAgencySchema.pre('save', function(next) {
  if (this.isModified('feeStructure')) {
    this.feeStructure.lastUpdated = Date.now();
  }
  next();
});

// Validate license expiry date
recruitmentAgencySchema.pre('save', function(next) {
  if (this.registration.expiryDate && this.registration.issueDate) {
    if (this.registration.expiryDate <= this.registration.issueDate) {
      return next(new Error('License expiry date must be after issue date'));
    }
  }
  next();
});

// Ensure at least one primary phone number
recruitmentAgencySchema.pre('save', function(next) {
  if (this.contactInfo.phoneNumbers && this.contactInfo.phoneNumbers.length > 0) {
    const hasPrimary = this.contactInfo.phoneNumbers.some(phone => phone.isPrimary);
    if (!hasPrimary) {
      this.contactInfo.phoneNumbers[0].isPrimary = true;
    }
  }
  next();
});

// ==================== Static Methods ====================
// Find agencies near a location
recruitmentAgencySchema.statics.findNearby = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    'addresses.headOffice.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    accountStatus: 'active',
    'adminApproval.status': 'approved'
  });
};

// Find agencies by country service
recruitmentAgencySchema.statics.findByCountry = function(country) {
  return this.find({
    'services.countriesServed': country,
    accountStatus: 'active',
    'adminApproval.status': 'approved'
  }).sort({ 'ratings.averageRating': -1, 'ratings.totalReviews': -1 });
};

// Find top-rated agencies
recruitmentAgencySchema.statics.findTopRated = function(limit = 10) {
  return this.find({
    accountStatus: 'active',
    'adminApproval.status': 'approved',
    'ratings.totalReviews': { $gte: 5 }
  })
  .sort({ 'ratings.averageRating': -1, 'ratings.totalReviews': -1 })
  .limit(limit);
};

// ==================== Instance Methods ====================
// Calculate and update average rating
recruitmentAgencySchema.methods.updateRatings = function(newRating, oldRating = null) {
  if (oldRating) {
    // Update existing review
    const totalRatingPoints = this.ratings.averageRating * this.ratings.totalReviews;
    const newTotalPoints = totalRatingPoints - oldRating + newRating;
    this.ratings.averageRating = newTotalPoints / this.ratings.totalReviews;
    
    // Update breakdown
    this.ratings.ratingBreakdown[`${oldRating}Star`]--;
    this.ratings.ratingBreakdown[`${newRating}Star`]++;
  } else {
    // New review
    const totalRatingPoints = this.ratings.averageRating * this.ratings.totalReviews;
    this.ratings.totalReviews++;
    this.ratings.averageRating = (totalRatingPoints + newRating) / this.ratings.totalReviews;
    
    // Update breakdown
    const starKey = `${newRating}Star`;
    this.ratings.ratingBreakdown[starKey]++;
  }
  
  return this.save();
};

const RecruitmentAgency = mongoose.model('RecruitmentAgency', recruitmentAgencySchema);

module.exports = RecruitmentAgency;
