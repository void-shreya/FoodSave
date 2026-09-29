# FoodSave Supabase Database & Migrations

This folder contains the complete SQL database schema, Row Level Security (RLS) policies, and test seed data for **FoodSave**.

## Migration Files

1. `migrations/001_initial_schema.sql`
   - Defines custom ENUM types: `user_role`, `org_type`, `org_verification_status`, `donation_status`, `pickup_status`, `delivery_status`, `beneficiary_category`, `notification_type`, `report_status`.
   - Creates all core tables: `users`, `profiles`, `organizations`, `categories`, `food_donations`, `donation_images`, `pickup_requests`, `pickups`, `deliveries`, `beneficiaries`, `notifications`, `reviews`, `reports`, `audit_logs`.
   - Creates performance indexes for status, timestamps, geo-coordinates, and search fields.
   - Creates database triggers for auto-updating `updated_at`.
   - Creates `claim_food_donation` stored procedure with row-locking (`FOR UPDATE`) for race-condition-safe claims.

2. `migrations/002_rls_policies.sql`
   - Enables Row Level Security on all 14 tables.
   - Configures granular, role-aware policies for donors, volunteers, NGOs, and admins.
   - Protects beneficiary data and audit logs from unauthorized access or modification.

3. `seed.sql`
   - Realistic seed data including 4 verified demo accounts for every role (donor, volunteer, ngo, admin), active donations with food safety details, scheduled pickups, completed deliveries, beneficiaries, and audit logs.
   - Demo Password for all accounts: `Password123!`

## How to Apply via Supabase Web Dashboard

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project or select your existing project.
3. In the left navigation, click on **SQL Editor**.
4. Open and run `migrations/001_initial_schema.sql`.
5. Open and run `migrations/002_rls_policies.sql`.
6. Open and run `seed.sql`.

## Supabase Storage Buckets Setup

In the Supabase Dashboard, navigate to **Storage** and create the following buckets:
- `food-images` (Public bucket: YES)
- `profile-images` (Public bucket: YES)
- `delivery-proof` (Public bucket: YES)

Configure standard file upload limits (max 5MB, MIME types: `image/jpeg, image/png, image/webp`).
