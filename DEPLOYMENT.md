# Deployment Guide - The Australian Mouthpiece Exchange

## Overview
This guide will help you deploy your React + Node.js application to production.

## Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free)
- PostgreSQL database (Railway or external)

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Environment Variables
You'll need to set these environment variables in your deployment platforms:

#### Backend Environment Variables (Railway)
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.vercel.app
EMAIL_FROM=your-email@domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend Environment Variables (Vercel)
```
VITE_API_URL=https://your-backend-domain.railway.app
```

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 2.2 Deploy Backend
1. In Railway dashboard, click "Deploy from GitHub repo"
2. Select your repository
3. Set the root directory to `/backend`
4. Add environment variables (see above)
5. Deploy

### 2.3 Set Up Database
1. In Railway, add a PostgreSQL service
2. Copy the DATABASE_URL to your backend environment variables
3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### 3.2 Configure Frontend
1. Set root directory to `/frontend`
2. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
3. Deploy

## Step 4: Update API Configuration

### 4.1 Update Frontend API URL
In `frontend/src/api/axios.js`, ensure the base URL points to your production backend:
```javascript
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

### 4.2 Update CORS Settings
In `backend/app.js`, update CORS to allow your frontend domain:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Step 5: Test Your Deployment

### 5.1 Test Backend
Visit: `https://your-backend-domain.railway.app/`
Should show: `{"message":"The Australian Mouthpiece Exchange API is running."}`

### 5.2 Test Frontend
Visit your Vercel URL and test:
- User registration
- User login
- Creating listings
- Messaging functionality

## Step 6: Domain Setup (Optional)

### 6.1 Custom Domain
- **Vercel**: Add custom domain in project settings
- **Railway**: Add custom domain in service settings

### 6.2 SSL Certificates
Both Vercel and Railway provide automatic SSL certificates.

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure FRONTEND_URL is set correctly in backend
   - Check that CORS is configured properly

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Ensure database is accessible from Railway

3. **Environment Variables**
   - Double-check all environment variables are set
   - Restart services after changing environment variables

4. **Build Errors**
   - Check build logs in deployment platform
   - Ensure all dependencies are in package.json

### Useful Commands

```bash
# Check backend logs
railway logs

# Check frontend build
vercel logs

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Monitoring

### Railway Monitoring
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts for downtime

### Vercel Analytics
- Enable Vercel Analytics for frontend monitoring
- Monitor performance and errors

## Security Checklist

- [ ] JWT_SECRET is a strong, random string
- [ ] DATABASE_URL is secure and not exposed
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] Database migrations are applied
- [ ] SSL certificates are active
- [ ] Error logging is configured

## Support

If you encounter issues:
1. Check the deployment platform logs
2. Verify environment variables
3. Test locally with production environment variables
4. Check the troubleshooting section above

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure backup strategies
3. Set up CI/CD pipelines
4. Consider scaling options
5. Implement analytics and tracking 