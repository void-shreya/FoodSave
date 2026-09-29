-- ========================================================
-- FOODSAVE DATABASE SEED: seed.sql
-- Realistic test data with demo credentials for all roles
-- Demo Password for all accounts: Password123!
-- ========================================================

-- Cleanup existing data if re-seeding
TRUNCATE TABLE audit_logs, reports, reviews, notifications, beneficiaries, 
               deliveries, pickups, pickup_requests, donation_images, 
               food_donations, categories, organizations, profiles, users CASCADE;

-- Categories
INSERT INTO categories (id, name, description, icon, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'Cooked Meals', 'Freshly prepared hot or cold packaged meals and trays', 'Utensils', true),
('c0000000-0000-0000-0000-000000000002', 'Bakery & Bread', 'Fresh loaves, buns, croissants, baguettes, and pastries', 'Croissant', true),
('c0000000-0000-0000-0000-000000000003', 'Fruits & Vegetables', 'Uncut fresh produce, greens, seasonal fruits and vegetables', 'Apple', true),
('c0000000-0000-0000-0000-000000000004', 'Dairy Products', 'Pasteurized milk, yogurt, butter, and cheese packs', 'Milk', true),
('c0000000-0000-0000-0000-000000000005', 'Packaged & Dry Goods', 'Sealed boxed items, rice, pasta, canned goods, pulses', 'Package', true),
('c0000000-0000-0000-0000-000000000006', 'Beverages', 'Bottled juices, sealed drinks, plant milks, and tea packs', 'Coffee', true);

-- Users (Password: Password123!)
-- Hash: $2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i
INSERT INTO users (id, name, email, phone, password_hash, role, is_verified, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'Green Harvest Bistro', 'donor@foodsave.org', '+1 555-0101', '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i', 'donor', true, true),
('a0000000-0000-0000-0000-000000000002', 'Alex Rivera', 'volunteer@foodsave.org', '+1 555-0102', '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i', 'volunteer', true, true),
('a0000000-0000-0000-0000-000000000003', 'Hope Outreach Foundation', 'ngo@foodsave.org', '+1 555-0103', '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i', 'ngo', true, true),
('a0000000-0000-0000-0000-000000000004', 'Sarah Chen (Admin)', 'admin@foodsave.org', '+1 555-0104', '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i', 'admin', true, true);

-- Profiles
INSERT INTO profiles (id, user_id, profile_image, address, city, state, pincode, latitude, longitude, bio) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80', '45 Market Street', 'San Francisco', 'California', '94105', 37.7937, -122.3965, 'Sustainable restaurant committed to reducing food waste and feeding our community.'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', '128 Valencia St', 'San Francisco', 'California', '94103', 37.7701, -122.4221, 'Dedicated community volunteer with bike & insulated bags for quick food transfers.'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=300&q=80', '800 Mission St', 'San Francisco', 'California', '94103', 37.7844, -122.4042, 'Non-profit food pantry and shelter serving nutritious meals to over 400 people daily.'),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', '100 FoodSave Plaza', 'San Francisco', 'California', '94107', 37.7749, -122.4194, 'Platform operations and trust & safety administrator.');

-- Organizations
INSERT INTO organizations (id, owner_id, organization_name, organization_type, registration_number, description, address, city, state, pincode, latitude, longitude, verification_status) VALUES
('o0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Green Harvest Bistro', 'RESTAURANT', 'CA-REST-98214', 'Farm-to-table culinary kitchen specializing in organic dishes and zero-waste initiatives.', '45 Market Street', 'San Francisco', 'California', '94105', 37.7937, -122.3965, 'VERIFIED'),
('o0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Hope Outreach Foundation', 'NGO', '501C3-4482910', 'Regional charity organization distributing prepared meals and dry rations to underserved families.', '800 Mission St', 'San Francisco', 'California', '94103', 37.7844, -122.4042, 'VERIFIED');

