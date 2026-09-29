const db = require('../models/db');

class ImpactService {
  async getMetrics() {
    return db.getImpactMetrics();
  }
}

module.exports = new ImpactService();
