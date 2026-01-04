# MigrateRight Backend Server

Backend API server for **MigrateRight** - A Safe Migration and Overseas Worker Support Network built with **Node.js**, **Express.js**, and **MongoDB**.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [JWT Authentication](#jwt-authentication)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

---

## ✨ Features

✅ **Express.js** server with clean architecture  
✅ **MongoDB** database integration with Mongoose  
✅ **JWT Authentication** with access/refresh tokens  
✅ **Role-Based Access Control (RBAC)**  
✅ **Environment variables** configuration with dotenv  
✅ **Security** middleware (Helmet, CORS, Rate Limiting)  
✅ **Error handling** middleware  
✅ **Health check** endpoints  
✅ **Request logging** with comprehensive logger  
✅ **Production-ready** security features  
✅ **Beginner-friendly** code structure  

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **dotenv** | Environment variables |
| **Helmet** | Security headers |
| **CORS** | Cross-origin requests |
| **Express Rate Limit** | API rate limiting |
| **Nodemon** | Auto-restart server (dev) |

---

## 📁 Project Structure

```
backend/
├── config/                  # Configuration files
│   ├── database.js          # MongoDB connection
│   └── env.js              # Environment variables
│
├── controllers/             # Request handlers
│   └── health.controller.js # Health check logic
│
├── middleware/              # Custom middleware
│   └── error.middleware.js  # Error handling
│
├── models/                  # Mongoose models
│   └── (your models here)
│
├── routes/                  # API routes
│   └── health.routes.js     # Health check routes
│
├── utils/                   # Utility functions
│   └── (helpers here)
│
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Example environment file
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md                # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

### Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the values in `.env` (especially `MONGODB_URI` and `JWT_SECRET`)

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

The server will start at **http://localhost:5000**

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000
```

### Health Check Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/` | Welcome message | Server info |
| `GET` | `/api/health` | Basic health check | Status message |
| `GET` | `/api/health/detailed` | Detailed health info | Server, DB, System info |

### Example Responses

#### GET `/api/health`
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

#### GET `/api/health/detailed`
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "server": {
      "status": "online",
      "environment": "development",
      "uptime": "0d 2h 15m 30s",
      "timestamp": "2025-12-21T10:30:00.000Z"
    },
    "database": {
      "status": "connected",
      "name": "migrateright",
      "host": "localhost:27017"
    },
    "system": {
      "platform": "win32",
      "arch": "x64",
      "nodeVersion": "v18.17.0",
      "memory": {
        "rss": "45.23 MB",
        "heapTotal": "20.12 MB",
        "heapUsed": "15.67 MB"
      },
      "cpus": 8,
      "totalMemory": "16.00 GB",
      "freeMemory": "8.50 GB"
    }
  }
}
```

---

## 🔐 JWT Authentication

This backend implements **production-ready JWT authentication** with comprehensive security features.

### Quick Start

```bash
# Generate secure JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=<generated_secret>
JWT_REFRESH_SECRET=<different_secret>
```

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login user |
| `POST` | `/api/auth/logout` | Private | Logout (blacklist token) |
| `GET` | `/api/auth/me` | Private | Get current user |
| `POST` | `/api/auth/refresh-token` | Public | Refresh access token |

### Protect Routes

```javascript
const { authenticate, authorize } = require('./middleware/auth.middleware');

// Protected route
router.get('/profile', authenticate, getProfile);

// Role-based route
router.delete('/admin', authenticate, authorize('platform_admin'), deleteResource);
```

### Comprehensive Documentation

- **📚 Complete Guide:** [docs/JWT_AUTHENTICATION_GUIDE.md](./docs/JWT_AUTHENTICATION_GUIDE.md)
- **⚡ Quick Reference:** [docs/JWT_QUICK_REFERENCE.md](./docs/JWT_QUICK_REFERENCE.md)
- **📝 Implementation Summary:** [docs/JWT_IMPLEMENTATION_SUMMARY.md](./docs/JWT_IMPLEMENTATION_SUMMARY.md)

### Security Features

✅ JWT with HS256 algorithm  
✅ Access + Refresh token pattern  
✅ Token blacklisting for logout  
✅ Role-based access control (RBAC)  
✅ Account status verification  
✅ Email verification requirements  
✅ Password change detection  
✅ Login attempt limiting  
✅ Account locking  
✅ Security logging  

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

```env
# Application
NODE_ENV=development
PORT=5000
APP_NAME=MigrateRight
API_VERSION=v1

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/migrateright

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
```

### Important Notes:
- ⚠️ **NEVER commit `.env` file to version control**
- ✅ Use `.env.example` for reference
- 🔒 Change `JWT_SECRET` in production
- 🌐 Update `MONGODB_URI` for MongoDB Atlas

---

## 📜 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start** | `npm start` | Run production server |
| **Development** | `npm run dev` | Run with auto-restart (nodemon) |
| **Test** | `npm test` | Run tests (not implemented yet) |

---

## 🚨 Error Handling

### Global Error Handler

All errors are caught and formatted consistently:

```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "statusCode": 500,
    "timestamp": "2025-12-21T10:30:00.000Z",
    "path": "/api/some-route",
    "method": "GET"
  }
}
```

### 404 Not Found

Undefined routes return:

```json
{
  "success": false,
  "message": "Not Found - /api/undefined-route"
}
```

---

## 🧪 Testing the Server

### Using Browser
1. Open http://localhost:5000
2. Navigate to http://localhost:5000/api/health

### Using cURL
```bash
# Basic health check
curl http://localhost:5000/api/health

# Detailed health check
curl http://localhost:5000/api/health/detailed
```

### Using Postman
1. Create a new GET request
2. URL: `http://localhost:5000/api/health`
3. Send request

---

## 📚 Middleware Explained

### 1. **Helmet** - Security
Protects against common web vulnerabilities (XSS, clickjacking, etc.)

### 2. **CORS** - Cross-Origin Requests
Allows frontend (port 3000) to make requests to backend (port 5000)

### 3. **express.json()** - JSON Parser
Parses incoming JSON requests (req.body)

### 4. **Morgan** - Request Logger
Logs HTTP requests in development mode

### 5. **Error Handler** - Error Management
Catches all errors and returns consistent JSON responses

---

## 🔄 Next Steps

1. **Add Authentication**:
   - Create User model
   - Implement JWT authentication
   - Add auth middleware

2. **Add More Routes**:
   - User routes (register, login, profile)
   - Agency routes (CRUD operations)
   - Document routes
   - Job routes

3. **Add Validation**:
   - Install `express-validator`
   - Add input validation middleware

4. **Add Rate Limiting**:
   - Implement rate limiting for API endpoints
   - Protect against brute force attacks

5. **Add Testing**:
   - Install Jest or Mocha
   - Write unit and integration tests

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Code Examples

### Creating a New Route

1. **Create Controller** (`controllers/example.controller.js`):
```javascript
const getExample = (req, res) => {
  res.json({
    success: true,
    message: 'Example endpoint',
    data: { /* your data */ }
  });
};

module.exports = { getExample };
```

2. **Create Route** (`routes/example.routes.js`):
```javascript
const express = require('express');
const router = express.Router();
const { getExample } = require('../controllers/example.controller');

router.get('/', getExample);

module.exports = router;
```

3. **Add to server.js**:
```javascript
const exampleRoutes = require('./routes/example.routes');
app.use('/api/example', exampleRoutes);
```

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

## ⚖️ License

This project is licensed under the MIT License.

---

**Built with ❤️ by the MigrateRight Team**
