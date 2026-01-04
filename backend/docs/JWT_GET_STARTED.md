# 🚀 JWT Authentication - Get Started in 5 Minutes

This guide will get your JWT authentication up and running quickly.

---

## Step 1: Generate Secrets (1 minute)

```bash
cd backend

# Generate JWT access token secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT refresh token secret  
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to your `.env` file.

---

## Step 2: Update .env File (1 minute)

```env
# Replace with your generated secrets
JWT_SECRET=a1b2c3d4e5f6... (your generated secret)
JWT_REFRESH_SECRET=f6e5d4c3b2a1... (different generated secret)
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Ensure MongoDB is configured
MONGODB_URI=mongodb://localhost:27017/migrateright

# Other required vars
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Step 3: Start Server (30 seconds)

```bash
npm run dev
```

Server should start at http://localhost:5000

---

## Step 4: Test Authentication (2 minutes)

### Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "phoneNumber": "+8801712345678",
    "role": "aspiring_migrant",
    "fullName": {
      "firstName": "Test",
      "lastName": "User"
    },
    "dateOfBirth": "1990-01-01",
    "gender": "male"
  }'
```

**Response includes:**
- `token` - Your access token
- `refreshToken` - Your refresh token
- `user` - User object

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Copy the `token` from the response.**

### Access Protected Route

Replace `<YOUR_TOKEN>` with the token from login:

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

You should see your user details!

---

## Step 5: Protect Your Routes (30 seconds)

```javascript
// In any route file
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public route
router.get('/agencies', getAgencies);

// Protected route (any authenticated user)
router.post('/favorites', authenticate, addToFavorites);

// Role-based route (admin only)
router.delete('/users/:id', 
  authenticate, 
  authorize('platform_admin'), 
  deleteUser
);
```

---

## ✅ You're Done!

Your JWT authentication is now working. Here's what you have:

✅ Secure token generation  
✅ Login/Logout endpoints  
✅ Protected routes  
✅ Role-based access control  
✅ Production-ready security  

---

## 📚 Next Steps

### Learn More
- **Full Guide:** [JWT_AUTHENTICATION_GUIDE.md](./JWT_AUTHENTICATION_GUIDE.md)
- **Quick Reference:** [JWT_QUICK_REFERENCE.md](./JWT_QUICK_REFERENCE.md)
- **API Docs:** [../docs/API_CONTRACT.md](../../docs/API_CONTRACT.md)

### Common Tasks

**Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

**Refresh Token:**
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<YOUR_REFRESH_TOKEN>"}'
```

**Check Token in Postman:**
1. Create request
2. Authorization tab → Type: Bearer Token
3. Token: `{{accessToken}}`

---

## 🚨 Production Checklist

Before deploying to production:

- [ ] Changed JWT secrets to strong random values
- [ ] Set `NODE_ENV=production`
- [ ] Enabled HTTPS
- [ ] Configured CORS with production frontend URL
- [ ] Set shorter token expiry (recommend 15m access, 7d refresh)
- [ ] Set up Redis for token blacklist (optional)
- [ ] Reviewed security settings

---

## 🆘 Troubleshooting

**"Invalid token" error:**
- Check JWT_SECRET matches in .env
- Ensure token is being sent as `Bearer <token>`

**"Authentication required" error:**
- Verify Authorization header is included
- Format: `Authorization: Bearer <your-token>`

**CORS errors:**
- Check FRONTEND_URL in .env matches your frontend
- Ensure CORS is configured in server.js

**Need more help?**
See [JWT_AUTHENTICATION_GUIDE.md - Troubleshooting](./JWT_AUTHENTICATION_GUIDE.md#troubleshooting)

---

**🎉 Happy Coding!**
