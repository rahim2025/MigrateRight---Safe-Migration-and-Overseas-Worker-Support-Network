# Agency Registration & Display System - Complete Implementation

## Overview
The full agency system has been recreated. Companies can now register as agencies and their details will automatically appear on the agency search page for users to find.

## System Flow

### 1. Agency Registration
**File:** `backend/controllers/auth.controller.js`

When a company registers as an agency via `/api/auth/register-agency`:

1. **User Account Created** (role: 'agency')
   - Email, password, phone number
   - Contact person name
   - Account status: 'pending'

2. **AgencyDetails Created**
   - Company name
   - Trade license number
   - TIN number
   - Income level
   - Business address
   - Contact information

3. **Agency Listing Created** (NEW)
   - Automatically creates a searchable Agency entry
   - Uses company name, license, location, contact info
   - Initial verification status: false (requires admin approval)
   - Links to user account via `owner` field

### 2. Agency Display
**File:** `frontend/src/pages/Agencies/SearchAgencies.jsx`

The agency search page now:
- Fetches real agencies from `/api/agencies` API
- Displays loading state while fetching
- Shows error state if fetch fails
- Filters agencies by:
  - Search term (name or license)
  - Destination country
  - Minimum rating
  - Verified only
- Shows detailed agency cards with:
  - Company name and verification badge
  - License number
  - Location
  - Contact information (phone, email)
  - Rating and reviews
  - Specializations
  - Destination countries

## Files Modified

### Backend
1. **`backend/controllers/auth.controller.js`**
   - Added Agency model import
   - Updated `registerAgency` function to create Agency entry
   - Auto-populates agency data from registration form

2. **`backend/models/Agency.model.js`**
   - Added `owner` field to link agency to user account
   - Enables future agency dashboard features

### Frontend
1. **`frontend/src/pages/Agencies/SearchAgencies.jsx`**
   - Removed dummy data
   - Added API integration with useEffect
   - Added loading and error states
   - Updated to handle real API response structure
   - Fixed data mapping for MongoDB ObjectIds

2. **`frontend/src/pages/Agencies/SearchAgencies.css`**
   - Added loading spinner styles
   - Added error state styles
   - Removed placeholder notice styles

### Seed Data
1. **`backend/utils/seeder.js`**
   - Emptied sample agencies array
   - Database cleared of seed data

## API Endpoints

### Registration
```
POST /api/auth/register-agency
```
**Body:**
```json
{
  "email": "agency@example.com",
  "password": "password123",
  "companyName": "ABC Recruitment",
  "tradeLicenseNumber": "TL-2024-001",
  "tinNumber": "TIN-123456",
  "incomeLevel": "Medium",
  "businessAddress": "123 Street, Dhaka",
  "contactPersonName": "John Doe",
  "phoneNumber": "+880-1234567890"
}
```

### Get Agencies
```
GET /api/agencies
```
**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `city` - Filter by city
- `country` - Filter by destination country
- `minRating` - Minimum rating
- `search` - Text search

## Testing the Flow

1. **Register a New Agency**
   ```bash
   # Via frontend: Go to /register and select "Register as Agency"
   # Or via API:
   curl -X POST http://localhost:5000/api/auth/register-agency \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@agency.com",
       "password": "password123",
       "companyName": "Test Agency",
       "tradeLicenseNumber": "TL-TEST-001",
       "tinNumber": "TIN-TEST-001",
       "incomeLevel": "Medium",
       "businessAddress": "Test Street, Dhaka",
       "contactPersonName": "Test Person",
       "phoneNumber": "+880-1111111111"
     }'
   ```

2. **View on Agency Page**
   - Navigate to `/agencies` in the frontend
   - The newly registered agency will appear in the list
   - Note: It will show as "Not Verified" until admin approves

3. **Search and Filter**
   - Use the search box to find agencies by name or license
   - Filter by destination country, rating, or verified status

## Future Enhancements

1. **Admin Approval Dashboard**
   - Admin can verify agencies
   - Change `isVerified` status
   - Review submitted documents

2. **Agency Profile Page**
   - Click "View Details" to see full agency profile
   - Show reviews, ratings, and placement history

3. **Agency Dashboard**
   - Agencies can update their information
   - Add destination countries
   - Add specializations
   - Upload documents

4. **Enhanced Search**
   - Filter by specialization
   - Sort by rating, placements, etc.
   - Geolocation-based search

## Notes

- All new agencies start with `isVerified: false`
- Only active and verified agencies appear in default searches
- Agencies can be linked to their owner via the `owner` field
- The system maintains two models:
  - `AgencyDetails` - Registration and admin data
  - `Agency` - Public searchable listings
