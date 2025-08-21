# WakeExer Local Development Setup

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Start Development Server
```bash
# Option 1: Use the startup script
./start-local.sh

# Option 2: Manual start
PORT=3000 USE_DATABASE=false NODE_ENV=development npx tsx server/index.ts
```

The application will be available at:
- **Main Application**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/admin  
- **Clinical Dashboard**: http://localhost:3000/clinical

## 📋 Environment Configuration

### Local Development (.env)
```env
NODE_ENV=development
USE_DATABASE=false
PORT=3000
SESSION_SECRET=your-local-session-secret
```

### Key Environment Variables
- `USE_DATABASE=false` - Uses file-based storage instead of PostgreSQL
- `PORT=3000` - Avoids conflicts with macOS AirTunes on port 5000
- `NODE_ENV=development` - Enables development features

## 🗄️ Storage System

### File-Based Storage (Default for Local Development)
- **Location**: `./data/` directory
- **Format**: JSON files for users, assessments, etc.
- **Benefits**: No database setup required, persistent across restarts

### Database Storage (Optional)
To use PostgreSQL instead of file storage:
```bash
# Set environment variables
export USE_DATABASE=true
export DATABASE_URL=postgresql://user:password@localhost:5432/wakeexer_dev

# Run the server
npm run dev
```

## 🎯 Available Portals & Test Data

### 1. Patient Portal (http://localhost:3000)
**Test Access Codes**: The system comes with pre-configured test users
- Access via 6-digit codes (check `data/users.json` after first run)

### 2. Admin Portal (http://localhost:3000/admin)
**Default Admin Credentials** (for local development):
- Username: `admin`
- Password: `admin123`

**Available Features**:
- Patient compliance metrics (total/active patients, assessments completed)
- Patient management and data export
- System analytics and monitoring

### 3. Clinical Dashboard (http://localhost:3000/clinical)
**Test Clinical Users**: Check `data/clinical-users.json` after first run

## 🔧 Development Features

### Hot Reload
The development server includes:
- ✅ Backend hot reload via `tsx`
- ✅ Frontend hot reload via Vite
- ✅ Automatic restarts on file changes

### MediaPipe Integration
- ✅ Loads from CDN automatically
- ✅ Hand and pose tracking enabled
- ✅ Real-time motion analysis
- ✅ Works with webcam in browsers

### File Structure
```
├── client/src/           # React frontend
├── server/              # Express backend
├── shared/              # Shared TypeScript types
├── data/               # Local file storage (auto-created)
└── start-local.sh      # Quick start script
```

## 🧪 Testing the Application

### 1. Test Patient Flow
1. Go to http://localhost:3000
2. Enter a 6-digit access code
3. Select injury type (first-time users)
4. Complete assessments with webcam

### 2. Test Admin Portal
1. Go to http://localhost:3000/admin
2. Login with admin/admin123
3. View patient compliance data
4. Generate new access codes

### 3. Test Clinical Dashboard
1. Go to http://localhost:3000/clinical
2. Login with clinical credentials
3. View patient analytics
4. Access research tools

## 🔍 API Testing

### Key Endpoints
```bash
# Get all assessments
curl http://localhost:3000/api/assessments

# Check admin compliance data  
curl http://localhost:3000/api/admin/compliance

# Verify patient access code
curl -X POST http://localhost:3000/api/users/verify-code \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

## ⚠️ Common Issues & Solutions

### Port 5000 Conflicts (macOS)
**Issue**: `Error: listen ENOTSUP: operation not supported`
**Solution**: Use PORT=3000 (already configured in script)

### MediaPipe Loading Issues
**Issue**: Motion tracking not working
**Solution**: Ensure webcam permissions and HTTPS (for production)

### Database Connection Errors
**Issue**: PostgreSQL connection failures
**Solution**: Ensure `USE_DATABASE=false` for local development

### File Storage Permissions
**Issue**: Cannot write to data directory
**Solution**: Ensure write permissions on project directory

## 🔄 Reset Development Data

```bash
# Remove all local data
rm -rf data/

# Restart server (will recreate default data)
./start-local.sh
```

## 📝 Development Notes

### Making Changes
- Backend changes: Automatic restart via `tsx`
- Frontend changes: Hot reload via Vite
- Schema changes: Restart required for file storage

### Adding New Features
- Follow existing patterns in client/src/pages/
- Add API endpoints in server/routes.ts
- Update types in shared/schema.ts

### Production Deployment
- Set `NODE_ENV=production`
- Set `USE_DATABASE=true`
- Provide `DATABASE_URL`
- Use `npm run build` and `npm start`

---

## 🎉 You're Ready!

Your local WakeExer development environment is now set up and running. The application includes:

✅ **Motion Tracking** - MediaPipe hand/wrist assessment  
✅ **Multi-Portal Access** - Patient, Admin, Clinical dashboards  
✅ **File-Based Storage** - No database setup required  
✅ **Hot Reload** - Fast development iteration  
✅ **Test Data** - Pre-configured users and assessments  
✅ **API Testing** - All endpoints functional  

Start building and testing your hand rehabilitation features!
