# MongoDB Configuration - Quick Reference

## ✅ What's Been Configured

Your Node.js + Express backend now has a **production-ready MongoDB configuration** with:

### 🎯 Core Features
- ✅ **Connection pooling** for optimal performance
- ✅ **Automatic retry logic** (5 attempts with 5-second delays)
- ✅ **Comprehensive error handling** with detailed logging
- ✅ **Graceful shutdown** on SIGINT/SIGTERM
- ✅ **Connection state monitoring** with event listeners
- ✅ **Environment variable configuration**
- ✅ **Reusable database utilities**

---

## 📂 Files Created/Modified

### 1. **config/database.js** (Enhanced)
Production-ready MongoDB connection with:
- Connection pooling options
- Retry logic (5 attempts)
- Event listeners (connected, error, disconnected, reconnected)
- Graceful shutdown handlers
- Utility functions: `isConnected()`, `getConnectionState()`, `disconnectDB()`

### 2. **utils/database.utils.js** (New)
Database utility functions:
- `pingDatabase()` - Check database responsiveness with latency
- `getDatabaseStats()` - Get database statistics (size, collections, indexes)
- `listCollections()` - List all collections
- `testConnection()` - Comprehensive connection test
- `createBackup()` - Backup database to JSON (dev only)
- `ensureIndexes()` - Sync model indexes

### 3. **controllers/health.controller.js** (Updated)
Enhanced health check with database status:
- `/api/health` - Basic health with DB connection status
- `/api/health/detailed` - Full server, database, and system info

### 4. **.env** (Updated)
Added MongoDB configuration options

### 5. **docs/MONGODB_PRODUCTION_GUIDE.md** (New)
Complete production deployment guide

---

## 🚀 How to Use

### Basic Usage (Already Working)

Your server automatically connects to MongoDB on startup:

```javascript
// In server.js
const { connectDB } = require('./config/database');

// Connect to MongoDB
connectDB();
```

### Check Connection Status

```javascript
const { isConnected, getConnectionState } = require('./config/database');

// Simple check
if (isConnected()) {
  console.log('Database is connected');
}

// Detailed state
const state = getConnectionState();
console.log(state);
// Output:
// {
//   isConnected: true,
//   readyState: 'Connected',
//   host: 'localhost',
//   port: '27017',
//   name: 'migrateright'
// }
```

### Use Database Utilities

```javascript
const dbUtils = require('./utils/database.utils');

// Ping database
const ping = await dbUtils.pingDatabase();
console.log(ping); // { success: true, latency: '5ms', message: 'Database is responsive' }

// Get database stats
const stats = await dbUtils.getDatabaseStats();
console.log(stats.data);
// {
//   database: 'migrateright',
//   collections: 5,
//   documents: 1234,
//   dataSize: '2.5 MB',
//   storageSize: '5.0 MB'
// }

// List collections
const collections = await dbUtils.listCollections();
console.log(collections); // ['users', 'agencies', 'jobs']

// Test connection
const test = await dbUtils.testConnection();
console.log(test);
```

---

## 🔧 Configuration Options

### Connection Pool Settings

Edit `config/database.js` to tune performance:

```javascript
const options = {
  maxPoolSize: 10,  // Max connections (increase for high traffic)
  minPoolSize: 2,   // Min connections (keep some alive)
  serverSelectionTimeoutMS: 5000,  // Server selection timeout
  socketTimeoutMS: 45000,          // Socket timeout
  family: 4,        // Use IPv4
  retryWrites: true,
  retryReads: true,
};
```

### Environment Variables

In `.env`:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/migrateright

# Optional (uses defaults from database.js if not set)
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=2
DB_SERVER_SELECTION_TIMEOUT=5000
DB_SOCKET_TIMEOUT=45000
```

---

## 📡 API Endpoints

### Test Your Database Connection

#### 1. Basic Health Check
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2025-12-21T10:30:00.000Z"
}
```

