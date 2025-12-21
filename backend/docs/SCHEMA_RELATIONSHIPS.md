# MongoDB Schema Relationships Guide

## Overview

This guide explains the relationships between models in the MigrateRight backend and the Mongoose patterns used to implement them.

---

## Table of Contents

1. [Schema Architecture](#schema-architecture)
2. [Relationship Types](#relationship-types)
3. [Agency Model Deep Dive](#agency-model-deep-dive)
4. [Review Model Deep Dive](#review-model-deep-dive)
5. [Mongoose Best Practices](#mongoose-best-practices)
6. [Common Patterns](#common-patterns)
7. [Performance Considerations](#performance-considerations)

---

## Schema Architecture

```
┌─────────────────┐
│     Agency      │ 1
│                 │◄──────┐
│ - Basic Info    │       │
│ - Compliance    │       │ Many
│ - Approval      │       │
└─────────────────┘       │
                          │
                    ┌─────────────┐
                    │   Review    │
                    │             │
                    │ - Rating    │
                    │ - Comment   │
                    │ - User Ref  │
                    └─────────────┘
```

**Relationship:** One Agency → Many Reviews (One-to-Many)

---

## Relationship Types

### 1. **Embedded Subdocuments** (Nested Objects)

**What:** Store related data directly within the parent document as nested objects or arrays.

**When to Use:**
- Data that always belongs to the parent
- Data that's queried together with parent
- Small to medium-sized nested data
- Data that doesn't need independent querying

**Examples in Agency Model:**

```javascript
// ✅ Embedded - Location is always part of agency
location: {
  address: String,
  city: String,
  district: String,
  country: String
}

// ✅ Embedded Array - Compliance history belongs to agency
complianceHistory: [
  {
    type: String,
    date: Date,
    description: String,
    severity: String,
    status: String
  }
]

// ✅ Embedded - Approval workflow is agency-specific
approvalWorkflow: {
  status: String,
  submittedAt: Date,
  reviewedBy: ObjectId,
  history: [...]
}
```

**Benefits:**
- ✅ Single query to fetch all data
- ✅ Atomic updates (all-or-nothing)
- ✅ Better performance for reads
- ✅ Simpler data model

**Drawbacks:**
- ❌ Document size limit (16MB)
- ❌ Can't query nested data independently
- ❌ Data duplication if shared

---

### 2. **Referenced Documents** (Population)

**What:** Store ObjectId references to documents in other collections, then "populate" to fetch related data.

**When to Use:**
- Data needs independent querying
- Data is shared across documents
- Large amounts of related data
- Need for data normalization

**Examples:**

```javascript
// ✅ Referenced - User can exist independently
approvalWorkflow: {
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // Reference to User collection
  }
}

// ✅ Referenced - Review exists independently
// In Review model:
agency: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Agency'  // Reference to Agency collection
}
```

**Usage:**

```javascript
// Query with populate
const agency = await Agency.findById(id)
  .populate('approvalWorkflow.submittedBy', 'name email');

// Result:
{
  approvalWorkflow: {
    submittedBy: {
      _id: '...',
      name: 'John Doe',
      email: 'john@example.com'
    }
  }
}
```

**Benefits:**
- ✅ Normalized data (no duplication)
- ✅ Can query referenced data independently
- ✅ No document size limits
- ✅ Shared data across documents

**Drawbacks:**
- ❌ Requires multiple queries (populate = extra query)
- ❌ Slower than embedded data
- ❌ More complex queries

---

### 3. **Virtual Populate** (Reverse Population)

**What:** Create a virtual field that dynamically fetches related documents without storing references.

**When to Use:**
- One-to-many relationships
- Don't want to store array of IDs in parent
- Child documents reference parent
- Need dynamic, up-to-date data

**Example in Agency Model:**

```javascript
// Virtual field (not stored in database)
agencySchema.virtual('reviews', {
  ref: 'Review',           // Model to populate from
  localField: '_id',       // Field in Agency (this document's _id)
  foreignField: 'agency',  // Field in Review that references Agency
  justOne: false,          // Return array
  options: { sort: { createdAt: -1 } }
});
```

**How It Works:**

```javascript
// Agency document doesn't store review IDs
// Review documents store agency ID:
{
  _id: 'review1',
  agency: 'agency123',  // ← References Agency
  rating: 5,
  comment: 'Great!'
}

// When you populate:
const agency = await Agency.findById('agency123').populate('reviews');

// You get:
{
  _id: 'agency123',
  name: 'Global Workforce',
  reviews: [  // ← Virtual field, not in database
    { _id: 'review1', rating: 5, comment: 'Great!' },
    { _id: 'review2', rating: 4, comment: 'Good!' }
  ]
}
```

**Benefits:**
- ✅ No data stored in parent (saves space)
- ✅ Always up-to-date
- ✅ No need to update parent when adding children
- ✅ Clean one-to-many relationships

**Drawbacks:**
- ❌ Requires populate (extra query)
- ❌ Can't query virtual fields directly

---

## Agency Model Deep Dive

### Structure

```javascript
{
  // Basic Info (Direct Fields)
  name: String,
  description: String,
  establishedYear: Number,
  
  // License (Embedded Subdocument)
  license: {
    number: String,
    issuedDate: Date,
    expiryDate: Date,
    isValid: Boolean
  },
  
  // Location (Embedded Subdocument)
  location: {
    address: String,
    city: String,
    district: String,
    country: String
  },
  
  // Rating (Enhanced with Breakdown)
  rating: {
    average: Number,
    count: Number,
    breakdown: {
      communication: Number,
      transparency: Number,
      support: Number,
      documentation: Number,
      jobQuality: Number
    },
    distribution: {
      fiveStar: Number,
      fourStar: Number,
      threeStar: Number,
      twoStar: Number,
      oneStar: Number
    }
  },
  
  // Compliance History (Embedded Array of Subdocuments)
  complianceHistory: [
    {
      type: String,
      date: Date,
      description: String,
      severity: String,
      status: String,
      inspectorName: String,
      documentUrl: String,
      fineAmount: Number
    }
  ],
  
  // Compliance Score (Calculated Field)
  complianceScore: {
    score: Number,
    lastUpdated: Date,
    recentViolations: Number,
    status: String
  },
  
  // Approval Workflow (Embedded Subdocument with References)
  approvalWorkflow: {
    status: String,
    submittedAt: Date,
    submittedBy: ObjectId,  // ← Reference to User
    reviewedAt: Date,
    reviewedBy: ObjectId,   // ← Reference to Admin
    reviewerNotes: String,
    rejectionReason: String,
    submittedDocuments: [
      { name: String, url: String, uploadedAt: Date }
    ],
    history: [
      {
        action: String,
        date: Date,
        by: ObjectId,  // ← Reference to User
        notes: String
      }
    ]
  },
  
  // Reviews (Virtual Populate - NOT stored in database)
  reviews: [...]  // Virtual field populated from Review collection
}
```

### Key Methods

```javascript
// Instance Methods (operate on single document)
agency.hasValidLicense()              // Check license validity
agency.getFullAddress()               // Get formatted address
agency.addComplianceRecord(record)    // Add compliance record
agency.calculateComplianceScore()     // Recalculate compliance score
agency.updateRating(rating, breakdown) // Update rating after review
agency.approve(adminId, notes)        // Approve agency
agency.reject(adminId, reason)        // Reject agency
agency.suspend(adminId, reason)       // Suspend agency

// Static Methods (operate on model)
Agency.findVerified()                 // Find verified agencies
Agency.findByCity(city)              // Find by city
Agency.findTopRated(limit)           // Find top-rated
Agency.findPendingApproval()         // Find pending approval
Agency.findComplianceIssues()        // Find compliance issues
Agency.findByApprovalStatus(status)  // Find by approval status
```

### Virtuals (Computed Fields)

```javascript
// NOT stored in database, calculated on the fly
agency.formattedRating           // "4.5 / 5.0"
agency.licenseStatus             // "Valid" or "Expired"
agency.reviews                   // Array of reviews (virtual populate)
agency.approvalStatusBadge       // "✅ Approved"
agency.complianceStatusBadge     // "🟢 Excellent"
agency.openViolationsCount       // Count of open violations
```

---

## Review Model Deep Dive

### Structure

```javascript
{
  // References (to other collections)
  agency: ObjectId,  // ← References Agency (REQUIRED)
  user: ObjectId,    // ← References User (REQUIRED)
  
  // Rating
  rating: Number,    // Overall rating (1-5)
  breakdown: {       // Detailed breakdown
    communication: Number,
    transparency: Number,
    support: Number,
    documentation: Number,
    jobQuality: Number
  },
  
  // Content
  title: String,
  comment: String,
  pros: String,
  cons: String,
  
  // Context
  position: String,
  employmentPeriod: {
    from: Date,
    to: Date,
    current: Boolean
  },
  destinationCountry: String,
  
  // Moderation
  status: String,    // Pending, Approved, Rejected, Flagged
  moderatedBy: ObjectId,  // ← Reference to Admin
  moderationNotes: String,
  
  // Helpfulness
  helpful: {
    count: Number,
    users: [ObjectId]  // ← Array of User references
  },
  notHelpful: {
    count: Number,
    users: [ObjectId]
  },
  
  // Flagging
  flagged: {
    isFlagged: Boolean,
    reason: String,
    flaggedBy: [
      {
        user: ObjectId,  // ← Reference to User
        reason: String,
        date: Date
      }
    ]
  },
  
  // Agency Response
  agencyResponse: {
    text: String,
    respondedBy: ObjectId,  // ← Reference to User
    respondedAt: Date
  }
}
```

### Key Methods

```javascript
// Instance Methods
review.markHelpful(userId)           // Mark review as helpful
review.markNotHelpful(userId)        // Mark review as not helpful
review.flag(userId, reason)          // Flag review
review.approve(moderatorId)          // Approve review (moderator)
review.reject(moderatorId, notes)    // Reject review (moderator)
review.addAgencyResponse(userId, text) // Add agency response

// Static Methods
Review.findByAgency(agencyId, options) // Find reviews for agency
Review.getAgencyRatingStats(agencyId)  // Calculate rating stats
Review.findPendingModeration()         // Find pending reviews
Review.findFlagged()                   // Find flagged reviews
```

### Virtuals

```javascript
review.helpfulnessRatio    // Percentage of helpful votes
review.employmentDuration  // "2 years 3 months"
review.reviewAge           // "2 days ago"
```

---

## Mongoose Best Practices

### 1. **Choosing Between Embed vs Reference**

#### Use Embedded Subdocuments When:
- ✅ Data is tightly coupled (always used together)
- ✅ Small to medium size data
- ✅ One-to-few relationships
- ✅ Data doesn't need independent querying
- ✅ Need atomic operations

**Example:** Location, Contact, License in Agency

```javascript
// ✅ Good: Embedded
{
  location: {
    address: "123 Main St",
    city: "Kathmandu"
  }
}
```

#### Use References When:
- ✅ Large amounts of data
- ✅ One-to-many or many-to-many relationships
- ✅ Data needs independent querying
- ✅ Data is shared across documents
- ✅ Need data normalization

**Example:** Reviews, Users

```javascript
// ✅ Good: Referenced
{
  agency: ObjectId('...')  // Reference to Agency
}
```

---

### 2. **Indexing Strategy**

```javascript
// Single field index
schema.index({ city: 1 });

// Compound index (multiple fields)
schema.index({ isVerified: 1, isActive: 1 });

// Text index (for search)
schema.index({ name: 'text', description: 'text' });

// Unique index (prevent duplicates)
schema.index({ agency: 1, user: 1 }, { unique: true });

// Descending index (for sorting)
schema.index({ rating: -1 });
```

**Best Practices:**
- ✅ Index fields used in queries (`find`, `findOne`)
- ✅ Index fields used in sorting (`sort`)
- ✅ Create compound indexes for common query combinations
- ✅ Limit number of indexes (each index adds overhead)
- ❌ Don't over-index (slows down writes)

---

### 3. **Virtuals vs Methods**

#### Use Virtuals For:
- Computed fields (no database storage)
- Formatting data
- Simple calculations
- Derived values

```javascript
// ✅ Virtual - computed on the fly
agencySchema.virtual('formattedRating').get(function() {
  return `${this.rating.average.toFixed(1)} / 5.0`;
});
```

#### Use Methods For:
- Complex operations
- Database queries
- Async operations
- Business logic

```javascript
// ✅ Method - performs operations
agencySchema.methods.approve = async function(adminId, notes) {
  this.approvalWorkflow.status = 'Approved';
  // ... more logic
  return this.save();
};
```

---

### 4. **Middleware Hooks**

```javascript
// Pre-save: Run before saving
schema.pre('save', function(next) {
  if (this.isModified('isVerified')) {
    this.verificationDate = new Date();
  }
  next();
});

// Post-save: Run after saving
schema.post('save', async function(doc) {
  // Update related documents
  await RelatedModel.updateMany(...);
});

// Pre-remove: Run before deleting
schema.pre('remove', async function(next) {
  // Cleanup related data
  await RelatedModel.deleteMany({ parent: this._id });
  next();
});
```

**Use Cases:**
- ✅ Auto-calculate fields before save
- ✅ Validate related data
- ✅ Update related documents
- ✅ Cascade deletes
- ✅ Logging changes

---

### 5. **Validation**

```javascript
// Built-in validators
{
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  }
}
```

---

### 6. **Query Optimization**

```javascript
// ❌ Bad: Multiple queries
const agency = await Agency.findById(id);
const reviews = await Review.find({ agency: id });
const user = await User.findById(agency.approvalWorkflow.submittedBy);

// ✅ Good: Single query with populate
const agency = await Agency.findById(id)
  .populate('reviews')
  .populate('approvalWorkflow.submittedBy', 'name email');

// ✅ Better: Select only needed fields
const agency = await Agency.findById(id)
  .select('name rating location')
  .populate({
    path: 'reviews',
    select: 'rating comment user',
    options: { limit: 5, sort: { createdAt: -1 } }
  });
```

---

## Common Patterns

### Pattern 1: One-to-Many with Virtual Populate

**Use Case:** Agency → Many Reviews

```javascript
// Parent Schema (Agency)
agencySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'agency'
});

// Child Schema (Review)
const reviewSchema = new mongoose.Schema({
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  }
});

// Usage
const agency = await Agency.findById(id).populate('reviews');
```

---

### Pattern 2: Cascading Updates

**Use Case:** Update parent when child changes

```javascript
// In Review model
reviewSchema.post('save', async function(doc) {
  if (doc.status === 'Approved') {
    const agency = await mongoose.model('Agency').findById(doc.agency);
    await agency.updateRating(doc.rating, doc.breakdown);
  }
});
```

---

### Pattern 3: Soft Deletes

**Use Case:** Mark documents as deleted without removing them

```javascript
// Add isActive field
{
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}

// Always filter by isActive
Agency.find({ isActive: true });

// "Delete" by setting isActive = false
agency.isActive = false;
await agency.save();
```

---

### Pattern 4: Approval Workflow

**Use Case:** Multi-step approval process

```javascript
// Workflow states
status: {
  type: String,
  enum: ['Pending', 'Under Review', 'Approved', 'Rejected']
}

// Track history
history: [
  {
    action: String,
    date: Date,
    by: ObjectId,
    notes: String
  }
]

// Methods for transitions
schema.methods.approve = async function(adminId, notes) {
  this.status = 'Approved';
  this.history.push({
    action: 'Approved',
    date: new Date(),
    by: adminId,
    notes
  });
  return this.save();
};
```

---

## Performance Considerations

### 1. **Populate Wisely**

```javascript
// ❌ Bad: Over-populating
const agencies = await Agency.find()
  .populate('reviews')  // Could be thousands of reviews!
  .populate('approvalWorkflow.submittedBy')
  .populate('approvalWorkflow.reviewedBy');

// ✅ Good: Selective populate
const agencies = await Agency.find()
  .select('name rating location')
  .populate({
    path: 'reviews',
    select: 'rating comment',
    options: { limit: 5 }
  });
```

---

### 2. **Limit Array Growth**

```javascript
// ❌ Bad: Unbounded array
complianceHistory: []  // Can grow indefinitely!

// ✅ Good: Limit size
complianceHistory: {
  type: [],
  validate: {
    validator: function(arr) {
      return arr.length <= 100;  // Max 100 records
    }
  }
}

// ✅ Better: Store recent + archive old
recentHistory: [],  // Last 10 records
archivedHistory: ObjectId  // Reference to archived collection
```

---

### 3. **Aggregation for Stats**

```javascript
// ❌ Bad: Fetch all and calculate in memory
const reviews = await Review.find({ agency: id });
const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

// ✅ Good: Use aggregation pipeline
const stats = await Review.aggregate([
  { $match: { agency: mongoose.Types.ObjectId(id) } },
  { $group: {
    _id: null,
    avgRating: { $avg: '$rating' },
    count: { $sum: 1 }
  }}
]);
```

---

### 4. **Caching Computed Values**

```javascript
// ❌ Bad: Calculate every time
agencySchema.virtual('avgRating').get(function() {
  // Query database every time!
  return Review.aggregate([...]);
});

// ✅ Good: Cache in document
{
  rating: {
    average: Number,  // Stored value
    count: Number,
    lastUpdated: Date
  }
}

// Update when reviews change
reviewSchema.post('save', async function() {
  await agency.updateRating(this.rating);
});
```

---

## Summary

| Feature | Embedded | Referenced | Virtual Populate |
|---------|----------|------------|------------------|
| Data Location | Inside parent | Separate collection | Separate collection |
| Query Count | 1 | 2+ (with populate) | 2+ (with populate) |
| Data Duplication | Possible | No | No |
| Document Size | Limited (16MB) | Unlimited | Unlimited |
| Atomic Updates | Yes | No | No |
| Independent Queries | Hard | Easy | Easy |
| Best For | Small, related data | Large, independent data | One-to-many relationships |

**Key Takeaways:**

1. **Embed** when data is small and always accessed together
2. **Reference** when data is large or needs independent querying
3. **Virtual Populate** for clean one-to-many relationships
4. **Index** frequently queried fields
5. **Cache** computed values instead of recalculating
6. **Limit** array growth to prevent document bloat
7. **Use middleware** for automatic updates and validations

---

## Example Queries

### Get Agency with Reviews

```javascript
const agency = await Agency.findById(id)
  .populate({
    path: 'reviews',
    match: { status: 'Approved' },
    select: 'rating comment user createdAt',
    options: { sort: { createdAt: -1 }, limit: 10 },
    populate: { path: 'user', select: 'name avatar' }
  });
```

### Get Agency Compliance Issues

```javascript
const agencies = await Agency.find({
  'complianceScore.score': { $lt: 60 },
  'complianceHistory': {
    $elemMatch: {
      status: 'Open',
      severity: { $in: ['High', 'Critical'] }
    }
  }
})
.select('name complianceScore complianceHistory')
.sort({ 'complianceScore.score': 1 });
```

### Get Review Statistics

```javascript
const stats = await Review.getAgencyRatingStats(agencyId);
// Returns:
{
  averageRating: 4.5,
  totalReviews: 150,
  avgCommunication: 4.7,
  avgTransparency: 4.3,
  fiveStars: 80,
  fourStars: 50,
  threeStars: 15,
  twoStars: 3,
  oneStars: 2
}
```

---

**Happy Coding! 🚀**
