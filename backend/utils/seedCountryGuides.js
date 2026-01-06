const CountryGuide = require('../models/CountryGuide.model');
const mongoose = require('mongoose');
require('dotenv').config();

const seedData = [
  {
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flagEmoji: '🇸🇦',
    region: 'Middle East',
    popularityRank: 1,
    overview: {
      en: 'Saudi Arabia is one of the largest destinations for Bangladeshi migrant workers, particularly in construction, domestic work, and hospitality sectors. The country follows strict Islamic law and customs.',
      bn: 'সৌদি আরব বাংলাদেশী অভিবাসী শ্রমিকদের জন্য বৃহত্তম গন্তব্যগুলির মধ্যে একটি, বিশেষত নির্মাণ, গৃহস্থালী কাজ এবং আতিথেয়তা খাতে। দেশটি কঠোর ইসলামিক আইন এবং রীতিনীতি অনুসরণ করে।'
    },
    salaryRanges: [
      {
        jobType: 'construction',
        title: { en: 'Construction Worker', bn: 'নির্মাণ শ্রমিক' },
        minSalary: 800,
        maxSalary: 1500,
        currency: 'SAR',
        period: 'monthly',
        notes: { en: 'Overtime available', bn: 'ওভারটাইম উপলব্ধ' }
      },
      {
        jobType: 'domestic_work',
        title: { en: 'Domestic Helper', bn: 'গৃহকর্মী' },
        minSalary: 1000,
        maxSalary: 1800,
        currency: 'SAR',
        period: 'monthly'
      }
    ],
    culture: {
      language: {
        official: ['Arabic'],
        commonlySpoken: ['English', 'Urdu']
      },
      religion: {
        primary: 'Islam',
        important: {
          en: 'Islam is the state religion. All public religious practices must be Islamic.',
          bn: 'ইসলাম রাষ্ট্রধর্ম। সমস্ত পাবলিক ধর্মীয় অনুশীলন ইসলামিক হতে হবে।'
        }
      },
      customs: {
        dressCode: {
          en: 'Conservative dress required. Women must wear abaya in public.',
          bn: 'রক্ষণশীল পোশাক প্রয়োজন। মহিলাদের পাবলিক স্থানে আবায়া পরতে হবে।'
        }
      },
      doAndDonts: {
        dos: [
          { en: 'Respect prayer times', bn: 'নামাজের সময় সম্মান করুন' },
          { en: 'Dress modestly', bn: 'শালীন পোশাক পরুন' }
        ],
        donts: [
          { en: 'No alcohol consumption', bn: 'মদ্যপান নিষিদ্ধ' },
          { en: 'No public display of affection', bn: 'প্রকাশ্যে স্নেহ প্রদর্শন নিষিদ্ধ' }
        ]
      }
    },
    civilianRules: {
      prohibitedItems: [
        {
          item: { en: 'Alcohol', bn: 'মদ' },
          penalty: { en: 'Imprisonment and deportation', bn: 'কারাদণ্ড এবং নির্বাসন' },
          severity: 'critical'
        },
        {
          item: { en: 'Pork products', bn: 'শূকরের মাংস' },
          penalty: { en: 'Confiscation and fine', bn: 'বাজেয়াপ্ত এবং জরিমানা' },
          severity: 'high'
        }
      ],
      photographyRestrictions: {
        en: 'No photography of government buildings, military sites, or women without permission.',
        bn: 'সরকারি ভবন, সামরিক স্থান বা অনুমতি ছাড়া মহিলাদের ছবি তোলা নিষিদ্ধ।'
      }
    },
    drivingGuidelines: {
      licenseRequired: true,
      internationalLicenseAccepted: false,
      drivingSide: 'right',
      speedLimits: {
        urban: 80,
        highway: 120,
        unit: 'km/h'
      },
      bloodAlcoholLimit: {
        limit: 0,
        notes: { en: 'Zero tolerance', bn: 'শূন্য সহনশীলতা' }
      }
    },
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: { en: 'Bangladesh Embassy Riyadh', bn: 'রিয়াদে বাংলাদেশ দূতাবাস' },
        phone: ['+966-11-454-0564'],
        email: 'mission.riyadh@mofa.gov.bd',
        emergencyHotline: '+966-11-454-0564'
      },
      localEmergencyServices: {
        police: '999',
        ambulance: '997',
        fire: '998'
      }
    }
  }
];

async function seedCountryGuides() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await CountryGuide.deleteMany({});
    console.log('Cleared existing data');

    await CountryGuide.insertMany(seedData);
    console.log(`Seeded ${seedData.length} country guides`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedCountryGuides();
