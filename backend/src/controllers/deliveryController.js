const deliveryService = require('../services/deliveryService');

class DeliveryController {
  async listDeliveries(req, res, next) {
    try {
      const deliveries = await deliveryService.listDeliveries(req.user);
      res.status(200).json({
        success: true,
        count: deliveries.length,
        data: deliveries
      });
    } catch (err) {
      next(err);
    }
  }

  async getDeliveryById(req, res, next) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: delivery
      });
    } catch (err) {
      next(err);
    }
  }

  async updateDeliveryStatus(req, res, next) {
    try {
      const { status, proof_image, notes } = req.body;
      const result = await deliveryService.updateDeliveryStatus(req.params.id, req.user, status, proof_image, notes);
      res.status(200).json({
        success: true,
        message: `Delivery status updated to ${status}`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DeliveryController();
