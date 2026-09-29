# FOODSAVE

> **"Save Food. Share Hope. Reduce Waste."**

FoodSave is a modern, transparent, full-stack food-rescue and redistribution web platform designed to eliminate edible food waste and alleviate local hunger. The system connects **Food Donors** (restaurants, hotels, caterers, bakeries, households), **Volunteers**, and **Verified NGOs** into an accountable, real-time rescue network.

---

## 🌟 Table of Contents
1. [Core Features & User Roles](#-core-features--user-roles)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Repository Structure](#-repository-structure)
4. [Security & Food Safety Assurance](#-security--food-safety-assurance)
5. [Prerequisites & Quick Start](#-prerequisites--quick-start)
6. [Environment Variables](#-environment-variables)
7. [Database Setup, Migrations & RLS](#-database-setup-migrations--rls)
8. [Demo Test Accounts](#-demo-test-accounts)
9. [API Endpoint Documentation](#-api-endpoint-documentation)
10. [End-to-End Workflow: Donation → Pickup → Delivery](#-end-to-end-workflow-donation--pickup--delivery)
11. [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 👥 Core Features & User Roles

### 1. Food Donors (Restaurants, Caterers, Hotels, Households)
- **Create Food Donations**: Fast, structured donation creation with preparation time, mandatory expiry deadlines, allergen tags, and storage guidelines.
- **Mandatory Safety Declaration**: Require explicit confirmation that food meets hygiene and temperature standards before publishing.
- **Real-Time Tracking**: Track active listings, view courier assignments, and monitor pickup fulfillment.
- **Analytics**: Visual breakdown of total servings shared, categories donated, and waste diverted.

### 2. Volunteers (Community Couriers)
- **Nearby Rescue Discovery**: Geo-filtered discovery of available surplus meals with distance estimates and time-to-expiry alerts.
- **Atomic Claiming**: Race-condition-safe claiming mechanism prevents duplicate volunteer assignments.
- **Pickup & Transit Execution**: Step-by-step route directions, "Mark Collected" with condition notes, and "Mark Delivered" with proof-of-delivery uploads.

### 3. Non-Profit Organizations (NGOs & Shelters)
- **Bulk Donation Claims**: Reserve large catering batches directly for community dining rooms.
- **Privacy-Protected Beneficiary Management**: Maintain aggregate capacity counts for youth shelters, elderly homes, and emergency food lines without exposing sensitive individual identities.
- **Audit Reports**: Transparent accounting of all incoming food transfers.

### 4. System Administrators
- **Platform Analytics**: Comprehensive KPIs on user growth, meals rescued, CO₂ averted, and active listings.
- **User Moderation**: Instant user suspension / reactivation controls.
- **Trust & Safety Queue**: Review community reports (unsafe food, fake listings, no-shows) with resolution logs.
- **NGO Verifications**: Approve or reject non-profit registration documentation.
- **Tamper-Evident Audit Logs**: Searchable audit trail of sensitive platform activities.

---

## 🏗 Tech Stack & Architecture

### Backend
- **Runtime**: Node.js v20+ / Express.js
- **Architecture**: MVC (Routes → Controllers → Services → Database Repository)
- **Database**: PostgreSQL (via Supabase) with native Row Level Security (RLS)
- **Authentication**: Stateless JSON Web Tokens (JWT) & `bcryptjs` password hashing (10 salt rounds)
- **Security**: Helmet HTTP headers, CORS whitelisting, Rate Limiting (`express-rate-limit`), input validation (`express-validator`)
- **Background Cron**: Automated minute-by-minute expiration daemon (`node-cron`)

### Frontend
- **Framework**: React 18 / 19 + Vite
- **Routing**: React Router v6 with `ProtectedRoute` and `RoleGuard`
- **Design System**: Vanilla CSS design tokens, Glassmorphism, Google Fonts (`Plus Jakarta Sans` & `Inter`), CSS Grid & Flexbox, Lucide React icons
- **State Management**: React Context (`AuthContext`, `NotificationContext`)
- **Network**: Centralized Axios API client with automatic JWT injection and error interceptors

---

## 📁 Repository Structure

```
FoodSave/
│
├── frontend/                     # React + Vite Frontend
│   ├── src/
│   │   ├── assets/               # Static assets & icons
│   │   ├── components/           # Reusable UI (Navbar, Footer, DonationCard, Modal, StatusBadge, Charts)
│   │   ├── context/              # AuthContext, NotificationContext
│   │   ├── hooks/                # useAuth, useNotifications
│   │   ├── layouts/              # DashboardLayout
│   │   ├── pages/                # Landing, Login, Register, Dashboards, Discovery, Details, Impact
│   │   ├── services/             # Axios API client (api.js)
│   │   ├── utils/                # Helper functions
│   │   ├── App.jsx               # Client-side router configuration
│   │   ├── index.css             # Design tokens, typography, glassmorphism, responsive utilities
│   │   └── main.jsx              # React DOM entrypoint
│   ├── public/
│   ├── index.html                # Google Fonts & SEO metadata
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js            # Vite config with backend proxy
│
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # env.js, supabase.js
│   │   ├── controllers/          # auth, donation, pickup, delivery, ngo, admin, report, impact
│   │   ├── middleware/           # authMiddleware, validationMiddleware, errorMiddleware, rateLimiter
│   │   ├── models/               # db.js (PostgreSQL database layer with local seed fallback)
│   │   ├── routes/               # Modular Express routers
│   │   ├── services/             # Business logic layer
│   │   ├── tests/                # Automated Node.js integration tests
│   │   ├── utils/                # jwt.js, geo.js (Haversine formula), cron.js (auto-expiry daemon)
│   │   ├── validators/           # express-validator schemas
│   │   ├── app.js                # Express app setup (Helmet, CORS, body parsers)
│   │   └── server.js             # HTTP server entrypoint
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── supabase/                     # Database migrations & seed scripts
│   ├── migrations/
│   │   ├── 001_initial_schema.sql # 14 tables, indexes, custom ENUMs, triggers, atomic claim function
│   │   └── 002_rls_policies.sql   # Comprehensive Row Level Security (RLS) policies
│   ├── seed.sql                  # Realistic demo data for all roles with hashed credentials
│   └── README.md
│
└── README.md
```

---

## 🔒 Security & Food Safety Assurance

1. **Frontend Untrusted**: All role permissions, token claims, resource ownership, and input boundaries are strictly validated on the backend. Frontend UI guards serve UX purposes only.
2. **No Secret Leakage**: The Supabase Service Role key is strictly reserved for the backend environment. The React frontend receives only safe public endpoints.
3. **Food Safety Protocols**:
   - Every donation requires preparation and expiry timestamps (`expiry_time > prepared_at`).
   - Mandatory food safety checkbox: *"I confirm that this food is safe for consumption and has been stored/handled appropriately."*
   - Expired listings are automatically decommissioned and blocked from rescue claims.
   - Temperature recommendations and safe handling instructions are displayed prominently.
4. **Race-Condition Safe Claiming**:
   - The PostgreSQL `claim_food_donation` function employs row-level locks (`SELECT ... FOR UPDATE`) to guarantee that simultaneous claims fail with HTTP 409 Conflict rather than allowing double assignment.

---

## 🚀 Prerequisites & Quick Start

### Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **npm** v9+

### 1. Setup Backend
```bash
cd backend
npm install
npm run dev
```
The backend server starts on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend Vite server opens on `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

JWT_SECRET=super_secret_foodsave_jwt_key_change_in_production_2026
JWT_EXPIRES_IN=7d

# Supabase Credentials (leave default or update with your project settings)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🗄 Database Setup, Migrations & RLS

When connecting to a live Supabase PostgreSQL instance:
1. Log into your [Supabase Console](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Execute `supabase/migrations/001_initial_schema.sql` (Tables, ENUMs, triggers, and the atomic claim function).
4. Execute `supabase/migrations/002_rls_policies.sql` (Row Level Security policies).
5. Execute `supabase/seed.sql` (Demo data).
6. Under **Storage**, create public buckets: `food-images`, `profile-images`, `delivery-proof`.

> **Note**: FoodSave includes a built-in resilient database repository pre-seeded with the exact demo dataset. If run without Supabase credentials, the entire application remains 100% interactive, testable, and functional right out of the box!

---

## 🔑 Demo Test Accounts

All pre-seeded demo accounts use the password: **`Password123!`**

| Role | Email | Name / Organization | Description |
|---|---|---|---|
| **Donor** | `donor@foodsave.org` | Green Harvest Bistro | Restaurant donor with active surplus meals |
| **Volunteer** | `volunteer@foodsave.org` | Alex Rivera | Courier volunteer with cargo bike & thermal bags |
| **NGO** | `ngo@foodsave.org` | Hope Outreach Foundation | Verified non-profit community shelter |
| **Admin** | `admin@foodsave.org` | Sarah Chen (Admin) | Platform administrator & trust/safety moderator |

> 💡 *The login screen also features 1-click demo login buttons for instant evaluation.*

---

## 📡 API Endpoint Documentation

### Authentication & Profile
- `POST /api/auth/register` — Register a new account (`donor`, `volunteer`, `ngo`).
- `POST /api/auth/login` — Authenticate and receive signed JWT.
- `POST /api/auth/logout` — Revoke session confirmation.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `PUT /api/auth/profile` — Update user profile details and bio.
- `POST /api/auth/forgot-password` — Request password recovery.
- `POST /api/auth/reset-password` — Complete password reset with token.

### Food Donations
- `GET /api/donations` — Discover available donations (supports `category`, `vegetarian`, `vegan`, `city`, `sortBy`).
- `POST /api/donations` — Create new donation (donor role required).
- `GET /api/donations/my` — Get authenticated donor's active and historical listings.
- `GET /api/donations/:id` — Full donation details and safety information.
- `PUT /api/donations/:id` — Update active donation (owner donor only).
- `POST /api/donations/:id/cancel` — Cancel active donation.
- `POST /api/donations/:id/request-pickup` — Claim donation atomically (volunteer/ngo).

### Pickups & Deliveries
- `GET /api/pickups` — List assigned pickups for current user.
- `GET /api/pickups/:id` — Get pickup inspection details.
- `PUT /api/pickups/:id/status` — Transition pickup state (`SCHEDULED` → `COLLECTED`).
- `GET /api/deliveries` — List user's deliveries.
- `PUT /api/deliveries/:id/status` — Mark delivery completed with proof image & notes.

### NGOs & Beneficiaries
- `GET /api/ngos` — Public directory of verified NGO partners.
- `GET /api/ngos/:id` — NGO profile details.
- `GET /api/ngos/beneficiaries` — List privacy-conscious beneficiary groups.
- `POST /api/ngos/beneficiaries` — Create new beneficiary center.
- `DELETE /api/ngos/beneficiaries/:id` — Remove beneficiary group.

### Admin & Moderation
- `GET /api/admin/dashboard` — Platform KPIs and health status.
- `GET /api/admin/users` — User management directory.
- `PUT /api/admin/users/:id/status` — Suspend or activate user account.
- `GET /api/admin/donations` — All donations oversight.
- `GET /api/admin/reports` — Moderation reports queue.
- `PUT /api/admin/reports/:id` — Resolve or dismiss report with admin notes.
- `GET /api/admin/audit-logs` — System security audit trail.

### Public Impact
- `GET /api/impact` — Aggregated metrics (meals rescued, kg saved, CO₂ averted).

---

## 🔄 End-to-End Workflow: Donation → Pickup → Delivery

```
[1. DONATION LISTED]
Donor creates listing with:
- Prepared At + Expiry Time
- Storage rules & Allergen tags
- Mandatory Food Safety Checkbox
Status: AVAILABLE
       │
       ▼
[2. DISCOVERY & ATOMIC CLAIM]
Volunteer or NGO discovers donation and submits claim.
Database executes row lock:
- Sets status: CLAIMED
- Generates Pickup record (status: ASSIGNED)
- Generates Delivery record (status: PENDING)
- Dispatches alert to Donor
       │
       ▼
[3. PICKUP & TEMPERATURE VERIFICATION]
Volunteer arrives at kitchen, confirms food packaging.
Marks Pickup status: COLLECTED
- Donation updates: COLLECTED
- Delivery updates: IN_TRANSIT
- Dispatches collection alert to Donor
       │
       ▼
[4. SAFE DELIVERY & COMMUNITY IMPACT]
Volunteer delivers meals to Shelter dining hall.
Marks Delivery status: DELIVERED
- Attaches photo proof / receipt notes
- Donation updates: DELIVERED
- Impact metrics & CO₂ savings updated in real time!
```

---

## 🧪 Testing & Quality Assurance

### Automated Backend Tests
Run the comprehensive test suite:
```bash
cd backend
npm test
```
The test suite validates:
- API health check
- Secure authentication & invalid credential rejection
- Role-based authorization boundaries
- Mandatory food safety checkbox enforcement
- Expiry date verification
- Atomic claim execution and duplicate claim prevention (HTTP 409)
- Blocked self-registration as admin

---

## 📜 License
This project is licensed under the MIT License.
FoodSave — Save Food. Share Hope. Reduce Waste.
