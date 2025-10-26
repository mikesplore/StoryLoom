# StoryLoom - Railway GitHub Deployment Guide

## Automatic Deployment from GitHub

Railway can automatically deploy your app directly from your GitHub repository. Every time you push to GitHub, Railway will rebuild and redeploy automatically!

## Prerequisites

- GitHub account with your StoryLoom repository
- Railway account (sign up at https://railway.app/)

## Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project from GitHub

1. Go to [Railway](https://railway.app/)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authenticate with GitHub if needed
5. Select your repository: **`mikesplore/StoryLoom`**
6. Railway will detect your project structure

### Step 3: Configure Services

Railway should auto-detect both services:

#### **Backend Service:**
- **Root Directory**: `/backend`
- **Build Command**: (automatic - Python detected)
- **Start Command**: `python app.py`
- **Port**: Railway will auto-detect port 5000

#### **Frontend Service:**
- **Root Directory**: `/frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview`
- **Port**: Railway will auto-detect port 4173

### Step 4: Add Environment Variables

Click on the **Backend** service and add environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
HUGGING_FACE_TOKEN=your_hugging_face_token_here
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///storyloom.db
FLASK_ENV=production
```

For the **Frontend** service, add:

```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

**Note**: You'll get the backend URL after the backend deploys. Update the frontend env var with it.

### Step 5: Deploy

1. Click **"Deploy"** on both services
2. Wait for Railway to build and deploy (3-5 minutes)
3. Railway will provide public URLs for both services

### Step 6: Update Frontend API URL

1. Copy the backend service URL (e.g., `https://storyloom-backend.railway.app`)
2. Go to frontend service → Environment Variables
3. Update `VITE_API_URL` to: `https://your-backend-url.railway.app/api`
4. Redeploy the frontend

## Automatic Deployments

Once set up:
- ✅ Push to `main` branch → Railway auto-deploys
- ✅ Pull requests → Railway creates preview deployments
- ✅ Rollback → Use Railway dashboard to rollback to any previous deployment

## Project Structure for Railway

```
StoryLoom/
├── frontend/           # React + Vite app
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── backend/            # Flask API
│   ├── requirements.txt
│   ├── app.py
│   └── ai_providers.py
└── README.md
```

## Alternative: Single Nixpacks Build

If you want Railway to build everything as one service:

1. Create a `railway.toml` in the root:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd backend && python app.py"
```

2. Set root directory to `/` instead of `/backend` or `/frontend`

## Troubleshooting

### Backend not starting?
- Check that `requirements.txt` is in `/backend`
- Verify environment variables are set
- Check Railway logs for Python errors

### Frontend not connecting to backend?
- Make sure `VITE_API_URL` points to the backend Railway URL
- Backend must have CORS enabled (already configured in your Flask app)
- Check browser console for API errors

### Database issues?
- SQLite works for development but not recommended for production
- Consider using Railway's PostgreSQL addon:
  1. Click "New" → "Database" → "PostgreSQL"
  2. Railway will auto-inject `DATABASE_URL`
  3. Update your Flask app to use PostgreSQL instead of SQLite

## Custom Domain (Optional)

To add a custom domain:
1. Go to service Settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Monitoring

- **Logs**: Click on service → "Logs" tab
- **Metrics**: View CPU, RAM, and network usage
- **Deployments**: See deployment history and rollback if needed

## Cost

Railway's pricing (as of 2025):
- **Free Trial**: $5 credit or 30 days
- **Hobby Plan**: $5/month + usage-based pricing
- **Pro Plan**: $20/month + usage-based pricing

Your app should fit comfortably in the Hobby plan (~$5-10/month).

## Updating Your App

Just push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will automatically detect the push and redeploy!

## Support

- Railway Docs: https://docs.railway.app/
- GitHub: https://github.com/mikesplore/StoryLoom
- Issues: Report bugs in the GitHub repository
