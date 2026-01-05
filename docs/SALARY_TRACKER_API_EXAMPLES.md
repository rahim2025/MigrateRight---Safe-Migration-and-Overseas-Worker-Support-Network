# Salary Tracker API Examples

## Request/Response Examples

### 1. Create Salary Record

#### Request
```http
POST /api/salary-tracker HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "employmentId": "ABC-CORP-2024-001",
  "employerName": "ABC Construction LLC",
  "employerCountry": "United Arab Emirates",
  "position": "Heavy Equipment Operator",
  "promisedSalary": 4500,
  "receivedSalary": 3600,
  "currency": "AED",
  "paymentPeriod": "monthly",
  "paymentDate": "2024-01-31T00:00:00Z",
  "deductions": {
    "housing": 300,
    "meals": 150,
    "taxes": 100,
    "insurance": 50,
    "other": 50,
    "description": "Standard deductions per employment contract"
  },
  "notes": "January salary received with delay"
}
```

#### Response 201 Created
```json
{
  "success": true,
  "message": "Salary record created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "employmentId": "ABC-CORP-2024-001",
    "employerName": "ABC Construction LLC",
    "employerCountry": "United Arab Emirates",
    "position": "Heavy Equipment Operator",
    "promisedSalary": 4500,
    "receivedSalary": 3600,
    "currency": "AED",
    "paymentPeriod": "monthly",
    "paymentDate": "2024-01-31T00:00:00Z",
    "deductions": {
      "housing": 300,
      "meals": 150,
      "taxes": 100,
      "insurance": 50,
      "other": 50,
      "description": "Standard deductions per employment contract"
    },
    "discrepancy": {
      "amount": 900,
      "percentage": 20,
      "status": "significant_mismatch",
      "totalDeductions": 650,
      "hasDeductions": true
    },
    "proofDocuments": [],
    "status": "pending_review",
    "flaggedForReview": true,
    "notes": "January salary received with delay",
    "isArchived": false,
    "createdAt": "2024-01-05T10:30:00Z",
    "updatedAt": "2024-01-05T10:30:00Z",
    "__v": 0
  }
}
```

---

### 2. Get All Salary Records with Pagination

#### Request
```http
GET /api/salary-tracker?status=all&page=1&limit=5&sort=-paymentDate HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "employerName": "ABC Construction LLC",
      "employerCountry": "United Arab Emirates",
      "promisedSalary": 4500,
      "receivedSalary": 3600,
      "currency": "AED",
      "paymentDate": "2024-01-31T00:00:00Z",
      "discrepancy": {
        "amount": 900,
        "percentage": 20,
        "status": "significant_mismatch"
      },
      "status": "pending_review",
      "flaggedForReview": true
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "employerName": "XYZ Industries",
      "employerCountry": "Saudi Arabia",
      "promisedSalary": 3000,
      "receivedSalary": 2970,
      "currency": "SAR",
      "paymentDate": "2024-01-30T00:00:00Z",
      "discrepancy": {
        "amount": 30,
        "percentage": 1,
        "status": "minor_mismatch"
      },
      "status": "verified"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRecords": 15,
    "recordsPerPage": 5
  }
}
```

---

### 3. Get Salary Summary

#### Request
```http
GET /api/salary-tracker/summary?startDate=2024-01-01&endDate=2024-01-31 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response 200 OK
```json
{
  "success": true,
  "data": {
    "totalPromised": 34500,
    "totalReceived": 31500,
    "totalShortfall": 3000,
    "totalDeductions": 2100,
    "recordCount": 12,
    "mismatchCount": 8,
    "averageDiscrepancyPercentage": 8.7,
    "statusBreakdown": {
      "match": 2,
      "minor_mismatch": 4,
      "significant_mismatch": 5,
      "critical_underpayment": 1
    },
    "records": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "employerName": "ABC Construction LLC",
        "paymentDate": "2024-01-31T00:00:00Z",
        "promisedSalary": 4500,
        "receivedSalary": 3600,
        "discrepancy": {
          "amount": 900,
          "percentage": 20,
          "status": "significant_mismatch"
        }
      }
    ]
  }
}
```

---

### 4. Get Records with Wage Mismatches

#### Request
```http
GET /api/salary-tracker/mismatches?severity=critical&limit=10 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response 200 OK
```json
{
  "success": true,
  "stats": {
    "totalRecords": 2,
    "criticalCount": 2,
    "significantCount": 0,
    "minorCount": 0,
    "totalShortfall": 4200
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "employerName": "Global Transport",
      "employerCountry": "Kuwait",
      "promisedSalary": 5000,
      "receivedSalary": 2800,
      "currency": "KWD",
      "paymentDate": "2024-01-28T00:00:00Z",
      "discrepancy": {
        "amount": 2200,
        "percentage": 44,
        "status": "critical_underpayment"
      },
      "status": "pending_review",
      "flaggedForReview": true,
      "proofDocuments": [
        {
          "_id": "507f1f77bcf86cd799439020",
          "fileName": "payslip_jan_2024.pdf",
          "fileType": "pdf",
          "documentType": "payslip",
          "uploadDate": "2024-01-31T00:00:00Z"
        }
      ]
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "employerName": "Middle East Logistics",
      "employerCountry": "Qatar",
      "promisedSalary": 3500,
      "receivedSalary": 1800,
      "currency": "QAR",
      "paymentDate": "2024-01-25T00:00:00Z",
      "discrepancy": {
        "amount": 1700,
        "percentage": 48.57,
        "status": "critical_underpayment"
      },
      "status": "escalated",
      "flaggedForReview": true
    }
  ]
}
```

