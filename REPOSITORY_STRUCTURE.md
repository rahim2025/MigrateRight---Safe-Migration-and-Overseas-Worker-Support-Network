# MigrateRight - Repository Structure Guide

## 📁 Complete Directory Structure

```
MigrateRight/
│
├── .github/                          # GitHub specific files
│   ├── workflows/                    # CI/CD workflows
│   │   ├── frontend-ci.yml          # Frontend testing & build
│   │   ├── backend-ci.yml           # Backend testing & linting
│   │   └── deploy.yml               # Deployment workflow
│   ├── ISSUE_TEMPLATE/              # Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── task.md
│   └── PULL_REQUEST_TEMPLATE.md     # PR template
│
├── frontend/                         # React application
│   ├── public/                       # Static files
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── assets/                   # Static assets (images, icons)
│   │       ├── images/
│   │       ├── icons/
│   │       └── fonts/
│   │
│   ├── src/                          # Source code
│   │   ├── api/                      # API integration layer
│   │   │   ├── axios.config.js      # Axios instance configuration
│   │   │   ├── authApi.js           # Authentication API calls
│   │   │   ├── agencyApi.js         # Agency API calls
│   │   │   ├── userApi.js           # User API calls
│   │   │   └── index.js             # API exports
│   │   │
│   │   ├── assets/                   # Application assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── styles/              # Global styles
│   │   │       ├── variables.css
│   │   │       └── global.css
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   ├── common/              # Common components
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Button.module.css
│   │   │   │   │   └── Button.test.js
│   │   │   │   ├── Input/
│   │   │   │   ├── Card/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Loader/
│   │   │   │   └── index.js         # Export all common components
│   │   │   │
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Header/
│   │   │   │   ├── Footer/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── Navigation/
│   │   │   │
│   │   │   ├── auth/                # Authentication components
│   │   │   │   ├── LoginForm/
│   │   │   │   ├── RegisterForm/
│   │   │   │   └── PasswordReset/
│   │   │   │
│   │   │   ├── agency/              # Agency-specific components
│   │   │   │   ├── AgencyCard/
│   │   │   │   ├── AgencyList/
│   │   │   │   ├── AgencyDetails/
│   │   │   │   └── AgencyReviews/
│   │   │   │
│   │   │   ├── user/                # User-specific components
│   │   │   │   ├── ProfileCard/
│   │   │   │   ├── ProfileForm/
│   │   │   │   └── DocumentUpload/
│   │   │   │
│   │   │   └── index.js             # Export all components
│   │   │
│   │   ├── context/                  # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   ├── LanguageContext.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── usePagination.js
│   │   │   └── index.js
│   │   │
│   │   ├── pages/                    # Page components (routes)
│   │   │   ├── Home/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Home.module.css
│   │   │   │   └── index.js
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── index.js
│   │   │   ├── Agencies/
│   │   │   │   ├── AgencyList.jsx
│   │   │   │   ├── AgencyDetails.jsx
│   │   │   │   └── index.js
│   │   │   ├── Profile/
│   │   │   │   ├── UserProfile.jsx
│   │   │   │   ├── EditProfile.jsx
│   │   │   │   └── index.js
│   │   │   ├── Dashboard/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── AgencyDashboard.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   └── index.js
│   │   │   ├── NotFound/
│   │   │   └── index.js
│   │   │
│   │   ├── routes/                   # Route configuration
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicRoute.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── services/                 # Business logic services
│   │   │   ├── authService.js
│   │   │   ├── storageService.js
│   │   │   ├── validationService.js
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.js        # Date, currency formatters
│   │   │   ├── validators.js        # Input validators
│   │   │   ├── constants.js         # App constants
│   │   │   ├── helpers.js           # Helper functions
│   │   │   └── index.js
│   │   │
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── config.js
│   │   │   ├── locales/
│   │   │   │   ├── en.json
│   │   │   │   └── bn.json
│   │   │   └── index.js
│   │   │
│   │   ├── App.jsx                   # Main App component
│   │   ├── App.css                   # App styles
│   │   ├── index.js                  # Entry point
│   │   └── index.css                 # Global styles
│   │
│   ├── .env.example                  # Environment variables example
│   ├── .eslintrc.json               # ESLint configuration
│   ├── .prettierrc                  # Prettier configuration
│   ├── package.json
│   ├── package-lock.json
│   └── README.md                     # Frontend documentation
│
├── backend/                          # Node.js + Express application
│   ├── src/                          # Source code
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js          # MongoDB connection
│   │   │   ├── cloudinary.js        # Cloud storage config
│   │   │   ├── email.js             # Email service config
│   │   │   ├── sms.js               # SMS service config
│   │   │   └── index.js
│   │   │
│   │   ├── models/                   # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── RecruitmentAgency.js
│   │   │   ├── Review.js
│   │   │   ├── JobListing.js
│   │   │   └── index.js
│   │   │
│   │   ├── controllers/              # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── agencyController.js
│   │   │   ├── reviewController.js
│   │   │   └── index.js
│   │   │
│   │   ├── routes/                   # API routes
│   │   │   ├── v1/                   # API version 1
│   │   │   │   ├── authRoutes.js
│   │   │   │   ├── userRoutes.js
│   │   │   │   ├── agencyRoutes.js
│   │   │   │   ├── reviewRoutes.js
│   │   │   │   └── index.js         # Combine all routes
│   │   │   └── index.js
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.js              # Authentication middleware
│   │   │   ├── authorize.js         # Authorization middleware
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   ├── validator.js         # Input validation
│   │   │   ├── rateLimiter.js       # Rate limiting
│   │   │   ├── fileUpload.js        # File upload handling
│   │   │   └── index.js
│   │   │
│   │   ├── services/                 # Business logic services
│   │   │   ├── emailService.js      # Email operations
│   │   │   ├── smsService.js        # SMS operations
│   │   │   ├── fileService.js       # File upload/delete
│   │   │   ├── tokenService.js      # JWT operations
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── ApiResponse.js       # Standardized response
│   │   │   ├── ApiError.js          # Custom error class
│   │   │   ├── asyncHandler.js      # Async error wrapper
│   │   │   ├── validators.js        # Validation helpers
│   │   │   ├── constants.js         # App constants
│   │   │   └── index.js
│   │   │
│   │   ├── validations/              # Request validation schemas
│   │   │   ├── authValidation.js
│   │   │   ├── userValidation.js
│   │   │   ├── agencyValidation.js
│   │   │   └── index.js
│   │   │
│   │   ├── tests/                    # Test files
│   │   │   ├── unit/                 # Unit tests
│   │   │   │   ├── models/
│   │   │   │   ├── controllers/
│   │   │   │   └── services/
│   │   │   ├── integration/          # Integration tests
│   │   │   │   ├── auth.test.js
│   │   │   │   ├── agency.test.js
│   │   │   │   └── user.test.js
│   │   │   ├── setup.js             # Test setup
│   │   │   └── teardown.js          # Test cleanup
│   │   │
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entry point
│   │
│   ├── uploads/                      # Temporary file uploads (gitignored)
│   ├── logs/                         # Application logs (gitignored)
│   ├── .env.example                  # Environment variables example
│   ├── .eslintrc.json               # ESLint configuration
│   ├── .prettierrc                  # Prettier configuration
│   ├── jest.config.js               # Jest testing configuration
│   ├── package.json
│   ├── package-lock.json
│   └── README.md                     # Backend documentation
│
├── docs/                             # Project documentation
│   ├── API_CONTRACT.md              # API specifications
│   ├── SCHEMA_DOCUMENTATION.md      # Database schemas
│   ├── ARCHITECTURE.md              # System architecture
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── USER_GUIDE.md                # User documentation
│
├── scripts/                          # Utility scripts
│   ├── seed-database.js             # Database seeding
│   ├── create-admin.js              # Create admin user
│   └── cleanup.js                   # Cleanup utilities
│
├── .gitignore                        # Git ignore rules
├── .env.example                      # Root env example
├── REPOSITORY_STRUCTURE.md          # This file
├── CODING_STANDARDS.md              # Coding standards guide
├── CONTRIBUTING.md                  # Contribution guidelines
├── LICENSE                           # License file
└── README.md                         # Project README
```

