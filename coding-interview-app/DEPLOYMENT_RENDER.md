# Deploy to Render.com - Quick Guide

## Prerequisites
- GitHub account (to push your code)
- Render.com account (free) - Sign up at https://render.com

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
cd /workspaces/AI_Dev_Tools_Zoomcamp/coding-interview-app

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Coding Interview App"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/coding-interview-app.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy on Render.com

#### Option A: Automatic Deployment (Recommended)

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and deploy automatically
5. Done! Your app will be live in ~5 minutes

#### Option B: Manual Deployment

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: coding-interview-app
   - **Environment**: Docker
   - **Plan**: Free
   - **Docker Command**: (leave empty, uses Dockerfile CMD)
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
6. Click **"Create Web Service"**

### 3. Access Your App

After deployment (5-10 minutes):
- Your app will be available at: `https://coding-interview-app.onrender.com`
- Render provides HTTPS automatically
- Free tier includes:
  - 750 hours/month
  - Automatic HTTPS/SSL
  - Custom domains (optional)

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds to wake up
- 750 hours/month (enough for testing/demos)

### Environment Variables on Render
The app will automatically work because:
- Frontend and backend are in the same container
- Ports 3000 and 5000 are both exposed
- Render will use the main exposed port (3000)

### Custom Domain (Optional)
1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify Dockerfile is correct
- Ensure all dependencies are listed

### App Not Responding
- Check service logs
- Verify health check endpoint (`/health`)
- Ensure ports are correctly exposed

### WebSocket Issues
If real-time features don't work:
1. Go to service settings
2. Add environment variable:
   - `WS_ORIGINS` = `*`

## Alternative: Railway.app

If Render doesn't work, try Railway.app:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up

# Your app will be deployed automatically
```

## Cost Estimate

### Render.com Free Tier
- **Cost**: $0/month
- **Good for**: Development, demos, small projects
- **Limitation**: Spins down after 15 min inactivity

### Render.com Paid Tier
- **Cost**: $7/month
- **Benefits**: Always on, better performance
- **Good for**: Production use

## Next Steps After Deployment

1. Test your deployed app
2. Share the URL with others
3. Monitor logs in Render dashboard
4. Consider upgrading to paid tier for production

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Your app logs: Check Render dashboard → Logs tab
