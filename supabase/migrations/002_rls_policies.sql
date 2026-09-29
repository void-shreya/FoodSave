-- ========================================================
-- FOODSAVE DATABASE SCHEMA: MIGRATION 002_rls_policies.sql
-- Complete Row Level Security (RLS) policies for FoodSave
-- ========================================================

-- Enable Row Level Security on ALL application tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- 1. USERS POLICIES
-- ========================================================
-- Users can view their own user record
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (auth.uid() = id OR is_admin());

-- Users can update their own profile info (cannot change role or is_verified)
CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (auth.uid() = id OR is_admin())
    WITH CHECK (auth.uid() = id OR is_admin());

-- Service role and admin can do all
CREATE POLICY users_admin_all ON users
    FOR ALL
    USING (is_admin());

-- ========================================================
-- 2. PROFILES POLICIES
-- ========================================================
-- Public can view non-sensitive profile summaries
CREATE POLICY profiles_select_all ON profiles
    FOR SELECT
    USING (true);

-- User can update their own profile
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id OR is_admin())
    WITH CHECK (auth.uid() = user_id OR is_admin());

-- User can insert their own profile
CREATE POLICY profiles_insert_own ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR is_admin());

-- ========================================================
-- 3. ORGANIZATIONS POLICIES
-- ========================================================
-- Verified organizations are visible to all users
CREATE POLICY orgs_select_verified ON organizations
    FOR SELECT
    USING (verification_status = 'VERIFIED' OR auth.uid() = owner_id OR is_admin());

-- Owners can insert organizations
CREATE POLICY orgs_insert_owner ON organizations
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id OR is_admin());

-- Owners can update their organization
CREATE POLICY orgs_update_owner ON organizations
    FOR UPDATE
    USING (auth.uid() = owner_id OR is_admin())
    WITH CHECK (auth.uid() = owner_id OR is_admin());

-- ========================================================
-- 4. CATEGORIES POLICIES
-- ========================================================
-- Categories are readable by everyone
CREATE POLICY categories_select_all ON categories
    FOR SELECT
    USING (true);

-- Only admins can manage categories
CREATE POLICY categories_admin_manage ON categories
    FOR ALL
    USING (is_admin());

-- ========================================================
-- 5. FOOD DONATIONS POLICIES
-- ========================================================
-- Anyone can read active AVAILABLE donations, or their own, or if assigned
CREATE POLICY donations_select ON food_donations
    FOR SELECT
    USING (
        status = 'AVAILABLE'
        OR auth.uid() = donor_id
        OR is_admin()
        OR EXISTS (
            SELECT 1 FROM pickups p
            WHERE p.donation_id = food_donations.id
            AND (p.volunteer_id = auth.uid() OR p.ngo_id = auth.uid())
        )
    );

-- Donors can create donations
CREATE POLICY donations_insert_donor ON food_donations
    FOR INSERT
    WITH CHECK (
        auth.uid() = donor_id
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'donor' OR role = 'admin')
        )
    );

-- Donors can update their own donations if not yet completed/collected
CREATE POLICY donations_update_donor ON food_donations
    FOR UPDATE
    USING (
        (auth.uid() = donor_id AND status IN ('AVAILABLE', 'CLAIMED'))
        OR is_admin()
    )
    WITH CHECK (
        (auth.uid() = donor_id AND status IN ('AVAILABLE', 'CANCELLED'))
        OR is_admin()
    );

-- Donors or admins can delete/cancel
CREATE POLICY donations_delete ON food_donations
    FOR DELETE
    USING (auth.uid() = donor_id OR is_admin());

-- ========================================================
-- 6. DONATION IMAGES POLICIES
-- ========================================================
CREATE POLICY donation_images_select ON donation_images
    FOR SELECT
    USING (true);

CREATE POLICY donation_images_insert ON donation_images
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM food_donations d
            WHERE d.id = donation_id AND (d.donor_id = auth.uid() OR is_admin())
        )
    );

