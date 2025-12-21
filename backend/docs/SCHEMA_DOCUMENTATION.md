# MigrateRight - MongoDB Schema Documentation

## Overview
This document provides detailed information about the MongoDB schemas for the MigrateRight platform, designed to support safe migration and overseas worker support services.

---

## 1. User Profile Schema

### Purpose
Manages all user types in the platform including aspiring migrants, workers abroad, family members, recruitment agency admins, and platform administrators.

### Key Field Groups

#### Authentication & Security
- **email**: Unique, validated email address (lowercase, trimmed)
- **password**: Bcrypt-hashed password (min 8 chars, excluded from queries by default)
- **phoneNumber**: Unique contact number for SMS verification
- **passwordChangedAt**: Tracks password update timestamps for JWT validation
- **loginAttempts & lockUntil**: Implements account lockout after 5 failed login attempts (2-hour lock)

#### Role-based Access Control
- **role**: Enum defining user type:
  - `aspiring_migrant`: Planning to migrate
  - `worker_abroad`: Currently working overseas
  - `family_member`: Family of migrant workers
  - `recruitment_admin`: Agency staff
  - `platform_admin`: System administrator
- **accountStatus**: Account state (active, suspended, pending, deactivated)

#### Personal Information
- **fullName**: Structured object with firstName, middleName, lastName
- **dateOfBirth**: Required for age verification
- **gender**: Enum for demographic data
- **nationalIdNumber & passportNumber**: Sparse unique indexes (allows multiple null values)
- **passportExpiryDate**: Tracks document validity

#### Location Management
**Bangladesh Address**:
- **division**: 8 administrative divisions of Bangladesh
- **district**: Required for aspiring migrants and family members
- **upazila, village, detailedAddress**: Granular location data
- **postalCode**: For communication

**Current Location (for workers abroad)**:
- **country, city, address**: Current residence
- **coordinates**: GeoJSON Point type for geospatial queries
  - Format: `[longitude, latitude]`
  - Indexed with 2dsphere for proximity searches

**Destination Country**: Target country for aspiring migrants

#### Employment & Migration
- **employmentInfo**:
  - **skillSet**: Array of skills
  - **desiredJobSector**: Multiple job categories (construction, hospitality, healthcare, etc.)
  - **educationLevel**: Enum from no formal education to masters degree
- **migrationStatus**: Tracks journey stage (planning, in_process, abroad, returned)

#### Verification & Trust
- **verification.isEmailVerified**: Email confirmation status
- **verification.isPhoneVerified**: SMS verification status
- **verification.isIdentityVerified**: Government ID/passport verification
- **verification.verificationDocuments**: Array of uploaded documents with status tracking
  - Document types: national_id, passport, work_permit, visa
  - Status: pending, approved, rejected

#### Agency Association
- **associatedAgency**: Reference to recruitment agency (for agency staff or clients)

### Indexes

#### Compound Indexes
```javascript
{ role: 1, accountStatus: 1 }  // Filter by user type and status
{ 'location.bangladeshAddress.district': 1, role: 1 }  // Regional user search
{ email: 1, phoneNumber: 1 }  // Login queries
```

#### Geospatial Index
```javascript
{ 'location.currentLocation.coordinates': '2dsphere' }  // Find nearby workers abroad
```

#### Text Search Index
```javascript
{ 
  'fullName.firstName': 'text',
  'fullName.lastName': 'text',
  email: 'text'
}  // Full-text search across user profiles
```

### Virtual Properties
- **fullNameString**: Concatenated full name
- **age**: Calculated from dateOfBirth
- **isAccountLocked**: Boolean based on lockUntil timestamp

### Security Methods
- **comparePassword()**: Bcrypt comparison for authentication
- **changedPasswordAfter()**: Validates JWT tokens against password changes
- **incLoginAttempts()**: Implements progressive account locking
- **resetLoginAttempts()**: Clears failed attempts on successful login

---

## 2. Recruitment Agency Schema

### Purpose
Manages recruitment agencies providing migration services, including registration, compliance tracking, fee transparency, and ratings.

### Key Field Groups

#### Basic Information
- **agencyName**: Unique agency identifier (English)
- **agencyNameBengali**: Localized name for Bengali users
- **description**: Detailed agency overview (max 2000 chars)
- **logo & website**: Branding and online presence

#### Registration & Licensing
- **registration.licenseNumber**: Unique BMET license identifier
- **registration.issuingAuthority**: Default "Bureau of Manpower, Employment and Training (BMET)"
- **registration.issueDate & expiryDate**: License validity period
- **registration.licenseDocument**: URL to uploaded license
- **registration.registrationType**: Enum (government_registered, private_registered, international_partner)

#### Compliance & Verification
- **compliance.status**: Enum tracking regulatory compliance
  - fully_compliant, partially_compliant, non_compliant, under_review
