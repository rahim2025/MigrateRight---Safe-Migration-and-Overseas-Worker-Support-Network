# MigrateRight - REST API Contract v1.0

## Base URL
```
Production: https://api.migrateright.bd/v1
Development: http://localhost:5000/api/v1
```

## Common Headers
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>  // For protected routes
Accept-Language: bn | en           // Optional, defaults to 'bn'
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] // Optional validation errors
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

# 1. Authentication APIs

## 1.1 Register User

**Endpoint:** `POST /auth/register`  
**Access:** Public  
**Description:** Register a new user account

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+8801712345678",
  "role": "aspiring_migrant",
  "fullName": {
    "firstName": "Ahmed",
    "lastName": "Rahman"
  },
  "dateOfBirth": "1995-05-15",
  "gender": "male",
  "location": {
    "bangladeshAddress": {
      "division": "Dhaka",
      "district": "Dhaka"
    }
  }
}
```

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6586a1b2c3d4e5f6g7h8i9j0",
      "email": "user@example.com",
      "phoneNumber": "+8801712345678",
      "role": "aspiring_migrant",
      "fullName": {
        "firstName": "Ahmed",
        "lastName": "Rahman"
      },
      "accountStatus": "pending",
      "verification": {
        "isEmailVerified": false,
        "isPhoneVerified": false,
        "isIdentityVerified": false
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Registration successful. Please verify your email.",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

**409 Conflict - Duplicate User**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_USER",
    "message": "User with this email already exists"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 1.2 Login

**Endpoint:** `POST /auth/login`  
**Access:** Public  
**Description:** Authenticate user and receive JWT token

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6586a1b2c3d4e5f6g7h8i9j0",
      "email": "user@example.com",
      "role": "aspiring_migrant",
      "fullName": {
        "firstName": "Ahmed",
        "lastName": "Rahman"
      },
      "accountStatus": "active",
      "profilePicture": "https://cdn.migrateright.bd/profiles/user123.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Login successful",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized - Invalid Credentials**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

**403 Forbidden - Account Locked**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to multiple failed login attempts. Try again in 2 hours.",
    "details": {
      "lockUntil": "2025-12-21T12:30:00.000Z"
    }
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

**403 Forbidden - Account Suspended**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SUSPENDED",
    "message": "Your account has been suspended. Please contact support."
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 1.3 Logout

**Endpoint:** `POST /auth/logout`  
**Access:** Protected  
**Description:** Invalidate current JWT token

### Request Body
```json
{}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 1.4 Verify Email

**Endpoint:** `GET /auth/verify-email/:token`  
**Access:** Public  
**Description:** Verify user email address using token

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "verified": true
  },
  "message": "Email verified successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**400 Bad Request - Invalid Token**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Email verification token is invalid or has expired"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 1.5 Forgot Password

**Endpoint:** `POST /auth/forgot-password`  
**Access:** Public  
**Description:** Request password reset link

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Password reset link sent to your email",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 1.6 Reset Password

**Endpoint:** `POST /auth/reset-password/:token`  
**Access:** Public  
**Description:** Reset password using token

### Request Body
```json
{
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successful. You can now login with your new password.",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

# 2. Recruitment Agency APIs

## 2.1 List Agencies

**Endpoint:** `GET /agencies`  
**Access:** Public  
**Description:** Get paginated list of recruitment agencies with filtering and sorting

### Query Parameters
```
page=1                          // Page number (default: 1)
limit=10                        // Items per page (default: 10, max: 50)
status=approved                 // Filter by approval status
country=Saudi Arabia            // Filter by destination country
district=Dhaka                  // Filter by district
minRating=4.0                   // Minimum rating filter
sort=-averageRating             // Sort field (prefix - for descending)
search=agency name              // Text search
nearMe=true                     // Find agencies near user (requires lat, lng)
lat=23.8103                     // Latitude (if nearMe=true)
lng=90.4125                     // Longitude (if nearMe=true)
radius=50000                    // Radius in meters (default: 50000)
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "agencies": [
      {
        "_id": "6586a1b2c3d4e5f6g7h8i9j1",
        "agencyName": "Safe Migration Services Ltd.",
        "agencyNameBengali": "নিরাপদ মাইগ্রেশন সার্ভিসেস লিমিটেড",
        "logo": "https://cdn.migrateright.bd/logos/agency1.jpg",
        "ratings": {
          "averageRating": 4.5,
          "totalReviews": 248
        },
        "registration": {
          "licenseNumber": "BMET-2023-1234",
          "expiryDate": "2026-12-31"
        },
        "addresses": {
          "headOffice": {
            "division": "Dhaka",
            "district": "Dhaka",
            "area": "Motijheel"
          }
        },
        "services": {
          "countriesServed": ["Saudi Arabia", "UAE", "Malaysia"],
          "jobSectorsSpecialized": ["construction", "hospitality"]
        },
        "adminApproval": {
          "status": "approved"
        },
        "isVerifiedByPlatform": true,
        "trustScore": 85,
        "isFeatured": true
      }
      // ... more agencies
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "appliedFilters": {
        "status": "approved",
        "country": "Saudi Arabia"
      }
    }
  },
  "message": "Agencies retrieved successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**400 Bad Request - Invalid Parameters**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid query parameters",
    "details": [
      {
        "field": "minRating",
        "message": "Rating must be between 0 and 5"
      }
    ]
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 2.2 Get Agency Details

