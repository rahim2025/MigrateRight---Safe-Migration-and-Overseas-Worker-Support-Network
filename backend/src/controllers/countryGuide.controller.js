const guides = {
  SA: {
    countryInfo: {
      name: 'Saudi Arabia',
      code: 'SA',
      region: 'Middle East',
      officialLanguages: ['Arabic'],
      currency: 'Saudi Riyal (SAR)',
      timezone: 'UTC+3',
    },
    workOpportunities: {
      commonJobSectors: ['Construction', 'Oil & Gas', 'Hospitality', 'Domestic Work'],
      averageSalaryRanges: {
        Construction: 'SAR 2,500 - 4,500',
        'Oil & Gas': 'SAR 6,000 - 12,000',
        Hospitality: 'SAR 2,000 - 4,000',
        'Domestic Work': 'SAR 1,500 - 2,500',
      },
      demandLevel: 'high',
    },
    legalRequirements: {
      visaTypes: [
        { type: 'Work Visa', description: 'Employer-sponsored, tied to contract duration' },
        { type: 'Resident Permit (Iqama)', description: 'Required for legal stay and work' },
      ],
      workPermitProcess: [
        'Employer provides job offer and contract',
        'Medical exam and background checks',
        'Visa issuance from consulate',
        'Arrival, biometric registration, and Iqama issuance',
      ],
      requiredDocuments: ['Passport', 'Employment contract', 'Medical clearance', 'Police clearance', 'Passport photos'],
    },
    culturalNorms: {
      workplaceEtiquette: [
        'Arrive on time and show respect to supervisors',
        'Avoid discussing sensitive political or religious topics',
        'Use formal greetings and titles when addressing colleagues',
      ],
      dressCode: 'Modest attire expected; abayas for women in many areas; avoid sleeveless or shorts in workplaces',
      religiousPractices: 'Respect prayer times; some offices pause briefly; Friday is the holy day with shorter hours',
      languageTips: {
        commonPhrases: ['As-salamu alaykum (peace be upon you)', 'Shukran (thank you)'],
        communicationStyle: 'Polite, formal, and indirect; maintain respectful tone',
      },
      socialCustoms: {
        dos: ['Greet with respect', 'Accept refreshments when offered'],
        donts: ['Public displays of affection', 'Disrespecting local customs or religious sites'],
      },
      holidays: ['Eid al-Fitr', 'Eid al-Adha', 'Saudi National Day (Sep 23)'],
    },
    emergencyContacts: {
      embassy: {
        address: 'Your embassy in Riyadh or Jeddah',
        phone: '+966-xxx-xxxxxx',
        email: 'support@yourembassy.example',
        website: 'https://yourembassy.example',
        emergencyHotline: '+966-xxx-xxxxxx',
      },
      localAuthorities: [
        { type: 'police', number: '999' },
        { type: 'ambulance', number: '997' },
        { type: 'fire', number: '998' },
      ],
      workerSupport: [
        { type: 'migrantWorkerHelpline', contact: 'Human Rights Hotline: 19911' },
        { type: 'legalAidOrganization', contact: 'Local legal aid offices (city-specific)' },
        { type: 'sheltersAndSafeSpaces', contact: 'Government or NGO shelters (contact embassy for referral)' },
      ],
      healthServices: [
        { type: 'hospital', contact: 'Local government hospital (city-specific)' },
        { type: 'clinic', contact: 'Primary care clinics (city-specific)' },
        { type: 'mentalHealthSupport', contact: 'Confidential helplines via embassy/NGO' },
      ],
      police: '999',
      ambulance: '997',
      fire: '998',
      embassySupport: 'Contact your embassy or consulate',
    },
    salaryExpectations: {
      currency: 'SAR',
      payFrequency: 'Monthly',
      lastUpdated: '2024-01-01',
      source: 'Saudi labor market data (illustrative)',
      bySector: [
        {
          sectorName: 'construction',
          minimumWage: { amount: 2000, currency: 'SAR' },
          averageSalary: { amount: 3500, currency: 'SAR' },
          maximumRange: { amount: 6000, currency: 'SAR' },
          experienceLevelImpact: { juniorPercent: '-10%', seniorPercent: '+25%' },
        },
        {
          sectorName: 'domestic_work',
          minimumWage: { amount: 1500, currency: 'SAR' },
          averageSalary: { amount: 2200, currency: 'SAR' },
          maximumRange: { amount: 3000, currency: 'SAR' },
          experienceLevelImpact: { juniorPercent: '-5%', seniorPercent: '+15%' },
        },
        {
          sectorName: 'hospitality',
          minimumWage: { amount: 1800, currency: 'SAR' },
          averageSalary: { amount: 2800, currency: 'SAR' },
          maximumRange: { amount: 4500, currency: 'SAR' },
          experienceLevelImpact: { juniorPercent: '-8%', seniorPercent: '+18%' },
        },
      ],
      livingCosts: {
        accommodation: { amount: 800, currency: 'SAR' },
        food: { amount: 600, currency: 'SAR' },
        transportation: { amount: 250, currency: 'SAR' },
      },
      savingsPotential: { estimatedMonthly: { amount: 1200, currency: 'SAR' } },
    },
  },
  AE: {
    countryInfo: {
      name: 'United Arab Emirates',
      code: 'AE',
      region: 'Middle East',
      officialLanguages: ['Arabic'],
      currency: 'UAE Dirham (AED)',
      timezone: 'UTC+4',
    },
    workOpportunities: {
      commonJobSectors: ['Construction', 'Hospitality', 'Logistics', 'Healthcare', 'Retail'],
      averageSalaryRanges: {
        Construction: 'AED 1,200 - 2,500',
        Hospitality: 'AED 1,500 - 3,000',
        Logistics: 'AED 2,000 - 4,000',
        Healthcare: 'AED 4,000 - 10,000',
        Retail: 'AED 1,800 - 3,500',
      },
      demandLevel: 'high',
    },
    legalRequirements: {
      visaTypes: [
        { type: 'Employment Visa', description: 'Issued with company sponsorship' },
        { type: 'Residence Permit', description: 'Stamped in passport after medicals and ID process' },
      ],
      workPermitProcess: [
        'Offer letter and contract',
        'Employment entry permit',
        'Medical tests and Emirates ID biometrics',
        'Residence visa stamping and labor card',
      ],
      requiredDocuments: ['Passport', 'Contract', 'Medical test results', 'Passport photos'],
    },
    culturalNorms: {
      workplaceEtiquette: [
        'Punctuality is valued; notify if delayed',
        'Respect hierarchy; formal greetings are common',
        'Avoid confrontational tone; be courteous',
      ],
      dressCode: 'Modest dress in public; business casual in offices; avoid revealing attire in most workplaces',
      religiousPractices: 'Respect prayer times; Ramadan may change working hours',
      languageTips: {
        commonPhrases: ['Marhaba (hello)', 'Shukran (thank you)'],
        communicationStyle: 'Polite and professional; English widely used in business',
      },
      socialCustoms: {
        dos: ['Be respectful during Ramadan', 'Use right hand for giving/receiving items'],
        donts: ['Public arguments', 'Public displays of affection'],
      },
      holidays: ['Eid al-Fitr', 'Eid al-Adha', 'UAE National Day (Dec 2)'],
    },
    emergencyContacts: {
      embassy: {
        address: 'Your embassy in Abu Dhabi or Dubai',
        phone: '+971-xx-xxxxxxx',
        email: 'support@yourembassy.example',
        website: 'https://yourembassy.example',
        emergencyHotline: '+971-xx-xxxxxxx',
      },
      localAuthorities: [
        { type: 'police', number: '999' },
        { type: 'ambulance', number: '998' },
        { type: 'fire', number: '997' },
      ],
      workerSupport: [
        { type: 'migrantWorkerHelpline', contact: 'MOHRE hotline: 80060' },
        { type: 'legalAidOrganization', contact: 'Local legal aid (emirate-specific)' },
        { type: 'sheltersAndSafeSpaces', contact: 'Government/NGO shelters (contact embassy for referral)' },
      ],
      healthServices: [
        { type: 'hospital', contact: 'Government hospital (emirate-specific)' },
        { type: 'clinic', contact: 'Primary care clinics (emirate-specific)' },
        { type: 'mentalHealthSupport', contact: 'Counseling hotlines via DHA/NGOs' },
      ],
      police: '999',
      ambulance: '998',
      fire: '997',
      embassySupport: 'Contact your embassy or consulate',
    },
    salaryExpectations: {
      currency: 'AED',
      payFrequency: 'Monthly',
      lastUpdated: '2024-01-01',
      source: 'UAE labor market data (illustrative)',
      bySector: [
        {
          sectorName: 'construction',
          minimumWage: { amount: 1200, currency: 'AED' },
          averageSalary: { amount: 2200, currency: 'AED' },
          maximumRange: { amount: 4000, currency: 'AED' },
          experienceLevelImpact: { juniorPercent: '-10%', seniorPercent: '+20%' },
        },
        {
          sectorName: 'hospitality',
          minimumWage: { amount: 1500, currency: 'AED' },
          averageSalary: { amount: 2500, currency: 'AED' },
          maximumRange: { amount: 4500, currency: 'AED' },
          experienceLevelImpact: { juniorPercent: '-7%', seniorPercent: '+18%' },
        },
        {
          sectorName: 'healthcare',
          minimumWage: { amount: 3500, currency: 'AED' },
          averageSalary: { amount: 7000, currency: 'AED' },
          maximumRange: { amount: 12000, currency: 'AED' },
          experienceLevelImpact: { juniorPercent: '-5%', seniorPercent: '+30%' },
        },
      ],
      livingCosts: {
        accommodation: { amount: 1800, currency: 'AED' },
        food: { amount: 900, currency: 'AED' },
        transportation: { amount: 350, currency: 'AED' },
      },
      savingsPotential: { estimatedMonthly: { amount: 1200, currency: 'AED' } },
    },
  },
  QA: {
    countryInfo: {
      name: 'Qatar',
      code: 'QA',
      region: 'Middle East',
      officialLanguages: ['Arabic'],
      currency: 'Qatari Riyal (QAR)',
      timezone: 'UTC+3',
    },
    workOpportunities: {
      commonJobSectors: ['Construction', 'Hospitality', 'Transportation', 'Healthcare'],
      averageSalaryRanges: {
        Construction: 'QAR 1,800 - 3,000',
        Hospitality: 'QAR 1,800 - 3,500',
        Transportation: 'QAR 2,000 - 4,000',
        Healthcare: 'QAR 4,500 - 10,000',
      },
      demandLevel: 'medium',
    },
    legalRequirements: {
      visaTypes: [
        { type: 'Work Visa', description: 'Employer-sponsored; tied to residency' },
        { type: 'Residence Permit', description: 'Required after arrival and medicals' },
      ],
      workPermitProcess: [
        'Signed offer and contract',
        'Work visa application',
        'Arrival medical tests',
        'Residence permit issuance',
      ],
      requiredDocuments: ['Passport', 'Contract', 'Medical test results', 'Passport photos', 'Police clearance'],
    },
    culturalNorms: {
      workplaceEtiquette: [
        'Be punctual and respectful to supervisors',
        'Maintain professional tone; avoid heated debates',
        'Formal greetings are appreciated',
      ],
      dressCode: 'Modest clothing expected in public and workplaces; avoid shorts/sleeveless',
      religiousPractices: 'Respect prayer times; Ramadan may alter work hours',
      languageTips: {
        commonPhrases: ['As-salamu alaykum (peace be upon you)', 'Shukran (thank you)'],
        communicationStyle: 'Polite and respectful; English commonly used',
      },
      socialCustoms: {
        dos: ['Be courteous and patient', 'Respect personal space and traditions'],
        donts: ['Public displays of affection', 'Disrespecting local customs or religious spaces'],
      },
      holidays: ['Eid al-Fitr', 'Eid al-Adha', 'Qatar National Day (Dec 18)'],
    },
    emergencyContacts: {
      embassy: {
        address: 'Your embassy in Doha',
        phone: '+974-xxxx-xxxx',
        email: 'support@yourembassy.example',
        website: 'https://yourembassy.example',
        emergencyHotline: '+974-xxxx-xxxx',
      },
      localAuthorities: [
        { type: 'police', number: '999' },
        { type: 'ambulance', number: '999' },
        { type: 'fire', number: '999' },
      ],
      workerSupport: [
        { type: 'migrantWorkerHelpline', contact: 'Ministry of Labour hotline: 16008' },
        { type: 'legalAidOrganization', contact: 'Local legal aid services (Doha-based)' },
        { type: 'sheltersAndSafeSpaces', contact: 'Government/NGO shelters (contact embassy for referral)' },
      ],
      healthServices: [
        { type: 'hospital', contact: 'Hamad Medical Corporation hospitals' },
        { type: 'clinic', contact: 'Primary health care clinics (city-specific)' },
        { type: 'mentalHealthSupport', contact: 'Mental health helpline via public health services' },
      ],
      police: '999',
      ambulance: '999',
      fire: '999',
      embassySupport: 'Contact your embassy or consulate',
    },
    salaryExpectations: {
      currency: 'QAR',
      payFrequency: 'Monthly',
      lastUpdated: '2024-01-01',
      source: 'Qatar labor market data (illustrative)',
      bySector: [
        {
          sectorName: 'construction',
          minimumWage: { amount: 1800, currency: 'QAR' },
          averageSalary: { amount: 2600, currency: 'QAR' },
          maximumRange: { amount: 4200, currency: 'QAR' },
          experienceLevelImpact: { juniorPercent: '-8%', seniorPercent: '+22%' },
        },
        {
          sectorName: 'transportation',
          minimumWage: { amount: 2000, currency: 'QAR' },
          averageSalary: { amount: 3200, currency: 'QAR' },
          maximumRange: { amount: 5000, currency: 'QAR' },
          experienceLevelImpact: { juniorPercent: '-6%', seniorPercent: '+20%' },
        },
        {
          sectorName: 'healthcare',
          minimumWage: { amount: 3500, currency: 'QAR' },
          averageSalary: { amount: 6000, currency: 'QAR' },
          maximumRange: { amount: 10000, currency: 'QAR' },
          experienceLevelImpact: { juniorPercent: '-5%', seniorPercent: '+28%' },
        },
      ],
      livingCosts: {
        accommodation: { amount: 1200, currency: 'QAR' },
        food: { amount: 700, currency: 'QAR' },
        transportation: { amount: 300, currency: 'QAR' },
      },
      savingsPotential: { estimatedMonthly: { amount: 900, currency: 'QAR' } },
    },
  },
};

