# MigrateRight Frontend

React.js frontend application for the MigrateRight platform - a safe migration and overseas worker support network for Bangladeshi workers.

## 🚀 Technology Stack

- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **CSS Modules** - Scoped component styling
- **Context API** - State management

## 📁 Project Structure

```
frontend/
├── public/                # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Generic components (buttons, modals, etc.)
│   │   │   └── LanguageSwitcher/
│   │   └── layout/       # Layout components
│   │       ├── Layout.jsx
│   │       ├── Navbar/
│   │       └── Footer/
│   │
│   ├── pages/           # Page-level components
│   │   ├── Home/
│   │   ├── Auth/        # Login, Register
│   │   ├── Agencies/    # SearchAgencies, AgencyDetails
│   │   ├── Profile/     # UserProfile
│   │   └── NotFound/
│   │
│   ├── services/        # API integration layer
│   │   ├── api.js          # Axios instance with interceptors
│   │   ├── authService.js  # Authentication APIs
│   │   ├── agencyService.js # Agency APIs
│   │   └── userService.js  # User profile APIs
│   │
│   ├── context/         # React Context for global state
│   │   ├── AuthContext.jsx     # User authentication state
│   │   └── LanguageContext.jsx # Multi-language support
│   │
│   ├── routes/          # Routing configuration
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── constants/       # Constants and enums
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
│
├── package.json
├── vite.config.js
└── README.md
```

## 🏗️ Architecture Principles

### 1. **Component-Based Architecture**
- **Atomic Design**: Components organized by complexity (common → layout → pages)
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Common components shared across pages
- **Composition**: Complex UIs built from smaller components

### 2. **Service Layer Pattern**
- **API Abstraction**: All HTTP requests centralized in service files
- **Separation of Concerns**: Business logic separated from UI
- **Easy Testing**: Services can be mocked for unit tests
- **Consistent Error Handling**: Centralized error management

Example:
```javascript
// authService.js
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};
```

### 3. **Context API for State Management**
Instead of Redux, we use React Context for:
- **Authentication State**: User login status, token management
- **Language Preference**: Bengali/English switching
- **Simplicity**: No boilerplate, easier for small-medium projects

### 4. **Routing Strategy**
- **Nested Routes**: Layout wrapper for consistent header/footer
- **Protected Routes**: HOC pattern for authentication guards
- **Lazy Loading**: Code splitting for better performance (future)

### 5. **Path Aliases**
Clean imports using Vite path resolution:
```javascript
import Navbar from '@components/layout/Navbar/Navbar';
import { useAuth } from '@context/AuthContext';
import Home from '@pages/Home/Home';
```

## 🎨 Styling Approach

### CSS Variables (Design Tokens)
Global design system in `index.css`:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #10b981;
  --spacing-md: 1rem;
  --radius-lg: 12px;
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Component-Scoped CSS
Each component has its own CSS file:
- `Navbar.jsx` → `Navbar.css`
- Prevents style conflicts
- Easy to maintain and debug

## 🔐 Authentication Flow

1. **Login**: User submits credentials → `authService.login()` → Token stored in `localStorage`
2. **Token Management**: Axios interceptor adds token to all requests
3. **Protected Routes**: `ProtectedRoute` checks auth status before rendering
4. **Auto Logout**: 401 responses trigger automatic logout and redirect

```javascript
// Request Interceptor (api.js)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🌐 Multi-Language Support

### LanguageContext
Provides translation function `t()` and language state:
```javascript
const { t, language, setLanguage } = useLanguage();

<h1>{t('welcome')}</h1>
<button>{t('login')}</button>
```

### Translation Object
```javascript
const translations = {
  en: {
    welcome: 'Welcome to MigrateRight',
    login: 'Login',
  },
  bn: {
    welcome: 'মাইগ্রেটরাইট এ স্বাগতম',
    login: 'লগইন',
  },
};
```

## 📡 API Integration

### Base Configuration
```javascript
// api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});
```

### Service Pattern
Each feature has its own service file:
- `authService.js` - Login, register, logout, verify
- `agencyService.js` - Get agencies, search, filters
- `userService.js` - Get profile, update profile, upload documents

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:5000`

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Development
```bash
# Start dev server with hot reload
npm run dev

# Access at http://localhost:5173
```

### Build for Production
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 🧪 Testing (Future)

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI library |
| react-router-dom | ^6.20.0 | Routing |
| axios | ^1.6.0 | HTTP client |
| vite | ^5.0.0 | Build tool |

## 🎯 Why This Architecture?

### Scalability
- **Modular Structure**: Easy to add new features without affecting existing code
- **Service Layer**: Backend changes don't break UI components
- **Component Reusability**: DRY principle, faster development

### Maintainability
- **Clear Separation**: UI, logic, and data layers are distinct
- **Path Aliases**: Imports remain consistent even when moving files
- **Consistent Naming**: `ComponentName.jsx`, `ComponentName.css` pattern

### Team Collaboration
- **Feature Folders**: Each developer can work on isolated features
- **Clear Contracts**: Services define API interactions clearly
- **Code Reviews**: Easier to review small, focused components

### Performance
- **Vite**: 10-100x faster than webpack
- **Code Splitting**: Future-ready for lazy loading routes
- **Optimized Builds**: Automatic minification and tree-shaking

## 🔄 Typical Development Workflow

1. **Create Service**: Define API calls in service file
2. **Create Component**: Build UI with dummy data
3. **Connect to Service**: Replace dummy data with real API calls
4. **Add to Routes**: Register component in `AppRoutes.jsx`
5. **Style**: Apply CSS following design system
6. **Test**: Manual testing, then automated tests

## 🌟 Best Practices

### Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { someService } from '@services/someService';
import './Component.css';

/**
 * Component Description
 * Brief explanation of purpose
 */
const Component = () => {
  // 1. Hooks (useState, useEffect, custom hooks)
  // 2. Event handlers
  // 3. Helper functions
  // 4. Return JSX
};

export default Component;
```

### Error Handling
```javascript
const [error, setError] = useState('');

try {
  const response = await authService.login(credentials);
  // Success handling
} catch (err) {
  setError(err.message || 'Something went wrong');
}
```

### Loading States
```javascript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch data
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router Docs](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for team guidelines.

## 📝 License

This project is part of a university software engineering course.

---

**Built with ❤️ by the MigrateRight Team**