**Endpoint:** `GET /agencies/:agencyId`  
**Access:** Public  
**Description:** Get detailed information about a specific agency

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "agency": {
      "_id": "6586a1b2c3d4e5f6g7h8i9j1",
      "agencyName": "Safe Migration Services Ltd.",
      "agencyNameBengali": "নিরাপদ মাইগ্রেশন সার্ভিসেস লিমিটেড",
      "tagline": "Your trusted partner for safe overseas employment",
      "description": "We are a government-registered recruitment agency...",
      "logo": "https://cdn.migrateright.bd/logos/agency1.jpg",
      "website": "https://safemigration.com.bd",
      "registration": {
        "licenseNumber": "BMET-2023-1234",
        "issuingAuthority": "Bureau of Manpower, Employment and Training (BMET)",
        "issueDate": "2023-01-15",
        "expiryDate": "2026-12-31",
        "registrationType": "government_registered"
      },
      "compliance": {
        "status": "fully_compliant",
        "complianceScore": 92,
        "lastAuditDate": "2025-10-15",
        "certifications": [
          {
            "certificationType": "ISO 9001:2015",
            "issuingBody": "International Organization for Standardization",
            "issueDate": "2024-06-01",
            "expiryDate": "2027-06-01"
          }
        ]
      },
      "contactInfo": {
        "primaryEmail": "info@safemigration.com.bd",
        "phoneNumbers": [
          {
            "type": "hotline",
            "number": "+880-1711-123456",
            "isPrimary": true
          },
          {
            "type": "office",
            "number": "+880-2-9876543",
            "isPrimary": false
          }
        ]
      },
      "addresses": {
        "headOffice": {
          "division": "Dhaka",
          "district": "Dhaka",
          "area": "Motijheel",
          "street": "123 Dilkusha C/A",
          "building": "Safe Migration Tower, 5th Floor",
          "postalCode": "1000",
          "coordinates": {
            "type": "Point",
            "coordinates": [90.4125, 23.8103]
          }
        },
        "branches": [
          {
            "branchName": "Chattogram Branch",
            "division": "Chattogram",
            "district": "Chattogram",
            "area": "Agrabad",
            "contactNumber": "+880-1711-654321",
            "isActive": true
          }
        ]
      },
      "feeStructure": {
        "baseFees": [
          {
            "destinationCountry": "Saudi Arabia",
            "jobCategory": "skilled",
            "processingFee": {
              "amount": 50000,
              "currency": "BDT"
            },
            "medicalTestFee": {
              "amount": 8000,
              "currency": "BDT"
            },
            "trainingFee": {
              "amount": 15000,
              "currency": "BDT"
            },
            "visaFee": {
              "amount": 45000,
              "currency": "BDT"
            },
            "ticketCost": {
              "amount": 35000,
              "currency": "BDT",
              "note": "Approximate, varies by airline"
            },
            "totalEstimatedCost": {
              "amount": 153000,
              "currency": "BDT"
            },
            "paymentTerms": "50% advance, 50% before departure",
            "refundPolicy": "75% refund if visa rejected"
          }
        ],
        "feeTransparencyScore": 9,
        "lastUpdated": "2025-11-15T10:00:00.000Z"
      },
      "services": {
        "countriesServed": ["Saudi Arabia", "UAE", "Malaysia", "Oman"],
        "jobSectorsSpecialized": ["construction", "hospitality", "healthcare"],
        "additionalServices": [
          {
            "serviceName": "Arabic Language Training",
            "description": "30-day intensive course",
            "isFree": false,
            "cost": 5000
          },
          {
            "serviceName": "Airport Pickup Arrangement",
            "description": "Assistance on arrival",
            "isFree": true
          }
        ],
        "languageTraining": true,
        "skillTraining": true,
        "postArrivalSupport": true
      },
      "ratings": {
        "averageRating": 4.5,
        "totalReviews": 248,
        "ratingBreakdown": {
          "fiveStar": 150,
          "fourStar": 70,
          "threeStar": 20,
          "twoStar": 5,
          "oneStar": 3
        },
        "aspectRatings": {
          "transparency": 4.7,
          "customerService": 4.5,
          "processEfficiency": 4.3,
          "postPlacementSupport": 4.4,
          "valueForMoney": 4.6
        }
      },
      "statistics": {
        "totalWorkersPlacements": 1250,
        "activeWorkers": 450,
        "successRate": 95.5,
        "yearEstablished": 2015
      },
      "adminApproval": {
        "status": "approved",
        "approvalDate": "2023-02-01"
      },
      "accountStatus": "active",
      "isVerifiedByPlatform": true,
      "isFeatured": true,
      "trustScore": 85,
      "createdAt": "2023-01-20T08:00:00.000Z",
      "updatedAt": "2025-12-15T14:30:00.000Z"
    }
  },
  "message": "Agency details retrieved successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "AGENCY_NOT_FOUND",
    "message": "Agency not found with the provided ID"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 2.3 Search Agencies by Location

