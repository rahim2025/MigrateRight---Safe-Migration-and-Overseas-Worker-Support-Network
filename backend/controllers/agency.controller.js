/**
 * Agency Controller
 * Handles all agency-related API requests
 */

const Agency = require('../models/Agency.model');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * @desc    Get all verified agencies
 * @route   GET /api/agencies
 * @access  Public
 */
const getAgencies = asyncHandler(async (req, res) => {
  // Extract query parameters for filtering and pagination
  const {
    page = 1,
    limit = 20,
    city,
    country,
    minRating,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  // Build query object
  const query = {
    isActive: true, // Only show active agencies (verified or not)
  };

  // Add filters if provided
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' }; // Case-insensitive
  }

  if (country) {
    query['location.country'] = { $regex: country, $options: 'i' };
  }

  if (minRating) {
    const rating = parseFloat(minRating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      throw new BadRequestError('minRating must be a number between 0 and 5');
    }
    query['rating.average'] = { $gte: rating };
  }

  // Text search if search parameter provided
  if (search) {
    query.$text = { $search: search };
  }

  // Calculate pagination
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  
  if (pageNumber < 1) {
    throw new BadRequestError('page must be greater than 0');
  }
  
  if (limitNumber < 1 || limitNumber > 100) {
    throw new BadRequestError('limit must be between 1 and 100');
  }
  
  const skip = (pageNumber - 1) * limitNumber;

  // Build sort object
  const sortOrder = order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // Log the query
  logger.debug('Fetching agencies', { query, page: pageNumber, limit: limitNumber });

  // Execute query with pagination
  const startTime = Date.now();
  const agencies = await Agency.find(query)
    .select('name license.number location rating isVerified destinationCountries specialization description')
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .lean(); // Use lean() for better performance (returns plain JS objects)

  // Get total count for pagination metadata
  const total = await Agency.countDocuments(query);
  
  const duration = Date.now() - startTime;
  logger.dbQuery('find', 'agencies', duration);

  // Handle empty results
  if (agencies.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No verified agencies found',
      data: [],
      pagination: {
        total: 0,
        page: pageNumber,
        limit: limitNumber,
        pages: 0,
      },
    });
  }

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limitNumber);

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Agencies retrieved successfully',
    count: agencies.length,
    data: agencies,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      pages: totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
    },
  });
});

/**
 * @desc    Get single agency by ID
 * @route   GET /api/agencies/:id
 * @access  Public
 */
const getAgencyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find agency by ID
  const agency = await Agency.findById(id);

  // Check if agency exists
  if (!agency) {
    throw new NotFoundError('Agency');
  }

  // Check if agency is active
  if (!agency.isActive) {
    throw new NotFoundError('Agency', 'Agency is no longer active');
  }

  // Recalculate rating from actual reviews to ensure accuracy
  await agency.recalculateRatingFromReviews();
  await agency.save();

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Agency retrieved successfully',
    data: agency,
  });
});

/**
 * @desc    Get top-rated agencies
 * @route   GET /api/agencies/top-rated
 * @access  Public
 */
const getTopRatedAgencies = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const limitNumber = parseInt(limit);
  if (limitNumber < 1 || limitNumber > 50) {
    throw new BadRequestError('limit must be between 1 and 50');
  }

  // Use static method from model
  const agencies = await Agency.findTopRated(limitNumber)
    .select('name location rating isVerified')
    .lean();

  // Handle empty results
  if (agencies.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No agencies found',
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    message: 'Top-rated agencies retrieved successfully',
    count: agencies.length,
    data: agencies,
  });
});

/**
 * @desc    Get agencies by city
 * @route   GET /api/agencies/city/:city
 * @access  Public
 */