#### 2. Detailed Health Check
```bash
curl http://localhost:5000/api/health/detailed
```

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "server": {
      "status": "online",
      "environment": "development",
      "uptime": "0d 2h 15m 30s",
      "timestamp": "2025-12-21T10:30:00.000Z"
    },
    "database": {
      "status": "Connected",
      "isConnected": true,
      "name": "migrateright",
      "host": "localhost",
      "port": "27017"
    },
    "system": {
      "platform": "win32",
      "nodeVersion": "v18.17.0",
      "memory": { "rss": "45.23 MB", "heapUsed": "15.67 MB" },
      "cpus": 8
    }
  }
}
```

---

## 🎯 Production Deployment

### Step 1: Set up MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a **FREE M0 cluster**
3. Create database user
4. Whitelist IP addresses
5. Get connection string

### Step 2: Update Environment Variables

```env
# Production MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/migrateright?retryWrites=true&w=majority

# Increase pool size for production
DB_MAX_POOL_SIZE=50
DB_MIN_POOL_SIZE=10
```

### Step 3: Test Connection Locally

```bash
# Update .env with Atlas URI
npm run dev

# Check health endpoint
curl http://localhost:5000/api/health
```

### Step 4: Deploy

Deploy to your hosting platform (Heroku, AWS, DigitalOcean, etc.) and set environment variables.

**Full guide:** See `docs/MONGODB_PRODUCTION_GUIDE.md`

---

## 🔍 Monitoring & Debugging

### View Connection Events

The server logs all MongoDB connection events:

```
📡 Mongoose: Connection established
✅ MongoDB Connection Successful
📍 Host: localhost
📦 Database: migrateright
```

### Connection Errors

If connection fails, you'll see detailed error messages and retry attempts:

```
❌ MongoDB Connection Failed
Error: connect ECONNREFUSED 127.0.0.1:27017

🔄 Retrying connection... (4 attempts left)
⏳ Waiting 5 seconds before retry...
```

### Monitor in Code

```javascript
const { isConnected } = require('./config/database');

// In your route handler
app.get('/api/users', async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable'
    });
  }
  
  // Continue with database operations...
});
```

---

## 🛠️ Common Tasks

### Create a Model

```javascript
// models/User.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Create index for better performance
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
```

### Use in Controller

```javascript
// controllers/user.controller.js
const User = require('../models/User.model');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getUsers };
```

### Test Database Operations

```javascript
// Test creating a user
const User = require('./models/User.model');

const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});

console.log('User created:', user);
```

---

## 📚 Best Practices

### ✅ DO

- Use environment variables for connection strings
- Implement connection pooling
- Create indexes for frequently queried fields
- Use `.lean()` for read-only operations
- Handle connection errors gracefully
- Monitor database performance
- Use transactions for multi-document operations
- Implement backup strategy

### ❌ DON'T

- Hardcode connection strings
- Commit `.env` file to Git
- Use same credentials for dev and production
- Create too many connections
- Skip error handling
- Ignore slow queries
- Store large files in MongoDB (use GridFS or cloud storage)

---

## 🚨 Troubleshooting

### Problem: Can't connect to MongoDB

**Solution:**
1. Check if MongoDB is running: `systemctl status mongod` (Linux) or check Task Manager (Windows)
2. Verify connection string in `.env`
3. Check network/firewall settings
4. For Atlas: Verify IP whitelist

### Problem: Connection timeout

**Solution:**
1. Increase `serverSelectionTimeoutMS` in `database.js`
2. Check MongoDB server is accessible
3. Verify network connection

### Problem: Authentication failed

**Solution:**
1. Verify username and password
2. Check user permissions in MongoDB
3. Ensure `authSource` is correct in connection string

---

## 📖 Documentation

- **MongoDB Production Guide**: `docs/MONGODB_PRODUCTION_GUIDE.md`
- **Backend README**: `README.md`
- **Mongoose Docs**: https://mongoosejs.com/docs/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/

---

## ✅ Verification Checklist

- [x] MongoDB connection configured
- [x] Connection pooling enabled
- [x] Retry logic implemented
- [x] Error handling in place
- [x] Graceful shutdown configured
- [x] Health check endpoints working
- [x] Database utilities created
- [x] Production guide documented
- [x] Environment variables set up
- [x] Server running successfully

---

**Your MongoDB connection is now production-ready! 🚀**

Access your API at: **http://localhost:5000**  
Health check: **http://localhost:5000/api/health**
