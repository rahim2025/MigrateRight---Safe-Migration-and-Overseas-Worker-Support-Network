# Agency Rating System - API Documentation

## Overview
The rating system allows authenticated users to submit ratings and reviews for recruitment agencies. Each user can submit one review per agency.

## API Endpoints

### 1. Get Agency Reviews
```
GET /api/agencies/:agencyId/reviews
```
**Description:** Get all approved reviews for a specific agency with pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort order (default: -createdAt)

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "user": {
          "_id": "user_id",
          "name": "John Doe",
          "avatar": "url"
        },
        "rating": 5,
        "breakdown": {
          "communication": 5,
          "transparency": 4,
          "support": 5,
          "documentation": 4,
          "jobQuality": 5
        },
        "title": "Excellent Service",
        "comment": "Very professional agency...",
        "pros": "Great communication",
        "cons": "None",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    },
    "averageRating": 4.5
  }
}
```

### 2. Create Agency Review
```
POST /api/agencies/:agencyId/reviews
```
**Description:** Submit a new review for an agency (requires authentication)

**Authentication:** Bearer token required

**Request Body:**
```json
{
  "rating": 5,
  "breakdown": {
    "communication": 5,
    "transparency": 4,
    "support": 5,
    "documentation": 4,
    "jobQuality": 5
  },
  "title": "Excellent Service",
  "comment": "Very professional agency with great support...",
  "pros": "Great communication, transparent fees",
  "cons": "None so far"
}
```

**Validation:**
- Rating: Required, integer between 1-5
- Breakdown: All fields required, integers between 1-5
- Title: Required, max 100 characters
- Comment: Required, min 20 characters, max 2000 characters
- Pros/Cons: Optional, max 500 characters each

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully and is pending approval",
  "data": {
    "_id": "review_id",
    "agency": "agency_id",
    "user": "user_id",
    "rating": 5,
    "title": "Excellent Service",
    "status": "Pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- 401 Unauthorized: No authentication token
- 400 Bad Request: Validation errors or duplicate review
- 404 Not Found: Agency not found

### 3. Update Review
```
PUT /api/agencies/:agencyId/reviews/:reviewId
```
**Description:** Update your own review (requires authentication)

**Authentication:** Bearer token required

**Authorization:** Only the review author can update their review

**Request Body:** Same as create review

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    // Updated review object
  }
}
```

### 4. Delete Review
```
DELETE /api/agencies/:agencyId/reviews/:reviewId
```
**Description:** Delete your own review (requires authentication)

**Authentication:** Bearer token required

**Authorization:** Only the review author can delete their review

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

## Rating Calculation

When a new review is submitted or updated, the system automatically:
1. Calculates the average rating for the agency
2. Counts total reviews
3. Updates the Agency model with new rating statistics

## Frontend Integration

### RatingModal Component
Located at: `frontend/src/components/RatingModal.jsx`

**Props:**
- `agencyId`: The ID of the agency to rate
- `agencyName`: Name of the agency (for display)
- `onClose`: Callback when modal is closed
- `onSubmit`: Callback when review is successfully submitted

**Features:**
- Interactive 5-star rating system
- Detailed breakdown ratings (communication, transparency, support, documentation, job quality)
- Title and comment fields
- Optional pros/cons fields
- Real-time validation
- Error handling
- Loading states

**Usage Example:**
```jsx
import RatingModal from '../../components/RatingModal';

const [showRatingModal, setShowRatingModal] = useState(false);
const [selectedAgency, setSelectedAgency] = useState(null);

<RatingModal
  agencyId={selectedAgency._id}
  agencyName={selectedAgency.name}
  onClose={() => setShowRatingModal(false)}
  onSubmit={(reviewData) => {
    // Refresh agencies list
    fetchAgencies();
  }}
/>
```

## Security Features

1. **Authentication Required:** Users must be logged in to submit reviews
2. **One Review Per Agency:** Unique index prevents duplicate reviews from the same user
3. **Owner Authorization:** Only review authors can update/delete their reviews
4. **Status Moderation:** Reviews default to "Pending" status for admin approval
5. **Input Validation:** All fields are validated on both frontend and backend

## Database Schema

### Review Model Fields
- `agency`: Reference to Agency (required)
- `user`: Reference to User (required)
- `rating`: Overall rating 1-5 (required)
- `breakdown`: Object with 5 rating categories (required)
- `title`: Review title, max 100 chars (required)
- `comment`: Review text, 20-2000 chars (required)
- `pros`: Optional, max 500 chars
- `cons`: Optional, max 500 chars
- `status`: Pending|Approved|Rejected|Flagged (default: Pending)
- `createdAt`, `updatedAt`: Timestamps

### Agency Rating Fields (Auto-updated)
- `rating.average`: Average of all approved reviews
- `rating.count`: Total number of approved reviews

## Testing

### Manual Testing Steps

1. **Test Review Submission:**
   - Login as a user
   - Navigate to agencies page
   - Click "Rate Agency" button
   - Fill out the rating form
   - Submit and verify success message

2. **Test Duplicate Prevention:**
   - Try to submit a second review for the same agency
   - Should receive error: "You have already reviewed this agency"

3. **Test Authentication:**
   - Logout
   - Try to click "Rate Agency"
   - Should show alert: "Please login to rate this agency"

4. **Test Review Display:**
   - Check that agency rating is updated after review submission
   - Verify review count increases

### API Testing with cURL

```bash
# Get reviews for an agency
curl http://localhost:5000/api/agencies/AGENCY_ID/reviews

# Submit a review (replace TOKEN with actual JWT)
curl -X POST http://localhost:5000/api/agencies/AGENCY_ID/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "rating": 5,
    "breakdown": {
      "communication": 5,
      "transparency": 4,
      "support": 5,
      "documentation": 4,
      "jobQuality": 5
    },
    "title": "Great Agency",
    "comment": "Very professional and helpful throughout the process"
  }'
```

## Next Steps

To complete the rating system:

1. **Add Review Display Component:** Create a component to show reviews on individual agency pages
2. **Admin Moderation Panel:** Build interface for admins to approve/reject reviews
3. **Review Filters:** Add filters for sorting reviews by rating, date, etc.
4. **Helpful Votes:** Add ability for users to vote reviews as helpful
5. **Review Statistics:** Display breakdown statistics on agency profile

## Files Modified/Created

### Backend
- ✅ `backend/controllers/review.controller.js` - Review CRUD operations
- ✅ `backend/routes/review.routes.js` - Review API routes
- ✅ `backend/routes/agency.routes.js` - Mounted review routes
- ✅ `backend/models/Review.model.js` - Already existed, compatible

### Frontend
- ✅ `frontend/src/components/RatingModal.jsx` - Rating submission modal
- ✅ `frontend/src/components/RatingModal.css` - Modal styling
- ✅ `frontend/src/pages/Agencies/SearchAgencies.jsx` - Added rating button and modal integration
- ✅ `frontend/src/pages/Agencies/SearchAgencies.css` - Added rating button styles
