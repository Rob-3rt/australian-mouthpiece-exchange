#!/bin/bash

echo "🚀 Starting deployment process for The Australian Mouthpiece Exchange..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    exit 1
fi

echo "✅ Git repository is clean"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "🎉 Repository pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to Railway.app and create a new project"
echo "2. Connect your GitHub repository"
echo "3. Set root directory to '/backend'"
echo "4. Add environment variables (see DEPLOYMENT.md)"
echo "5. Add a PostgreSQL service"
echo "6. Deploy to Railway"
echo ""
echo "7. Go to Vercel.com and import your repository"
echo "8. Set root directory to '/frontend'"
echo "9. Add VITE_API_URL environment variable"
echo "10. Deploy to Vercel"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔗 Useful links:"
echo "   Railway: https://railway.app"
echo "   Vercel: https://vercel.com"
echo "   Deployment Guide: DEPLOYMENT.md" 