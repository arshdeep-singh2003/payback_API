# API Testing Guide for PayBack

This document provides comprehensive testing instructions for all API endpoints using tools like Postman, Thunder Client, or curl.

## Base URL
- Local: `http://localhost:3000`
- Production (Render): `https://your-app-name.onrender.com`

---

## Authentication Endpoints

### 1. Register New User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-05T10:30:00.000Z"
  }
}
```

**Save the token** for subsequent requests!

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## IOU Endpoints (All require authentication)

**For all endpoints below, add this header:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 3. Create New IOU
**POST** `/api/ious`

**Request Body:**
```json
{
  "borrower_id": 2,
  "amount": 25.50,
  "reason": "Lunch at restaurant"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "IOU created successfully",
  "data": {
    "iou_id": 1,
    "lender_id": 1,
    "borrower_id": 2,
    "amount": 25.5,
    "reason": "Lunch at restaurant",
    "status": "Unpaid",
    "created_at": "2026-02-05T10:35:00.000Z"
  }
}
```

---

### 4. Get All User's IOUs
**GET** `/api/ious`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "owedToMe": [
      {
        "iou_id": 1,
        "amount": "25.50",
        "reason": "Lunch at restaurant",
        "status": "Unpaid",
        "created_at": "2026-02-05T10:35:00.000Z",
        "borrower_name": "Jane Smith",
        "total_paid": "0.00",
        "remaining_balance": "25.50"
      }
    ],
    "iOwe": [
      {
        "iou_id": 2,
        "amount": "15.00",
        "reason": "Uber ride",
        "status": "Unpaid",
        "created_at": "2026-02-05T11:00:00.000Z",
        "lender_name": "Bob Wilson",
        "total_paid": "5.00",
        "remaining_balance": "10.00"
      }
    ],
    "summary": {
      "totalOwedToMe": "25.50",
      "totalIOwe": "10.00",
      "unpaidIOUsCount": 2
    }
  }
}
```

---

### 5. Get Single IOU Details
**GET** `/api/ious/1`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "iou": {
      "iou_id": 1,
      "lender_id": 1,
      "borrower_id": 2,
      "amount": 25.5,
      "reason": "Lunch at restaurant",
      "status": "Unpaid",
      "created_at": "2026-02-05T10:35:00.000Z",
      "lender_name": "John Doe",
      "lender_email": "john@example.com",
      "borrower_name": "Jane Smith",
      "borrower_email": "jane@example.com"
    },
    "payments": [
      {
        "payment_id": 1,
        "iou_id": 1,
        "payment_amount": 10,
        "payment_date": "2026-02-05T12:00:00.000Z"
      }
    ],
    "summary": {
      "totalPaid": "10.00",
      "remainingBalance": "15.50"
    }
  }
}
```

---

### 6. Update IOU Status
**PATCH** `/api/ious/1`

**Request Body:**
```json
{
  "status": "Paid"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "IOU status updated successfully",
  "data": {
    "iou_id": 1,
    "lender_id": 1,
    "borrower_id": 2,
    "amount": 25.5,
    "reason": "Lunch at restaurant",
    "status": "Paid",
    "created_at": "2026-02-05T10:35:00.000Z"
  }
}
```

---

### 7. Delete IOU
**DELETE** `/api/ious/1`

**Expected Response (200):**
```json
{
  "success": true,
  "message": "IOU deleted successfully"
}
```

**Note:** Can only delete if:
- User is the lender
- No payments have been made yet

---

## Payment Endpoints (All require authentication)

### 8. Record Payment
**POST** `/api/payments`

**Request Body:**
```json
{
  "iou_id": 1,
  "payment_amount": 10.00
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment": {
      "payment_id": 1,
      "iou_id": 1,
      "payment_amount": 10,
      "payment_date": "2026-02-05T12:00:00.000Z"
    },
    "newRemainingBalance": "15.50",
    "iouFullyPaid": false
  }
}
```

---

### 9. Get Payments for IOU
**GET** `/api/payments?iou_id=1`

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "payment_id": 1,
        "iou_id": 1,
        "payment_amount": 10,
        "payment_date": "2026-02-05T12:00:00.000Z"
      },
      {
        "payment_id": 2,
        "iou_id": 1,
        "payment_amount": 5,
        "payment_date": "2026-02-05T13:00:00.000Z"
      }
    ],
    "summary": {
      "iouAmount": 25.5,
      "totalPaid": "15.00",
      "remainingBalance": "10.50",
      "paymentsCount": 2
    }
  }
}
```

---

## Complete Testing Flow

### Step-by-Step Test Scenario

1. **Register two users:**
   - User A (John) - will be the lender
   - User B (Jane) - will be the borrower

2. **Login as User A** and save the token

3. **Create an IOU** where User A lends $50 to User B

4. **Get all IOUs** to verify it shows in "owedToMe"

5. **Get IOU details** to see full information

6. **Record a partial payment** of $20

7. **Get payments** to verify the payment history

8. **Record another payment** of $30 to fully pay the IOU

9. **Verify IOU status** changed to "Paid" automatically

10. **Login as User B** and verify the IOU shows in "iOwe" section

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Amount must be greater than 0",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Authorization denied."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to view this IOU"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "IOU not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error while fetching IOUs"
}
```

---

## Postman Collection

You can import this collection into Postman:

1. Create a new collection named "PayBack API"
2. Add an environment variable `baseUrl` = `http://localhost:3000`
3. Add an environment variable `token` (will be set after login)
4. For each authenticated endpoint, add:
   - Header: `Authorization` with value `Bearer {{token}}`

---

## Tips for Testing

1. **Always save the JWT token** after registration/login
2. **Test with multiple users** to verify authorization
3. **Test edge cases:**
   - Try creating IOU with yourself (should fail)
   - Try payment exceeding remaining balance (should fail)
   - Try deleting IOU with payments (should fail)
4. **Check database** after each operation to verify data integrity
5. **Test invalid tokens** to ensure security works

---

## Testing Checklist

- [ ] User registration works
- [ ] User login returns valid token
- [ ] Token authentication works for protected routes
- [ ] Can create IOU between two users
- [ ] Cannot create IOU with self
- [ ] Can view all user's IOUs
- [ ] Can view single IOU details
- [ ] Can record partial payments
- [ ] Can record full payments
- [ ] IOU auto-marks as Paid when fully paid
- [ ] Can update IOU status manually
- [ ] Can delete IOU (with restrictions)
- [ ] Authorization checks prevent unauthorized access
- [ ] Payment history displays correctly
- [ ] Dashboard summary calculates correctly
