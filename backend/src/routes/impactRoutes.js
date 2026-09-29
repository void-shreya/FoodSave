const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');

router.get('/', impactController.getMetrics);

module.exports = router;
