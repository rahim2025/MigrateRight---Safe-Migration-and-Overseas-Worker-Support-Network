# Salary Tracker Feature - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup

The MongoDB schema is automatically created on first use. Ensure MongoDB is running:

```bash
# Verify MongoDB connection
curl http://localhost:5000/api/health
```

### Step 2: Test via Frontend

1. Open the application in your browser
2. Log in as an overseas worker
3. Navigate to **Salary Tracker** page
4. Click **"Add Salary Record"**

### Step 3: Create Your First Record

Fill in the form:
```
Employment ID:     EMP-2024-001
Employer Name:     ABC Construction Ltd
Country:          Saudi Arabia
Position:         Welder
Promised Salary:  3000
Received Salary:  2400
Currency:         SAR
Payment Date:     01/31/2024
```

**Result:** System automatically calculates:
- Shortfall: 600 SAR
- Mismatch: 20% (significant_mismatch)
- Status: ⚠️ Flagged for review

### Step 4: Upload Proof Document

1. Click **"Upload Proof"** button
2. Select a payslip PDF or bank statement image
3. Choose document type: "Payslip"
4. Add description: "January 2024 salary"
5. Upload completes in seconds

### Step 5: Check Dashboard Statistics

View summary showing:
- 📊 Total records created
- 💰 Total promised salary
- 💸 Total received salary
- ⚠️ Total shortfall amount
- 🚨 Records with wage mismatches

---

## 📱 API Quick Reference

### Authentication
All requests need: `Authorization: Bearer {your_jwt_token}`

### Create Record
```bash
curl -X POST http://localhost:5000/api/salary-tracker \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employmentId": "EMP-001",
    "employerName": "Company Name",
    "employerCountry": "UAE",
    "promisedSalary": 2500,
    "receivedSalary": 2000,
    "currency": "AED",
    "paymentDate": "2024-01-31"
  }'
```

### Get All Records
```bash
curl http://localhost:5000/api/salary-tracker \
  -H "Authorization: Bearer TOKEN"
```

### Get Mismatches
```bash
curl "http://localhost:5000/api/salary-tracker/mismatches?severity=critical" \
  -H "Authorization: Bearer TOKEN"
```

### Get Summary
```bash
curl "http://localhost:5000/api/salary-tracker/summary?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer TOKEN"
```

### Upload Proof
```bash
curl -X POST http://localhost:5000/api/salary-tracker/{recordId}/upload-proof \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@payslip.pdf" \
  -F "documentType=payslip"
```

### Mark as Disputed
```bash
curl -X PATCH http://localhost:5000/api/salary-tracker/{recordId}/dispute \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Amount doesnt match contract"}'
```

---

## 🎯 Key Concepts

### Wage Mismatch Levels

```
Match          < 1%    ✓ No issue
Minor          1-10%   ⚠️  Small difference
Significant    10-30%  ⚠️  Needs attention
Critical       ≥ 30%   🚨 Auto-flagged for admin
```

### Status Types

- **pending_review** - New record, awaiting verification
- **verified** - Admin has reviewed and approved
- **disputed** - Worker marked as disputed
- **resolved** - Issue has been resolved
- **escalated** - Critical case flagged for admin

### Supported Currencies

USD, SAR, AED, MYR, QAR, KWD, OMR, BDT, PHP, THB, SGD

---

## 📊 Example Scenarios

### Scenario 1: Full Payment Match ✅
```
Promised: 2000 USD
Received: 2000 USD
Difference: 0%
Status: ✓ Match
```

### Scenario 2: Minor Underpayment
```
Promised: 3000 SAR
Received: 2850 SAR
Difference: 5%
Status: ⚠️ Minor Mismatch
Action: Review deductions
```

### Scenario 3: Significant Underpayment
```
Promised: 2500 AED
Received: 1900 AED
Difference: 24%
Status: ⚠️ Significant Mismatch
Action: Contact employer, upload proof
```

### Scenario 4: Critical Underpayment 🚨
```
Promised: 4000 KWD
Received: 2400 KWD
Difference: 40%
Status: 🚨 Critical Underpayment
Action: AUTO-FLAGGED for admin review
```

---

## 💾 What Data is Stored

For each salary record:
- ✅ Employment ID and dates
- ✅ Employer name and country
- ✅ Promised vs received amounts
- ✅ Currency and payment period
- ✅ Calculated discrepancy
- ✅ Deductions (if any)
- ✅ Proof documents (encrypted on disk)
- ✅ Status and notes
- ✅ Creation/update timestamps

**All data is user-isolated and secure.**

---

## 🔒 Security Features

- ✅ Only you can see your records
- ✅ JWT authentication on all APIs
- ✅ Files stored securely on server
- ✅ File type validation
- ✅ 5MB maximum file size
- ✅ Automatic cleanup of old files
- ✅ Admin-only critical case access

---

## ⚙️ Troubleshooting

### Problem: File upload fails
**Solution:** Check file size (max 5MB) and format (JPG, PNG, PDF, DOCX)

### Problem: Discrepancy not calculated
**Solution:** Ensure receivedSalary < promisedSalary. System auto-calculates on save.

### Problem: Can't see other worker's records
**Solution:** By design! Each user only sees their own records.

### Problem: Record shows as "pending_review"
**Solution:** Admin review is automatic for critical cases. Non-critical may not need review.

---

## 📞 Need Help?

1. Check the [Complete API Guide](./SALARY_TRACKER_GUIDE.md)
2. Review error messages for specific details
3. Contact support with record ID if needed

---

## ✨ Tips & Tricks

**💡 Tip 1:** Upload proof documents for each payment to build a strong case

**💡 Tip 2:** Use the date range summary to see patterns over time

**💡 Tip 3:** Mark records as disputed if you have questions about accuracy

**💡 Tip 4:** Regular backups recommended if tracking important salary records

**💡 Tip 5:** Export summary for your personal records

---

## 🎓 Next Steps

1. ✅ Create your first salary record
2. ✅ Upload proof document
3. ✅ Check if wage mismatch is detected
4. ✅ View your summary statistics
5. ✅ Mark disputed records if needed
6. ✅ Share feedback for improvements

---

**Happy Tracking! 📊**

Your salary records are now secure and tracked. MigrateRight helps protect your rights as an overseas worker.

---

*Version: 1.0*  
*Last Updated: January 2024*
