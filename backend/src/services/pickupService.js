const db = require('../models/db');

class PickupService {
  async claimDonation(donationId, user, destination = null, notes = null, ipAddress = '127.0.0.1') {
    if (!['volunteer', 'ngo', 'admin'].includes(user.role)) {
      const err = new Error('Only verified volunteers or NGOs can claim food donations');
      err.statusCode = 403;
      err.code = 'FORBIDDEN_ROLE';
      throw err;
    }

    const result = await db.claimDonationAtomic(
      donationId,
      user.id,
      user.role,
      destination,
      notes
    );

    if (!result.success) {
      const err = new Error(result.message);
      if (result.error === 'DONATION_UNAVAILABLE') {
        err.statusCode = 409;
      } else if (result.error === 'DONATION_EXPIRED') {
        err.statusCode = 410;
      } else if (result.error === 'DONATION_NOT_FOUND') {
        err.statusCode = 404;
      } else {
        err.statusCode = 400;
      }
      err.code = result.error;
      throw err;
    }

    return result;
  }

  async listPickups(user) {
    return db.listPickups(user);
  }

  async getPickupById(id, user) {
    const pickup = await db.getPickupById(id);
    if (!pickup) {
      const err = new Error('Pickup record not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    // Role ownership check
    if (
      user.role !== 'admin' &&
      pickup.volunteer_id !== user.id &&
      pickup.ngo_id !== user.id &&
      pickup.donation && pickup.donation.donor_id !== user.id
    ) {
      const err = new Error('Unauthorized to view this pickup record');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return pickup;
  }

  async updatePickupStatus(id, user, status, notes = null) {
    return db.updatePickupStatus(id, user.id, user.role, status, notes);
  }
}

module.exports = new PickupService();
