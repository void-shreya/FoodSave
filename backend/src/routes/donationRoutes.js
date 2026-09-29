const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const pickupController = require('../controllers/pickupController');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createDonationValidator,
  updateDonationValidator,
  claimDonationValidator
} = require('../validators/donationValidators');

// Public/Discovery listing with filters
router.get('/', optionalAuth, donationController.listDonations);

// Create donation (donor/admin only)
router.post(
  '/',
  requireAuth,
  requireRole('donor', 'admin'),
  createDonationValidator,
  validate,
  donationController.createDonation
);

// Get authenticated donor's own donations
router.get(
  '/my',
  requireAuth,
  requireRole('donor', 'admin'),
  donationController.getMyDonations
);

// Claim donation / request pickup (volunteer/ngo/admin)
router.post(
  '/:id/request-pickup',
  requireAuth,
  requireRole('volunteer', 'ngo', 'admin'),
  claimDonationValidator,
  validate,
  pickupController.claimDonation
);

// Single donation details
router.get('/:id', optionalAuth, donationController.getDonationById);

// Update active donation (owner donor/admin)
router.put(
  '/:id',
  requireAuth,
  updateDonationValidator,
  validate,
  donationController.updateDonation
);

// Cancel donation (owner donor/admin)
router.post('/:id/cancel', requireAuth, donationController.cancelDonation);
router.delete('/:id', requireAuth, donationController.cancelDonation);

module.exports = router;
