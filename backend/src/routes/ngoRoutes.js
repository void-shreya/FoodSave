const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', ngoController.listNgos);

// Beneficiary management for NGOs
router.get('/beneficiaries', requireAuth, requireRole('ngo', 'admin'), ngoController.listBeneficiaries);
router.post('/beneficiaries', requireAuth, requireRole('ngo', 'admin'), ngoController.createBeneficiary);
router.delete('/beneficiaries/:id', requireAuth, requireRole('ngo', 'admin'), ngoController.deleteBeneficiary);

// NGO verification (admin only)
router.post('/:id/verify', requireAuth, requireRole('admin'), ngoController.verifyNgo);

// Public NGO details
router.get('/:id', ngoController.getNgoById);

module.exports = router;
