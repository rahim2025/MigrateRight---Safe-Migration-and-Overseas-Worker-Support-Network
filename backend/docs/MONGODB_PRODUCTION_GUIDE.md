# MongoDB Production Deployment Guide

Complete guide for deploying MongoDB in production with best practices, security, and performance optimization.

---

## 📋 Table of Contents

- [Production Checklist](#production-checklist)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Environment Configuration](#environment-configuration)
- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)
- [Connection Pooling](#connection-pooling)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## ✅ Production Checklist

Before deploying to production, ensure:

- [ ] MongoDB Atlas cluster created (or self-hosted secured)
- [ ] Strong database password set
- [ ] IP whitelist configured
- [ ] SSL/TLS enabled
- [ ] Connection string updated in `.env`
- [ ] Environment variables validated
- [ ] Indexes created for frequently queried fields
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Error logging set up

---

## 🌐 MongoDB Atlas Setup

### Option 1: MongoDB Atlas (Recommended for Beginners)

**MongoDB Atlas** is a fully managed cloud database service.

#### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

#### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select **cloud provider** (AWS, Google Cloud, or Azure)
4. Choose **region** closest to your users
5. Name your cluster (e.g., `migrateright-cluster`)
6. Click **"Create"**

#### Step 3: Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `migrateright_admin`
5. Password: Generate a strong password (save it securely!)
6. Set role: **Atlas Admin** or **Read and write to any database**
7. Click **"Add User"**

#### Step 4: Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. For production: Add your **server's IP address**
5. Click **"Confirm"**

#### Step 5: Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver**: Node.js, **Version**: 4.1 or later
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
   ```

#### Step 6: Update Environment Variables
```env
MONGODB_URI=mongodb+srv://migrateright_admin:YOUR_PASSWORD@cluster.mongodb.net/migrateright?retryWrites=true&w=majority
```

Replace:
- `migrateright_admin` → your username
- `YOUR_PASSWORD` → your actual password
- `cluster` → your cluster name
- `migrateright` → your database name

---

### Option 2: Self-Hosted MongoDB

If you're hosting your own MongoDB server:

#### Step 1: Install MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 2: Enable Authentication
```bash
# Connect to MongoDB shell
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "strong_password_here",
  roles: [ { role: "root", db: "admin" } ]
})

# Create database user
use migrateright
db.createUser({
  user: "migrateright_user",
  pwd: "database_password_here",
  roles: [ { role: "readWrite", db: "migrateright" } ]
})

exit
```

#### Step 3: Enable Authentication in Config
Edit `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

#### Step 4: Connection String
```env
MONGODB_URI=mongodb://migrateright_user:database_password_here@localhost:27017/migrateright?authSource=migrateright
```

---

## 🔐 Security Best Practices

### 1. Use Strong Passwords
```bash
# Generate strong password (Linux/Mac)
openssl rand -base64 32

# Or use online generator: https://passwordsgenerator.net/
```

### 2. Enable SSL/TLS
```javascript
// In database.js options
const options = {
  ssl: true,
  sslValidate: true,
  // ... other options
};
```

### 3. Whitelist IP Addresses
Only allow connections from your application server's IP.

### 4. Use Environment Variables
**Never** hardcode credentials in your code:
```javascript
// ❌ BAD
mongoose.connect('mongodb://user:password@host/db');

// ✅ GOOD
mongoose.connect(process.env.MONGODB_URI);
```

### 5. Limit Database User Permissions
Create users with minimum required permissions:
```javascript
// Development: readWrite
// Production API: readWrite on specific database
// Analytics: read only
```

### 6. Enable Audit Logging (Atlas)
In MongoDB Atlas:
1. Go to **Security** → **Advanced**
2. Enable **Database Auditing**
3. Configure audit filters

---

## ⚡ Performance Optimization

### 1. Create Indexes
Indexes speed up queries dramatically:

```javascript
// In your model file
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Create indexes
userSchema.index({ email: 1 }); // Single field index
userSchema.index({ createdAt: -1 }); // Descending order
userSchema.index({ phoneNumber: 1, email: 1 }); // Compound index
```

### 2. Use Lean Queries
For read-only operations, use `.lean()` to skip Mongoose overhead:

```javascript
// Returns plain JavaScript objects (faster)
const users = await User.find({}).lean();
```

### 3. Select Only Required Fields
```javascript
// ❌ BAD - Returns all fields
const user = await User.findById(id);

// ✅ GOOD - Returns only needed fields
const user = await User.findById(id).select('name email');
```

### 4. Use Pagination
```javascript
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;

const results = await User.find({})
  .limit(limit)
  .skip(skip)
  .sort({ createdAt: -1 });
```

