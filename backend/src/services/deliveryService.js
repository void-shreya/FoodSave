const db = require('../models/db');

class DeliveryService {
  async listDeliveries(user) {
    return db.listDeliveries(user);
  }

  async getDeliveryById(id, user) {
    const deliveries = await db.listDeliveries(user);
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) {
      const err = new Error('Delivery record not found or access denied');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return delivery;
  }

  async updateDeliveryStatus(id, user, status, proofImage = null, notes = null) {
    return db.updateDeliveryStatus(id, user.id, user.role, status, proofImage, notes);
  }
}

module.exports = new DeliveryService();
