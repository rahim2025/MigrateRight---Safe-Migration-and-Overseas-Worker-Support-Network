# MigrateRight - Coding Standards & Conventions

## 📋 Table of Contents
1. [General Principles](#general-principles)
2. [Naming Conventions](#naming-conventions)
3. [Folder Structure Standards](#folder-structure-standards)
4. [API Route Structure](#api-route-structure)
5. [Code Formatting](#code-formatting)
6. [Git Commit Conventions](#git-commit-conventions)
7. [Environment Variables](#environment-variables)
8. [Error Handling](#error-handling)
9. [Testing Standards](#testing-standards)
10. [Documentation](#documentation)

---

## 🎯 General Principles

### 1. Code Readability
- Write self-documenting code with clear variable/function names
- Add comments for complex logic, not obvious code
- Keep functions small and focused (single responsibility)
- Avoid deep nesting (max 3 levels)

### 2. DRY (Don't Repeat Yourself)
- Extract reusable logic into functions/components
- Create utility functions for common operations
- Use constants for repeated values

### 3. Consistency
- Follow the same patterns throughout the codebase
- Use established folder structure
- Apply uniform formatting

### 4. Performance
- Avoid unnecessary re-renders (React.memo, useMemo, useCallback)
- Implement pagination for large datasets
- Use lazy loading for routes and images
- Optimize database queries with proper indexing

---

## 📛 Naming Conventions

### JavaScript/React

#### Variables & Functions
```javascript
// camelCase for variables and functions
const userName = 'Ahmed Rahman';
const fetchUserData = () => {};

// PascalCase for React components and classes
const UserProfile = () => {};
class AuthService {}

// UPPERCASE for constants
const API_BASE_URL = 'https://api.migrateright.bd';
const MAX_FILE_SIZE = 5242880; // 5MB
```

#### Files & Folders
```
✅ CORRECT
components/UserProfile/UserProfile.jsx
utils/formatDate.js
hooks/useAuth.js
services/authService.js

❌ INCORRECT
components/user-profile/user_profile.jsx
utils/format-date.js
hooks/use_auth.js
```

### Naming Rules

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `UserDashboard.jsx` |
| JavaScript Files | camelCase | `authService.js` |
| CSS Modules | ComponentName.module.css | `Button.module.css` |
| Test Files | ComponentName.test.js | `Button.test.js` |
| Folders (general) | camelCase | `components/`, `utils/` |
| Folders (feature) | PascalCase | `UserProfile/`, `AgencyList/` |
| Constants | UPPERCASE_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Environment Variables | UPPERCASE_SNAKE_CASE | `MONGODB_URI` |
| API Routes | kebab-case | `/api/v1/recruitment-agencies` |
| Database Collections | PascalCase | `Users`, `RecruitmentAgencies` |

---

## 📁 Folder Structure Standards

### Frontend Component Structure

**Option 1: Simple Component**
```
Button/
├── Button.jsx
├── Button.module.css
├── Button.test.js
└── index.js (exports Button)
```

**Option 2: Complex Component with Sub-components**
```
AgencyCard/
├── AgencyCard.jsx              # Main component
├── AgencyCard.module.css       # Styles
├── AgencyCard.test.js          # Tests
├── components/                 # Sub-components
│   ├── AgencyRating.jsx
│   └── AgencyContact.jsx
└── index.js                    # Export
```

### Backend Module Structure

```
auth/
├── authController.js           # Route handlers
├── authService.js              # Business logic
├── authValidation.js           # Input validation
└── auth.test.js                # Tests
```

---

## 🛣️ API Route Structure

### RESTful API Conventions

```javascript
// Base Pattern: /api/v{version}/{resource}

// Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/verify-email/:token

// Users (CRUD)
GET    /api/v1/users              // List all (admin only)
GET    /api/v1/users/me           // Current user
GET    /api/v1/users/:id          // Specific user
PATCH  /api/v1/users/me           // Update current user
DELETE /api/v1/users/me           // Delete account

// Recruitment Agencies
GET    /api/v1/agencies           // List all (with filters)
GET    /api/v1/agencies/:id       // Get specific agency
POST   /api/v1/agencies           // Create agency (admin)
PATCH  /api/v1/agencies/:id       // Update agency
DELETE /api/v1/agencies/:id       // Delete agency

// Nested Resources
GET    /api/v1/agencies/:id/reviews        // Agency reviews
POST   /api/v1/agencies/:id/reviews        // Add review
GET    /api/v1/users/:id/reviews           // User's reviews
```

### Route Organization

**routes/v1/agencyRoutes.js**
```javascript
const express = require('express');
const router = express.Router();
const agencyController = require('../../controllers/agencyController');
const { authenticate, authorize } = require('../../middleware/auth');
const { validateAgency } = require('../../validations/agencyValidation');
const rateLimit = require('../../middleware/rateLimiter');

// Public routes
router.get('/', rateLimit.public, agencyController.getAllAgencies);
router.get('/nearby', rateLimit.public, agencyController.getNearbyAgencies);
router.get('/:id', rateLimit.public, agencyController.getAgencyById);

// Protected routes (requires authentication)
router.post(
  '/',
  authenticate,
  authorize('platform_admin'),
  validateAgency,
  agencyController.createAgency
);

router.patch(
  '/:id',
  authenticate,
  authorize('platform_admin', 'recruitment_admin'),
  agencyController.updateAgency
);

router.delete(
  '/:id',
  authenticate,
  authorize('platform_admin'),
  agencyController.deleteAgency
);

module.exports = router;
```

### HTTP Methods & Status Codes

| Method | Purpose | Success Status | Error Status |
|--------|---------|----------------|--------------|
| GET | Retrieve data | 200 OK | 404 Not Found |
| POST | Create resource | 201 Created | 400 Bad Request |
| PATCH | Partial update | 200 OK | 400 Bad Request |
| PUT | Full update | 200 OK | 400 Bad Request |
| DELETE | Delete resource | 200 OK | 404 Not Found |

---

## 💅 Code Formatting

### ESLint Configuration

**frontend/.eslintrc.json**
```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "react/prop-types": "warn",
    "react/react-in-jsx-scope": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2]
  }
}
```

**backend/.eslintrc.json**
```json
{
  "extends": ["eslint:recommended", "plugin:node/recommended"],
  "parserOptions": {
    "ecmaVersion": 2021
  },
  "env": {
    "node": true,
    "es6": true,
    "jest": true
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": "warn",
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2],
    "node/no-unsupported-features/es-syntax": "off"
  }
}
```

### Prettier Configuration

**.prettierrc** (both frontend & backend)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Code Style Examples

#### React Component
```javascript
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './UserProfile.module.css';

/**
 * UserProfile Component
 * Displays user profile information with edit capability
 */
const UserProfile = ({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // API call
      const response = await getUserById(userId);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className={styles.container}>
      <h2>{user.fullNameString}</h2>
      <p>{user.email}</p>
    </div>
  );
};

UserProfile.propTypes = {
  userId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
};

UserProfile.defaultProps = {
  onUpdate: () => {},
};

export default UserProfile;
```

#### Express Controller
```javascript
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'Profile retrieved successfully')
  );
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/me
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { fullName, location, employmentInfo } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { fullName, location, employmentInfo },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json(
    new ApiResponse(200, { user }, 'Profile updated successfully')
  );
});
```

---

## 📝 Git Commit Conventions

### Conventional Commits Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add password reset functionality` |
| `fix` | Bug fix | `fix(agency): resolve search filter issue` |
| `docs` | Documentation | `docs(api): update API contract with new endpoints` |
| `style` | Code style (formatting) | `style(frontend): apply prettier formatting` |
| `refactor` | Code refactoring | `refactor(user): extract validation logic to service` |
| `test` | Adding tests | `test(auth): add unit tests for login controller` |
| `chore` | Maintenance tasks | `chore(deps): update mongoose to v8.0.0` |
| `perf` | Performance improvement | `perf(agency): add database index for faster search` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |
| `build` | Build system changes | `build: configure webpack for production` |

### Commit Examples

```bash
# Feature addition
git commit -m "feat(agency): implement geospatial search for nearby agencies"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue on logout"

# Documentation
git commit -m "docs(readme): add setup instructions for contributors"

# Multiple files changed
git commit -m "refactor(user): reorganize profile components and add validation

- Move validation logic to separate service
- Extract ProfileForm into reusable component
- Add PropTypes for type checking"

# Breaking change
git commit -m "feat(api): change authentication to use JWT tokens

BREAKING CHANGE: Session-based auth is no longer supported.
All clients must update to use JWT tokens in Authorization header."
```

### Commit Best Practices

1. **Write clear, concise messages**
   ```bash
   ✅ GOOD: "feat(auth): add email verification"
   ❌ BAD: "update files"
   ```

2. **Use imperative mood** (present tense)
   ```bash
   ✅ GOOD: "fix bug" (not "fixed bug" or "fixes bug")
   ❌ BAD: "fixed the login bug"
   ```

3. **Limit subject line to 50 characters**
4. **Capitalize subject line**
5. **No period at the end of subject**
6. **Use body to explain what and why, not how**

---

## 🔐 Environment Variables

### Naming Convention
```bash
# Use UPPERCASE_SNAKE_CASE
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/migrateright
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Group by service/feature
# Database
DB_HOST=localhost
DB_PORT=27017
DB_NAME=migrateright

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@migrateright.bd
EMAIL_PASSWORD=your_password

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Environment Files

**DO NOT commit to Git:**
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`

**DO commit to Git:**
- `.env.example` (template without sensitive values)

### Frontend Environment Variables

Must start with `REACT_APP_` prefix:
```bash
# .env (frontend)
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_CLOUDINARY_URL=https://api.cloudinary.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
```

Usage in React:
```javascript
const apiUrl = process.env.REACT_APP_API_URL;
```

### Backend Environment Variables

```bash
# .env (backend)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/migrateright
JWT_SECRET=your_secret_key
```

Usage in Node.js:
```javascript
require('dotenv').config();
const port = process.env.PORT || 5000;
```

---

## ⚠️ Error Handling

### Frontend Error Handling

```javascript
// Using try-catch with async/await
const fetchAgencies = async () => {
  try {
    setLoading(true);
    const response = await api.get('/agencies');
    setAgencies(response.data.data.agencies);
  } catch (error) {
    // Extract error message from API response
    const message = error.response?.data?.error?.message || 'Failed to fetch agencies';
    setError(message);
    console.error('Error fetching agencies:', error);
  } finally {
    setLoading(false);
  }
};
```

### Backend Error Handling

**Custom Error Class (utils/ApiError.js)**
```javascript
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
```

**Async Handler Wrapper (utils/asyncHandler.js)**
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

**Error Handler Middleware (middleware/errorHandler.js)**
```javascript
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(statusCode).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message, details },
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  res.status(statusCode).json({
    success: false,
    error: { code: err.code || 'SERVER_ERROR', message },
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
```

**Usage in Controller**
```javascript
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.getAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    throw new ApiError(404, 'Agency not found');
  }

  res.status(200).json({
    success: true,
    data: { agency },
  });
});
```

---

## 🧪 Testing Standards

### Test File Naming
```
ComponentName.test.js
functionName.test.js
```

### Frontend Testing (React Testing Library)

```javascript
// Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });
});
```

### Backend Testing (Jest + Supertest)

```javascript
// auth.test.js
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { setupTestDB, cleanupTestDB } = require('./setup');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await cleanupTestDB();
});

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!',
        phoneNumber: '+8801712345678',
        role: 'aspiring_migrant',
        fullName: { firstName: 'Test', lastName: 'User' },
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      // Register first user
      await User.create({
        email: 'duplicate@example.com',
        password: 'Test123!',
        // ... other fields
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'duplicate@example.com', /* ... */ })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_USER');
    });
  });
});
```

### Test Coverage Requirements
- **Minimum Coverage**: 70%
- **Critical Paths**: 90% (auth, payments)
- Run tests before committing: `npm test`
- Generate coverage report: `npm run test:coverage`

---

## 📖 Documentation

### Code Comments

**When to Comment:**
- Complex algorithms
- Non-obvious business logic
- Workarounds or hacks
- TODO items

**When NOT to Comment:**
- Obvious code (self-documenting)
- Redundant descriptions

```javascript
// ❌ BAD: Obvious comment
// Get user by ID
const user = await User.findById(id);

// ✅ GOOD: Explains non-obvious logic
// Calculate trust score using weighted algorithm
// Rating (30%), Compliance (25%), Verification (20%), 
// Transparency (15%), Review Count (10%)
const trustScore = calculateWeightedScore(agency);

// ✅ GOOD: TODO with assignee
// TODO(username): Refactor this to use caching for better performance
```

### JSDoc for Functions

```javascript
/**
 * Find recruitment agencies near a specific location
 * @param {number} longitude - Longitude coordinate
 * @param {number} latitude - Latitude coordinate
 * @param {number} maxDistance - Maximum distance in meters (default: 50000)
 * @returns {Promise<Array>} Array of nearby agencies sorted by distance
 * @throws {ApiError} If coordinates are invalid
 */
const findNearbyAgencies = async (longitude, latitude, maxDistance = 50000) => {
  // Implementation
};
```

### API Documentation

Use JSDoc comments in controllers:
```javascript
/**
 * @desc    Get all recruitment agencies with filtering
 * @route   GET /api/v1/agencies
 * @access  Public
 * @param   {string} req.query.country - Filter by destination country
 * @param   {number} req.query.minRating - Minimum rating filter
 * @param   {number} req.query.page - Page number
 * @param   {number} req.query.limit - Items per page
 */
exports.getAllAgencies = asyncHandler(async (req, res) => {
  // Implementation
});
```

---

## ✅ Pre-Commit Checklist

Before committing code, ensure:

- [ ] Code is formatted with Prettier
- [ ] No ESLint errors or warnings
- [ ] All tests pass
- [ ] No `console.log()` in production code
- [ ] Environment variables not hardcoded
- [ ] Comments added for complex logic
- [ ] Commit message follows convention
- [ ] No sensitive data in code
- [ ] Imports are organized
- [ ] Unused imports removed

---

## 🚀 Quick Reference

### Common Commands

```bash
# Frontend
npm start              # Start development server
npm test               # Run tests
npm run build          # Production build
npm run lint           # Run ESLint
npm run format         # Run Prettier

# Backend
npm run dev            # Start with nodemon
npm test               # Run tests
npm run lint           # Run ESLint
npm run format         # Run Prettier

# Git
git status             # Check status
git add .              # Stage all changes
git commit -m "..."    # Commit with message
git push               # Push to remote
git pull               # Pull from remote
```

---

**Last Updated**: December 21, 2025  
**Version**: 1.0  
**Maintained By**: MigrateRight Development Team
