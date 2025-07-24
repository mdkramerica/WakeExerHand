# Clean Repository Setup Guide

## Files to Include in New Repository:
✅ **Essential Code Files:**
- All files in `client/` (except large videos)
- All files in `server/`
- All files in `shared/`
- `package.json`, `package-lock.json`
- `tsconfig.json`, `vite.config.ts`
- `tailwind.config.ts`, `postcss.config.js`
- `components.json`, `drizzle.config.ts`
- All `.md` documentation files
- `.gitignore` (already updated)

❌ **Files to Exclude:**
- `attached_assets/*.mov` (9 large video files)
- `.git/` directory (causes the push issues)
- `node_modules/` (will be recreated)

## Steps for Clean Setup:

### Method 1: Replit Fork
1. Click "Fork" button in top right
2. Name: "ExerAI-HandAssessment-Clean"
3. Connect to new GitHub repository
4. Delete large .mov files from attached_assets

### Method 2: Manual Copy
1. Create new Replit from template
2. Copy essential files (excluding videos)
3. Run `npm install`
4. Test application
5. Connect to GitHub

## Application Architecture Summary:
- **React + TypeScript frontend** with Vite
- **Express + Node.js backend** 
- **PostgreSQL database** with Drizzle ORM
- **MediaPipe integration** for hand tracking
- **Patient assessment system** with motion replay
- **Admin compliance portal** 
- **Working patient dashboard** with all features

The application is fully functional - the Git issues are only affecting version control, not the core functionality.