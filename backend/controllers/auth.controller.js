/**
 * Authentication Controller
 * Handles register, login, logout, password reset, email verification
 */

const crypto = require('crypto');
const { asyncHandler } = require('../middleware/error.middleware');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const { generateTokenPair, verifyRefreshToken, generateAccessToken, blacklistToken } = require('../utils/jwt.utils');
const User = require('../models/User');
const Agency = require('../models/Agency.model');
const AgencyDetails = require('../models/AgencyDetails.model');
const emailService = require('../services/email.service');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, phoneNumber, role, fullName, dateOfBirth, gender, location, migrationStatus } = req.body;

  // Remove confirmPassword from req.body after validation
  delete req.body.confirmPassword;

  // Check existing user
  const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existingUser) {
    throw new BadRequestError(existingUser.email === email ? 'Email already registered' : 'Phone number already registered');
  }

  // Create user
  const user = await User.create({
    email, password, phoneNumber, role, fullName, dateOfBirth, gender, location, migrationStatus,
  });

  // Generate tokens
  const tokens = generateTokenPair(user);

  user.password = undefined;

  logger.info('User registered', { userId: user._id, email: user.email });

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
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

  logger.info('User logged in', { userId: user._id, email: user.email, role: user.role });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token: tokens.accessToken, refreshToken: tokens.refreshToken, role: user.role },
  });
});

/**
 * @desc    Register new agency
 * @route   POST /api/auth/register-agency
 * @access  Public
 */
const registerAgency = asyncHandler(async (req, res) => {
  const { 
    email, 
    password, 
    companyName, 
    tradeLicenseNumber, 
    tinNumber, 
    incomeLevel, 
    businessAddress, 
    contactPersonName, 
    phoneNumber 
  } = req.body;

  // Remove confirmPassword from req.body after validation
  delete req.body.confirmPassword;

  // Check existing user
  const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existingUser) {
    throw new BadRequestError(existingUser.email === email ? 'Email already registered' : 'Phone number already registered');
  }

  // Check existing agency with same license or TIN
  const existingAgency = await AgencyDetails.findOne({ 
    $or: [{ tradeLicenseNumber }, { tinNumber }] 
  });
  if (existingAgency) {
    throw new BadRequestError('Trade license or TIN number already registered');
  }

  // Create user account with agency role
  const nameParts = contactPersonName.trim().split(' ');
  const firstName = nameParts[0] || contactPersonName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
  
  const user = await User.create({
    email,
    password,
    phoneNumber,
    role: 'agency',
    fullName: {
      firstName: firstName,
      lastName: lastName
    },
    dateOfBirth: new Date('2000-01-01'), // Placeholder for agency
    gender: 'other',
  });

  // Create agency details
  const agencyDetails = await AgencyDetails.create({
    userId: user._id,
    companyName,
    tradeLicenseNumber,
    tinNumber,
    incomeLevel,
    businessAddress,
    contactPersonName,
    phoneNumber
  });

  // Parse business address to extract city (format: "Address, City" or just use as is)
  const addressParts = businessAddress.split(',').map(part => part.trim());
  const city = addressParts.length > 1 ? addressParts[addressParts.length - 1] : addressParts[0];

  // Create agency entry for searchable listings
  const agency = await Agency.create({
    name: companyName,
    license: {
      number: tradeLicenseNumber,
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isValid: true,
    },
    location: {
      address: businessAddress,
      city: city,
      district: city,
      country: 'Bangladesh',
    },
    destinationCountries: [], // Can be updated later
    contact: {
      phone: phoneNumber,
      email: email,
    },
    rating: {
      average: 0,
      count: 0,
    },
    specialization: [],
    description: `Professional recruitment agency based in ${city}.`,
    establishedYear: new Date().getFullYear(),
    totalPlacements: 0,
    isActive: true,
    owner: user._id, // Link to user account
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Send verification email (non-blocking)
  try {
    const verificationUrl = `${config.frontendUrl}/verify-email/${verificationToken}`;
    await emailService.sendEmailVerificationEmail(user.email, verificationToken, verificationUrl);
  } catch (emailError) {
    logger.warn('Failed to send verification email', { 
      userId: user._id, 
      email: user.email, 
      error: emailError.message 
    });
    // Continue with registration even if email fails
  }

  // Generate tokens
  const tokens = generateTokenPair(user);

  user.password = undefined;

  logger.info('Agency registered', { userId: user._id, email: user.email, companyName });

  res.status(201).json({
    success: true,
    message: 'Agency registration successful. Please verify your email.',
    data: { 
      user, 
      agencyDetails,
      agency,
      token: tokens.accessToken, 
      refreshToken: tokens.refreshToken 
    },
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

  if (!user) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user);

  res.status(200).json({
    success: true,
    data: { token: newAccessToken },
  });
});

/**
 * @desc    Logout user (blacklist current token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const token = req.token; // Set by authenticate middleware

  if (token) {
    blacklistToken(token);
    logger.info('User logged out', { userId: req.user._id });
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = {
  register,
  registerAgency,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  refreshToken,
};
