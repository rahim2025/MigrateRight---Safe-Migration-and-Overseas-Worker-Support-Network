# Emergency SOS System - Quick Start Guide

## 🚨 For Workers: How to Use Emergency SOS

### Accessing Emergency SOS
1. **Login** to your account
2. Look for the **red "🚨 SOS" button** in the navigation bar
3. Click to access the Emergency SOS page

### Triggering an Emergency
1. **Allow location access** when prompted (required)
2. **Select emergency type**:
   - Medical Emergency
   - Accident
   - Abuse/Violence
   - Detention
   - Lost Documents
   - Threat/Danger
   - Harassment
   - Unpaid Wages
   - Unsafe Conditions
   - Other

3. **Choose severity level**:
   - 🔴 Critical - Life-threatening
   - 🟠 High - Urgent assistance needed
   - 🔵 Medium - Important but not urgent
   - 🟢 Low - Minor issue

4. **Describe the emergency** (what's happening, what help you need)

5. Click **"TRIGGER SOS"** button

### After Triggering SOS
- Your location is automatically shared
- System finds nearest emergency contacts (embassies, NGOs)
- Emergency timeline is created
- You can update your location if you move
- You can check status (Active → In Progress → Resolved)
- View your SOS history

---

## 🚨 For Admins: Monitoring Emergency Alerts

### Accessing Emergency Dashboard
1. **Login** as platform admin
2. Look for **orange "🚨 Emergency Alerts" button** in navbar
3. Click to access admin emergency dashboard

### Dashboard Overview

#### Statistics Cards (Top Section)
- **Critical** - Number of critical emergencies
- **High Priority** - Number of high priority alerts
- **Active Alerts** - Total active emergencies
- **In Progress** - Emergencies being handled

#### Filter Controls
- **All Emergencies** - View everything
- **🔴 Critical** - Life-threatening only
- **🟠 High** - Urgent only
- **🔵 Medium** - Important only
- **🟢 Low** - Minor only

### Emergency Card Information
Each card shows:
- **Severity badge** (color-coded)
- **Status badge** (Active/In Progress/Resolved)
- **Time elapsed** (e.g., "2 hours ago")
- **Worker name and phone** (clickable to call)
- **Emergency type and description**
- **Location** (city, country, map link)
- **Nearest help contacts** (with distances and phone numbers)

### Managing Emergencies

#### Update Status
1. Click **"Mark In Progress"** when you start handling
2. Click **"Mark Resolved"** when emergency is resolved
3. Status updates are instant

#### Add Support Notes
1. Click on any emergency card
2. Detail modal opens
3. Scroll to **"Add Support Note"** section
4. Enter notes (actions taken, contacts made, etc.)
5. Click **"Add Note"**

#### View Details
Click any emergency card to see:
- Complete worker information
- Full emergency details
- Timeline of events
- All support notes
- Contact information

### Real-time Features
- **Auto-refresh**: Every 30 seconds
- **Manual refresh**: Click "🔄 Refresh" button
- **Live statistics**: Updates automatically
- **Instant updates**: Status changes reflect immediately

---

## 🎨 Visual Indicators

### Emergency Button Colors
- **Worker SOS Button**: Red with pulse animation
- **Admin Alerts Button**: Orange gradient

### Severity Colors
- 🔴 **Critical**: Red background
- 🟠 **High**: Orange background
- 🔵 **Medium**: Blue background
- 🟢 **Low**: Green background

### Status Colors
- 🔴 **Active**: Red - Needs immediate attention
- 🟠 **In Progress**: Orange - Being handled
- 🟢 **Resolved**: Green - Completed
- ⚫ **Cancelled**: Gray - Cancelled

---

## 📱 Mobile Access

### Mobile Navigation
- Emergency buttons appear in mobile menu
- Full functionality on mobile devices
- Touch-friendly interface
- Optimized for small screens

---

## ⚡ Quick Actions

### For Workers
- **Emergency Contact**: Click phone numbers to call
- **View Map**: Click map links to see location
- **Update Location**: If you move during emergency
- **Cancel Alert**: If false alarm

### For Admins
- **Call Worker**: Click phone numbers
- **View Location**: Click map links
- **Quick Status Update**: One-click status change
- **Add Notes**: Document all actions taken

---

## 🔒 Security & Privacy

### Access Control
- **Workers**: Can only see their own emergencies
- **Admins**: Can see all emergencies (platform_admin role only)
- **Authentication**: Required for all features
- **Location**: Only shared when SOS triggered

### Data Protection
- Secure JWT authentication
- Encrypted location data
- Private emergency details
- Role-based access control

---

## 🆘 Emergency Types Explained

### Medical Emergency
- Illness, injury, hospitalization needed
- **Action**: Call nearest hospital/clinic

### Accident
- Workplace injury, road accident, etc.
- **Action**: First aid, medical attention

### Abuse/Violence
- Physical, verbal, sexual abuse
- **Action**: Safe relocation, legal support

### Detention
- Arrested, detained by authorities
- **Action**: Embassy contact, legal aid

### Lost Documents
- Passport, visa, ID lost/stolen
- **Action**: Embassy assistance, reporting

### Threat/Danger
- Feeling threatened, unsafe situation
- **Action**: Safe relocation, protection

### Harassment
- Workplace harassment, intimidation
- **Action**: Legal support, mediation

### Unpaid Wages
- Salary not paid, contract violation
- **Action**: Labor department, legal aid

### Unsafe Conditions
- Dangerous work environment
- **Action**: Inspection, relocation if needed

---

## 📞 What Happens When SOS is Triggered?

### Automatic Actions
1. ✅ Emergency event created in system
2. 📍 Worker location recorded
3. 🔍 Nearest emergency contacts found (within 100km)
4. 👨‍👩‍👧 Family members prepared for notification
5. ⏱️ Timeline started
6. 🚨 Admin dashboard updated immediately

### Admin Notifications
- Emergency appears in admin dashboard
- Severity and status clearly marked
- All worker details available
- Nearest help contacts listed
- Map link provided

### Worker Support
- List of nearest emergency contacts shown
- Contact phone numbers provided
- Can update location if moving
- Can add more details
- Can see status updates

---

## 💡 Best Practices

### For Workers
✅ **DO**:
- Enable location services before emergency
- Provide clear description
- Choose correct severity level
- Keep phone accessible
- Update location if you move

❌ **DON'T**:
- Use for non-emergencies
- Provide false information
- Ignore admin contact attempts
- Cancel genuine emergencies

### For Admins
✅ **DO**:
- Check dashboard regularly
- Respond to critical alerts first
- Update status promptly
- Add detailed notes
- Follow up on resolved cases

❌ **DON'T**:
- Ignore active emergencies
- Forget to update status
- Skip documentation
- Close cases prematurely

---

## 🎯 Testing the System

### Test as Worker
1. Login as regular user
2. Click SOS button in navbar
3. Allow location access
4. Fill emergency form
5. Trigger SOS (use test severity "low")
6. Verify emergency created
7. Check SOS history

### Test as Admin
1. Login as platform_admin
2. Click Emergency Alerts in navbar
3. Verify test emergency appears
4. Try filtering by severity
5. Click emergency card
6. Update status
7. Add support note
8. Verify updates saved

---

## 📊 Understanding the Dashboard

### Statistics at a Glance
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│  Critical   │ High Priority│ Active Alerts│  In Progress │
│      5      │      12      │      8       │      9       │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

### Emergency Card Layout
```
┌────────────────────────────────────────────────┐
│ 🔴 CRITICAL    🟠 ACTIVE          2 hours ago  │
├────────────────────────────────────────────────┤
│ John Doe                                       │
│ 📞 +971-50-123-4567                           │
├────────────────────────────────────────────────┤
│ Type: Medical Emergency                        │
│ Description: Severe injury, need hospital      │
│ Location: Dubai, UAE                           │
│ 📍 View on Map                                │
├────────────────────────────────────────────────┤
│ Nearby Help:                                   │
│ • Philippine Embassy - 2.5km - 📞 +971-...   │
│ • Al Zahra Hospital - 1.2km - 📞 +971-...    │
├────────────────────────────────────────────────┤
│ [Mark In Progress]  [Mark Resolved]            │
└────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Location Not Working
- Enable location services in browser
- Allow location permissions
- Check if GPS is enabled
- Try refreshing the page

### Can't See Emergency Alerts (Admin)
- Verify you're logged in as platform_admin
- Check navbar for Emergency Alerts button
- If missing, contact system administrator

### Emergency Not Appearing
- Check internet connection
- Refresh the page
- Verify emergency was triggered successfully
- Check SOS history

### Status Not Updating
- Refresh dashboard manually
- Check internet connection
- Wait for auto-refresh (30 seconds)
- Try updating again

---

**For Support**: Contact system administrator or refer to [EMERGENCY_SOS_IMPLEMENTATION.md](./EMERGENCY_SOS_IMPLEMENTATION.md)
