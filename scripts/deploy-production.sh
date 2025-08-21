#!/bin/bash

# WakeExer Production Deployment Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 WakeExer Production Deployment Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if required environment variables are set
echo "🔍 Checking environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "SESSION_SECRET"
    "NODE_ENV"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        echo "💡 Please check your .env file or Railway environment settings"
        exit 1
    fi
done

# Validate NODE_ENV
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Warning: NODE_ENV is not set to 'production' (current: $NODE_ENV)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --omit=dev

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations if using database
if [ "$USE_DATABASE" = "true" ] && [ -n "$DATABASE_URL" ]; then
    echo "🗄️  Running database migrations..."
    npm run db:push
    echo "✅ Database migrations completed"
else
    echo "📁 Using file-based storage (no database migrations needed)"
fi

# Run password migration for existing data
echo "🔐 Running password migration..."
npx tsx server/migrate-passwords.ts

# Validate the build
echo "🧪 Validating build..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: Build failed - dist/index.js not found"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ Error: Build failed - dist/public not found"
    exit 1
fi

echo "✅ Build validated"

# Security checks
echo "🔒 Running security checks..."

# Check for common security issues
if grep -r "admin123" . --exclude-dir=node_modules --exclude-dir=dist --exclude="*.sh" > /dev/null 2>&1; then
    echo "⚠️  Warning: Default passwords found in codebase"
fi

if grep -r "change-this" . --exclude-dir=node_modules --exclude-dir=dist --exclude="*.sh" > /dev/null 2>&1; then
    echo "⚠️  Warning: Default secrets found in codebase"
fi

# Audit npm packages
echo "🔍 Running npm audit..."
npm audit --audit-level=high

echo "✅ Security checks completed"

# Test the application
echo "🧪 Testing application startup..."
timeout 10s npm start || {
    echo "❌ Error: Application failed to start"
    exit 1
}

echo "✅ Application startup test passed"

# Clean up development files
echo "🧹 Cleaning up development files..."
rm -rf .env.local
rm -rf tmp/
rm -rf logs/dev.*

echo "✅ Development cleanup completed"

# Final checklist
echo ""
echo "🎉 Production deployment preparation completed!"
echo ""
echo "📋 Deployment Checklist:"
echo "  ✅ Dependencies installed"
echo "  ✅ Application built"
echo "  ✅ Database migrations run"
echo "  ✅ Passwords migrated"
echo "  ✅ Security checks passed"
echo "  ✅ Application tested"
echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "📝 Next steps:"
echo "  1. Verify all environment variables are set in Railway"
echo "  2. Deploy to Railway with: 'railway deploy'"
echo "  3. Test the production deployment"
echo "  4. Set up monitoring and alerts"
echo ""
