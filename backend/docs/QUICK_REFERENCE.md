# API Quick Reference Card

## 🌐 Base URL
```
http://localhost:5000/api
```

---

## 📌 HEALTH CHECK
```
GET /health                    → Server status
GET /health/detailed           → Detailed system info
```

---

## 🔐 AUTHENTICATION
```
POST   /auth/register          → Create account
POST   /auth/login             → Login (get token)
GET    /auth/me                → Current user
POST   /auth/forgot-password   → Reset password
POST   /auth/logout            → Logout
POST   /auth/refresh-token     → Renew token
```

---

## 🌍 COUNTRY GUIDES
```
GET    /countries              → All countries
GET    /countries/SA           → Get by code (SA/AE/QA)
GET    /countries/Saudi Arabia → Get by name
GET    /countries/meta/regions → Available regions
GET    /countries/meta/job-types → Available jobs
GET    /countries/search/job/construction → Filter by job
GET    /countries/region/Middle East     → Filter by region
GET    /countries?region=X&limit=5       → With filters
```

---

## 💰 CALCULATOR
```
GET    /calculator/countries   → Available countries
GET    /calculator/countries/SA/jobs              → Jobs/country
GET    /calculator/fee-rules?country=SA&jobType=X → Fee rules
POST   /calculator/calculate                      → Calculate cost
```

**Calculator POST body:**
```json
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

---

## 🏢 AGENCIES
```
GET    /agencies               → All agencies
GET    /agencies/stats         → Statistics
GET    /agencies/top-rated     → Top rated
GET    /agencies/city/Dhaka    → By city
GET    /agencies?page=1&limit=10 → Pagination
GET    /agencies/{id}          → Get single agency
```

---

## 🚨 EMERGENCY
```
GET    /emergency/contacts/country/SA    → Contacts/country
GET    /emergency/contacts/nearest       → Nearest contacts
POST   /emergency/sos                    → Trigger SOS (auth)
GET    /emergency/history                → SOS history (auth)
GET    /emergency/{eventId}              → Get event details
PATCH  /emergency/{eventId}/status       → Update status
```

---

## 💼 SALARY TRACKING (Auth Required)
```
POST   /salary                 → Create record
GET    /salary                 → Get records
GET    /salary/stats           → Statistics
GET    /salary/discrepancies   → Find discrepancies
GET    /salary/recent          → Recent records
GET    /salary/{id}            → Get single record
PATCH  /salary/{id}            → Update record
DELETE /salary/{id}            → Delete record
POST   /salary/{id}/dispute    → Mark disputed
POST   /salary/{id}/resolve    → Resolve dispute
```

---

## 👤 USER PROFILES (Auth Required)
```
GET    /users/me               → Current user profile
PATCH  /users/me               → Update profile
GET    /users/{id}             → Get user by ID
```

---

## ⭐ AGENCY REVIEWS (Auth Optional)
```
POST   /agencies/{id}/reviews  → Create review (auth)
GET    /agencies/{id}/reviews  → Get reviews
```

---

## 📝 AGENCY COMPLAINTS (Auth Required)
```
POST   /agencies/{id}/complaints  → Create complaint
GET    /agencies/{id}/complaints  → Get complaints
```

---

## 👨‍💼 WORKER PROFILES (Auth Required)
```
POST   /workers/profile        → Create profile
GET    /workers/profile        → Get profile
PATCH  /workers/profile        → Update profile
```

---

## 🔑 Authentication Header
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

Add to every protected endpoint request!

---

## 📊 Common Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?region=Middle East
?country=SA
?jobType=construction
?city=Dhaka
```

### Language
```
?language=en
?language=bn
```

### Sorting
```
?sort=country
?sort=rating
?sort=-createdAt
```

---

## ✅ Status Codes

| Code | Meaning |
|------|---------|
| 200  | ✅ OK - Success |
| 201  | ✅ Created |
| 400  | ❌ Bad Request |
| 401  | ❌ Unauthorized |
| 404  | ❌ Not Found |
| 500  | ❌ Server Error |

---

## 🚀 Quick Test Commands

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get Countries
```bash
curl http://localhost:5000/api/countries
```

### Get Country Details
```bash
curl http://localhost:5000/api/countries/SA
```

### Calculate Fees
```bash
curl -X POST http://localhost:5000/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{"destinationCountry":"SA","jobType":"domestic_work","agencyFee":2500}'
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.com",
    "password":"Test123!",
    "firstName":"Test",
    "lastName":"User",
    "userType":"worker",
    "phone":"+8801234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

---

## 💡 Quick Tips

### Save Token to Variable
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo $TOKEN
```

### Use Token in Request
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

### Pretty Print JSON
```bash
curl http://localhost:5000/api/countries | jq
```

### Save Response to File
```bash
curl http://localhost:5000/api/countries > response.json
```

---

## 🎯 Country Codes

| Code | Country |
|------|---------|
| SA   | Saudi Arabia |
| AE   | United Arab Emirates |
| QA   | Qatar |

---

## 👷 Job Types

- `domestic_work` - Household/domestic work
- `construction` - Construction & building
- `healthcare` - Healthcare & nursing
- `hospitality` - Hotels & restaurants
- `manufacturing` - Factory work
- `agriculture` - Farm work
- `it_services` - IT & tech
- `driving` - Transportation
- `security` - Security work
- `general_labor` - General labor

---

## 💾 Seeded Data Status

✅ Countries: 3 (SA, AE, QA)
✅ Fee Rules: 12 (4 per country)
✅ Languages: English + Bengali
✅ Salary Ranges: 4 per country
✅ Contacts: Emergency info included

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| [README_TESTING.md](README_TESTING.md) | Overview & quick start |
| [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) | Detailed curl commands |
| [API_EXAMPLES.md](API_EXAMPLES.md) | Real request/response examples |
| [TESTING_SUMMARY.md](TESTING_SUMMARY.md) | Test scenarios & workflows |
| [MigrateRight-Postman-Collection.json](MigrateRight-Postman-Collection.json) | Postman import file |

---

## 🔧 Troubleshooting

**Connection refused?**
```bash
npm run dev  # Start backend
```

**Data not found?**
```bash
npm run seed:countries:force
npm run seed:fee-rules:force
```

**Token invalid?**
- Logout and login again
- Get fresh token from /auth/login

**404 error?**
- Check spelling of endpoint
- Verify ID format (MongoDB ObjectId)
- Check HTTP method (GET vs POST)

---

## 🎓 Learning Path

1. **Test Health** → `/api/health`
2. **Browse Data** → `/api/countries`
3. **Calculate** → `POST /api/calculator/calculate`
4. **Register** → `POST /api/auth/register`
5. **Authenticate** → `POST /api/auth/login`
6. **Explore** → All protected endpoints

---

## 📞 Need Help?

- **Curl Syntax?** → API_TESTING_GUIDE.md
- **Response Format?** → API_EXAMPLES.md
- **Quick Answers?** → TESTING_SUMMARY.md
- **Postman Setup?** → MigrateRight-Postman-Collection.json
- **Full Details?** → README_TESTING.md

---

**All APIs Ready to Test! ✅ Start with `/api/health` 🚀**
