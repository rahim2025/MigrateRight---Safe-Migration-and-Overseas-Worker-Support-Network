const mongoose = require('mongoose');

/**
 * Emergency Contact Schema
 * Stores information about embassies, consulates, and NGOs with geospatial data
 * Supports location-based queries to find nearest help
 */
const emergencyContactSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
      },
      bn: {
        type: String,
        required: [true, 'Bengali name is required'],
      },
    },
    type: {
      type: String,
      enum: ['embassy', 'consulate', 'ngo', 'labor_office', 'shelter', 'legal_aid'],
      required: true,
      index: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      index: true,
    },
    city: {
      type: String,
      required: true,
    },

    // Geospatial Data - GeoJSON format for MongoDB geospatial queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (coords) {
            return coords.length === 2 && coords[0] >= -180 && coords[0] <= 180 && coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates. Format: [longitude, latitude]',
        },
      },
    },

    // Contact Details
    address: {
      en: String,
      bn: String,
    },
    phone: {
      type: [String],
      required: true,
    },
    emergencyHotline: {
      type: String,
      required: true,
    },
    email: String,
    website: String,

    // Operating Hours
    operatingHours: {
      weekdays: {
        type: String,
        default: '9:00 AM - 5:00 PM',
      },
      weekends: {
        type: String,
        default: 'Closed',
      },
      emergency24x7: {
        type: Boolean,
        default: false,
      },
    },

    // Services Offered
    services: {
      en: [String],
      bn: [String],
    },

    // Language Support
    languagesSupported: [String],

    // Additional Info
    canProvideEmergencyShelter: {
      type: Boolean,
      default: false,
    },
    canProvideLegalAid: {
      type: Boolean,
      default: false,
    },
    canProvideMedicalAssistance: {
      type: Boolean,
      default: false,
    },
    canProvideRepatriation: {
      type: Boolean,
      default: false,
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    verifiedDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geospatial Index - Required for location-based queries
emergencyContactSchema.index({ location: '2dsphere' });

// Compound Indexes for common queries
emergencyContactSchema.index({ country: 1, type: 1, isActive: 1 });
emergencyContactSchema.index({ type: 1, isActive: 1 });

// Virtual: Formatted coordinates
emergencyContactSchema.virtual('coordinates').get(function () {
  return {
    latitude: this.location.coordinates[1],
    longitude: this.location.coordinates[0],
  };
});

// Instance Methods

/**
 * Calculate distance to a given point (in kilometers)
 * @param {Number} longitude - Target longitude
 * @param {Number} latitude - Target latitude
 * @returns {Number} Distance in kilometers
 */
emergencyContactSchema.methods.distanceTo = function (longitude, latitude) {
  const R = 6371; // Earth's radius in km
  const dLat = this.toRad(latitude - this.location.coordinates[1]);
  const dLon = this.toRad(longitude - this.location.coordinates[0]);
  const lat1 = this.toRad(this.location.coordinates[1]);
  const lat2 = this.toRad(latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

emergencyContactSchema.methods.toRad = function (value) {
  return (value * Math.PI) / 180;
};

/**
 * Check if contact is currently available
 * @returns {Boolean}
 */
emergencyContactSchema.methods.isCurrentlyAvailable = function () {
  if (this.operatingHours.emergency24x7) return true;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();

  // Simple check: weekends (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) {
    return this.operatingHours.weekends !== 'Closed';
  }

  // Weekdays: assume 9-17 if not specified
  return hour >= 9 && hour < 17;
};

/**
 * Get localized content
 * @param {String} language - 'en' or 'bn'
 * @returns {Object}
 */
emergencyContactSchema.methods.getLocalized = function (language = 'en') {
  const lang = ['en', 'bn'].includes(language) ? language : 'en';
  return {
    name: this.name[lang],
    address: this.address?.[lang],
    services: this.services?.[lang] || [],
  };
};

// Static Methods

/**
 * Find nearest emergency contacts using geospatial query
 * @param {Number} longitude - User's longitude
 * @param {Number} latitude - User's latitude
 * @param {Number} maxDistance - Maximum distance in meters (default: 100km)
 * @param {Number} limit - Maximum number of results
 * @param {String} type - Optional: filter by contact type
 * @returns {Promise<Array>}
 */
emergencyContactSchema.statics.findNearest = async function (
  longitude,
  latitude,
  maxDistance = 100000,
  limit = 5,
  type = null
) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    isActive: true,
  };

  if (type) {
    query.type = type;
  }

  return this.find(query).limit(limit);
};

/**
 * Find embassies in a specific country
 * @param {String} country
 * @returns {Promise<Array>}
 */
emergencyContactSchema.statics.findEmbassiesInCountry = function (country) {
  return this.find({
    country,
    type: { $in: ['embassy', 'consulate'] },
    isActive: true,
  }).sort({ city: 1 });
};

/**
 * Find emergency contacts by type and country
 * @param {String} type
 * @param {String} country
 * @returns {Promise<Array>}
 */
emergencyContactSchema.statics.findByTypeAndCountry = function (type, country) {
  return this.find({
    type,
    country,
    isActive: true,
  }).sort({ city: 1 });
};

/**
 * Find 24/7 emergency contacts near location
 * @param {Number} longitude
 * @param {Number} latitude
 * @param {Number} maxDistance
 * @returns {Promise<Array>}
 */
emergencyContactSchema.statics.find24x7Near = function (longitude, latitude, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    'operatingHours.emergency24x7': true,
    isActive: true,
  }).limit(10);
};

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

module.exports = EmergencyContact;
