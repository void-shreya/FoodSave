const { body } = require('express-validator');

const createDonationValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Food donation title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('food_category')
    .trim()
    .notEmpty()
    .withMessage('Food category is required'),
  body('quantity')
    .isFloat({ min: 0.1 })
    .withMessage('Quantity must be a positive number greater than 0'),
  body('quantity_unit')
    .trim()
    .notEmpty()
    .withMessage('Quantity unit is required (e.g., servings, kg, items, boxes)'),
  body('prepared_at')
    .isISO8601()
    .withMessage('A valid preparation date/time is required'),
  body('expiry_time')
    .isISO8601()
    .withMessage('A valid expiry date/time is required')
    .custom((value, { req }) => {
      const expiry = new Date(value);
      const prepared = new Date(req.body.prepared_at);
      if (expiry <= prepared) {
        throw new Error('Expiry time must be strictly later than preparation time');
      }
      if (expiry <= new Date()) {
        throw new Error('Food cannot be already expired at time of listing');
      }
      return true;
    }),
  body('pickup_start_time')
    .isISO8601()
    .withMessage('A valid pickup start time is required'),
  body('pickup_end_time')
    .isISO8601()
    .withMessage('A valid pickup end time is required')
    .custom((value, { req }) => {
      const start = new Date(req.body.pickup_start_time);
      const end = new Date(value);
      if (end < start) {
        throw new Error('Pickup end time must be after pickup start time');
      }
      return true;
    }),
  body('pickup_address')
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required'),
  body('pickup_city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('safety_confirmed')
    .custom((value) => {
      if (value !== true && value !== 'true') {
        throw new Error('You must confirm that this food is safe for consumption and has been stored/handled appropriately.');
      }
      return true;
    })
];

const updateDonationValidator = [
  body('title').optional().trim().isLength({ min: 3 }),
  body('quantity').optional().isFloat({ min: 0.1 }),
  body('storage_instructions').optional().trim()
];

const claimDonationValidator = [
  body('destination').optional().trim(),
  body('notes').optional().trim()
];

module.exports = {
  createDonationValidator,
  updateDonationValidator,
  claimDonationValidator
};
