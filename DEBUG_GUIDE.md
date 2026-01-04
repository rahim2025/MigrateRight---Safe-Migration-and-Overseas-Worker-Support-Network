# 🔍 Debugging Guide - Country Selection Issues

## সমস্যা (Problems):
1. Calculator-এ country dropdown কাজ করছে না
2. Country Guides page-এ কোনো দেশ দেখা যাচ্ছে না

## ধাপ ১: Backend Server চালু আছে কিনা যাচাই করুন

```bash
# Terminal-এ check করুন
curl http://localhost:5000/api/health
```

যদি response না পান, তাহলে backend server start করুন:
```bash
cd backend
npm run dev
```

## ধাপ ২: Database-এ Data আছে কিনা যাচাই করুন

### Country Guides Data Check:
```bash
# API test করুন
curl http://localhost:5000/api/country-guides
```

যদি empty array `[]` বা `count: 0` দেখেন, তাহলে database seed করুন:
```bash
# Option 1: Seed Country Guides
node backend/utils/seedCountryGuides.js

# Option 2: Alternative seeder
node backend/scripts/seedDatabase.js
```

### Calculator Countries Check:
```bash
# API test করুন
curl http://localhost:5000/api/calculator/countries
```

যদি empty array দেখেন, তাহলে migration fee rules seed করুন:
```bash
node backend/scripts/seedFeeRules.js
```

## ধাপ ৩: Browser Console-এ Error Check করুন

1. Browser-এ F12 চাপুন (Developer Tools খুলুন)
2. Console tab-এ যান
3. Page refresh করুন
4. Red error messages দেখুন

Common errors:
- `Network Error` → Backend server চালু নেই
- `404 Not Found` → Route সঠিক নয়
- `CORS Error` → CORS configuration সমস্যা
- `Empty response` → Database-এ data নেই

## ধাপ ৪: Network Tab-এ API Calls Check করুন

1. Browser Developer Tools-এ Network tab খুলুন
2. Page refresh করুন
3. API calls দেখুন:
   - `/api/country-guides` → Status code কি?
   - `/api/calculator/countries` → Status code কি?

Expected:
- ✅ Status 200 → API কাজ করছে
- ❌ Status 404 → Route খুঁজে পাওয়া যাচ্ছে না
- ❌ Status 500 → Server error
- ❌ Status 0/CORS → Backend server চালু নেই

## ধাপ ৫: Quick Fix Commands

### সব কিছু reset করতে:
```bash
# 1. Database seed করুন
node backend/utils/seedCountryGuides.js
node backend/scripts/seedFeeRules.js

# 2. Backend restart করুন
# (Ctrl+C দিয়ে stop করুন, তারপর আবার start করুন)
cd backend
npm run dev

# 3. Frontend restart করুন
# (নতুন terminal-এ)
cd frontend
npm run dev
```

## ধাপ ৬: Manual API Test

### Country Guides Test:
```bash
# Get all guides
curl http://localhost:5000/api/country-guides

# Get with filters
curl "http://localhost:5000/api/country-guides?language=bn&sort=popularityRank"

# Get regions
curl http://localhost:5000/api/country-guides/meta/regions
```

### Calculator Countries Test:
```bash
# Get available countries
curl http://localhost:5000/api/calculator/countries
```

Expected response format:
```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "code": "SA",
        "name": "Saudi Arabia",
        "flag": "🇸🇦",
        "currency": "SAR"
      }
    ],
    "count": 1
  }
}
```

## Common Issues & Solutions

### Issue 1: "Route not found"
**Solution:** Backend server restart করুন

### Issue 2: "No countries found"
**Solution:** Database seed করুন

### Issue 3: "CORS error"
**Solution:** 
- Backend server চালু আছে কিনা check করুন
- `backend/server.js`-এ CORS config check করুন

### Issue 4: "Empty dropdown"
**Solution:**
- Browser console-এ error check করুন
- API response format check করুন
- Fallback countries কাজ করছে কিনা check করুন

