/**
 * Country Guide Seeder
 * Seeds the database with sample country guide data
 * 
 * Usage: node backend/utils/seedCountryGuides.js
 */

const mongoose = require('mongoose');
const CountryGuide = require('../models/CountryGuide.model');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/migrateright', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected for seeding');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample Country Guides Data
const sampleGuides = [
  {
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flagEmoji: '🇸🇦',
    region: 'Middle East',
    overview: {
      en: 'Saudi Arabia is one of the most popular destinations for Bangladeshi migrant workers, particularly in construction, domestic work, and hospitality sectors. The Kingdom offers competitive salaries and modern infrastructure, but workers must be prepared for strict cultural and religious regulations. Understanding Saudi labor laws and cultural expectations is crucial for a successful migration experience.',
      bn: 'সৌদি আরব বাংলাদেশী অভিবাসী শ্রমিকদের জন্য সবচেয়ে জনপ্রিয় গন্তব্যগুলির মধ্যে একটি, বিশেষ করে নির্মাণ, গৃহকর্মী এবং আতিথেয়তা খাতে। রাজ্য প্রতিযোগিতামূলক বেতন এবং আধুনিক অবকাঠামো প্রদান করে, তবে শ্রমিকদের কঠোর সাংস্কৃতিক এবং ধর্মীয় নিয়মকানুনের জন্য প্রস্তুত থাকতে হবে।',
    },
    salaryRanges: [
      {
        jobType: 'construction',
        title: { en: 'Construction Worker', bn: 'নির্মাণ শ্রমিক' },
        minSalary: 800,
        maxSalary: 1500,
        currency: 'SAR',
        period: 'monthly',
        notes: {
          en: 'Includes accommodation and transportation. Overtime available.',
          bn: 'বাসস্থান এবং পরিবহন অন্তর্ভুক্ত। ওভারটাইম উপলব্ধ।',
        },
      },
      {
        jobType: 'domestic_work',
        title: { en: 'Domestic Worker', bn: 'গৃহকর্মী' },
        minSalary: 600,
        maxSalary: 1200,
        currency: 'SAR',
        period: 'monthly',
        notes: {
          en: 'Accommodation and food provided by employer.',
          bn: 'নিয়োগকর্তা দ্বারা বাসস্থান এবং খাদ্য প্রদান করা হয়।',
        },
      },
      {
        jobType: 'hospitality',
        title: { en: 'Hospitality Staff', bn: 'আতিথেয়তা কর্মী' },
        minSalary: 1000,
        maxSalary: 2000,
        currency: 'SAR',
        period: 'monthly',
        notes: {
          en: 'Hotels and restaurants. Tips not common.',
          bn: 'হোটেল এবং রেস্তোরাঁ। টিপস সাধারণ নয়।',
        },
      },
    ],
    culture: {
      language: {
        official: ['Arabic'],
        commonlySpoken: ['English', 'Urdu'],
      },
      religion: {
        primary: 'Islam',
        important: {
          en: 'Saudi Arabia follows strict Islamic law (Sharia). All residents must respect Islamic customs. Public practice of other religions is not permitted.',
          bn: 'সৌদি আরব কঠোর ইসলামিক আইন (শরিয়া) অনুসরণ করে। সকল বাসিন্দাদের ইসলামিক রীতিনীতি সম্মান করতে হবে।',
        },
      },
      customs: {
        dressCode: {
          en: 'Conservative dress required. Men: Long pants and shirts. Women: Abaya (long black robe) required in public.',
          bn: 'রক্ষণশীল পোশাক প্রয়োজন। পুরুষ: লম্বা প্যান্ট এবং শার্ট। মহিলা: পাবলিক এলাকায় আবায়া (লম্বা কালো পোশাক) প্রয়োজন।',
        },
        workCulture: {
          en: 'Work week is Sunday to Thursday. Friday is a day of rest. Prayer times are strictly observed, and businesses close during prayer times.',
          bn: 'কর্ম সপ্তাহ রবিবার থেকে বৃহস্পতিবার। শুক্রবার বিশ্রামের দিন। নামাজের সময় কঠোরভাবে পালন করা হয়।',
        },
        publicBehavior: {
          en: 'Public display of affection is prohibited. Respect personal space. Do not photograph people without permission.',
          bn: 'প্রকাশ্যে স্নেহ প্রদর্শন নিষিদ্ধ। ব্যক্তিগত স্থান সম্মান করুন। অনুমতি ছাড়া মানুষের ছবি তুলবেন না।',
        },
      },
      doAndDonts: {
        dos: [
          { en: 'Dress modestly', bn: 'শালীনভাবে পোশাক পরিধান করুন' },
          { en: 'Learn basic Arabic greetings', bn: 'মৌলিক আরবি শুভেচ্ছা শিখুন' },
          { en: 'Respect prayer times', bn: 'নামাজের সময় সম্মান করুন' },
          { en: 'Keep your passport copy safe', bn: 'আপনার পাসপোর্ট কপি নিরাপদ রাখুন' },
        ],
        donts: [
          { en: 'Do not consume alcohol', bn: 'মদ্যপান করবেন না' },
          { en: 'Do not eat pork', bn: 'শুয়োরের মাংস খাবেন না' },
          { en: 'Do not criticize Islam or the government', bn: 'ইসলাম বা সরকারের সমালোচনা করবেন না' },
          { en: 'Do not work for anyone except your sponsor', bn: 'আপনার স্পন্সর ছাড়া অন্য কারো জন্য কাজ করবেন না' },
        ],
      },
    },
    legalRights: {
      laborLaws: {
        workingHours: {
          standard: 48,
          maximum: 60,
          notes: {
            en: '8 hours per day, 6 days per week. Maximum 60 hours with overtime.',
            bn: 'দিনে ৮ ঘণ্টা, সপ্তাহে ৬ দিন। ওভারটাইম সহ সর্বোচ্চ ৬০ ঘণ্টা।',
          },
        },
        weeklyRest: {
          days: 1,
          notes: {
            en: 'Usually Friday. Some employers provide Friday and Saturday.',
            bn: 'সাধারণত শুক্রবার। কিছু নিয়োগকর্তা শুক্রবার এবং শনিবার প্রদান করে।',
          },
        },
        paidLeave: {
          annual: 21,
          sick: 30,
          notes: {
            en: 'After one year of service. Sick leave with medical certificate.',
            bn: 'এক বছর সেবার পরে। মেডিকেল সার্টিফিকেট সহ অসুস্থতা ছুটি।',
          },
        },
        overtimePay: {
          rate: '150% of regular hourly rate',
          notes: {
            en: 'Required for hours beyond 48 per week.',
            bn: 'সপ্তাহে ৪৮ ঘণ্টার বেশি জন্য প্রয়োজনীয়।',
          },
        },
      },
      workerProtections: [
        {
          right: { en: 'Right to written contract', bn: 'লিখিত চুক্তির অধিকার' },
          description: {
            en: 'All workers must receive a written employment contract in Arabic and their native language.',
            bn: 'সকল শ্রমিকদের আরবি এবং তাদের মাতৃভাষায় লিখিত কর্মসংস্থান চুক্তি পেতে হবে।',
          },
        },
        {
          right: { en: 'Right to timely salary', bn: 'সময়মত বেতনের অধিকার' },
          description: {
            en: 'Salaries must be paid by the 7th of each month through the WPS (Wage Protection System).',
            bn: 'প্রতি মাসের ৭ তারিখের মধ্যে WPS (মজুরি সুরক্ষা ব্যবস্থা) এর মাধ্যমে বেতন দিতে হবে।',
          },
        },
      ],
      contractRequirements: {
        mustHaveWrittenContract: true,
        contractLanguage: 'Arabic and worker native language',
        minimumWage: {
          amount: 0,
          currency: 'SAR',
          notes: {
            en: 'No official minimum wage, but contracts must specify salary.',
            bn: 'কোন সরকারি ন্যূনতম মজুরি নেই, তবে চুক্তিতে বেতন উল্লেখ করতে হবে।',
          },
        },
      },
      visaAndResidency: {
        visaTypes: ['Work Visa (Iqama)'],
        renewalPeriod: '1-2 years',
        sponsorshipRules: {
          en: 'Kafala (sponsorship) system. Employer is the sponsor and controls visa.',
          bn: 'কাফালা (স্পন্সরশিপ) ব্যবস্থা। নিয়োগকর্তা স্পন্সর এবং ভিসা নিয়ন্ত্রণ করে।',
        },
        exitPermitRequired: false,
      },
    },
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: {
          en: 'Embassy of Bangladesh in Riyadh',
          bn: 'রিয়াদে বাংলাদেশ দূতাবাস',
        },
        address: {
          en: 'Diplomatic Quarter, Riyadh 11693, Saudi Arabia',
          bn: 'ডিপ্লোমেটিক কোয়ার্টার, রিয়াদ ১১৬৯৩, সৌদি আরব',
        },
        phone: ['+966-11-4880448', '+966-11-4883501'],
        email: 'mission.riyadh@mofa.gov.bd',
        emergencyHotline: '+966-50-574-5130',
        website: 'https://www.riyadh.mission.gov.bd',
        workingHours: {
          en: 'Sunday-Thursday: 8:00 AM - 3:00 PM',
          bn: 'রবিবার-বৃহস্পতিবার: সকাল ৮:০০ - দুপুর ৩:০০',
        },
      },
      localEmergencyServices: {
        police: '999',
        ambulance: '997',
        fire: '998',
        generalEmergency: '112',
      },
      helplines: [
        {
          name: { en: 'Ministry of Labor Helpline', bn: 'শ্রম মন্ত্রণালয় হেল্পলাইন' },
          number: '19911',
          purpose: {
            en: 'Report labor violations and disputes',
            bn: 'শ্রম লঙ্ঘন এবং বিরোধ রিপোর্ট করুন',
          },
          availability: { en: '24/7', bn: '২৪/৭' },
        },
      ],
    },
    livingCosts: {
      currency: 'SAR',
      accommodation: {
        providedByEmployer: true,
        averageRent: {
          min: 0,
          max: 0,
          notes: {
            en: 'Usually provided by employer for workers.',
            bn: 'সাধারণত নিয়োগকর্তা শ্রমিকদের জন্য প্রদান করেন।',
          },
        },
      },
      food: {
        monthlyEstimate: { min: 300, max: 600 },
        notes: {
          en: 'Basic groceries. Some employers provide meals.',
          bn: 'মৌলিক খাদ্যদ্রব্য। কিছু নিয়োগকর্তা খাবার প্রদান করে।',
        },
      },
      transportation: {
        monthlyEstimate: { min: 100, max: 300 },
        notes: {
          en: 'Public transport or employer-provided transport.',
          bn: 'পাবলিক ট্রান্সপোর্ট বা নিয়োগকর্তা-প্রদত্ত পরিবহন।',
        },
      },
      utilities: {
        monthlyEstimate: { min: 0, max: 0 },
        notes: {
          en: 'Usually included in employer-provided accommodation.',
          bn: 'সাধারণত নিয়োগকর্তা-প্রদত্ত বাসস্থানে অন্তর্ভুক্ত।',
        },
      },
    },
    popularityRank: 1,
    isActive: true,
  },

  {
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flagEmoji: '🇦🇪',
    region: 'Middle East',
    overview: {
      en: 'The UAE, particularly Dubai and Abu Dhabi, is a top destination for Bangladeshi workers seeking opportunities in construction, hospitality, and service sectors. The country offers tax-free salaries, modern amenities, and a cosmopolitan environment. However, the cost of living is higher than other Gulf countries, and workers should ensure they understand their contracts fully before migrating.',
      bn: 'সংযুক্ত আরব আমিরাত, বিশেষ করে দুবাই এবং আবুধাবি, নির্মাণ, আতিথেয়তা এবং সেবা খাতে সুযোগ খুঁজতে বাংলাদেশী শ্রমিকদের জন্য একটি শীর্ষ গন্তব্য।',
    },
    salaryRanges: [
      {
        jobType: 'construction',
        title: { en: 'Construction Worker', bn: 'নির্মাণ শ্রমিক' },
        minSalary: 900,
        maxSalary: 1800,
        currency: 'AED',
        period: 'monthly',
        notes: {
          en: 'Higher salaries in Dubai. Accommodation usually provided.',
          bn: 'দুবাইতে উচ্চ বেতন। বাসস্থান সাধারণত প্রদান করা হয়।',
        },
      },
      {
        jobType: 'hospitality',
        title: { en: 'Hotel & Restaurant Staff', bn: 'হোটেল ও রেস্টুরেন্ট কর্মী' },
        minSalary: 1200,
        maxSalary: 2500,
        currency: 'AED',
        period: 'monthly',
        notes: {
          en: 'Tips and service charges can significantly increase income.',
          bn: 'টিপস এবং সেবা চার্জ আয় উল্লেখযোগ্যভাবে বৃদ্ধি করতে পারে।',
        },
      },
      {
        jobType: 'retail',
        title: { en: 'Retail Sales', bn: 'খুচরা বিক্রয়' },
        minSalary: 1500,
        maxSalary: 3000,
        currency: 'AED',
        period: 'monthly',
        notes: {
          en: 'Commission-based earnings possible in some positions.',
          bn: 'কিছু পদে কমিশন-ভিত্তিক আয় সম্ভব।',
        },
      },
    ],
    culture: {
      language: {
        official: ['Arabic'],
        commonlySpoken: ['English', 'Hindi', 'Urdu', 'Bengali'],
      },
      religion: {
        primary: 'Islam',
        important: {
          en: 'UAE is more liberal than other Gulf states, but Islamic values must be respected. Other religions can be practiced privately.',
          bn: 'সংযুক্ত আরব আমিরাত অন্যান্য উপসাগরীয় রাজ্যের তুলনায় বেশি উদার, তবে ইসলামিক মূল্যবোধকে সম্মান করতে হবে।',
        },
      },
      customs: {
        dressCode: {
          en: 'Modest dress in public. Shorts and sleeveless tops acceptable in hotels and beaches, but conservative elsewhere.',
          bn: 'প্রকাশ্যে শালীন পোশাক। হোটেল এবং সৈকতে শর্টস এবং হাতাবিহীন টপস গ্রহণযোগ্য, তবে অন্যত্র রক্ষণশীল।',
        },
        workCulture: {
          en: 'Work week varies by sector. Government: Sunday-Thursday. Private: Monday-Friday common. Professional environment.',
          bn: 'কর্ম সপ্তাহ খাত অনুযায়ী পরিবর্তিত হয়। সরকারি: রবিবার-বৃহস্পতিবার। প্রাইভেট: সোমবার-শুক্রবার সাধারণ।',
        },
        publicBehavior: {
          en: 'Maintain respectful behavior. No public intoxication. Be mindful during Ramadan (no eating/drinking in public during daytime).',
          bn: 'সম্মানজনক আচরণ বজায় রাখুন। কোন প্রকাশ্য নেশা নয়। রমজানের সময় সতর্ক থাকুন।',
        },
      },
      doAndDonts: {
        dos: [
          { en: 'Greet with "As-salamu alaykum"', bn: '"আসসালামু আলাইকুম" দিয়ে শুভেচ্ছা জানান' },
          { en: 'Keep receipts and contracts', bn: 'রসিদ এবং চুক্তি রাখুন' },
          { en: 'Use metro and public transport', bn: 'মেট্রো এবং পাবলিক ট্রান্সপোর্ট ব্যবহার করুন' },
          { en: 'Learn basic Arabic phrases', bn: 'মৌলিক আরবি বাক্যাংশ শিখুন' },
        ],
        donts: [
          { en: 'Do not drink alcohol in public', bn: 'প্রকাশ্যে মদ্যপান করবেন না' },
          { en: 'Do not take photos of people without permission', bn: 'অনুমতি ছাড়া মানুষের ছবি তুলবেন না' },
          { en: 'Do not engage in public displays of affection', bn: 'প্রকাশ্যে স্নেহ প্রদর্শন করবেন না' },
          { en: 'Do not work illegally or without proper visa', bn: 'অবৈধভাবে বা সঠিক ভিসা ছাড়া কাজ করবেন না' },
        ],
      },
    },
    legalRights: {
      laborLaws: {
        workingHours: {
          standard: 48,
          maximum: 60,
          notes: {
            en: '8 hours per day, reduced to 6 hours during Ramadan.',
            bn: 'দিনে ৮ ঘণ্টা, রমজানে ৬ ঘণ্টায় হ্রাস।',
          },
        },
        weeklyRest: {
          days: 1,
          notes: {
            en: 'Friday or another day as specified in contract.',
            bn: 'শুক্রবার বা চুক্তিতে উল্লিখিত অন্য দিন।',
          },
        },
        paidLeave: {
          annual: 30,
          sick: 90,
          notes: {
            en: '30 days annual leave after 1 year. 90 days sick leave (paid/unpaid based on duration).',
            bn: '১ বছর পরে ৩০ দিন বার্ষিক ছুটি। ৯০ দিন অসুস্থতা ছুটি।',
          },
        },
        overtimePay: {
          rate: '125% for regular overtime, 150% for night work',
          notes: {
            en: 'Overtime beyond 48 hours per week.',
            bn: 'সপ্তাহে ৪৮ ঘণ্টার বেশি ওভারটাইম।',
          },
        },
      },
      workerProtections: [
        {
          right: { en: 'Wage Protection System (WPS)', bn: 'মজুরি সুরক্ষা ব্যবস্থা (WPS)' },
          description: {
            en: 'All salaries must be paid through WPS, ensuring timely and full payment.',
            bn: 'সকল বেতন WPS এর মাধ্যমে প্রদান করতে হবে, সময়মত এবং সম্পূর্ণ অর্থ প্রদান নিশ্চিত করে।',
          },
        },
        {
          right: { en: 'End of Service Benefits', bn: 'সেবা সমাপ্তি সুবিধা' },
          description: {
            en: 'Gratuity payment calculated based on years of service upon contract completion.',
            bn: 'চুক্তি সমাপ্তির পরে সেবা বছরের উপর ভিত্তি করে গ্র্যাচুইটি প্রদান করা হয়।',
          },
        },
      },
      contractRequirements: {
        mustHaveWrittenContract: true,
        contractLanguage: 'Arabic and English',
        minimumWage: {
          amount: 0,
          currency: 'AED',
          notes: {
            en: 'No official minimum wage. Salary specified in contract.',
            bn: 'কোন সরকারি ন্যূনতম মজুরি নেই। চুক্তিতে বেতন উল্লেখ করা হয়।',
          },
        },
      },
      visaAndResidency: {
        visaTypes: ['Employment Visa', 'Residence Permit'],
        renewalPeriod: '2-3 years',
        sponsorshipRules: {
          en: 'Employer sponsorship required. Some flexibility with job changes under new labor law.',
          bn: 'নিয়োগকর্তা স্পন্সরশিপ প্রয়োজন। নতুন শ্রম আইনের অধীনে চাকরি পরিবর্তনে কিছু নমনীয়তা।',
        },
        exitPermitRequired: false,
      },
    },
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: {
          en: 'Embassy of Bangladesh in Abu Dhabi',
          bn: 'আবুধাবিতে বাংলাদেশ দূতাবাস',
        },
        address: {
          en: 'Plot No. 26, Sector W-59/02, Diplomatic Area, Abu Dhabi, UAE',
          bn: 'প্লট নং ২৬, সেক্টর W-59/02, ডিপ্লোমেটিক এলাকা, আবুধাবি, সংযুক্ত আরব আমিরাত',
        },
        phone: ['+971-2-4472600', '+971-2-4472700'],
        email: 'mission.abudhabi@mofa.gov.bd',
        emergencyHotline: '+971-50-644-4463',
        website: 'https://www.abudhabi.mission.gov.bd',
        workingHours: {
          en: 'Sunday-Thursday: 8:00 AM - 3:00 PM',
          bn: 'রবিবার-বৃহস্পতিবার: সকাল ৮:০০ - দুপুর ৩:০০',
        },
      },
      localEmergencyServices: {
        police: '999',
        ambulance: '998',
        fire: '997',
        generalEmergency: '112',
      },
      helplines: [
        {
          name: { en: 'MOHRE Helpline', bn: 'MOHRE হেল্পলাইন' },
          number: '600590000',
          purpose: {
            en: 'Ministry of Human Resources - Labor complaints and inquiries',
            bn: 'মানব সম্পদ মন্ত্রণালয় - শ্রম অভিযোগ এবং তদন্ত',
          },
          availability: { en: '24/7', bn: '২৪/৭' },
        },
      ],
    },
    livingCosts: {
      currency: 'AED',
      accommodation: {
        providedByEmployer: true,
        averageRent: {
          min: 1500,
          max: 3000,
          notes: {
            en: 'If not provided by employer. Shared accommodation common for workers.',
            bn: 'যদি নিয়োগকর্তা দ্বারা প্রদান না করা হয়। শ্রমিকদের জন্য শেয়ারড বাসস্থান সাধারণ।',
          },
        },
      },
      food: {
        monthlyEstimate: { min: 500, max: 1000 },
        notes: {
          en: 'Varies by lifestyle. Indian/Pakistani restaurants affordable.',
          bn: 'জীবনযাত্রার ধরণ অনুসারে পরিবর্তিত। ভারতীয়/পাকিস্তানি রেস্তোরাঁ সাশ্রয়ী।',
        },
      },
      transportation: {
        monthlyEstimate: { min: 200, max: 400 },
        notes: {
          en: 'Dubai Metro, buses available. Some employers provide transport.',
          bn: 'দুবাই মেট্রো, বাস উপলব্ধ। কিছু নিয়োগকর্তা পরিবহন প্রদান করে।',
        },
      },
      utilities: {
        monthlyEstimate: { min: 200, max: 500 },
        notes: {
          en: 'Electricity, water, internet if renting independently.',
          bn: 'বিদ্যুৎ, পানি, ইন্টারনেট যদি স্বাধীনভাবে ভাড়া নেওয়া হয়।',
        },
      },
    },
    popularityRank: 2,
    isActive: true,
  },

  {
    country: 'Malaysia',
    countryCode: 'MY',
    flagEmoji: '🇲🇾',
    region: 'Southeast Asia',
    overview: {
      en: 'Malaysia is a popular destination for Bangladeshi workers, especially in manufacturing, plantation, construction, and domestic work sectors. The country offers a multicultural environment with significant Muslim population, making cultural adaptation easier. The climate is similar to Bangladesh, and living costs are relatively affordable.',
      bn: 'মালয়েশিয়া বাংলাদেশী শ্রমিকদের জন্য একটি জনপ্রিয় গন্তব্য, বিশেষ করে উৎপাদন, বাগান, নির্মাণ এবং গৃহকর্মের খাতে।',
    },
    salaryRanges: [
      {
        jobType: 'manufacturing',
        title: { en: 'Manufacturing Worker', bn: 'উৎপাদন শ্রমিক' },
        minSalary: 1200,
        maxSalary: 2000,
        currency: 'MYR',
        period: 'monthly',
        notes: {
          en: 'Electronics, textiles, and food processing industries.',
          bn: 'ইলেকট্রনিক্স, টেক্সটাইল এবং খাদ্য প্রক্রিয়াকরণ শিল্প।',
        },
      },
      {
        jobType: 'construction',
        title: { en: 'Construction Worker', bn: 'নির্মাণ শ্রমিক' },
        minSalary: 1300,
        maxSalary: 2200,
        currency: 'MYR',
        period: 'monthly',
        notes: {
          en: 'Ongoing construction projects across the country.',
          bn: 'দেশজুড়ে চলমান নির্মাণ প্রকল্প।',
        },
      },
      {
        jobType: 'agriculture',
        title: { en: 'Plantation Worker', bn: 'বাগান শ্রমিক' },
        minSalary: 1000,
        maxSalary: 1800,
        currency: 'MYR',
        period: 'monthly',
        notes: {
          en: 'Palm oil plantations. Accommodation often provided.',
          bn: 'পাম তেল বাগান। বাসস্থান প্রায়শই প্রদান করা হয়।',
        },
      },
    ],
    culture: {
      language: {
        official: ['Malay'],
        commonlySpoken: ['English', 'Chinese', 'Tamil'],
      },
      religion: {
        primary: 'Islam',
        important: {
          en: 'Malaysia is a multi-religious country with Islam as the official religion. Buddhist, Hindu, and Christian communities are present.',
          bn: 'মালয়েশিয়া একটি বহু-ধর্মীয় দেশ যেখানে ইসলাম সরকারি ধর্ম।',
        },
      },
      customs: {
        dressCode: {
          en: 'Casual dress acceptable. Modest dress appreciated, especially in religious sites.',
          bn: 'ক্যাজুয়াল পোশাক গ্রহণযোগ্য। বিশেষ করে ধর্মীয় স্থানে শালীন পোশাক প্রশংসিত।',
        },
        workCulture: {
          en: 'Standard work week Monday-Friday. Some factories operate shifts. Respectful and hierarchical workplace culture.',
          bn: 'মান্দার্ড কর্ম সপ্তাহ সোমবার-শুক্রবার। কিছু কারখানা শিফট পরিচালনা করে।',
        },
        publicBehavior: {
          en: 'Friendly and welcoming culture. Remove shoes when entering homes. Use right hand for giving and receiving.',
          bn: 'বন্ধুত্বপূর্ণ এবং স্বাগতপূর্ণ সংস্কৃতি। ঘরে প্রবেশের সময় জুতা খুলুন।',
        },
      },
      doAndDonts: {
        dos: [
          { en: 'Learn basic Malay phrases', bn: 'মৌলিক মালয় বাক্যাংশ শিখুন' },
          { en: 'Respect local customs and traditions', bn: 'স্থানীয় রীতিনীতি এবং ঐতিহ্য সম্মান করুন' },
          { en: 'Keep your passport and work permit safe', bn: 'আপনার পাসপোর্ট এবং কর্ম অনুমতি নিরাপদ রাখুন' },
          { en: 'Join Bangladeshi community groups', bn: 'বাংলাদেশী সম্প্রদায় গোষ্ঠীতে যোগ দিন' },
        ],
        donts: [
          { en: 'Do not overstay your visa', bn: 'আপনার ভিসার সময় অতিক্রম করবেন না' },
          { en: 'Do not work without proper permits', bn: 'সঠিক অনুমতি ছাড়া কাজ করবেন না' },
          { en: 'Do not litter or spit in public', bn: 'প্রকাশ্যে আবর্জনা ফেলবেন বা থুথু ফেলবেন না' },
          { en: 'Do not touch someone head', bn: 'কারো মাথা স্পর্শ করবেন না' },
        ],
      },
    },
    legalRights: {
      laborLaws: {
        workingHours: {
          standard: 48,
          maximum: 60,
          notes: {
            en: '8 hours per day, 6 days per week. Overtime regulated.',
            bn: 'দিনে ৮ ঘণ্টা, সপ্তাহে ৬ দিন। ওভারটাইম নিয়ন্ত্রিত।',
          },
        },
        weeklyRest: {
          days: 1,
          notes: {
            en: 'One rest day per week, usually Sunday.',
            bn: 'প্রতি সপ্তাহে একদিন বিশ্রাম, সাধারণত রবিবার।',
          },
        },
        paidLeave: {
          annual: 14,
          sick: 14,
          notes: {
            en: 'Annual leave increases with years of service. Sick leave with medical certificate.',
            bn: 'সেবা বছরের সাথে বার্ষিক ছুটি বৃদ্ধি পায়।',
          },
        },
        overtimePay: {
          rate: '1.5x for normal days, 2x for rest days',
          notes: {
            en: 'Overtime pay mandatory for hours beyond 8 per day.',
            bn: 'দিনে ৮ ঘণ্টার বেশি জন্য ওভারটাইম বেতন বাধ্যতামূলক।',
          },
        },
      },
      workerProtections: [
        {
          right: { en: 'Protection against exploitation', bn: 'শোষণের বিরুদ্ধে সুরক্ষা' },
          description: {
            en: 'Workers can report abuse to Department of Labour. Legal aid available.',
            bn: 'শ্রমিকরা শ্রম বিভাগে অপব্যবহার রিপোর্ট করতে পারে।',
          },
        },
      ],
      contractRequirements: {
        mustHaveWrittenContract: true,
        contractLanguage: 'Malay and English',
        minimumWage: {
          amount: 1200,
          currency: 'MYR',
          notes: {
            en: 'National minimum wage applies to all sectors.',
            bn: 'জাতীয় ন্যূনতম মজুরি সকল খাতে প্রযোজ্য।',
          },
        },
      },
      visaAndResidency: {
        visaTypes: ['Work Permit'],
        renewalPeriod: '1-2 years',
        sponsorshipRules: {
          en: 'Employer sponsorship required. Work permit tied to specific employer.',
          bn: 'নিয়োগকর্তা স্পন্সরশিপ প্রয়োজন।',
        },
        exitPermitRequired: false,
      },
    },
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: {
          en: 'High Commission of Bangladesh in Kuala Lumpur',
          bn: 'কুয়ালালামপুরে বাংলাদেশ হাই কমিশন',
        },
        address: {
          en: '204B Jalan Ampang, 50450 Kuala Lumpur, Malaysia',
          bn: '২০৪B জালান আম্পাং, ৫০৪৫০ কুয়ালালামপুর, মালয়েশিয়া',
        },
        phone: ['+603-2161-6891', '+603-2161-6895'],
        email: 'mission.kualalumpur@mofa.gov.bd',
        emergencyHotline: '+60-12-372-4058',
        website: 'https://www.kualalumpur.mission.gov.bd',
        workingHours: {
          en: 'Monday-Friday: 9:00 AM - 5:00 PM',
          bn: 'সোমবার-শুক্রবার: সকাল ৯:০০ - বিকাল ৫:০০',
        },
      },
      localEmergencyServices: {
        police: '999',
        ambulance: '999',
        fire: '994',
        generalEmergency: '999',
      },
      helplines: [
        {
          name: { en: 'Ministry of Human Resources', bn: 'মানব সম্পদ মন্ত্রণালয়' },
          number: '1-800-88-8488',
          purpose: {
            en: 'Labour-related inquiries and complaints',
            bn: 'শ্রম-সম্পর্কিত তদন্ত এবং অভিযোগ',
          },
          availability: { en: 'Mon-Fri 8AM-5PM', bn: 'সোম-শুক্র সকাল ৮-বিকাল ৫' },
        },
      ],
    },
    livingCosts: {
      currency: 'MYR',
      accommodation: {
        providedByEmployer: true,
        averageRent: {
          min: 300,
          max: 600,
          notes: {
            en: 'Shared accommodation if not provided by employer.',
            bn: 'যদি নিয়োগকর্তা দ্বারা প্রদান না করা হয় তবে শেয়ারড বাসস্থান।',
          },
        },
      },
      food: {
        monthlyEstimate: { min: 300, max: 500 },
        notes: {
          en: 'Affordable local food. Halal food widely available.',
          bn: 'সাশ্রয়ী স্থানীয় খাবার। হালাল খাবার ব্যাপকভাবে উপলব্ধ।',
        },
      },
      transportation: {
        monthlyEstimate: { min: 100, max: 200 },
        notes: {
          en: 'Public transport, buses. Some areas require personal transport.',
          bn: 'পাবলিক ট্রান্সপোর্ট, বাস। কিছু এলাকায় ব্যক্তিগত পরিবহন প্রয়োজন।',
        },
      },
      utilities: {
        monthlyEstimate: { min: 50, max: 100 },
        notes: {
          en: 'If not included in accommodation.',
          bn: 'যদি বাসস্থানে অন্তর্ভুক্ত না থাকে।',
        },
      },
    },
    popularityRank: 3,
    isActive: true,
  },
];

// Seed function
const seedCountryGuides = async () => {
  try {
    console.log('🌱 Starting country guide seeding...');

    // Clear existing guides
    await CountryGuide.deleteMany({});
    console.log('✓ Cleared existing country guides');

    // Insert sample guides
    const guides = await CountryGuide.insertMany(sampleGuides);
    console.log(`✓ Successfully seeded ${guides.length} country guides\n`);

    // Display summary
    console.log('📊 Summary by country:');
    guides.forEach((guide) => {
      console.log(`   ${guide.flagEmoji} ${guide.country} (${guide.region})`);
      console.log(`      - ${guide.salaryRanges.length} job types`);
      console.log(`      - Popularity rank: ${guide.popularityRank}`);
    });

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Test API: GET http://localhost:5000/api/country-guides');
    console.log('   3. View popular guides: GET http://localhost:5000/api/country-guides?popular=true');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding country guides:', error);
    process.exit(1);
  }
};

// Run seeder
connectDB().then(seedCountryGuides);