- **compliance.complianceScore**: 0-100 rating based on audits
- **compliance.violations**: Array of reported infractions with severity and status
  - Types: illegal_fee, document_fraud, worker_abuse, contract_violation
  - Severity: low, medium, high, critical
- **compliance.certifications**: Additional industry certifications

#### Contact Information
- **contactInfo.phoneNumbers**: Array with type classification (office, mobile, hotline, fax)
  - Ensures at least one primary contact
- **contactInfo.emergencyContact**: Dedicated emergency support details

#### Location & Geospatial Features
**Head Office**:
- **addresses.headOffice.coordinates**: GeoJSON Point (required)
  - Format: `[longitude, latitude]`
  - Enables "find agencies near me" functionality
- **addresses.headOffice.division & district**: Administrative location

**Branches**:
- **addresses.branches**: Array of branch locations with individual coordinates
- Each branch has isActive flag for operational status

#### Fee Structure & Transparency
- **feeStructure.baseFees**: Array of fee breakdowns by country and job category
  - **processingFee, medicalTestFee, trainingFee, visaFee, ticketCost**
  - **otherCharges**: Flexible array for additional costs
  - **totalEstimatedCost**: Calculated total
  - **paymentTerms & refundPolicy**: Textual descriptions
- **feeStructure.feeTransparencyScore**: 0-10 rating for clarity
  - Higher scores indicate comprehensive fee disclosure
- **feeStructure.lastUpdated**: Timestamp for tracking updates

#### Services Offered
- **services.countriesServed**: Array of destination countries
- **services.jobSectorsSpecialized**: Industry focus areas
- **services.additionalServices**: Value-added offerings (training, support)
- **services.languageTraining, skillTraining, postArrivalSupport**: Boolean flags

#### Ratings & Reviews
- **ratings.averageRating**: 0-5 star average
- **ratings.totalReviews**: Review count for credibility assessment
- **ratings.ratingBreakdown**: Distribution across 1-5 stars
- **ratings.aspectRatings**: Granular ratings for:
  - transparency, customerService, processEfficiency, postPlacementSupport, valueForMoney

#### Statistics
- **statistics.totalWorkersPlacements**: Historical placement count
- **statistics.activeWorkers**: Currently employed workers
- **statistics.successRate**: Percentage of successful placements
- **statistics.yearEstablished**: Agency age indicator
- **statistics.placementsByCountry**: Geographic distribution

#### Admin Approval Workflow
- **adminApproval.status**: Enum (pending, approved, rejected, suspended)
- **adminApproval.approvedBy**: Reference to platform admin
- **adminApproval.rejectionReason**: Documentation for denied applications
- **accountStatus**: Current operational status

#### Agency Administrators
- **administrators**: Array of staff with role-based permissions
  - Roles: owner, admin, manager, staff
  - Permissions: manage_listings, view_analytics, manage_fees, respond_reviews, manage_staff

#### Verification Documents
- **documents**: Array of uploaded files for verification
  - Types: trade_license, bmet_license, tax_certificate, bank_guarantee, insurance
  - Status: pending, verified, rejected, expired
  - Links to platform admin verifiers

### Indexes

#### Geospatial Indexes
```javascript
{ 'addresses.headOffice.coordinates': '2dsphere' }  // Find nearby agencies (head office)
{ 'addresses.branches.coordinates': '2dsphere' }  // Find nearby branches
```

**Use Case**: Users can search "recruitment agencies within 10km of my location"

#### Compound Indexes
```javascript
{ accountStatus: 1, 'adminApproval.status': 1 }  // Filter active approved agencies
{ 'addresses.headOffice.division': 1, 'addresses.headOffice.district': 1 }  // Regional filtering
{ 'services.countriesServed': 1 }  // Filter by destination country
{ 'ratings.averageRating': -1, 'ratings.totalReviews': -1 }  // Sort by best rated
{ isFeatured: 1, 'ratings.averageRating': -1 }  // Promote featured agencies
```

#### Text Search Index (Weighted)
```javascript
{
  agencyName: 'text' (weight: 10),
  agencyNameBengali: 'text' (weight: 8),
  'services.countriesServed': 'text' (weight: 5),
  description: 'text' (weight: 2)
}
```

**Use Case**: Full-text search prioritizing agency name matches

#### Expiry Monitoring
```javascript
{ 'registration.expiryDate': 1 }  // Identify expiring licenses
```

### Virtual Properties
- **isLicenseValid**: Boolean based on current date vs expiry
- **daysUntilLicenseExpiry**: Calculates remaining validity period
- **isFullyVerified**: Composite check (platform verified + approved + compliant + valid license)
- **trustScore**: 0-100 weighted calculation:
  - Rating (30%), Compliance (25%), Verification (20%), Transparency (15%), Review count (10%)

### Static Methods
- **findNearby(lng, lat, maxDistance)**: Geospatial proximity search
- **findByCountry(country)**: Agencies serving specific destination
- **findTopRated(limit)**: Highest-rated agencies with minimum review threshold

