# Country Guide API - Quick Testing Guide

## Prerequisites
1. MongoDB running locally or connection string in `.env`
2. Backend server running on `http://localhost:5000`
3. Database seeded with sample data

## Seed Database
```bash
node backend/utils/seedCountryGuides.js
```

Expected output:
```
✓ MongoDB connected for seeding
✓ Cleared existing country guides
✓ Successfully seeded 3 country guides

📊 Summary by country:
   🇸🇦 Saudi Arabia (Middle East)
      - 3 job types
      - Popularity rank: 1
   🇦🇪 United Arab Emirates (Middle East)
      - 3 job types
      - Popularity rank: 2
   🇲🇾 Malaysia (Southeast Asia)
      - 3 job types
      - Popularity rank: 3
```

---

## Public API Endpoints (No Authentication Required)

### 1. Get All Country Guides
```bash
curl http://localhost:5000/api/country-guides
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

### 2. Get Popular Destinations
```bash
curl http://localhost:5000/api/country-guides?popular=true
```

### 3. Filter by Region
```bash
curl "http://localhost:5000/api/country-guides?region=Middle%20East"
```

### 4. Filter by Job Type
```bash
curl "http://localhost:5000/api/country-guides?jobType=construction"
```

### 5. Get Specific Country
```bash
curl "http://localhost:5000/api/country-guides/Saudi%20Arabia"
```

### 6. Get Available Regions
```bash
curl http://localhost:5000/api/country-guides/meta/regions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "regions": ["Middle East", "Southeast Asia"],
    "count": 2
  }
}
```

### 7. Get Available Job Types
```bash
curl http://localhost:5000/api/country-guides/meta/job-types
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobTypes": [
      "agriculture",
      "construction",
      "domestic_work",
      "hospitality",
      "manufacturing",
      "retail"
    ],
    "count": 6
  }
}
```

### 8. Search by Job Type
```bash
curl http://localhost:5000/api/country-guides/search/job/construction
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "country": "Saudi Arabia",
      "countryCode": "SA",
      "flagEmoji": "🇸🇦",
      "region": "Middle East",
      "salaryRange": {
        "minSalary": 800,
        "maxSalary": 1500,
        "currency": "SAR",
        "period": "monthly"
      },
      "overview": {...}
    }
  ]
}
```

### 9. Compare Salaries Across Countries
```bash
# All countries with construction jobs
curl http://localhost:5000/api/country-guides/compare/construction

# Specific countries
curl "http://localhost:5000/api/country-guides/compare/construction?countries=Saudi%20Arabia,Malaysia"
```

**Response:**
```json
{
  "success": true,
  "jobType": "construction",
  "count": 3,
  "data": [
    {
      "country": "United Arab Emirates",
      "salary": {
        "min": 900,
        "max": 1800,
        "average": 1350,
        "currency": "AED",
        "period": "monthly"
      }
    },
    {
      "country": "Malaysia",
      "salary": {
        "min": 1300,
        "max": 2200,
        "average": 1750,
        "currency": "MYR"
      }
    },
    {
      "country": "Saudi Arabia",
      "salary": {
        "min": 800,
        "max": 1500,
        "average": 1150,
        "currency": "SAR"
      }
    }
  ]
}
```

### 10. Get Guides by Region
```bash
curl "http://localhost:5000/api/country-guides/region/Middle%20East"
```

---

## Admin API Endpoints (Require Authentication)

### Get JWT Token First
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@migrateright.com",
    "password": "your-password"
  }'
```

Save the token from response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 11. Create New Country Guide (Admin Only)
```bash
curl -X POST http://localhost:5000/api/country-guides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "country": "Singapore",
    "countryCode": "SG",
    "flagEmoji": "🇸🇬",
    "region": "Southeast Asia",
    "overview": {
      "en": "Singapore is a popular destination...",
      "bn": "সিঙ্গাপুর একটি জনপ্রিয় গন্তব্য..."
    },
    "salaryRanges": [
      {
        "jobType": "construction",
        "title": {
          "en": "Construction Worker",
          "bn": "নির্মাণ শ্রমিক"
        },
        "minSalary": 1200,
        "maxSalary": 2000,
        "currency": "SGD",
        "period": "monthly"
      }
    ],
    "popularityRank": 4,
    "isActive": true
  }'
```

### 12. Update Country Guide (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/country-guides/GUIDE_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "popularityRank": 2
  }'
```

### 13. Update Popularity Rank (Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/country-guides/GUIDE_ID_HERE/rank \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "rank": 5
  }'
```

