# JWT Authentication Quick Reference

## 🚀 Quick Start

### 1. Generate Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure .env
```env
JWT_SECRET=<generated_secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<different_generated_secret>
JWT_REFRESH_EXPIRES_IN=30d
```

### 3. Use in Routes
```javascript
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public
router.get('/public', handler);

// Protected
router.get('/private', authenticate, handler);

// Role-based
router.delete('/admin', authenticate, authorize('platform_admin'), handler);
```

---

## 📡 API Endpoints

### Register
```bash
POST /api/auth/register
Body: { email, password, phoneNumber, role, fullName, dateOfBirth, gender }
Response: { token, refreshToken, user }
```

### Login
```bash
POST /api/auth/login
Body: { email, password }
Response: { token, refreshToken, user }
```

### Logout
```bash
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { success: true }
```

### Get Current User
```bash
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { user }
```

### Refresh Token
```bash
POST /api/auth/refresh-token
Body: { refreshToken }
Response: { token }
```

---

## 🔐 Middleware

### authenticate
**Purpose:** Verify JWT, attach user to request  
**Usage:** `router.get('/route', authenticate, handler)`  
**Sets:** `req.user`, `req.userId`, `req.token`

### authorize(...roles)
**Purpose:** Check user has required role  
**Usage:** `router.post('/route', authenticate, authorize('admin'), handler)`  
**Requires:** Must use after `authenticate`

### optionalAuth
**Purpose:** Attach user if token present, continue otherwise  
**Usage:** `router.get('/route', optionalAuth, handler)`  
**Sets:** `req.user` (if token valid)

### requireActiveAccount
**Purpose:** Ensure account status is 'active'  
**Usage:** `router.post('/route', authenticate, requireActiveAccount, handler)`

### requireVerifiedEmail
**Purpose:** Ensure email is verified  
**Usage:** `router.post('/route', authenticate, requireVerifiedEmail, handler)`

---

## 👥 User Roles

| Role | Value | Description |
|------|-------|-------------|
| Aspiring Migrant | `aspiring_migrant` | Planning migration |
| Worker Abroad | `worker_abroad` | Currently abroad |
| Family Member | `family_member` | Family of migrant |
| Recruitment Admin | `recruitment_admin` | Agency staff |
| Platform Admin | `platform_admin` | System administrator |

---

## 🎯 Common Patterns

### Public Route
```javascript
router.get('/agencies', getAgencies);
```

### Protected Route (Any Authenticated User)
```javascript
router.post('/favorites', authenticate, addToFavorites);
```

### Single Role Required
```javascript
router.delete('/users/:id', 
  authenticate, 
  authorize('platform_admin'), 
  deleteUser
);
```

### Multiple Roles Allowed
```javascript
router.put('/agencies/:id', 
  authenticate, 
  authorize('recruitment_admin', 'platform_admin'), 
  updateAgency
);
```

### Email Verification Required
```javascript
router.post('/agencies/:id/review', 
  authenticate, 
  requireVerifiedEmail, 
  addReview
);
```

### Active Account Required
```javascript
router.post('/payment', 
  authenticate, 
  requireActiveAccount, 
  processPayment
);
```

### Combined Requirements
```javascript
router.post('/sensitive-action', 
  authenticate, 
  requireActiveAccount,
  requireVerifiedEmail,
  authorize('platform_admin'),
  handleAction
);
```

---

## 💻 Client-Side Usage

### React Context Pattern
```javascript
// AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data.data.user);
    } catch (error) {
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.token);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Axios Interceptor (Auto-Refresh)
```javascript
// api.js
import axios from 'axios';

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && 
        error.response?.data?.message?.includes('expired') &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh-token', { 
          refreshToken 
        });
        
        localStorage.setItem('accessToken', data.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.data.token}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Protected Route Component
```javascript
// ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;

// Usage in App.jsx
<Route path="/admin" element={
  <ProtectedRoute roles={['platform_admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

---

## 🔧 Testing with cURL

### Login & Save Token
```bash
# Login
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}')

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# Use token
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Authentication required` | No token sent | Include `Authorization: Bearer <token>` header |
| `Token expired` | Token lifetime exceeded | Use refresh token to get new access token |
| `Invalid token` | Malformed or wrong secret | Check token format and JWT_SECRET |
| `Token has been revoked` | User logged out | User must login again |
| `User not found` | User deleted after token issued | User must login again |
| `Account is suspended` | Account deactivated | Contact support |
| `Access denied - Required roles: ...` | User lacks role | Check user role permissions |
| `Email verification required` | Email not verified | Complete email verification |

---

## 🛡️ Security Checklist

- [ ] Strong JWT secrets (32+ characters, random)
- [ ] Different secrets for access and refresh tokens
- [ ] HTTPS enabled in production
- [ ] Secrets in environment variables (not code)
- [ ] Rate limiting on auth endpoints
- [ ] Password complexity requirements
- [ ] Account lockout after failed attempts
- [ ] CORS configured properly
- [ ] Security headers (Helmet.js)
- [ ] Token blacklisting for logout
- [ ] Regular secret rotation
- [ ] Logging for security events

---

## 📊 Token Lifetimes

| Environment | Access Token | Refresh Token |
|-------------|-------------|---------------|
| Development | 7 days | 30 days |
| Staging | 1 day | 7 days |
| Production | 15 minutes | 7 days |

**Adjust based on your security requirements vs. UX needs**

---

## 🚨 Emergency Procedures

### Revoke All Tokens (Security Breach)
```javascript
// 1. Change JWT secrets in production
JWT_SECRET=<new_secret>
JWT_REFRESH_SECRET=<new_secret>

// 2. Clear Redis blacklist (if using)
redis-cli FLUSHDB

// 3. Restart application
pm2 restart app

// 4. All users must login again
```

### Debug Token Issues
```javascript
// utils/debug-token.js
const jwt = require('jsonwebtoken');

const token = 'paste_token_here';
const decoded = jwt.decode(token);

console.log('Token payload:', decoded);
console.log('Issued at:', new Date(decoded.iat * 1000));
console.log('Expires at:', new Date(decoded.exp * 1000));
console.log('Is expired:', decoded.exp < Date.now() / 1000);
```

---

## 📚 Further Reading

- Full Guide: `backend/docs/JWT_AUTHENTICATION_GUIDE.md`
- Error Handling: `backend/docs/LOGGING_AND_ERROR_HANDLING.md`
- API Contract: `docs/API_CONTRACT.md`
- User Model: `backend/models/User.js`

---

**Last Updated:** 2026-01-02  
**Version:** 1.0.0
