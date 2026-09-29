const { body } = require('express-validator');

const createReportValidator = [
  body('target_id')
    .notEmpty()
    .withMessage('Target identifier is required'),
  body('target_type')
    .isIn(['DONATION', 'USER', 'PICKUP', 'OTHER'])
    .withMessage('Target type must be DONATION, USER, PICKUP, or OTHER'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason for report is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Reason must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Detailed description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters')
];

const updateReportValidator = [
  body('status')
    .isIn(['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'])
    .withMessage('Invalid report status'),
  body('admin_notes').optional().trim()
];

module.exports = {
  createReportValidator,
  updateReportValidator
};
