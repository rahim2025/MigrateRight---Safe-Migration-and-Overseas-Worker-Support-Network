# Salary Tracker Feature - Complete Implementation Guide

## Overview

The Salary Tracker feature enables overseas workers to record their promised vs actual received salaries, upload proof documents (images/PDFs), and automatically detect wage mismatches. The system highlights discrepancies and helps workers track potential underpayment.

## Key Features

✅ **Promised vs Received Salary Tracking** - Workers log both contract and actual salary  
✅ **Automatic Wage Mismatch Detection** - System calculates shortfalls and categorizes severity  
✅ **Proof Document Upload** - Secure storage of payslips, bank statements, contracts, photos  
✅ **Deduction Tracking** - Record housing, meals, taxes, insurance, and other deductions  
✅ **Discrepancy Classification** - Auto-categorizes: match, minor, significant, or critical  
✅ **Status Management** - Track pending, verified, disputed, resolved records  
✅ **MongoDB Secure Storage** - All data encrypted and user-isolated  
✅ **Admin Review Dashboard** - Flag critical cases for platform administrators  

---

## Database Schema (MongoDB)

### SalaryTracker Model

**Location:** `backend/models/SalaryTracker.model.js`

```javascript
{
  userId: ObjectId,                    // Reference to User
  employmentId: String,                // Employer's employment reference
  employerName: String,                // Company name
  employerCountry: String,             // Country of employment
  position: String,                    // Job title
  
  // Salary Information
  promisedSalary: Number,              // Contract salary amount
  receivedSalary: Number,              // Actual salary received
  currency: String,                    // ISO 4217 code (USD, SAR, etc.)
  paymentPeriod: String,               // daily, weekly, monthly, etc.
  paymentDate: Date,                   // When payment was received
  
  // Deductions
  deductions: {
    housing: Number,
    meals: Number,
    taxes: Number,
    insurance: Number,
    other: Number,
    description: String
  },
  
  // Auto-Calculated Discrepancy
  discrepancy: {
    amount: Number,                    // Promised - Received
    percentage: Number,                // (amount / promised) * 100
    status: String,                    // match, minor_mismatch, significant_mismatch, critical_underpayment
    totalDeductions: Number,
    hasDeductions: Boolean
  },
  
  // Proof Documents
  proofDocuments: [{
    _id: ObjectId,
    fileName: String,
    fileType: String,                  // image, pdf, document
    mimeType: String,
    filePath: String,
    fileSize: Number,
    uploadDate: Date,
    documentType: String,              // payslip, bank_statement, contract, etc.
    description: String
  }],
  
  // Status & Resolution
  status: String,                      // pending_review, verified, disputed, resolved, escalated
  resolution: {
    resolvedDate: Date,
    resolution: String,
    resolvedBy: ObjectId,
    notes: String
  },
  
  // Metadata
  notes: String,
  isArchived: Boolean,
  flaggedForReview: Boolean,           // Auto-set if critical discrepancy
  reviewNotes: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Discrepancy Status Values

- **match** (< 1% difference) - Payment matches or very close
- **minor_mismatch** (1-10%) - Small discrepancy, may be acceptable with deductions
- **significant_mismatch** (10-30%) - Notable underpayment, needs investigation
- **critical_underpayment** (≥ 30%) - Severe underpayment, auto-flagged for review

---

## REST API Endpoints

**Base URL:** `/api/salary-tracker`

All endpoints require authentication (Bearer token in Authorization header)

### Create Operations

#### Create Salary Record
```
POST /api/salary-tracker
Content-Type: application/json
Authorization: Bearer {token}

{
  "employmentId": "EMP-001",           // Required
  "employerName": "ABC Corporation",   // Required
  "employerCountry": "Saudi Arabia",   // Required
  "position": "Construction Worker",
  "promisedSalary": 2000,              // Required
  "receivedSalary": 1800,              // Required
  "currency": "SAR",                   // Optional, default: USD
  "paymentDate": "2024-01-15",         // Required
  "paymentPeriod": "monthly",          // Optional
  "deductions": {
    "housing": 100,
    "meals": 50,
    "taxes": 20
  },
  "notes": "Salary received late"
}

Response 201:
{
  "success": true,
  "message": "Salary record created successfully",
  "data": { ...salaryRecord }
}
```

### Read Operations

#### Get All Salary Records
```
GET /api/salary-tracker?status=all&page=1&limit=10&sort=-paymentDate
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [...salaryRecords],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 45,
    "recordsPerPage": 10
  }
}
```

#### Get Single Salary Record
```
GET /api/salary-tracker/{recordId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ...salaryRecord }
}
```

#### Get Salary Summary (Date Range)
```
GET /api/salary-tracker/summary?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totalPromised": 24000,
    "totalReceived": 22000,
    "totalShortfall": 2000,
    "totalDeductions": 500,
    "recordCount": 12,
    "mismatchCount": 8,
    "averageDiscrepancyPercentage": 8.33,
    "records": [...]
  }
}
```

#### Get Records with Mismatches
```
GET /api/salary-tracker/mismatches?severity=high&limit=50
Authorization: Bearer {token}

