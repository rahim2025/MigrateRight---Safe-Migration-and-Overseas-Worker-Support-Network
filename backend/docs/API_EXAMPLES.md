# API Request & Response Examples

## Complete Examples for All 10 API Categories

---

## 1. HEALTH CHECK API

### Request
```bash
GET /api/health HTTP/1.1
Host: localhost:5000
```

### Response (200 OK)
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "uptime": 3456.789,
  "timestamp": "2026-01-03T21:30:00.000Z"
}
```

### Detailed Health
```bash
GET /api/health/detailed HTTP/1.1
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "status": "connected",
    "latency": 2.5,
    "collections": 8
  },
  "uptime": 3456.789,
  "memory": {
    "used": 125.4,
    "total": 512
  }
}
```

---

## 2. AUTHENTICATION API

### Register
```bash
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "email": "worker@example.com",
  "password": "SecurePass123!",
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "userType": "worker",
  "phone": "+8801700123456"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
    "email": "worker@example.com",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "userType": "worker",
    "phone": "+8801700123456",
    "isVerified": false,
    "createdAt": "2026-01-03T21:30:00.000Z"
  }
}
```

### Login
```bash
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "worker@example.com",
  "password": "SecurePass123!"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
    "email": "worker@example.com",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "userType": "worker"
  }
}
```

### Get Current User
```bash
GET /api/auth/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
    "email": "worker@example.com",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "userType": "worker",
    "phone": "+8801700123456",
    "isVerified": true,
    "createdAt": "2026-01-03T21:30:00.000Z",
    "updatedAt": "2026-01-03T21:35:00.000Z"
  }
}
```

---

## 3. COUNTRY GUIDES API

### Get All Countries
```bash
GET /api/countries HTTP/1.1
```

Response (200 OK):
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
      "country": "Saudi Arabia",
      "countryCode": "SA",
      "flagEmoji": "🇸🇦",
      "region": "Middle East",
      "overview": {
        "en": "Saudi Arabia is one of the largest destinations for migrant workers...",
        "bn": "সৌদি আরব মধ্যপ্রাচ্যের অভিবাসী শ্রমিকদের জন্য বৃহত্তম গন্তব্যগুলির মধ্যে একটি।"
      },
      "salaryRanges": [
        {
          "jobType": "domestic_work",
          "title": {
            "en": "Domestic Worker",
            "bn": "গৃহস্থালি কর্মী"
          },
          "minSalary": 1500,
          "maxSalary": 2500,
          "currency": "SAR",
          "period": "monthly"
        },
        {
          "jobType": "construction",
          "title": {
            "en": "Construction Worker",
            "bn": "নির্মাণ শ্রমিক"
          },
          "minSalary": 1800,
          "maxSalary": 4000,
          "currency": "SAR",
          "period": "monthly"
        }
      ],
      "culture": {
        "language": "Arabic",
        "religion": "Islam",
        "customs": ["prayer times respected", "modest dress required", "family-oriented"],
        "holidays": ["Eid al-Fitr", "Eid al-Adha", "Saudi National Day"],
        "doAndDonts": {
          "dos": ["Be respectful of local customs", "Learn basic Arabic", "Respect prayer times"],
          "donts": ["Disrespect religion", "Public displays of affection", "Alcohol possession"]
        }
      },
      "legalRights": {
        "laborLaws": {
          "workingHours": "8-10 hours per day",
          "weeklyRest": "1 day per week",
          "paidLeave": "15 days per year",
          "overtimePay": "150% of regular wage"
        },
        "contractRequirements": [
          "Written employment contract in Arabic",
          "Clear salary terms",
          "Working conditions specified",
          "Health insurance mandatory"
        ]
      },
      "emergencyContacts": {
        "bangladeshiEmbassy": {
          "name": "Embassy of Bangladesh, Riyadh",
          "phone": "+966-11-465-3001",
          "address": "Riyadh, Saudi Arabia"
        },
        "localEmergencyServices": {
          "police": "999",
          "ambulance": "997",
          "fire": "998"
        }
      },
      "livingCosts": {
        "accommodation": "1000-1500 SAR/month",
        "food": "800-1200 SAR/month",
        "transportation": "300-500 SAR/month",
        "utilities": "200-300 SAR/month"
      },
      "popularityRank": 1,
      "isActive": true,
      "createdAt": "2026-01-03T21:30:00.000Z"
    }
  ]
}
```

### Get Specific Country
```bash
GET /api/countries/SA HTTP/1.1
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
    "country": "Saudi Arabia",
    "countryCode": "SA",
    "flagEmoji": "🇸🇦",
    "region": "Middle East",
    "overview": { ... },
    "salaryRanges": [ ... ],
    "culture": { ... },
    "legalRights": { ... },
    "emergencyContacts": { ... },
    "livingCosts": { ... }
  }
}
```

---

## 4. CALCULATOR API

### Get Available Countries
```bash
GET /api/calculator/countries HTTP/1.1
```

Response (200 OK):
```json
{
  "success": true,
  "data": ["Saudi Arabia", "United Arab Emirates", "Qatar"],
  "count": 3
}
```

### Get Job Types
```bash
GET /api/calculator/countries/SA/jobs HTTP/1.1
```

Response (200 OK):
```json
{
  "success": true,
  "country": "Saudi Arabia",
  "data": {
    "jobTypes": [
      "domestic_work",
      "construction",
      "healthcare",
      "hospitality"
    ],
    "count": 4
  }
}
```

