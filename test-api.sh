#!/bin/bash

# API Testing Script
# Run this to test if APIs are working

echo "🔍 Testing MigrateRight APIs..."
echo ""

# Check if backend is running
echo "1️⃣ Testing Backend Health..."
curl -s http://localhost:5000/api/health | head -5
echo ""
echo ""

# Test Country Guides API
echo "2️⃣ Testing Country Guides API..."
echo "GET /api/country-guides"
curl -s http://localhost:5000/api/country-guides | head -20
echo ""
echo ""

# Test Calculator Countries API
echo "3️⃣ Testing Calculator Countries API..."
echo "GET /api/calculator/countries"
curl -s http://localhost:5000/api/calculator/countries | head -20
echo ""
echo ""

# Test Regions API
echo "4️⃣ Testing Regions API..."
echo "GET /api/country-guides/meta/regions"
curl -s http://localhost:5000/api/country-guides/meta/regions | head -10
echo ""
echo ""

echo "✅ Testing complete!"
echo ""
echo "If you see empty arrays [], you need to seed the database:"
echo "  node backend/utils/seedCountryGuides.js"
echo "  node backend/scripts/seedFeeRules.js"

