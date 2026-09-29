const pickupService = require('../services/pickupService');

class PickupController {
  async claimDonation(req, res, next) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const { destination, notes } = req.body;
      const result = await pickupService.claimDonation(req.params.id, req.user, destination, notes, ip);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async listPickups(req, res, next) {
    try {
      const pickups = await pickupService.listPickups(req.user);
      res.status(200).json({
        success: true,
        count: pickups.length,
        data: pickups
      });
    } catch (err) {
      next(err);
    }
  }

  async getPickupById(req, res, next) {
    try {
      const pickup = await pickupService.getPickupById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        data: pickup
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePickupStatus(req, res, next) {
    try {
      const { status, notes } = req.body;
      const result = await pickupService.updatePickupStatus(req.params.id, req.user, status, notes);
      res.status(200).json({
        success: true,
        message: `Pickup marked as ${status}`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PickupController();
