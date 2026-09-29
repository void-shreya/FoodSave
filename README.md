# FoodSave Backend REST API

Production-ready Node.js & Express REST API for **FoodSave: Save Food. Share Hope. Reduce Waste.**

## Architecture Overview

The backend strictly follows the **MVC (Model-View-Controller)** pattern with a Service Layer:

```
HTTP Request
     │
     ▼
Routes (src/routes/) ──► Validators (src/validators/)
     │
     ▼
Middleware (requireAuth, requireRole, apiLimiter)
     │
     ▼
Controllers (src/controllers/)
     │
     ▼
Services (src/services/)
     │
     ▼
Database Layer (src/models/db.js) ──► Supabase PostgreSQL
```

## Security & Best Practices Implemented

- **Password Hashing**: `bcryptjs` with 10 salt rounds. Plaintext passwords are NEVER stored.
- **Stateless Authentication**: Signed JSON Web Tokens (JWT) containing strictly essential identifiers (`id`, `role`, `email`).
- **Role-Based Access Control (RBAC)**: `requireAuth` and `requireRole(...)` middlewares ensure only authorized roles can invoke sensitive operations. Frontend role claims are never trusted.
- **Race Condition Prevention**: Database row locking (`FOR UPDATE`) and atomic status transitions guarantee that simultaneous claims for the same donation fail gracefully with HTTP 409 Conflict.
- **Food Safety Enforcement**: Expiry dates must be strictly later than preparation dates; mandatory donor safety confirmation checkbox is validated both frontend and backend; automatic background cron job marks past-due items as `EXPIRED`.
- **HTTP Protection**: Helmet security headers, CORS origin whitelisting, and `express-rate-limit` for DDoS and brute-force prevention.
- **Centralized Error Handling**: Standardized JSON responses for all error codes (`400, 401, 403, 404, 409, 422, 500`).

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

JWT_SECRET=super_secret_foodsave_jwt_key_change_in_production_2026
JWT_EXPIRES_IN=7d

# Supabase Credentials (optional for local testing; backend automatically falls back to full local seed store)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Installation & Running

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Run development server
npm run dev

# Run production server
npm start
```

## Demo Credentials (Pre-seeded)

All demo accounts share the password: `Password123!`

- **Donor**: `donor@foodsave.org`
- **Volunteer**: `volunteer@foodsave.org`
- **NGO**: `ngo@foodsave.org`
- **Admin**: `admin@foodsave.org`
