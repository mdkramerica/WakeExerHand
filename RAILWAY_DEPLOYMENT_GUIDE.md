# WakeExer Railway Deployment Guide

## 🚂 **Step-by-Step Railway Deployment**

### **Prerequisites ✅**
- ✅ Security hardening completed
- ✅ Application running locally on port 3000
- ✅ All passwords migrated to bcrypt hashes
- ✅ Environment configuration ready

---

## **Method 1: Railway Web Dashboard (Recommended)**

### **Step 1: Create Railway Account & Project**

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login** with GitHub (recommended for easy repo connection)
3. **Create New Project** → "Deploy from GitHub repo"
4. **Connect Repository**: Select your WakeExer repository
5. **Choose Project Name**: `wakeexer-production`

### **Step 2: Add PostgreSQL Database**

1. **In your Railway project dashboard**
2. **Click "New Service"** → "Database" → "Add PostgreSQL"
3. **Wait for database provisioning** (1-2 minutes)
4. **Note**: Railway automatically creates database credentials

### **Step 3: Configure Environment Variables**

In Railway dashboard → Your service → "Variables" tab:

```bash
# Required Production Variables
NODE_ENV=production
USE_DATABASE=true

# Security (CRITICAL - Generate Strong Values)
SESSION_SECRET=your-super-secure-32-char-session-secret-here
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=your-secure-admin-password
DEFAULT_ADMIN_EMAIL=admin@yourcompany.com

# CORS & Domain (Replace with your Railway domain)
ALLOWED_ORIGINS=https://your-app-name.railway.app
FRONTEND_URL=https://your-app-name.railway.app

# Optional Performance Tuning
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
```

**🔐 SECURITY NOTE**: Railway will automatically set these database variables:
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- `DATABASE_URL` (constructed automatically)

### **Step 4: Configure Build Settings**

In Railway dashboard → Service → "Settings" tab:

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Root Directory**: Leave empty (uses project root)
- **Port**: Railway auto-detects from your code

### **Step 5: Deploy**

1. **Trigger Deployment**: Push to your main branch or click "Deploy"
2. **Monitor Build**: Watch the deployment logs
3. **Wait for Completion**: Usually takes 2-3 minutes

### **Step 6: Run Database Migrations**

After successful deployment:

1. **Open Railway dashboard** → Your service → "Deployments"
2. **Click latest deployment** → "View Logs"
3. **Verify database connection** in logs

The app will automatically:
- ✅ Create database tables (via Drizzle ORM)
- ✅ Migrate passwords to bcrypt hashes
- ✅ Set up admin users

### **Step 7: Test Your Deployment**

1. **Get your Railway URL**: `https://your-app-name.railway.app`
2. **Test endpoints**:
   - Main app: `https://your-app-name.railway.app`
   - Admin login: `https://your-app-name.railway.app/admin`
   - API health: `https://your-app-name.railway.app/api/assessments`

---

## **Method 2: Railway CLI (If CLI Issues Resolved)**

If you can get Railway CLI working:

```bash
# Install/Update Railway CLI
brew install railway
# or
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Set environment variables
railway variables set NODE_ENV=production
railway variables set USE_DATABASE=true
railway variables set SESSION_SECRET=your-secret

# Deploy
railway up
```

---

## **Security Checklist for Production** ✅

Before going live, verify:

- [ ] **Strong SESSION_SECRET** (32+ characters)
- [ ] **Secure admin password** (not default)
- [ ] **CORS properly configured** with your domain
- [ ] **HTTPS enabled** (automatic with Railway)
- [ ] **Database URL secure** (Railway handles this)
- [ ] **No hardcoded secrets** in code

---

## **Environment Variables Quick Reference**

### **Critical Security Variables**
```bash
NODE_ENV=production
SESSION_SECRET=generate-strong-32-char-secret
DEFAULT_ADMIN_PASSWORD=secure-password-change-immediately
```

### **Database Variables (Auto-set by Railway)**
```bash
DATABASE_URL=postgresql://... (auto-generated)
PGHOST=... (auto-set)
PGPORT=... (auto-set)
PGDATABASE=... (auto-set)
PGUSER=... (auto-set)
PGPASSWORD=... (auto-set)
```

### **CORS & Domain Variables**
```bash
ALLOWED_ORIGINS=https://your-app.railway.app
FRONTEND_URL=https://your-app.railway.app
```

---

## **Common Issues & Solutions**

### **Build Failures**
- ✅ Ensure `npm run build` works locally
- ✅ Check all dependencies are in package.json
- ✅ Verify no missing imports

### **Database Connection Issues**
- ✅ Verify PostgreSQL service is running
- ✅ Check DATABASE_URL is auto-generated
- ✅ Ensure USE_DATABASE=true

### **Authentication Issues**
- ✅ Check SESSION_SECRET is set
- ✅ Verify admin password is secure
- ✅ Test login endpoints

### **CORS Issues**
- ✅ Set ALLOWED_ORIGINS to your Railway domain
- ✅ Ensure HTTPS is used (http vs https)

---

## **Post-Deployment Steps**

1. **Test All Features**:
   - Patient portal with access codes
   - Admin portal login
   - Clinical dashboard
   - Assessment functionality

2. **Security Verification**:
   - Change default admin password
   - Test rate limiting
   - Verify HTTPS enforcement

3. **Monitoring Setup**:
   - Check Railway deployment logs
   - Monitor error rates
   - Set up alerts (optional)

4. **Custom Domain** (Optional):
   - Add custom domain in Railway settings
   - Update CORS settings for new domain

---

## **Support Resources**

- **Railway Docs**: https://docs.railway.app
- **Railway Status**: https://status.railway.app
- **Railway Discord**: https://discord.gg/railway

---

**Your application is production-ready with enterprise-grade security! 🚀**