**Endpoint:** `GET /agencies/nearby`  
**Access:** Public  
**Description:** Find agencies near a specific location using geospatial search

### Query Parameters
```
lat=23.8103                     // Required: Latitude
lng=90.4125                     // Required: Longitude
radius=50000                    // Optional: Search radius in meters (default: 50000)
limit=20                        // Optional: Max results (default: 20)
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "agencies": [
      {
        "_id": "6586a1b2c3d4e5f6g7h8i9j1",
        "agencyName": "Safe Migration Services Ltd.",
        "addresses": {
          "headOffice": {
            "division": "Dhaka",
            "district": "Dhaka",
            "area": "Motijheel",
            "coordinates": {
              "type": "Point",
              "coordinates": [90.4125, 23.8103]
            }
          }
        },
        "ratings": {
          "averageRating": 4.5,
          "totalReviews": 248
        },
        "distance": 250,  // Distance in meters
        "contactInfo": {
          "phoneNumbers": [
            {
              "type": "hotline",
              "number": "+880-1711-123456",
              "isPrimary": true
            }
          ]
        }
      }
      // ... more agencies sorted by distance
    ],
    "searchParameters": {
      "latitude": 23.8103,
      "longitude": 90.4125,
      "radius": 50000
    },
    "totalFound": 12
  },
  "message": "Nearby agencies found",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 2.4 Get Agency Reviews

**Endpoint:** `GET /agencies/:agencyId/reviews`  
**Access:** Public  
**Description:** Get reviews for a specific agency

### Query Parameters
```
page=1                          // Page number (default: 1)
limit=10                        // Items per page (default: 10)
rating=5                        // Filter by rating (1-5)
sort=-createdAt                 // Sort order
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "6586a1b2c3d4e5f6g7h8i9j2",
        "user": {
          "_id": "6586a1b2c3d4e5f6g7h8i9j0",
          "fullName": "Ahmed Rahman",
          "profilePicture": "https://cdn.migrateright.bd/profiles/user123.jpg"
        },
        "rating": 5,
        "aspectRatings": {
          "transparency": 5,
          "customerService": 5,
          "processEfficiency": 4,
          "postPlacementSupport": 5,
          "valueForMoney": 5
        },
        "title": "Excellent service, highly recommended",
        "comment": "They handled everything professionally...",
        "workerStatus": "currently_abroad",
        "destinationCountry": "Saudi Arabia",
        "isVerified": true,
        "helpfulCount": 24,
        "createdAt": "2025-11-15T08:00:00.000Z"
      }
      // ... more reviews
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalItems": 248,
      "itemsPerPage": 10
    }
  },
  "message": "Reviews retrieved successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

# 3. User Profile APIs

## 3.1 Get Current User Profile

