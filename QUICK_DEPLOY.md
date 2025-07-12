# Quick Deployment Guide

## 🚀 Get Your Site Live in 10 Minutes

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `/backend`
6. Add these environment variables:
   ```
   JWT_SECRET=your-super-secret-key-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
7. Add a PostgreSQL service
8. Copy the DATABASE_URL to your environment variables
9. Deploy

### Step 3: Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Set root directory to `/frontend`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```
6. Deploy

### Step 4: Test
- Visit your Vercel URL
- Try registering a new user
- Test the main features

## 🔧 Environment Variables Checklist

### Backend (Railway)
- [ ] `DATABASE_URL` (from Railway PostgreSQL)
- [ ] `JWT_SECRET` (random string)
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `FRONTEND_URL` (your Vercel URL)

### Frontend (Vercel)
- [ ] `VITE_API_URL` (your Railway backend URL)

## 🆘 Need Help?
- Check `DEPLOYMENT.md` for detailed instructions
- Look at deployment platform logs for errors
- Ensure all environment variables are set correctly

## 💰 Cost
- **Vercel**: Free tier (generous)
- **Railway**: Free tier (limited, but sufficient for testing)
- **Total**: $0 to start!

## 🎯 Next Steps
1. Test all features
2. Set up custom domain (optional)
3. Configure monitoring
4. Set up backups 