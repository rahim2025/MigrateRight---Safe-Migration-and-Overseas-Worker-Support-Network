/**
 * User Controller
 * Handles user profile operations
 */

const { asyncHandler } = require('../middleware/error.middleware');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User', 'User not found');
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
const updateCurrentUser = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'fullName',
    'phoneNumber',
    'dateOfBirth',
    'gender',
    'location',
    'profilePicture',
    'language',
    'notifications',
    'migrationStatus',
  ];

  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new BadRequestError('Invalid updates');
  }

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError('User', 'User not found');
  }

  updates.forEach((update) => {
    user[update] = req.body[update];
  });

  await user.save();

  logger.info('User profile updated', { userId: user._id });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * @desc    Get public user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email -phoneNumber');

  if (!user) {
    throw new NotFoundError('User', 'User not found');
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
};





