const db = require('../models/db');

class DonationService {
  async createDonation(user, data, ipAddress = '127.0.0.1') {
    // Only donors and admins can create donations
    if (!['donor', 'admin'].includes(user.role)) {
      const err = new Error('Only registered food donors can list food donations');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    // Food Safety Confirmation Check
    if (!data.safety_confirmed) {
      const err = new Error('You must confirm that this food is safe for consumption and has been handled appropriately.');
      err.statusCode = 422;
      err.code = 'FOOD_SAFETY_UNCONFIRMED';
      throw err;
    }

    // Check expiry
    const preparedAt = new Date(data.prepared_at);
    const expiryTime = new Date(data.expiry_time);
    if (expiryTime <= preparedAt) {
      const err = new Error('Expiry time must be strictly after the preparation time.');
      err.statusCode = 422;
      err.code = 'INVALID_EXPIRY_TIME';
      throw err;
    }
    if (expiryTime <= new Date()) {
      const err = new Error('Donation cannot be listed after its expiry time.');
      err.statusCode = 422;
      err.code = 'ALREADY_EXPIRED';
      throw err;
    }

    const org = await db.getOrganizationByOwnerId(user.id);

    const donation = await db.createDonation({
      donor_id: user.id,
      organization_id: org ? org.id : null,
      title: data.title,
      description: data.description,
      food_category: data.food_category,
      quantity: data.quantity,
      quantity_unit: data.quantity_unit,
      vegetarian: data.vegetarian,
      vegan: data.vegan,
      contains_allergens: data.contains_allergens,
      allergen_details: data.allergen_details,
      prepared_at: data.prepared_at,
      expiry_time: data.expiry_time,
      pickup_start_time: data.pickup_start_time,
      pickup_end_time: data.pickup_end_time,
      pickup_address: data.pickup_address,
      pickup_city: data.pickup_city,
      pickup_state: data.pickup_state,
      pickup_pincode: data.pickup_pincode,
      latitude: data.latitude,
      longitude: data.longitude,
      image_url: data.image_url,
      safety_confirmed: data.safety_confirmed,
      storage_instructions: data.storage_instructions
    });

    db.createAuditLog({
      userId: user.id,
      action: 'DONATION_CREATED',
      entity: 'DONATION',
      entityId: donation.id,
      metadata: { title: donation.title, quantity: donation.quantity },
      ipAddress
    });

    return donation;
  }

  async listDonations(query = {}, user = null) {
    const filters = {
      category: query.category,
      vegetarian: query.vegetarian,
      vegan: query.vegan,
      city: query.city,
      search: query.search,
      status: query.status,
      maxDistance: query.maxDistance,
      sortBy: query.sortBy
    };

    let userCoords = null;
    if (query.lat && query.lng) {
      userCoords = { lat: parseFloat(query.lat), lng: parseFloat(query.lng) };
    } else if (user) {
      const profile = await db.getProfileByUserId(user.id);
      if (profile && profile.latitude && profile.longitude) {
        userCoords = { lat: Number(profile.latitude), lng: Number(profile.longitude) };
      }
    }

    return db.listDonations(filters, userCoords);
  }

  async getDonationById(id) {
    const donation = await db.getDonationById(id);
    if (!donation) {
      const err = new Error('Donation not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return donation;
  }

  async getMyDonations(donorId) {
    return db.listDonationsByDonor(donorId);
  }

  async updateDonation(id, user, updateData) {
    return db.updateDonation(id, user.id, updateData);
  }

  async cancelDonation(id, user) {
    const isAdmin = user.role === 'admin';
    return db.cancelDonation(id, user.id, isAdmin);
  }
}

module.exports = new DonationService();
