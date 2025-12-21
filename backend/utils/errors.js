/**
 * Custom Error Classes
 * Standardized error types for better error handling
 */

/**
 * Base API Error Class
 * All custom errors extend from this class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request Error
 * Used for invalid client input
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors = []) {
    super(400, message);
    this.name = 'BadRequestError';
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized Error
 * Used for authentication failures
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized - Authentication required') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden Error
 * Used for authorization failures
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden - Insufficient permissions') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found Error
 * Used when a resource is not found
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource', message) {
    super(404, message || `${resource} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

/**
 * 409 Conflict Error
 * Used for duplicate resources or conflicts
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource already exists') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

/**
 * 422 Unprocessable Entity Error
 * Used for validation errors
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errors = []) {
    super(422, message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * 500 Internal Server Error
 * Used for unexpected server errors
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, false); // Not operational
    this.name = 'InternalServerError';
  }
}

/**
 * 503 Service Unavailable Error
 * Used when service is temporarily unavailable
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service temporarily unavailable') {
    super(503, message);
    this.name = 'ServiceUnavailableError';
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
};