**Endpoint:** `GET /users/me`  
**Access:** Protected  
**Description:** Get authenticated user's profile

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6586a1b2c3d4e5f6g7h8i9j0",
      "email": "user@example.com",
      "phoneNumber": "+8801712345678",
      "role": "aspiring_migrant",
      "accountStatus": "active",
      "fullName": {
        "firstName": "Ahmed",
        "lastName": "Rahman",
        "middleName": null
      },
      "fullNameString": "Ahmed Rahman",
      "dateOfBirth": "1995-05-15",
      "age": 30,
      "gender": "male",
      "nationalIdNumber": "19951234567890",
      "passportNumber": "BP1234567",
      "passportExpiryDate": "2028-06-15",
      "location": {
        "bangladeshAddress": {
          "division": "Dhaka",
          "district": "Dhaka",
          "upazila": "Mohammadpur",
          "detailedAddress": "House 45, Road 12, Block C",
          "postalCode": "1207"
        },
        "destinationCountry": "Saudi Arabia"
      },
      "employmentInfo": {
        "currentOccupation": "Electrician",
        "skillSet": ["electrical wiring", "maintenance", "troubleshooting"],
        "experienceYears": 5,
        "desiredJobSector": ["construction", "manufacturing"],
        "educationLevel": "higher_secondary"
      },
      "migrationStatus": "planning",
      "verification": {
        "isEmailVerified": true,
        "isPhoneVerified": true,
        "isIdentityVerified": false
      },
      "profilePicture": "https://cdn.migrateright.bd/profiles/user123.jpg",
      "language": "bn",
      "notifications": {
        "email": true,
        "sms": true,
        "push": true
      },
      "createdAt": "2025-10-15T08:00:00.000Z",
      "updatedAt": "2025-12-15T14:30:00.000Z"
    }
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required. Please login to access this resource."
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 3.2 Update User Profile

**Endpoint:** `PATCH /users/me`  
**Access:** Protected  
**Description:** Update authenticated user's profile

