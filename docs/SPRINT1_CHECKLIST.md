# Sprint 1 Submission Checklist

## Student Information
- **Name:** Arshdeep Singh
- **Student Number:** 9042880
- **Course:** PROG2500 - Open-Source Full Stack Development
- **Professor:** John Prinz
- **Sprint:** Sprint 1 (Backend)

---

## Pre-Submission Checklist

### 1. Code Completion ✓
- [ ] All Workshop 2 & 3 milestones completed
- [ ] Node.js and Express setup complete
- [ ] PostgreSQL database schema implemented
- [ ] All API endpoints functional (Auth, IOUs, Payments)
- [ ] JWT authentication working
- [ ] Password hashing implemented
- [ ] Input validation present
- [ ] Error handling implemented

### 2. Database ✓
- [ ] PostgreSQL database created
- [ ] Schema.sql file present and tested
- [ ] All 3 tables created (Users, IOURecords, Payments)
- [ ] Indexes added for performance
- [ ] Foreign key constraints working
- [ ] Sample data tested (optional but recommended)

### 3. API Testing ✓
- [ ] All endpoints tested with Postman/Thunder Client
- [ ] User registration works
- [ ] User login returns JWT token
- [ ] Protected routes require authentication
- [ ] CRUD operations work for IOUs
- [ ] Payment recording works
- [ ] Payment history retrieves correctly
- [ ] Authorization checks prevent unauthorized access
- [ ] Error responses are appropriate

### 4. GitHub Repository ✓
- [ ] Repository created on GitHub
- [ ] Initial commit made
- [ ] Regular commits throughout development (NOT one big commit)
- [ ] Descriptive commit messages
- [ ] .gitignore file present
- [ ] .env file NOT committed
- [ ] README.md complete with:
  - [ ] Project description
  - [ ] Installation instructions
  - [ ] API documentation
  - [ ] Deployment URL (after deployment)

### 5. Deployment ✓
- [ ] Render.com account created
- [ ] PostgreSQL database created on Render
- [ ] Database schema loaded
- [ ] Environment variables configured:
  - [ ] DATABASE_URL (Internal URL from Render)
  - [ ] JWT_SECRET (strong, random)
  - [ ] NODE_ENV=production
- [ ] Web service deployed successfully
- [ ] Deployment logs show no errors
- [ ] API accessible at public URL
- [ ] Root endpoint (`/`) returns success
- [ ] Test registration/login working on production

### 6. Documentation ✓
- [ ] README.md is clear and professional
- [ ] API_TESTING.md includes all test examples
- [ ] DEPLOYMENT.md has step-by-step instructions
- [ ] Comments in code explain complex logic
- [ ] Environment variables documented in .env.example

### 7. Sprint Review Preparation ✓
- [ ] Code runs locally without errors
- [ ] Can explain how authentication works
- [ ] Can show where routes are defined
- [ ] Can demonstrate API in browser/Postman
- [ ] Know location of key files:
  - [ ] server.js
  - [ ] database/db.js
  - [ ] routes/auth.js
  - [ ] routes/ious.js
  - [ ] routes/payments.js
  - [ ] middleware/auth.js

---

## Submission Steps

### Day Before Sprint Review
1. **Final Code Check:**
   ```bash
   # Pull latest changes
   git pull origin main
   
   # Test locally
   npm install
   npm start
   
   # Verify all endpoints work
   ```

2. **Verify Deployment:**
   - Visit your Render URL
   - Test at least 2 endpoints
   - Check logs for errors

3. **Prepare Demo:**
   - Have Postman/Thunder Client ready
   - Have GitHub repository open
   - Have code editor open to project
   - Know your Render URL

### On Sprint Review Day (Dev Day)

1. **Arrive Early:**
   - Boot up computer
   - Open all necessary tools:
     - VS Code with project open
     - Browser with Render dashboard
     - Postman/Thunder Client
     - GitHub repository

2. **When Instructor Arrives:**
   - Show deployed API (browser)
   - Demonstrate working endpoint (Postman)
   - Answer technical questions
   - Show GitHub commit history