### 14. Delete Country Guide (Platform Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/country-guides/GUIDE_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 15. Restore Deleted Guide (Platform Admin Only)
```bash
curl -X PATCH http://localhost:5000/api/country-guides/GUIDE_ID_HERE/restore \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing with Postman

### Import Collection
Create a Postman collection with these requests:

**Environment Variables:**
- `base_url` = `http://localhost:5000`
- `auth_token` = (set after login)

**Collection Structure:**
```
Country Guides API
├── Public
│   ├── Get All Guides
│   ├── Get Popular Guides
│   ├── Get by Country
│   ├── Filter by Region
│   ├── Filter by Job Type
│   ├── Get Regions
│   ├── Get Job Types
│   ├── Search by Job Type
│   ├── Get by Region
│   └── Compare Salaries
└── Admin (requires auth)
    ├── Create Guide
    ├── Update Guide
    ├── Update Rank
    ├── Delete Guide
    └── Restore Guide
```

---

## Expected Response Formats

### Success Response
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Country guide not found for: Unknown Country",
  "statusCode": 404,
  "timestamp": "2026-01-02T10:30:00.000Z"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "BadRequestError",
  "message": "Country guide already exists for: Saudi Arabia",
  "statusCode": 400
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "UnauthorizedError",
  "message": "No token provided",
  "statusCode": 401
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "ForbiddenError",
  "message": "Access denied. Requires platform_admin role.",
  "statusCode": 403
}
```

---

## Frontend Testing

### 1. Test List View
1. Navigate to `http://localhost:3000/country-guides`
2. Verify popular destinations display
3. Test filters (region, job type, sort)
4. Click "Clear Filters" button
5. Click on a country card

### 2. Test Detail View
1. Navigate to `http://localhost:3000/country-guides/Saudi%20Arabia`
2. Verify all sections display:
   - Overview
   - Salary Info
   - Culture
   - Legal Rights
   - Emergency Contacts
   - Living Costs
3. Click section navigation tabs
4. Test language switcher (if implemented)
5. Click back button

### 3. Test Responsive Design
1. Resize browser window
2. Test on mobile device/emulator
3. Verify filters stack on mobile
4. Verify cards adjust to screen size

---

## Performance Testing

### Load Test with Artillery
```yaml
# artillery-config.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Get All Guides"
    flow:
      - get:
          url: "/api/country-guides"
  - name: "Get Popular"
    flow:
      - get:
          url: "/api/country-guides?popular=true"
  - name: "Get Specific Country"
    flow:
      - get:
          url: "/api/country-guides/Saudi%20Arabia"
```

Run:
```bash
artillery run artillery-config.yml
```

---

## Common Issues & Solutions

### Issue: "Country guide not found"
- **Cause**: Database not seeded or wrong country name
- **Solution**: Run seeder script, check exact country name (case-sensitive)

### Issue: "No token provided"
- **Cause**: Missing Authorization header for admin endpoints
- **Solution**: Add `Authorization: Bearer YOUR_TOKEN` header

### Issue: "Access denied"
- **Cause**: User doesn't have required role
- **Solution**: Use platform_admin or recruitment_admin account

### Issue: MongoDB connection error
- **Cause**: MongoDB not running
- **Solution**: Start MongoDB service: `mongod` or check MONGODB_URI

---

## Data Validation Tests

### Valid Country Data
```json
{
  "country": "Qatar",
  "countryCode": "QA",
  "region": "Middle East",
  "overview": { "en": "...", "bn": "..." },
  "salaryRanges": [
    {
      "jobType": "hospitality",
      "minSalary": 1000,
      "maxSalary": 2000,
      "currency": "QAR",
      "period": "monthly"
    }
  ]
}
```

### Invalid Data (Should Fail)
```json
{
  "country": "Qatar",
  // Missing countryCode - FAILS
  // Missing region - FAILS
  // Missing overview - FAILS
}
```

---

## Next Steps After Testing

1. ✅ Verify all endpoints work
2. ✅ Test authentication and authorization
3. ✅ Add more countries via seeder or admin API
4. ✅ Integrate frontend components into app routing
5. ✅ Add navigation menu links
6. ✅ Test multi-language switching
7. ✅ Perform user acceptance testing
8. ✅ Deploy to staging environment

---

**Testing Checklist:**
- [ ] Database seeded successfully
- [ ] All public endpoints return data
- [ ] Filters work correctly
- [ ] Search and compare functions work
- [ ] Admin authentication required
- [ ] Admin can create/update guides
- [ ] Frontend list view displays correctly
- [ ] Frontend detail view displays all sections
- [ ] Mobile responsive design works
- [ ] Language switching works (if implemented)
- [ ] Error handling displays properly

---

**Date**: January 2, 2026  
**API Version**: v1  
**Base URL**: http://localhost:5000/api
