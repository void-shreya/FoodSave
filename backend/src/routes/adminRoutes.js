const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { updateReportValidator } = require('../validators/reportValidators');

// Protect all admin routes: requireAuth + requireRole('admin')
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.listUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/donations', adminController.listDonations);
router.get('/reports', adminController.listReports);
router.put('/reports/:id', updateReportValidator, validate, adminController.updateReport);
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
