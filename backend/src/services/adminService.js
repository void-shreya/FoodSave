const db = require('../models/db');

class AdminService {
  async getDashboardStats() {
    const stats = await db.getPlatformStats();
    const recentLogs = await db.listAuditLogs(10);
    const recentReports = await db.listReports('PENDING');

    return {
      stats,
      recentLogs,
      recentReports
    };
  }

  async listUsers() {
    return db.listUsers();
  }

  async updateUserStatus(userId, isActive, adminId) {
    const user = await db.updateUser(userId, { is_active: isActive });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    db.createAuditLog({
      userId: adminId,
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entity: 'USER',
      entityId: userId,
      metadata: { target_email: user.email, is_active: isActive }
    });

    return user;
  }

  async listAllDonations() {
    return db.listDonations({ includeAllStatuses: true });
  }

  async listReports(status = null) {
    return db.listReports(status);
  }

  async updateReport(id, status, adminNotes, adminId) {
    const report = await db.updateReport(id, status, adminNotes);
    db.createAuditLog({
      userId: adminId,
      action: 'REPORT_UPDATED',
      entity: 'REPORT',
      entityId: id,
      metadata: { status, adminNotes }
    });
    return report;
  }

  async listAuditLogs(limit = 100) {
    return db.listAuditLogs(limit);
  }
}

module.exports = new AdminService();
