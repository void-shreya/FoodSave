const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const donationRoutes = require('./donationRoutes');
const pickupRoutes = require('./pickupRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const ngoRoutes = require('./ngoRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');
const impactRoutes = require('./impactRoutes');
const aiRoutes = require('./aiRoutes');
const db = require('../models/db');

// Root API Health & Metadata
router.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FoodSave REST API',
    version: '1.0.0'
  });
});

// Categories list
router.get('/categories', async (req, res) => {
  const categories = await db.listCategories();
  res.status(200).json({ success: true, data: categories });
});

// User self profile routes
router.get('/users/me', (req, res, next) => {
  req.url = '/me';
  return authRoutes(req, res, next);
});
router.put('/users/me', (req, res, next) => {
  req.url = '/profile';
  return authRoutes(req, res, next);
});
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const profile = await db.getProfileByUserId(user.id);
    const org = await db.getOrganizationByOwnerId(user.id);
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        role: user.role,
        is_verified: user.is_verified,
        profile,
        organization: org
      }
    });
  } catch (err) {
    next(err);
  }
});

// Mounted Routes
router.use('/auth', authRoutes);
router.use('/donations', donationRoutes);
router.use('/pickups', pickupRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/ngos', ngoRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/impact', impactRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
