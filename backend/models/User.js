const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ==================== Authentication ====================
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  
  // ==================== Role & Status ====================
  role: {
    type: String,
    enum: {
      values: ['aspiring_migrant', 'worker_abroad', 'family_member', 'recruitment_admin', 'platform_admin'],
      message: '{VALUE} is not a valid role'
    },
    required: [true, 'User role is required']
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'deactivated'],
    default: 'pending'
  },
  
  // ==================== Personal Information ====================
  fullName: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    middleName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    }
  },
  
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: true
  },
  
  nationalIdNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    trim: true
  },
  
  passportNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  passportExpiryDate: {
    type: Date
  },
  
  // ==================== Location Information ====================
  location: {
    // Bangladesh location
    bangladeshAddress: {
      district: {
        type: String,
        required: function() {
          return this.role === 'aspiring_migrant' || this.role === 'family_member';
        }
      },
      upazila: String,
      village: String,
      detailedAddress: String,
      postalCode: String
    },
    
    // Current location abroad (for workers abroad)
    currentLocation: {
      country: String,
      city: String,
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number] // [longitude, latitude]
        }
      }
    },
    
    // Destination country (for aspiring migrants)
    destinationCountry: {
      type: String
    }
  },
  
  // ==================== Employment & Migration Info ====================
  employmentInfo: {
    currentOccupation: String,
    skillSet: [{
      type: String,
      trim: true
    }],
    experienceYears: {
      type: Number,
      min: 0
    },
    desiredJobSector: [{
      type: String,
      enum: ['construction', 'hospitality', 'healthcare', 'domestic_work', 'manufacturing', 'agriculture', 'it_services', 'other']
    }],
    educationLevel: {
      type: String,
      enum: ['no_formal', 'primary', 'secondary', 'higher_secondary', 'bachelors', 'masters', 'vocational']
    }
  },
  
  migrationStatus: {
    type: String,
    enum: ['planning', 'in_process', 'abroad', 'returned', 'not_applicable'],
    default: 'not_applicable'
  },
  
  // ==================== Verification & Trust ====================
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isIdentityVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationDate: Date,
    verificationDocuments: [{
      documentType: {
        type: String,
        enum: ['national_id', 'passport', 'work_permit', 'visa', 'other']
      },
      documentUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }]
  },
  
  // ==================== Agency Association ====================
  associatedAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecruitmentAgency'
  },
  
  // ==================== Profile & Settings ====================
  profilePicture: {
    type: String,
    default: null
  },
  
  preferredLanguage: {
    type: String,
    enum: ['bn', 'en'],
    default: 'bn'
  },
  
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  
  // ==================== Security ====================
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // ==================== Metadata ====================
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== Indexes ====================
// Compound index for search and filtering
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ 'location.bangladeshAddress.district': 1, role: 1 });
userSchema.index({ email: 1, phoneNumber: 1 });
userSchema.index({ migrationStatus: 1 });
userSchema.index({ associatedAgency: 1 });

// Geospatial index for finding nearby workers
userSchema.index({ 'location.currentLocation.coordinates': '2dsphere' });

// Text index for search functionality
userSchema.index({
  'fullName.firstName': 'text',
  'fullName.lastName': 'text',
  email: 'text'
}, { default_language: 'english', language_override: 'none' });

// ==================== Virtual Properties ====================
userSchema.virtual('fullNameString').get(function() {
  const parts = [
    this.fullName.firstName,
    this.fullName.middleName,
    this.fullName.lastName
  ].filter(Boolean);
  return parts.join(' ');
});

userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.virtual('isAccountLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ==================== Pre-save Middleware ====================
// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash password if it has been modified
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Update passwordChangedAt when password is modified
userSchema.pre('save', function() {
  if (!this.isModified('password') || this.isNew) return;
  
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token is created after password change
});

// ==================== Instance Methods ====================
// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isAccountLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