---

### 5. Upload Proof Document

#### Request
```http
POST /api/salary-tracker/507f1f77bcf86cd799439011/upload-proof HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="payslip_jan_2024.pdf"
Content-Type: application/pdf

[Binary PDF Content]
------WebKitFormBoundary
Content-Disposition: form-data; name="documentType"

payslip
------WebKitFormBoundary
Content-Disposition: form-data; name="description"

January 2024 monthly salary document
------WebKitFormBoundary--
```

#### Response 201 Created
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "salaryRecordId": "507f1f77bcf86cd799439011",
    "document": {
      "_id": "507f1f77bcf86cd799439020",
      "fileName": "payslip_jan_2024_1704441000000_a1b2c3d4e5f6.pdf",
      "fileType": "pdf",
      "mimeType": "application/pdf",
      "filePath": "uploads/salary-proofs/payslip_jan_2024_1704441000000_a1b2c3d4e5f6.pdf",
      "fileSize": 245678,
      "uploadDate": "2024-01-05T11:30:00Z",
      "documentType": "payslip",
      "description": "January 2024 monthly salary document"
    }
  }
}
```

---

### 6. Mark Record as Disputed

#### Request
```http
PATCH /api/salary-tracker/507f1f77bcf86cd799439011/dispute HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Salary received is significantly lower than the contract amount. Housing deduction was not agreed upon."
}
```

#### Response 200 OK
```json
{
  "success": true,
  "message": "Record marked as disputed",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "employerName": "ABC Construction LLC",
    "status": "disputed",
    "reviewNotes": "Salary received is significantly lower than the contract amount. Housing deduction was not agreed upon.",
    "flaggedForReview": true,
    "discrepancy": {
      "amount": 900,
      "percentage": 20,
      "status": "significant_mismatch"
    },
    "updatedAt": "2024-01-05T11:35:00Z"
  }
}
```

---

### 7. Update Salary Record

#### Request
```http
PATCH /api/salary-tracker/507f1f77bcf86cd799439012 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "receivedSalary": 3000,
  "deductions": {
    "housing": 0,
    "meals": 0,
    "taxes": 0,
    "insurance": 0,
    "other": 0
  },
  "notes": "Correction: Full amount was received after employer clarification"
}
```

#### Response 200 OK
```json
{
  "success": true,
  "message": "Salary record updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "employerName": "XYZ Industries",
    "promisedSalary": 3000,
    "receivedSalary": 3000,
    "discrepancy": {
      "amount": 0,
      "percentage": 0,
      "status": "match",
      "totalDeductions": 0
    },
    "status": "pending_review",
    "flaggedForReview": false,
    "notes": "Correction: Full amount was received after employer clarification",
    "updatedAt": "2024-01-05T12:00:00Z"
  }
}
```

---

### 8. Error: Missing Required Fields

#### Request
```http
POST /api/salary-tracker HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "employerName": "ABC Company"
}
```

#### Response 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: employmentId, employerName, employerCountry, promisedSalary, receivedSalary, paymentDate"
}
```

---

### 9. Error: File Too Large

#### Request
```http
POST /api/salary-tracker/507f1f77bcf86cd799439011/upload-proof HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

[6MB PDF file]
```

#### Response 400 Bad Request
```json
{
  "success": false,
  "message": "File size exceeds maximum limit of 5MB"
}
```

---

### 10. Error: Unauthorized

#### Request (Missing Token)
```http
GET /api/salary-tracker HTTP/1.1
Host: localhost:5000
```

#### Response 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please provide a valid JWT token."
}
```

---

### 11. Error: Record Not Found

#### Request
```http
GET /api/salary-tracker/invalid_id_here HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response 404 Not Found
```json
{
  "success": false,
  "message": "Salary record not found"
}
```

---

### 12. Admin: Get Flagged Records

#### Request
```http
GET /api/salary-tracker/admin/flagged?limit=20 HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (admin token)
```

#### Response 200 OK
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": {
        "_id": "507f1f77bcf86cd799439001",
        "fullName": {
          "firstName": "Ahmed",
          "lastName": "Hassan"
        },
        "email": "ahmed@example.com"
      },
      "employerName": "Global Transport",
      "discrepancy": {
        "amount": 2200,
        "percentage": 44,
        "status": "critical_underpayment"
      },
      "flaggedForReview": true,
      "status": "pending_review",
      "createdAt": "2024-01-28T00:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": {
        "_id": "507f1f77bcf86cd799439002",
        "fullName": {
          "firstName": "Fatima",
          "lastName": "Khan"
        },
        "email": "fatima@example.com"
      },
      "employerName": "Middle East Logistics",
      "discrepancy": {
        "amount": 1700,
        "percentage": 48.57,
        "status": "critical_underpayment"
      },
      "flaggedForReview": true,
      "status": "escalated",
      "createdAt": "2024-01-25T00:00:00Z"
    }
  ]
}
```

---

## HTTP Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Record retrieved/updated successfully |
| 201 | Created | New salary record created |
| 400 | Bad Request | Missing fields, invalid data |
| 401 | Unauthorized | Missing/invalid authentication token |
| 403 | Forbidden | Admin endpoint, insufficient privileges |
| 404 | Not Found | Record ID doesn't exist |
| 413 | Payload Too Large | File exceeds size limit |
| 500 | Server Error | Database or server error |

---

## Common Request Headers

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
Accept: application/json
User-Agent: MyApp/1.0
```

---

**Last Updated:** January 5, 2024
