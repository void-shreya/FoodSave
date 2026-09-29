const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createReportValidator } = require('../validators/reportValidators');

router.post('/', requireAuth, createReportValidator, validate, reportController.createReport);
router.get('/my', requireAuth, reportController.listUserReports);

module.exports = router;
