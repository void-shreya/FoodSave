const { v4: uuidv4 } = require('uuid');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { calculateDistanceKm } = require('../utils/geo');

// Seed Data for Local Resilience & Seamless Demo Execution
// Demo Password: Password123!
// Hash: $2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i
const initialSeed = () => {
  const now = new Date();
  const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const hoursFromNow = (h) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

  const users = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Green Harvest Bistro',
      email: 'donor@foodsave.org',
      phone: '+1 555-0101',
      password_hash: '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i',
      role: 'donor',
      is_verified: true,
      is_active: true,
      created_at: hoursAgo(72),
      updated_at: hoursAgo(72)
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      name: 'Alex Rivera',
      email: 'volunteer@foodsave.org',
      phone: '+1 555-0102',
      password_hash: '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i',
      role: 'volunteer',
      is_verified: true,
      is_active: true,
      created_at: hoursAgo(60),
      updated_at: hoursAgo(60)
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      name: 'Hope Outreach Foundation',
      email: 'ngo@foodsave.org',
      phone: '+1 555-0103',
      password_hash: '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i',
      role: 'ngo',
      is_verified: true,
      is_active: true,
      created_at: hoursAgo(90),
      updated_at: hoursAgo(90)
    },
    {
      id: 'a0000000-0000-0000-0000-000000000004',
      name: 'Sarah Chen (Admin)',
      email: 'admin@foodsave.org',
      phone: '+1 555-0104',
      password_hash: '$2b$10$86BEu0nuebUucsodTwohzuWT.2DlpigpfAr8jk6LkQ/pfdGxHn81i',
      role: 'admin',
      is_verified: true,
      is_active: true,
      created_at: hoursAgo(120),
      updated_at: hoursAgo(120)
    }
  ];

  const profiles = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      user_id: 'a0000000-0000-0000-0000-000000000001',
      profile_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      address: '45 Market Street',
      city: 'San Francisco',
      state: 'California',
      pincode: '94105',
      latitude: 37.7937,
      longitude: -122.3965,
      bio: 'Sustainable restaurant committed to reducing food waste and feeding our community.',
      created_at: hoursAgo(72),
      updated_at: hoursAgo(72)
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      user_id: 'a0000000-0000-0000-0000-000000000002',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      address: '128 Valencia St',
      city: 'San Francisco',
      state: 'California',
      pincode: '94103',
      latitude: 37.7701,
      longitude: -122.4221,
      bio: 'Dedicated community volunteer with bike & insulated bags for quick food transfers.',
      created_at: hoursAgo(60),
      updated_at: hoursAgo(60)
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      user_id: 'a0000000-0000-0000-0000-000000000003',
      profile_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=300&q=80',
      address: '800 Mission St',
      city: 'San Francisco',
      state: 'California',
      pincode: '94103',
      latitude: 37.7844,
      longitude: -122.4042,
      bio: 'Non-profit food pantry and shelter serving nutritious meals to over 400 people daily.',
      created_at: hoursAgo(90),
      updated_at: hoursAgo(90)
    },
    {
      id: 'b0000000-0000-0000-0000-000000000004',
      user_id: 'a0000000-0000-0000-0000-000000000004',
      profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      address: '100 FoodSave Plaza',
      city: 'San Francisco',
      state: 'California',
      pincode: '94107',
      latitude: 37.7749,
      longitude: -122.4194,
      bio: 'Platform operations and trust & safety administrator.',
      created_at: hoursAgo(120),
      updated_at: hoursAgo(120)
    }
  ];

  const organizations = [
    {
      id: 'o0000000-0000-0000-0000-000000000001',
      owner_id: 'a0000000-0000-0000-0000-000000000001',
      organization_name: 'Green Harvest Bistro',
      organization_type: 'RESTAURANT',
      registration_number: 'CA-REST-98214',
      description: 'Farm-to-table culinary kitchen specializing in organic dishes and zero-waste initiatives.',
      address: '45 Market Street',
      city: 'San Francisco',
      state: 'California',
      pincode: '94105',
      latitude: 37.7937,
      longitude: -122.3965,
      verification_status: 'VERIFIED',
      created_at: hoursAgo(72),
      updated_at: hoursAgo(72)
    },
    {
      id: 'o0000000-0000-0000-0000-000000000002',
      owner_id: 'a0000000-0000-0000-0000-000000000003',
      organization_name: 'Hope Outreach Foundation',
      organization_type: 'NGO',
      registration_number: '501C3-4482910',
      description: 'Regional charity organization distributing prepared meals and dry rations to underserved families.',
      address: '800 Mission St',
      city: 'San Francisco',
      state: 'California',
      pincode: '94103',
      latitude: 37.7844,
      longitude: -122.4042,
      verification_status: 'VERIFIED',
      created_at: hoursAgo(90),
      updated_at: hoursAgo(90)
    }
  ];

  const categories = [
    { id: 'c1', name: 'Cooked Meals', description: 'Freshly prepared hot or cold packaged meals and trays', icon: 'Utensils', is_active: true },
    { id: 'c2', name: 'Bakery & Bread', description: 'Fresh loaves, buns, croissants, baguettes, and pastries', icon: 'Croissant', is_active: true },
    { id: 'c3', name: 'Fruits & Vegetables', description: 'Uncut fresh produce, greens, seasonal fruits and vegetables', icon: 'Apple', is_active: true },
    { id: 'c4', name: 'Dairy Products', description: 'Pasteurized milk, yogurt, butter, and cheese packs', icon: 'Milk', is_active: true },
    { id: 'c5', name: 'Packaged & Dry Goods', description: 'Sealed boxed items, rice, pasta, canned goods, pulses', icon: 'Package', is_active: true },
    { id: 'c6', name: 'Beverages', description: 'Bottled juices, sealed drinks, plant milks, and tea packs', icon: 'Coffee', is_active: true }
  ];

  const food_donations = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      donor_id: 'a0000000-0000-0000-0000-000000000001',
      organization_id: 'o0000000-0000-0000-0000-000000000001',
      title: 'Hearty Vegetable Pilaf & Lentil Stew Trays',
      description: 'Freshly cooked gourmet rice pilaf with braised carrots, peas, and rich spiced yellow lentil stew. Packed in 5 sealed commercial catering trays.',
      food_category: 'Cooked Meals',
      quantity: 35,
      quantity_unit: 'servings',
      vegetarian: true,
      vegan: true,
      contains_allergens: false,
      allergen_details: 'No common allergens. Gluten-free.',
      prepared_at: hoursAgo(2),
      expiry_time: hoursFromNow(8),
      pickup_start_time: hoursAgo(0),
      pickup_end_time: hoursFromNow(4),
      pickup_address: '45 Market Street, Kitchen Loading Dock B',
      pickup_city: 'San Francisco',
      pickup_state: 'California',
      pickup_pincode: '94105',
      latitude: 37.7937,
      longitude: -122.3965,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      safety_confirmed: true,
      storage_instructions: 'Keep warm above 60°C or refrigerate upon pickup within 2 hours.',
      created_at: hoursAgo(2),
      updated_at: hoursAgo(2)
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      donor_id: 'a0000000-0000-0000-0000-000000000001',
      organization_id: 'o0000000-0000-0000-0000-000000000001',
      title: 'Artisan Sourdough Loaves & Croissants',
      description: 'End-of-shift bakery surplus: 12 sourdough boules, 18 butter croissants, and 10 multi-grain rolls baked this morning.',
      food_category: 'Bakery & Bread',
      quantity: 40,
      quantity_unit: 'items',
      vegetarian: true,
      vegan: false,
      contains_allergens: true,
      allergen_details: 'Wheat/Gluten, Dairy (butter in croissants)',
      prepared_at: hoursAgo(5),
      expiry_time: hoursFromNow(24),
      pickup_start_time: hoursAgo(0),
      pickup_end_time: hoursFromNow(6),
      pickup_address: '45 Market Street, Front Counter',
      pickup_city: 'San Francisco',
      pickup_state: 'California',
      pickup_pincode: '94105',
      latitude: 37.7937,
      longitude: -122.3965,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      safety_confirmed: true,
      storage_instructions: 'Store at ambient room temperature in dry conditions.',
      created_at: hoursAgo(5),
      updated_at: hoursAgo(5)
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      donor_id: 'a0000000-0000-0000-0000-000000000001',
      organization_id: 'o0000000-0000-0000-0000-000000000001',
      title: 'Fresh Organic Produce & Crisp Greens Box',
      description: 'High quality surplus romaine heads, crisp red bell peppers, zucchini, and seasonal apples from morning deliveries.',
      food_category: 'Fruits & Vegetables',
      quantity: 25,
      quantity_unit: 'kg',
      vegetarian: true,
      vegan: true,
      contains_allergens: false,
      allergen_details: 'None',
      prepared_at: hoursAgo(4),
      expiry_time: hoursFromNow(48),
      pickup_start_time: hoursFromNow(1),
      pickup_end_time: hoursFromNow(12),
      pickup_address: '45 Market Street, Rear Pantry Door',
      pickup_city: 'San Francisco',
      pickup_state: 'California',
      pickup_pincode: '94105',
      latitude: 37.7937,
      longitude: -122.3965,
      image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      safety_confirmed: true,
      storage_instructions: 'Keep chilled between 2°C - 5°C.',
      created_at: hoursAgo(4),
      updated_at: hoursAgo(4)
    },
    {
      id: 'd0000000-0000-0000-0000-000000000004',
      donor_id: 'a0000000-0000-0000-0000-000000000001',
      organization_id: 'o0000000-0000-0000-0000-000000000001',
      title: 'Creamy Tuscan Pasta & Garlic Bread',
      description: 'Freshly prepared penne pasta in garlic herb cream sauce with spinach and cherry tomatoes, plus 20 garlic bread slices.',
      food_category: 'Cooked Meals',
      quantity: 30,
      quantity_unit: 'servings',
      vegetarian: true,
      vegan: false,
      contains_allergens: true,
      allergen_details: 'Dairy, Gluten',
      prepared_at: hoursAgo(3),
      expiry_time: hoursFromNow(5),
      pickup_start_time: hoursAgo(1),
      pickup_end_time: hoursFromNow(3),
      pickup_address: '45 Market Street',
      pickup_city: 'San Francisco',
      pickup_state: 'California',
      pickup_pincode: '94105',
      latitude: 37.7937,
      longitude: -122.3965,
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
      status: 'CLAIMED',
      safety_confirmed: true,
      storage_instructions: 'Keep insulated or reheat to 75°C before serving.',
      created_at: hoursAgo(3),
      updated_at: hoursAgo(1)
    },
    {
      id: 'd0000000-0000-0000-0000-000000000005',
      donor_id: 'a0000000-0000-0000-0000-000000000001',
      organization_id: 'o0000000-0000-0000-0000-000000000001',
      title: 'Roasted Vegetable Grain Bowls & Citrus Salads',
      description: 'Healthy quinoa bowls with roasted sweet potatoes, black beans, kale, and fresh orange vinaigrette dressing.',
      food_category: 'Cooked Meals',
      quantity: 50,
      quantity_unit: 'servings',
      vegetarian: true,
      vegan: true,
      contains_allergens: false,
      allergen_details: 'None',
      prepared_at: hoursAgo(28),
      expiry_time: hoursAgo(16),
      pickup_start_time: hoursAgo(26),
      pickup_end_time: hoursAgo(22),
      pickup_address: '45 Market Street',
      pickup_city: 'San Francisco',
      pickup_state: 'California',
      pickup_pincode: '94105',
      latitude: 37.7937,
      longitude: -122.3965,
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      status: 'DELIVERED',
      safety_confirmed: true,
      storage_instructions: 'Delivered successfully to Hope Outreach Center.',
      created_at: hoursAgo(28),
      updated_at: hoursAgo(23)
    }
  ];

  const pickups = [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      donation_id: 'd0000000-0000-0000-0000-000000000004',
      volunteer_id: 'a0000000-0000-0000-0000-000000000002',
      ngo_id: 'a0000000-0000-0000-0000-000000000003',
      pickup_address: '45 Market Street, Kitchen Loading Dock B',
      scheduled_time: hoursFromNow(1),
      actual_pickup_time: null,
      status: 'ASSIGNED',
      notes: 'Volunteer Alex will pick up using insulated cargo bike',
      created_at: hoursAgo(1),
      updated_at: hoursAgo(1)
    },
    {
      id: 'p0000000-0000-0000-0000-000000000002',
      donation_id: 'd0000000-0000-0000-0000-000000000005',
      volunteer_id: 'a0000000-0000-0000-0000-000000000002',
      ngo_id: 'a0000000-0000-0000-0000-000000000003',
      pickup_address: '45 Market Street',
      scheduled_time: hoursAgo(25),
      actual_pickup_time: hoursAgo(24),
      status: 'COLLECTED',
      notes: 'Picked up in pristine condition, temperature verified.',
      created_at: hoursAgo(26),
      updated_at: hoursAgo(24)
    }
  ];

  const deliveries = [
    {
      id: 'l0000000-0000-0000-0000-000000000001',
      pickup_id: 'p0000000-0000-0000-0000-000000000001',
      volunteer_id: 'a0000000-0000-0000-0000-000000000002',
      ngo_id: 'a0000000-0000-0000-0000-000000000003',
      destination: 'Hope Outreach Community Dining Hall, 800 Mission St',
      delivery_time: null,
      status: 'PENDING',
      proof_image: null,
      notes: 'Scheduled for evening dinner distribution',
      created_at: hoursAgo(1)
    },
    {
      id: 'l0000000-0000-0000-0000-000000000002',
      pickup_id: 'p0000000-0000-0000-0000-000000000002',
      volunteer_id: 'a0000000-0000-0000-0000-000000000002',
      ngo_id: 'a0000000-0000-0000-0000-000000000003',
      destination: 'Hope Outreach Community Dining Hall, 800 Mission St',
      delivery_time: hoursAgo(23),
      status: 'DELIVERED',
      proof_image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
      notes: 'Successfully distributed 50 meals to families and seniors.',
      created_at: hoursAgo(25)
    }
  ];

  const beneficiaries = [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      ngo_id: 'a0000000-0000-0000-0000-000000000003',
      display_name: 'Downtown Youth & Children Center',
      category: 'CHILDREN',
      people_count: 45,
      location_area: 'SoMa District',
      notes: 'After-school meal support for local youth',
      created_at: hoursAgo(80),
      updated_at: hoursAgo(80)
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      ngo_id: 'a0000000-0000-0000-0000-000000000003',
      display_name: 'Golden Gate Senior Residence',
      category: 'ELDERLY',
      people_count: 60,
      location_area: 'Mission District',
      notes: 'Nutritious low-sodium meals for elderly residents',
      created_at: hoursAgo(75),
      updated_at: hoursAgo(75)
    },
    {
      id: 'f0000000-0000-0000-0000-000000000003',
      ngo_id: 'a0000000-0000-0000-0000-000000000003',
      display_name: 'Community Food Bank Line 4',
      category: 'LOW_INCOME_FAMILIES',
      people_count: 120,
      location_area: 'Tenderloin Area',
      notes: 'Weekly grocery and hot meal box pickup',
      created_at: hoursAgo(70),
      updated_at: hoursAgo(70)
    }
  ];

  const notifications = [
    {
      id: 'n1',
      user_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Welcome to FoodSave!',
      message: 'Thank you for joining FoodSave as a verified food donor. Your surplus food saves lives!',
      type: 'SYSTEM',
      is_read: true,
      link: '/dashboard',
      created_at: hoursAgo(72)
    },
    {
      id: 'n2',
      user_id: 'a0000000-0000-0000-0000-000000000001',
      title: 'Donation Claimed',
      message: 'Alex Rivera claimed your "Creamy Tuscan Pasta & Garlic Bread" donation.',
      type: 'DONATION_CLAIMED',
      is_read: false,
      link: '/my-donations',
      created_at: hoursAgo(1)
    },
    {
      id: 'n3',
      user_id: 'a0000000-0000-0000-0000-000000000002',
      title: 'Pickup Scheduled',
      message: 'You are assigned to collect 30 servings of Creamy Tuscan Pasta from Green Harvest Bistro.',
      type: 'PICKUP_ASSIGNED',
      is_read: false,
      link: '/pickups',
      created_at: hoursAgo(1)
    },
    {
      id: 'n4',
      user_id: 'a0000000-0000-0000-0000-000000000003',
      title: 'Meals Received',
      message: '50 servings of Roasted Vegetable Grain Bowls were delivered to your dining hall.',
      type: 'FOOD_DELIVERED',
      is_read: true,
      link: '/deliveries',
      created_at: hoursAgo(23)
    }
  ];

  const reviews = [
    {
      id: 'rw1',
      reviewer_id: 'a0000000-0000-0000-0000-000000000003',
      reviewee_id: 'a0000000-0000-0000-0000-000000000001',
      donation_id: 'd0000000-0000-0000-0000-000000000005',
      rating: 5,
      comment: 'The grain bowls were exceptionally fresh, beautifully packed, and loved by our community. Thank you!',
      created_at: hoursAgo(22)
    },
    {
      id: 'rw2',
      reviewer_id: 'a0000000-0000-0000-0000-000000000001',
      reviewee_id: 'a0000000-0000-0000-0000-000000000002',
      donation_id: 'd0000000-0000-0000-0000-000000000005',
      rating: 5,
      comment: 'Alex arrived on time with proper food grade thermal bags and confirmed pickup smoothly.',
      created_at: hoursAgo(22)
    }
  ];

  const reports = [
    {
      id: 'r0000000-0000-0000-0000-000000000001',
      reported_by: 'a0000000-0000-0000-0000-000000000002',
      target_type: 'DONATION',
      target_id: 'd0000000-0000-0000-0000-000000000002',
      reason: 'Packaging Clarification',
      description: 'Inquired whether bakery items require special plastic containers for rain weather.',
      status: 'RESOLVED',
      admin_notes: 'Clarified standard paper bags are sufficient if packed inside waterproof transport tote.',
      created_at: hoursAgo(4),
      updated_at: hoursAgo(2)
    }
  ];

  const audit_logs = [
    {
      id: 'log1',
      user_id: 'a0000000-0000-0000-0000-000000000001',
      action: 'USER_REGISTERED',
      entity: 'USER',
      entity_id: 'a0000000-0000-0000-0000-000000000001',
      metadata: { role: 'donor', org: 'Green Harvest Bistro' },
      ip_address: '127.0.0.1',
      created_at: hoursAgo(72)
    },
    {
      id: 'log2',
      user_id: 'a0000000-0000-0000-0000-000000000001',
      action: 'DONATION_CREATED',
      entity: 'DONATION',
      entity_id: 'd0000000-0000-0000-0000-000000000001',
      metadata: { title: 'Hearty Vegetable Pilaf & Lentil Stew Trays', servings: 35 },
      ip_address: '127.0.0.1',
      created_at: hoursAgo(2)
    },
    {
      id: 'log3',
      user_id: 'a0000000-0000-0000-0000-000000000002',
      action: 'DONATION_CLAIMED',
      entity: 'DONATION',
      entity_id: 'd0000000-0000-0000-0000-000000000004',
      metadata: { claimant: 'volunteer' },
      ip_address: '127.0.0.1',
      created_at: hoursAgo(1)
    },
    {
      id: 'log4',
      user_id: 'a0000000-0000-0000-0000-000000000002',
      action: 'FOOD_DELIVERED',
      entity: 'DELIVERY',
      entity_id: 'l0000000-0000-0000-0000-000000000002',
      metadata: { meals: 50, recipient: 'Hope Outreach' },
      ip_address: '127.0.0.1',
      created_at: hoursAgo(23)
    }
  ];

  return {
    users,
    profiles,
    organizations,
    categories,
    food_donations,
    pickups,
    deliveries,
    beneficiaries,
    notifications,
    reviews,
    reports,
    audit_logs
  };
};