---

## 🎯 Key Principles

### 1. Separation of Concerns
- **Frontend**: Handles UI/UX, user interactions, client-side logic
- **Backend**: Handles business logic, database operations, authentication
- **Docs**: Centralized documentation accessible to all

### 2. Modular Architecture
- Each feature has its own directory
- Components are self-contained (component, styles, tests in same folder)
- Easy to locate and modify specific functionality

### 3. Scalability
- Clear separation between versions (v1, v2 routes)
- Services abstracted from controllers
- Easy to add new features without affecting existing code

### 4. Team Collaboration
- Clear folder structure reduces merge conflicts
- Each team member can work on separate modules
- Standardized patterns across the codebase

---

## 📂 Frontend Structure Details

### Component Organization

**Barrel Pattern (index.js)**
```javascript
// components/common/index.js
export { default as Button } from './Button/Button';
export { default as Input } from './Input/Input';
export { default as Card } from './Card/Card';

// Usage in other files
import { Button, Input, Card } from '@/components/common';
```

### File Naming Convention
- **Components**: PascalCase (Button.jsx, AgencyCard.jsx)
- **Utilities**: camelCase (formatDate.js, validateEmail.js)
- **CSS Modules**: ComponentName.module.css
- **Tests**: ComponentName.test.js

### Folder Structure per Component
```
Button/
├── Button.jsx              # Component logic
├── Button.module.css       # Component styles
├── Button.test.js          # Component tests
└── index.js                # Export (optional)
```

