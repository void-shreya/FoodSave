-- ========================================================
-- FOODSAVE DATABASE SCHEMA: MIGRATION 001_initial_schema.sql
-- ========================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('donor', 'volunteer', 'ngo', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE org_type AS ENUM (
        'NGO', 'RESTAURANT', 'HOTEL', 'CATERER', 'EVENT_ORGANIZER', 'GROCERY_STORE', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE org_verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE donation_status AS ENUM (
        'AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED', 'COLLECTED', 'IN_TRANSIT', 'DELIVERED', 'EXPIRED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pickup_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pickup_status AS ENUM ('ASSIGNED', 'SCHEDULED', 'COLLECTED', 'MISSED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE beneficiary_category AS ENUM (
        'CHILDREN', 'ELDERLY', 'HOMELESS', 'LOW_INCOME_FAMILIES', 'DISASTER_AFFECTED', 'COMMUNITY', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'DONATION_CREATED', 'DONATION_CLAIMED', 'PICKUP_ASSIGNED', 'FOOD_COLLECTED', 'FOOD_DELIVERED', 'DONATION_EXPIRED', 'VERIFICATION_UPDATE', 'SYSTEM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'donor',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    profile_image TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    organization_type org_type NOT NULL DEFAULT 'OTHER',
    registration_number VARCHAR(100),
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    verification_status org_verification_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FOOD DONATIONS TABLE
CREATE TABLE IF NOT EXISTS food_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    food_category VARCHAR(100) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    quantity_unit VARCHAR(50) NOT NULL DEFAULT 'servings',
    vegetarian BOOLEAN DEFAULT TRUE,
    vegan BOOLEAN DEFAULT FALSE,
    contains_allergens BOOLEAN DEFAULT FALSE,
    allergen_details TEXT,
    prepared_at TIMESTAMPTZ NOT NULL,
    expiry_time TIMESTAMPTZ NOT NULL,
    pickup_start_time TIMESTAMPTZ NOT NULL,
    pickup_end_time TIMESTAMPTZ NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_state VARCHAR(100),
    pickup_pincode VARCHAR(20),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    image_url TEXT,
    status donation_status NOT NULL DEFAULT 'AVAILABLE',
    safety_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    storage_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_expiry_after_prepared CHECK (expiry_time > prepared_at),
    CONSTRAINT chk_pickup_window CHECK (pickup_end_time >= pickup_start_time)
);

-- 6. DONATION IMAGES TABLE
CREATE TABLE IF NOT EXISTS donation_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PICKUP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS pickup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_type VARCHAR(50) NOT NULL CHECK (requester_type IN ('VOLUNTEER', 'NGO')),
    status pickup_request_status NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ
);

-- 8. PICKUPS TABLE
CREATE TABLE IF NOT EXISTS pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE UNIQUE,
    volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ngo_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pickup_address TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actual_pickup_time TIMESTAMPTZ,
    status pickup_status NOT NULL DEFAULT 'ASSIGNED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_id UUID NOT NULL REFERENCES pickups(id) ON DELETE CASCADE UNIQUE,
    volunteer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ngo_id UUID REFERENCES users(id) ON DELETE SET NULL,
    destination TEXT NOT NULL,
    delivery_time TIMESTAMPTZ,
    status delivery_status NOT NULL DEFAULT 'PENDING',
    proof_image TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BENEFICIARIES TABLE (NGO managed)
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    category beneficiary_category NOT NULL DEFAULT 'COMMUNITY',
    people_count INTEGER NOT NULL CHECK (people_count > 0),
    location_area VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    donation_id UUID REFERENCES food_donations(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('DONATION', 'USER', 'PICKUP', 'OTHER')),
    target_id UUID NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- INDEXES FOR COMMONLY SEARCHED & FILTERED FIELDS
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_donations_status ON food_donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON food_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_expiry_time ON food_donations(expiry_time);
CREATE INDEX IF NOT EXISTS idx_donations_pickup_city ON food_donations(pickup_city);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON food_donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_category ON food_donations(food_category);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_donation ON pickup_requests(donation_id);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_requester ON pickup_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_pickups_volunteer ON pickups(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_pickups_ngo ON pickups(ngo_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_pickup ON deliveries(pickup_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- ========================================================
-- TRIGGERS FOR AUTO-UPDATING updated_at
-- ========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_donations_updated_at BEFORE UPDATE ON food_donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_pickups_updated_at BEFORE UPDATE ON pickups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- RACE-CONDITION SAFE CLAIM FUNCTION
-- Atomically claim an available food donation
-- ========================================================
CREATE OR REPLACE FUNCTION claim_food_donation(
    p_donation_id UUID,
    p_claimant_id UUID,
    p_claimant_role VARCHAR,
    p_destination TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_donation RECORD;
    v_pickup_id UUID;
    v_volunteer_id UUID := NULL;
    v_ngo_id UUID := NULL;
BEGIN
    -- Lock row for update
    SELECT * INTO v_donation
    FROM food_donations
    WHERE id = p_donation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'DONATION_NOT_FOUND', 'message', 'Donation not found');
    END IF;

    IF v_donation.status != 'AVAILABLE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'DONATION_UNAVAILABLE', 'message', 'Donation is already ' || v_donation.status);
    END IF;

    IF v_donation.expiry_time <= NOW() THEN
        -- Mark expired
        UPDATE food_donations SET status = 'EXPIRED', updated_at = NOW() WHERE id = p_donation_id;
        RETURN jsonb_build_object('success', false, 'error', 'DONATION_EXPIRED', 'message', 'This donation has expired and cannot be claimed');
    END IF;

    -- Set volunteer or NGO reference
    IF p_claimant_role = 'volunteer' THEN
        v_volunteer_id := p_claimant_id;
    ELSE
        v_ngo_id := p_claimant_id;
    END IF;

    -- Update donation status to CLAIMED
    UPDATE food_donations
    SET status = 'CLAIMED', updated_at = NOW()
    WHERE id = p_donation_id;

    -- Insert pickup record
    INSERT INTO pickups (donation_id, volunteer_id, ngo_id, pickup_address, scheduled_time, status, notes)
    VALUES (p_donation_id, v_volunteer_id, v_ngo_id, v_donation.pickup_address, NOW() + INTERVAL '2 hours', 'ASSIGNED', p_notes)
    RETURNING id INTO v_pickup_id;

    -- Insert delivery record
    INSERT INTO deliveries (pickup_id, volunteer_id, ngo_id, destination, status)
    VALUES (v_pickup_id, v_volunteer_id, v_ngo_id, COALESCE(p_destination, 'Designated Distribution Hub'), 'PENDING');

    -- Insert notification for donor
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        v_donation.donor_id,
        'Donation Claimed!',
        'Your donation "' || v_donation.title || '" has been claimed for rescue.',
        'DONATION_CLAIMED',
        '/my-donations'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Donation successfully claimed',
        'pickup_id', v_pickup_id
    );
END;
$$ LANGUAGE plpgsql;
