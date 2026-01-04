const CountryGuide = require('../models/CountryGuide.model');
const { AppError, NotFoundError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @desc    Get all country guides
 * @route   GET /api/country-guides
 * @access  Public
 */
const getAllGuides = asyncHandler(async (req, res) => {
  const {
    region,
    jobType,
    popular,
    language = 'en',
    sort = 'popularityRank',
    limit = 50,
  } = req.query;

  let query = { isActive: true };

  // Filter by region
  if (region) {
    query.region = region;
  }

  // Filter by job type
  if (jobType) {
    query['salaryRanges.jobType'] = jobType;
  }

  let guidesQuery = CountryGuide.find(query);

  // Get popular destinations
  if (popular === 'true') {
    guidesQuery = guidesQuery.sort({ popularityRank: 1, viewCount: -1 }).limit(5);
  } else {
    // Sort
    const sortOptions = {
      popularityRank: { popularityRank: 1 },
      views: { viewCount: -1 },
      country: { country: 1 },
      recent: { updatedAt: -1 },
    };
    guidesQuery = guidesQuery.sort(sortOptions[sort] || sortOptions.popularityRank);
    guidesQuery = guidesQuery.limit(parseInt(limit));
  }

  const guides = await guidesQuery.select('-__v');

  logger.info(`Fetched ${guides.length} country guides`, {
    region,
    jobType,
    popular,
    language,
  });

  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides,
  });
});

/**
 * @desc    Get country guide by country name or country code
 * @route   GET /api/country-guides/:country
 * @access  Public
 */
const getGuideByCountry = asyncHandler(async (req, res) => {
  const { country } = req.params;
  const { language = 'en' } = req.query;

  // Find guide by either country name or country code (case-insensitive search)
  const guide = await CountryGuide.findOne({
    $or: [
      { country: { $regex: new RegExp(`^${country}$`, 'i') } },
      { countryCode: { $regex: new RegExp(`^${country}$`, 'i') } }
    ],
    isActive: true,
  }).select('-__v');

  if (!guide) {
    throw new NotFoundError(`Country guide not found for: ${country}`);
  }

  // Increment view count
  guide.incrementViewCount().catch((err) => {
    logger.error('Failed to increment view count', { country, error: err.message });
  });

  logger.info(`Country guide accessed: ${country}`, { language });

  res.status(200).json({
    success: true,
    data: guide,
  });
});

/**
 * @desc    Get available regions
 * @route   GET /api/country-guides/meta/regions
 * @access  Public
 */
const getRegions = asyncHandler(async (req, res) => {
  const regions = await CountryGuide.distinct('region', { isActive: true });

  res.status(200).json({
    success: true,
    data: {
      regions: regions.sort(),
      count: regions.length,
    },
  });
});

/**
 * @desc    Get available job types across all countries
 * @route   GET /api/country-guides/meta/job-types
 * @access  Public
 */
const getJobTypes = asyncHandler(async (req, res) => {
  const guides = await CountryGuide.find({ isActive: true }).select('salaryRanges.jobType');

  const jobTypesSet = new Set();
  guides.forEach((guide) => {
    guide.salaryRanges.forEach((range) => {
      jobTypesSet.add(range.jobType);
    });
  });

  const jobTypes = Array.from(jobTypesSet).sort();

  res.status(200).json({
    success: true,
    data: {
      jobTypes,
      count: jobTypes.length,
    },
  });
});

/**
 * @desc    Search country guides by job type
 * @route   GET /api/country-guides/search/job/:jobType
 * @access  Public
 */
const searchByJobType = asyncHandler(async (req, res) => {
  const { jobType } = req.params;

  const guides = await CountryGuide.searchByJobType(jobType);

  if (!guides || guides.length === 0) {
    throw new NotFoundError(`No country guides found for job type: ${jobType}`);
  }

  // Extract relevant salary info for each country
  const results = guides.map((guide) => {
    const salaryInfo = guide.getSalaryForJob(jobType);
    return {
      country: guide.country,
      countryCode: guide.countryCode,
      flagEmoji: guide.flagEmoji,
      region: guide.region,
      salaryRange: salaryInfo,
      overview: guide.overview,
    };
  });

  logger.info(`Job type search: ${jobType}, found ${results.length} countries`);

  res.status(200).json({
    success: true,
    count: results.length,
    data: results,
  });
});

/**
 * @desc    Get guides by region
 * @route   GET /api/country-guides/region/:region
 * @access  Public
 */
const getGuidesByRegion = asyncHandler(async (req, res) => {
  const { region } = req.params;

  const guides = await CountryGuide.getByRegion(region);

  if (!guides || guides.length === 0) {
    throw new NotFoundError(`No country guides found for region: ${region}`);
  }

  logger.info(`Region search: ${region}, found ${guides.length} countries`);

  res.status(200).json({
    success: true,
    count: guides.length,
    data: guides,
  });
});

/**
 * @desc    Compare salary ranges across countries for a job type
 * @route   GET /api/country-guides/compare/:jobType
 * @access  Public
 */
