const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { updatePickupStatusValidator } = require('../validators/pickupValidators');

router.get('/', requireAuth, pickupController.listPickups);
router.get('/:id', requireAuth, pickupController.getPickupById);
router.put('/:id/status', requireAuth, updatePickupStatusValidator, validate, pickupController.updatePickupStatus);

module.exports = router;