exports.getCountryGuide = async (req, res, next) => {
  try {
    const { countryCode } = req.params;
    const code = (countryCode || '').trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) {
      return res.status(400).json({ success: false, error: 'countryCode must be ISO 3166-1 alpha-2', details: [] });
    }

    const guide = guides[code];
    if (!guide) return res.status(404).json({ success: false, error: 'Country guide not found', details: [] });

    const language = (req.query.language || 'en').toLowerCase();
    return res.json({
      success: true,
      data: { language, ...guide },
      message: 'Country guide retrieved',
    });
  } catch (err) {
    console.error('getCountryGuide error', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error', details: [] });
  }
};

exports.getCountries = async (req, res, next) => {
  try {
    const { region, jobDemand } = req.query;
    const list = Object.values(guides)
      .map((g) => ({
        name: g.countryInfo.name,
        code: g.countryInfo.code,
        flag: g.countryInfo.code === 'SA' ? '🇸🇦' : g.countryInfo.code === 'AE' ? '🇦🇪' : g.countryInfo.code === 'QA' ? '🇶🇦' : '',
        region: g.countryInfo.region,
        jobDemand: g.workOpportunities.demandLevel,
      }))
      .filter((c) => (region ? c.region.toLowerCase() === String(region).toLowerCase() : true))
      .filter((c) => (jobDemand ? c.jobDemand.toLowerCase() === String(jobDemand).toLowerCase() : true));

    return res.json({
      success: true,
      data: { countries: list },
      message: 'Countries retrieved',
    });
  } catch (err) {
    console.error('getCountries error', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error', details: [] });
  }
};