Query Parameters:
- severity: all | high | critical (default: all)
- limit: number (default: 50)

Response 200:
{
  "success": true,
  "stats": {
    "totalRecords": 15,
    "criticalCount": 2,
    "significantCount": 5,
    "minorCount": 8,
    "totalShortfall": 3500
  },
  "data": [...records]
}
```

### Update Operations

#### Update Salary Record
```
PATCH /api/salary-tracker/{recordId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "promisedSalary": 2100,
  "receivedSalary": 1900,
  "deductions": { "housing": 150 },
  "notes": "Updated with correct amount"
}

Response 200:
{
  "success": true,
  "message": "Salary record updated successfully",
  "data": { ...updatedRecord }
}
```

### File Upload Operations

#### Upload Proof Document
```
POST /api/salary-tracker/{recordId}/upload-proof
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- file: <binary file> (max 5MB)
- documentType: payslip|bank_statement|contract|receipt|photo_evidence|other (optional)
- description: "January 2024 payslip" (optional)

Response 201:
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "salaryRecordId": "...",
    "document": { ...documentDetails }
  }
}
```

#### Get Proof Documents
```
GET /api/salary-tracker/{recordId}/proofs
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [...proofDocuments]
}
```

#### Delete Proof Document
```
DELETE /api/salary-tracker/{recordId}/proof/{documentId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Status Update Operations

#### Mark as Disputed
```
PATCH /api/salary-tracker/{recordId}/dispute
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Amount doesn't match contract terms"
}

Response 200:
{
  "success": true,
  "message": "Record marked as disputed",
  "data": { ...updatedRecord }
}
```

#### Archive Record
```
PATCH /api/salary-tracker/{recordId}/archive
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Record archived successfully",
  "data": { ...updatedRecord }
}
```

### Admin Operations

#### Get Flagged Records (Admin Only)
```
GET /api/salary-tracker/admin/flagged?limit=50
Authorization: Bearer {admin_token}

Response 200:
{
  "success": true,
  "data": [...flaggedRecords]
}
```

#### Delete Salary Record
```
DELETE /api/salary-tracker/{recordId}
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Record deleted successfully"
}
```

---

## Frontend Integration

### React Components

**Location:** `frontend/src/pages/SalaryTracker/SalaryTracker.jsx`

The component provides:
- 📊 Statistics dashboard (total records, promised vs received, mismatches)
- ➕ Form to add/edit salary records
- 📋 Filter options by discrepancy status
- 📄 File upload for proof documents
- 🚨 Visual indicators for wage mismatches
- 🗑️ Delete, edit, and dispute actions

### Service Layer

**Location:** `frontend/src/services/salaryTrackerService.js`

Provides utility functions:
```javascript
// API calls
createSalaryRecord(data)
getSalaryRecords(filters)
updateSalaryRecord(id, data)
deleteSalaryRecord(id)
uploadProofDocument(recordId, file, documentType, description)
deleteProofDocument(recordId, documentId)
getSalarySummary(startDate, endDate)
getSalaryMismatches(severity, limit)
markAsDisputed(recordId, reason)

// Utilities
formatCurrency(amount, currency)
calculateDiscrepancyPercentage(promised, received)
getDiscrepancySeverity(percentage)
getSeverityColor(severity)
calculateStatistics(records)
isValidUploadFile(file)
```

---

## Wage Mismatch Logic

### Automatic Calculation

The system calculates discrepancies automatically during record save:

```javascript
// Calculate shortfall
discrepancyAmount = promisedSalary - receivedSalary

// Calculate percentage (relative to promised)
discrepancyPercentage = (discrepancyAmount / promisedSalary) * 100

// Determine status
if (percentage < 1%) → "match"
else if (1% ≤ percentage < 10%) → "minor_mismatch"
else if (10% ≤ percentage < 30%) → "significant_mismatch"
else if (percentage ≥ 30%) → "critical_underpayment" ✓ AUTO-FLAGGED
```

### Example Scenario

```
Contract Salary: SAR 3,000
Received: SAR 2,400
Deductions: Housing SAR 100, Meals SAR 50

Shortfall: SAR 600
Percentage: (600 / 3,000) * 100 = 20%
Status: significant_mismatch ⚠️
Auto-flagged for review: Yes
```

---

## File Upload Service

**Location:** `backend/services/fileUpload.service.js`

Features:
- ✅ File validation (size, type, extension)
- ✅ Unique filename generation with timestamp
- ✅ Secure disk storage at `backend/uploads/salary-proofs/`
- ✅ MIME type verification
- ✅ Max file size: 5MB
- ✅ Supported formats: JPG, PNG, PDF, DOCX
- ✅ Automatic cleanup of old files (optional)

---

## Error Handling

### Common Errors

```javascript
// Missing required fields
400 Bad Request
{ "success": false, "message": "Missing required fields: ..." }

// Record not found
404 Not Found
{ "success": false, "message": "Salary record not found" }

// Unauthorized
401 Unauthorized
{ "success": false, "message": "Authentication required" }

// File too large
400 Bad Request
{ "success": false, "message": "File size exceeds 5MB" }

// Invalid file type
400 Bad Request
{ "success": false, "message": "File type not allowed" }
```

---

## Usage Examples

### Adding a Salary Record with Discrepancy

```javascript
const response = await createSalaryRecord({
  employmentId: "REF-2024-001",
  employerName: "Dubai Constructions",
  employerCountry: "UAE",
  position: "Welder",
  promisedSalary: 4000,
  receivedSalary: 3200,  // 20% shortfall
  currency: "AED",
  paymentDate: "2024-01-31",
  paymentPeriod: "monthly",
  deductions: {
    housing: 200,
    meals: 100
  },
  notes: "January payment incomplete"
});

// System automatically:
// - Calculates discrepancy: 800 AED (20%)
// - Sets status: "significant_mismatch"
// - Flags for review: true
// - Notifies admin dashboard
```

### Uploading Proof Document

```javascript
const file = fileInput.files[0]; // User-selected file
const response = await uploadProofDocument(
  recordId,
  file,
  'payslip',
  'January 2024 salary slip from employer'
);

// File securely stored with:
// - Unique filename
// - Original filename preserved
// - File type detected
// - MIME type validated
// - User access controlled
```

### Getting Summary for Period

```javascript
const summary = await getSalarySummary(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

// Returns:
// {
//   totalPromised: 48000,
//   totalReceived: 44000,
//   totalShortfall: 4000,
//   recordCount: 12,
//   mismatchCount: 8,
//   averageDiscrepancyPercentage: 8.33
// }
```

---

## Security Features

✅ **User Isolation** - Users can only see/edit their own records  
✅ **Secure File Storage** - Files stored outside web root  
✅ **File Validation** - MIME type and extension verification  
✅ **Size Limits** - 5MB max per file, configurable  
✅ **Unique Filenames** - Prevents file collisions and enumeration  
✅ **MongoDB Encryption** - Data at rest (if configured)  
✅ **JWT Authentication** - All endpoints protected  
✅ **Role-Based Access** - Admin-only operations  
✅ **Data Deletion** - Associated files cleaned up on record delete  

---

## Performance Considerations

- ✅ **Indexes** on userId, status, discrepancy.status, paymentDate
- ✅ **Lean queries** for large result sets
- ✅ **Pagination** support (default 10 per page)
- ✅ **File memory buffer** - Files processed in memory, not temp files
- ✅ **Async operations** - Non-blocking file uploads

---

## Future Enhancements

🎯 **Planned Features:**
- OCR for automatic payslip data extraction
- Email notifications for critical mismatches
- Bulk record import (CSV/Excel)
- Export to PDF reports
- Integration with labor dispute systems
- Multi-currency conversion with live rates
- AI-powered anomaly detection
- Worker group statistics
- Employer reputation scoring based on discrepancies

---

## Testing the Feature

### Using cURL

```bash
# Create a salary record
curl -X POST http://localhost:5000/api/salary-tracker \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "employmentId": "TEST-001",
    "employerName": "Test Company",
    "employerCountry": "Singapore",
    "promisedSalary": 2500,
    "receivedSalary": 2000,
    "currency": "SGD",
    "paymentDate": "2024-01-31"
  }'

# Get all records
curl -X GET http://localhost:5000/api/salary-tracker \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get mismatches
curl -X GET "http://localhost:5000/api/salary-tracker/mismatches?severity=critical" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload proof
curl -X POST http://localhost:5000/api/salary-tracker/{recordId}/upload-proof \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/payslip.pdf" \
  -F "documentType=payslip"
```

### Using Postman

Import the collection: `backend/docs/MigrateRight-Postman-Collection.json`

---

## Troubleshooting

### Issue: "File size exceeds maximum limit"
**Solution:** Files must be under 5MB. Compress PDFs or images before uploading.

### Issue: "File type not allowed"
**Solution:** Only JPG, PNG, PDF, and DOCX files are supported.

### Issue: "Record not found"
**Solution:** Ensure you're using the correct record ID and own the record.

### Issue: Records not showing discrepancy
**Solution:** Ensure receivedSalary < promisedSalary. Check that the calculation ran (check updatedAt timestamp).

---

## API Documentation Links

- [JWT Authentication Guide](../backend/docs/JWT_IMPLEMENTATION_SUMMARY.md)
- [Error Handling](../backend/docs/LOGGING_AND_ERROR_HANDLING.md)
- [Schema Documentation](../backend/docs/SCHEMA_DOCUMENTATION.md)

---

## Support

For issues, questions, or feature requests:
1. Check this documentation
2. Review error messages and logs
3. Contact the development team
4. File an issue on the project repository

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Maintainer:** MigrateRight Development Team
