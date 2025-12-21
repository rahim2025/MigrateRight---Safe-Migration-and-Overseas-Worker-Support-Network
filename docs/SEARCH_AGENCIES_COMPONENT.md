# Search Agencies Page - Component Documentation

## Overview

The Search Agencies page is a **UI-only placeholder** component that demonstrates the interface for searching and filtering verified recruitment agencies. This component uses dummy data and does NOT connect to the backend.

---

## Features Implemented

### ✅ Search Functionality
- Text input to search by agency name or license number
- Real-time filtering as user types
- Clear button to reset search

### ✅ Filter Options
- **Location Filter**: Dropdown to filter by destination country
- **Rating Filter**: Dropdown to filter by minimum star rating
- **Verified Only**: Checkbox to show only verified agencies

### ✅ UI Components
- **Agency Cards**: Detailed cards displaying:
  - Agency name and verification badge
  - License number
  - Description
  - Location and destination country
  - Star rating with review count
  - Specialization areas
  - Action buttons (View Details, Save Agency)

### ✅ Empty State
- Informative message when no agencies match filters
- Option to clear all filters

### ✅ Placeholder Notice
- Visual indicator that this is dummy data
- Reminder that backend integration is pending

---

## Dummy Data

The component includes 6 sample agencies with realistic data:

| Agency | License | Location | Country | Rating | Verified |
|--------|---------|----------|---------|--------|----------|
| Global Workforce Solutions | BMT-2024-001 | Dhaka | Saudi Arabia | 4.5 | ✓ |
| United Migration Services | BMT-2024-002 | Chittagong | UAE | 4.8 | ✓ |
| Eastern Manpower Agency | BMT-2024-003 | Sylhet | Qatar | 4.2 | ✓ |
| Pacific Employment Bureau | BMT-2024-004 | Dhaka | Malaysia | 4.0 | ✗ |
| Reliable Overseas Services | BMT-2024-005 | Dhaka | Oman | 4.6 | ✓ |
| Prime Recruitment International | BMT-2024-006 | Khulna | UAE | 4.3 | ✓ |

---

## Component Structure

```
SearchAgencies
├── Page Header
│   ├── Title
│   └── Subtitle
│
├── Search & Filters Container
│   ├── Search Bar
│   │   ├── Search input
│   │   └── Clear button
│   │
│   └── Filters Section
│       ├── Location dropdown
│       ├── Rating dropdown
│       ├── Verified checkbox
│       └── Clear filters button
│
├── Results Section
│   ├── Results count
│   ├── Empty state (conditional)
│   └── Agency Cards Grid
│       └── Agency Card × N
│           ├── Header (name, badge, license)
│           ├── Body (description, details, stars)
│           └── Footer (action buttons)
│
└── Placeholder Notice
```

---

## Usage

```jsx
import SearchAgencies from './pages/Agencies/SearchAgencies';

// In your route configuration
<Route path="/agencies" element={<SearchAgencies />} />
```

---

## State Management

The component uses React hooks for local state:

```jsx
const [searchTerm, setSearchTerm] = useState('');
const [selectedLocation, setSelectedLocation] = useState('');
const [selectedRating, setSelectedRating] = useState('');
const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
```

---

## Filtering Logic

Agencies are filtered based on ALL active criteria:

```javascript
const filteredAgencies = DUMMY_AGENCIES.filter((agency) => {
  const matchesSearch = // name or license contains searchTerm
  const matchesLocation = // country matches selectedLocation
  const matchesRating = // rating >= selectedRating
  const matchesVerified = // isVerified === showVerifiedOnly

  return matchesSearch && matchesLocation && matchesRating && matchesVerified;
});
```

---

## Styling

**File**: `SearchAgencies.css`

**Features**:
- Mobile-first responsive design
- Grid layout for agency cards (auto-fills based on width)
- Smooth transitions and hover effects
- Dark mode support
- Print-friendly styles
- Accessibility-compliant (ARIA labels, focus states)

**Breakpoints**:
- Desktop: `> 768px` - Multi-column grid
- Tablet: `768px` - 1-2 columns
- Mobile: `< 480px` - Single column, simplified filters

---

## Internationalization (i18n)

The component uses translation keys from `react-i18next`:

