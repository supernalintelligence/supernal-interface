#!/bin/bash

# Pre-push hook for @supernal-interface/core
# This script runs comprehensive checks before allowing a push

set -e

echo "🔍 Running pre-push checks for @supernal-interface/core..."

# Change to core directory
cd "$(dirname "$0")/../core"

echo "📦 Installing dependencies..."
npm ci --silent

echo "🔍 Running ESLint..."
npm run lint

echo "🔧 Running TypeScript check..."
npx tsc --noEmit

echo "🧪 Running tests..."
npm run test

echo "🏗️  Building package..."
npm run build

echo "📋 Verifying build artifacts..."
if [ ! -d "dist" ]; then
    echo "❌ Build artifacts missing"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ Main build file missing"
    exit 1
fi

echo "🎯 Building demo..."
cd demo
npm ci --silent
npm run build

echo "✅ All pre-push checks passed!"
echo "🚀 Ready to push to repository"