class DatabaseService {
  constructor() {
    this.store = initialSeed();
  }

  // --- AUTO EXPIRATION ---
  autoExpireDonations() {
    const now = new Date();
    let expiredCount = 0;
    this.store.food_donations.forEach(donation => {
      if (['AVAILABLE', 'CLAIMED'].includes(donation.status)) {
        if (new Date(donation.expiry_time) <= now) {
          donation.status = 'EXPIRED';
          donation.updated_at = now.toISOString();
          expiredCount++;

          this.createNotification({
            userId: donation.donor_id,
            title: 'Donation Expired',
            message: `Your donation "${donation.title}" has reached its expiration time.`,
            type: 'DONATION_EXPIRED',
            link: '/my-donations'
          });
        }
      }
    });
    return expiredCount;
  }

  // --- USERS ---
  async findUserByEmail(email) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase().trim()).single();
      if (!error && data) return data;
    }
    return this.store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  async findUserById(id) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (!error && data) return data;
    }
    return this.store.users.find(u => u.id === id) || null;
  }

  async createUser(userData) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newUser = {
      id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || null,
      password_hash: userData.password_hash,
      role: userData.role || 'donor',
      is_verified: userData.role === 'admin' ? true : false,
      is_active: true,
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').insert(newUser).select().single();
      if (error) throw error;
      return data;
    }

    this.store.users.push(newUser);
    return newUser;
  }

  async updateUser(id, updateFields) {
    const now = new Date().toISOString();
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('users').update({ ...updateFields, updated_at: now }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }

    const idx = this.store.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.store.users[idx] = { ...this.store.users[idx], ...updateFields, updated_at: now };
    return this.store.users[idx];
  }

  async listUsers() {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('users').select('id, name, email, phone, role, is_verified, is_active, created_at, updated_at').order('created_at', { ascending: false });
      if (data) return data;
    }
    return this.store.users.map(({ password_hash, ...safeUser }) => safeUser);
  }

  // --- PROFILES ---
  async getProfileByUserId(userId) {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      if (data) return data;
    }
    return this.store.profiles.find(p => p.user_id === userId) || null;
  }

  async upsertProfile(userId, profileData) {
    const existing = await this.getProfileByUserId(userId);
    const now = new Date().toISOString();

    if (existing) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('profiles').update({ ...profileData, updated_at: now }).eq('user_id', userId).select().single();
        if (error) throw error;
        return data;
      }
      const idx = this.store.profiles.findIndex(p => p.user_id === userId);
      this.store.profiles[idx] = { ...this.store.profiles[idx], ...profileData, updated_at: now };
      return this.store.profiles[idx];
    } else {
      const newProfile = {
        id: uuidv4(),
        user_id: userId,
        profile_image: profileData.profile_image || null,
        address: profileData.address || null,
        city: profileData.city || null,
        state: profileData.state || null,
        pincode: profileData.pincode || null,
        latitude: profileData.latitude || null,
        longitude: profileData.longitude || null,
        bio: profileData.bio || null,
        created_at: now,
        updated_at: now
      };

      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
        if (error) throw error;
        return data;
      }

      this.store.profiles.push(newProfile);
      return newProfile;
    }
  }

  // --- ORGANIZATIONS ---
  async getOrganizationByOwnerId(ownerId) {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('organizations').select('*').eq('owner_id', ownerId).single();
      if (data) return data;
    }
    return this.store.organizations.find(o => o.owner_id === ownerId) || null;
  }

  async getOrganizationById(id) {
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('organizations').select('*').eq('id', id).single();
      if (data) return data;
    }
    return this.store.organizations.find(o => o.id === id) || null;
  }

  async createOrganization(orgData) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newOrg = {
      id,
      owner_id: orgData.owner_id,
      organization_name: orgData.organization_name,
      organization_type: orgData.organization_type || 'OTHER',
      registration_number: orgData.registration_number || null,
      description: orgData.description || null,
      address: orgData.address || null,
      city: orgData.city || null,
      state: orgData.state || null,
      pincode: orgData.pincode || null,
      latitude: orgData.latitude || null,
      longitude: orgData.longitude || null,
      verification_status: 'PENDING',
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('organizations').insert(newOrg).select().single();
      if (error) throw error;
      return data;
    }

    this.store.organizations.push(newOrg);
    return newOrg;
  }

  async updateOrganization(id, orgData) {
    const now = new Date().toISOString();
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('organizations').update({ ...orgData, updated_at: now }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
    const idx = this.store.organizations.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.store.organizations[idx] = { ...this.store.organizations[idx], ...orgData, updated_at: now };
    return this.store.organizations[idx];
  }

  async listOrganizations(filter = {}) {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('organizations').select('*');
      if (filter.type) query = query.eq('organization_type', filter.type);
      if (filter.verification_status) query = query.eq('verification_status', filter.verification_status);
      const { data } = await query;
      if (data) return data;
    }

    let results = [...this.store.organizations];
    if (filter.type) {
      results = results.filter(o => o.organization_type.toLowerCase() === filter.type.toLowerCase());
    }
    if (filter.verification_status) {
      results = results.filter(o => o.verification_status === filter.verification_status);
    }
    return results;
  }

  // --- CATEGORIES ---
  async listCategories() {
    return this.store.categories;
  }

  // --- FOOD DONATIONS ---
  async createDonation(donationData) {
    this.autoExpireDonations();

    const id = uuidv4();
    const now = new Date().toISOString();
    const newDonation = {
      id,
      donor_id: donationData.donor_id,
      organization_id: donationData.organization_id || null,
      title: donationData.title,
      description: donationData.description || '',
      food_category: donationData.food_category,
      quantity: Number(donationData.quantity),
      quantity_unit: donationData.quantity_unit || 'servings',
      vegetarian: Boolean(donationData.vegetarian),
      vegan: Boolean(donationData.vegan),
      contains_allergens: Boolean(donationData.contains_allergens),
      allergen_details: donationData.allergen_details || '',
      prepared_at: donationData.prepared_at,
      expiry_time: donationData.expiry_time,
      pickup_start_time: donationData.pickup_start_time,
      pickup_end_time: donationData.pickup_end_time,
      pickup_address: donationData.pickup_address,
      pickup_city: donationData.pickup_city,
      pickup_state: donationData.pickup_state || '',
      pickup_pincode: donationData.pickup_pincode || '',
      latitude: donationData.latitude ? Number(donationData.latitude) : 37.7749,
      longitude: donationData.longitude ? Number(donationData.longitude) : -122.4194,
      image_url: donationData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      status: 'AVAILABLE',
      safety_confirmed: Boolean(donationData.safety_confirmed),
      storage_instructions: donationData.storage_instructions || '',
      created_at: now,
      updated_at: now
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('food_donations').insert(newDonation).select().single();
      if (error) throw error;
      return data;
    }

    this.store.food_donations.unshift(newDonation);
    return newDonation;
  }

  async listDonations(filters = {}, userCoords = null) {
    this.autoExpireDonations();

    let list = [...this.store.food_donations];

    // Status filter (default to AVAILABLE for discovery)
    if (filters.status) {
      list = list.filter(d => d.status.toUpperCase() === filters.status.toUpperCase());
    } else if (filters.includeAllStatuses !== true) {
      list = list.filter(d => d.status === 'AVAILABLE');
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      list = list.filter(d => d.food_category.toLowerCase() === filters.category.toLowerCase());
    }

    // Veg / Vegan filter
    if (filters.vegetarian === true || filters.vegetarian === 'true') {
      list = list.filter(d => d.vegetarian === true);
    }
    if (filters.vegan === true || filters.vegan === 'true') {
      list = list.filter(d => d.vegan === true);
    }

    // City filter
    if (filters.city) {
      list = list.filter(d => d.pickup_city.toLowerCase().includes(filters.city.toLowerCase()));
    }

    // Search query (title or description)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q)));
    }

    // Attach donor and org display info
    list = list.map(d => {
      const donor = this.store.users.find(u => u.id === d.donor_id);
      const org = d.organization_id ? this.store.organizations.find(o => o.id === d.organization_id) : null;
      let distance_km = null;
      if (userCoords && userCoords.lat && userCoords.lng && d.latitude && d.longitude) {
        distance_km = calculateDistanceKm(userCoords.lat, userCoords.lng, d.latitude, d.longitude);
      }

      return {
        ...d,
        distance_km,
        donor_name: org ? org.organization_name : (donor ? donor.name : 'Verified Donor'),
        donor_type: org ? org.organization_type : 'INDIVIDUAL'
      };
    });

    // Distance max filter
    if (filters.maxDistance && userCoords) {
      const max = Number(filters.maxDistance);
      list = list.filter(d => d.distance_km === null || d.distance_km <= max);
    }

    // Sorting
    if (filters.sortBy === 'distance' && userCoords) {
      list.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    } else if (filters.sortBy === 'expiry') {
      list.sort((a, b) => new Date(a.expiry_time) - new Date(b.expiry_time));
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return list;
  }

  async getDonationById(id) {
    this.autoExpireDonations();
    const d = this.store.food_donations.find(item => item.id === id);
    if (!d) return null;

    const donor = this.store.users.find(u => u.id === d.donor_id);
    const org = d.organization_id ? this.store.organizations.find(o => o.id === d.organization_id) : null;
    const pickup = this.store.pickups.find(p => p.donation_id === d.id);
    const delivery = pickup ? this.store.deliveries.find(del => del.pickup_id === pickup.id) : null;

    return {
      ...d,
      donor: donor ? { id: donor.id, name: donor.name, email: donor.email, phone: donor.phone } : null,
      organization: org,
      pickup,
      delivery
    };
  }

  async listDonationsByDonor(donorId) {
    this.autoExpireDonations();
    const donations = this.store.food_donations.filter(d => d.donor_id === donorId);
    return donations.map(d => {
      const pickup = this.store.pickups.find(p => p.donation_id === d.id);
      return {
        ...d,
        pickup
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async updateDonation(id, donorId, updateData) {
    const donation = this.store.food_donations.find(d => d.id === id);
    if (!donation) throw new Error('Donation not found');
    if (donation.donor_id !== donorId) {
      const err = new Error('Unauthorized to modify this donation');
      err.statusCode = 403;
      throw err;
    }
    if (!['AVAILABLE', 'CLAIMED'].includes(donation.status)) {
      const err = new Error(`Cannot modify donation in status ${donation.status}`);
      err.statusCode = 400;
      throw err;
    }

    const now = new Date().toISOString();
    Object.assign(donation, updateData, { updated_at: now });
    return donation;
  }

  async cancelDonation(id, donorId, isAdmin = false) {
    const donation = this.store.food_donations.find(d => d.id === id);
    if (!donation) throw new Error('Donation not found');
    if (!isAdmin && donation.donor_id !== donorId) {
      const err = new Error('Unauthorized to cancel this donation');
      err.statusCode = 403;
      throw err;
    }
    if (['COLLECTED', 'IN_TRANSIT', 'DELIVERED'].includes(donation.status)) {
      const err = new Error('Cannot cancel a donation that is already collected or delivered');
      err.statusCode = 400;
      throw err;
    }

    donation.status = 'CANCELLED';
    donation.updated_at = new Date().toISOString();

    // Cancel any associated pickup
    const pickup = this.store.pickups.find(p => p.donation_id === id);
    if (pickup) {
      pickup.status = 'CANCELLED';
      pickup.updated_at = new Date().toISOString();
    }

    return donation;
  }

  // --- ATOMIC CLAIM WITH RACE-CONDITION PREVENTION ---
  async claimDonationAtomic(donationId, claimantId, claimantRole, destination = null, notes = null) {
    this.autoExpireDonations();

    const donation = this.store.food_donations.find(d => d.id === donationId);
    if (!donation) {
      return { success: false, error: 'DONATION_NOT_FOUND', message: 'Donation not found' };
    }

    if (donation.status !== 'AVAILABLE') {
      return { success: false, error: 'DONATION_UNAVAILABLE', message: `Donation is already ${donation.status}` };
    }

    const now = new Date();
    if (new Date(donation.expiry_time) <= now) {
      donation.status = 'EXPIRED';
      donation.updated_at = now.toISOString();
      return { success: false, error: 'DONATION_EXPIRED', message: 'This donation has expired and cannot be claimed' };
    }

    // Transition donation
    donation.status = 'CLAIMED';
    donation.updated_at = now.toISOString();

    const isVolunteer = claimantRole === 'volunteer';
    const pickupId = uuidv4();
    const newPickup = {
      id: pickupId,
      donation_id: donationId,
      volunteer_id: isVolunteer ? claimantId : null,
      ngo_id: isVolunteer ? null : claimantId,
      pickup_address: donation.pickup_address,
      scheduled_time: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(),
      actual_pickup_time: null,
      status: 'ASSIGNED',
      notes: notes || 'Pickup confirmed via FoodSave platform',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    this.store.pickups.push(newPickup);

    const deliveryId = uuidv4();
    const newDelivery = {
      id: deliveryId,
      pickup_id: pickupId,
      volunteer_id: isVolunteer ? claimantId : null,
      ngo_id: isVolunteer ? null : claimantId,
      destination: destination || 'Designated Community Food Center',
      delivery_time: null,
      status: 'PENDING',
      proof_image: null,
      notes: null,
      created_at: now.toISOString()
    };
    this.store.deliveries.push(newDelivery);

    // Notify Donor
    this.createNotification({
      userId: donation.donor_id,
      title: 'Donation Claimed!',
      message: `Your donation "${donation.title}" has been claimed for rescue.`,
      type: 'DONATION_CLAIMED',
      link: '/my-donations'
    });

    // Notify Volunteer or NGO
    this.createNotification({
      userId: claimantId,
      title: 'Pickup Confirmed',
      message: `You have successfully claimed "${donation.title}". Please prepare for pickup.`,
      type: 'PICKUP_ASSIGNED',
      link: '/pickups'
    });

    // Audit log
    this.createAuditLog({
      userId: claimantId,
      action: 'DONATION_CLAIMED',
      entity: 'DONATION',
      entityId: donationId,
      metadata: { role: claimantRole, pickupId, deliveryId }
    });

    return {
      success: true,
      message: 'Donation successfully claimed',
      donation,
      pickup: newPickup,
      delivery: newDelivery
    };
  }

  // --- PICKUPS ---
  async listPickups(user) {
    let list = [...this.store.pickups];
    if (user.role === 'volunteer') {
      list = list.filter(p => p.volunteer_id === user.id);
    } else if (user.role === 'ngo') {
      list = list.filter(p => p.ngo_id === user.id);
    } else if (user.role === 'donor') {
      const donorDonations = this.store.food_donations.filter(d => d.donor_id === user.id).map(d => d.id);
      list = list.filter(p => donorDonations.includes(p.donation_id));
    }

    return list.map(p => {
      const donation = this.store.food_donations.find(d => d.id === p.donation_id);
      const delivery = this.store.deliveries.find(del => del.pickup_id === p.id);
      const volunteer = p.volunteer_id ? this.store.users.find(u => u.id === p.volunteer_id) : null;
      return {
        ...p,
        donation,
        delivery,
        volunteer_name: volunteer ? volunteer.name : 'Assigned'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getPickupById(id) {
    const pickup = this.store.pickups.find(p => p.id === id);
    if (!pickup) return null;
    const donation = this.store.food_donations.find(d => d.id === pickup.donation_id);
    const delivery = this.store.deliveries.find(del => del.pickup_id === pickup.id);
    return { ...pickup, donation, delivery };
  }

  async updatePickupStatus(pickupId, userId, userRole, newStatus, notes = null) {
    const pickup = this.store.pickups.find(p => p.id === pickupId);
    if (!pickup) throw new Error('Pickup not found');

    if (userRole !== 'admin' && pickup.volunteer_id !== userId && pickup.ngo_id !== userId) {
      const err = new Error('Unauthorized to update this pickup');
      err.statusCode = 403;
      throw err;
    }

    const now = new Date().toISOString();
    pickup.status = newStatus;
    pickup.updated_at = now;
    if (notes) pickup.notes = notes;

    const donation = this.store.food_donations.find(d => d.id === pickup.donation_id);
    const delivery = this.store.deliveries.find(del => del.pickup_id === pickup.id);

    if (newStatus === 'COLLECTED') {
      pickup.actual_pickup_time = now;
      if (donation) donation.status = 'COLLECTED';
      if (delivery) delivery.status = 'IN_TRANSIT';

      if (donation) {
        this.createNotification({
          userId: donation.donor_id,
          title: 'Food Collected',
          message: `Your donation "${donation.title}" has been successfully collected by the volunteer!`,
          type: 'FOOD_COLLECTED',
          link: '/my-donations'
        });
      }

      this.createAuditLog({
        userId,
        action: 'FOOD_COLLECTED',
        entity: 'PICKUP',
        entityId: pickupId,
        metadata: { notes }
      });
    }

    return { pickup, donation, delivery };
  }

  // --- DELIVERIES ---
  async listDeliveries(user) {
    let list = [...this.store.deliveries];
    if (user.role === 'volunteer') {
      list = list.filter(d => d.volunteer_id === user.id);
    } else if (user.role === 'ngo') {
      list = list.filter(d => d.ngo_id === user.id);
    }

    return list.map(del => {
      const pickup = this.store.pickups.find(p => p.id === del.pickup_id);
      const donation = pickup ? this.store.food_donations.find(d => d.id === pickup.donation_id) : null;
      return {
        ...del,
        pickup,
        donation
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async updateDeliveryStatus(deliveryId, userId, userRole, newStatus, proof_image = null, notes = null) {
    const delivery = this.store.deliveries.find(d => d.id === deliveryId);
    if (!delivery) throw new Error('Delivery not found');

    if (userRole !== 'admin' && delivery.volunteer_id !== userId && delivery.ngo_id !== userId) {
      const err = new Error('Unauthorized to update this delivery');
      err.statusCode = 403;
      throw err;
    }

    const now = new Date().toISOString();
    delivery.status = newStatus;
    if (proof_image) delivery.proof_image = proof_image;
    if (notes) delivery.notes = notes;

    const pickup = this.store.pickups.find(p => p.id === delivery.pickup_id);
    const donation = pickup ? this.store.food_donations.find(d => d.id === pickup.donation_id) : null;

    if (newStatus === 'DELIVERED') {
      delivery.delivery_time = now;
      if (donation) donation.status = 'DELIVERED';

      if (donation) {
        this.createNotification({
          userId: donation.donor_id,
          title: 'Food Delivered! 🎉',
          message: `Great news! "${donation.title}" has reached its community destination safely.`,
          type: 'FOOD_DELIVERED',
          link: '/my-donations'
        });
      }

      this.createAuditLog({
        userId,
        action: 'FOOD_DELIVERED',
        entity: 'DELIVERY',
        entityId: deliveryId,
        metadata: { destination: delivery.destination, notes }
      });
    }

    return { delivery, pickup, donation };
  }

  // --- BENEFICIARIES (NGO) ---
  async listBeneficiariesByNgo(ngoId) {
    return this.store.beneficiaries.filter(b => b.ngo_id === ngoId);
  }

  async createBeneficiary(ngoId, data) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newB = {
      id,
      ngo_id: ngoId,
      display_name: data.display_name,
      category: data.category || 'COMMUNITY',
      people_count: Number(data.people_count),
      location_area: data.location_area,
      notes: data.notes || '',
      created_at: now,
      updated_at: now
    };
    this.store.beneficiaries.push(newB);
    return newB;
  }

  async deleteBeneficiary(id, ngoId) {
    const idx = this.store.beneficiaries.findIndex(b => b.id === id && b.ngo_id === ngoId);
    if (idx === -1) return false;
    this.store.beneficiaries.splice(idx, 1);
    return true;
  }

  // --- NOTIFICATIONS ---
  async listNotifications(userId) {
    return this.store.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  createNotification({ userId, title, message, type = 'SYSTEM', link = null }) {
    const n = {
      id: uuidv4(),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      link,
      created_at: new Date().toISOString()
    };
    this.store.notifications.unshift(n);
    return n;
  }

  async markNotificationRead(id, userId) {
    const n = this.store.notifications.find(item => item.id === id && item.user_id === userId);
    if (n) {
      n.is_read = true;
      return n;
    }
    return null;
  }

  async markAllNotificationsRead(userId) {
    let count = 0;
    this.store.notifications.forEach(n => {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        count++;
      }
    });
    return count;
  }

  // --- REPORTS ---
  async createReport(userId, data) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const r = {
      id,
      reported_by: userId,
      target_type: data.target_type || 'DONATION',
      target_id: data.target_id,
      reason: data.reason,
      description: data.description,
      status: 'PENDING',
      admin_notes: null,
      created_at: now,
      updated_at: now
    };
    this.store.reports.unshift(r);
    return r;
  }

  async listReports(statusFilter = null) {
    let list = [...this.store.reports];
    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter(r => r.status === statusFilter);
    }
    return list.map(r => {
      const reporter = this.store.users.find(u => u.id === r.reported_by);
      return {
        ...r,
        reporter_name: reporter ? reporter.name : 'Unknown User',
        reporter_email: reporter ? reporter.email : ''
      };
    });
  }

  async updateReport(id, status, adminNotes = '') {
    const r = this.store.reports.find(item => item.id === id);
    if (!r) throw new Error('Report not found');
    r.status = status;
    r.admin_notes = adminNotes;
    r.updated_at = new Date().toISOString();
    return r;
  }

  // --- REVIEWS ---
  async createReview(reviewerId, data) {
    const id = uuidv4();
    const r = {
      id,
      reviewer_id: reviewerId,
      reviewee_id: data.reviewee_id,
      donation_id: data.donation_id,
      rating: Number(data.rating),
      comment: data.comment || '',
      created_at: new Date().toISOString()
    };
    this.store.reviews.push(r);
    return r;
  }

  async listReviewsForUser(userId) {
    return this.store.reviews
      .filter(r => r.reviewee_id === userId)
      .map(r => {
        const reviewer = this.store.users.find(u => u.id === r.reviewer_id);
        return { ...r, reviewer_name: reviewer ? reviewer.name : 'Verified Member' };
      });
  }

  // --- AUDIT LOGS ---
  createAuditLog({ userId, action, entity, entityId, metadata = {}, ipAddress = '127.0.0.1' }) {
    const log = {
      id: uuidv4(),
      user_id: userId || null,
      action,
      entity,
      entity_id: entityId || null,
      metadata,
      ip_address: ipAddress,
      created_at: new Date().toISOString()
    };
    this.store.audit_logs.unshift(log);
    return log;
  }

  async listAuditLogs(limit = 100) {
    return this.store.audit_logs.slice(0, limit).map(log => {
      const user = log.user_id ? this.store.users.find(u => u.id === log.user_id) : null;
      return {
        ...log,
        user_name: user ? user.name : 'System/Anonymous',
        user_email: user ? user.email : ''
      };
    });
  }

  // --- PLATFORM STATS & IMPACT CALCULATIONS ---
  async getPlatformStats() {
    this.autoExpireDonations();

    const totalUsers = this.store.users.length;
    const totalDonors = this.store.users.filter(u => u.role === 'donor').length;
    const totalVolunteers = this.store.users.filter(u => u.role === 'volunteer').length;
    const totalNgos = this.store.users.filter(u => u.role === 'ngo').length;

    const totalDonations = this.store.food_donations.length;
    const activeDonations = this.store.food_donations.filter(d => ['AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED'].includes(d.status)).length;
    const completedDonations = this.store.food_donations.filter(d => d.status === 'DELIVERED').length;

    // Rescued servings & kg
    let totalServingsRescued = 0;
    this.store.food_donations.forEach(d => {
      if (['COLLECTED', 'IN_TRANSIT', 'DELIVERED'].includes(d.status)) {
        totalServingsRescued += Number(d.quantity) || 0;
      }
    });

    const pendingReports = this.store.reports.filter(r => r.status === 'PENDING').length;
    const pendingNgoVerifications = this.store.organizations.filter(o => o.organization_type === 'NGO' && o.verification_status === 'PENDING').length;

    return {
      totalUsers,
      totalDonors,
      totalVolunteers,
      totalNgos,
      totalDonations,
      activeDonations,
      completedDonations,
      totalServingsRescued,
      pendingReports,
      pendingNgoVerifications
    };
  }

  async getImpactMetrics() {
    this.autoExpireDonations();

    let mealsRescued = 0;
    let kgRescued = 0;

    this.store.food_donations.forEach(d => {
      if (['COLLECTED', 'IN_TRANSIT', 'DELIVERED'].includes(d.status)) {
        const qty = Number(d.quantity) || 0;
        if (d.quantity_unit === 'servings' || d.quantity_unit === 'items') {
          mealsRescued += qty;
          kgRescued += qty * 0.4; // Average 400g per meal
        } else if (d.quantity_unit === 'kg') {
          kgRescued += qty;
          mealsRescued += Math.round(qty / 0.4);
        } else {
          mealsRescued += qty;
          kgRescued += qty * 0.4;
        }
      }
    });

    // Environmental impact: ~2.5 kg CO2 equivalent saved per kg of food rescued
    const co2SavedKg = Math.round(kgRescued * 2.5);

    // Communities and people served
    const peopleCount = this.store.beneficiaries.reduce((acc, b) => acc + (b.people_count || 0), 0) + mealsRescued;

    return {
      mealsRescued: Math.max(mealsRescued, 85),
      kgRescued: Math.round(Math.max(kgRescued, 34)),
      co2SavedKg: Math.max(co2SavedKg, 85),
      activeDonors: this.store.users.filter(u => u.role === 'donor').length,
      activeVolunteers: this.store.users.filter(u => u.role === 'volunteer').length,
      ngosOnboarded: this.store.organizations.filter(o => o.organization_type === 'NGO').length,
      peopleServed: Math.max(peopleCount, 225)
    };
  }
}

// Singleton database instance
const db = new DatabaseService();

module.exports = db;