3. **Be Ready to Show:**
   - Where routes are defined
   - How authentication middleware works
   - Database schema
   - Environment variables setup (without showing secrets)

4. **After Demo:**
   - Create a text file with your GitHub URL
   - Submit to D2L assignment folder
   - Format: `github_url.txt`
   ```
   GitHub Repository: https://github.com/yourusername/payback
   Deployed API: https://payback-api-xxxx.onrender.com
   Student Name: Arshdeep Singh
   Student Number: 9042880
   ```

---

## Technical Questions You Might Be Asked

Prepare to answer:

1. **"Show me where you defined your routes."**
   - Open `routes/ious.js` or `routes/auth.js`
   - Point to route definitions

2. **"How does JWT authentication work in your app?"**
   - Explain: Login → Generate token → Send to client → Client sends in header → Middleware verifies
   - Show `middleware/auth.js`

3. **"What database are you using and how do you connect?"**
   - PostgreSQL
   - Show `database/db.js` connection pool

4. **"How do you prevent users from accessing each other's IOUs?"**
   - Show authorization check in routes
   - Example: Check if `req.user.userId` matches `lender_id` or `borrower_id`

5. **"Where is your environment configuration?"**
   - `.env` file (don't show actual secrets)
   - Show `.env.example`

6. **"How do you calculate remaining balance?"**
   - Show SQL query in `routes/ious.js`
   - Explain: `amount - SUM(payment_amount)`

---

## Grading Criteria Alignment

### Deployment & Integrity (10 points)
- ✓ Deployed to live URL (Render)
- ✓ Regular commits throughout development
- ✓ Descriptive commit messages

### Sprint Completion (40 points)
- ✓ All Workshop 2 & 3 milestones complete
- ✓ Node.js + Express setup
- ✓ PostgreSQL database
- ✓ All CRUD endpoints functional
- ✓ JWT authentication
- ✓ Code runs without errors

### Technical Understanding (30 points)
- ✓ Can navigate own code
- ✓ Can explain how it works
- ✓ Can answer technical questions
- ✓ Understands REST API concepts
- ✓ Understands authentication flow

### Lab Participation (20 points)
- ✓ Attended workshops (if applicable)
- ✓ Ready to demo during Sprint Review
- ✓ Present on Dev Day

---

## Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:**
- Check DATABASE_URL in Render environment variables
- Ensure using Internal URL, not External
- Verify SSL configuration in `database/db.js`

### Issue: "Token invalid"
**Solution:**
- Verify JWT_SECRET is set
- Check token is sent in Authorization header
- Ensure header format: `Bearer <token>`

### Issue: "Port already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Cannot POST /api/auth/register"
**Solution:**
- Check if server is running
- Verify route is registered in `server.js`
- Check Content-Type header is `application/json`

---

## Final Checks Before Submission

**5 Minutes Before Demo:**
- [ ] Server running locally
- [ ] Render deployment active
- [ ] Postman/Thunder Client ready with test requests
- [ ] GitHub repository open
- [ ] Know your GitHub URL
- [ ] Know your Render URL
- [ ] Confident in explaining code

**During Demo:**
- [ ] Stay calm
- [ ] Speak clearly
- [ ] Navigate confidently through code
- [ ] Answer questions honestly (it's okay to say "let me check")

**After Demo:**
- [ ] Submit GitHub URL to D2L
- [ ] Thank the instructor
- [ ] Celebrate completing Sprint 1! 🎉

---

## Contact Information

If you have issues before the demo:

- **Instructor:** John Prinz
- **Course:** PROG2500-26W-Sec1
- **Email:** [Check course outline]
- **Office Hours:** [Check course schedule]

---

## Additional Resources

- **Render Documentation:** https://render.com/docs
- **Express.js Docs:** https://expressjs.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **JWT.io:** https://jwt.io
- **REST API Best Practices:** https://restfulapi.net

---

## Confidence Builder

You've built:
- ✅ A complete RESTful API
- ✅ Secure authentication system
- ✅ Database with proper relationships
- ✅ Production-ready deployment
- ✅ Professional documentation

**You're ready for this demo! Good luck! 🚀**