### Request Body
```json
{
  "fullName": {
    "firstName": "Ahmed",
    "middleName": "Mohammad",
    "lastName": "Rahman"
  },
  "location": {
    "bangladeshAddress": {
      "division": "Dhaka",
      "district": "Dhaka",
      "upazila": "Mohammadpur",
      "detailedAddress": "House 45, Road 12, Block C",
      "postalCode": "1207"
    },
    "destinationCountry": "UAE"
  },
  "employmentInfo": {
    "currentOccupation": "Senior Electrician",
    "skillSet": ["electrical wiring", "maintenance", "troubleshooting", "solar panel installation"],
    "experienceYears": 6,
    "desiredJobSector": ["construction", "manufacturing", "it_services"]
  },
  "language": "en"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6586a1b2c3d4e5f6g7h8i9j0",
      "email": "user@example.com",
      "fullName": {
        "firstName": "Ahmed",
        "middleName": "Mohammad",
        "lastName": "Rahman"
      },
      "location": {
        "bangladeshAddress": {
          "division": "Dhaka",
          "district": "Dhaka",
          "upazila": "Mohammadpur",
          "detailedAddress": "House 45, Road 12, Block C",
          "postalCode": "1207"
        },
        "destinationCountry": "UAE"
      },
      "employmentInfo": {
        "currentOccupation": "Senior Electrician",
        "skillSet": ["electrical wiring", "maintenance", "troubleshooting", "solar panel installation"],
        "experienceYears": 6,
        "desiredJobSector": ["construction", "manufacturing", "it_services"]
      },
      "updatedAt": "2025-12-21T10:35:00.000Z"
    }
  },
  "message": "Profile updated successfully",
  "timestamp": "2025-12-21T10:35:00.000Z"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "location.bangladeshAddress.division",
        "message": "Invalid division name"
      }
    ]
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 3.3 Change Password

**Endpoint:** `PATCH /users/me/password`  
**Access:** Protected  
**Description:** Change user's password

### Request Body
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized - Wrong Current Password**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CURRENT_PASSWORD",
    "message": "Current password is incorrect"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

**400 Bad Request - Password Mismatch**
```json
{
  "success": false,
  "error": {
    "code": "PASSWORD_MISMATCH",
    "message": "New password and confirm password do not match"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 3.4 Upload Profile Picture

**Endpoint:** `POST /users/me/profile-picture`  
**Access:** Protected  
**Description:** Upload or update profile picture  
**Content-Type:** `multipart/form-data`

### Request Body (Form Data)
```
file: <image file>  // Max size: 5MB, Allowed: jpg, jpeg, png
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://cdn.migrateright.bd/profiles/user123_1234567890.jpg"
  },
  "message": "Profile picture uploaded successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**400 Bad Request - Invalid File**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "Only JPG, JPEG, and PNG files are allowed"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

**413 Payload Too Large**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5MB limit"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 3.5 Upload Verification Documents

**Endpoint:** `POST /users/me/verification-documents`  
**Access:** Protected  
**Description:** Upload verification documents (passport, NID, etc.)  
**Content-Type:** `multipart/form-data`

### Request Body (Form Data)
```
documentType: national_id | passport | work_permit | visa | other
file: <document file>  // Max size: 10MB, Allowed: jpg, jpeg, png, pdf
```

### Success Response (201 Created)
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "6586a1b2c3d4e5f6g7h8i9j3",
      "documentType": "passport",
      "documentUrl": "https://cdn.migrateright.bd/documents/user123_passport_1234567890.pdf",
      "uploadedAt": "2025-12-21T10:30:00.000Z",
      "verificationStatus": "pending"
    }
  },
  "message": "Document uploaded successfully. Verification pending.",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

## 3.6 Delete Account

**Endpoint:** `DELETE /users/me`  
**Access:** Protected  
**Description:** Permanently delete user account

### Request Body
```json
{
  "password": "UserPassword123!",
  "confirmDeletion": true
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": null,
  "message": "Account deleted successfully",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Password is incorrect"
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

# Standard HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (email, phone) |
| 413 | Payload Too Large | File upload size exceeded |
| 422 | Unprocessable Entity | Valid JSON but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Maintenance or overload |

---

# Common Error Codes

| Error Code | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_REQUIRED` | No auth token provided |
| `INVALID_TOKEN` | JWT token invalid or expired |
| `UNAUTHORIZED` | Valid token but insufficient permissions |
| `DUPLICATE_USER` | Email or phone already exists |
| `USER_NOT_FOUND` | User doesn't exist |
| `AGENCY_NOT_FOUND` | Agency doesn't exist |
| `INVALID_CREDENTIALS` | Wrong email/password |
| `ACCOUNT_LOCKED` | Too many failed login attempts |
| `ACCOUNT_SUSPENDED` | Account suspended by admin |
| `INVALID_CURRENT_PASSWORD` | Wrong current password |
| `PASSWORD_MISMATCH` | Passwords don't match |
| `INVALID_FILE` | File type not allowed |
| `FILE_TOO_LARGE` | File exceeds size limit |
| `INVALID_PARAMETERS` | Invalid query parameters |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

---

# Rate Limiting

| Endpoint Type | Rate Limit | Window |
|---------------|------------|--------|
| Authentication | 5 requests | 15 minutes |
| Public APIs | 100 requests | 15 minutes |
| Protected APIs | 200 requests | 15 minutes |
| File Upload | 10 requests | 1 hour |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640088000
```

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900
  },
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

---

# Pagination

All list endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

**Pagination Response Structure:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

# Authentication Flow

1. **Registration**: `POST /auth/register` → Receive JWT token
2. **Email Verification**: `GET /auth/verify-email/:token`
3. **Login**: `POST /auth/login` → Receive JWT token
4. **Protected Requests**: Include `Authorization: Bearer <token>` header
5. **Token Refresh**: (To be implemented)
6. **Logout**: `POST /auth/logout`

---

# Frontend Integration Notes

## Axios Configuration Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': localStorage.getItem('language') || 'bn'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## File Upload Example

```javascript
const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/users/me/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};
```

---

# Backend Implementation Checklist

- [ ] Set up Express.js server with CORS
- [ ] Configure MongoDB connection
- [ ] Implement JWT authentication middleware
- [ ] Create error handling middleware
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Set up file upload (multer)
- [ ] Configure cloud storage (AWS S3 / Cloudinary)
- [ ] Implement input validation (express-validator / Joi)
- [ ] Create API route handlers
- [ ] Add request logging (morgan)
- [ ] Set up API documentation (Swagger)
- [ ] Implement unit tests (Jest)
- [ ] Configure environment variables
- [ ] Set up email service (SendGrid / NodeMailer)
- [ ] Implement SMS service for verification

---

**Version:** 1.0  
**Last Updated:** December 21, 2025  
**Maintained By:** MigrateRight Technical Team
