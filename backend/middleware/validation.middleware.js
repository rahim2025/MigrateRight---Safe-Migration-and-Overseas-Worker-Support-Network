/**
 * Input Validation Middleware
 * Protects against invalid input, SQL injection, XSS
 */

const { body, param, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Handle Validation Errors
 */
const handleValidationErrors = (req, res, next) => {
  // Skip validation for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    throw new ValidationError('Validation failed', formattedErrors);
  }
  
  next();
};

/**
 * Registration Validation
 */
const validateRegister = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      console.log('Password validation - Password:', req.body.password);
      console.log('Password validation - Confirm Password:', value);
      console.log('Passwords match:', value === req.body.password);
      
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('phoneNumber')
    .notEmpty().withMessage('Phone number required')
    .matches(/^(\+880|880|0)?[0-9]{10,11}$/).withMessage('Valid phone number required'),
  
  body('role')
    .isIn(['aspiring_migrant', 'worker_abroad', 'family_member', 'recruitment_admin', 'platform_admin', 'user', 'agency'])
    .withMessage('Invalid role'),
  
  body('fullName.firstName')
    .trim().isLength({ min: 1, max: 50 }).withMessage('First name required'),
  
  body('fullName.lastName')
    .trim().isLength({ min: 1, max: 50 }).withMessage('Last name required'),
  
  body('dateOfBirth')
    .isISO8601().withMessage('Valid date required'),
  
  body('gender')
    .isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
  
  body('migrationStatus')
    .optional()
    .isIn(['planning', 'in_process', 'abroad', 'returned', 'not_applicable']).withMessage('Invalid migration status'),
  
  handleValidationErrors,
];

/**
 * Login Validation
 */
const validateLogin = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors,
];

/**
 * Forgot Password Validation
 */
const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  handleValidationErrors,
];

/**
 * Reset Password Validation
 */
const validateResetPassword = [
  param('token').notEmpty().withMessage('Token required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password).withMessage('Passwords must match'),
  handleValidationErrors,
];

/**
 * Profile Update Validation
 */
const validateUpdateProfile = [
  body('fullName.firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('fullName.lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phoneNumber').optional().matches(/^(\+880|880|0)?1[3-9]\d{8}$/),
  handleValidationErrors,
];

/**
 * ObjectId Validation
 */
const validateObjectId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidationErrors,
];

/**
 * Agency Registration Validation
 */
const validateAgencyRegister = [
  body('email')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      console.log('Agency Password validation - Password:', req.body.password);
      console.log('Agency Password validation - Confirm Password:', value);
      console.log('Agency Passwords match:', value === req.body.password);
      
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('phoneNumber')
    .notEmpty().withMessage('Phone number required')
    .matches(/^(\+880|880|0)?[0-9]{10,11}$/).withMessage('Valid phone number required'),
  
  body('companyName')
    .trim().isLength({ min: 2, max: 100 }).withMessage('Company name required (2-100 characters)'),
  
  body('tradeLicenseNumber')
    .trim().isLength({ min: 1, max: 50 }).withMessage('Trade license number required'),
  
  body('tinNumber')
    .trim().isLength({ min: 1, max: 50 }).withMessage('TIN number required'),
  
  body('contactPersonName')
    .trim().isLength({ min: 1, max: 100 }).withMessage('Contact person name required'),
  
  body('businessAddress')
    .trim().isLength({ min: 1, max: 200 }).withMessage('Business address required'),
  
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateAgencyRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
  validateObjectId,
};










