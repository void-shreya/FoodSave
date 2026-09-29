const donationService = require('../services/donationService');

class DonationController {
  async createDonation(req, res, next) {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const donation = await donationService.createDonation(req.user, req.body, ip);
      res.status(201).json({
        success: true,
        message: 'Food donation created successfully',
        data: donation
      });
    } catch (err) {
      next(err);
    }
  }

  async listDonations(req, res, next) {
    try {
      const donations = await donationService.listDonations(req.query, req.user);
      res.status(200).json({
        success: true,
        count: donations.length,
        data: donations
      });
    } catch (err) {
      next(err);
    }
  }

  async getDonationById(req, res, next) {
    try {
      const donation = await donationService.getDonationById(req.params.id);
      res.status(200).json({
        success: true,
        data: donation
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyDonations(req, res, next) {
    try {
      const donations = await donationService.getMyDonations(req.user.id);
      res.status(200).json({
        success: true,
        count: donations.length,
        data: donations
      });
    } catch (err) {
      next(err);
    }
  }

  async updateDonation(req, res, next) {
    try {
      const updated = await donationService.updateDonation(req.params.id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: 'Donation updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelDonation(req, res, next) {
    try {
      const cancelled = await donationService.cancelDonation(req.params.id, req.user);
      res.status(200).json({
        success: true,
        message: 'Donation cancelled successfully',
        data: cancelled
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DonationController();