### Calculate Migration Cost
```bash
POST /api/calculator/calculate HTTP/1.1
Content-Type: application/json

{
  "destinationCountry": "SA",
  "jobType": "domestic_work",
  "agencyFee": 2500,
  "additionalCosts": {
    "airfare": 600,
    "documentation": 200,
    "insurance": 150
  }
}
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "country": "Saudi Arabia",
    "jobType": "domestic_work",
    "userProvidedFee": 2500,
    "legalFeeRange": {
      "min": 1500,
      "max": 2500,
      "currency": "SAR"
    },
    "totalUserCosts": {
      "agencyFee": 2500,
      "governmentFees": 1700,
      "additionalCosts": 950,
      "total": 5150
    },
    "feeComparison": {
      "isWithinLegal": true,
      "status": "FAIR",
      "percentageAboveMax": 0,
      "warnings": [],
      "recommendation": "Fee is fair and within legal limits"
    },
    "breakdown": {
      "recruitment": 2500,
      "visa": 600,
      "medicalTest": 400,
      "training": 300,
      "emigration": 200,
      "airfare": 600,
      "documentation": 200,
      "insurance": 150
    }
  }
}
```

---

## 5. AGENCIES API

### Get All Agencies
```bash
GET /api/agencies HTTP/1.1
```

Response (200 OK):
```json
{
  "success": true,
  "count": 15,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  },
  "data": [
    {
      "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
      "name": "Global Recruitment Agency",
      "city": "Dhaka",
      "country": "Bangladesh",
      "phone": "+8801234567890",
      "email": "info@globalagency.com",
      "license": "BMET-12345-2022",
      "rating": 4.8,
      "reviews": 45,
      "specializations": ["construction", "healthcare", "domestic_work"],
      "experience": 15,
      "isVerified": true,
      "createdAt": "2026-01-03T21:30:00.000Z"
    }
  ]
}
```

### Get Agency Stats
```bash
GET /api/agencies/stats HTTP/1.1
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "totalAgencies": 15,
    "verifiedAgencies": 12,
    "averageRating": 4.6,
    "totalReviews": 342,
    "byCity": {
      "Dhaka": 8,
      "Chittagong": 4,
      "Sylhet": 3
    },
    "bySpecialization": {
      "construction": 10,
      "healthcare": 8,
      "domestic_work": 12
    }
  }
}
```

---

## 6. EMERGENCY API

### Get Contacts by Country
```bash
GET /api/emergency/contacts/country/SA HTTP/1.1
```

Response (200 OK):
```json
{
  "success": true,
  "country": "Saudi Arabia",
  "data": {
    "bangladeshiEmbassy": {
      "name": "Embassy of Bangladesh, Riyadh",
      "phone": "+966-11-465-3001",
      "address": "Al Nakheel Street, Riyadh",
      "hours": "9:00 AM - 1:00 PM, 4:00 PM - 6:00 PM"
    },
    "localEmergency": {
      "police": "999",
      "ambulance": "997",
      "fire": "998"
    },
    "helplines": {
      "laborMinistry": "+966-11-401-7777",
      "workerSupport": "+966-11-465-3001"
    }
  }
}
```

### Trigger SOS
```bash
POST /api/emergency/sos HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "country": "SA",
  "description": "Employer withheld passport and salary",
  "severity": "high",
  "location": "Riyadh"
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
    "userId": "65a3f8c2d5f3e9a1b2c3d4e6",
    "country": "Saudi Arabia",
    "severity": "high",
    "status": "active",
    "description": "Employer withheld passport and salary",
    "location": "Riyadh",
    "createdAt": "2026-01-03T21:30:00.000Z",
    "updatedAt": "2026-01-03T21:30:00.000Z"
  }
}
```

---

## 7. SALARY TRACKING API

### Create Salary Record
```bash
POST /api/salary HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "month": "January",
  "year": 2026,
  "expectedAmount": 5000,
  "receivedAmount": 4500,
  "currency": "SAR",
  "jobType": "domestic_work",
  "country": "Saudi Arabia"
}
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
    "userId": "65a3f8c2d5f3e9a1b2c3d4e6",
    "month": "January",
    "year": 2026,
    "expectedAmount": 5000,
    "receivedAmount": 4500,
    "discrepancy": 500,
    "discrepancyPercentage": 10,
    "currency": "SAR",
    "jobType": "domestic_work",
    "country": "Saudi Arabia",
    "status": "received",
    "isDisputed": false,
    "createdAt": "2026-01-03T21:30:00.000Z"
  }
}
```

### Get Salary Statistics
```bash
GET /api/salary/stats HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response (200 OK):
```json
{
  "success": true,
  "data": {
    "totalRecords": 12,
    "averageExpected": 5000,
    "averageReceived": 4650,
    "totalDiscrepancy": 4200,
    "discrepancyPercentage": 7.2,
    "byMonth": {
      "January": {
        "expected": 5000,
        "received": 4500,
        "discrepancy": 500
      },
      "December": {
        "expected": 5000,
        "received": 4800,
        "discrepancy": 200
      }
    }
  }
}
```

---

## 8. USER PROFILE API

### Update User Profile
```bash
PATCH /api/users/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "phone": "+8801700654321",
  "address": "123 Main Street, Dhaka"
}
```

Response (200 OK):
```json
{
  "success": true,
  "user": {
    "_id": "65a3f8c2d5f3e9a1b2c3d4e5",
    "email": "worker@example.com",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "phone": "+8801700654321",
    "address": "123 Main Street, Dhaka",
    "userType": "worker",
    "isVerified": true,
    "updatedAt": "2026-01-03T21:35:00.000Z"
  }
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "success": false,
  "message": "Destination country, job type, and agency fee are required",
  "statusCode": 400,
  "type": "BadRequestError"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided",
  "statusCode": 401,
  "type": "UnauthorizedError"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Country guide not found for: XYZ",
  "statusCode": 404,
  "type": "NotFoundError"
}
```

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Auth required/failed |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error |

Use these examples to test and validate all API endpoints! ✅
