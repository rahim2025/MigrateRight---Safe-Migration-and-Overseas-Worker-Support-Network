/**
 * Authentication Controller
 * Handles register, login, password reset, email verification
 */

const crypto = require('crypto');
const { asyncHandler } = require('../middleware/error.middleware');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const { generateTokenPair, verifyRefreshToken, generateAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User');
const emailService = require('../services/email.service');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, phoneNumber, role, fullName, dateOfBirth, gender, location } = req.body;

  // Check existing user
  const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existingUser) {
    throw new BadRequestError(existingUser.email === email ? 'Email already registered' : 'Phone number already registered');
  }

  // Create user
  const user = await User.create({
    email, password, phoneNumber, role, fullName, dateOfBirth, gender, location,
    accountStatus: 'pending',
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationUrl = `${config.frontendUrl}/verify-email/${verificationToken}`;
  await emailService.sendEmailVerificationEmail(user.email, verificationToken, verificationUrl);

  // Generate tokens
  const tokens = generateTokenPair(user);

  user.password = undefined;

  logger.info('User registered', { userId: user._id, email: user.email });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: { user, token: tokens.accessToken, refreshToken: tokens.refreshToken },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.isAccountLocked) {
    throw new UnauthorizedError('Account locked due to multiple failed attempts');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new UnauthorizedError('Invalid email or password');
  }

  await user.resetLoginAttempts();

  const tokens = generateTokenPair(user);
  user.password = undefined;

  logger.info('User logged in', { userId: user._id, email: user.email });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token: tokens.accessToken, refreshToken: tokens.refreshToken },
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Always return success (security)
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  await emailService.sendPasswordResetEmail(user.email, resetToken, resetUrl);

  logger.info('Password reset requested', { email: user.email });

  res.status(200).json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  const tokens = generateTokenPair(user);

  logger.info('Password reset successful', { userId: user._id });

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: { token: tokens.accessToken, refreshToken: tokens.refreshToken },
  });
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  user.verification.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  if (user.accountStatus === 'pending') {
    user.accountStatus = 'active';
  }
  await user.save();

  logger.info('Email verified', { userId: user._id });

  res.status(200).json({ success: true, message: 'Email verified successfully' });
});

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError('Refresh token required');
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id);

  if (!user || user.accountStatus !== 'active') {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    data: { token: newAccessToken },
  });
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
};
