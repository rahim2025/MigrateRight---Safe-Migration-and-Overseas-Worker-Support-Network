/**
 * Country Guides Seed Data
 * Matches the CountryGuide.model.js schema structure
 */

const countriesData = [
  {
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flagEmoji: '🇸🇦',
    region: 'Middle East',
    overview: {
      en: 'Saudi Arabia is one of the largest destinations for migrant workers in the Middle East, offering employment in construction, domestic work, healthcare, and oil & gas sectors.',
      bn: 'সৌদি আরব মধ্যপ্রাচ্যের অভিবাসী শ্রমিকদের জন্য বৃহত্তম গন্তব্যগুলির মধ্যে একটি।'
    },
    salaryRanges: [
      {
        jobType: 'domestic_work',
        title: { en: 'Domestic Worker', bn: 'গৃহস্থালি কর্মী' },
        minSalary: 1500,
        maxSalary: 2500,
        currency: 'SAR',
        period: 'monthly'
      },
      {
        jobType: 'construction',
        title: { en: 'Construction Worker', bn: 'নির্মাণ শ্রমিক' },
        minSalary: 1800,
        maxSalary: 4000,
        currency: 'SAR',
        period: 'monthly'
      },
      {
        jobType: 'healthcare',
        title: { en: 'Healthcare Worker', bn: 'স্বাস্থ্যসেবা কর্মী' },
        minSalary: 3000,
        maxSalary: 8000,
        currency: 'SAR',
        period: 'monthly'
      },
      {
        jobType: 'hospitality',
        title: { en: 'Hotel Staff', bn: 'হোটেল কর্মী' },
        minSalary: 1700,
        maxSalary: 3500,
        currency: 'SAR',
        period: 'monthly'
      }
    ],
    culture: {
      language: {
        official: ['Arabic'],
        commonlySpoken: ['Arabic', 'English', 'Urdu']
      },
      religion: {
        primary: 'Islam',
        important: {
          en: 'Islam is the official religion. All workers must respect prayer times.',
          bn: 'ইসলাম সরকারী ধর্ম। সকল শ্রমিকদের নামাজের সময় সম্মান করতে হবে।'
        }
      },
      customs: {
        dressCode: {
          en: 'Conservative dress required. Women must wear abaya in public.',
          bn: 'রক্ষণশীল পোশাক প্রয়োজন।'
        },
        workCulture: {
          en: 'Respect prayer times. Friday-Saturday weekend.',
          bn: 'নামাজের সময় সম্মান করুন।'
        },
        publicBehavior: {
          en: 'Modest behavior expected. Alcohol is prohibited.',
          bn: 'শালীন আচরণ প্রত্যাশিত।'
        },
        holidays: [
          { name: { en: 'Eid al-Fitr', bn: 'ঈদুল ফিতর' }, description: { en: 'End of Ramadan', bn: 'রমজানের সমাপ্তি' } },
          { name: { en: 'Eid al-Adha', bn: 'ঈদুল আযহা' }, description: { en: 'Festival of Sacrifice', bn: 'কুরবানীর ঈদ' } },
          { name: { en: 'Saudi National Day', bn: 'সৌদি জাতীয় দিবস' }, description: { en: 'September 23', bn: '২৩ সেপ্টেম্বর' } }
        ]
      },
      doAndDonts: {
        dos: [
          { en: 'Greet with right hand', bn: 'ডান হাত দিয়ে অভিবাদন করুন' },
          { en: 'Respect prayer times', bn: 'নামাজের সময় সম্মান করুন' }
        ],
        donts: [
          { en: 'Do not consume alcohol', bn: 'মদ পান করবেন না' },
          { en: 'Do not eat with left hand', bn: 'বাম হাতে খাবেন না' }
        ]
      }
    },
    legalRights: {
      laborLaws: {
        workingHours: {
          standard: 8,
          maximum: 48,
          notes: { en: '8 hours per day, 48 hours per week', bn: 'দিনে ৮ ঘন্টা' }
        },
        weeklyRest: {
          days: 1,
          notes: { en: 'Friday is the main day off', bn: 'শুক্রবার ছুটির দিন' }
        },
        paidLeave: {
          annual: 21,
          sick: 30,
          notes: { en: '21 days annual leave, 30 days sick leave', bn: '২১ দিন বার্ষিক ছুটি' }
        },
        overtimePay: {
          rate: '150%',
          notes: { en: 'Overtime at 150%', bn: 'ওভারটাইম ১৫০%' }
        }
      },
      workerProtections: [
        {
          right: { en: 'Wage Protection', bn: 'মজুরি সুরক্ষা' },
          description: { en: 'Wages must be paid through WPS', bn: 'WPS এর মাধ্যমে মজুরি প্রদান' }
        }
      ],
      contractRequirements: {
        mustHaveWrittenContract: true,
        contractLanguage: 'Arabic and worker language'
      },
      visaAndResidency: {
        visaTypes: ['Work Visa', 'Domestic Worker Visa', 'Iqama'],
        renewalPeriod: '2 years',
        sponsorshipRules: { en: 'Kafala system applies', bn: 'কাফালা ব্যবস্থা প্রযোজ্য' },
        exitPermitRequired: true
      }
    },
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: { en: 'Bangladesh Embassy Riyadh', bn: 'বাংলাদেশ দূতাবাস রিয়াদ' },
        address: { en: 'Diplomatic Quarter, Riyadh', bn: 'কূটনৈতিক কোয়ার্টার, রিয়াদ' },
        phone: ['+966-11-488-7177'],
        email: 'mission.riyadh@mofa.gov.bd',
        emergencyHotline: '+966-11-488-7177'
      },
      localEmergencyServices: {
        police: '999',
        ambulance: '997',
        fire: '998'
      },
      workerSupportOrganizations: [],
      helplines: []
    },
    livingCosts: {
      currency: 'SAR',
      accommodation: {
        providedByEmployer: true,
        averageRent: { min: 800, max: 1500 }
      },
      food: { monthlyEstimate: { min: 400, max: 800 } },
      transportation: { monthlyEstimate: { min: 200, max: 500 } },
      utilities: { monthlyEstimate: { min: 100, max: 300 } }
    },
    healthAndSafety: {
      healthcare: {
        system: { en: 'Public healthcare available', bn: 'সরকারি স্বাস্থ্যসেবা উপলব্ধ' },
        coverage: { en: 'Employers must provide health insurance', bn: 'স্বাস্থ্য বীমা প্রদান করতে হবে' }
      },
      commonHealthRisks: [],
      vaccinationRequirements: ['COVID-19']
    },
    resources: {
      usefulPhrasebook: [
        { english: 'Hello', local: 'As-salamu alaykum', bengali: 'হ্যালো' },
        { english: 'Thank you', local: 'Shukran', bengali: 'ধন্যবাদ' }
      ]
    },
    popularityRank: 1,
    isActive: true
  },
  {
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flagEmoji: '🇦🇪',
    region: 'Middle East',
    overview: {
      en: 'The UAE offers opportunities in construction, hospitality, retail, and healthcare.',
      bn: 'সংযুক্ত আরব আমিরাত বিভিন্ন খাতে সুযোগ প্রদান করে।'
    },
    salaryRanges: [
      {
        jobType: 'construction',
        title: { en: 'Construction Worker', bn: 'নির্মাণ শ্রমিক' },
        minSalary: 2000,
        maxSalary: 4500,
        currency: 'AED',
        period: 'monthly'
      },
      {
        jobType: 'hospitality',
        title: { en: 'Hotel Staff', bn: 'হোটেল কর্মী' },
        minSalary: 1800,
        maxSalary: 3800,
        currency: 'AED',
        period: 'monthly'
      },
      {
        jobType: 'healthcare',
        title: { en: 'Healthcare Worker', bn: 'স্বাস্থ্যসেবা কর্মী' },
        minSalary: 3200,
        maxSalary: 9000,
        currency: 'AED',
        period: 'monthly'
      },
      {
        jobType: 'domestic_work',
        title: { en: 'Domestic Worker', bn: 'গৃহস্থালি কর্মী' },
        minSalary: 1500,
        maxSalary: 3000,
        currency: 'AED',
        period: 'monthly'
      }
    ],
    culture: {
      language: {
        official: ['Arabic'],
        commonlySpoken: ['Arabic', 'English', 'Hindi', 'Urdu']
      },
      religion: {
        primary: 'Islam',
        important: { en: 'Islam is official religion', bn: 'ইসলাম সরকারী ধর্ম' }
      },
      customs: {
        dressCode: { en: 'Modest dress required', bn: 'শালীন পোশাক প্রয়োজন' },
        workCulture: { en: 'Friday-Saturday weekend', bn: 'শুক্র-শনিবার ছুটি' },
        publicBehavior: { en: 'Respect Islamic traditions', bn: 'ইসলামী ঐতিহ্যের সম্মান' },
        holidays: [
          { name: { en: 'Eid al-Fitr', bn: 'ঈদুল ফিতর' }, description: { en: 'End of Ramadan', bn: 'রমজানের সমাপ্তি' } },
          { name: { en: 'UAE National Day', bn: 'জাতীয় দিবস' }, description: { en: 'December 2', bn: '২ ডিসেম্বর' } }
        ]
      },
      doAndDonts: {
        dos: [{ en: 'Accept hospitality', bn: 'আতিথেয়তা গ্রহণ করুন' }],
        donts: [{ en: 'Do not discuss politics', bn: 'রাজনীতি এড়িয়ে চলুন' }]
      }
    },
    legalRights: {
      laborLaws: {
        workingHours: { standard: 8, maximum: 48 },
        weeklyRest: { days: 1 },
        paidLeave: { annual: 30, sick: 90 },
        overtimePay: { rate: '125-150%' }
      },
      workerProtections: [],
      contractRequirements: {
        mustHaveWrittenContract: true,
        contractLanguage: 'Arabic and English'
      },
      visaAndResidency: {
        visaTypes: ['Employment Visa', 'Domestic Worker Visa'],
        renewalPeriod: '2-3 years',
        sponsorshipRules: { en: 'Employer sponsorship required', bn: 'নিয়োগকর্তা স্পন্সরশিপ প্রয়োজন' },
        exitPermitRequired: false
      }
    },
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: { en: 'Bangladesh Embassy Abu Dhabi', bn: 'বাংলাদেশ দূতাবাস আবুধাবি' },
        address: { en: 'Shaikh Zayed Street, Abu Dhabi', bn: 'শেখ জায়েদ স্ট্রিট' },
        phone: ['+971-2-406-4700'],
        email: 'mission.abudhabi@mofa.gov.bd',
        emergencyHotline: '+971-2-406-4700'
      },
      localEmergencyServices: {
        police: '999',
        ambulance: '998',
        fire: '997'
      },
      workerSupportOrganizations: [],
      helplines: []
    },
    livingCosts: {
      currency: 'AED',
      accommodation: {
        providedByEmployer: true,
        averageRent: { min: 1200, max: 2500 }
      },
      food: { monthlyEstimate: { min: 500, max: 1000 } },
      transportation: { monthlyEstimate: { min: 200, max: 600 } },
      utilities: { monthlyEstimate: { min: 200, max: 500 } }
    },
    healthAndSafety: {
      healthcare: {
        system: { en: 'Modern healthcare', bn: 'আধুনিক স্বাস্থ্যসেবা' },
        coverage: { en: 'Mandatory health insurance', bn: 'বাধ্যতামূলক স্বাস্থ্য বীমা' }
      },
      commonHealthRisks: [],
      vaccinationRequirements: ['COVID-19']
    },
    resources: {
      usefulPhrasebook: [
        { english: 'Hello', local: 'Marhaba', bengali: 'হ্যালো' }
      ]
    },
    popularityRank: 2,
    isActive: true
  },
  {
    country: 'Qatar',
    countryCode: 'QA',
    flagEmoji: '🇶🇦',
    region: 'Middle East',
    overview: {
      en: 'Qatar offers employment in construction, oil & gas, hospitality, and healthcare.',
      bn: 'কাতার বিভিন্ন খাতে কর্মসংস্থানের সুযোগ প্রদান করে।'
    },
    salaryRanges: [
      {
        jobType: 'construction',
        title: { en: 'Construction Worker', bn: 'নির্মাণ শ্রমিক' },
        minSalary: 2100,
        maxSalary: 5000,
        currency: 'QAR',
        period: 'monthly'
      },
      {
        jobType: 'healthcare',
        title: { en: 'Healthcare Worker', bn: 'স্বাস্থ্যসেবা কর্মী' },
        minSalary: 3500,
        maxSalary: 10000,
        currency: 'QAR',
        period: 'monthly'
      },
      {
        jobType: 'hospitality',
        title: { en: 'Hotel Staff', bn: 'হোটেল কর্মী' },
        minSalary: 2000,
        maxSalary: 4200,
        currency: 'QAR',
        period: 'monthly'
      },
      {
        jobType: 'domestic_work',
        title: { en: 'Domestic Worker', bn: 'গৃহস্থালি কর্মী' },
        minSalary: 1600,
        maxSalary: 3200,
        currency: 'QAR',
        period: 'monthly'
      }
    ],
    culture: {
      language: {
        official: ['Arabic'],
        commonlySpoken: ['Arabic', 'English']
      },
      religion: {
        primary: 'Islam',
        important: { en: 'Islam is the religion of Qatar', bn: 'ইসলাম কাতারের ধর্ম' }
      },
      customs: {
        dressCode: { en: 'Conservative dress expected', bn: 'রক্ষণশীল পোশাক প্রত্যাশিত' },
        workCulture: { en: 'Friday-Saturday weekend', bn: 'শুক্র-শনিবার ছুটি' },
        publicBehavior: { en: 'Modest behavior expected', bn: 'শালীন আচরণ প্রত্যাশিত' },
        holidays: [
          { name: { en: 'Eid al-Fitr', bn: 'ঈদুল ফিতর' }, description: { en: 'End of Ramadan', bn: 'রমজানের সমাপ্তি' } },
          { name: { en: 'National Day', bn: 'জাতীয় দিবস' }, description: { en: 'December 18', bn: '১৮ ডিসেম্বর' } }
        ]
      },
      doAndDonts: {
        dos: [{ en: 'Accept hospitality', bn: 'আতিথেয়তা গ্রহণ করুন' }],
        donts: [{ en: 'Avoid discussing politics', bn: 'রাজনীতি এড়িয়ে চলুন' }]
      }
    },
    legalRights: {
      laborLaws: {
        workingHours: { standard: 8, maximum: 48 },
        weeklyRest: { days: 1 },
        paidLeave: { annual: 21, sick: 14 },
        overtimePay: { rate: '125%' }
      },
      workerProtections: [],
      contractRequirements: {
        mustHaveWrittenContract: true,
        contractLanguage: 'Arabic and English',
        minimumWage: { amount: 1000, currency: 'QAR' }
      },
      visaAndResidency: {
        visaTypes: ['Work Permit and Visa'],
        renewalPeriod: '2 years',
        sponsorshipRules: { en: 'Employer sponsorship required', bn: 'স্পন্সরশিপ প্রয়োজন' },
        exitPermitRequired: false
      }
    },
    emergencyContacts: {
      bangladeshiEmbassy: {
        name: { en: 'Bangladesh Embassy Doha', bn: 'বাংলাদেশ দূতাবাস দোহা' },
        address: { en: 'West Bay Area, Doha', bn: 'ওয়েস্ট বে এরিয়া' },
        phone: ['+974-4413-5771'],
        email: 'mission.doha@mofa.gov.bd',
        emergencyHotline: '+974-4413-5771'
      },
      localEmergencyServices: {
        police: '999',
        ambulance: '999',
        fire: '998'
      },
      workerSupportOrganizations: [],
      helplines: []
    },
    livingCosts: {
      currency: 'QAR',
      accommodation: {
        providedByEmployer: true,
        averageRent: { min: 1400, max: 3000 }
      },
      food: { monthlyEstimate: { min: 600, max: 1200 } },
      transportation: { monthlyEstimate: { min: 250, max: 600 } },
      utilities: { monthlyEstimate: { min: 150, max: 400 } }
    },
    healthAndSafety: {
      healthcare: {
        system: { en: 'Modern healthcare', bn: 'আধুনিক স্বাস্থ্যসেবা' },
        coverage: { en: 'Health insurance provided', bn: 'স্বাস্থ্য বীমা প্রদান' }
      },
      commonHealthRisks: [],
      vaccinationRequirements: ['COVID-19']
    },
    resources: {
      usefulPhrasebook: [
        { english: 'Hello', local: 'Marhaba', bengali: 'হ্যালো' }
      ]
    },
    popularityRank: 3,
    isActive: true
  }
];

module.exports = countriesData;
