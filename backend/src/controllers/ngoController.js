const ngoService = require('../services/ngoService');

class NgoController {
  async listNgos(req, res, next) {
    try {
      const ngos = await ngoService.listNgos();
      res.status(200).json({
        success: true,
        count: ngos.length,
        data: ngos
      });
    } catch (err) {
      next(err);
    }
  }

  async getNgoById(req, res, next) {
    try {
      const ngo = await ngoService.getNgoById(req.params.id);
      res.status(200).json({
        success: true,
        data: ngo
      });
    } catch (err) {
      next(err);
    }
  }

  async listBeneficiaries(req, res, next) {
    try {
      const beneficiaries = await ngoService.listBeneficiaries(req.user.id);
      res.status(200).json({
        success: true,
        count: beneficiaries.length,
        data: beneficiaries
      });
    } catch (err) {
      next(err);
    }
  }

  async createBeneficiary(req, res, next) {
    try {
      const b = await ngoService.createBeneficiary(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Beneficiary group added',
        data: b
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteBeneficiary(req, res, next) {
    try {
      const deleted = await ngoService.deleteBeneficiary(req.params.id, req.user.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Beneficiary not found' });
      }
      res.status(200).json({
        success: true,
        message: 'Beneficiary group removed'
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyNgo(req, res, next) {
    try {
      const { status } = req.body;
      const org = await ngoService.verifyNgo(req.params.id, req.user.id, status || 'VERIFIED');
      res.status(200).json({
        success: true,
        message: `NGO verification status updated to ${status || 'VERIFIED'}`,
        data: org
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NgoController();
