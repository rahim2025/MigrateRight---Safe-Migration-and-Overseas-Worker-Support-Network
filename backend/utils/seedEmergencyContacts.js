/**
 * Emergency Contacts Seeder
 * Seeds the database with embassies, consulates, and NGOs with geolocation data
 * 
 * Usage: node backend/utils/seedEmergencyContacts.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const EmergencyContact = require('../models/EmergencyContact.model');
const { connectDB, disconnectDB } = require('../config/database');
const logger = require('./logger');

// Load environment variables
dotenv.config();

// Sample emergency contacts with real coordinates
const emergencyContacts = [
  // ==================== SAUDI ARABIA ====================
  {
    name: {
      en: 'Embassy of Bangladesh in Riyadh',
      bn: 'রিয়াদে বাংলাদেশ দূতাবাস',
    },
    type: 'embassy',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    location: {
      type: 'Point',
      coordinates: [46.7073, 24.7408], // Riyadh, Saudi Arabia
    },
    phone: ['+966-11-454-9898', '+966-11-454-1656'],
    emergencyHotline: '+966-11-454-9898',
    email: 'mission.riyadh@mofa.gov.bd',
    website: 'http://www.saudiembbangladesh.com',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Welfare support',
        'Repatriation assistance',
        'Worker rights protection',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'কল্যাণ সহায়তা',
        'স্বদেশ প্রত্যাবর্তন সহায়তা',
        'শ্রমিক অধিকার সুরক্ষা',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },
  {
    name: {
      en: 'Consulate General of Bangladesh in Jeddah',
      bn: 'জেদ্দায় বাংলাদেশ কনস্যুলেট জেনারেল',
    },
    type: 'consulate',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    location: {
      type: 'Point',
      coordinates: [39.1925, 21.5433], // Jeddah, Saudi Arabia
    },
    phone: ['+966-12-667-0425', '+966-12-667-2981'],
    emergencyHotline: '+966-12-667-0425',
    email: 'cgbjeddah@mofa.gov.bd',
    website: 'http://www.jeddahconsulate.gov.bd',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Worker welfare',
        'Visa services',
        'Complaint registration',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'শ্রমিক কল্যাণ',
        'ভিসা সেবা',
        'অভিযোগ নিবন্ধন',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },
  {
    name: {
      en: 'Bangladesh Labor Wing - Riyadh',
      bn: 'বাংলাদেশ শ্রম শাখা - রিয়াদ',
    },
    type: 'labor_office',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    location: {
      type: 'Point',
      coordinates: [46.7073, 24.7408],
    },
    phone: ['+966-11-454-1656'],
    emergencyHotline: '+966-11-454-1656',
    email: 'labor.riyadh@mofa.gov.bd',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: false,
    },
    services: {
      en: [
        'Wage dispute resolution',
        'Contract verification',
        'Worker rights counseling',
        'Employment grievances',
      ],
      bn: [
        'মজুরি বিরোধ নিষ্পত্তি',
        'চুক্তি যাচাইকরণ',
        'শ্রমিক অধিকার পরামর্শ',
        'কর্মসংস্থান অভিযোগ',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: false,
      repatriation: false,
    },
  },

  // ==================== UNITED ARAB EMIRATES ====================
  {
    name: {
      en: 'Embassy of Bangladesh in Abu Dhabi',
      bn: 'আবুধাবিতে বাংলাদেশ দূতাবাস',
    },
    type: 'embassy',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    location: {
      type: 'Point',
      coordinates: [54.3570, 24.4768], // Abu Dhabi, UAE
    },
    phone: ['+971-2-447-1092', '+971-2-447-1093'],
    emergencyHotline: '+971-2-447-1092',
    email: 'mission.abudhabi@mofa.gov.bd',
    website: 'http://www.embassyofbangladesh.ae',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Welfare support',
        'Repatriation',
        'Worker protection',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'কল্যাণ সহায়তা',
        'স্বদেশ প্রত্যাবর্তন',
        'শ্রমিক সুরক্ষা',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },
  {
    name: {
      en: 'Consulate General of Bangladesh in Dubai',
      bn: 'দুবাইতে বাংলাদেশ কনস্যুলেট জেনারেল',
    },
    type: 'consulate',
    country: 'United Arab Emirates',
    city: 'Dubai',
    location: {
      type: 'Point',
      coordinates: [55.2708, 25.2048], // Dubai, UAE
    },
    phone: ['+971-4-397-4747', '+971-4-397-5520'],
    emergencyHotline: '+971-50-644-7399',
    email: 'cgdubai@mofa.gov.bd',
    website: 'http://www.cgdubai.gov.bd',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Worker welfare',
        'Visa services',
        'Emergency shelter referral',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'শ্রমিক কল্যাণ',
        'ভিসা সেবা',
        'জরুরি আশ্রয় রেফারেল',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },

  // ==================== MALAYSIA ====================
  {
    name: {
      en: 'High Commission of Bangladesh in Kuala Lumpur',
      bn: 'কুয়ালালামপুরে বাংলাদেশ হাইকমিশন',
    },
    type: 'embassy',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    location: {
      type: 'Point',
      coordinates: [101.6869, 3.1390], // Kuala Lumpur, Malaysia
    },
    phone: ['+60-3-2161-5421', '+60-3-2161-5423'],
    emergencyHotline: '+60-12-397-3702',
    email: 'bdootkloffice@gmail.com',
    website: 'http://www.bdhckl.org',
    operatingHours: {
      weekdays: {
        open: '09:00',
        close: '17:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Welfare support',
        'Repatriation',
        'Worker rights protection',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'কল্যাণ সহায়তা',
        'স্বদেশ প্রত্যাবর্তন',
        'শ্রমিক অধিকার সুরক্ষা',
      ],
    },
    languagesSupported: ['bn', 'en', 'ms'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },

  // ==================== NGOs ====================
  {
    name: {
      en: 'Migrant Workers Rights International - Saudi Arabia',
      bn: 'প্রবাসী শ্রমিক অধিকার আন্তর্জাতিক - সৌদি আরব',
    },
    type: 'ngo',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    location: {
      type: 'Point',
      coordinates: [46.7219, 24.7136],
    },
    phone: ['+966-11-465-7890'],
    emergencyHotline: '+966-11-465-7890',
    email: 'help@mwri-sa.org',
    website: 'http://www.mwri-saudi.org',
    operatingHours: {
      weekdays: {
        open: '09:00',
        close: '17:00',
      },
      weekends: {
        open: '10:00',
        close: '14:00',
      },
      emergency24x7: false,
    },
    services: {
      en: [
        'Legal counseling',
        'Emergency shelter',
        'Medical referrals',
        'Rights advocacy',
        'Psychosocial support',
      ],
      bn: [
        'আইনি পরামর্শ',
        'জরুরি আশ্রয়',
        'চিকিৎসা রেফারেল',
        'অধিকার প্রচার',
        'মনোসামাজিক সহায়তা',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar', 'ur', 'hi'],
    capabilities: {
      provideShelter: true,
      legalAid: true,
      medicalAssistance: true,
      repatriation: false,
    },
  },
  {
    name: {
      en: 'UAE Workers Support Center',
      bn: 'ইউএই শ্রমিক সহায়তা কেন্দ্র',
    },
    type: 'ngo',
    country: 'United Arab Emirates',
    city: 'Dubai',
    location: {
      type: 'Point',
      coordinates: [55.2962, 25.2532],
    },
    phone: ['+971-4-345-6789'],
    emergencyHotline: '+971-50-123-4567',
    email: 'support@uaewsc.org',
    website: 'http://www.uaeworkers.org',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '18:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency shelter',
        'Legal aid',
        'Medical assistance',
        'Skills training',
        'Crisis counseling',
      ],
      bn: [
        'জরুরি আশ্রয়',
        'আইনি সহায়তা',
        'চিকিৎসা সহায়তা',
        'দক্ষতা প্রশিক্ষণ',
        'সংকট পরামর্শ',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar', 'ur', 'hi', 'ta'],
    capabilities: {
      provideShelter: true,
      legalAid: true,
      medicalAssistance: true,
      repatriation: false,
    },
  },
  {
    name: {
      en: 'Malaysia Migrant Support Network',
      bn: 'মালয়েশিয়া প্রবাসী সহায়তা নেটওয়ার্ক',
    },
    type: 'ngo',
    country: 'Malaysia',
    city: 'Kuala Lumpur',
    location: {
      type: 'Point',
      coordinates: [101.6958, 3.1478],
    },
    phone: ['+60-3-2274-5678'],
    emergencyHotline: '+60-12-345-6789',
    email: 'help@malaysiaworkers.org',
    website: 'http://www.mmsn.my',
    operatingHours: {
      weekdays: {
        open: '09:00',
        close: '18:00',
      },
      weekends: {
        open: '10:00',
        close: '16:00',
      },
      emergency24x7: false,
    },
    services: {
      en: [
        'Legal assistance',
        'Safe shelter',
        'Medical support',
        'Job placement',
        'Language classes',
      ],
      bn: [
        'আইনি সহায়তা',
        'নিরাপদ আশ্রয়',
        'চিকিৎসা সহায়তা',
        'চাকরি নিয়োগ',
        'ভাষা ক্লাস',
      ],
    },
    languagesSupported: ['bn', 'en', 'ms', 'ur', 'hi'],
    capabilities: {
      provideShelter: true,
      legalAid: true,
      medicalAssistance: true,
      repatriation: false,
    },
  },

  // ==================== ADDITIONAL EMBASSIES ====================
  {
    name: {
      en: 'Embassy of Bangladesh in Muscat',
      bn: 'মাস্কাটে বাংলাদেশ দূতাবাস',
    },
    type: 'embassy',
    country: 'Oman',
    city: 'Muscat',
    location: {
      type: 'Point',
      coordinates: [58.3829, 23.5880], // Muscat, Oman
    },
    phone: ['+968-2469-8989', '+968-2469-8990'],
    emergencyHotline: '+968-9955-5123',
    email: 'mission.muscat@mofa.gov.bd',
    website: 'http://www.embassyofbangladeshoman.com',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Welfare support',
        'Repatriation',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'কল্যাণ সহায়তা',
        'স্বদেশ প্রত্যাবর্তন',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },
  {
    name: {
      en: 'Embassy of Bangladesh in Kuwait City',
      bn: 'কুয়েত সিটিতে বাংলাদেশ দূতাবাস',
    },
    type: 'embassy',
    country: 'Kuwait',
    city: 'Kuwait City',
    location: {
      type: 'Point',
      coordinates: [47.9774, 29.3759], // Kuwait City, Kuwait
    },
    phone: ['+965-2256-3120', '+965-2256-3121'],
    emergencyHotline: '+965-9700-1234',
    email: 'mission.kuwait@mofa.gov.bd',
    website: 'http://www.kuwaitembassy.gov.bd',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Welfare support',
        'Repatriation',
        'Worker protection',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'কল্যাণ সহায়তা',
        'স্বদেশ প্রত্যাবর্তন',
        'শ্রমিক সুরক্ষা',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },
  {
    name: {
      en: 'Embassy of Bangladesh in Doha',
      bn: 'দোহায় বাংলাদেশ দূতাবাস',
    },
    type: 'embassy',
    country: 'Qatar',
    city: 'Doha',
    location: {
      type: 'Point',
      coordinates: [51.5310, 25.2854], // Doha, Qatar
    },
    phone: ['+974-4432-9200', '+974-4432-9201'],
    emergencyHotline: '+974-5555-1234',
    email: 'mission.doha@mofa.gov.bd',
    website: 'http://www.bangladeshembassyqatar.com',
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '16:00',
      },
      weekends: {
        open: null,
        close: null,
      },
      emergency24x7: true,
    },
    services: {
      en: [
        'Emergency passport',
        'Legal assistance',
        'Welfare support',
        'Repatriation',
        'Labor dispute resolution',
      ],
      bn: [
        'জরুরি পাসপোর্ট',
        'আইনি সহায়তা',
        'কল্যাণ সহায়তা',
        'স্বদেশ প্রত্যাবর্তন',
        'শ্রম বিরোধ নিষ্পত্তি',
      ],
    },
    languagesSupported: ['bn', 'en', 'ar'],
    capabilities: {
      provideShelter: false,
      legalAid: true,
      medicalAssistance: true,
      repatriation: true,
    },
  },
];

/**
 * Seed emergency contacts
 */
