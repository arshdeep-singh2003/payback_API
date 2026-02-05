# Local Setup Guide - PayBack Backend

This guide will help you set up the PayBack backend on your local machine for development.

---

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org
   - Verify: `node --version`

2. **PostgreSQL** (v12 or higher)
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Verify: `psql --version`

3. **Git**
   - Download from: https://git-scm.com
   - Verify: `git --version`

4. **Code Editor**
   - VS Code (recommended): https://code.visualstudio.com
   - Or any editor of your choice

5. **API Testing Tool** (Optional but recommended)
   - Postman: https://www.postman.com/downloads/
   - Thunder Client (VS Code extension)
   - Or use curl in terminal

---

## Step 1: Clone or Navigate to Project

If starting fresh (from GitHub):
```bash
git clone https://github.com/yourusername/payback.git
cd payback
```

If already in the project directory:
```bash
cd "C:\Users\jeelp\Documents\Sem_4\Prog2500 Full Stack\Friends\Arshdeep Singh\PayBack"
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- express (web framework)
- pg (PostgreSQL client)
- dotenv (environment variables)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (cross-origin requests)
- express-validator (input validation)
- nodemon (development server - auto-restart)

---

## Step 3: Set Up PostgreSQL Database

### 3.1 Start PostgreSQL Service

**Windows:**
- PostgreSQL should start automatically
- Or use Services app to start it
- Or: `net start postgresql-x64-16` (adjust version)

**Mac:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo service postgresql start
```

### 3.2 Create Database

Open PostgreSQL command line (psql):

**Windows:**
- Start Menu → PostgreSQL → SQL Shell (psql)
- Or: `psql -U postgres`

**Mac/Linux:**
```bash
psql postgres
```

Once in psql, run:
```sql
-- Create database
CREATE DATABASE payback;

-- Connect to database
\c payback

-- Verify connection
SELECT current_database();
```

### 3.3 Load Database Schema

**Option A: From psql shell**
```sql
-- Copy and paste contents of database/schema.sql
-- Or run from file:
\i 'C:/Users/jeelp/Documents/Sem_4/Prog2500 Full Stack/Friends/Arshdeep Singh/PayBack/database/schema.sql'
```

**Option B: From command line**
```bash
# Windows
psql -U postgres -d payback -f "database/schema.sql"

# Mac/Linux
psql -U postgres -d payback -f database/schema.sql
```

### 3.4 Verify Tables Created

In psql:
```sql
-- List all tables
\dt

-- You should see:
-- users
-- iourecords
-- payments

-- View schema of a table
\d users
```

---

## Step 4: Configure Environment Variables

### 4.1 Create .env File

The `.env` file is already created. Open it and update the values:

```env
PORT=3000
NODE_ENV=development

# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/payback

# Generate a secure JWT secret (see below)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
```

### 4.2 Generate JWT Secret

Run this in your terminal to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` in `.env`

### 4.3 Update Database Password

Replace `YOUR_PASSWORD` in `DATABASE_URL` with your PostgreSQL password.

**Don't know your PostgreSQL password?**
- It was set during PostgreSQL installation
- Default user: `postgres`
- To reset password, in psql:
  ```sql
  ALTER USER postgres WITH PASSWORD 'newpassword';
  ```

---

## Step 5: Test Database Connection

Run a quick test:

```bash
node -e "const pool = require('./database/db'); pool.query('SELECT NOW()', (err, res) => { if(err) console.error(err); else console.log('✅ Database connected:', res.rows[0]); pool.end(); });"
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database connected: { now: 2026-02-05T... }
```

---

## Step 6: Start Development Server

### Option A: Regular Start
```bash
npm start
```

### Option B: Development Mode (Auto-restart)
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║                                        ║
║   💰 PayBack API Server Running 💰     ║
║                                        ║
║   Port: 3000                           ║
║   Environment: development             ║
║                                        ║
║   Ready to track IOUs! 🎯              ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## Step 7: Test API Endpoints

### Test Root Endpoint

**In browser:**
Navigate to: http://localhost:3000/

**In terminal:**
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "success": true,
  "message": "PayBack API - Informal Roommate IOU Tracker",
  "version": "1.0.0"
}
```