const compareSalaries = asyncHandler(async (req, res) => {
  const { jobType } = req.params;
  const { countries } = req.query; // Comma-separated list

  let query = {
    'salaryRanges.jobType': jobType,
    isActive: true,
  };

  // Filter by specific countries if provided
  if (countries) {
    const countryList = countries.split(',').map((c) => c.trim());
    query.country = { $in: countryList };
  }

  const guides = await CountryGuide.find(query).select(
    'country countryCode flagEmoji region salaryRanges currency'
  );

  if (!guides || guides.length === 0) {
    throw new NotFoundError(`No salary data found for job type: ${jobType}`);
  }

  // Build comparison data
  const comparison = guides.map((guide) => {
    const salaryInfo = guide.getSalaryForJob(jobType);
    return {
      country: guide.country,
      countryCode: guide.countryCode,
      flagEmoji: guide.flagEmoji,
      region: guide.region,
      salary: {
        min: salaryInfo.minSalary,
        max: salaryInfo.maxSalary,
        average: (salaryInfo.minSalary + salaryInfo.maxSalary) / 2,
        currency: salaryInfo.currency,
        period: salaryInfo.period,
      },
      notes: salaryInfo.notes,
    };
  });

  // Sort by average salary (descending)
  comparison.sort((a, b) => b.salary.average - a.salary.average);

  logger.info(`Salary comparison for ${jobType}: ${comparison.length} countries`);

  res.status(200).json({
    success: true,
    jobType,
    count: comparison.length,
    data: comparison,
  });
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * @desc    Create new country guide
 * @route   POST /api/country-guides
 * @access  Private/Admin
 */
const createGuide = asyncHandler(async (req, res) => {
  const guideData = req.body;

  // Check if guide already exists
  const existingGuide = await CountryGuide.findOne({ country: guideData.country });
  if (existingGuide) {
    throw new BadRequestError(`Country guide already exists for: ${guideData.country}`);
  }

  // Add creator info
  if (req.userId) {
    guideData.createdBy = req.userId;
    guideData.updatedBy = req.userId;
  }

  const guide = await CountryGuide.create(guideData);

  logger.info(`Country guide created: ${guide.country}`, { userId: req.userId });

  res.status(201).json({
    success: true,
    message: 'Country guide created successfully',
    data: guide,
  });
});

/**
 * @desc    Update country guide
 * @route   PUT /api/country-guides/:id
 * @access  Private/Admin
 */
const updateGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Add updater info
  if (req.userId) {
    updateData.updatedBy = req.userId;
  }

  const guide = await CountryGuide.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!guide) {
    throw new NotFoundError(`Country guide not found with id: ${id}`);
  }

  logger.info(`Country guide updated: ${guide.country}`, { userId: req.userId });

  res.status(200).json({
    success: true,
    message: 'Country guide updated successfully',
    data: guide,
  });
});

/**
 * @desc    Delete country guide (soft delete)
 * @route   DELETE /api/country-guides/:id
 * @access  Private/Admin
 */
const deleteGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const guide = await CountryGuide.findByIdAndUpdate(
    id,
    { isActive: false, updatedBy: req.userId },
    { new: true }
  );

  if (!guide) {
    throw new NotFoundError(`Country guide not found with id: ${id}`);
  }

  logger.info(`Country guide soft deleted: ${guide.country}`, { userId: req.userId });

  res.status(200).json({
    success: true,
    message: 'Country guide deleted successfully',
    data: { country: guide.country },
  });
});

/**
 * @desc    Restore deleted country guide
 * @route   PATCH /api/country-guides/:id/restore
 * @access  Private/Admin
 */
const restoreGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const guide = await CountryGuide.findByIdAndUpdate(
    id,
    { isActive: true, updatedBy: req.userId },
    { new: true }
  );

  if (!guide) {
    throw new NotFoundError(`Country guide not found with id: ${id}`);
  }

  logger.info(`Country guide restored: ${guide.country}`, { userId: req.userId });

  res.status(200).json({
    success: true,
    message: 'Country guide restored successfully',
    data: guide,
  });
});

/**
 * @desc    Update guide popularity rank
 * @route   PATCH /api/country-guides/:id/rank
 * @access  Private/Admin
 */
const updatePopularityRank = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rank } = req.body;

  if (!rank || rank < 1) {
    throw new BadRequestError('Valid popularity rank is required');
  }

  const guide = await CountryGuide.findByIdAndUpdate(
    id,
    { popularityRank: rank, updatedBy: req.userId },
    { new: true }
  );

  if (!guide) {
    throw new NotFoundError(`Country guide not found with id: ${id}`);
  }

  logger.info(`Popularity rank updated for ${guide.country}: ${rank}`, { userId: req.userId });

  res.status(200).json({
    success: true,
    message: 'Popularity rank updated successfully',
    data: guide,
  });
});

module.exports = {
  getAllGuides,
  getGuideByCountry,
  getRegions,
  getJobTypes,
  searchByJobType,
  getGuidesByRegion,
  compareSalaries,
  createGuide,
  updateGuide,
  deleteGuide,
  restoreGuide,
  updatePopularityRank,
};
