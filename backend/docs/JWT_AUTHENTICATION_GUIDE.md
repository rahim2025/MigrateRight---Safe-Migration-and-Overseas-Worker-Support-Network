# JWT Authentication Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [Authentication Flow](#authentication-flow)
5. [API Endpoints](#api-endpoints)
6. [Using Protected Routes](#using-protected-routes)
7. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
8. [Security Best Practices](#security-best-practices)
9. [Token Management](#token-management)
10. [Error Handling](#error-handling)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This application implements **JWT (JSON Web Token)** based authentication with the following features:

- ✅ Secure token generation with HS256 algorithm
- ✅ Access token + Refresh token pattern
- ✅ Token blacklisting for logout functionality
- ✅ Role-based access control (RBAC)
- ✅ Account status verification
- ✅ Email verification requirements
- ✅ Password change detection
- ✅ Login attempt limiting & account locking
- ✅ Security logging & monitoring
- ✅ Production-ready error handling

---

## Architecture

### Token Types

#### 1. Access Token
- **Purpose**: Authenticate API requests
- **Lifetime**: 7 days (configurable)
- **Storage**: Client-side (memory, localStorage, or secure cookie)
- **Payload**: User ID, email, role, type

#### 2. Refresh Token
- **Purpose**: Obtain new access tokens
- **Lifetime**: 30 days (configurable)
- **Storage**: Secure HTTP-only cookie (recommended) or localStorage
- **Payload**: User ID, type

### Components

```
├── utils/
│   └── jwt.utils.js          # Token generation & verification
├── middleware/
│   └── auth.middleware.js    # Authentication & authorization
├── controllers/
│   └── auth.controller.js    # Auth endpoints (login, logout, etc.)
├── routes/
│   └── auth.routes.js        # Auth route definitions
└── models/
    └── User.js               # User model with security features
```

---

## Setup & Configuration

### 1. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_required
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_minimum_32_characters
JWT_REFRESH_EXPIRES_IN=30d

# Application
APP_NAME=MigrateRight
NODE_ENV=production

# Security
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME=7200000
```

### 2. Generate Secure Secrets

**CRITICAL**: Use cryptographically secure random strings for secrets:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install Dependencies

```bash
npm install jsonwebtoken bcryptjs
```

---

## Authentication Flow

### Registration Flow
```
1. User submits registration form
   ↓
2. Server validates input
   ↓
3. Password hashed with bcrypt (12 rounds)
   ↓
4. User created with status 'pending'
   ↓
5. Email verification token generated
   ↓
6. Verification email sent
   ↓
7. JWT tokens generated and returned
```

### Login Flow
```
1. User submits credentials
   ↓
2. Server finds user by email
   ↓
3. Check if account is locked
   ↓
4. Verify password with bcrypt
   ↓
5. Reset login attempts on success
   ↓
6. Generate JWT token pair
   ↓
7. Return tokens + user data
```

### Token Refresh Flow
```
1. Client sends refresh token
   ↓
2. Server verifies refresh token
   ↓
3. Check if token is blacklisted
   ↓
4. Verify user still exists & active
   ↓
5. Generate new access token
   ↓
6. Return new access token
```

### Logout Flow
```
1. Client sends logout request with access token
   ↓
2. Server verifies token
   ↓
3. Token added to blacklist
   ↓
4. Token auto-removed from blacklist after expiry
   ↓
5. Success response sent
```

---

## API Endpoints

### Public Endpoints

#### 1. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+8801712345678",
  "role": "aspiring_migrant",
  "fullName": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "role": "aspiring_migrant",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Endpoints

#### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 5. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "role": "aspiring_migrant",
      ...
    }
  }
}
```

---

## Using Protected Routes

### Basic Authentication

Protect any route by adding the `authenticate` middleware:

```javascript
const { authenticate } = require('../middleware/auth.middleware');

// Protected route - requires valid JWT
router.get('/profile', authenticate, getProfile);
```

### Client-Side Usage

Include the JWT token in the Authorization header:

```javascript
// Axios example
const response = await axios.get('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Fetch API example
const response = await fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Storage (Client)

**Recommended Approaches:**

1. **Memory Only** (Most Secure - for SPAs)
   - Store in React state/context
   - Tokens lost on page refresh
   - Requires silent refresh with refresh token

2. **LocalStorage** (Convenient)
   ```javascript
   localStorage.setItem('accessToken', token);
   localStorage.setItem('refreshToken', refreshToken);
   ```
   - Persistent across sessions
   - Vulnerable to XSS attacks
   - Requires careful sanitization

3. **Secure HTTP-only Cookies** (Best for Production)
   - Set by server
   - Protected from XSS
   - Requires CSRF protection

---

## Role-Based Access Control (RBAC)

### Available Roles

```javascript
const ROLES = {
  ASPIRING_MIGRANT: 'aspiring_migrant',
  WORKER_ABROAD: 'worker_abroad',
  FAMILY_MEMBER: 'family_member',
  RECRUITMENT_ADMIN: 'recruitment_admin',
  PLATFORM_ADMIN: 'platform_admin'
};
```

### Using the `authorize` Middleware

```javascript
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Single role
router.delete('/agencies/:id', 
  authenticate, 
  authorize('platform_admin'), 
  deleteAgency
);

// Multiple roles
router.put('/agencies/:id', 
  authenticate, 
  authorize('recruitment_admin', 'platform_admin'), 
  updateAgency
);

// All authenticated users
router.post('/reviews', 
  authenticate, 
  createReview
);
```

### Additional Middleware

#### Require Active Account
```javascript
const { authenticate, requireActiveAccount } = require('../middleware/auth.middleware');

router.post('/sensitive-operation', 
  authenticate, 
  requireActiveAccount, 
  handleOperation
);
```

#### Require Verified Email
```javascript
const { authenticate, requireVerifiedEmail } = require('../middleware/auth.middleware');

router.post('/agencies/:id/review', 
  authenticate, 
  requireVerifiedEmail, 
  addReview
);
```

### Example Route Protection

```javascript
// routes/agency.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize, requireVerifiedEmail } = require('../middleware/auth.middleware');

// Public - Anyone can view
router.get('/agencies', getAgencies);
router.get('/agencies/:id', getAgencyById);

// Protected - Authenticated users only
router.post('/agencies/:id/favorite', 
  authenticate, 
  addToFavorites
);

// Protected - Verified email required
router.post('/agencies/:id/reviews', 
  authenticate, 
  requireVerifiedEmail, 
  addReview
);

// Protected - Specific roles only
router.post('/agencies', 
  authenticate, 
  authorize('platform_admin'), 
  createAgency
);

router.put('/agencies/:id', 
  authenticate, 
  authorize('recruitment_admin', 'platform_admin'), 
  updateAgency
);

router.delete('/agencies/:id', 
  authenticate, 
  authorize('platform_admin'), 
  deleteAgency
);

module.exports = router;
```

---

## Security Best Practices

### 1. Token Secret Management

**DO:**
- ✅ Use cryptographically random secrets (min 32 characters)
- ✅ Use different secrets for access and refresh tokens
- ✅ Store secrets in environment variables
- ✅ Rotate secrets periodically
- ✅ Use secret management services (AWS Secrets Manager, Azure Key Vault)

**DON'T:**
- ❌ Hard-code secrets in source code
- ❌ Commit secrets to version control
- ❌ Use weak or predictable secrets
- ❌ Reuse secrets across environments

### 2. Token Expiration

**Recommended Timings:**
- Access Token: 15 minutes - 7 days
- Refresh Token: 7 - 90 days

**Balance:**
- Short expiry = More secure, worse UX
- Long expiry = Better UX, less secure

**Production Recommendation:**
```env
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. HTTPS in Production

**CRITICAL**: Always use HTTPS in production to prevent token interception:

```javascript
// server.js - Force HTTPS redirect
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 4. Password Security

**Implemented:**
- ✅ Bcrypt hashing with 12 rounds
- ✅ Automatic hashing on password change
- ✅ Password history tracking
- ✅ Login attempt limiting
- ✅ Account locking after failed attempts

**Additional Validation (Recommended):**
```javascript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

### 5. Token Blacklisting at Scale

**Current Implementation:** In-memory Set (good for development/small scale)

**Production Recommendation:** Use Redis

```javascript
// Example with Redis
const redis = require('redis');
const client = redis.createClient();

const blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  
  if (ttl > 0) {
    await client.setEx(`blacklist:${token}`, ttl, 'revoked');
  }
};

const isTokenBlacklisted = async (token) => {
  const result = await client.get(`blacklist:${token}`);
  return result !== null;
};
```

### 6. CORS Configuration

```javascript
// server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 7. Security Headers

```javascript
// Use helmet for security headers
const helmet = require('helmet');
app.use(helmet());

// Additional headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### 8. Rate Limiting

```javascript
// middleware/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

// Apply to auth routes
router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
```

---

## Token Management

### Token Payload Structure

**Access Token:**
```json
{
  "id": "user_mongodb_id",
  "email": "user@example.com",
  "role": "aspiring_migrant",
  "type": "access",
  "iat": 1609459200,
  "exp": 1610064000,
  "iss": "MigrateRight",
  "aud": "MigrateRight"
}
```

**Refresh Token:**
```json
{
  "id": "user_mongodb_id",
  "type": "refresh",
  "iat": 1609459200,
  "exp": 1612051200,
  "iss": "MigrateRight",
  "aud": "MigrateRight"
}
```

### Token Verification Process

1. **Extract** token from Authorization header
2. **Verify** signature using secret
3. **Check** token type (access vs refresh)
4. **Validate** issuer and audience
5. **Check** blacklist status
6. **Verify** token hasn't expired
7. **Fetch** user from database
8. **Check** user account status
9. **Verify** password hasn't changed since token issued
10. **Attach** user to request object

### Automatic Token Cleanup

Blacklisted tokens are automatically removed after expiry:

```javascript
// jwt.utils.js
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  const decoded = jwt.decode(token);
  if (decoded && decoded.exp) {
    const expiryTime = (decoded.exp * 1000) - Date.now();
    if (expiryTime > 0) {
      setTimeout(() => {
        tokenBlacklist.delete(token);
      }, expiryTime);
    }
  }
};
```

---

## Error Handling

### Common Token Errors

#### 1. Token Expired
```json
{
  "success": false,
  "error": "UnauthorizedError",
  "message": "Token expired - Please login again",
  "statusCode": 401
}
```

**Client Action:** Request new access token using refresh token

#### 2. Invalid Token
```json
{
  "success": false,
  "error": "UnauthorizedError",
  "message": "Invalid token",
  "statusCode": 401
}
```

**Client Action:** Redirect to login

#### 3. Token Revoked
```json
{
  "success": false,
  "error": "UnauthorizedError",
  "message": "Token has been revoked",
  "statusCode": 401
}
```

**Client Action:** Redirect to login

#### 4. Insufficient Permissions
```json
{
  "success": false,
  "error": "ForbiddenError",
  "message": "Access denied - Required roles: platform_admin",
  "statusCode": 403
}
```

**Client Action:** Show access denied message

### Client-Side Error Handling

```javascript
// Axios interceptor example
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired - try refresh
    if (error.response?.status === 401 && 
        error.response?.data?.message?.includes('expired') &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh-token', { 
          refreshToken 
        });
        
        localStorage.setItem('accessToken', data.data.token);
        originalRequest.headers['Authorization'] = `Bearer ${data.data.token}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Other auth errors - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
```

---

## Testing

### Manual Testing with cURL

#### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "phoneNumber": "+8801712345678",
    "role": "aspiring_migrant",
    "fullName": {
      "firstName": "Test",
      "lastName": "User"
    },
    "dateOfBirth": "1990-01-01",
    "gender": "male"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

#### 3. Access Protected Route
```bash
# Save token from login response
TOKEN="your_access_token_here"

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### Testing with Postman

1. **Create Environment Variables:**
   - `baseUrl`: http://localhost:5000
   - `accessToken`: (will be set automatically)
   - `refreshToken`: (will be set automatically)

2. **Set Auth Token Automatically:**
   Add to login request "Tests" tab:
   ```javascript
   const response = pm.response.json();
   pm.environment.set('accessToken', response.data.token);
   pm.environment.set('refreshToken', response.data.refreshToken);
   ```

3. **Use Token in Requests:**
   - Authorization tab → Type: Bearer Token
   - Token: `{{accessToken}}`

### Automated Testing

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Authentication', () => {
  let accessToken;
  let refreshToken;

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        // ... other fields
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    accessToken = res.body.data.token;
    refreshToken = res.body.data.refreshToken;
  });

  it('should access protected route with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
  });

  it('should reject access without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.statusCode).toBe(401);
  });

  it('should refresh access token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should logout successfully', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('should reject blacklisted token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(401);
  });
});
```

---

## Troubleshooting

### Issue: "Invalid token" error immediately after login

**Cause:** Clock skew between server and client, or token signature mismatch

**Solution:**
```javascript
// Add clockTolerance to verification
jwt.verify(token, secret, {
  clockTolerance: 30 // Allow 30 seconds difference
});
```

### Issue: Token works locally but fails in production

**Cause:** Different JWT secrets in different environments

**Solution:**
- Ensure environment variables are properly set in production
- Check for typos in `.env` file
- Verify secrets are correctly loaded

### Issue: "Token has been revoked" for valid tokens

**Cause:** Blacklist persisting across server restarts

**Solution:**
- Use Redis for production (TTL-based expiry)
- Clear blacklist on server startup (dev only):
  ```javascript
  if (process.env.NODE_ENV === 'development') {
    tokenBlacklist.clear();
  }
  ```

### Issue: User logged out unexpectedly

**Possible Causes:**
1. Password was changed → Check `passwordChangedAt`
2. Token expired → Check expiration settings
3. Account status changed → Check `accountStatus`
4. Token was blacklisted → Check logout logs

**Debug:**
```javascript
// Add logging to authenticate middleware
logger.debug('Token verification', {
  userId: decoded.id,
  tokenIat: decoded.iat,
  passwordChangedAt: user.passwordChangedAt,
  accountStatus: user.accountStatus
});
```

### Issue: CORS errors when sending Authorization header

**Cause:** CORS not configured to allow Authorization header

**Solution:**
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Issue: Rate limiting blocking legitimate users

**Cause:** Too aggressive rate limiting

**Solution:**
```javascript
// Increase limits or use IP-based limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Increased from 5
  skipSuccessfulRequests: true // Don't count successful logins
});
```

---

## Quick Reference

### Middleware Import
```javascript
const { 
  authenticate, 
  authorize, 
  optionalAuth,
  requireActiveAccount,
  requireVerifiedEmail
} = require('../middleware/auth.middleware');
```

### Common Patterns

**Public route:**
```javascript
router.get('/public', publicHandler);
```

**Authenticated only:**
```javascript
router.get('/private', authenticate, privateHandler);
```

**Specific role:**
```javascript
router.delete('/admin', authenticate, authorize('platform_admin'), adminHandler);
```

**Multiple roles:**
```javascript
router.put('/resource', authenticate, authorize('admin', 'moderator'), updateHandler);
```

**Active account required:**
```javascript
router.post('/sensitive', authenticate, requireActiveAccount, sensitiveHandler);
```

**Email verified required:**
```javascript
router.post('/review', authenticate, requireVerifiedEmail, reviewHandler);
```

**Optional auth (user if available):**
```javascript
router.get('/content', optionalAuth, contentHandler);
```

---

## Summary

This JWT authentication implementation provides:

✅ **Security**: Industry-standard practices with HS256, token blacklisting, and secure password hashing  
✅ **Flexibility**: Support for multiple roles and fine-grained access control  
✅ **Scalability**: Designed for production with Redis-ready token blacklisting  
✅ **User Experience**: Refresh token pattern for seamless re-authentication  
✅ **Monitoring**: Comprehensive logging for security events  
✅ **Maintainability**: Clean separation of concerns and well-documented code  

For questions or issues, refer to the [Error Handling](#error-handling) and [Troubleshooting](#troubleshooting) sections.
