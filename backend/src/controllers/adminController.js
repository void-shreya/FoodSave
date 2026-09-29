const adminService = require('../services/adminService');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req, res, next) {
    try {
      const users = await adminService.listUsers();
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { is_active } = req.body;
      const user = await adminService.updateUserStatus(req.params.id, is_active, req.user.id);
      res.status(200).json({
        success: true,
        message: `User status changed to ${is_active ? 'active' : 'suspended'}`,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async listDonations(req, res, next) {
    try {
      const donations = await adminService.listAllDonations();
      res.status(200).json({
        success: true,
        count: donations.length,
        data: donations
      });
    } catch (err) {
      next(err);
    }
  }

  async listReports(req, res, next) {
    try {
      const reports = await adminService.listReports(req.query.status);
      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (err) {
      next(err);
    }
  }

  async updateReport(req, res, next) {
    try {
      const { status, admin_notes } = req.body;
      const report = await adminService.updateReport(req.params.id, status, admin_notes, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Report updated',
        data: report
      });
    } catch (err) {
      next(err);
    }
  }

  async listAuditLogs(req, res, next) {
    try {
      const logs = await adminService.listAuditLogs(req.query.limit ? parseInt(req.query.limit) : 100);
      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