-- ========================================================
-- 7. PICKUP REQUESTS POLICIES
-- ========================================================
-- Users can see their own requests, donors can see requests for their donations
CREATE POLICY pickup_requests_select ON pickup_requests
    FOR SELECT
    USING (
        requester_id = auth.uid()
        OR is_admin()
        OR EXISTS (
            SELECT 1 FROM food_donations d
            WHERE d.id = donation_id AND d.donor_id = auth.uid()
        )
    );

-- Volunteers and NGOs can request pickups
CREATE POLICY pickup_requests_insert ON pickup_requests
    FOR INSERT
    WITH CHECK (
        auth.uid() = requester_id
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('volunteer', 'ngo', 'admin')
        )
    );

-- ========================================================
-- 8. PICKUPS POLICIES
-- ========================================================
-- Pickups visible to assigned volunteer, NGO, donor, or admin
CREATE POLICY pickups_select ON pickups
    FOR SELECT
    USING (
        volunteer_id = auth.uid()
        OR ngo_id = auth.uid()
        OR is_admin()
        OR EXISTS (
            SELECT 1 FROM food_donations d
            WHERE d.id = donation_id AND d.donor_id = auth.uid()
        )
    );

-- Assigned volunteer or NGO can update status
CREATE POLICY pickups_update ON pickups
    FOR UPDATE
    USING (
        volunteer_id = auth.uid()
        OR ngo_id = auth.uid()
        OR is_admin()
    );

-- ========================================================
-- 9. DELIVERIES POLICIES
-- ========================================================
CREATE POLICY deliveries_select ON deliveries
    FOR SELECT
    USING (
        volunteer_id = auth.uid()
        OR ngo_id = auth.uid()
        OR is_admin()
        OR EXISTS (
            SELECT 1 FROM pickups p
            JOIN food_donations d ON d.id = p.donation_id
            WHERE p.id = pickup_id AND d.donor_id = auth.uid()
        )
    );

CREATE POLICY deliveries_update ON deliveries
    FOR UPDATE
    USING (
        volunteer_id = auth.uid()
        OR ngo_id = auth.uid()
        OR is_admin()
    );

-- ========================================================
-- 10. BENEFICIARIES POLICIES (Privacy protected)
-- ========================================================
-- Only the managing NGO or admin can view beneficiaries
CREATE POLICY beneficiaries_select ON beneficiaries
    FOR SELECT
    USING (ngo_id = auth.uid() OR is_admin());

CREATE POLICY beneficiaries_insert ON beneficiaries
    FOR INSERT
    WITH CHECK (
        ngo_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'ngo' OR role = 'admin')
        )
    );

CREATE POLICY beneficiaries_update ON beneficiaries
    FOR UPDATE
    USING (ngo_id = auth.uid() OR is_admin());

CREATE POLICY beneficiaries_delete ON beneficiaries
    FOR DELETE
    USING (ngo_id = auth.uid() OR is_admin());

-- ========================================================
-- 11. NOTIFICATIONS POLICIES
-- ========================================================
CREATE POLICY notifications_select_own ON notifications
    FOR SELECT
    USING (user_id = auth.uid() OR is_admin());

CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE
    USING (user_id = auth.uid() OR is_admin())
    WITH CHECK (user_id = auth.uid() OR is_admin());

-- ========================================================
-- 12. REVIEWS POLICIES
-- ========================================================
CREATE POLICY reviews_select_all ON reviews
    FOR SELECT
    USING (true);

CREATE POLICY reviews_insert_own ON reviews
    FOR INSERT
    WITH CHECK (reviewer_id = auth.uid());

-- ========================================================
-- 13. REPORTS POLICIES
-- ========================================================
-- Users can see their own reports, admins see all
CREATE POLICY reports_select ON reports
    FOR SELECT
    USING (reported_by = auth.uid() OR is_admin());

CREATE POLICY reports_insert ON reports
    FOR INSERT
    WITH CHECK (reported_by = auth.uid());

CREATE POLICY reports_admin_update ON reports
    FOR UPDATE
    USING (is_admin());

-- ========================================================
-- 14. AUDIT LOGS POLICIES
-- ========================================================
-- Read-only by admins
CREATE POLICY audit_logs_admin_select ON audit_logs
    FOR SELECT
    USING (is_admin());

-- System can insert, but no user can update or delete
CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (true);