### Test User Registration

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Using Postman:**
- Method: POST
- URL: http://localhost:3000/api/auth/register
- Headers: Content-Type: application/json
- Body (raw JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

**Save the token!** You'll need it for authenticated requests.

---

## Step 8: Initialize Git Repository

If not already done:

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - PayBack backend setup"

# Create GitHub repository (on GitHub.com)
# Then link and push:
git remote add origin https://github.com/yourusername/payback.git
git branch -M main
git push -u origin main
```

---

## Common Issues & Solutions

### Issue: "Module not found"
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "Port 3000 already in use"
**Solution:**

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Or change PORT in .env to 3001, 3002, etc.

### Issue: "Database connection failed"
**Solution:**
1. Check PostgreSQL is running
2. Verify credentials in .env
3. Test connection manually:
   ```bash
   psql -U postgres -d payback
   ```
4. Check database exists:
   ```sql
   \l
   ```

### Issue: "JWT malformed"
**Solution:**
- Ensure JWT_SECRET is set in .env
- Restart server after changing .env
- Check token format in Authorization header

### Issue: "Cannot POST to endpoint"
**Solution:**
- Verify server is running
- Check URL is correct
- Ensure Content-Type header is set to application/json
- Check request body is valid JSON

---

## Development Workflow

### Making Changes

1. **Create a feature branch:**
```bash
git checkout -b feature/new-feature
```

2. **Make changes to code**

3. **Test your changes**

4. **Commit:**
```bash
git add .
git commit -m "Add new feature: description"
```

5. **Push:**
```bash
git push origin feature/new-feature
```

6. **Merge to main:**
```bash
git checkout main
git merge feature/new-feature
git push origin main
```

### Regular Commits

Make small, frequent commits with descriptive messages:

Good commit messages:
- ✅ "Add user authentication endpoint"
- ✅ "Fix payment validation bug"
- ✅ "Update database schema with indexes"

Bad commit messages:
- ❌ "Update"
- ❌ "Changes"
- ❌ "Stuff"

---

## Project Structure

```
PayBack/
├── database/
│   ├── db.js           # Database connection
│   └── schema.sql      # Database schema
├── docs/
│   ├── API_TESTING.md  # API testing guide
│   ├── DEPLOYMENT.md   # Deployment guide
│   └── SPRINT1_CHECKLIST.md
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── routes/
│   ├── auth.js         # Authentication routes
│   ├── ious.js         # IOU CRUD routes
│   └── payments.js     # Payment routes
├── .env                # Environment variables (DO NOT COMMIT)
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── README.md           # Project documentation
├── server.js           # Main application entry point
└── SUBMISSION.txt      # Submission template
```

---

## Next Steps

1. ✅ Complete local setup
2. ✅ Test all API endpoints
3. ✅ Make regular commits
4. ✅ Deploy to Render (see DEPLOYMENT.md)
5. ✅ Prepare for Sprint Review (see SPRINT1_CHECKLIST.md)

---

## Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Install new dependency
npm install package-name

# Check Node version
node --version

# Check npm version
npm --version

# View PostgreSQL tables
psql -U postgres -d payback -c "\dt"

# View running processes
# Windows
netstat -ano | findstr :3000
# Mac/Linux
lsof -i :3000

# Git status
git status

# Git log
git log --oneline
```

---

## Getting Help

- **Documentation:** Check docs/ folder
- **Instructor:** John Prinz
- **Class Resources:** Course D2L page
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Express Docs:** https://expressjs.com/
- **Node.js Docs:** https://nodejs.org/docs/

---

## Success Checklist

- [ ] Node.js and PostgreSQL installed
- [ ] Dependencies installed (npm install)
- [ ] Database created and schema loaded
- [ ] .env file configured with correct credentials
- [ ] Server starts without errors
- [ ] Root endpoint returns success
- [ ] Can register a new user
- [ ] Can login and receive JWT token
- [ ] Can create an IOU
- [ ] Git repository initialized
- [ ] Made initial commit

**If all boxes are checked, you're ready to develop! 🚀**
