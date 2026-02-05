# 🔧 Troubleshooting Guide

## Common Issues and Solutions

This guide covers the most common problems you might encounter and how to fix them.

---

## 🚫 Installation Issues

### Problem: `npm install` fails
**Error:** "Cannot find module" or "Network error"

**Solutions:**
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete node_modules and try again
rm -rf node_modules
npm install

# 3. Try using --legacy-peer-deps
npm install --legacy-peer-deps

# 4. Check your internet connection
# 5. Try a different network (sometimes corporate/school networks block npm)
```

### Problem: Wrong Node version
**Error:** "Node version not supported"

**Solutions:**
```bash
# Check your version
node --version

# Need Node 18+
# Download from: https://nodejs.org

# After installing, verify
node --version
```

---

## 🗄️ Database Issues

### Problem: "Database connection failed"
**Error:** "ECONNREFUSED" or "authentication failed"

**Solutions:**

1. **Check PostgreSQL is running:**
```bash
# Windows (in Services app)
# Look for "postgresql-x64-16" (or your version)

# Mac
brew services list

# Linux
sudo service postgresql status
```

2. **Verify database exists:**
```bash
psql -U postgres -l
# Should show "payback" in the list
```

3. **Check credentials in .env:**
```env
# Make sure this matches your setup
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/payback
```

4. **Reset PostgreSQL password:**
```sql
# In psql as superuser:
ALTER USER postgres WITH PASSWORD 'newpassword';
```

### Problem: "Table does not exist"
**Error:** "relation users does not exist"

**Solutions:**
```bash
# Load the schema
psql -U postgres -d payback -f database/schema.sql

# Or from psql shell:
\c payback
\i database/schema.sql

# Verify tables created:
\dt
```

### Problem: "Permission denied" on database

**Solutions:**
```sql
-- Grant all privileges to your user
GRANT ALL PRIVILEGES ON DATABASE payback TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

---

## 🔐 Authentication Issues

### Problem: "JWT malformed" or "Invalid token"

**Solutions:**

1. **Check JWT_SECRET is set in .env:**
```env
JWT_SECRET=your_secret_here_at_least_32_characters
```

2. **Restart server after changing .env:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

3. **Check Authorization header format:**
```
Correct:   Authorization: Bearer eyJhbGciOiJIUzI1Ni...
Incorrect: Authorization: eyJhbGciOiJIUzI1Ni...
Incorrect: Bearer eyJhbGciOiJIUzI1Ni...
```

4. **Get a fresh token:**
- Login again
- Copy the new token
- Use it in subsequent requests

### Problem: "Token expired"

**Solutions:**
- Login again to get a new token
- Tokens expire after 7 days (default)
- This is a security feature

### Problem: "Password hash comparison failed"

**Solutions:**
- Make sure you're not comparing plain text passwords
- Re-register the user with correct password
- Check bcryptjs is installed: `npm list bcryptjs`

---

## 🌐 Server Issues

### Problem: "Port 3000 already in use"

**Solutions:**

**Windows:**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

**Or change port in .env:**
```env
PORT=3001
```

### Problem: Server crashes immediately

**Solutions:**

1. **Check for syntax errors:**
```bash
# Look at the error message - it usually tells you the file and line
```

2. **Verify all dependencies installed:**
```bash
npm install
```

3. **Check .env file exists:**
```bash
# Should be in root directory
ls -la .env
```

4. **Run with more verbose logging:**
```bash
NODE_ENV=development npm run dev
```

### Problem: "Cannot find module 'express'" (or other module)

**Solutions:**
```bash
# Install the specific module
npm install express

# Or reinstall all
rm -rf node_modules
npm install
```

---

## 🔄 API Request Issues

### Problem: "Cannot POST /api/auth/register"

**Solutions:**

1. **Check server is running:**
```bash
# You should see the startup message
```

2. **Verify URL is correct:**
```bash
# Correct
http://localhost:3000/api/auth/register

# Incorrect
http://localhost:3000/auth/register
http://localhost:3000/api/register
```

3. **Check Content-Type header:**
```
Must be: Content-Type: application/json
```

4. **Verify request body is valid JSON:**
```json
// Correct
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

// Incorrect (missing comma)
{
  "name": "Test User"
  "email": "test@example.com"
  "password": "password123"
}
```

### Problem: 401 Unauthorized on protected routes

**Solutions:**

1. **Make sure you're logged in:**
- Call login endpoint first
- Get the token from response

2. **Add Authorization header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

3. **Check token isn't expired:**
- Login again if it's been more than 7 days

### Problem: 403 Forbidden

**Solutions:**
- This means you're authenticated but not authorized
- You're trying to access someone else's IOU
- Make sure the IOU belongs to you (as lender or borrower)

### Problem: CORS errors in browser

**Solutions:**
```javascript
// In server.js, make sure CORS is enabled:
const cors = require('cors');
app.use(cors());
```

---

## 📦 Git Issues

### Problem: "Not a git repository"