-- Food Donations
INSERT INTO food_donations (
    id, donor_id, organization_id, title, description, food_category, quantity, quantity_unit,
    vegetarian, vegan, contains_allergens, allergen_details,
    prepared_at, expiry_time, pickup_start_time, pickup_end_time,
    pickup_address, pickup_city, pickup_state, pickup_pincode, latitude, longitude,
    image_url, status, safety_confirmed, storage_instructions
) VALUES
-- 1. Available Cooked Meals
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'o0000000-0000-0000-0000-000000000001',
    'Hearty Vegetable Pilaf & Lentil Stew Trays',
    'Freshly cooked gourmet rice pilaf with braised carrots, peas, and rich spiced yellow lentil stew. Packed in 5 sealed commercial catering trays.',
    'Cooked Meals',
    35.00,
    'servings',
    true,
    true,
    false,
    'No common allergens. Gluten-free.',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '8 hours',
    NOW(),
    NOW() + INTERVAL '4 hours',
    '45 Market Street, Kitchen Loading Dock B',
    'San Francisco',
    'California',
    '94105',
    37.7937,
    -122.3965,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE',
    true,
    'Keep warm above 60°C or refrigerate upon pickup within 2 hours.'
),
-- 2. Available Bakery Goods
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'o0000000-0000-0000-0000-000000000001',
    'Artisan Sourdough Loaves & Croissants',
    'End-of-shift bakery surplus: 12 sourdough boules, 18 butter croissants, and 10 multi-grain rolls baked this morning.',
    'Bakery & Bread',
    40.00,
    'items',
    true,
    false,
    true,
    'Wheat/Gluten, Dairy (butter in croissants)',
    NOW() - INTERVAL '5 hours',
    NOW() + INTERVAL '24 hours',
    NOW(),
    NOW() + INTERVAL '6 hours',
    '45 Market Street, Front Counter',
    'San Francisco',
    'California',
    '94105',
    37.7937,
    -122.3965,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE',
    true,
    'Store at ambient room temperature in dry conditions.'
),
-- 3. Available Fresh Produce
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'o0000000-0000-0000-0000-000000000001',
    'Fresh Organic Produce & Crisp Greens Box',
    'High quality surplus romaine heads, crisp red bell peppers, zucchini, and seasonal apples from morning deliveries.',
    'Fruits & Vegetables',
    25.00,
    'kg',
    true,
    true,
    false,
    'None',
    NOW() - INTERVAL '4 hours',
    NOW() + INTERVAL '48 hours',
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '12 hours',
    '45 Market Street, Rear Pantry Door',
    'San Francisco',
    'California',
    '94105',
    37.7937,
    -122.3965,
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    'AVAILABLE',
    true,
    'Keep chilled between 2°C - 5°C.'
),
-- 4. Claimed donation
(
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'o0000000-0000-0000-0000-000000000001',
    'Creamy Tuscan Pasta & Garlic Bread',
    'Freshly prepared penne pasta in garlic herb cream sauce with spinach and cherry tomatoes, plus 20 garlic bread slices.',
    'Cooked Meals',
    30.00,
    'servings',
    true,
    false,
    true,
    'Dairy, Gluten',
    NOW() - INTERVAL '3 hours',
    NOW() + INTERVAL '5 hours',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '3 hours',
    '45 Market Street',
    'San Francisco',
    'California',
    '94105',
    37.7937,
    -122.3965,
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
    'CLAIMED',
    true,
    'Keep insulated or reheat to 75°C before serving.'
),
-- 5. Delivered donation (Completed impact)
(
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'o0000000-0000-0000-0000-000000000001',
    'Roasted Vegetable Grain Bowls & Citrus Salads',
    'Healthy quinoa bowls with roasted sweet potatoes, black beans, kale, and fresh orange vinaigrette dressing.',
    'Cooked Meals',
    50.00,
    'servings',
    true,
    true,
    false,
    'None',
    NOW() - INTERVAL '28 hours',
    NOW() - INTERVAL '16 hours',
    NOW() - INTERVAL '26 hours',
    NOW() - INTERVAL '22 hours',
    '45 Market Street',
    'San Francisco',
    'California',
    '94105',
    37.7937,
    -122.3965,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    'DELIVERED',
    true,
    'Delivered successfully to Hope Outreach Center.'
);

-- Pickups
INSERT INTO pickups (id, donation_id, volunteer_id, ngo_id, pickup_address, scheduled_time, actual_pickup_time, status, notes) VALUES
-- Pickup for claimed donation #4
(
    'p0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    '45 Market Street, Kitchen Loading Dock B',
    NOW() + INTERVAL '1 hour',
    NULL,
    'ASSIGNED',
    'Volunteer Alex will pick up using insulated cargo bike'
),
-- Pickup for delivered donation #5
(
    'p0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    '45 Market Street',
    NOW() - INTERVAL '25 hours',
    NOW() - INTERVAL '24 hours',
    'COLLECTED',
    'Picked up in pristine condition, temperature verified.'
);

