const reportService = require('../services/reportService');

class ReportController {
  async createReport(req, res, next) {
    try {
      const report = await reportService.createReport(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Your report has been submitted for investigation.',
        data: report
      });
    } catch (err) {
      next(err);
    }
  }

  async listUserReports(req, res, next) {
    try {
      const reports = await reportService.listUserReports(req.user.id);
      res.status(200).json({
        success: true,
        count: reports.length,
        data: reports
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