**Solutions:**
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"
```

### Problem: "Permission denied (publickey)"

**Solutions:**

1. **Use HTTPS instead of SSH:**
```bash
# Use HTTPS URL:
git remote set-url origin https://github.com/username/repo.git
```

2. **Or set up SSH keys:**
```bash
# Generate key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: Settings > SSH Keys
```

### Problem: "Cannot push to GitHub"

**Solutions:**

1. **Pull first:**
```bash
git pull origin main
```

2. **Force push (if you're sure):**
```bash
git push -f origin main
```

3. **Check remote URL:**
```bash
git remote -v
```

---

## 🚀 Deployment Issues (Render)

### Problem: Build fails on Render

**Solutions:**

1. **Check build logs in Render dashboard**

2. **Verify package.json has correct scripts:**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

3. **Make sure all dependencies are in dependencies, not devDependencies:**
```bash
# If you used --save-dev, move to regular dependencies
npm install express pg bcryptjs jsonwebtoken cors express-validator dotenv --save
```

### Problem: Database connection fails on Render

**Solutions:**

1. **Use Internal Database URL, not External:**
- In Render dashboard > Database
- Copy "Internal Database URL"
- Set as DATABASE_URL in web service

2. **Enable SSL for production:**
```javascript
// In database/db.js
ssl: process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : false
```

3. **Check database is in same region as web service**

### Problem: 502 Bad Gateway after deployment

**Solutions:**

1. **Wait 60 seconds:**
- Server might still be starting
- Free tier takes time to spin up

2. **Check logs in Render:**
- Look for "Connected to PostgreSQL"
- Look for "Server Running"

3. **Verify environment variables are set:**
- DATABASE_URL
- JWT_SECRET
- NODE_ENV=production

### Problem: API works locally but not on Render

**Solutions:**

1. **Check environment variables:**
- They might be different from local
- JWT_SECRET must be set
- DATABASE_URL must be Render's URL

2. **Check PORT variable:**
```javascript
// In server.js
const PORT = process.env.PORT || 3000;
```

3. **Look at Render logs for errors**

---

## 🧪 Testing Issues

### Problem: Postman/Thunder Client not working

**Solutions:**

1. **Disable SSL verification in Postman:**
- Settings > General > SSL certificate verification OFF

2. **Check request format:**
```
URL: http://localhost:3000/api/auth/register
Method: POST
Headers: Content-Type: application/json
Body: raw JSON
```

3. **Import collection:**
- Use examples from docs/API_TESTING.md

### Problem: Getting empty responses

**Solutions:**

1. **Check server logs:**
- Look for errors in terminal

2. **Verify endpoint exists:**
```bash
# Test root endpoint first
curl http://localhost:3000/
```

3. **Check request body:**
- Must be valid JSON
- Must match expected format

---

## 💾 Data Issues

### Problem: "Cannot create IOU with yourself"

**Solution:**
- This is correct behavior!
- lender_id must be different from borrower_id
- Use a different user as borrower

### Problem: "Payment exceeds remaining balance"

**Solution:**
- This is correct validation!
- Check remaining balance first
- Amount + previous payments can't exceed IOU amount

### Problem: Cannot delete IOU

**Solutions:**
- IOUs with payments can't be deleted (by design)
- Only lender can delete
- Must have no payment history

---

## 🔍 Debugging Tips

### General Debugging Strategy

1. **Read the error message:**
   - It usually tells you exactly what's wrong
   - Note the file and line number

2. **Check the logs:**
   ```bash
   # Server logs show requests and errors
   # Look for error stack traces
   ```

3. **Test step by step:**
   ```bash
   # 1. Does server start?
   # 2. Does root endpoint work?
   # 3. Does registration work?
   # 4. Does login work?
   # 5. Does protected endpoint work?
   ```

4. **Use console.log:**
   ```javascript
   console.log('Request body:', req.body);
   console.log('User ID:', req.user.userId);
   ```

5. **Test in isolation:**
   - Test database connection separately
   - Test each endpoint separately
   - Test with simple data first

### Useful Debug Commands

```bash
# Check if server is running
curl http://localhost:3000/

# Check database connection
psql -U postgres -d payback -c "SELECT NOW();"

# View database contents
psql -U postgres -d payback -c "SELECT * FROM Users;"

# Check environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET);"

# Verify package.json scripts
npm run

# Check Node version
node --version

# Check npm version
npm --version

# List installed packages
npm list --depth=0
```

---

## 📞 When to Ask for Help

Ask for help if:
- You've tried the solutions above
- Error persists after 30+ minutes
- You don't understand the error message
- Data corruption/loss concerns
- Security concerns

**How to Ask:**
1. Describe what you're trying to do
2. Show the exact error message
3. Show what you've already tried
4. Include relevant code snippets

---

## ✅ Prevention Checklist

Avoid issues by:
- [ ] Always test locally before deploying
- [ ] Keep .env out of git (.gitignore)
- [ ] Commit often with good messages
- [ ] Read error messages carefully
- [ ] Keep documentation updated
- [ ] Use version control (git)
- [ ] Backup your database regularly
- [ ] Test after each change
- [ ] Keep dependencies updated
- [ ] Follow the guides step-by-step

---

## 🎯 Still Stuck?

1. **Re-read the relevant guide:**
   - docs/LOCAL_SETUP.md for setup issues
   - docs/DEPLOYMENT.md for Render issues
   - docs/API_TESTING.md for testing issues

2. **Check documentation:**
   - Express: https://expressjs.com
   - PostgreSQL: https://postgresql.org/docs
   - Render: https://render.com/docs

3. **Ask instructor:**
   - John Prinz
   - Office hours
   - Class Discord/Forum

4. **Use your resources:**
   - Classmates
   - StackOverflow (for specific errors)
   - Course materials

---

## 🚀 Remember

- Most issues have simple solutions
- Error messages are your friend
- Take breaks when frustrated
- Document what worked
- You can do this! 💪

**The guides have everything you need. Trust the process! 🌟**