-- Deliveries
INSERT INTO deliveries (id, pickup_id, volunteer_id, ngo_id, destination, delivery_time, status, proof_image, notes) VALUES
-- Delivery for claimed donation #4
(
    'l0000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'Hope Outreach Community Dining Hall, 800 Mission St',
    NULL,
    'PENDING',
    NULL,
    'Scheduled for evening dinner distribution'
),
-- Delivery for completed donation #5
(
    'l0000000-0000-0000-0000-000000000002',
    'p0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'Hope Outreach Community Dining Hall, 800 Mission St',
    NOW() - INTERVAL '23 hours',
    'DELIVERED',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    'Successfully distributed 50 meals to families and seniors.'
);

-- Beneficiaries (NGO managed, privacy conscious)
INSERT INTO beneficiaries (id, ngo_id, display_name, category, people_count, location_area, notes) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Downtown Youth & Children Center', 'CHILDREN', 45, 'SoMa District', 'After-school meal support for local youth'),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Golden Gate Senior Residence', 'ELDERLY', 60, 'Mission District', 'Nutritious low-sodium meals for elderly residents'),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Community Food Bank Line 4', 'LOW_INCOME_FAMILIES', 120, 'Tenderloin Area', 'Weekly grocery and hot meal box pickup');

-- Notifications
INSERT INTO notifications (user_id, title, message, type, is_read, link) VALUES
('a0000000-0000-0000-0000-000000000001', 'Welcome to FoodSave!', 'Thank you for joining FoodSave as a verified food donor. Your surplus food saves lives!', 'SYSTEM', true, '/dashboard'),
('a0000000-0000-0000-0000-000000000001', 'Donation Claimed', 'Alex Rivera claimed your "Creamy Tuscan Pasta & Garlic Bread" donation.', 'DONATION_CLAIMED', false, '/my-donations'),
('a0000000-0000-0000-0000-000000000002', 'Pickup Scheduled', 'You are assigned to collect 30 servings of Creamy Tuscan Pasta from Green Harvest Bistro.', 'PICKUP_ASSIGNED', false, '/pickups'),
('a0000000-0000-0000-0000-000000000003', 'Meals Received', '50 servings of Roasted Vegetable Grain Bowls were delivered to your dining hall.', 'FOOD_DELIVERED', true, '/deliveries');

-- Reviews
INSERT INTO reviews (reviewer_id, reviewee_id, donation_id, rating, comment) VALUES
('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 5, 'The grain bowls were exceptionally fresh, beautifully packed, and loved by our community. Thank you!'),
('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005', 5, 'Alex arrived on time with proper food grade thermal bags and confirmed pickup smoothly.');

-- Reports (Sample resolved and sample pending)
INSERT INTO reports (id, reported_by, target_type, target_id, reason, description, status, admin_notes) VALUES
('r0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'DONATION', 'd0000000-0000-0000-0000-000000000002', 'Packaging Clarification', 'Inquired whether bakery items require special plastic containers for rain weather.', 'RESOLVED', 'Clarified standard paper bags are sufficient if packed inside waterproof transport tote.');

-- Audit Logs
INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata, ip_address) VALUES
('a0000000-0000-0000-0000-000000000001', 'USER_REGISTERED', 'USER', 'a0000000-0000-0000-0000-000000000001', '{"role":"donor","org":"Green Harvest Bistro"}'::jsonb, '127.0.0.1'),
('a0000000-0000-0000-0000-000000000001', 'DONATION_CREATED', 'DONATION', 'd0000000-0000-0000-0000-000000000001', '{"title":"Hearty Vegetable Pilaf & Lentil Stew Trays","servings":35}'::jsonb, '127.0.0.1'),
('a0000000-0000-0000-0000-000000000002', 'DONATION_CLAIMED', 'DONATION', 'd0000000-0000-0000-0000-000000000004', '{"claimant":"volunteer"}'::jsonb, '127.0.0.1'),
('a0000000-0000-0000-0000-000000000002', 'FOOD_DELIVERED', 'DELIVERY', 'l0000000-0000-0000-0000-000000000002', '{"meals":50,"recipient":"Hope Outreach"}'::jsonb, '127.0.0.1');
