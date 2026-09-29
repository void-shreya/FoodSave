const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { updateDeliveryStatusValidator } = require('../validators/pickupValidators');

router.get('/', requireAuth, deliveryController.listDeliveries);
router.get('/:id', requireAuth, deliveryController.getDeliveryById);
router.put('/:id/status', requireAuth, updateDeliveryStatusValidator, validate, deliveryController.updateDeliveryStatus);

module.exports = router;
