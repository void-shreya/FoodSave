const { body } = require('express-validator');

const updatePickupStatusValidator = [
  body('status')
    .isIn(['ASSIGNED', 'SCHEDULED', 'COLLECTED', 'MISSED', 'CANCELLED'])
    .withMessage('Invalid pickup status'),
  body('notes').optional().trim()
];

const updateDeliveryStatusValidator = [
  body('status')
    .isIn(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'])
    .withMessage('Invalid delivery status'),
  body('proof_image').optional().trim(),
  body('notes').optional().trim()
];

module.exports = {
  updatePickupStatusValidator,
  updateDeliveryStatusValidator
};
