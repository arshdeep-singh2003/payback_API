# Render.com Deployment Guide

This guide walks you through deploying your PayBack backend to Render.com with a PostgreSQL database.

---

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Code pushed to GitHub** - Ensure all your code is committed and pushed

---

## Part 1: Create PostgreSQL Database on Render

### Step 1: Log into Render Dashboard
- Go to [dashboard.render.com](https://dashboard.render.com)
- Click "New +" button in top right
- Select "PostgreSQL"

### Step 2: Configure Database
Fill in the following:

- **Name**: `payback-db` (or any name you prefer)
- **Database**: `payback` (database name)
- **User**: Auto-generated (keep default)
- **Region**: Choose closest to you (e.g., Oregon)
- **PostgreSQL Version**: 16 (or latest)
- **Plan**: Free tier

Click **"Create Database"**

### Step 3: Get Database Connection String
After creation:
1. Click on your new database
2. Scroll to **"Connections"** section
3. Copy the **"Internal Database URL"**
   - It looks like: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/payback`
4. **SAVE THIS** - you'll need it for the web service

### Step 4: Initialize Database Schema
1. In Render dashboard, go to your database
2. Click **"Connect"** button and select **"External Connection"**
3. Use a PostgreSQL client (pgAdmin, DBeaver, or command line):

```bash
psql postgresql://your-external-connection-string
```

4. Copy the contents of `database/schema.sql` and paste/run it in the SQL console

**OR** use Render's built-in shell:
- Click "Shell" tab in your database dashboard
- Paste the schema SQL and execute

---

## Part 2: Deploy Web Service on Render

### Step 1: Create New Web Service
- In Render Dashboard, click "New +" → "Web Service"
- Connect your GitHub repository
- Select your PayBack repository

### Step 2: Configure Web Service

Fill in the settings:

**Basic Settings:**
- **Name**: `payback-api` (or your preferred name)
- **Region**: Same as database (e.g., Oregon)
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave blank (unless your code is in a subfolder)
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **Free tier**

### Step 3: Add Environment Variables

Scroll down to **"Environment Variables"** section and add:

1. **DATABASE_URL**
   - Value: Paste the **Internal Database URL** from Part 1, Step 3
   - Example: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/payback`

2. **JWT_SECRET**
   - Value: Create a strong secret (32+ random characters)
   - Example: `my_super_secure_jwt_secret_key_2026_change_this_in_production`
   - You can generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **NODE_ENV**
   - Value: `production`

4. **PORT** (Optional - Render sets this automatically)
   - Value: `3000`

### Step 4: Deploy

Click **"Create Web Service"**

Render will:
1. Clone your repository
2. Run `npm install`
3. Start your server with `npm start`
4. Assign you a public URL

**Your deployment URL will be:**
`https://payback-api.onrender.com` (or similar)

---

## Part 3: Verify Deployment

### Check Deployment Status
1. Watch the logs in Render dashboard
2. Look for success messages:
   ```
   ✅ Connected to PostgreSQL database
   💰 PayBack API Server Running 💰
   ```

### Test Your API

1. **Test Root Endpoint:**
```bash
curl https://your-app-name.onrender.com/
```

Expected response:
```json
{
  "success": true,
  "message": "PayBack API - Informal Roommate IOU Tracker",
  "version": "1.0.0"
}
```

2. **Test User Registration:**
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

3. **Test in Browser:**
Navigate to: `https://your-app-name.onrender.com/`

---

## Part 4: Update Your Local .env File

Create/update your `.env` file:

```env
# Local Development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/payback_local
JWT_SECRET=your_local_jwt_secret
NODE_ENV=development

# Production (for reference - DON'T commit this)
# DATABASE_URL=postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com/payback
# JWT_SECRET=your_production_jwt_secret
# NODE_ENV=production
```

---

## Important Notes

### Free Tier Limitations
- Database: 256 MB storage, 1GB data transfer/month
- Web Service: 750 hours/month, spins down after 15 min of inactivity
- **First request after spin-down takes 30-60 seconds** (this is normal)

### Security Best Practices
1. **NEVER commit `.env` file** to GitHub
2. **Use strong JWT secrets** (32+ random characters)
3. **Different secrets** for development and production
4. **Keep database URLs private**

### Troubleshooting

#### Database Connection Failed
- Verify Internal Database URL is correct
- Check if database is active in Render dashboard
- Ensure SSL is enabled in `database/db.js` for production

#### Build Failed
- Check logs in Render dashboard
- Ensure `package.json` has correct start script
- Verify all dependencies are in `package.json` (not just devDependencies)

#### 502 Bad Gateway
- Server might still be starting (wait 60 seconds)
- Check logs for errors
- Verify PORT environment variable

#### App Spins Down (Free Tier)
- This is expected behavior
- First request wakes it up (30-60 sec delay)
- Consider Render's paid tier for always-on service

---

## Keeping Your Service Active

Free tier services spin down after 15 minutes of inactivity. To keep it alive:

1. **Use a Cron Job Service:**
   - [cron-job.org](https://cron-job.org)
   - Ping your API every 10 minutes

2. **Set up UptimeRobot:**
   - [uptimerobot.com](https://uptimerobot.com)
   - Monitor and ping your service

---

## Updating Your Deployment

When you make changes:

1. **Commit and push to GitHub:**
```bash
git add .
git commit -m "Update feature"
git push origin main
```

2. **Render auto-deploys** on every push to main branch
3. Watch deployment logs in Render dashboard
4. Test after deployment completes

---

## Custom Domain (Optional)

To add a custom domain:

1. Go to your web service in Render
2. Click "Settings" tab
3. Scroll to "Custom Domain"
4. Add your domain
5. Follow DNS configuration instructions

---

## Monitoring

### View Logs
- Render Dashboard → Your Service → Logs tab
- Real-time logs of your application

### Check Metrics
- Render Dashboard → Your Service → Metrics tab
- CPU, Memory, Request stats

---

## Cost Estimate

**Free Tier (Current Setup):**
- Database: Free (256 MB)
- Web Service: Free (750 hours/month)
- Total: **$0/month**

**If You Need More:**
- Database Starter: $7/month (1 GB)
- Web Service Starter: $7/month (always-on)
- Total: **$14/month**

---

## Submission Checklist

For your Sprint 1 submission:

- [ ] Database created and schema loaded
- [ ] Web service deployed successfully
- [ ] Environment variables configured
- [ ] All API endpoints tested and working
- [ ] GitHub repository shows regular commits
- [ ] README.md includes production URL
- [ ] `.env` file NOT committed to GitHub
- [ ] Can demo working API in class

---

## Getting Help

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **PostgreSQL Docs**: [postgresql.org/docs](https://www.postgresql.org/docs/)
- **Class Discord/Forum**: Ask your instructor or classmates

---

## Your Deployment URLs

After deployment, document these:

```
Production API: https://payback-api-xxxx.onrender.com
Database: dpg-xxxxx-a.oregon-postgres.render.com
GitHub Repo: https://github.com/yourusername/payback
```

**Add these to your README.md for easy reference!**
