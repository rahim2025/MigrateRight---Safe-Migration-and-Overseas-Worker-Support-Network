# API Testing Guide - MigrateRight

Complete guide to test all APIs using curl or Postman.

## Prerequisites
- Backend running: `npm run dev` (Port 5000)
- MongoDB running: `mongod`
- Database populated with seed data

---

## 1. HEALTH CHECK API

### Get Basic Health Status
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "uptime": 1234.56
}
```

### Get Detailed Health Status
```bash
curl http://localhost:5000/api/health/detailed
```

---

## 2. COUNTRY GUIDES API

### Get All Country Guides
```bash
curl http://localhost:5000/api/countries
```

### Get Specific Country by Code
```bash
curl http://localhost:5000/api/countries/SA
curl http://localhost:5000/api/countries/AE
curl http://localhost:5000/api/countries/QA
```

### Get Country by Full Name
```bash
curl http://localhost:5000/api/countries/Saudi%20Arabia
curl http://localhost:5000/api/countries/United%20Arab%20Emirates
curl http://localhost:5000/api/countries/Qatar
```

### Get Available Regions
```bash
curl http://localhost:5000/api/countries/meta/regions
```

### Get Available Job Types
```bash
curl http://localhost:5000/api/countries/meta/job-types
```

### Search Countries by Job Type
```bash
curl http://localhost:5000/api/countries/search/job/construction
curl http://localhost:5000/api/countries/search/job/domestic_work
curl http://localhost:5000/api/countries/search/job/healthcare
```

### Get Countries by Region
```bash
curl http://localhost:5000/api/countries/region/Middle%20East
```

### Get Countries with Filters
```bash
curl "http://localhost:5000/api/countries?region=Middle%20East&limit=5"
curl "http://localhost:5000/api/countries?popular=true"
curl "http://localhost:5000/api/countries?sort=country"
```

---

## 3. CALCULATOR API

### Get Available Destination Countries
```bash
curl http://localhost:5000/api/calculator/countries
```

### Get Job Types for a Country
```bash
curl http://localhost:5000/api/calculator/countries/SA/jobs
curl http://localhost:5000/api/calculator/countries/AE/jobs
curl http://localhost:5000/api/calculator/countries/QA/jobs
```

### Get Fee Rules for Country & Job Type
```bash
curl "http://localhost:5000/api/calculator/fee-rules?country=SA&jobType=domestic_work"
curl "http://localhost:5000/api/calculator/fee-rules?country=AE&jobType=construction"
```

### Calculate Migration Cost
```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "destinationCountry": "SA",
    "jobType": "domestic_work",
    "agencyFee": 2500,
    "additionalCosts": {
      "airfare": 600,
      "documentation": 200,
      "insurance": 150
    }
  }'
```

**Test Cases:**
```bash
# High fee (should trigger warning)
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "destinationCountry": "SA",
    "jobType": "domestic_work",
    "agencyFee": 5000
  }'

# Different countries
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "destinationCountry": "AE",
    "jobType": "construction",
    "agencyFee": 3000
  }'
```

---

## 4. AGENCIES API

### Get All Agencies
```bash
curl http://localhost:5000/api/agencies
curl "http://localhost:5000/api/agencies?page=1&limit=10"
```

### Get Agency Statistics
```bash
curl http://localhost:5000/api/agencies/stats
```

### Get Top Rated Agencies
```bash
curl http://localhost:5000/api/agencies/top-rated
```

### Get Agencies by City
```bash
curl http://localhost:5000/api/agencies/city/Dhaka
curl http://localhost:5000/api/agencies/city/Dubai
```

### Get Nearby Agencies (with coordinates)
```bash
curl "http://localhost:5000/api/agencies/nearby?latitude=23.8103&longitude=90.4125&radius=10"
```

### Get Agency by ID (replace with actual ID)
```bash
curl http://localhost:5000/api/agencies/{agencyId}
```

---

## 5. EMERGENCY API

### Get Emergency Contacts (Generic)
```bash
curl http://localhost:5000/api/emergency/contacts/nearest
```

### Get Emergency Contacts by Country
```bash
curl http://localhost:5000/api/emergency/contacts/country/SA
curl http://localhost:5000/api/emergency/contacts/country/AE
curl http://localhost:5000/api/emergency/contacts/country/QA
```

### Get Emergency Contacts by Coordinates
```bash
curl "http://localhost:5000/api/emergency/contacts/nearest?latitude=24.7136&longitude=46.6753&country=SA"
```

### Get Specific Emergency Event (requires auth)
```bash
curl http://localhost:5000/api/emergency/{eventId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. SALARY TRACKING API (Requires Authentication)

### Create Salary Record
```bash
curl -X POST http://localhost:5000/api/salary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "month": "January",
    "year": 2026,
    "expectedAmount": 5000,
    "receivedAmount": 4500,
    "currency": "SAR",
    "jobType": "domestic_work",
    "country": "SA"
  }'
```

