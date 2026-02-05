# PayBack - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

---

## 📡 API Endpoints

### Base URL
- Local: `http://localhost:3000`
- Production: `https://your-app.onrender.com`

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### IOUs (Protected - Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ious` | List user's IOUs |
| GET | `/api/ious/:id` | Get IOU details |
| POST | `/api/ious` | Create new IOU |
| PATCH | `/api/ious/:id` | Update IOU status |
| DELETE | `/api/ious/:id` | Delete IOU |

### Payments (Protected - Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Record payment |
| GET | `/api/payments?iou_id=:id` | Get payments for IOU |

---

## 🔐 Authentication

### Register/Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### Using Token in Requests
Add header to all protected endpoints:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 📝 Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Create IOU
```bash
POST /api/ious
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "borrower_id": 2,
  "amount": 25.50,
  "reason": "Lunch at restaurant"
}
```

### Record Payment
```bash
POST /api/payments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "iou_id": 1,
  "payment_amount": 10.00
}
```

---

## 🗄️ Database Schema

### Users
```sql
user_id (PK), name, email (UNIQUE), password_hash, created_at
```

### IOURecords
```sql
iou_id (PK), lender_id (FK), borrower_id (FK), 
amount, reason, status, created_at
```

### Payments
```sql
payment_id (PK), iou_id (FK), payment_amount, payment_date
```

---

## 🔧 Environment Variables

### .env Template
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/payback
JWT_SECRET=your_32_character_secret_here
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Common Errors

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Database connection failed"
1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Ensure database exists: `psql -U postgres -l`

### "Token invalid"
1. Check JWT_SECRET is set
2. Verify Authorization header format
3. Ensure token isn't expired

---

## 📦 Project Structure

```
PayBack/
├── database/          # DB connection & schema
├── docs/              # Documentation
├── middleware/        # Auth middleware
├── routes/            # API endpoints
├── .env               # Environment variables
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies
├── README.md          # Main documentation
└── server.js          # Application entry
```

---

## 🧪 Testing Flow

1. **Register** a user
2. **Login** and save token
3. **Create** an IOU
4. **Get** all IOUs
5. **Record** a payment
6. **Get** payment history
7. **Update** IOU status
8. **Delete** IOU (if allowed)

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

---

## 🚀 Deployment Checklist

- [ ] Code committed to GitHub
- [ ] Regular commit history
- [ ] PostgreSQL database created on Render
- [ ] Schema loaded into database
- [ ] Environment variables set
- [ ] Web service deployed
- [ ] API accessible at public URL
- [ ] All endpoints tested

---

## 🎯 Sprint 1 Deliverables

### Must Have
✅ Node.js + Express setup
✅ PostgreSQL database
✅ User authentication (JWT)
✅ IOU CRUD operations
✅ Payment tracking
✅ Deployed to Render
✅ GitHub repository with commits

### Documentation
✅ README.md
✅ API documentation
✅ Deployment guide
✅ Testing guide

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `server.js` | Main application entry point |
| `database/db.js` | Database connection pool |
| `routes/auth.js` | Authentication endpoints |
| `routes/ious.js` | IOU CRUD endpoints |
| `routes/payments.js` | Payment endpoints |
| `middleware/auth.js` | JWT verification |
| `database/schema.sql` | Database schema |

---

## 🎓 Sprint Review Prep

### Be Ready to Show
1. Deployed API URL
2. GitHub repository
3. Running code locally
4. API test in Postman
5. Database schema

### Be Ready to Explain
1. How JWT authentication works
2. Where routes are defined
3. How database connection works
4. How authorization is checked
5. How remaining balance is calculated

---

## 📞 Support

- **Instructor:** John Prinz
- **Course:** PROG2500-26W-Sec1
- **Documentation:** See `docs/` folder
- **Express Docs:** https://expressjs.com
- **PostgreSQL Docs:** https://postgresql.org/docs

---

## ✅ Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🚧 | In Progress |
| ❌ | Not Started |
| ⚠️ | Needs Attention |

---

## 🔍 Quick Commands

```bash
# Start dev server
npm run dev

# Test database connection
psql -U postgres -d payback

# View tables
psql -U postgres -d payback -c "\dt"

# Check git status
git status

# View commit history
git log --oneline

# Push changes
git add . && git commit -m "message" && git push

# Test API
curl http://localhost:3000/
```

---

## 💡 Pro Tips

1. **Commit often** - Small, frequent commits are better
2. **Test locally first** - Before deploying
3. **Use descriptive commit messages** - Future you will thank you
4. **Keep .env private** - Never commit secrets
5. **Read error messages** - They usually tell you what's wrong
6. **Use Postman Collections** - Save and organize your requests
7. **Check Render logs** - When debugging deployment issues

---

## 🎉 You've Got This!

Remember: This is a complete, production-ready backend API. Be proud of what you've built!

**Final Checklist:**
- [ ] All endpoints working
- [ ] Deployed successfully
- [ ] GitHub has regular commits
- [ ] Ready for demo
- [ ] Confident in explaining code

**Good luck on your Sprint Review! 🚀**