### 5. Use Aggregation Pipeline
For complex queries, use aggregation:
```javascript
const stats = await User.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$country', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

---

## 🔄 Connection Pooling

Connection pooling is already configured in `config/database.js`:

```javascript
const options = {
  maxPoolSize: 10,  // Maximum connections
  minPoolSize: 2,   // Minimum connections
  // ... other options
};
```

### Tuning Pool Size

| App Size | Max Pool Size | Min Pool Size |
|----------|---------------|---------------|
| Small (<100 req/s) | 5-10 | 1-2 |
| Medium (100-1000 req/s) | 10-50 | 5-10 |
| Large (>1000 req/s) | 50-100 | 10-20 |

**Formula**: `maxPoolSize = (concurrent_requests × avg_query_time) / 1000`

---

## 📊 Monitoring & Logging

### 1. MongoDB Atlas Monitoring
Atlas provides built-in monitoring:
- **Metrics**: CPU, memory, disk usage
- **Query Performance**: Slow queries
- **Alerts**: Email/SMS notifications

### 2. Application Logging
Add logging for database operations:

```javascript
// In database.js
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});
```

### 3. Query Profiling
Enable profiling for slow queries:

```javascript
// MongoDB shell
use migrateright
db.setProfilingLevel(1, { slowms: 100 }); // Log queries > 100ms

// View slow queries
db.system.profile.find().limit(10).sort({ ts: -1 });
```

---

## 💾 Backup & Recovery

### MongoDB Atlas (Automatic)
Atlas provides automatic backups:
- **Cloud Backups**: Enabled by default on M10+ clusters
- **Snapshots**: Taken every 6 hours
- **Retention**: 2 days (free tier) to 35 days (paid)

### Manual Backup
Use `mongodump`:

```bash
# Backup entire database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/migrateright" --out=backup/

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/migrateright" backup/migrateright/
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="backups/$DATE"

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR"
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

# Upload to cloud storage (AWS S3, Google Cloud, etc.)
# aws s3 cp "$BACKUP_DIR.tar.gz" s3://my-bucket/backups/
```

Set up cron job:
```bash
# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🔍 Troubleshooting

### Issue 1: Connection Timeout

**Error:**
```
MongoServerSelectionError: connection timeout
```

**Solutions:**
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string
3. Check firewall settings
4. Increase `serverSelectionTimeoutMS`:
   ```javascript
   serverSelectionTimeoutMS: 10000 // 10 seconds
   ```

### Issue 2: Authentication Failed

**Error:**
```
MongoError: Authentication failed
```

**Solutions:**
1. Verify username and password
2. Check `authSource` in connection string
3. Ensure user has correct permissions
4. URL encode password if it contains special characters:
   ```javascript
   const password = encodeURIComponent('p@ssw0rd!');
   ```

### Issue 3: Too Many Connections

**Error:**
```
MongoError: too many connections
```

**Solutions:**
1. Reduce `maxPoolSize`
2. Close unused connections
3. Implement connection pooling
4. Upgrade MongoDB cluster tier

### Issue 4: Slow Queries

**Solutions:**
1. Create indexes on frequently queried fields
2. Use `.explain()` to analyze queries:
   ```javascript
   const explain = await User.find({ email: 'test@test.com' }).explain();
   console.log(explain);
   ```
3. Use projection to limit returned fields
4. Implement caching (Redis)

---

## 📚 Production Environment Variables

Create a separate `.env.production` file:

```env
# Application
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/migrateright?retryWrites=true&w=majority

# Connection Pool
DB_MAX_POOL_SIZE=50
DB_MIN_POOL_SIZE=10
DB_SERVER_SELECTION_TIMEOUT=10000
DB_SOCKET_TIMEOUT=60000

# Security
JWT_SECRET=very_long_random_string_min_32_chars
BCRYPT_SALT_ROUNDS=12

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

---

## 🚀 Deployment Steps

1. **Set up MongoDB Atlas** (or self-hosted)
2. **Update `.env` file** with production credentials
3. **Test connection locally**:
   ```bash
   npm run dev
   # Check health endpoint: http://localhost:5000/api/health/detailed
   ```
4. **Deploy to server** (Heroku, AWS, DigitalOcean, etc.)
5. **Set environment variables** on hosting platform
6. **Test production endpoint**:
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

---

## 📞 Support Resources

- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
- **Mongoose Documentation**: https://mongoosejs.com/docs/
- **MongoDB University**: https://university.mongodb.com/ (Free courses)
- **Community Forums**: https://www.mongodb.com/community/forums/

---

## 🔐 Security Checklist

- [ ] Strong passwords (min 16 characters)
- [ ] IP whitelist configured
- [ ] SSL/TLS enabled
- [ ] Database user with limited permissions
- [ ] Environment variables not committed to Git
- [ ] `.env` file in `.gitignore`
- [ ] Authentication enabled
- [ ] Regular security updates
- [ ] Audit logging enabled
- [ ] Rate limiting implemented

---

**Built with ❤️ for MigrateRight**