---

## 📂 Backend Structure Details

### API Route Structure

**Version-based Organization**
```
routes/
└── v1/
    ├── authRoutes.js       # /api/v1/auth/*
    ├── userRoutes.js       # /api/v1/users/*
    ├── agencyRoutes.js     # /api/v1/agencies/*
    └── index.js            # Combine all routes
```

**Route File Pattern**
```javascript
// routes/v1/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { validateRegister } = require('../../validations/authValidation');

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);

module.exports = router;
```

### Controller Pattern
```javascript
// controllers/authController.js
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.register = asyncHandler(async (req, res) => {
  // Business logic here
  res.status(201).json(new ApiResponse(201, data, 'User registered successfully'));
});
```

---

## 🔄 Git Workflow

### Branch Naming Convention
```
main                        # Production-ready code
develop                     # Development branch
feature/user-authentication # New features
bugfix/login-error-handling # Bug fixes
hotfix/security-patch       # Urgent production fixes
release/v1.0.0             # Release preparation
```

### Working with Branches
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/agency-search

# Work on your feature
git add .
git commit -m "feat: add agency search with filters"

# Push to remote
git push origin feature/agency-search

# Create Pull Request on GitHub
```

---

## 👥 Team Collaboration Guidelines

### File Ownership
- **Frontend Team**: Works in `/frontend` directory
- **Backend Team**: Works in `/backend` directory
- **Documentation**: Both teams contribute to `/docs`

### Avoiding Merge Conflicts
1. **Pull before starting work**: `git pull origin develop`
2. **Work on separate files**: Coordinate feature assignments
3. **Commit frequently**: Small, focused commits
4. **Communicate changes**: Use team chat/issues
5. **Review before merging**: Always create PRs

### Parallel Development Strategy
```
Team Member 1: frontend/src/components/auth/
Team Member 2: frontend/src/components/agency/
Team Member 3: backend/src/controllers/authController.js
Team Member 4: backend/src/controllers/agencyController.js
Team Member 5: docs/API_CONTRACT.md
```

---

## 🚀 Quick Start Commands

### Clone Repository
```bash
git clone https://github.com/your-org/MigrateRight.git
cd MigrateRight
```

### Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Run Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

---

## 📝 Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_CLOUDINARY_URL=your_cloudinary_url
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/migrateright
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## 🔍 Code Review Checklist

Before creating a Pull Request:
- [ ] Code follows naming conventions
- [ ] All tests pass
- [ ] No console.log() statements in production code
- [ ] Environment variables are not hardcoded
- [ ] Comments explain complex logic
- [ ] Error handling is implemented
- [ ] Code is formatted with Prettier
- [ ] No ESLint warnings
- [ ] Documentation is updated
- [ ] Commit messages follow convention

---

**Last Updated**: December 21, 2025  
**Maintained By**: MigrateRight Development Team