```jsx
t('agencies.title')             // Page title
t('agencies.searchPlaceholder') // Search input placeholder
t('agencies.filterByCountry')   // Location label
t('agencies.rating')            // Rating label
t('agencies.verified')          // Verified checkbox
t('agencies.allCountries')      // Dropdown default
```

**Fallback**: English text is provided as fallback if translations are missing.

---

## Accessibility Features

✅ Semantic HTML structure  
✅ ARIA labels for all interactive elements  
✅ Keyboard navigation support  
✅ Focus indicators  
✅ Screen reader friendly  
✅ High contrast mode support  
✅ Touch-friendly (44px minimum touch targets)  

---

## Future Backend Integration

To connect this component to the backend:

1. **Remove dummy data** (`DUMMY_AGENCIES` constant)
2. **Add API service** import:
   ```jsx
   import agencyService from '@services/agencyService';
   ```
3. **Add useEffect** to fetch data:
   ```jsx
   useEffect(() => {
     fetchAgencies();
   }, [searchTerm, selectedLocation, selectedRating, showVerifiedOnly]);
   ```
4. **Add loading state**:
   ```jsx
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   ```
5. **Implement fetchAgencies**:
   ```jsx
   const fetchAgencies = async () => {
     setLoading(true);
     try {
       const response = await agencyService.getAgencies({
         search: searchTerm,
         country: selectedLocation,
         minRating: selectedRating,
         isVerified: showVerifiedOnly,
       });
       setAgencies(response.data);
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   };
   ```
6. **Add pagination** (if needed)
7. **Add link to agency details**:
   ```jsx
   <Link to={`/agencies/${agency._id}`}>View Details</Link>
   ```

---

## Testing

### Manual Testing Checklist

- [ ] Search input filters agencies by name
- [ ] Search input filters agencies by license
- [ ] Location filter works correctly
- [ ] Rating filter works correctly
- [ ] Verified checkbox filters properly
- [ ] Multiple filters work together
- [ ] Clear filters button resets all filters
- [ ] Empty state shows when no results
- [ ] Agency cards display all information
- [ ] Responsive on mobile devices
- [ ] Keyboard navigation works
- [ ] Dark mode displays correctly

---

## Known Limitations

⚠️ **This is a UI placeholder** - No backend integration  
⚠️ Dummy data only - Not connected to database  
⚠️ Buttons are non-functional (View Details, Save Agency)  
⚠️ No pagination implemented  
⚠️ No sorting options  
⚠️ No advanced filters (price range, job types, etc.)  

---

## Files

- **Component**: `frontend/src/pages/Agencies/SearchAgencies.jsx` (305 lines)
- **Styles**: `frontend/src/pages/Agencies/SearchAgencies.css` (634 lines)
- **Documentation**: `docs/SEARCH_AGENCIES_COMPONENT.md` (this file)

---

## Performance

- **Bundle Size**: ~15KB (JSX + CSS combined)
- **Dependencies**: React, react-i18next
- **Render Performance**: Optimized with `filter()` and `map()`

---

## Related Components

- `AgencyDetails.jsx` - Individual agency page
- `LanguageSwitcher` - Language selection
- `BottomNav` / `MobileNav` - Navigation components

---

## Screenshots

```
┌─────────────────────────────────────────────┐
│ Search Verified Recruitment Agencies        │
│ Find trusted agencies with transparent fees │
├─────────────────────────────────────────────┤
│ 🔍 Search by agency name or license...     │
├─────────────────────────────────────────────┤
│ 📍 Destination │ ⭐ Rating │ ✓ Verified Only│
├─────────────────────────────────────────────┤
│ Showing 6 agencies                          │
├─────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐         │
│ │ Global Work  │  │ United Migr  │         │
│ │ ✓ Verified   │  │ ✓ Verified   │         │
│ │ BMT-2024-001 │  │ BMT-2024-002 │         │
│ │ ⭐ 4.5 (127) │  │ ⭐ 4.8 (203) │         │
│ │ [View]  [⭐] │  │ [View]  [⭐] │         │
│ └──────────────┘  └──────────────┘         │
│ ...more cards...                            │
└─────────────────────────────────────────────┘
```

---

**Status**: ✅ UI Complete | ⏳ Backend Integration Pending
