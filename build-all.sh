#!/usr/bin/env bash
# Build script for all-in-one deployment to Render

echo "🚀 Building Med-Lens AI Vault Front-End..."
cd Client
npm install
npm run build

echo "📦 Preparing Clinical Engine Back-End..."
cd ../Server
npm install

echo "✅ Build Complete. Ready for deployment."
