#!/bin/bash

# WakeExer Local Development Startup Script

echo "🚀 Starting WakeExer Local Development Server..."
echo ""

# Set environment variables for local development
export PORT=3000
export USE_DATABASE=false
export NODE_ENV=development

# Kill any existing tsx processes
pkill -f tsx 2>/dev/null || true

echo "✅ Environment configured:"
echo "   - Port: $PORT"
echo "   - Storage: File-based (no database required)"
echo "   - Environment: $NODE_ENV"
echo ""

echo "📦 Starting server..."
echo "   Navigate to: http://localhost:3000"
echo ""
echo "🔗 Available portals:"
echo "   - Patient Portal: http://localhost:3000"
echo "   - Admin Portal: http://localhost:3000/admin"
echo "   - Clinical Dashboard: http://localhost:3000/clinical"
echo ""

# Start the development server
npx tsx server/index.ts