const getAgenciesByCity = asyncHandler(async (req, res) => {
  const { city } = req.params;
  
  if (!city || city.trim().length === 0) {
    throw new BadRequestError('City parameter is required');
  }

  // Use static method from model
  const agencies = await Agency.findByCity(city)
    .select('name location rating isVerified')
    .lean();

  // Handle empty results
  if (agencies.length === 0) {
    return res.status(200).json({
      success: true,
      message: `No agencies found in ${city}`,
      data: [],
    });
  }

  res.status(200).json({
    success: true,
    message: `Agencies in ${city} retrieved successfully`,
    count: agencies.length,
    data: agencies,
  });
});

/**
 * @desc    Get agency statistics
 * @route   GET /api/agencies/stats
 * @access  Public
 */
const getAgencyStats = asyncHandler(async (req, res) => {
  // Aggregate statistics
  const stats = await Agency.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalAgencies: { $sum: 1 },
        verifiedAgencies: {
          $sum: { $cond: ['$isVerified', 1, 0] },
        },
        averageRating: { $avg: '$rating.average' },
        totalPlacements: { $sum: '$totalPlacements' },
      },
    },
  ]);

  // Get agencies by city
  const byCity = await Agency.aggregate([
    { $match: { isActive: true, isVerified: true } },
    { $group: { _id: '$location.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    message: 'Agency statistics retrieved successfully',
    data: {
      overview: stats[0] || {
        totalAgencies: 0,
        verifiedAgencies: 0,
        averageRating: 0,
        totalPlacements: 0,
      },
      byCity: byCity.map((item) => ({
        city: item._id,
        count: item.count,
      })),
    },
  });
});

/**
 * @desc    Get agencies nearby a location
 * @route   GET /api/agencies/nearby
 * @access  Public
 * @query   latitude - Latitude of the location
 * @query   longitude - Longitude of the location
 * @query   maxDistance - Maximum distance in kilometers (default: 50)
 * @query   limit - Maximum number of results (default: 20)
 */
const getNearbyAgencies = asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 50, limit = 20 } = req.query;

  // Validate coordinates
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const maxDist = parseFloat(maxDistance);
  const limitNum = parseInt(limit);

  if (isNaN(lat) || isNaN(lng)) {
    throw new BadRequestError('Valid latitude and longitude are required');
  }

  if (lat < -90 || lat > 90) {
    throw new BadRequestError('Latitude must be between -90 and 90');
  }

  if (lng < -180 || lng > 180) {
    throw new BadRequestError('Longitude must be between -180 and 180');
  }

  if (isNaN(maxDist) || maxDist < 0) {
    throw new BadRequestError('maxDistance must be a positive number');
  }

  if (limitNum < 1 || limitNum > 100) {
    throw new BadRequestError('limit must be between 1 and 100');
  }

  // MongoDB geospatial query
  // $near must be the first operator, so use separate query
  const agencies = await Agency.find({
    isVerified: true,
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat], // MongoDB uses [longitude, latitude]
        },
        $maxDistance: maxDist * 1000, // Convert km to meters
      },
    },
  })
    .select('name license.number location rating isVerified destinationCountries specialization description')
    .limit(limitNum)
    .lean();

  // Calculate distance for each agency (optional - MongoDB doesn't return distance by default)
  const agenciesWithDistance = agencies.map((agency) => {
    if (agency.location?.coordinates) {
      // Calculate distance using Haversine formula (simplified)
      const [lng2, lat2] = agency.location.coordinates;
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat) * Math.PI) / 180;
      const dLng = ((lng2 - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { ...agency, distance: Math.round(distance * 10) / 10 }; // Round to 1 decimal
    }
    return agency;
  });

  res.status(200).json({
    success: true,
    message: 'Nearby agencies retrieved successfully',
    count: agenciesWithDistance.length,
    data: agenciesWithDistance,
    location: { latitude: lat, longitude: lng },
    maxDistance: maxDist,
  });
});

module.exports = {
  getAgencies,
  getAgencyById,
  getTopRatedAgencies,
  getAgenciesByCity,
  getAgencyStats,
  getNearbyAgencies,
};