### Instance Methods
- **updateRatings(newRating, oldRating)**: Recalculates average and breakdown when reviews are added/edited

### Pre-save Middleware
- Updates `feeStructure.lastUpdated` when fees are modified
- Validates license expiry date > issue date
- Ensures at least one primary phone number exists

---

## Index Strategy Summary

### Performance Optimization
1. **Compound Indexes**: Support common query patterns (role + status, location + role)
2. **Geospatial Indexes (2dsphere)**: Enable location-based searches for workers and agencies
3. **Text Indexes**: Full-text search with field weighting for relevance
4. **Single-field Indexes**: Fast lookups on frequently queried fields (email, license number)

### Geospatial Index Benefits
- Find workers abroad within radius of a location
- Locate recruitment agencies near users
- Support map-based visualizations
- Enable "near me" features in mobile apps

### Sparse Indexes
- Used for nationalIdNumber and passportNumber to allow multiple null values while enforcing uniqueness for non-null values

---

## Security Considerations

### Password Management
- Bcrypt hashing with salt rounds of 12
- Password excluded from queries by default (select: false)
- Password change tracking for JWT invalidation

### Account Protection
- Progressive account locking: 2-hour lockout after 5 failed attempts
- Automatic attempt reset on successful login
- Last login tracking for security monitoring

### Document Verification
- Multi-stage verification workflow (pending → verified/rejected)
- Audit trail with verifier references
- Expiry date tracking for time-sensitive documents

---

## Data Integrity

### Validation
- Email format validation with regex
- URL validation for websites
- Enum constraints for categorical data
- Required field enforcement
- Date range validation (expiry > issue)

### Referential Integrity
- User references in agency administrators array
- Agency references in user profiles
- Admin references for verification actions

### Cascading Updates
- Automatic timestamp updates (createdAt, updatedAt)
- Fee structure last updated tracking
- Rating recalculation on review changes

---

## Scalability Considerations

### Indexing for Growth
- Compound indexes designed for common multi-field queries
- Geospatial indexes for location-based features
- Text indexes with weighted fields for search relevance

### Data Modeling
- Embedded documents for one-to-few relationships (addresses, violations)
- References for one-to-many and many-to-many relationships (users, agencies)
- Denormalized rating statistics for fast reads

### Query Optimization
- Virtual properties for computed fields (avoid real-time calculation)
- Static methods for common complex queries
- Selective field projection in queries (password excluded by default)

---

## Future Enhancements

### Potential Schema Additions
1. **Review Schema**: Separate collection for detailed reviews (referenced in agency ratings)
2. **Job Listing Schema**: Positions available through agencies
3. **Contract Schema**: Worker-agency agreements
4. **Support Ticket Schema**: Help desk system
5. **Payment Schema**: Transaction tracking for fee payments
6. **Training Program Schema**: Skill development courses
7. **Advisory Content Schema**: Migration guidance articles
8. **Notification Schema**: User alerts and messages

### Index Recommendations for Scale
- Partial indexes for frequently filtered subsets (active users, approved agencies)
- TTL indexes for temporary data (verification tokens, password reset tokens)
- Sharding key consideration: User by region, Agency by country served

---

## Usage Examples

### Finding Nearby Agencies
```javascript
const agencies = await RecruitmentAgency.findNearby(
  90.4125,  // Dhaka longitude
  23.8103,  // Dhaka latitude
  50000     // 50km radius
);
```

### Filtering Users by Migration Status
```javascript
const aspiringMigrants = await User.find({
  role: 'aspiring_migrant',
  migrationStatus: 'planning',
  'location.bangladeshAddress.district': 'Dhaka'
})
.populate('associatedAgency', 'agencyName ratings');
```

### Finding Top-rated Agencies for Specific Country
```javascript
const saudiAgencies = await RecruitmentAgency.findByCountry('Saudi Arabia')
  .where('ratings.averageRating').gte(4.0)
  .limit(10);
```

### Checking Agency Trust Score
```javascript
const agency = await RecruitmentAgency.findById(agencyId);
console.log(`Trust Score: ${agency.trustScore}/100`);
console.log(`License Valid: ${agency.isLicenseValid}`);
console.log(`Days Until Expiry: ${agency.daysUntilLicenseExpiry}`);
```

---

## Dependencies Required

```json
{
  "dependencies": {
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3"
  }
}
```

---

## Environment Considerations

### MongoDB Atlas Recommendations
- Enable geospatial queries in cluster configuration
- Create search indexes for text search
- Set up automatic backups for user and agency data
- Configure alerts for license expiry dates
- Monitor index performance with database profiler

### Connection String Example
```
mongodb+srv://username:password@cluster.mongodb.net/migrateright?retryWrites=true&w=majority
```

---

This schema design provides a robust foundation for the MigrateRight platform, balancing normalization with query performance, and incorporating comprehensive validation and security measures appropriate for sensitive migration data.