### Get Salary Records
```bash
curl http://localhost:5000/api/salary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Salary Statistics
```bash
curl http://localhost:5000/api/salary/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Salary Discrepancies
```bash
curl http://localhost:5000/api/salary/discrepancies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Recent Salary Records
```bash
curl http://localhost:5000/api/salary/recent \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Salary as Disputed
```bash
curl -X POST http://localhost:5000/api/salary/{recordId}/dispute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reason": "Amount is less than agreed",
    "evidence": "Contract shows 5000 SAR but received 4000 SAR"
  }'
```

### Resolve Dispute
```bash
curl -X POST http://localhost:5000/api/salary/{recordId}/resolve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "resolution": "Employer agreed to pay difference",
    "amount": 1000
  }'
```

---

## 7. AUTHENTICATION API

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "worker",
    "phone": "+8801234567890"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'
```

**Save the token from response to use in other endpoints:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Request Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com"
  }'
```

### Logout User
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN"
  }'
```

---

## 8. USER PROFILE API

### Get Current User Profile
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Current User Profile
```bash
curl -X PATCH http://localhost:5000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "UpdatedName",
    "lastName": "UpdatedLastName",
    "phone": "+8801987654321",
    "address": "123 Main St"
  }'
```

### Get User by ID
```bash
curl http://localhost:5000/api/users/{userId}
```

---

## 9. AGENCY REVIEWS & COMPLAINTS

### Create Agency Review
```bash
curl -X POST http://localhost:5000/api/agencies/{agencyId}/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rating": 4.5,
    "title": "Good experience",
    "comment": "Professional staff, fair fees",
    "jobType": "domestic_work"
  }'
```

### Get Agency Reviews
```bash
curl http://localhost:5000/api/agencies/{agencyId}/reviews
```

### Create Agency Complaint
```bash
curl -X POST http://localhost:5000/api/agencies/{agencyId}/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Overcharging",
    "description": "Agency charged extra hidden fees",
    "severity": "high",
    "evidence": "Receipt shows amount higher than agreed"
  }'
```

---

## 10. WORKER PROFILE API

### Create Worker Profile
```bash
curl -X POST http://localhost:5000/api/workers/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobType": "domestic_work",
    "experience": 5,
    "skills": ["childcare", "cooking", "housekeeping"],
    "preferredCountries": ["SA", "AE"],
    "expectedSalary": 5000,
    "documents": ["passport", "visa"]
  }'
```

### Get Worker Profile
```bash
curl http://localhost:5000/api/workers/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Worker Profile
```bash
curl -X PATCH http://localhost:5000/api/workers/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "experience": 6,
    "expectedSalary": 5500,
    "skills": ["childcare", "cooking", "housekeeping", "elderly-care"]
  }'
```

---

## Testing Workflow

**Step 1: Check System Health**
```bash
curl http://localhost:5000/api/health
```

**Step 2: Test Public APIs (No Auth Required)**
```bash
curl http://localhost:5000/api/countries
curl http://localhost:5000/api/calculator/countries
curl http://localhost:5000/api/agencies
```

**Step 3: Register & Get Token**
```bash
# Register
TOKEN=$(curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User","userType":"worker","phone":"+8801234567890"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

**Step 4: Test Protected APIs**
```bash
# Use the token in subsequent requests
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Expected Status Codes

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | /health | 200 | Always available |
| GET | /countries | 200 | Returns all countries |
| GET | /countries/SA | 200 | Returns specific country |
| GET | /countries/INVALID | 404 | Country not found |
| POST | /calculator/calculate | 200 | Valid parameters |
| POST | /calculator/calculate | 400 | Missing required fields |
| POST | /auth/register | 201 | New user created |
| POST | /auth/register | 400 | Email already exists |
| POST | /auth/login | 200 | Credentials valid |
| POST | /auth/login | 401 | Invalid credentials |
| POST | /salary | 201 | Auth required |
| POST | /salary | 401 | Missing auth token |

---

## Common Issues & Solutions

### 404 on Country Guide
- Ensure country code is uppercase: `/api/countries/SA` ✓
- Or use full name with URL encoding: `/api/countries/Saudi%20Arabia` ✓

### 400 on Calculator
- Ensure all required fields: `destinationCountry`, `jobType`, `agencyFee`
- Field names are case-sensitive

### 401 on Protected Routes
- Include Authorization header: `Authorization: Bearer TOKEN`
- Token must be valid and not expired

### Empty Results
- Check if seed data exists: `npm run seed:countries:force`
- Check if fee rules are seeded: `npm run seed:fee-rules:force`

---

## Postman Collection

Save this as `postman-collection.json` for Postman import:
See the comprehensive test file for full Postman collection schema.
