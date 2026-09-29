const db = require('../models/db');

class ReportService {
  async createReport(userId, data) {
    const report = await db.createReport(userId, data);
    db.createAuditLog({
      userId,
      action: 'REPORT_SUBMITTED',
      entity: 'REPORT',
      entityId: report.id,
      metadata: { target_type: data.target_type, target_id: data.target_id }
    });
    return report;
  }

  async listUserReports(userId) {
    const all = await db.listReports();
    return all.filter(r => r.reported_by === userId);
  }
}

module.exports = new ReportService();
