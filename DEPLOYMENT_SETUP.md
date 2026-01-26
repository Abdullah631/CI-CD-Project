# Deployment Setup Guide - Render Auto-Deploy

## Current Status
- ✅ Backend: Deployed at https://remotehire-io-1.onrender.com
- ❌ Frontend: Not deployed yet
- ❌ Auto-deploy: Not configured

## Setup Auto-Deployment on Render

### 1. Backend Auto-Deploy
1. Go to https://dashboard.render.com
2. Find your backend service (remotehire-io-1)
3. Click **Settings** → **Build & Deploy**
4. Enable **Auto-Deploy**: Yes
5. Branch: `main`
6. Now every push to `main` will auto-deploy backend! ✅

### 2. Deploy Frontend to Render

#### Create New Web Service
1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect GitHub repo: `RemoteHire.io`
4. Configure:
   ```
   Name: remotehire-frontend
   Root Directory: remotehire-frontend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

#### Environment Variables (Frontend)
```
VITE_API_URL=https://remotehire-io-1.onrender.com
NODE_ENV=production
```

#### Enable Auto-Deploy
- Auto-Deploy: **Yes**
- Branch: `main`

### 3. Update CORS Settings

After getting frontend URL (e.g., `https://remotehire-frontend.onrender.com`):

1. Add to backend environment variables on Render:
   ```
   ALLOWED_HOSTS=remotehire-io-1.onrender.com,remotehire-frontend.onrender.com
   CORS_ALLOWED_ORIGINS=https://remotehire-frontend.onrender.com
   ```

2. Or update `backend/settings.py` and push:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'https://remotehire-frontend.onrender.com',  # Add your actual URL
       'http://localhost:5173',
   ]
   ```

---

## Alternative: Vercel (Frontend Only)

### Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import GitHub repo: `RemoteHire.io`
4. Configure:
   ```
   Framework: Vite
   Root Directory: remotehire-frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. Environment Variables:
   ```
   VITE_API_URL=https://remotehire-io-1.onrender.com
   ```

6. Click **Deploy**

### Enable Auto-Deploy
✅ Vercel automatically deploys on push to `main` branch!

### After Deployment

1. Get your Vercel URL (e.g., `remotehire-io.vercel.app`)
2. Update backend CORS (see above)
3. Update frontend config.js if needed

---

## Recommended Approach

**Option A: Both on Render**
- ✅ Free tier for both
- ✅ Simple configuration
- ✅ Same platform
- ❌ Slower cold starts

**Option B: Backend (Render) + Frontend (Vercel)**
- ✅ Vercel: Faster frontend, better CDN
- ✅ Render: Backend stays same
- ✅ Both have free tiers
- ❌ Two platforms to manage

---

## After Setup Checklist

- [ ] Backend auto-deploys from GitHub ✅
- [ ] Frontend auto-deploys from GitHub ✅
- [ ] CORS configured with production URLs
- [ ] Frontend API config points to live backend
- [ ] OAuth redirect URLs updated (Google, GitHub, LinkedIn)
- [ ] Database accessible from Render (Supabase already configured ✅)
- [ ] AWS S3 credentials in Render environment variables
- [ ] Test live deployment end-to-end

---

## Current Configuration Summary

### Frontend Config (Already Updated ✅)
- Automatically detects environment
- Local: `http://127.0.0.1:8000`
- Render: `https://remotehire-io-1.onrender.com`
- Works seamlessly in both environments

### Backend CORS (Already Updated ✅)
- Includes Render backend URL
- Ready for frontend deployment
- Set to allow all origins in DEBUG mode only

### GitHub Actions (Already Configured ✅)
- Backend CI/CD pipeline
- Frontend CI/CD pipeline
- Integration tests
- Security scanning
- Docker builds

---

## Quick Deploy Commands

No commands needed! Just:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update frontend config for production"
   git push origin main
   ```

2. **Enable Auto-Deploy** on Render/Vercel dashboard (one-time setup)

3. **Done!** Every future push auto-deploys ✅
