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
    'familyMembers',
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

  // Normalize familyMembers to existing users only
  if (req.body.familyMembers) {
    const submitted = Array.isArray(req.body.familyMembers) ? req.body.familyMembers : [];
    const ids = submitted
      .map((m) => m && m.user)
      .filter(Boolean)
      .map((id) => id.toString());

    if (ids.length !== submitted.length) {
      throw new BadRequestError('Each family member must reference an existing user');
    }

    const uniqueIds = Array.from(new Set(ids));
    const linkedUsers = await User.find({ _id: { $in: uniqueIds } }).lean({ virtuals: true });

    if (linkedUsers.length !== uniqueIds.length) {
      throw new BadRequestError('One or more family members were not found');
    }

    const userMap = new Map(linkedUsers.map((u) => [u._id.toString(), u]));

    user.familyMembers = submitted.map((member) => {
      const linked = userMap.get(member.user.toString());
      return {
        user: linked._id,
        name: linked.fullNameString || `${linked.fullName?.firstName || ''} ${linked.fullName?.lastName || ''}`.trim(),
        relationship: member.relationship || 'family',
        phone: linked.phoneNumber,
        email: linked.email,
        notificationMethod: member.notificationMethod || 'both',
        primary: Boolean(member.primary),
      };
    });
  }

  updates.forEach((update) => {
    if (update !== 'familyMembers') {
      user[update] = req.body[update];
    }
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

/**
 * @desc    Search users by name/email/phone (for linking family accounts)
 * @route   GET /api/users/search?q=term
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  const term = q.trim();

  if (!term) {
    return res.status(200).json({ success: true, data: [] });
  }

  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const users = await User.find({
    $or: [
      { email: regex },
      { phoneNumber: regex },
      { 'fullName.firstName': regex },
      { 'fullName.lastName': regex },
    ],
  })
    .select('fullName email phoneNumber role')
    .limit(10)
    .lean({ virtuals: true });

  res.status(200).json({ success: true, data: users });
});

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
  searchUsers,
};





