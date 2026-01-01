# Sprint 2 Tasks - MigrateRight Platform

**Sprint Leader:** Safin (Tanzim Hossain Shafin)  
**Sprint Duration:** 1 Weeks  
**Sprint Goal:** Authentication System Implementation & Frontend-Backend Integration

---

## Sprint Leader Tasks (Safin)

- Design and finalize the complete authentication system architecture including JWT token flow, protected routes structure, and middleware organization
- Implement the backend authentication system including user registration endpoint (POST /api/auth/register), login endpoint (POST /api/auth/login), JWT token generation and verification middleware, and password reset functionality
- Coordinate frontend-backend integration by updating API contract documentation, conducting API endpoint testing with the frontend team, and standardizing error handling and response formats
- Conduct code reviews for team members, ensure coding standards are maintained, optimize database queries, and perform security vulnerability checks

---

## Developer 1 (Sadia) Tasks (Frontend Focus)

- Complete the authentication UI implementation including the Register page (/register) with form validation, connecting the Login page to the backend API, and creating the password reset flow UI (forgot password and reset password pages)
- Integrate the SearchAgencies component with the backend API (GET /api/agencies), replacing dummy data with real API calls, and implementing pagination, filtering, and sorting functionality
- Implement the Agency Details page (/agencies/:id) to display complete agency information (name, license, location, ratings, etc.), show agency reviews list, and implement the "Save Agency" bookmark functionality
- Enhance the ProtectedRoute component with route guards for authenticated users only, implement redirect logic for login flow, and add token refresh mechanism

---

## Developer 2 (Fahim) Tasks (Backend Focus)

- Create authentication routes (routes/auth.routes.js) and controllers (controllers/auth.controller.js), implementing register controller with user validation and password hashing, login controller with credential verification and JWT token generation, and password reset controllers with token generation and email sending
- Develop JWT authentication middleware (middleware/auth.middleware.js) for token verification and user extraction, create role-based access control (RBAC) middleware, and implement rate limiting middleware to protect against brute force login attempts
- Create user routes (routes/user.routes.js) and controllers (controllers/user.controller.js), implementing endpoints for getting current user profile (GET /api/users/me), updating user profile (PATCH /api/users/me), and getting public user profile by ID (GET /api/users/:id)
- Create Postman collection for authentication endpoints, update API documentation, test error scenarios, and perform integration testing with the frontend

---

## Developer 3 (Rahim) Tasks (Database & Security Focus)

- Enhance the authentication database schema by verifying email verification fields in the User model, confirming password reset token fields, and optimizing indexes for authentication queries
- Implement JWT token generation utility (utils/jwt.utils.js) with access token and refresh token strategy, handle token expiration, and verify password hashing with bcrypt
- Implement geospatial indexing functionality for agency location-based search, create the GET /api/agencies/nearby endpoint, and optimize geospatial queries with distance calculation and filtering
- Implement input validation middleware, verify protection against SQL injection and XSS attacks, add password strength validation, test account lockout mechanism, and verify security headers configuration

