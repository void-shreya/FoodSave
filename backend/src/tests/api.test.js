const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');

test('GET /api/health should return 200 and healthy status', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, 'healthy');
});

test('POST /api/auth/login with valid demo donor credentials', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'donor@foodsave.org',
      password: 'Password123!'
    });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.token);
  assert.strictEqual(res.body.data.user.role, 'donor');
});

test('POST /api/auth/login with invalid password should return 401', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'donor@foodsave.org',
      password: 'WrongPassword!'
    });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.success, false);
});

test('POST /api/donations without token should return 401', async () => {
  const res = await request(app)
    .post('/api/donations')
    .send({
      title: 'Unauthorized donation',
      quantity: 10
    });
  assert.strictEqual(res.statusCode, 401);
});

test('Volunteer cannot create donations (role guard check)', async () => {
  // Login as volunteer
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'volunteer@foodsave.org',
      password: 'Password123!'
    });
  const token = loginRes.body.data.token;

  const res = await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Meal',
      food_category: 'Cooked Meals',
      quantity: 10,
      quantity_unit: 'servings',
      prepared_at: new Date().toISOString(),
      expiry_time: new Date(Date.now() + 4 * 3600000).toISOString(),
      pickup_start_time: new Date().toISOString(),
      pickup_end_time: new Date(Date.now() + 2 * 3600000).toISOString(),
      pickup_address: '123 Main St',
      pickup_city: 'San Francisco',
      safety_confirmed: true
    });
  assert.strictEqual(res.statusCode, 403);
});

test('Donor can list food donation with mandatory safety confirmation', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'donor@foodsave.org',
      password: 'Password123!'
    });
  const token = loginRes.body.data.token;

  const now = Date.now();
  const res = await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Freshly Baked Bagels & Cream Cheese',
      food_category: 'Bakery & Bread',
      quantity: 20,
      quantity_unit: 'items',
      vegetarian: true,
      vegan: false,
      prepared_at: new Date(now - 3600000).toISOString(),
      expiry_time: new Date(now + 12 * 3600000).toISOString(),
      pickup_start_time: new Date(now).toISOString(),
      pickup_end_time: new Date(now + 6 * 3600000).toISOString(),
      pickup_address: '45 Market Street',
      pickup_city: 'San Francisco',
      safety_confirmed: true
    });

  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.status, 'AVAILABLE');
});

test('Donation creation fails if safety_confirmed is false or missing', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'donor@foodsave.org',
      password: 'Password123!'
    });
  const token = loginRes.body.data.token;

  const now = Date.now();
  const res = await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Unconfirmed Safety Dish',
      food_category: 'Cooked Meals',
      quantity: 10,
      quantity_unit: 'servings',
      prepared_at: new Date(now - 3600000).toISOString(),
      expiry_time: new Date(now + 12 * 3600000).toISOString(),
      pickup_start_time: new Date(now).toISOString(),
      pickup_end_time: new Date(now + 6 * 3600000).toISOString(),
      pickup_address: '45 Market Street',
      pickup_city: 'San Francisco',
      safety_confirmed: false
    });

  assert.strictEqual(res.statusCode, 422);
});

test('Volunteer can claim an available donation and duplicate claim is prevented', async () => {
  // Login volunteer
  const volLogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'volunteer@foodsave.org',
      password: 'Password123!'
    });
  const volToken = volLogin.body.data.token;

  // Claim donation #1
  const claimRes = await request(app)
    .post('/api/donations/d0000000-0000-0000-0000-000000000001/request-pickup')
    .set('Authorization', `Bearer ${volToken}`)
    .send({
      destination: 'Community Shelter 5'
    });

  assert.strictEqual(claimRes.statusCode, 200);
  assert.strictEqual(claimRes.body.success, true);

  // Attempt duplicate claim on same donation
  const duplicateClaimRes = await request(app)
    .post('/api/donations/d0000000-0000-0000-0000-000000000001/request-pickup')
    .set('Authorization', `Bearer ${volToken}`)
    .send({
      destination: 'Shelter 2'
    });

  assert.strictEqual(duplicateClaimRes.statusCode, 409);
  assert.strictEqual(duplicateClaimRes.body.success, false);
});

test('POST /api/auth/register should fail if trying to register as admin', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Sneaky Hacker',
      email: 'hacker@foodsave.org',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'admin'
    });
  assert.strictEqual(res.statusCode, 422);
  assert.strictEqual(res.body.success, false);
});

test('POST /api/auth/register successful for new volunteer', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Maria Santos',
      email: 'maria.volunteer@foodsave.org',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'volunteer',
      city: 'San Francisco'
    });
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.user.role, 'volunteer');
});

test('POST /api/auth/forgot-password returns success message', async () => {
  const res = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'donor@foodsave.org' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
});

test('GET /api/ai/quick-prompts returns categorized prompt suggestions', async () => {
  const res = await request(app).get('/api/ai/quick-prompts');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 3);
});

test('POST /api/ai/chat answers food safety and donation questions', async () => {
  const res = await request(app)
    .post('/api/ai/chat')
    .send({
      message: 'What is the temperature danger zone for cooked food?'
    });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.reply.includes('Danger Zone') || res.body.data.reply.includes('4°C'));
  assert.ok(Array.isArray(res.body.data.suggestedQuestions));
});

test('POST /api/ai/safety-check evaluates food safety compliance', async () => {
  const res = await request(app)
    .post('/api/ai/safety-check')
    .send({
      food_category: 'Cooked Meals',
      prepared_at: new Date(Date.now() - 3600000).toISOString(),
      expiry_time: new Date(Date.now() + 6 * 3600000).toISOString(),
      contains_allergens: true,
      allergen_details: 'Dairy, Wheat',
      quantity: 15,
      quantity_unit: 'servings'
    });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.safetyScore >= 80);
  assert.strictEqual(res.body.data.status, 'APPROVED');
});


