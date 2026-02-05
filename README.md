# PayBack - Informal Roommate IOU Tracker

## Description
PayBack is a clean, focused web app that lets roommates privately record directional IOUs (who owes whom), track partial/full repayments with history, and monitor status — eliminating forgotten debts and uncomfortable money conversations.

## Features
- Secure JWT-based authentication
- Create and manage directional IOUs
- Track partial and full payments
- View payment history
- Dashboard with debt overview

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database

### Setup Steps

1. Clone the repository:
```bash
git clone <https://github.com/arshdeep-singh2003/payback_API>
cd PayBack
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/payback
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
```

4. Set up the database:
   - Create a PostgreSQL database named `payback`
   - Run the SQL schema (see `database/schema.sql`)

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### IOUs
- `GET /api/ious` - List user's IOUs
- `GET /api/ious/:id` - Get IOU details
- `POST /api/ious` - Create new IOU
- `PATCH /api/ious/:id` - Update IOU status
- `DELETE /api/ious/:id` - Delete IOU

### Payments
- `POST /api/payments` - Record payment
- `GET /api/payments?iou_id=:id` - List payments for IOU

## Database Schema

### Users Table
- user_id (Primary Key)
- name
- email (Unique)
- password_hash
- created_at

### IOURecords Table
- iou_id (Primary Key)
- lender_id (Foreign Key → Users)
- borrower_id (Foreign Key → Users)
- amount
- reason
- status (Unpaid/Paid)
- created_at

### Payments Table
- payment_id (Primary Key)
- iou_id (Foreign Key → IOURecords)
- payment_amount
- payment_date

## Deployment
This application is deployed on Render.com

## Author
Arshdeep Singh (Student #9042880)

## Course
PROG2500 - Open-Source Full Stack Development
Professor: John Prinz
