const impactService = require('../services/impactService');

class ImpactController {
  async getMetrics(req, res, next) {
    try {
      const data = await impactService.getMetrics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ImpactController();