const seedEmergencyContacts = async () => {
  try {
    logger.info('Starting emergency contacts seeding...');

    // Connect to database
    await connectDB();

    // Clear existing emergency contacts
    const deleteResult = await EmergencyContact.deleteMany({});
    logger.info(`Cleared ${deleteResult.deletedCount} existing emergency contacts`);

    // Insert new emergency contacts
    const insertedContacts = await EmergencyContact.insertMany(emergencyContacts);
    logger.info(`Successfully seeded ${insertedContacts.length} emergency contacts`);

    // Verify geospatial index
    const indexes = await EmergencyContact.collection.getIndexes();
    const hasGeoIndex = Object.values(indexes).some(
      (index) => index[0] && index[0][0] === 'location' && index[0][1] === '2dsphere'
    );
    
    if (hasGeoIndex) {
      logger.info('✓ Geospatial index (2dsphere) verified on location field');
    } else {
      logger.warn('⚠ Geospatial index not found. Creating...');
      await EmergencyContact.collection.createIndex({ location: '2dsphere' });
      logger.info('✓ Geospatial index created');
    }

    // Test geospatial query (find contacts near Riyadh)
    const testLocation = [46.7073, 24.7408]; // Riyadh coordinates
    const nearbyContacts = await EmergencyContact.findNearest(
      testLocation[0],
      testLocation[1],
      100000, // 100km radius
      5
    );
    
    logger.info(`\n========== TEST QUERY ==========`);
    logger.info(`Location: Riyadh (${testLocation[1]}, ${testLocation[0]})`);
    logger.info(`Found ${nearbyContacts.length} contacts within 100km:`);
    
    nearbyContacts.forEach((contact) => {
      const distance = contact.distanceTo(testLocation[0], testLocation[1]);
      logger.info(`  - ${contact.name.en} (${contact.type}): ${distance.toFixed(2)}km`);
    });

    logger.info('\n========== SEEDING SUMMARY ==========');
    const summary = {
      embassies: insertedContacts.filter(c => c.type === 'embassy').length,
      consulates: insertedContacts.filter(c => c.type === 'consulate').length,
      ngos: insertedContacts.filter(c => c.type === 'ngo').length,
      laborOffices: insertedContacts.filter(c => c.type === 'labor_office').length,
      total: insertedContacts.length,
      countries: [...new Set(insertedContacts.map(c => c.country))].length,
      emergency24x7: insertedContacts.filter(c => c.operatingHours.emergency24x7).length,
    };

    logger.info(`Total contacts: ${summary.total}`);
    logger.info(`  - Embassies: ${summary.embassies}`);
    logger.info(`  - Consulates: ${summary.consulates}`);
    logger.info(`  - NGOs: ${summary.ngos}`);
    logger.info(`  - Labor Offices: ${summary.laborOffices}`);
    logger.info(`Countries covered: ${summary.countries}`);
    logger.info(`24/7 Emergency contacts: ${summary.emergency24x7}`);
    logger.info('=====================================\n');

    logger.success('Emergency contacts seeding completed successfully!');

    // Disconnect from database
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding emergency contacts:', error);
    await disconnectDB();
    process.exit(1);
  }
};

// Run seeder
seedEmergencyContacts();
